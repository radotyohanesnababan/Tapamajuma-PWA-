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
        Schema::table('exams', function (Blueprint $table) {
        // --- Bagian TOKEN ---
        $table->string('token', 6)->nullable(); 
        $table->timestamp('token_released_at')->nullable();
        $table->integer('token_lifetime')->default(15); // Menit sebelum token refresh

        // --- Bagian FILTER SOAL (Hybrid Selection) ---
        // Menyimpan array tipe soal yang boleh ditarik, misal: ["official", "numeracy"]
        $table->json('allowed_question_types')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            //
        });
    }
};
