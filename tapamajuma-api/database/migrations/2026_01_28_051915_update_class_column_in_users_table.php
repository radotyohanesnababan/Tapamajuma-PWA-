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
        Schema::table('users', function (Blueprint $table) {
        // 1. Hapus kolom string lama (opsional, backup dulu datanya jika perlu)
        $table->dropColumn('class_name'); 
        
        // 2. Tambah kolom Foreign Key untuk SISWA
        // Nullable karena Guru/Admin tidak punya kelas spesifik
        $table->foreignId('class_id')->nullable()->constrained('class_names')->nullOnDelete();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
        });
    }
};
