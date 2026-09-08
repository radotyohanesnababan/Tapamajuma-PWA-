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
        // Format: VII-A s.d VII-G, VIII-A s.d VIII-G, IX-A s.d IX-F
        
        $classList = [];

        // Buat VII-A sampai VII-G
        $alphabet7 = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        foreach ($alphabet7 as $letter) {
            $classList[] = "VII-$letter";
        }
        
        // Buat VIII-A sampai VIII-G
        $alphabet8 = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        foreach ($alphabet8 as $letter) {
            $classList[] = "VIII-$letter";
        }
        
        // Buat IX-A sampai IX-F
        $alphabet9 = ['A', 'B', 'C', 'D', 'E', 'F'];
        foreach ($alphabet9 as $letter) {
            $classList[] = "IX-$letter";
        }

        $classIds = [];
        foreach ($classList as $className) {
            $cls = ClassName::firstOrCreate(
                ['name' => $className]
            );
            $classIds[] = $cls->id;
        }

        // ==========================================
        // 3. SEED USERS (ADMIN, GURU, & SISWA)
        // ==========================================
        
        // Buat Superadmin
        $admin = User::firstOrCreate(
            ['email' => 'admin@tapamajuma.id'],
            [
                'name' => 'Superadmin',
                'password' => Hash::make('password'),
                'role' => 'superadmin',
                'nis' => null,
                'level' => 'admin',
                'class_id' => null,
                'accessible_classes' => $classIds, 
                'email_verified_at' => now(),
            ]
        );

        // Buat Guru
        $teacher = User::firstOrCreate(
            ['email' => 'guru@tapamajuma.id'],
            [
                'name' => 'Guru Percobaan',
                'password' => Hash::make('password'),
                'role' => 'teacher',
                'nis' => null,
                'level' => 'guru',
                'class_id' => null,
                'accessible_classes' => $classIds,
                'email_verified_at' => now(),
            ]
        );

        // Buat Siswa Percobaan (Masuk ke Kelas ID 1 yaitu VII-A)
        $student = User::firstOrCreate(
            ['email' => 'siswa@tapamajuma.id'],
            [
                'name' => 'Siswa Percobaan',
                'password' => Hash::make('password'),
                'role' => 'student',
                'nis' => '12345678',
                'level' => '1',
                'class_id' => 1,
                'accessible_classes' => [1],
                'email_verified_at' => now(),
            ]
        );

        $activePeriod = \App\Models\AcademicPeriod::current();
        if (!$activePeriod) {
            $activePeriod = \App\Models\AcademicPeriod::create([
                'name'          => 'Semester Ganjil Dummy',
                'semester'      => 'ganjil',
                'academic_year' => now()->year . '/' . (now()->year + 1),
                'is_active'     => true,
                'opened_at'     => now(),
            ]);
        }

        if ($activePeriod) {
            \App\Models\StudentEnrollment::firstOrCreate([
                'user_id'            => $student->id,
                'class_name_id'      => $student->class_id,
                'academic_period_id' => $activePeriod->id,
            ], [
                'is_active'          => true,
                'enrolled_at'        => now(),
            ]);
        }

        // ==========================================
        // 4. SEED BANK SOAL (QUESTION BANK)
        // ==========================================
        
        $subjectMat = Subject::where('name', 'Matematika')->first();
        $classViiA = ClassName::where('name', 'VII-A')->first();

        if ($subjectMat && $classViiA && $teacher) {
            \App\Models\QuestionBank::firstOrCreate(
                ['question_text' => 'Berapakah 5 + 5?'],
                [
                    'creator_id' => $teacher->id,
                    'subject_id' => $subjectMat->id,
                    'class_id' => $classViiA->id,
                    'options' => ['8', '9', '10', '11'],
                    'correct_key' => '10',
                    'type' => 'tka'
                ]
            );
            
            \App\Models\QuestionBank::firstOrCreate(
                ['question_text' => 'Berapakah 10 * 2?'],
                [
                    'creator_id' => $teacher->id,
                    'subject_id' => $subjectMat->id,
                    'class_id' => $classViiA->id,
                    'options' => ['20', '30', '12', '22'],
                    'correct_key' => '20',
                    'type' => 'tka'
                ]
            );
        }
    }
}