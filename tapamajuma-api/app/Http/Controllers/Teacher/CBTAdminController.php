<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\ClassName;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\QuestionBank;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CBTAdminController extends Controller
{   
            public function getResults($id)
{
            $results = ExamResult::with([
                'user:id,name,class_id', 
                'user.studentClass:id,name' 
            ])
            ->where('exam_id', $id)
            ->orderBy('score', 'desc')
            ->get();

            return response()->json([
                'status' => 'success',
                'data' => $results
            ]);
        }

        public function getOptions()
        {
            return response()->json([
                'subjects' => Subject::all(['id', 'name']),
                'classes' => ClassName::all(['id', 'name']),
                'teachers' => User::where('role', 'teacher')->get(['id', 'name']),
            ]);
        }
        public function getPreview($id)
            {
                $exam = Exam::findOrFail($id);
                
                // Karena question_ids sudah di-cast jadi array di Model, tinggal tarik
                $questions = QuestionBank::with(['subject', 'creator'])
                    ->whereIn('id', $exam->question_ids)
                    ->get();

                return response()->json([
                    'status' => 'success',
                    'data' => $questions
                ]);
            }

        public function getQuestionBank(Request $request)
        {
            $query = QuestionBank::with(['subject', 'creator', 'targetClass']);

            // --- LOGIKA FILTERING ---
            if ($request->type) $query->where('type', $request->type);
            if ($request->subject_id) $query->where('subject_id', $request->subject_id);
            if ($request->class_id) $query->where('class_id', $request->class_id);
            if ($request->creator_id) $query->where('creator_id', $request->creator_id);
            if ($request->search) {
                $query->where('question_text', 'like', '%' . $request->search . '%');
            }

            // SSR: Server-Side Pagination
            $questions = $query->latest()->paginate(15);

            return response()->json($questions);
        }
    /**
     * 1. Tampilkan semua paket ujian yang pernah dibuat
     */
    public function index()
    {
        // Ambil ujian beserta nama mapelnya, urutkan dari yang terbaru
        $exams = Exam::with('subject')->latest()->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $exams
        ]);
    }

    /**
     * 2. Simpan Paket Ujian Baru (Status: Draft, Belum ada Token)
     */
    public function store(Request $request)
{
    $request->validate([
        'title' => 'required',
        'subject_id' => 'required',
        'duration_minutes' => 'required|integer',
        'selection_mode' => 'required|in:random,manual',
    ]);

    $questionIds = [];

    if ($request->selection_mode === 'random') {
        // --- LOGIKA RANDOM DI SINI ---
        $query = QuestionBank::where('subject_id', $request->subject_id);

        // Filter tipe soal (official, numeracy, dll)
        if ($request->allowed_question_types) {
            $query->whereIn('type', $request->allowed_question_types);
        }

        // Filter kelas (VII, VIII, IX)
        if ($request->allowed_classes) {
            $query->whereIn('class_id', $request->allowed_classes);
        }

        // Ambil ID secara acak sesuai jumlah yang diminta
        $questionIds = $query->inRandomOrder()
                             ->take($request->total_questions)
                             ->pluck('id')
                             ->toArray();

        // Validasi jika soal di bank soal ternyata lebih sedikit dari yang diminta
        if (count($questionIds) < $request->total_questions) {
            return response()->json([
                'message' => "Soal tidak mencukupi! Hanya tersedia " . count($questionIds) . " soal untuk kriteria ini."
            ], 422);
        }
    } else {
        // Jika manual, ambil langsung dari request
        $questionIds = $request->question_ids;
    }

    // Simpan Paket Ujian dengan IDs yang sudah FIX
    $exam = Exam::create([
        'title' => $request->title,
        'subject_id' => $request->subject_id,
        'duration_minutes' => $request->duration_minutes,
        'selection_mode' => $request->selection_mode,
        'total_questions' => count($questionIds), // Ambil jumlah asli dari array
        'question_ids' => $questionIds, // Disimpan sebagai JSON
        'allowed_question_types' => $request->allowed_question_types, // Opsional, untuk arsip
        'allowed_classes' => $request->allowed_classes, // Opsional
        'status' => 'draft',
    ]);

    return response()->json([
        'status' => 'success',
        'message' => 'Paket ujian berhasil dibuat dengan ' . count($questionIds) . ' soal ter-generate!',
        'data' => $exam
    ]);
}

    /**
     * 3. Rilis Token / Refresh Token (Mengubah status jadi Active)
     */
    public function releaseToken($id)
    {
        $exam = Exam::findOrFail($id);

        // Generate 6 Karakter Acak (Hanya Huruf Kapital & Angka)
        // Dibuang huruf O, I, 0, 1 agar tidak membingungkan siswa saat membaca di proyektor
        $characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $newToken = '';
        for ($i = 0; $i < 6; $i++) {
            $newToken .= $characters[rand(0, strlen($characters) - 1)];
        }

        $exam->update([
            'token' => $newToken,
            'token_released_at' => now(),
            'status' => 'active' // Ujian resmi dimulai!
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Token berhasil dirilis!',
            'data' => [
                'token' => $newToken,
                'expires_in' => $exam->token_lifetime . ' Menit',
                'status' => $exam->status
            ]
        ]);
    }

    /**
     * 4. Tutup Ujian (Memaksa ujian berhenti, token hangus)
     */
    public function closeExam($id)
    {
        $exam = Exam::findOrFail($id);

        $exam->update([
            'status' => 'closed',
            'token' => null, // Hanguskan token
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Ujian telah ditutup. Siswa tidak bisa login lagi.'
        ]);
    }

    /**
     * 5. Hapus Paket Ujian (Opsional)
     */
    public function destroy($id)
    {
        $exam = Exam::findOrFail($id);
        
        // Mencegah guru menghapus ujian yang sedang berjalan
        if ($exam->status === 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak bisa menghapus ujian yang sedang aktif!'
            ], 403);
        }

        $exam->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Paket ujian berhasil dihapus.'
        ]);
    }
}