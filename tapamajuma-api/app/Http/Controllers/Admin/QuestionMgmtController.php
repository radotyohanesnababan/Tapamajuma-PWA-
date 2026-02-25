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
        // Search Text
        if ($request->has('search') && $request->search) {
            $query->where('question_text', 'like', '%' . $request->search . '%');
        }
        $perPage = $request->input('per_page', 10);

        $questions = $query->latest()->paginate($perPage);

        // 2. Ambil Data Master untuk Dropdown Filter
        $subjects = Subject::orderBy('name')->get();
        $classes = ClassName::orderBy('name')->get();
        $teachers = User::where('role', 'teacher')->orderBy('name')->get();

        return response()->json([
            'status' => 'success',
            'data' =>[
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