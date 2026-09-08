<?php

namespace Tests;

use App\Models\AcademicPeriod;
use App\Models\ClassName;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Tests\TestCase;

abstract class TenantTestCase extends TestCase
{
    use DatabaseTruncation;

    protected School $school;
    protected AcademicPeriod $activePeriod;
    protected $student1;
    protected $student2;

    protected function setUpTraits()
    {
        // Force all connections to use the testing mysql database BEFORE RefreshDatabase runs
        config([
            'database.connections.central' => config('database.connections.mysql'),
            'database.connections.tenant' => config('database.connections.mysql'),
        ]);

        return parent::setUpTraits();
    }

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->setupTenant();
    }

    protected function migrateFreshUsing()
    {
        return [
            '--path' => [
                'database/migrations/central',
                'database/migrations/tenant'
            ],
            '--drop-views' => true,
        ];
    }

    // 2. Setup mock tenant
    protected function setupTenant()
    {
        $this->school = School::create([
            'name' => 'SMPN 1 Testing',
            'slug' => 'smpn1testing',
            'is_active' => true,
            'db_host' => '127.0.0.1',
            'db_name' => 'tapamajuma_testing',
            'db_user' => 'root',
            'db_password' => encrypt(''),
            'r2_prefix' => 'smpn1testing',
        ]);
        app()->instance('currentSchool', $this->school);

        // 3. Inject header default
        $this->withHeaders(['X-Tenant-Slug' => $this->school->slug]);

        // 4. Setup periode akademik default aktif
        $this->activePeriod = AcademicPeriod::create([
            'name' => 'Semester Ganjil 2026/2027',
            'semester' => 'ganjil',
            'academic_year' => '2026/2027',
            'is_active' => true,
            'opened_at' => now(),
        ]);
    }

    protected function createStudent(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'role' => 'student',
            'level' => 1,
            'xp_points' => 0,
        ], $attributes));
    }

    protected function createTeacher(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'role' => 'teacher',
        ], $attributes));
    }

    protected function createAdmin(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'role' => 'superadmin',
        ], $attributes));
    }
}
