<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('session_attendances', function (Blueprint $table) {
            $table->unsignedTinyInteger('nilai')->default(0)->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('session_attendances', function (Blueprint $table) {
            $table->dropColumn('nilai');
        });
    }
};
