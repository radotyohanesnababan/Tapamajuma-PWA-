<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
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
     * Support filter: class_id, academic_period_id
     */
    public function getStudentSummary(Request $request)
    {
        $classId  = $request->query('class_id');
        $periodId = $request->filled('academic_period_id')
            ? (int) $request->academic_period_id
            : AcademicPeriod::current()?->id;

        $period = $periodId ? AcademicPeriod::find($periodId) : null;

        $query = User::where('role', 'student')
            ->with('studentClass:id,name')
            // Hitung total hadir/aktif (is_active = 1) dalam periode semester
            ->withCount(['attendances as total_active' => function ($query) use ($period) {
                $query->where('is_active', 1);
                if ($period) {
                    $query->where('created_at', '>=', $period->opened_at);
                    if ($period->closed_at) {
                        $query->where('created_at', '<=', $period->closed_at);
                    }
                }
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
                                  'id'           => $student->id,
                                  'name'         => $student->name,
                                  'class_name'   => $student->studentClass ? $student->studentClass->name : '-',
                                  'total_active' => $student->total_active,
                              ];
                          });

        return response()->json(['data' => $students]);
    }
}