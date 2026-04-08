<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentResource;
use Illuminate\Http\Request;
use App\Models\AllowedNis; // Import model AllowedNis

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // --- LOGIKA VALIDASI NIS UNTUK GEMBOK ---
        // 1. Cek apakah NIS ada di tabel Master (AllowedNis)
        // 2. Cek apakah NIS tersebut memang diklaim oleh user ini (used_by)
        $isNisValid = false;
        
        if ($user->nis) {
            $isNisValid = AllowedNis::where('nis', $user->nis)
                ->where('is_used', true)
                ->where('used_by', $user->id)
                ->exists();
        }

        $announcements = \App\Models\Announcement::where('is_active', true)
        ->latest()
        ->get(['content']); // Ambil kolom content saja

        return response()->json([
            'user' => new StudentResource($user),
            //'is_nis_valid' => $isNisValid, // Flag utama untuk React
            'is_nis_valid' => true,
            'needs_password' => !str_contains($user->email, '@tapamajuma.id'), // Flag tambahan untuk React
            'announcements' => $announcements, // Tambahkan pengumuman ke response
            'stats' => [
                'today_completed' => $user->dailyActivities()->whereDate('created_at', today())->count(),
                'weekly_progress' => $user->dailyActivities()->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            ]
        ]);
    }
}