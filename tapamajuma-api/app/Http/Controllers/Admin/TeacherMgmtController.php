<?php

namespace App\Http\Controllers\Admin;

use App\Exports\TemplateTeacherExport;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\ClassName;
use Maatwebsite\Excel\Facades\Excel;

class TeacherMgmtController extends Controller
{
    /**
     * 1. GET: Ambil semua daftar guru
     * Endpoint: GET /api/admin/teachers
     */
    public function index()
    {
        // Ambil user yang role-nya 'teacher', urutkan dari yang terbaru
       $teachers = User::where('role', 'teacher')
                    ->orderBy('created_at', 'desc')
                    ->get();
        $classes = ClassName::all();

        // Laravel otomatis mengubah array accessible_classes menjadi JSON
        // berkat settingan $casts di Model User.
        return response()->json([
        'teachers' => $teachers,
        'all_classes' => $classes // Kirim master data juga
    ]);
    }
    public function import(Request $request) 
{
    $request->validate([
        'file' => 'required|mimes:xlsx,xls,csv',
        'type' => 'required|in:student,teacher' // Validasi tipe
    ]);

    try {
        $file = $request->file('file');
        
        if ($request->type === 'student') {
            Excel::import(new \App\Imports\StudentsImport, $file);
        } else {
            Excel::import(new \App\Imports\TeachersImport, $file);
        }
        
        return response()->json(['message' => 'Import berhasil!']);

    } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
        // ... (Logika handle error sama seperti sebelumnya)
         $failures = $e->failures();
         $messages = [];
         foreach ($failures as $failure) {
             $messages[] = "Baris " . $failure->row() . ": " . implode(', ', $failure->errors());
         }
         return response()->json(['message' => 'Validasi Excel Gagal', 'errors' => $messages], 422);
    }
}

    /**
     * (Tidak Dipakai untuk API/React)
     * React menggunakan Modal, tidak butuh halaman create terpisah.
     */
    public function create()
    {
        return response()->json(['message' => 'Not available via API'], 404);
    }

    /**
     * 2. POST: Tambah Guru Baru
     * Endpoint: POST /api/admin/teachers
     */
    public function store(Request $request)
    {
        // A. Validasi Input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'accessible_classes' => 'array', // Pastikan dikirim sebagai array
        ]);

        // B. Simpan ke Database
        $teacher = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']), // Enkripsi password
            'role' => 'teacher', // Wajib set role teacher
            'accessible_classes' => $validated['accessible_classes'] ?? [], 
        ]);

        return response()->json($teacher, 201);
    }

    /**
     * Display the specified teacher (Opsional, jika butuh detail view)
     */
    public function show($id)
    {
        $teacher = User::where('role', 'teacher')->findOrFail($id);
        return response()->json($teacher);
    }

    /**
     * (Tidak Dipakai untuk API/React)
     * React menggunakan Modal dengan data yang sudah ada di state.
     */
    public function edit($id)
    {
        return response()->json(['message' => 'Not available via API'], 404);
    }

    /**
     * 3. PUT: Update Data Guru
     * Endpoint: PUT /api/admin/teachers/{id}
     */
    public function update(Request $request, $id)
    {
        // Cari user, pastikan dia guru
        $teacher = User::where('role', 'teacher')->findOrFail($id);

        // A. Validasi (Email unik kecuali punya diri sendiri)
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($teacher->id)],
            'password' => 'nullable|string|min:8', // Nullable: bisa kosong jika tak ganti pass
            'accessible_classes' => 'array',
        ]);

        // B. Update Data Dasar
        $teacher->name = $validated['name'];
        $teacher->email = $validated['email'];
        
        // Update kelas (Jika null/kosong, set array kosong)
        $teacher->accessible_classes = $validated['accessible_classes'] ?? [];

        // C. Update Password (Hanya jika diisi)
        if ($request->filled('password')) {
            $teacher->password = Hash::make($validated['password']);
        }

        $teacher->save();

        return response()->json($teacher);
    }

    /**
     * 4. DELETE: Hapus Guru
     * Endpoint: DELETE /api/admin/teachers/{id}
     */
    public function destroy($id)
    {
        $teacher = User::where('role', 'teacher')->findOrFail($id);
        
        // Hapus guru (Otomatis menghapus sesi & presensi berkat onDelete cascade di migration)
        $teacher->delete();

        return response()->json(['message' => 'Teacher deleted successfully']);
    }

    public function downloadTemplateTeacher()
{
    return Excel::download(new TemplateTeacherExport, 'template_guru_pro.xlsx');
}
}