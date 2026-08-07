<?php

namespace App\Http\Controllers\Api;

use App\Helpers\DateHelper;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Jobs\SimpanAktivitasSiswa;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use App\Models\DailyActivity;
use Illuminate\Support\Facades\DB;

class DailyActivityController extends Controller
{
    /**
     * Cek apakah user sudah mengerjakan tugas hari ini
     */
public function checkStatus(Request $request)
{
    $user = $request->user();
    $limit = 3;

    [$start, $end] = DateHelper::todayRangeWIB();

    $count = $user->dailyActivities()
        ->whereBetween('created_at', [$start, $end])
        ->count();

    return response()->json([
        'already_submitted' => $count >= $limit,
        'submitted_today'   => $count,
        'limit'             => $limit,
        'remaining'         => max(0, $limit - $count),
        'server_date'       => now('Asia/Jakarta')->toDateString(),
    ]);
}
public function store(Request $request)
{
    $user = $request->user();
    $limit = 3;

    [$start, $end] = DateHelper::todayRangeWIB();

    return DB::transaction(function () use ($request, $user, $limit, $start, $end) {

        // 🔒 Anti race condition
        $count = $user->dailyActivities()
            ->whereBetween('created_at', [$start, $end])
            ->lockForUpdate()
            ->count();

        if ($count >= $limit) {
            return response()->json([
                'error' => 'Anda sudah mencapai batas 3 kegiatan hari ini'
            ], 400);
        }

        // 🔍 Validasi
        $rules = [
            'type' => 'required|in:literacy,numeracy,tka',
            'confidence_level' => 'required|numeric|min:1|max:5',
            'journal' => 'required|string',
        ];

        if (in_array($request->type, ['numeracy', 'tka'])) {
            $rules['subject'] = 'required|string';
            $rules['score'] = 'required|numeric';
        } else {
            $rules['reading_content'] = 'nullable|string';
            $rules['audio_file'] = 'nullable|file|mimes:mp3,wav,webm,m4a|max:5120';
        }

        $validated = $request->validate($rules);

        // 🎧 Upload
        $audioPath = null;
        if ($request->hasFile('audio_file')) {
            $audioPath = $request->file('audio_file')
                ->store('activities/audio', 'public');
        }

        // 🎯 Data siap kirim ke service
        $dataToSave = [
            'user_id'          => $user->id,
            'type'             => $validated['type'],
            'confidence_level' => $validated['confidence_level'],
            'journal'          => $validated['journal'],
            'subject'          => $request->subject ?? 'Umum',
            'score'            => $request->score ?? 100,
            'reading_content'  => $request->reading_content ?? null,
            'audio_path'       => $audioPath,
        ];

       
        SimpanAktivitasSiswa::handle($dataToSave);

        return response()->json([
            'status'  => 'success',
            'message' => 'Latihan selesai!',
        ], 201);
    });
}

    // Ambil Riwayat (Untuk Grafik)
public function index(Request $request)
{
    $user = $request->user();

    // 🔢 total semua aktivitas
    $total = $user->dailyActivities()->count();

    // 📋 ambil 7 terakhir
    $activities = $user->dailyActivities()
        ->latest()
        ->take(7)
        ->get();

    return response()->json([
        'data' => $activities,
        'total' => $total
    ]);
}
}