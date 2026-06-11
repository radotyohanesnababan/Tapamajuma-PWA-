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
        Schema::create('exam_sessions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
    
    // Menyimpan urutan ID soal dalam bentuk JSON: [12, 45, 3, 22...]
    $table->json('question_order'); 
    
    // Menyimpan jawaban sementara secara Real-time (Auto-save)
    // Format JSON: {"12": "A", "45": "C", ...}
    $table->json('student_answers')->nullable(); 
    
    $table->timestamp('started_at');
    $table->timestamp('finished_at')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
