<?php

namespace Tests\Feature\Cbt;

use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\QuestionBank;
use App\Models\Subject;
use App\Models\ExamResult;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TenantTestCase;

class CbtExamTest extends TenantTestCase
{
    protected Subject $subject;
    protected Exam $exam;
    protected $questions;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Bypass middleware check.seb so it doesn't block the request
        $this->withoutMiddleware([\App\Http\Middleware\CheckSafeExamBrowser::class]);

        $this->teacher = $this->createTeacher();
        $this->subject = Subject::create(['name' => 'Matematika']);

        $this->questions = collect();
        for ($i = 1; $i <= 3; $i++) {
            $this->questions->push(QuestionBank::create([
                'subject_id' => $this->subject->id,
                'creator_id' => $this->teacher->id,
                'question_type' => 'multiple_choice',
                'question_text' => "Soal nomor $i",
                'options' => ['A' => '1', 'B' => '2', 'C' => '3', 'D' => '4'],
                'correct_key' => 'A',
                'level' => 7,
            ]));
        }

        $this->exam = Exam::create([
            'title' => 'Ujian Tengah Semester',
            'subject_id' => $this->subject->id,
            'duration_minutes' => 60,
            'status' => 'active',
            'token' => 'ABCDE',
            'question_ids' => $this->questions->pluck('id')->toArray(),
            'start_time' => now()->subMinutes(10),
            'end_time' => now()->addMinutes(50),
        ]);
    }

    public function test_student_can_start_exam_and_receives_shuffled_questions()
    {
        $student = $this->createStudent();

        $response = $this->actingAs($student)->postJson('/api/cbt/start', [
            'exam_id' => $this->exam->id,
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'exam_info',
                     'session_data',
                     'questions' => [
                         '*' => ['id', 'question_text', 'options']
                     ]
                 ]);

        // Assert correct_key is missing from response
        $response->assertJsonMissing(['correct_key' => 'A']);

        // Assert session created
        $this->assertDatabaseHas('exam_sessions', [
            'user_id' => $student->id,
            'exam_id' => $this->exam->id,
        ]);
    }

    public function test_student_can_save_progress_and_submit_exam_with_auto_scoring()
    {
        $student = $this->createStudent();
        
        // Start exam
        $this->actingAs($student)->postJson('/api/cbt/start', [
            'exam_id' => $this->exam->id,
        ]);

        $session = ExamSession::where('user_id', $student->id)->where('exam_id', $this->exam->id)->first();
        $qIds = $session->question_order;

        // Save progress for first 2 questions (1 correct, 1 wrong)
        $this->actingAs($student)->postJson('/api/cbt/update-answer', [
            'exam_id' => $this->exam->id,
            'question_id' => $qIds[0],
            'answer' => 'A', // correct
            'is_doubtful' => false,
        ])->assertStatus(200);

        $this->actingAs($student)->postJson('/api/cbt/update-answer', [
            'exam_id' => $this->exam->id,
            'question_id' => $qIds[1],
            'answer' => 'B', // wrong
            'is_doubtful' => false,
        ])->assertStatus(200);

        // Submit exam
        $response = $this->actingAs($student)->postJson('/api/cbt/submit', [
            'exam_id' => $this->exam->id,
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                     'correct' => 1,
                     'total' => 3,
                 ]);

        // Session should be deleted
        $this->assertDatabaseMissing('exam_sessions', [
            'id' => $session->id,
        ]);

        // Result should be created
        $this->assertDatabaseHas('exam_results', [
            'user_id' => $student->id,
            'exam_id' => $this->exam->id,
            'correct_answers' => 1,
            'wrong_answers' => 2,
        ]);
    }
}
