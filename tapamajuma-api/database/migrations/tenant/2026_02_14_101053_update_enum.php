<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Menggunakan DB::statement untuk mengubah ENUM di MySQL
        // Kita menambahkan 'literacy' dan 'numeracy' ke dalam daftar pilihan
        DB::statement("ALTER TABLE daily_activities MODIFY COLUMN type ENUM('literacy', 'numeracy', 'berhitung', 'membaca', 'bercerita','tka') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('daily_activities', function (Blueprint $table) {
            //
        });
    }
};
