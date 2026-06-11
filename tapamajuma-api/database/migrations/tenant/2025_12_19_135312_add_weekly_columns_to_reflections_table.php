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
    Schema::table('reflections', function (Blueprint $table) {
        // Kolom untuk Aksi Mingguan (B.1)
        $table->text('improvements')->nullable()->after('content'); // Apa yang sudah membaik?
        $table->text('targets')->nullable()->after('improvements');  // Apa target minggu depan?
        
        // Ubah activity_id jadi nullable agar bisa diisi tanpa harus ada activity harian
        $table->unsignedBigInteger('activity_id')->nullable()->change();
    });
}

public function down()
{
    Schema::table('reflections', function (Blueprint $table) {
        $table->dropColumn(['improvements', 'targets']);
    });
}
};
