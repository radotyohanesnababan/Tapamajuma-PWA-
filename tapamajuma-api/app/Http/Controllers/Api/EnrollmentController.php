<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use App\Models\ClassName;
use App\Models\StudentEnrollment;
use App\Models\User;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    /**
     * List semua siswa aktif + kelas sekarang + next_class_id (promotion preview).
     * Dipakai admin untuk lihat status kenaikan kelas sebelum semester baru dibuka.
     */
    public function promotionPreview()
    {
        $currentPeriod = AcademicPeriod::current();

        if (!$currentPeriod) {
            return response()->json(['message' => 'Tidak ada periode aktif.'], 422);
        }

        $enrollments = StudentEnrollment::where('academic_period_id', $currentPeriod->id)
            ->where('is_active', true)
            ->whereHas('user', fn($q) => $q->where('role', 'student'))
            ->with([
                'user:id,name,nis',
                'className:id,name',
                'nextClass:id,name',
            ])
            ->get()
            ->map(fn($e) => [
                'enrollment_id'   => $e->id,
                'user_id'         => $e->user_id,
                'name'            => $e->user->name,
                'nis'             => $e->user->nis,
                'current_class'   => $e->className->name,
                'next_class_id'   => $e->next_class_id,
                'next_class_name' => $e->nextClass?->name ?? ($this->isGradeIX($e->className->name) ? 'Lulus' : 'Belum ditentukan'),
            ]);

        $totalBelumDitentukan = $enrollments->filter(
            fn($e) => $e['next_class_name'] === 'Belum ditentukan'
        )->count();

        return response()->json([
            'period'                  => $currentPeriod->name,
            'total_siswa'             => $enrollments->count(),
            'total_belum_ditentukan'  => $totalBelumDitentukan,
            'ready_to_promote'        => $totalBelumDitentukan === 0,
            'data'                    => $enrollments,
        ]);
    }

    /**
     * Bulk isi next_class_id otomatis berdasarkan mapping tingkat:
     * VII → VIII (nama huruf sama), VIII → IX (nama huruf sama), IX → null (lulus)
     */
    public function promoteAll()
    {
        $currentPeriod = AcademicPeriod::current();

        if (!$currentPeriod) {
            return response()->json(['message' => 'Tidak ada periode aktif.'], 422);
        }

        // Ambil semua class_names untuk mapping
        $allClasses = ClassName::all()->keyBy('name'); // ['VII-A' => ClassName, ...]

        $enrollments = StudentEnrollment::where('academic_period_id', $currentPeriod->id)
            ->where('is_active', true)
            ->whereHas('user', fn($q) => $q->where('role', 'student'))
            ->with('className:id,name')
            ->get();

        $updated = 0;
        $lulus   = 0;
        $gagal   = []; // kelas tujuan tidak ditemukan di class_names

        foreach ($enrollments as $enrollment) {
            $currentName = $enrollment->className->name; // contoh: VII-A

            // Siswa IX → lulus, next_class_id = null
            if ($this->isGradeIX($currentName)) {
                $enrollment->update(['next_class_id' => null]);
                $lulus++;
                continue;
            }

            // Mapping nama kelas: VII-A → VIII-A, VIII-B → IX-B
            $nextName = $this->getNextClassName($currentName);

            if (!$nextName || !isset($allClasses[$nextName])) {
                $gagal[] = $currentName . ' → ' . ($nextName ?? '?') . ' (tidak ditemukan)';
                continue;
            }

            $enrollment->update(['next_class_id' => $allClasses[$nextName]->id]);
            $updated++;
        }

        return response()->json([
            'message'  => "Promote all selesai.",
            'updated'  => $updated,
            'lulus'    => $lulus,
            'gagal'    => $gagal, // kosong kalau semua kelas tujuan ada di class_names
        ]);
    }

    /**
     * Override next_class_id untuk satu siswa tertentu.
     * next_class_id = null → tandai sebagai lulus.
     */
    public function setNextClass(Request $request, $enrollmentId)
    {
        $request->validate([
            'next_class_id' => 'nullable|exists:class_names,id',
        ]);

        $enrollment = StudentEnrollment::findOrFail($enrollmentId);

        $enrollment->update([
            'next_class_id' => $request->next_class_id, // null = lulus
        ]);

        $nextClass = $enrollment->nextClass?->name ?? 'Lulus';

        return response()->json([
            'message'       => "Kelas berikutnya untuk {$enrollment->user->name} diset ke: {$nextClass}.",
            'enrollment_id' => $enrollment->id,
            'next_class_id' => $enrollment->next_class_id,
            'next_class'    => $nextClass,
        ]);
    }

    /**
     * Daftarkan siswa baru ke periode aktif (saat register atau admin tambah manual).
     */
    public function enroll(Request $request)
    {
        $request->validate([
            'user_id'      => 'required|exists:users,id',
            'class_name_id' => 'required|exists:class_names,id',
        ]);

        $currentPeriod = AcademicPeriod::current();

        if (!$currentPeriod) {
            return response()->json(['message' => 'Tidak ada periode aktif.'], 422);
        }

        // Cek sudah terdaftar di periode ini atau belum
        $exists = StudentEnrollment::where('user_id', $request->user_id)
            ->where('academic_period_id', $currentPeriod->id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Siswa sudah terdaftar di periode ini.'], 422);
        }

        $enrollment = StudentEnrollment::create([
            'user_id'            => $request->user_id,
            'class_name_id'      => $request->class_name_id,
            'academic_period_id' => $currentPeriod->id,
            'is_active'          => true,
            'enrolled_at'        => now(),
        ]);

        return response()->json([
            'message' => 'Siswa berhasil didaftarkan.',
            'data'    => $enrollment->load(['user:id,name,nis', 'className:id,name']),
        ], 201);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function isGradeIX(string $className): bool
    {
        return str_starts_with(trim($className), 'IX');
    }

    private function getNextClassName(string $currentName): ?string
    {
        // Format: VII-A, VIII-B, IX-C
        $parts = explode('-', trim($currentName), 2);
        if (count($parts) !== 2) return null;

        [$grade, $suffix] = $parts;

        $nextGrade = match ($grade) {
            'VII'  => 'VIII',
            'VIII' => 'IX',
            default => null,
        };

        if (!$nextGrade) return null;

        return "{$nextGrade}-{$suffix}"; // contoh: VIII-A, IX-B
    }
}