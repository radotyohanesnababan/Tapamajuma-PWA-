<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Jalankan migrasi untuk memperbarui pilihan ENUM.
     */
    public function up(): void
    {
        // Menggunakan DB::statement untuk mengubah ENUM di MySQL
        // Kita menambahkan 'literacy' dan 'numeracy' ke dalam daftar pilihan
        DB::statement("ALTER TABLE daily_activities MODIFY COLUMN type ENUM('literacy', 'numeracy', 'berhitung', 'membaca', 'bercerita','tka') NOT NULL");
    }

    /**
     * Kembalikan perubahan jika migrasi di-rollback.
     */
    public function down(): void
    {
        // Mengembalikan ke pilihan ENUM yang lama
        DB::statement("ALTER TABLE daily_activities MODIFY COLUMN type ENUM('berhitung', 'membaca', 'bercerita') NOT NULL");
    }
};