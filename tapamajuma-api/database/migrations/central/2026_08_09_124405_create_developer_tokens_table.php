<?php
// database/migrations/xxxx_create_developer_tokens_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'central';

    public function up(): void
    {
        Schema::connection('central')->create('developer_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('developer_user_id')->constrained('developer_users')->cascadeOnDelete();
            $table->string('token', 64)->unique(); // hasil hash SHA-256
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection('central')->dropIfExists('developer_tokens');
    }
};