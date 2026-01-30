<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuestionBank;
use App\Models\Subject;
use App\Models\DailyActivity; // <--- Pakai Model Ini
use Illuminate\Http\Request;

class StudentQuizController extends Controller
{
    // 1. Ambil Mapel (Tetap sama)
    public function getSubjects()
    {
        // Ambil mapel yang punya soal saja
        $subjects = Subject::whereHas('questions')->orderBy('name')->get();
        return response()->json($subjects);
    }

    // 2. Ambil Soal (Tetap sama)
   public function getQuestions(Request $request)
    {
        $user = $request->user();
        $subjectId = $request->query('subject_id');

        // 1. Cek apakah siswa sudah punya kelas
        if (!$user->class_id) {
            return response()->json(['error' => 'Akun Anda belum masuk ke kelas manapun.'], 403);
        }

        // 2. Query ke tabel question_banks
        $questions = QuestionBank::query()
            ->where('subject_id', $subjectId)     // Filter Mapel
            ->where('class_id', $user->class_id)  // Filter Kelas (Sesuai kelas siswa)
            ->inRandomOrder()                     // Acak urutan soal
            ->limit(10)                           // Batasi 10 soal per sesi
            ->get()
            ->makeHidden(['correct_key']);        // PENTING: Sembunyikan kunci jawaban dari JSON

        // 3. Cek ketersediaan soal
        if ($questions->isEmpty()) {
            return response()->json(['message' => 'Belum ada soal tersedia.'], 404);
        }

        return response()->json($questions);
    }

    // 3. SUBMIT & SIMPAN KE DAILY_ACTIVITY
    public function submit(Request $request)
    {
        $request->validate([
            'subject_id' => 'required',
            'answers' => 'required|array',
        ]);

        $user = $request->user();
        $answers = $request->answers;
        
        // A. Hitung Nilai
        $correctCount = 0;
        $totalQuestions = count($answers);

        foreach ($answers as $ans) {
            $question = QuestionBank::find($ans['question_id']);
            // Cek jawaban
            if ($question && $question->correct_key === $ans['selected_option']) {
                $correctCount++;
            }
        }

        // Rumus Skor (Skala 0-100)
        $score = ($totalQuestions > 0) ? round(($correctCount / $totalQuestions) * 100) : 0;

        // B. Tentukan Confidence Level otomatis berdasarkan nilai (Opsional)
        // 1 = Rendah (<50), 2 = Sedang (50-79), 3 = Tinggi (80-100)
        $confidence = 1;
        if ($score >= 80) $confidence = 3;
        elseif ($score >= 50) $confidence = 2;

        // C. Cari Nama Mapel (Karena tabel daily_activities pakai string 'subject')
        $subjectObj = Subject::find($request->subject_id);
        $subjectName = $subjectObj ? $subjectObj->name : 'Umum';

        // D. Simpan ke DailyActivity
        // DailyActivity::create([
        //     'user_id' => $user->id,
        //     'type' => 'numeracy',         // Sesuai request
        //     'subject' => $subjectName,    // "Matematika"
        //     'score' => $score,            // Contoh: 80
        //     'confidence_level' => $confidence, // Contoh: 3
        //     'reading_content' => null,    // Null karena ini numerasi
        //     'audio_path' => null,         // Null
        //     'journal' => "Latihan Soal {$subjectName} (Benar: {$correctCount}/{$totalQuestions})", // Opsional: Catatan kecil
        // ]);

        return response()->json([
            'score' => $score,
            'correct' => $correctCount,
            'total' => $totalQuestions,
            'message' => $score >= 70 ? 'Luar biasa!' : 'Terus berlatih!'
        ]);
    }
}