<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use App\Models\StudentEnrollment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class AcademicPeriodController extends Controller
{
    /**
     * List semua periode akademik.
     */
    public function index()
    {
        $periods = AcademicPeriod::orderByDesc('created_at')->get();

        return response()->json($periods);
    }

    /**
     * Buat periode baru (belum aktif).
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'semester'      => 'required|in:ganjil,genap',
            'academic_year' => 'required|string|max:20', // contoh: 2025/2026
        ]);

        // Cek apakah sudah ada periode dengan semester + tahun yang sama
        $exists = AcademicPeriod::where('semester', $request->semester)
            ->where('academic_year', $request->academic_year)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => "Periode {$request->semester} {$request->academic_year} sudah ada.",
            ], 422);
        }

        $period = AcademicPeriod::create([
            'name'          => $request->name,
            'semester'      => $request->semester,
            'academic_year' => $request->academic_year,
            'is_active'     => false, // belum aktif sampai di-activate
        ]);

        return response()->json([
            'message' => 'Periode berhasil dibuat.',
            'data'    => $period,
        ], 201);
    }

    /**
     * Aktifkan periode + eksekusi enrollment baru dari next_class_id.
     * Ini trigger utama pergantian semester.
     */
    public function activate(Request $request, $id)
    {
        $newPeriod = AcademicPeriod::findOrFail($id);

        if ($newPeriod->is_active) {
            return response()->json(['message' => 'Periode ini sudah aktif.'], 422);
        }

        $currentPeriod = AcademicPeriod::current();

        // Pastikan semua siswa aktif sudah punya next_class_id atau memang lulus (IX)
        if ($currentPeriod) {
            $belumDitentukan = StudentEnrollment::where('academic_period_id', $currentPeriod->id)
                ->where('is_active', true)
                ->whereNull('next_class_id')
                ->whereHas('user', fn($q) => $q->where('role', 'student'))
                ->whereHas('className', fn($q) => $q->whereNotLike('name', 'IX%')) // IX boleh null (lulus)
                ->count();

            if ($belumDitentukan > 0) {
                return response()->json([
                    'message'  => "Masih ada {$belumDitentukan} siswa yang belum ditentukan kelas berikutnya.",
                    'count'    => $belumDitentukan,
                ], 422);
            }
        }

        DB::transaction(function () use ($currentPeriod, $newPeriod) {
            // 1. Nonaktifkan periode lama
            if ($currentPeriod) {
                $currentPeriod->update([
                    'is_active' => false,
                    'closed_at' => now(),
                ]);

                // 2. Ambil semua enrollment aktif yang punya next_class_id
                $enrollments = StudentEnrollment::where('academic_period_id', $currentPeriod->id)
                    ->where('is_active', true)
                    ->whereNotNull('next_class_id')
                    ->get();

                foreach ($enrollments as $enrollment) {
                    // Nonaktifkan enrollment lama
                    $enrollment->update([
                        'is_active' => false,
                        'left_at'   => now(),
                    ]);

                    // Buat enrollment baru di periode baru
                    StudentEnrollment::create([
                        'user_id'            => $enrollment->user_id,
                        'class_name_id'      => $enrollment->next_class_id,
                        'academic_period_id' => $newPeriod->id,
                        'is_active'          => true,
                        'enrolled_at'        => now(),
                    ]);
                }

                // 3. Siswa IX (next_class_id null) → enrollment lama cukup dinonaktifkan
                StudentEnrollment::where('academic_period_id', $currentPeriod->id)
                    ->where('is_active', true)
                    ->whereNull('next_class_id')
                    ->update([
                        'is_active' => false,
                        'left_at'   => now(),
                    ]);
            }

            // 4. Aktifkan periode baru
            $newPeriod->update([
                'is_active'  => true,
                'opened_at'  => now(),
            ]);
            
            User::where('role', 'student')->update(['xp_points' => 0]);
            // ✅ Sync class_id dari enrollment
            Artisan::call('enrollment:sync-class-id');

        });

        return response()->json([
            'message' => "Periode {$newPeriod->name} berhasil diaktifkan. Enrollment siswa sudah diperbarui.",
            'data'    => $newPeriod->fresh(),
        ]);
    }

    /**
     * Detail satu periode (termasuk jumlah siswa terdaftar).
     */
    public function show($id)
    {
        $period = AcademicPeriod::withCount([
            'studentEnrollments as total_siswa' => fn($q) => $q->where('is_active', true),
        ])->findOrFail($id);

        return response()->json($period);
    }
}