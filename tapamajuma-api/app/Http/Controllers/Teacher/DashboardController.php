<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\DailyActivity;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Mengambil daftar aktivitas terbaru (Feed)
     * Hanya dari kelas yang diampu oleh guru tersebut.
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $query = DailyActivity::with(['user.studentClass']); // Load relasi user & nama kelasnya

            // 1. FILTER HAK AKSES
            if ($user->role !== 'superadmin') {
                // Guru hanya melihat aktivitas dari siswa yang ada di accessible_classes (Array ID)
                $accessibleClassIds = $user->accessible_classes ?? [];
                
                $query->whereHas('user', function($q) use ($accessibleClassIds) {
                    $q->whereIn('class_id', $accessibleClassIds);
                });
            }

            // 2. FILTER SPESIFIK JIKA ADA PARAMETER
            if ($request->has('class_id') && $request->class_id != 'all') {
                $query->whereHas('user', function($q) use ($request) {
                    $q->where('class_id', $request->class_id);
                });
            }

            $activities = $query->latest()->limit(50)->get(); // Limit biar ringan

            return response()->json($activities);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Mengambil Statistik (Rata-rata skor, total submit, dll)
     */
    public function getTeacherStats(Request $request)
    {
        $user = $request->user();
        $targetClassId = $request->query('class_id'); // Terima ID, bukan String Name
        
        $query = DailyActivity::query();

        // A. FILTER BERDASARKAN KELAS
        if ($targetClassId && $targetClassId != 'all') {
            // Cek Security: Apakah guru boleh akses kelas ini?
            if (!$user->canAccessClass($targetClassId)) {
                return response()->json(['error' => 'Unauthorized access to this class'], 403);
            }

            // Query spesifik kelas
            $query->whereHas('user', function($q) use ($targetClassId) {
                $q->where('class_id', $targetClassId);
            });
        } else {
            // B. JIKA TIDAK PILIH KELAS (GLOBAL STATS)
            // Ambil statistik dari SEMUA kelas yang diampu guru ini
            if ($user->role !== 'superadmin') {
                $accessibleClassIds = $user->accessible_classes ?? [];
                $query->whereHas('user', function($q) use ($accessibleClassIds) {
                    $q->whereIn('class_id', $accessibleClassIds);
                });
            }
        }

        $activities = $query->get();

        // Hitung Statistik
        return response()->json([
            'total_students_active' => $activities->pluck('user_id')->unique()->count(),
            'average_score'         => round($activities->avg('score'), 1) ?: 0,
            'average_confidence'    => round($activities->avg('confidence_level'), 1) ?: 0,
            'total_submissions'     => $activities->count(),
            // Bonus: Kirim info kelas mana yang sedang dilihat
            'filter_class_id'       => $targetClassId ?? 'all' 
        ]);
    }
}