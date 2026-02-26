<?php

namespace App\Http\Controllers\Admin;

use App\Exports\TemplateStudentExport;
use App\Http\Controllers\Controller;
use App\Imports\StudentsImport;
use App\Imports\TeachersImport;
use App\Models\User;
use App\Models\ClassName;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;


class StudentMgmtController extends Controller
{
    /**
     * GET /api/admin/students
     * Mengambil daftar siswa + data master kelas untuk dropdown
     */
    public function index(Request $request) // Tambahkan parameter Request $request
{
    // 1. Inisialisasi Query dasar
    $query = User::where('role', 'student')
                 ->with('studentClass'); // Eager load relasi

    // 2. LOGIKA PENCARIAN (Tambahkan Bagian Ini)
    if ($request->has('search') && $request->search != '') {
        $searchTerm = '%' . $request->search . '%';
        
        $query->where(function($q) use ($searchTerm) {
            $q->where('name', 'like', $searchTerm)
              ->orWhere('nis', 'like', $searchTerm)
              ->orWhere('email', 'like', $searchTerm);
        });
    }

    // 3. Ambil per_page dari query param (default 15)
    $per_page = $request->query('per_page', 15);

    // 4. Eksekusi Pagination
    $students = $query->orderBy('name', 'asc')
                      ->paginate($per_page);

    // 5. Ambil daftar kelas untuk dropdown
    $classes = ClassName::orderBy('name', 'asc')->get();

    return response()->json([
        'students' => $students,
        'classes' => $classes
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
                    Excel::import(new StudentsImport, $file);
                } else {
                    Excel::import(new TeachersImport, $file);
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

    public function downloadTemplateStudent()
{
    return Excel::download(new TemplateStudentExport, 'template_siswa_pro.xlsx');
}
}