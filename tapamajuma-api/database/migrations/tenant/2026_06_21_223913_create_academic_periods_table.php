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
        Schema::create('academic_periods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // contoh: "2025/2026 - Ganjil"
            $table->enum('semester', ['ganjil', 'genap']);
            $table->string('academic_year'); // contoh: "2025/2026"
            $table->boolean('is_active')->default(false);
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            // Hanya boleh ada satu periode aktif dalam satu waktu —
            // enforce ini di level aplikasi (service/observer), bukan DB constraint,
            // karena MySQL/TiDB tidak punya partial unique index native.
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('academic_periods');
    }
};