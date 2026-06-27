<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void
{
    Schema::table('student_enrollments', function (Blueprint $table) {
        $table->foreignId('next_class_id')
              ->nullable()
              ->after('is_active')
              ->constrained('class_names')
              ->nullOnDelete();
    });
}

public function down(): void
{
    Schema::table('student_enrollments', function (Blueprint $table) {
        $table->dropForeign(['next_class_id']);
        $table->dropColumn('next_class_id');
    });
}
};
