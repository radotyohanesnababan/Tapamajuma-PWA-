<?php

namespace Database\Seeders;

use App\Models\AcademicPeriod;
use App\Models\StudentEnrollment;
use App\Models\User;
use Illuminate\Database\Seeder;

class StudentEnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil periode aktif yang sudah ada (dibuat via tinker sebelumnya)
        $period = AcademicPeriod::where('is_active', true)->first();

        if (!$period) {
            $this->command->error('Tidak ada academic period aktif. Buat dulu via tinker atau AcademicPeriodSeeder.');
            return;
        }

        $this->command->info("Menggunakan periode: {$period->name} (id: {$period->id})");

        // Ambil semua student yang punya class_id (role 'student' maupun 'siswa')
        $students = User::whereIn('role', ['student', 'siswa'])
            ->whereNotNull('class_id')
            ->get();

        $this->command->info("Ditemukan {$students->count()} student dengan class_id.");

        $created = 0;
        $skipped = 0;

        foreach ($students as $student) {
            // Cek sudah punya enrollment di periode ini atau belum
            $exists = StudentEnrollment::where('user_id', $student->id)
                ->where('academic_period_id', $period->id)
                ->exists();

            if ($exists) {
                $this->command->warn("Skip user id:{$student->id} ({$student->name}) — sudah punya enrollment.");
                $skipped++;
                continue;
            }

            StudentEnrollment::create([
                'user_id'            => $student->id,
                'class_name_id'      => $student->class_id,
                'academic_period_id' => $period->id,
                'is_active'          => true,
                'enrolled_at'        => now(),
            ]);

            $this->command->line("✓ {$student->name} (id:{$student->id}) → class_id:{$student->class_id}");
            $created++;
        }

        $this->command->info("Selesai. Dibuat: {$created}, Di-skip: {$skipped}.");
    }
}