<?php

namespace App\Http\Controllers\Teacher;

use App\Exports\TemplateQuestionBankExport;
use App\Http\Controllers\Controller;
use App\Imports\QuestionBankImport;
use App\Models\QuestionBank;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class QuestionBankController extends Controller
{
   public function index(Request $request)
{
    $user = $request->user();
    
    // Load Subject DAN targetClass
    $query = QuestionBank::with(['creator:id,name', 'subject', 'targetClass']); 

    if ($user->role !== 'superadmin') {
        $query->where('creator_id', $user->id);
    }

    if ($request->has('type')) {
        $query->where('type', $request->type);
    }
    
    if ($request->has('subject_id')) {
        $query->where('subject_id', $request->subject_id);
    }
    
    if ($request->has('class_id')) { 
        $query->where('class_id', $request->class_id);
    }

    // Gunakan paginate, misalnya 10 data per halaman
    // Laravel akan mengembalikan object berisi: data, current_page, last_page, total, dll.
    return response()->json($query->latest()->paginate(10));
}
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:numeracy,literacy,tka',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:class_names,id',
            'question_text' => 'required|string',
            'options' => 'required|array|min:3',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5048', 
            'correct_key' => 'required|in:A,B,C,D,E',
        ]);

        // 1. Siapkan semua data teks ke dalam array
        $data = [
            'type' => $request->type,
            'creator_id' => $request->user()->id,
            'subject_id' => $request->subject_id,
            'class_id' => $request->class_id,
            'question_text' => $request->question_text,
            'options' => $request->options,
            'correct_key' => $request->correct_key,
            // Perhatikan, 'image' belum kita masukkan di sini
        ];

        // 2. Jika ada file gambar yang diunggah
        if ($request->hasFile('image')) {
            // Simpan ke storage dan masukkan teks path-nya ke array $data
            $data['image'] = $request->file('image')->store('questions');
        }

        // 3. Simpan ke database menggunakan array $data yang sudah bersih
        $q = QuestionBank::create($data);

        return response()->json($q, 201);
    }

    public function import(Request $request)
{
    // 1. TAMBAHKAN DUA BARIS INI (Wajib untuk data besar)
    set_time_limit(300); // Izinkan server mikir sampai 5 menit
    ini_set('memory_limit', '1024M'); // Perbesar jatah RAM sementara

    // Validasi file
    $request->validate([
        'file' => 'required|mimes:xlsx,xls,csv',
    ]);

    try {
        // Panggil Excel::import
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