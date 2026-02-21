<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\SessionAttendance;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PrintSessionController extends Controller
{
   public function getMorningSession(Request $request)
{
    $classId = $request->query('class_id');
    $start = Carbon::parse($request->query('start_date'))->startOfDay();
    $end = Carbon::parse($request->query('end_date'))->endOfDay();

    $attendances = SessionAttendance::with('student:id,name')
        ->whereHas('student', fn($q) => $q->where('class_id', $classId))
        ->where('is_active', 1) // Hanya hitung saat aktif
        ->whereBetween('created_at', [$start, $end])
        ->get()
        ->groupBy('student_id') // Kelompokkan per siswa
        ->map(function ($group) {
            return [
                'student_name' => $group->first()->student->name,
                'total_active' => $group->count(),
                // Ambil daftar tanggal unik untuk detail di web
                'active_dates' => $group->map(fn($item) => $item->created_at->format('d/m/Y'))->values()
            ];
        })
        ->values();

    return response()->json($attendances);
}

    // Di dalam PrintSessionController.php atau controller pilihanmu

public function getAccessibleClasses(Request $request)
{
    $user = $request->user();
    
    // Ambil array ID kelas dari atribut accessible_classes (misal: [1, 2, 3])
    // Gunakan fallback array kosong [] jika null agar tidak error
    $classIds = $user->accessible_classes ?? [];

    // Jika dia superadmin, mungkin kamu mau beri akses ke SEMUA kelas
    if ($user->role === 'superadmin') {
        // Asumsi model kelas kamu bernama StudentClass (sesuaikan jika namanya ClassName)
        $classes = \App\Models\ClassName::select('id', 'name')->get();
        return response()->json($classes);
    }

    // Untuk guru biasa, filter pakai whereIn
    $classes = \App\Models\ClassName::whereIn('id', $classIds)
                ->select('id', 'name')
                ->get();

    return response()->json($classes);
}
}