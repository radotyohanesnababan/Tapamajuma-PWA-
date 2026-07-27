<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuestionBank;
use App\Models\Subject;
use App\Models\DailyActivity;
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

//    // 2. Ambil Soal
//     public function getQuestions(Request $request)
//     {
//         $user = $request->user();
//         $subjectId = $request->query('subject_id');
        
//         // 1. TANGKAP TIPE SOAL (numeracy, literacy, tka) DARI REACT
//         $type = $request->query('type'); 

//         // Cek apakah siswa sudah punya kelas
//         if (!$user->class_id) {
//             return response()->json(['error' => 'Akun Anda belum masuk ke kelas manapun.'], 403);
//         }

//         // Query ke tabel question_banks
//         // Ambil random IDs dulu (ringan)
// $randomIds = QuestionBank::query()
//     ->where('subject_id', $subjectId)
//     ->where('class_id', $user->class_id)
//     ->where('type', $type)
//     ->pluck('id')
//     ->shuffle()
//     ->take(10);

// // Baru ambil full data
// $questions = QuestionBank::whereIn('id', $randomIds)
//     ->get()
//     ->makeHidden(['correct_key']);        

//         // Cek ketersediaan soal
//         if ($questions->isEmpty()) {
//             return response()->json(['message' => 'Belum ada soal tersedia untuk kategori ini.'], 404);
//         }

//         return response()->json($questions);
//     }


// 2. Ambil Soal (Versi Optimasi)
public function getQuestions(Request $request)
{
    $user = $request->user();
    $subjectId = $request->query('subject_id');
    $type = $request->query('type');

    if (!$user->class_id) {
        return response()->json(['error' => 'Akun Anda belum masuk ke kelas manapun.'], 403);
    }

    $needed = 10;

    $baseQuery = QuestionBank::query()
        ->where('subject_id', $subjectId)
        ->where('class_id', $user->class_id)
        ->where('type', $type);

    $bounds = (clone $baseQuery)->selectRaw('MIN(id) as min_id, MAX(id) as max_id')->first();

    if (!$bounds || !$bounds->min_id) {
        return response()->json(['message' => 'Belum ada soal tersedia untuk kategori ini.'], 404);
    }

    $questions = collect();
    $attempts = 0;

    while ($questions->count() < $needed && $attempts < 5) {
        $randomId = random_int($bounds->min_id, $bounds->max_id);

        $batch = (clone $baseQuery)
            ->where('id', '>=', $randomId)
            ->orderBy('id')
            ->limit($needed - $questions->count())
            ->get()
            ->makeHidden(['correct_key']);

        $questions = $questions->merge($batch)->unique('id');
        $attempts++;
    }

    if ($questions->isEmpty()) {
        return response()->json(['message' => 'Belum ada soal tersedia untuk kategori ini.'], 404);
    }

    return response()->json($questions->take($needed)->values());
}

    // 3. SUBMIT & SIMPAN KE DAILY_ACTIVITY
    public function submit(Request $request)
    {
        $request->validate([
            'subject_id' => 'required',
            'answers' => 'required|array',
        ]);

        $answers = $request->answers;
        
        // 1. Ambil SEMUA ID soal yang dijawab siswa
        $questionIds = collect($answers)->pluck('question_id');

        // 2. Query ke DB CUKUP 1 KALI untuk mengambil semua kunci jawaban sekaligus!
        // keyBy('id') membuat kita mudah mencocokkannya nanti
        $questions = QuestionBank::whereIn('id', $questionIds)->get()->keyBy('id');

        $correctCount = 0;
        $totalQuestions = count($answers);

        // 3. Cocokkan jawaban (Ini terjadi murni di RAM, sangat cepat!)
        foreach ($answers as $ans) {
            $qId = $ans['question_id'];
            
            // Cek apakah soal ada dan jawabannya cocok
            if (isset($questions[$qId]) && $questions[$qId]->correct_key === $ans['selected_option']) {
                $correctCount++;
            }
        }

        $score = ($totalQuestions > 0) ? round(($correctCount / $totalQuestions) * 100) : 0;

        // Langsung kembalikan skor ke React agar UI tidak nge-lag
        return response()->json([
            'score' => $score,
            'correct' => $correctCount,
            'total' => $totalQuestions,
            'message' => $score >= 70 ? 'Luar biasa!' : 'Terus berlatih!'
        ]);
    }
}