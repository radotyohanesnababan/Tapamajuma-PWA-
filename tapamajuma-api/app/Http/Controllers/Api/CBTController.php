<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\ExamSession;
use App\Models\QuestionBank;
use Illuminate\Http\Request;

class CBTController extends Controller
{
public function startExam(Request $request)
{
    // --- PROTEKSI SEB (Opsional: Matikan saat testing di Chrome) ---
    // if (!$request->header('X-SafeExamBrowser-RequestHash')) { ... }

    $user = $request->user();
    $examId = $request->exam_id;

    // 1. Ambil data aturan ujian
    $exam = Exam::with('subject')->findOrFail($examId);

    // 2. Cek apakah sesi sudah ada, jika belum buat baru
    $session = ExamSession::where('user_id', $user->id)
                          ->where('exam_id', $examId)
                          ->first();

    if (!$session) {
        // AMBIL IDS YANG SUDAH DIKUNCI GURU
        $fixedIds = $exam->question_ids; // Diambil dari kolom question_ids di tabel exams

        // ACAK URUTANNYA (Agar antar siswa urutannya beda, tapi soalnya sama)
        $shuffledIds = $fixedIds;
        shuffle($shuffledIds);

        $session = ExamSession::create([
            'user_id' => $user->id,
            'exam_id' => $examId,
            'question_order' => $shuffledIds,
            'student_answers' => [], 
            'started_at' => now(),
        ]);
    }

    // 3. Ambil Konten Soal berdasarkan urutan di sesi
    $questions = QuestionBank::whereIn('id', $session->question_order)
                ->get()
                ->sortBy(function($model) use ($session) {
                    return array_search($model->id, $session->question_order);
                })
                ->values()
                ->makeHidden(['correct_key', 'created_at', 'updated_at']);

    return response()->json([
        'status' => 'success',
        'exam_info' => [
            'title' => $exam->title,
            'duration' => $exam->duration_minutes,
            'subject' => $exam->subject->name,
            'total_questions' => count($session->question_order)
        ],
        'session_data' => [
            'started_at' => $session->started_at,
            'current_answers' => $session->student_answers,
        ],
        'questions' => $questions
    ]);
}

public function verifyTokenByCode(Request $request)
{
    $request->validate(['token' => 'required']);

    // Cari ujian yang statusnya ACTIVE dan tokennya COCOK
    $exam = Exam::with('subject')
                ->where('status', 'active')
                ->where('token', strtoupper($request->token))
                ->first();

    if (!$exam) {
        return response()->json([
            'status' => 'error',
            'message' => 'Token tidak ditemukan atau ujian belum dimulai.'
        ], 403);
    }

    return response()->json([
        'status' => 'success',
        'exam' => [
            'id' => $exam->id,
            'title' => $exam->title,
            'subject' => $exam->subject->name,
            'duration' => $exam->duration_minutes,
            'total_questions' => count($exam->question_ids ?? [])
        ]
    ]);
}

public function updateAnswer(Request $request)
{
    $request->validate([
        'exam_id' => 'required',
        'question_id' => 'required',
        'answer' => 'nullable|string',
        'is_doubtful' => 'boolean' 
    ]);

    $user = $request->user();
    $session = ExamSession::where('user_id', $user->id)
                ->where('exam_id', $request->exam_id)
                ->firstOrFail();

    // Proteksi Waktu
    $exam = Exam::find($request->exam_id);
    $endTime = $session->started_at->addMinutes($exam->duration_minutes);
    if (now() > $endTime) {
        return response()->json(['message' => 'Waktu habis!'], 403);
    }

    // Ambil jawaban yang sudah ada
    $answers = $session->student_answers ?? [];

    // Update atau Tambah Jawaban Baru
    $answers[$request->question_id] = [
        'selected' => $request->answer,
        'is_doubtful' => $request->is_doubtful ?? false
    ];

    $session->student_answers = $answers;
    $session->save();

    return response()->json(['status' => 'saved']);
}

public function submitExam(Request $request)
{
    $session = ExamSession::with('exam')
                ->where('user_id', $request->user()->id)
                ->where('exam_id', $request->exam_id)
                ->firstOrFail();

    $studentAnswers = $session->student_answers ?? []; 
    $questions = QuestionBank::whereIn('id', $session->question_order)->get()->keyBy('id');

    $correct = 0;
    foreach ($session->question_order as $qId) {
        $userAns = $studentAnswers[$qId]['selected'] ?? null;
        $dbAns = $questions[$qId]->correct_key ?? null;

        if ($userAns && $dbAns && strtoupper($userAns) === strtoupper($dbAns)) {
            $correct++;
        }
    }

    $total = count($session->question_order);
    $score = ($total > 0) ? ($correct / $total) * 100 : 0;

    $result = ExamResult::create([
        'user_id' => $session->user_id,
        'exam_id' => $session->exam_id,
        'total_questions' => $total,
        'correct_answers' => $correct,
        'wrong_answers' => $total - $correct,
        'score' => round($score, 2)
    ]);

    // Hapus sesi agar tidak bisa dikerjakan ulang
    $session->delete();

    return response()->json([
        'status' => 'success',
        'score' => round($score, 2),
        'correct' => $correct,
        'total' => $total
    ]);
}
}
