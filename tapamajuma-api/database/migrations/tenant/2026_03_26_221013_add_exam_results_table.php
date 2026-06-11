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
       Schema::create('exam_results', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
    $table->integer('total_questions');
    $table->integer('correct_answers');
    $table->integer('wrong_answers');
    $table->decimal('score', 5, 2); // Skor 0-100 dengan 2 angka di belakang koma
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
