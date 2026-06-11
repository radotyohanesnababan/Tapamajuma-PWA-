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
   Schema::create('certificates', function (Blueprint $table) {
    $table->id();
    $table->foreignId('batch_id')->constrained('certificate_batches')->cascadeOnDelete();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();

    $table->string('type');
    $table->string('scope');
    $table->string('scope_value')->nullable();

    $table->tinyInteger('rank');
    $table->string('score_label')->nullable();
    // nilai yang ditampilkan di sertifikat
    // contoh: '1.250 XP', '47 aktivitas', '320 poin'

    $table->string('period_label');
    $table->date('start_date')->nullable();
    $table->date('end_date')->nullable();

    $table->string('pdf_path')->nullable();
    $table->string('blockchain_tx', 100)->nullable();

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
