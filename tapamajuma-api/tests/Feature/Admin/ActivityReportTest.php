<?php

namespace Tests\Feature\Admin;

use App\Models\AcademicPeriod;
use App\Models\ClassName;
use App\Models\DailyActivity;
use App\Models\User;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TenantTestCase;

class ActivityReportTest extends TenantTestCase
{
    use WithFaker;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->createAdmin();
    }

    public function test_admin_can_get_academic_periods()
    {
        $response = $this->actingAs($this->admin)->getJson('/api/admin/activity-report/academic-periods');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => ['id', 'name', 'semester', 'academic_year', 'is_active', 'opened_at', 'closed_at']
                     ]
                 ]);
    }

    public function test_admin_can_get_executive_summary()
    {
        $response = $this->actingAs($this->admin)->getJson('/api/admin/activity-report/executive');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'metrics' => ['total_activities', 'avg_score', 'active_students'],
                     'period',
                     'activity_types',
                     'trend',
                     'subjects',
                 ]);
    }

    public function test_admin_can_get_student_log()
    {
        $response = $this->actingAs($this->admin)->getJson('/api/admin/activity-report/student');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         'data' => [
                             '*' => ['id', 'name', 'total_tasks', 'avg_score', 'last_active']
                         ]
                     ],
                     'classes'
                 ]);
    }

    public function test_admin_can_get_class_summary()
    {
        $class = ClassName::create(['name' => 'VII-A']);
        $student = $this->createStudent(['class_id' => $class->id]);

        DailyActivity::create([
            'user_id' => $student->id,
            'academic_period_id' => $this->activePeriod->id,
            'type' => 'literacy',
            'subject' => 'B. Indonesia',
            'description' => 'Membaca',
            'score' => 85,
            'confidence_level' => 5,
        ]);

        $response = $this->actingAs($this->admin)->getJson('/api/admin/activity-report/class-summary');

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'class_name' => 'VII-A',
                     'literacy_count' => "1",
                 ]);
    }

    public function test_admin_can_get_morning_session_report()
    {
        $response = $this->actingAs($this->admin)->getJson('/api/admin/activity-report/morning-session');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => ['id', 'name', 'class_name', 'total_active']
                     ]
                 ]);
    }
}
