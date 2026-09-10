<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            if (!Schema::hasColumn('announcements', 'title')) {
                $table->string('title')->nullable()->after('id');
            }
            if (!Schema::hasColumn('announcements', 'target_role')) {
                $table->enum('target_role', ['all', 'teacher', 'student'])->default('all')->after('content');
            }
        });
    }

    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            if (Schema::hasColumn('announcements', 'title')) {
                $table->dropColumn('title');
            }
            if (Schema::hasColumn('announcements', 'target_role')) {
                $table->dropColumn('target_role');
            }
        });
    }
};
