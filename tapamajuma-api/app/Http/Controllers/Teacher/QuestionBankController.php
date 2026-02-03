<?php

namespace App\Http\Controllers\Teacher;

use App\Exports\TemplateQuestionBankExport;
use App\Http\Controllers\Controller;
use App\Imports\QuestionBankImport;
use App\Models\QuestionBank;
use App\Models\Subject;
use App\Models\ClassName; // <--- Import Model Kelas
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class QuestionBankController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Load Subject DAN targetClass (agar nama kelas muncul: "7A")
        $query = QuestionBank::with(['creator:id,name', 'subject', 'targetClass']); 

        if ($user->role !== 'superadmin') {
            $query->where('creator_id', $user->id);
        }
        
        // Filter Dropdown Frontend
        if ($request->has('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }
        if ($request->has('class_id')) { // Tambah filter kelas
            $query->where('class_id', $request->class_id);
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:class_names,id', // <--- Validasi ID Kelas
            'question_text' => 'required|string',
            'options' => 'required|array|min:3',
            'correct_key' => 'required|in:A,B,C',
        ]);

        $q = QuestionBank::create([
            'creator_id' => $request->user()->id,
            'subject_id' => $request->subject_id,
            'class_id' => $request->class_id, // <--- Simpan ID
            'question_text' => $request->question_text,
            'options' => $request->options,
            'correct_key' => $request->correct_key,
        ]);

        return response()->json($q, 201);
    }

    public function import(Request $request)
{
    // Validasi file
    $request->validate([
        'file' => 'required|mimes:xlsx,xls,csv',
    ]);

    try {
        // Panggil Excel::import
        // Parameter 1: Instance Import Class (kita kirim User ID ke sana)
        // Parameter 2: Filenya
        Excel::import(new QuestionBankImport($request->user()->id), $request->file('file'));

        return response()->json([
            'message' => 'Import CSV Berhasil! Data dengan Mapel/Kelas yang tidak sesuai akan dilewati otomatis.'
        ]);

    } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
         return response()->json(['error' => 'Format data tidak valid.'], 422);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Gagal import: ' . $e->getMessage()], 500);
    }
}
public function downloadTemplate()
{
    return Excel::download(new TemplateQuestionBankExport, 'template_bank_soal.xlsx');
}

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $question = QuestionBank::findOrFail($id);

        if ($user->role !== 'superadmin' && $question->creator_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $question->delete();
        return response()->json(['message' => 'Soal dihapus']);
    }
}