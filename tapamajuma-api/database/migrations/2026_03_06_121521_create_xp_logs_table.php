<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('xp_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('xp');

            // Sumber XP: 'daily_activity' | 'gallery' | 'attendance'
            $table->string('source');

            // ID record sumber untuk keperluan audit/tracing
            $table->unsignedBigInteger('source_id')->nullable();

            $table->timestamps();

            // Index untuk query riwayat per user
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('xp_logs');
    }
};
