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
        Schema::create('self_study_sessions', function (Blueprint $table) {
            $table->id();
    
    // Siapa guru yang mencatat/mengawasi sesi ini?
    $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
    
    // Sesi ini untuk kelas apa? (Contoh: "7A")
    $table->string('class_group'); 
    
    // Kapan sesi ini terjadi?
    $table->dateTime('started_at'); 
    
    // (Opsional) Cache jumlah kehadiran biar query dashboard cepat
    $table->integer('total_present')->default(0); 
    
    // (Opsional) Topik atau Catatan Guru tentang sesi ini
    $table->text('topic')->nullable(); 

    $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('self_study_sessions');
    }
};
