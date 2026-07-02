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
        Schema::table('self_study_sessions', function (Blueprint $table) {
            Schema::table('self_study_sessions', function (Blueprint $table) {
            // Ubah nama kolom dari class_group menjadi class_name
            $table->renameColumn('class_group', 'class_name');
        });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('self_study_sessions', function (Blueprint $table) {
            // Kembalikan ke nama lama jika rollback
            $table->renameColumn('class_name', 'class_group');
        });
    }
};
