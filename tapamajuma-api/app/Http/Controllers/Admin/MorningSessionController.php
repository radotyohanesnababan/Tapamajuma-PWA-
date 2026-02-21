<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ClassName; 
use Illuminate\Http\Request;

class MorningSessionController extends Controller
{
    /**
     * Ambil daftar kelas untuk dropdown filter
     */
    public function getClasses()
    {
        $classes = ClassName::select('id', 'name')->orderBy('name')->get();
        return response()->json($classes);
    }

    /**
     * Ambil rekap siswa berdasarkan kelas dan urutkan berdasarkan keaktifan
     */
    public function getStudentSummary(Request $request)
    {
        $classId = $request->query('class_id');

        // Asumsi: Model User memiliki relasi 'ClassName' (ke tabel kelas) 
        // dan relasi 'attendances' (ke tabel kehadiran sesi pagi)
        $query = User::where('role', 'student')
            ->with('studentClass:id,name')
            // Hitung total hadir/aktif (is_active = 1)
            ->withCount(['attendances as total_active' => function ($query) {
                $query->where('is_active', 1);
            }]);

        // Filter berdasarkan kelas jika admin memilih dari dropdown
        if ($classId) {
            $query->where('class_id', $classId);
        }

        // Urutkan dari yang paling rajin (terbanyak)
        $students = $query->orderByDesc('total_active')
                          ->orderBy('name') // Urutan kedua berdasarkan abjad
                          ->get()
                          ->map(function ($student) {
                              return [
                                  'id' => $student->id,
                                  'name' => $student->name,
                                  'class_name' => $student->ClassName ? $student->ClassName->name : '-',
                                  'total_active' => $student->total_active,
                              ];
                          });

        return response()->json(['data' => $students]);
    }
}