<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Jobs\SimpanAktivitasSiswa;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use App\Models\DailyActivity;

class DailyActivityController extends Controller
{
    /**
     * Cek apakah user sudah mengerjakan tugas hari ini
     */
public function checkStatus(Request $request)
{
    $user = $request->user();
    $today = Carbon::now('Asia/Jakarta')->toDateString();
    $cacheKey = "submitted_{$user->id}_{$today}";
    $limit = 3;

    $cachedCount = Cache::get($cacheKey);

    if ($cachedCount === null) {
        $start = Carbon::now('Asia/Jakarta')->startOfDay()->utc();
        $end   = Carbon::now('Asia/Jakarta')->endOfDay()->utc();

        $cachedCount = $user->dailyActivities()
            ->whereBetween('created_at', [$start, $end])
            ->count();

        Cache::add($cacheKey, $cachedCount, now('Asia/Jakarta')->endOfDay());
    }

    return response()->json([
        'already_submitted' => $cachedCount >= $limit,
        'submitted_today'   => $cachedCount,
        'limit'             => $limit,
        'remaining'         => max(0, $limit - $cachedCount),
        'server_date'       => $today,
    ]);
}
public function store(Request $request)
{
    $user = $request->user();
    $today = Carbon::now('Asia/Jakarta')->toDateString();
    $cacheKey = "submitted_{$user->id}_{$today}";
    $limit = 3;

    // Cek limit dari cache dulu
    $cachedCount = Cache::get($cacheKey);

    if ($cachedCount === null) {
        $start = Carbon::now('Asia/Jakarta')->startOfDay()->utc();
        $end   = Carbon::now('Asia/Jakarta')->endOfDay()->utc();

        $cachedCount = $user->dailyActivities()
            ->whereBetween('created_at', [$start, $end])
            ->count();

        Cache::add($cacheKey, $cachedCount, now('Asia/Jakarta')->endOfDay());
    }

    if ($cachedCount >= $limit) {
        return response()->json(['error' => 'Anda sudah mencapai batas 3 kegiatan hari ini'], 400);
    }

    // Validasi dinamis
    $rules = [
        'type' => 'required|in:literacy,numeracy,tka',
        'confidence_level' => 'required|numeric|min:1|max:5',
        'journal' => 'required|string',
    ];

    if ($request->type === 'numeracy' || $request->type === 'tka') {
        $rules['subject'] = 'required|string';
        $rules['score'] = 'required|numeric';
    } else {
        $rules['reading_content'] = 'nullable|string';
        $rules['audio_file'] = 'nullable|file|mimes:mp3,wav,webm,m4a|max:5120';
        $rules['subject'] = 'nullable|string';
        $rules['score'] = 'nullable|numeric';
    }

    try {
        $validated = $request->validate($rules);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json(['error' => 'Validasi Gagal', 'detail' => $e->errors()], 422);
    }

    try {
        $audioPath = null;
        if ($request->hasFile('audio_file')) {
            $audioPath = $request->file('audio_file')->store('activities/audio', 'public');
        }

        $dataToSave = [
            'user_id'         => $user->id,
            'type'            => $validated['type'],
            'confidence_level'=> $validated['confidence_level'],
            'journal'         => $validated['journal'],
            'subject'         => $request->subject ?? 'Umum',
            'score'           => $request->score ?? 100,
            'reading_content' => $request->reading_content ?? null,
            'audio_path'      => $audioPath,
        ];

        SimpanAktivitasSiswa::dispatch($dataToSave);

        // Increment cache di sini, bukan di dalam job
        Cache::add($cacheKey, 0, now('Asia/Jakarta')->endOfDay());
        Cache::increment($cacheKey);

        return response()->json([
            'status'  => 'success',
            'message' => 'Latihan selesai! Aktivitas dan XP sedang diproses.',
        ], 201);

    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error("Controller Error: " . $e->getMessage());
        return response()->json(['error' => 'Terjadi kesalahan sistem'], 500);
    }
}

    // Ambil Riwayat (Untuk Grafik)
public function index(Request $request)
    {
        $activities = $request->user()->dailyActivities()
            ->latest()
            ->take(7) 
            ->get();

        return response()->json($activities);
    }
}