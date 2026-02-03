<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ClassName;
use App\Models\SelfStudySession;
use App\Models\SessionAttendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MandiriSessionController extends Controller
{
    /**
     * 1. GET LIST KELAS (Tanpa Pivot)
     * Mengubah JSON ID [1, 2] menjadi Object [{id:1, name:'VII-A'}, ...]
     */
    public function getMyClasses(Request $request)
    {
        $user = $request->user();

        // SUPERADMIN: Ambil Semua Kelas
        if ($user->role === 'superadmin') {
            return response()->json(ClassName::select('id', 'name')->orderBy('name')->get());
        }

        // GURU: Ambil ID dari kolom JSON 'accessible_classes'
        $classIds = $user->accessible_classes ?? [];

        // Jika kosong, return kosong
        if (empty($classIds)) {
            return response()->json([]);
        }

        // Cari Nama Kelas berdasarkan ID-ID tersebut
        $classes = ClassName::whereIn('id', $classIds)
                            ->select('id', 'name')
                            ->orderBy('name')
                            ->get();

        return response()->json($classes);
    }

    /**
     * 2. GET SISWA PER KELAS
     * Parameter: ?class_id=1
     */
    public function getStudents(Request $request)
    {
        $classId = $request->query('class_id'); 
        $user = $request->user();

        if (!$classId) {
            return response()->json(['error' => 'Parameter class_id wajib diisi'], 400);
        }

        // SECURITY CHECK (Tanpa Pivot):
        // Cek apakah class_id yang diminta ada di dalam array JSON guru
        if ($user->role !== 'superadmin') {
            $myClasses = $user->accessible_classes ?? [];
            
            // Pastikan perbandingan tipe datanya aman (string vs int)
            if (!in_array((int)$classId, $myClasses) && !in_array((string)$classId, $myClasses)) {
                return response()->json(['error' => 'Akses Ditolak: Kelas tidak ditemukan di profil Anda.'], 403);
            }
        }

        // Ambil data siswa
        $students = User::where('role', 'student')
                        ->where('class_id', $classId) // Where ID
                        ->select('id', 'name', 'nis', 'class_id')
                        ->orderBy('name', 'asc')
                        ->get();

        // Transformasi Data untuk React
        // Kita perlu nama kelas untuk tampilan
        $students->load('studentClass:id,name');

        $students->transform(function ($student) {
            return [
                'id' => $student->id,
                'name' => $student->name,
                'nis' => $student->nis,
                'class_name' => $student->studentClass->name ?? '-', 
                'active' => false // Default checkbox mati
            ];
        });

        return response()->json($students);
    }

    /**
     * 3. SIMPAN PRESENSI
     */
    public function store(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:class_names,id', // Validasi ID
            'students' => 'required|array',
            'students.*.id' => 'required|exists:users,id',
            'students.*.active' => 'required|boolean',
        ]);

        $user = $request->user();

        // SECURITY CHECK (Tanpa Pivot)
        if ($user->role !== 'superadmin') {
            $myClasses = $user->accessible_classes ?? [];
            if (!in_array($request->class_id, $myClasses)) {
                return response()->json(['error' => 'Akses Ditolak.'], 403);
            }
        }

        DB::beginTransaction();
        try {
            // Karena tabel maunya 'class_name' (String), tapi React kirim ID (Int)
        $kelasDb = ClassName::find($request->class_id);
        $namaKelasString = $kelasDb->name; // Contoh: "VII-A"
            // Hitung total hadir
            $totalPresent = collect($request->students)->where('active', true)->count();

            // 1. Buat Sesi Header
            $session = SelfStudySession::create([
                'teacher_id' => $user->id,
                'class_name'   => $namaKelasString, // Simpan nama kelas (String)
                'started_at' => now(),
                'total_present' => $totalPresent,
            ]);

            // 2. Buat Detail Kehadiran
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

            if (!empty($attendanceData)) {
                SessionAttendance::insert($attendanceData);
            }

            DB::commit();
            return response()->json(['message' => 'Presensi berhasil disimpan!'], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}