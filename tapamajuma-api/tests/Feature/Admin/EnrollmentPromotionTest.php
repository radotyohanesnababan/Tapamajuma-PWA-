<?php

namespace Tests\Feature\Admin;

use App\Models\AcademicPeriod;
use App\Models\ClassName;
use App\Models\StudentEnrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TenantTestCase;

class EnrollmentPromotionTest extends TenantTestCase
{
    use WithFaker;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->createAdmin();
    }

    public function test_admin_can_view_promotion_preview()
    {
        $this->activePeriod->update(['semester' => 'ganjil']);

        $class = ClassName::create(['name' => 'VII-A']);
        $student = $this->createStudent();
        
        StudentEnrollment::create([
            'user_id' => $student->id,
            'class_name_id' => $class->id,
            'academic_period_id' => $this->activePeriod->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->getJson('/api/admin/enrollments/promotion-preview');

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'next_class_name' => 'VII-A', // Karena ganjil, tetap VII-A
                 ]);
    }

    public function test_admin_can_promote_all_students_ganjil_to_genap()
    {
        $this->activePeriod->update(['semester' => 'ganjil']);

        $class = ClassName::create(['name' => 'VII-A']);
        $student = $this->createStudent();
        
        $enrollment = StudentEnrollment::create([
            'user_id' => $student->id,
            'class_name_id' => $class->id,
            'academic_period_id' => $this->activePeriod->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->postJson('/api/admin/enrollments/promote-all');

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Promote selesai.',
                     'updated' => 1,
                 ]);

        $this->assertDatabaseHas('student_enrollments', [
            'id' => $enrollment->id,
            'next_class_id' => $class->id, // Tetap di kelas yang sama
        ]);
    }

    public function test_admin_can_promote_all_students_genap_to_ganjil()
    {
        $this->activePeriod->update(['semester' => 'genap']);

        $class7A = ClassName::create(['name' => 'VII-A']);
        $class8A = ClassName::create(['name' => 'VIII-A']);
        $class9A = ClassName::create(['name' => 'IX-A']);
        
        $student1 = $this->createStudent();
        $student2 = $this->createStudent();
        
        $enrollment1 = StudentEnrollment::create([
            'user_id' => $student1->id,
            'class_name_id' => $class7A->id,
            'academic_period_id' => $this->activePeriod->id,
            'is_active' => true,
        ]);

        $enrollment2 = StudentEnrollment::create([
            'user_id' => $student2->id,
            'class_name_id' => $class9A->id,
            'academic_period_id' => $this->activePeriod->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->postJson('/api/admin/enrollments/promote-all');

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Promote selesai.',
                     'updated' => 1,
                     'lulus' => 1,
                 ]);

        $this->assertDatabaseHas('student_enrollments', [
            'id' => $enrollment1->id,
            'next_class_id' => $class8A->id,
        ]);

        $this->assertDatabaseHas('student_enrollments', [
            'id' => $enrollment2->id,
            'next_class_id' => null, // Lulus
        ]);
    }

    public function test_admin_can_set_next_class_manually()
    {
        $class1 = ClassName::create(['name' => 'VII-A']);
        $class2 = ClassName::create(['name' => 'VIII-A']);
        
        $student = $this->createStudent();
        
        $enrollment = StudentEnrollment::create([
            'user_id' => $student->id,
            'class_name_id' => $class1->id,
            'academic_period_id' => $this->activePeriod->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->patchJson("/api/admin/enrollments/{$enrollment->id}/set-next-class", [
            'next_class_id' => $class2->id,
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'next_class_id' => $class2->id,
                 ]);

        $this->assertDatabaseHas('student_enrollments', [
            'id' => $enrollment->id,
            'next_class_id' => $class2->id,
        ]);
    }

    public function test_admin_can_enroll_student_to_active_period()
    {
        $class = ClassName::create(['name' => 'VII-A']);
        $student = $this->createStudent();

        $response = $this->actingAs($this->admin)->postJson('/api/admin/enrollments/enroll', [
            'user_id' => $student->id,
            'class_name_id' => $class->id,
        ]);

        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'message' => 'Siswa berhasil didaftarkan.',
                 ]);

        $this->assertDatabaseHas('student_enrollments', [
            'user_id' => $student->id,
            'class_name_id' => $class->id,
            'academic_period_id' => $this->activePeriod->id,
            'is_active' => true,
        ]);
    }
}
