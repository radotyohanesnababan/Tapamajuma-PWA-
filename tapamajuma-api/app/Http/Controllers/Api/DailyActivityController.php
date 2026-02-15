<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DailyActivityController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        // 1. VALIDASI DINAMIS (Tergantung Tipe)
        $rules = [
            'type' => 'required|in:literacy,numeracy,tka',
            'confidence_level' => 'required|numeric|min:1|max:5',
            'journal' => 'required|string',
        ];

        // Aturan Khusus Numerasi
        if ($request->type === 'numeracy') {
            $rules['subject'] = 'required|string';
            $rules['score'] = 'required|numeric';
        } 
        //Aturan Khusus TKA
        else if ($request->type === 'tka') {
            $rules['subject'] = 'required|string';
            $rules['score'] = 'required|numeric';
        }
        // Aturan Khusus Literasi
        else {
            $rules['reading_content'] = 'nullable|string';
            $rules['audio_file'] = 'nullable|file|mimes:mp3,wav,webm,m4a|max:5120'; // Max 5MB
            $rules['subject'] = 'nullable|string'; // Literasi bisa null subjectnya
            $rules['score'] = 'nullable|numeric';
        }

        try {
            $validated = $request->validate($rules);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Validasi Gagal', 'detail' => $e->errors()], 422);
        }

        // 2. PROSES SIMPAN
        try {
            // Handle Upload Audio (Khusus Literasi)
            $audioPath = null;
            if ($request->hasFile('audio_file')) {
                $audioPath = $request->file('audio_file')->store('activities/audio', 'public');
            }

            // Persiapkan Data
            $dataToSave = [
                'type' => $validated['type'],
                'confidence_level' => $validated['confidence_level'],
                'journal' => $validated['journal'],
                'subject' => $request->subject ?? 'Umum', // Default jika kosong
                'score' => $request->score ?? 100,          // Default 0 jika literasi
                'reading_content' => $request->reading_content ?? null,
                'audio_path' => $audioPath,
            ];

            // Simpan ke DB
            $activity = $user->dailyActivities()->create($dataToSave);

            // 3. UPDATE LEVEL (Gamification)
            try {
                // Contoh Logic: Level naik setiap kelipatan 100 XP
                $totalXp = $user->dailyActivities()->sum('score');
                // Tambahan XP untuk Literasi (karena literasi score-nya mungkin 0/manual, kita kasih bonus fixed)
                $literacyBonus = $user->dailyActivities()->where('type', 'literacy')->count() * 10; 
                
                $finalXp = $totalXp + $literacyBonus;
                $newLevel = floor($finalXp / 100) + 1;

                if ($user->level != $newLevel) {
                    $user->level = $newLevel;
                    $user->save();
                }
            } catch (\Exception $e) {
                Log::error("Gagal update level user {$user->id}: " . $e->getMessage());
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Aktivitas berhasil disimpan!',
                'data' => $activity,
                'new_level' => $user->level
            ], 201);

        } catch (\Exception $e) {
            Log::error("Database Error: " . $e->getMessage());
            return response()->json(['error' => 'Terjadi kesalahan sistem', 'msg' => $e->getMessage()], 500);
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