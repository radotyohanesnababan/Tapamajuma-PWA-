<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DailyActivityController extends Controller
{
    // Simpan Aksi Harian
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:berhitung,membaca,bercerita',
            'score' => 'required|integer',
            'confidence_level' => 'required|integer|min:1|max:5',
            'audio_file' => 'nullable|file|mimes:mp3,wav,webm|max:2048',
            'journal' => 'nullable|string',
        ]);

        $user = $request->user();

        // Handle upload audio jika ada (untuk aksi bercerita)
        $audioPath = null;
        if ($request->hasFile('audio_file')) {
            $audioPath = $request->file('audio_file')->store('activities/audio', 'public');
        }

        $activity = $user->dailyActivities()->create([
            'type' => $validated['type'],
            'score' => $validated['score'],
            'confidence_level' => $validated['confidence_level'],
            'audio_path' => $audioPath,
            'journal' => $validated['journal'] ?? null,
        ]);

        // Cek apakah siswa naik level setelah aktivitas ini
        $user->updateLevel();

        return response()->json([
            'message' => 'Aktivitas berhasil dicatat!',
            'data' => $activity,
            'current_level' => $user->level
        ]);
    }

    // Ambil Riwayat Aktivitas untuk Grafik di React
    public function index(Request $request)
    {
        $activities = $request->user()->dailyActivities()
            ->latest()
            ->take(7) // Ambil 7 aksi terakhir untuk grafik mingguan
            ->get();

        return response()->json($activities);
    }
}
