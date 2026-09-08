<?php

namespace Database\Seeders;

use App\Models\DeveloperUser;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DeveloperUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DeveloperUser::firstOrCreate(
            ['email' => 'developer@tapamajuma.id'],
            [
                'name'     => 'Developer Tapamajuma',
                'password' => Hash::make('password'),
            ]
        );
        
        $this->command->info('Developer user created: developer@tapamajuma.id / password');
    }
}
