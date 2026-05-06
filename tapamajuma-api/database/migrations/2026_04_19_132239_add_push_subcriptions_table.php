<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   // database/migrations/xxxx_create_push_subscriptions_table.php
public function up(): void
{
    Schema::create('push_subscriptions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->string('endpoint', 500);
        $table->string('public_key', 500);
        $table->string('auth_token', 500);
        $table->timestamps();

        $table->unique('endpoint');
        // satu device = satu subscription
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
