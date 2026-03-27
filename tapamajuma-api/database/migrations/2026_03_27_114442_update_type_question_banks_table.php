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
        Schema::table('question_banks', function (Blueprint $table) {
            DB::statement("ALTER TABLE question_banks MODIFY COLUMN type ENUM('literacy', 'numeracy', 'tka', 'official') DEFAULT 'tka'");
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
