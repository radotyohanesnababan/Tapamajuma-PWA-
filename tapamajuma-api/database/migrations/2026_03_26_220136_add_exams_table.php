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
        Schema::create('exams', function (Blueprint $table) {
    $table->id();
    $table->string('title'); // Contoh: UTS Matematika Ganjil
    $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
    $table->integer('duration_minutes')->default(90);
    $table->dateTime('start_time'); 
    $table->dateTime('end_time');
    $table->integer('total_questions')->default(40);
    $table->string('seb_config_key')->nullable(); // Simpan Hash dari Safe Exam Browser di sini
    $table->boolean('is_active')->default(true);
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
