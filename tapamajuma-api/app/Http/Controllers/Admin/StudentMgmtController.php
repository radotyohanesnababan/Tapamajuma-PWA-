<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ClassName;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class StudentMgmtController extends Controller
{
    /**
     * GET /api/admin/students
     * Mengambil daftar siswa + data master kelas untuk dropdown
     */
    public function index()
    {
        // 1. Ambil siswa dengan relasi kelasnya
        // Pastikan di Model User sudah ada method studentClass()
        $students = User::where('role', 'student')
                        ->with('studentClass') // Eager load relasi biar ringan
                        ->orderBy('name', 'asc')
                        ->get();

        // 2. Ambil daftar kelas untuk dropdown pilihan di form
        $classes = ClassName::orderBy('name', 'asc')->get();

        return response()->json([
            'students' => $students,
            'classes' => $classes
        ]);
    }

    /**
     * POST /api/admin/students
     * Tambah Siswa Baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'nis' => 'required|string|unique:users,nis', // NIS wajib unik
            'password' => 'required|string|min:6',
            'class_id' => 'required|exists:class_names,id', // Wajib pilih kelas valid
        ]);

        $student = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'nis' => $validated['nis'],
            'password' => Hash::make($validated['password']),
            'role' => 'student',
            'class_id' => $validated['class_id'],
        ]);

        // Load ulang relasi agar saat response JSON, nama kelasnya terbawa
        $student->load('studentClass');

        return response()->json($student, 201);
    }

    /**
     * PUT /api/admin/students/{id}
     * Update Data Siswa
     */
    public function update(Request $request, $id)
    {
        $student = User::where('role', 'student')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($student->id)],
            'nis' => ['required', 'string', Rule::unique('users')->ignore($student->id)],
            'password' => 'nullable|string|min:6',
            'class_id' => 'required|exists:class_names,id',
        ]);

        // Update data
        $student->name = $validated['name'];
        $student->email = $validated['email'];
        $student->nis = $validated['nis'];
        $student->class_id = $validated['class_id'];

        if ($request->filled('password')) {
            $student->password = Hash::make($validated['password']);
        }

        $student->save();
        $student->load('studentClass'); // Load relasi nama kelas terbaru

        return response()->json($student);
    }

    /**
     * DELETE /api/admin/students/{id}
     */
    public function destroy($id)
    {
        $student = User::where('role', 'student')->findOrFail($id);
        $student->delete();

        return response()->json(['message' => 'Siswa berhasil dihapus']);
    }
}