<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
    Schema::table('question_banks', function (Blueprint $table) {
        // 1. Tambah Foreign Key ke tabel class_names
        $table->foreignId('class_id')->nullable()->after('subject_id')->constrained('class_names')->onDelete('cascade');
        
        // 2. Hapus kolom string lama
        $table->dropColumn('target_class');
    });
}

public function down()
{
    Schema::table('question_banks', function (Blueprint $table) {
        $table->string('target_class')->nullable();
        $table->dropForeign(['class_id']);
        $table->dropColumn('class_id');
    });
}
};
