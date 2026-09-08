<?php

namespace Tests\Feature\Student;

use App\Models\DailyActivity;
use App\Models\AcademicPeriod;
use App\Models\ClassName;
use App\Models\StudentEnrollment;
use App\Models\User;
use App\Models\XpLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TenantTestCase;

class DailyActivityTest extends TenantTestCase
{
    public function test_student_can_submit_daily_activity_successfully()
    {
        $student = $this->createStudent();
        
        $response = $this->actingAs($student)->postJson('/api/activities', [
            'type' => 'numeracy',
            'subject' => 'Matematika',
            'score' => 90,
            'confidence_level' => 4,
            'journal' => 'Belajar pecahan',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('daily_activities', [
            'user_id' => $student->id,
            'type' => 'numeracy',
            'score' => 90,
            'academic_period_id' => $this->activePeriod->id,
        ]);
        $this->assertDatabaseHas('xp_logs', [
            'user_id' => $student->id,
        ]);
    }

    public function test_student_cannot_exceed_daily_limit_of_3_activities()
    {
        $student = $this->createStudent();

        // Create 3 activities for today manually
        for ($i = 0; $i < 3; $i++) {
            DailyActivity::create([
                'user_id' => $student->id,
                'academic_period_id' => $this->activePeriod->id,
                'type' => 'numeracy',
                'score' => 80,
                'confidence_level' => 3,
                'journal' => 'Test',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $response = $this->actingAs($student)->postJson('/api/activities', [
            'type' => 'literacy',
            'score' => 80,
            'confidence_level' => 3,
            'journal' => 'Membaca buku',
        ]);

        $response->assertStatus(400)
                 ->assertJsonFragment(['error' => 'Anda sudah mencapai batas 3 kegiatan hari ini']);
    }

    public function test_alumni_student_is_blocked_from_submitting_activity()
    {
        $alumni = $this->createStudent();
        
        $oldPeriod = AcademicPeriod::create([
            'name' => 'Lama',
            'semester' => 'genap',
            'academic_year' => '2024/2025',
            'is_active' => false,
        ]);
        $classIx = ClassName::create(['name' => 'IX-A', 'level' => 9]);
        StudentEnrollment::create([
            'user_id' => $alumni->id,
            'class_name_id' => $classIx->id,
            'academic_period_id' => $oldPeriod->id,
            'is_active' => true,
        ]);
        
        $response = $this->actingAs($alumni)->postJson('/api/activities', [
            'type' => 'literacy',
            'score' => 80,
            'confidence_level' => 3,
            'journal' => 'Membaca buku',
        ]);

        $response->assertStatus(403);
    }
}
