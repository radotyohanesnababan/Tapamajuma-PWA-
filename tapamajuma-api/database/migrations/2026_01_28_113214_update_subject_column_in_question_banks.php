<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('question_banks', function (Blueprint $table) {
        // 1. Tambah kolom ID (Nullable dulu buat migrasi data lama kalau perlu)
        $table->foreignId('subject_id')->nullable()->after('creator_id')->constrained('subjects')->onDelete('cascade');
        
        // 2. Hapus kolom string lama
        $table->dropColumn('subject');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('question_banks', function (Blueprint $table) {
            //
        });
    }
};
