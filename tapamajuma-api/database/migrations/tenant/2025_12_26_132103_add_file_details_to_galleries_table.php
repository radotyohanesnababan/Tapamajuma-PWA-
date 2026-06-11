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
        Schema::table('galleries', function (Blueprint $table) {
            // Kolom untuk menyimpan path file (Gambar/Audio/PDF)
            // Kita gunakan 'file_path' sebagai nama kolom utamanya
            if (!Schema::hasColumn('galleries', 'file_path')) {
                $table->string('file_path')->after('title');
            }

            // Kolom untuk menentukan tipe file agar React tahu cara menampilkannya
            // Isinya nanti: 'image', 'audio', atau 'pdf'
            if (!Schema::hasColumn('galleries', 'file_type')) {
                $table->string('file_type', 20)->after('file_path');
            }
            
            // Memastikan kolom activity_id boleh kosong (nullable) 
            // karena tidak semua karya harus nempel ke aktivitas harian
            $table->foreignId('activity_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('galleries', function (Blueprint $table) {
            $table->dropColumn(['file_path', 'file_type']);
        });
    }
};