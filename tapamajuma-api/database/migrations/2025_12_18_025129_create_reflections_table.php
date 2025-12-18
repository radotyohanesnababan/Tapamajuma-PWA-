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
        Schema::create('reflections', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('activity_id')->nullable()->constrained('daily_activities'); 
    $table->enum('category', ['harian', 'mingguan']);
    $table->text('content'); // Strategi berpikir atau jawaban refleksi
    $table->text('feedback_teacher')->nullable(); // Masukan dari guru
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reflections');
    }
};
