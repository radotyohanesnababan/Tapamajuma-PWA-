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
        $table->foreignId('academic_period_id')
              ->nullable()
              ->after('subject_id')
              ->constrained('academic_periods')
              ->nullOnDelete();
    });
}

public function down(): void
{
    Schema::table('galleries', function (Blueprint $table) {
        $table->dropForeign(['academic_period_id']);
        $table->dropColumn('academic_period_id');
    });
}
};
