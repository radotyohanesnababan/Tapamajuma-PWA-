<?php

namespace Tests\Feature\Teacher;

use App\Models\SelfStudySession;
use App\Models\SessionAttendance;
use App\Models\ClassName;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TenantTestCase;

class MandiriSessionTest extends TenantTestCase
{
    protected $teacher;
    protected $className;
    protected $student1;
    protected $student2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->className = ClassName::create(['name' => 'VII-A', 'level' => 7]);
        
        $this->teacher = $this->createTeacher([
            'accessible_classes' => [$this->className->id]
        ]);
        
        $this->student1 = $this->createStudent(['class_id' => $this->className->id]);
        $this->student2 = $this->createStudent(['class_id' => $this->className->id]);
    }

    public function test_teacher_can_create_self_study_session_and_award_xp()
    {

        $response = $this->actingAs($this->teacher)->postJson('/api/self-study/store', [
            'class_id' => $this->className->id,
            'students' => [
                [
                    'id' => $this->student1->id,
                    'active' => true,
                    'nilai' => 80
                ],
                [
                    'id' => $this->student2->id,
                    'active' => false,
                    'nilai' => 0
                ]
            ]
        ]);

        $response->dump();
        $response->assertStatus(201);
        
        // Assert session created
        $this->assertDatabaseHas('self_study_sessions', [
            'teacher_id' => $this->teacher->id,
            'class_name' => 'VII-A',
            'total_present' => 1
        ]);

        $session = SelfStudySession::where('teacher_id', $this->teacher->id)->first();
        
        // Assert attendance recorded
        $this->assertDatabaseHas('session_attendances', [
            'session_id' => $session->id,
            'student_id' => $this->student1->id,
            'is_active' => 1,
            'nilai' => 80
        ]);

        // Assert XP awarded to active student
        $this->assertDatabaseHas('xp_logs', [
            'user_id' => $this->student1->id,
            'xp' => 80,
            'source' => 'attendance'
        ]);

        // Assert no XP for absent student
        $this->assertDatabaseMissing('xp_logs', [
            'user_id' => $this->student2->id
        ]);
    }

    public function test_teacher_cannot_access_unassigned_class()
    {
        $unassignedClass = ClassName::create(['name' => 'VIII-B', 'level' => 8]);

        $response = $this->actingAs($this->teacher)->postJson('/api/self-study/store', [
            'class_id' => $unassignedClass->id,
            'students' => [
                [
                    'id' => $this->student1->id,
                    'active' => true,
                    'nilai' => 80
                ]
            ]
        ]);

        $response->dump();
        $response->assertStatus(403)
                 ->assertJson(['error' => 'Akses Ditolak.']);
    }
}
