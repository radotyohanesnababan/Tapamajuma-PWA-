<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('student_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('class_name_id')->constrained('class_names')->cascadeOnDelete();
            $table->foreignId('academic_period_id')->constrained('academic_periods')->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->date('enrolled_at')->nullable();
            $table->date('left_at')->nullable(); // diisi kalau siswa pindah/keluar di tengah periode
            $table->timestamps();

            // Satu siswa hanya boleh punya 1 enrollment aktif per periode.
            // Ini constraint yang BISA di-enforce di DB karena tidak butuh partial index.
            $table->unique(['user_id', 'academic_period_id'], 'unique_enrollment_per_period');

            $table->index(['class_name_id', 'academic_period_id']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_enrollments');
    }
};