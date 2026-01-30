<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\QuestionBank;
use App\Models\Subject;
use App\Models\ClassName; // <--- Import Model Kelas
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        $request->validate(['file' => 'required|mimes:csv,txt']);
        $file = $request->file('file');
        $csvData = array_map('str_getcsv', file($file->getRealPath()));
        array_shift($csvData); // Skip Header

        DB::beginTransaction();
        try {
            foreach ($csvData as $row) {
                if (count($row) < 7) continue;

                // 1. Cari Subject ID by Name
                $subjectName = trim($row[0]);
                $subject = Subject::where('name', $subjectName)->first();

                // 2. Cari Class ID by Name
                $className = trim($row[1]);
                $classObj = ClassName::where('name', $className)->first();

                // Jika Mapel atau Kelas tidak ditemukan di Master Data, skip baris ini
                if (!$subject || !$classObj) continue; 

                QuestionBank::create([
                    'creator_id' => $request->user()->id,
                    'subject_id' => $subject->id, 
                    'class_id'   => $classObj->id, // <--- Simpan ID Kelas
                    'question_text' => $row[2],
                    'options'       => ['A' => $row[3], 'B' => $row[4], 'C' => $row[5]],
                    'correct_key'   => strtoupper($row[6])
                ]);
            }
            DB::commit();
            return response()->json(['message' => 'Import sukses. Data dengan Mapel/Kelas tidak dikenal dilewati.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
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