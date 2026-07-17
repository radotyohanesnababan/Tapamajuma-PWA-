<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ClassName;
use App\Models\SelfStudySession;
use App\Models\SessionAttendance;
use App\Services\XpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MandiriSessionController extends Controller
{
    public function getMyClasses(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'superadmin') {
            return response()->json(ClassName::select('id', 'name')->orderBy('name')->get());
        }

        $classIds = $user->accessible_classes ?? [];

        if (empty($classIds)) {
            return response()->json([]);
        }

        return response()->json(
            ClassName::whereIn('id', $classIds)
                ->select('id', 'name')
                ->orderBy('name')
                ->get()
        );
    }

    public function getStudents(Request $request)
    {
        $classId = $request->query('class_id');
        $user = $request->user();

        if (!$classId) {
            return response()->json(['error' => 'Parameter class_id wajib diisi'], 400);
        }

        if ($user->role !== 'superadmin') {
            $myClasses = $user->accessible_classes ?? [];
            if (!in_array((int)$classId, $myClasses) && !in_array((string)$classId, $myClasses)) {
                return response()->json(['error' => 'Akses Ditolak: Kelas tidak ditemukan di profil Anda.'], 403);
            }
        }

        $students = User::where('role', 'student')
            ->where('class_id', $classId)
            ->select('id', 'name', 'nis', 'class_id')
            ->orderBy('name', 'asc')
            ->get();

        $students->load('studentClass:id,name');

        $students->transform(function ($student) {
            return [
                'id'         => $student->id,
                'name'       => $student->name,
                'nis'        => $student->nis,
                'class_name' => $student->studentClass->name ?? '-',
                'active'     => false,
                'nilai'      => 0, // ✅ Tambahan
            ];
        });

        return response()->json($students);
    }

    public function store(Request $request)
    {
        $request->validate([
            'class_id'          => 'required|exists:class_names,id',
            'students'          => 'required|array',
            'students.*.id'     => 'required|exists:users,id',
            'students.*.active' => 'required|boolean',
            'students.*.nilai'  => 'nullable|integer|min:0|max:100', // ✅ Tambahan
        ]);

        $user = $request->user();

        if ($user->role !== 'superadmin') {
            $myClasses = $user->accessible_classes ?? [];
            if (!in_array($request->class_id, $myClasses)) {
                return response()->json(['error' => 'Akses Ditolak.'], 403);
            }
        }

        DB::beginTransaction();
        try {
            $kelasDb         = ClassName::find($request->class_id);
            $namaKelasString = $kelasDb->name;

            $totalPresent = collect($request->students)->where('active', true)->count();

            $session = SelfStudySession::create([
                'teacher_id'    => $user->id,
                'class_name'    => $namaKelasString,
                'started_at'    => now(),
                'total_present' => $totalPresent,
            ]);

            $attendanceData = [];
            foreach ($request->students as $studentData) {
                if ($studentData['active'] === true) {
                    $nilai = $studentData['nilai'] ?? 0; // ✅ Default 0

                    $attendanceData[] = [
                        'session_id' => $session->id,
                        'student_id' => $studentData['id'],
                        'is_active'  => true,
                        'nilai'      => $nilai, // ✅ Simpan nilai
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            if (!empty($attendanceData)) {
                SessionAttendance::insert($attendanceData);
            }

            foreach ($request->students as $studentData) {
                if ($studentData['active'] === true) {
                    $nilai = $studentData['nilai'] ?? 0;

                    if ($nilai > 0) { // ✅ Hanya award XP kalau nilai > 0
                        XpService::award(
                            userId:   $studentData['id'],
                            xp:       $nilai, // ✅ XP = nilai
                            source:   'attendance',
                            sourceId: $session->id,
                        );
                    }
                }
            }

            DB::commit();
            return response()->json(['message' => 'Presensi berhasil disimpan!'], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}
