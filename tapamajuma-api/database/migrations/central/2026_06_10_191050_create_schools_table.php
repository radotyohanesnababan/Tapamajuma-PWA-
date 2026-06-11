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
    Schema::create('schools', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('slug')->unique();
        $table->string('domain')->nullable();

        // Tenant DB credentials
        $table->string('db_host');
        $table->string('db_name');
        $table->string('db_user');
        $table->text('db_password'); // akan di-encrypt

        // R2
        $table->string('r2_prefix');

        // Info sekolah
        $table->string('address')->nullable();
        $table->string('phone')->nullable();
        $table->string('email')->nullable();

        // Kepala sekolah & pengelola
        $table->string('principal_name')->nullable();
        $table->string('principal_nip')->nullable();
        $table->string('manager_name')->nullable();
        $table->string('manager_nip')->nullable();

        // Assets path di R2
        $table->string('logo_path')->nullable();
        $table->string('principal_signature_path')->nullable();
        $table->string('manager_signature_path')->nullable();
        $table->string('stamp_path')->nullable();

        // Config flexible
        $table->json('config')->nullable();

        $table->boolean('is_active')->default(true);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schools');
    }
};
