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
    Schema::table('galleries', function (Blueprint $table) {
        // Token unik acak, nullable (kosong = private), dan di-index biar cepat carinya
        $table->string('share_token', 64)->nullable()->unique()->after('file_type');
        
        // Opsional: Hitung berapa kali link dilihat
        $table->bigInteger('views_count')->default(0)->after('share_token');
    });
}

public function down()
{
    Schema::table('galleries', function (Blueprint $table) {
        $table->dropColumn(['share_token', 'views_count']);
    });
}
};
