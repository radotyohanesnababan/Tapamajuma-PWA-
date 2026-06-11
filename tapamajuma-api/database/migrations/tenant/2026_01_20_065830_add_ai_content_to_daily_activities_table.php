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
    Schema::table('daily_activities', function (Blueprint $table) {
        // Menyimpan teks bacaan atau soal yang dihasilkan Gemini
        $table->text('reading_content')->nullable()->after('subject');
    });
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
