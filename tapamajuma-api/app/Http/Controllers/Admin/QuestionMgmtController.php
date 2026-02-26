<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuestionBank;
use App\Models\Subject;
use App\Models\ClassName;
use App\Models\User;
use Illuminate\Http\Request;

class QuestionMgmtController extends Controller
{
    /**
     * GET Data untuk Halaman Admin (Soal + Data Master untuk Filter)
     */
    public function index(Request $request)
{
    // 1. Query Soal dengan Relasi Lengkap
    $query = QuestionBank::with(['creator', 'subject', 'targetClass']);

    // --- FILTERING ---
    
    // Filter by Kategori (Numerasi, Literasi, TKA) -> INI YANG BARU
    if ($request->has('type') && $request->type) {
        $query->where('type', $request->type);
    }

    // Filter by Mapel
    if ($request->has('subject_id') && $request->subject_id) {
        $query->where('subject_id', $request->subject_id);
    }

    // Filter by Kelas
    if ($request->has('class_id') && $request->class_id) {
        $query->where('class_id', $request->class_id);
    }

    // Filter by Guru Pembuat
    if ($request->has('teacher_id') && $request->teacher_id) {
        $query->where('creator_id', $request->teacher_id);
    }

    // Search Text (Mencari di teks soal atau nama mapel)
    if ($request->has('search') && $request->search) {
        $searchTerm = '%' . $request->search . '%';
        $query->where(function($q) use ($searchTerm) {
            $q->where('question_text', 'like', $searchTerm)
              ->orWhereHas('subject', function($sub) use ($searchTerm) {
                  $sub->where('name', 'like', $searchTerm);
              });
        });
    }

    // --- PAGINATION ---
    $perPage = $request->input('per_page', 15); // Default samakan dengan React (15)
    $questions = $query->latest()->paginate($perPage);

    // 2. Ambil Data Master untuk Dropdown Filter
    $subjects = Subject::orderBy('name')->get();
    $classes = ClassName::orderBy('name')->get();
    $teachers = User::where('role', 'teacher')->orderBy('name')->get();

    return response()->json([
        'status' => 'success',
        'data' => [
            'questions' => $questions,
            'subjects' => $subjects,
            'classes' => $classes,
            'teachers' => $teachers,
            
        ]
    ]);
}

    /**
     * DELETE Soal (Admin bisa hapus punya siapa saja)
     */
    public function destroy($id)
    {
        $q = QuestionBank::findOrFail($id);
        $q->delete();
        return response()->json(['message' => 'Soal berhasil dihapus oleh Admin']);
    }

    // (Opsional) Method Store/Import bisa copy paste dari Teacher Controller
    // Bedanya hanya di 'creator_id' => $request->user()->id (Admin yg buat)
}