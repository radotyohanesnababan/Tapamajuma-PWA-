<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('question_banks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade'); // Guru pembuat
            $table->string('subject'); // Mapel (Matematika, IPA, dll)
            $table->string('target_class'); // Kelas (7A, 8B, dll)
            $table->text('question_text'); // Soal
            $table->json('options'); // Menyimpan {"A": "...", "B": "...", "C": "..."}
            $table->string('correct_key'); // Kunci (A, B, atau C)
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('question_banks');
    }
};