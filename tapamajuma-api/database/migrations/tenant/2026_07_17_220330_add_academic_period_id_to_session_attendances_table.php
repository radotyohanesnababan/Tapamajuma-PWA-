<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('session_attendances', function (Blueprint $table) {
            $table->foreignId('academic_period_id')
                  ->nullable()
                  ->after('nilai')
                  ->constrained('academic_periods')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('session_attendances', function (Blueprint $table) {
            $table->dropForeign(['academic_period_id']);
            $table->dropColumn(['nilai', 'academic_period_id']);
        });
    }
};
