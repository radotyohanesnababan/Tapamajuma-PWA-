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
        Schema::create('certificate_batches', function (Blueprint $table) {
    $table->id();
    $table->string('type');
    // top_xp, top_activity, top_score_literacy,
    // top_score_numeracy, top_score_tka,
    // top_score_berhitung, top_attendance, manual

    $table->string('scope');
    // global, grade, class

    $table->string('scope_value')->nullable();
    // null = global, 'VII'/'VIII'/'IX' = grade, 'VII-A' = class

    $table->date('start_date')->nullable();
    $table->date('end_date')->nullable();
    $table->string('period_label');
    // teks bebas: '2024/2025 Semester 1'

    $table->enum('status', ['draft', 'printed', 'released'])->default('draft');
    $table->timestamp('released_at')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
