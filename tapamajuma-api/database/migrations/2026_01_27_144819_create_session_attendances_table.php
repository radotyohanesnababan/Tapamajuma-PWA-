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
        Schema::create('session_attendances', function (Blueprint $table) {
           $table->id();
    
    // Relasi ke Header Sesi (Tabel No. 2)
    $table->foreignId('session_id')->constrained('self_study_sessions')->onDelete('cascade');
    
    // Relasi ke Siswa (Tabel No. 1)
    $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
    
    // Status Kehadiran
    // true = Hadir/Aktif, false = Tidak Aktif (jika ingin mencatat yang bolos juga)
    $table->boolean('is_active')->default(true); 
    
    // (Opsional) Jika ingin mencatat detail perilaku
    $table->string('notes')->nullable(); 

    $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('session_attendances');
    }
};
