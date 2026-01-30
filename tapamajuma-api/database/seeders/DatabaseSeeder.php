<?php

namespace Database\Seeders;

// Pastikan Model sudah di-import atau dibuat
use App\Models\User;
use App\Models\ClassName; // Asumsi nama model: ClassName
use App\Models\Subject;   // Asumsi nama model: Subject
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ==========================================
        // 1. SEED MATA PELAJARAN (SUBJECTS)
        // ==========================================
        $subjects = [
            'Matematika',
            'Bahasa Indonesia',
            'Bahasa Inggris',
            'Ilmu Pengetahuan Alam (IPA)',
            'Ilmu Pengetahuan Sosial (IPS)',
            'Pendidikan Pancasila dan Kewarganegaraan (PPKn)',
            'Pendidikan Agama',
            'PJOK'
        ];

        foreach ($subjects as $subjectName) {
            // Pakai firstOrCreate agar tidak duplikat saat seeder dijalankan ulang
            Subject::firstOrCreate(
                ['name' => $subjectName]
            );
        }

        // ==========================================
        // 2. SEED DAFTAR KELAS (CLASS_NAMES)
        // ==========================================
        // Logic: VII-1 s.d VII-7, VIII-1 s.d VIII-7, IX-1 s.d IX-6
        
        $classList = [];

        // Buat VII-1 sampai VII-7
        for ($i = 1; $i <= 7; $i++) {
            $classList[] = "VII-$i";
        }
        // Buat VIII-1 sampai VIII-7
        for ($i = 1; $i <= 7; $i++) {
            $classList[] = "VIII-$i";
        }
        // Buat IX-1 sampai IX-6
        for ($i = 1; $i <= 6; $i++) {
            $classList[] = "IX-$i";
        }

        foreach ($classList as $className) {
            ClassName::firstOrCreate(
                ['name' => $className]
            );
        }

        // ==========================================
        // 3. SEED USERS (ADMIN & SISWA)
        // ==========================================
        
        // Buat Superadmin
        User::firstOrCreate(
            ['email' => 'admin@tapamajuma.id'],
            [
                'name' => 'Superadmin',
                'password' => Hash::make('password'),
                'role' => 'superadmin', // Ganti 'teacher' jadi 'superadmin' biar sesuai
                'nis' => null,
                'level' => 'admin',
                'class_id' => null,
                // Admin bisa akses semua kelas (Logic sementara ambil ID 1-3)
                'accessible_classes' => [1, 2, 3], 
                'email_verified_at' => now(),
            ]
        );

        // Buat Siswa Percobaan (Masuk ke Kelas ID 1 yaitu VII-1)
        User::firstOrCreate(
            ['email' => 'siswa@tapamajuma.id'],
            [
                'name' => 'Siswa Percobaan',
                'password' => Hash::make('password'),
                'role' => 'student', // Pastikan sesuai enum di database
                'nis' => '12345678',
                'level' => '1',
                'class_id' => 1, // Pasti aman karena ClassName ID 1 sudah dibuat di atas
                'accessible_classes' => [1],
                'email_verified_at' => now(),
            ]
        );
    }
}