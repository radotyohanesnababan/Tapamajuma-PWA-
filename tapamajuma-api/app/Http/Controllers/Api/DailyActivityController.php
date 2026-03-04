<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Jobs\SimpanAktivitasSiswa;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class DailyActivityController extends Controller
{
    /**
     * Cek apakah user sudah mengerjakan tugas hari ini
     */
    public function checkStatus(Request $request)
    {
        $user = $request->user();

        // Cek apakah ada record di tabel daily_activities milik user ini untuk hari ini
        $alreadySubmitted = $user->dailyActivities()
            ->whereDate('created_at', Carbon::today())
            ->exists();

        return response()->json([
            'already_submitted' => $alreadySubmitted,
            'server_date' => Carbon::today()->toDateString()
        ]);
    }
    public function store(Request $request)
    {
        $user = $request->user();
        $alreadySubmitted = $user->dailyActivities()
            ->whereDate('created_at', Carbon::today())
            ->exists();
        if ($alreadySubmitted) {
            return response()->json(['error' => 'Anda sudah mengerjakan tugas hari ini'], 400);
        }
        
        // 1. VALIDASI DINAMIS
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

        // 2. PROSES UPLOAD & SIAPKAN BINGKISAN UNTUK ANTREAN
        try {
            $audioPath = null;
            if ($request->hasFile('audio_file')) {
                $audioPath = $request->file('audio_file')->store('activities/audio', 'public');
            }

            $dataToSave = [
                'user_id' => $user->id, // <-- INI WAJIB ADA!
                'type' => $validated['type'],
                'confidence_level' => $validated['confidence_level'],
                'journal' => $validated['journal'],
                'subject' => $request->subject ?? 'Umum',
                'score' => $request->score ?? 100,          
                'reading_content' => $request->reading_content ?? null,
                'audio_path' => $audioPath,
            ];

            // 3. LEMPAR KE KOKI (Background Job)
            SimpanAktivitasSiswa::dispatch($dataToSave);

            // 4. LANGSUNG BALAS KE REACT (Tanpa variabel gaib)
            return response()->json([
                'status' => 'success',
                'message' => 'Latihan selesai! Aktivitas dan XP sedang diproses.',
                // Catatan: Karena level diproses di background, React bisa mengambil 
                // data level terbaru nanti saat memuat halaman Home/Dashboard.
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