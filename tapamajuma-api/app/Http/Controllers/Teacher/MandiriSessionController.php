<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SelfStudySession;
use App\Models\SessionAttendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MandiriSessionController extends Controller
{
    /**
     * 1. GET LIST KELAS (Untuk Dropdown di React)
     * Endpoint: GET /api/teacher/my-classes
     */
    public function getMyClasses(Request $request)
    {
        $user = $request->user();

        // LOGIKA SUPERADMIN:
        // Ambil semua kelas unik yang ada di data siswa
        if ($user->role === 'superadmin') {
            $allClasses = User::where('role', 'student')
                              ->whereNotNull('class_id')
                              ->distinct()
                              ->pluck('class_id') // Ambil kolom class_id saja
                              ->sort()
                              ->values(); // Reset index array
            
            return response()->json($allClasses);
        }

        // LOGIKA GURU:
        // Kembalikan apa yang ada di kolom JSON accessible_classes
        // Jika null, kembalikan array kosong []
        return response()->json($user->accessible_classes ?? []);
    }

    /**
     * 2. GET SISWA PER KELAS (Untuk Checklist)
     * Endpoint: GET /api/students?class=7A
     */
    public function getStudents(Request $request)
    {
        $classGroup = $request->query('class');
        $user = $request->user();

        // Validasi Input
        if (!$classGroup) {
            return response()->json(['error' => 'Parameter kelas wajib diisi'], 400);
        }

        // SECURITY CHECK: Apakah user boleh lihat kelas ini?
        if (!$user->canAccessClass($classGroup)) {
            return response()->json(['error' => 'Akses Ditolak: Anda tidak mengampu kelas ini.'], 403);
        }

        // Ambil data siswa
        $students = User::where('role', 'student')
                        ->where('class_id', $classGroup)
                        ->select('id', 'name', 'class_id as class')
                        ->orderBy('name', 'asc')
                        ->get();

        // Transformasi Data untuk React
        // Tambahkan properti 'active' = false untuk default checkbox
        $students->transform(function ($student) {
            $student->active = false; 
            return $student;
        });

        return response()->json($students);
    }

    /**
     * 3. SIMPAN PRESENSI (Store)
     * Endpoint: POST /api/self-study/store
     */
    public function store(Request $request)
    {
        // Validasi Payload dari React
        $request->validate([
            'class_id' => 'required|string',
            'students' => 'required|array', // Array list siswa
            'students.*.id' => 'required|exists:users,id',
            'students.*.active' => 'required|boolean',
        ]);

        $user = $request->user();

        // SECURITY CHECK LAGI: Mencegah guru 'menembak' API kelas lain
        if (!$user->canAccessClass($request->class_id)) {
            return response()->json(['error' => 'Akses Ditolak.'], 403);
        }

        // Gunakan Transaksi Database (Agar data konsisten)
        DB::beginTransaction();

        try {
            // A. Hitung total hadir (filter array yang active == true)
            $totalPresent = collect($request->students)->where('active', true)->count();

            // B. Buat Header Sesi (Tabel self_study_sessions)
            $session = SelfStudySession::create([
                'teacher_id' => $user->id,
                'class_id' => $request->class_id,
                'started_at' => now(),
                'total_present' => $totalPresent,
                // 'topic' => 'Sesi Mandiri', // Bisa ditambah inputan topik nanti
            ]);

            // C. Siapkan Data Detail (Tabel session_attendances)
            // Kita hanya simpan siswa yang HADIR/ACTIVE saja untuk hemat database.
            // (Kecuali Anda ingin mencatat yang bolos juga, hapus if-nya)
            $attendanceData = [];
            foreach ($request->students as $studentData) {
                if ($studentData['active'] === true) {
                    $attendanceData[] = [
                        'session_id' => $session->id,
                        'student_id' => $studentData['id'],
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            // D. Bulk Insert (Sekali query untuk banyak siswa)
            if (!empty($attendanceData)) {
                SessionAttendance::insert($attendanceData);
            }

            // Jika semua lancar, Commit (Simpan Permanen)
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Presensi berhasil disimpan!',
                'data' => [
                    'session_id' => $session->id,
                    'total_present' => $totalPresent
                ]
            ], 201);

        } catch (\Exception $e) {
            // Jika ada error, batalkan semua perubahan DB
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyimpan data: ' . $e->getMessage()
            ], 500);
        }
    }
}