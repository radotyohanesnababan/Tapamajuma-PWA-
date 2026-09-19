<?php

namespace Tests\Feature\Admin;

use App\Models\AcademicPeriod;
use App\Models\ClassName;
use App\Models\StudentEnrollment;
use App\Models\User;
use Tests\TenantTestCase;

class EnrollmentTransferTest extends TenantTestCase
{
    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->createAdmin();
    }

    public function test_admin_can_transfer_student_to_different_class()
    {
        $class88 = ClassName::create(['name' => '8-8']);
        $class82 = ClassName::create(['name' => '8-2']);
        $student = $this->createStudent(['class_id' => $class88->id]);

        $enrollment = StudentEnrollment::create([
            'user_id'            => $student->id,
            'class_name_id'      => $class88->id,
            'academic_period_id' => $this->activePeriod->id,
            'is_active'          => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/admin/enrollments/{$enrollment->id}/transfer-class", [
                'class_name_id' => $class82->id,
            ]);

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'from_class'    => '8-8',
                     'to_class'      => '8-2',
                     'class_name_id' => $class82->id,
                 ]);
    }

    public function test_users_class_id_synced_after_transfer()
    {
        $class88 = ClassName::create(['name' => '8-8']);
        $class82 = ClassName::create(['name' => '8-2']);
        $student = $this->createStudent(['class_id' => $class88->id]);

        $enrollment = StudentEnrollment::create([
            'user_id'            => $student->id,
            'class_name_id'      => $class88->id,
            'academic_period_id' => $this->activePeriod->id,
            'is_active'          => true,
        ]);

        $this->actingAs($this->admin)
            ->patchJson("/api/admin/enrollments/{$enrollment->id}/transfer-class", [
                'class_name_id' => $class82->id,
            ]);

        // Pastikan enrollment diupdate
        $this->assertDatabaseHas('student_enrollments', [
            'id'            => $enrollment->id,
            'class_name_id' => $class82->id,
        ]);

        // Pastikan users.class_id juga ikut diupdate (sync atomik)
        $this->assertDatabaseHas('users', [
            'id'       => $student->id,
            'class_id' => $class82->id,
        ]);
    }

    public function test_transfer_fails_if_same_class()
    {
        $class88 = ClassName::create(['name' => '8-8']);
        $student = $this->createStudent(['class_id' => $class88->id]);

        $enrollment = StudentEnrollment::create([
            'user_id'            => $student->id,
            'class_name_id'      => $class88->id,
            'academic_period_id' => $this->activePeriod->id,
            'is_active'          => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/admin/enrollments/{$enrollment->id}/transfer-class", [
                'class_name_id' => $class88->id,
            ]);

        $response->assertStatus(422)
                 ->assertJsonFragment([
                     'message' => 'Siswa sudah berada di kelas tersebut.',
                 ]);
    }

    public function test_transfer_fails_if_enrollment_not_active()
    {
        $class88 = ClassName::create(['name' => '8-8']);
        $class82 = ClassName::create(['name' => '8-2']);
        $student = $this->createStudent(['class_id' => $class88->id]);

        // Enrollment lama yang sudah tidak aktif
        $oldEnrollment = StudentEnrollment::create([
            'user_id'            => $student->id,
            'class_name_id'      => $class88->id,
            'academic_period_id' => $this->activePeriod->id,
            'is_active'          => false,
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/admin/enrollments/{$oldEnrollment->id}/transfer-class", [
                'class_name_id' => $class82->id,
            ]);

        // firstOrFail() pada is_active=true akan return 404
        $response->assertStatus(404);
    }

    public function test_transfer_fails_if_class_not_exist()
    {
        $class88 = ClassName::create(['name' => '8-8']);
        $student = $this->createStudent(['class_id' => $class88->id]);

        $enrollment = StudentEnrollment::create([
            'user_id'            => $student->id,
            'class_name_id'      => $class88->id,
            'academic_period_id' => $this->activePeriod->id,
            'is_active'          => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/admin/enrollments/{$enrollment->id}/transfer-class", [
                'class_name_id' => 99999, // tidak ada
            ]);

        $response->assertStatus(422);
    }

    public function test_transfer_fails_if_different_grade_level()
    {
        $class71 = ClassName::create(['name' => 'VII-1']);
        $class82 = ClassName::create(['name' => 'VIII-2']);
        $student = $this->createStudent(['class_id' => $class71->id]);

        $enrollment = StudentEnrollment::create([
            'user_id'            => $student->id,
            'class_name_id'      => $class71->id,
            'academic_period_id' => $this->activePeriod->id,
            'is_active'          => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/admin/enrollments/{$enrollment->id}/transfer-class", [
                'class_name_id' => $class82->id,
            ]);

        $response->assertStatus(422)
                 ->assertJsonFragment([
                     'message' => 'Transfer kelas hanya diperbolehkan ke rombel pada tingkat yang sama.',
                 ]);
    }
}
