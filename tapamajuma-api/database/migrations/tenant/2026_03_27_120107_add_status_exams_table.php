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
                Schema::table('exams', function (Blueprint $table) {
            // Status: draft (siap tapi belum mulai), active (token rilis), closed (selesai)
            $table->enum('status', ['draft', 'active', 'closed'])->default('draft');
            $table->dropColumn('is_active');
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            
        });
    }
};
