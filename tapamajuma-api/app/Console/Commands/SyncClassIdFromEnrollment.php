<?php

namespace App\Console\Commands;

use App\Models\AcademicPeriod;
use App\Models\StudentEnrollment;
use App\Models\User;
use Illuminate\Console\Command;

class SyncClassIdFromEnrollment extends Command
{
    protected $signature = 'enrollment:sync-class-id';
    protected $description = 'Sync users.class_id dari enrollment aktif';

    public function handle()
    {
        $period = AcademicPeriod::current();

        if (!$period) {
            $this->error('Tidak ada periode aktif!');
            return;
        }

        $count = 0;
        StudentEnrollment::where('academic_period_id', $period->id)
            ->where('is_active', true)
            ->chunk(100, function ($enrollments) use (&$count) {
                foreach ($enrollments as $e) {
                    User::where('id', $e->user_id)
                        ->update(['class_id' => $e->class_name_id]);
                    $count++;
                }
            });

        $this->info("Sync selesai! {$count} siswa diupdate.");
    }
}
