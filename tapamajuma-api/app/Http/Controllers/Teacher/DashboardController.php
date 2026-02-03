<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\DailyActivity;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            // --- LANGKAH 1: AMBIL DATA ID DARI JSON GURU ---
            // Laravel otomatis mengubah JSON "[1, 2]" menjadi Array PHP [1, 2]
            // Asalkan di User.php ada casts => 'array'
            $allowedClassIds = $user->accessible_classes ?? []; 

            // Jaga-jaga kalau datanya kosong/null
            if (empty($allowedClassIds) && $user->role !== 'superadmin') {
                return response()->json([]); // Balikin kosong
            }

            // --- LANGKAH 2: QUERY "PENCOCOKAN" ---
            $query = DailyActivity::with(['user.studentClass']);

            // A. Filter Security (Hanya tampilkan kelas yg ID-nya dipegang Guru)
            if ($user->role !== 'superadmin') {
                // "Carikan aktivitas siswa, dimana ID Kelas siswa tersebut,
                // ADA DI DALAM daftar ID milik guru ($allowedClassIds)"
                $query->whereHas('user', function($q) use ($allowedClassIds) {
                    $q->whereIn('class_id', $allowedClassIds);
                });
            }

            // B. Filter Dropdown dari React (Inputnya Nama: "VII-A")
            $filterName = $request->input('class_id'); 
            
            if ($filterName && $filterName !== 'All' && $filterName !== 'all') {
                // Kita filter lewat relasi Nama Kelas
                $query->whereHas('user.studentClass', function($q) use ($filterName) {
                    $q->where('name', $filterName);
                });
            }

            $activities = $query->latest()->limit(50)->get();

            return response()->json($activities);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getTeacherStats(Request $request)
    {
        $user = $request->user();
        
        // 1. Ambil "Kunci Inggris" (Daftar ID Kelas Guru)
        $allowedClassIds = $user->accessible_classes ?? []; 

        $query = DailyActivity::query();

        // 2. Security Check (Mencocokkan ID)
        if ($user->role !== 'superadmin') {
             $query->whereHas('user', function($q) use ($allowedClassIds) {
                $q->whereIn('class_id', $allowedClassIds);
            });
        }

        // 3. Dropdown Filter (Inputnya Nama)
        $filterName = $request->query('class_id'); 
        if ($filterName && $filterName !== 'All' && $filterName !== 'all') {
            $query->whereHas('user.studentClass', function($q) use ($filterName) {
                $q->where('name', $filterName);
            });
        }

        $activities = $query->get();

        return response()->json([
            'total_students_active' => $activities->pluck('user_id')->unique()->count(),
            'average_score'         => round($activities->avg('score'), 1) ?: 0,
            'average_confidence'    => round($activities->avg('confidence_level'), 1) ?: 0,
            'total_submissions'     => $activities->count(),
        ]);
    }
}