<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Cek Admin: Jika email admin sudah ada, SKIP buat baru (pakai data lama).
        // Jika belum ada, baru buat.
        User::firstOrCreate(
            ['email' => 'admin@tapamajuma.id'], // Kunci pengecekan
            [
                'name' => 'Superadmin',
                'password' => Hash::make('password'),
                'role' => 'superadmin',
                'nis' => null,
                'level' => '1',
                'class_id' => null,
                'accessible_classes' => [1, 2, 3],
                'email_verified_at' => now(),
            ]
        );
        User::firstOrCreate(
            ['email' => 'admin1@tapamajuma.id'], // Kunci pengecekan
            [
                'name' => 'Superadmin',
                'password' => 'password',
                'role' => 'superadmin',
                'nis' => null,
                'level' => '1',
                'class_id' => null,
                'accessible_classes' => [1, 2, 3],
                'email_verified_at' => now(),
            ]
        );
         User::firstOrCreate(
            ['email' => 'teacher@tapamajuma.id'], // Kunci pengecekan
            [
                'name' => 'Teacher',
                'password' => Hash::make('password'),
                'role' => 'teacher',
                'nis' => null,
                'level' => '1',
                'class_id' => null,
                'accessible_classes' => [1, 2, 3],
                'email_verified_at' => now(),
            ]
        );

        // 2. Cek Siswa: Jika email siswa belum ada, buat baru.
        User::firstOrCreate(
            ['email' => 'siswa@tapamajuma.id'], // Kunci pengecekan
            [
                'name' => 'Siswa Percobaan',
                'password' => Hash::make('password'),
                'role' => 'student',
                'nis' => '12345678',
                'level' => '1',
                'class_id' => null,
                'accessible_classes' => [1],
                'email_verified_at' => now(),
            ]
        );
    }
}