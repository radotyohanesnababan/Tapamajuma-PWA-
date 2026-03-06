<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\DailyActivity;
use App\Models\Gallery;
use App\Models\SessionAttendance;
use App\Models\XpLog;
use App\Services\XpService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RecalculateUserXp extends Command
{
    protected $signature = 'xp:recalculate
                            {--user= : Recalculate hanya untuk user_id tertentu (opsional)}
                            {--dry-run : Simulasi tanpa menyimpan ke database}
                            {--backup : Backup xp_points & xp_logs sebelum recalculate}';

    protected $description = 'Hitung ulang XP semua siswa dari data historis (daily_activities, galleries, attendances). Aman dijalankan berkali-kali.';

    public function handle(): void
    {
        $isDryRun     = $this->option('dry-run');
        $targetUserId = $this->option('user');
        $withBackup   = $this->option('backup');

        if ($isDryRun) {
            $this->warn('⚠️  MODE DRY-RUN: Tidak ada data yang disimpan.');
        }

        // =====================================================
        // BACKUP sebelum recalculate
        // =====================================================
        if ($withBackup && !$isDryRun) {
            $this->backup();
        }

        $this->info('🔄 Mulai recalculate XP dari data historis...');
        $this->newLine();

        // Ambil semua siswa (role = student) atau 1 user jika pakai --user
        $query = User::where('role', 'student');
        if ($targetUserId) {
            $query->where('id', $targetUserId);
        }

        $users = $query->get();
        $this->info("Total siswa: {$users->count()}");
        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        $totalXpAwarded = 0;

        foreach ($users as $user) {
            $userXp = 0;

            DB::beginTransaction();
            try {
                // =====================================================
                // SUMBER 1: daily_activities
                // =====================================================
                $activities = DailyActivity::where('user_id', $user->id)->get();

                foreach ($activities as $activity) {
                    $xp = XpService::fromActivity(
                        score:      (int) ($activity->score ?? 0),
                        confidence: (int) ($activity->confidence_level ?? 3),
                    );

                    if (!$isDryRun) {
                        // insertOrIgnore: skip jika sudah ada (idempotent via unique index)
                        DB::table('xp_logs')->insertOrIgnore([
                            'user_id'    => $user->id,
                            'xp'         => $xp,
                            'source'     => 'daily_activity',
                            'source_id'  => $activity->id,
                            'created_at' => $activity->created_at,
                            'updated_at' => $activity->created_at,
                        ]);
                    }

                    $userXp += $xp;
                }

                // =====================================================
                // SUMBER 2: galleries
                // =====================================================
                $galleries = Gallery::where('user_id', $user->id)->get();

                foreach ($galleries as $gallery) {
                    if (!$isDryRun) {
                        DB::table('xp_logs')->insertOrIgnore([
                            'user_id'    => $user->id,
                            'xp'         => XpService::XP_GALLERY,
                            'source'     => 'gallery',
                            'source_id'  => $gallery->id,
                            'created_at' => $gallery->created_at,
                            'updated_at' => $gallery->created_at,
                        ]);
                    }

                    $userXp += XpService::XP_GALLERY;
                }

                // =====================================================
                // SUMBER 3: session_attendances (absensi hadir)
                // =====================================================
                $attendances = SessionAttendance::where('student_id', $user->id)
                    ->where('is_active', true)
                    ->get();

                foreach ($attendances as $attendance) {
                    if (!$isDryRun) {
                        DB::table('xp_logs')->insertOrIgnore([
                            'user_id'    => $user->id,
                            'xp'         => XpService::XP_ATTENDANCE,
                            'source'     => 'attendance',
                            'source_id'  => $attendance->id,
                            'created_at' => $attendance->created_at,
                            'updated_at' => $attendance->created_at,
                        ]);
                    }

                    $userXp += XpService::XP_ATTENDANCE;
                }

                // =====================================================
                // Update total xp_points di tabel users
                // (Hitung dari xp_logs agar akurat, bukan dari $userXp saja)
                // =====================================================
                if (!$isDryRun) {
                    $totalFromLogs = DB::table('xp_logs')
                        ->where('user_id', $user->id)
                        ->sum('xp');

                    User::where('id', $user->id)->update(['xp_points' => $totalFromLogs]);
                }

                DB::commit();
                $totalXpAwarded += $userXp;

            } catch (\Exception $e) {
                DB::rollBack();
                $this->newLine();
                $this->error("❌ Error pada user_id={$user->id}: {$e->getMessage()}");
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        if ($isDryRun) {
            $this->warn("🔍 DRY-RUN selesai. Total XP yang AKAN diberikan: {$totalXpAwarded}");
            $this->info("Jalankan tanpa --dry-run untuk menyimpan ke database.");
        } else {
            $this->info("✅ Recalculate selesai! Total XP diberikan: {$totalXpAwarded}");
        }
    }

    /**
     * Backup xp_points (dari users) dan xp_logs ke tabel snapshot.
     * Snapshot disimpan dengan timestamp agar bisa rollback ke titik tertentu.
     */
    private function backup(): void
    {
        $timestamp = now()->format('YmdHis');
        $this->info("📦 Membuat backup dengan timestamp: {$timestamp}");

        // Pastikan tabel snapshot ada
        if (!DB::getSchemaBuilder()->hasTable('xp_snapshots')) {
            DB::statement('
                CREATE TABLE xp_snapshots (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    snapshot_key VARCHAR(20) NOT NULL,
                    user_id BIGINT UNSIGNED NOT NULL,
                    xp_points INT UNSIGNED NOT NULL DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ');

            DB::statement('
                CREATE TABLE xp_log_snapshots (
                    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    snapshot_key VARCHAR(20) NOT NULL,
                    user_id BIGINT UNSIGNED NOT NULL,
                    xp INT UNSIGNED NOT NULL,
                    source VARCHAR(50) NOT NULL,
                    source_id BIGINT UNSIGNED NULL,
                    created_at TIMESTAMP NULL
                )
            ');

            $this->info("   Tabel snapshot dibuat otomatis.");
        }

        // Snapshot xp_points dari users
        $users = User::where('role', 'student')->get(['id', 'xp_points']);
        $snapshotData = $users->map(fn($u) => [
            'snapshot_key' => $timestamp,
            'user_id'      => $u->id,
            'xp_points'    => $u->xp_points,
            'created_at'   => now(),
        ])->toArray();

        DB::table('xp_snapshots')->insert($snapshotData);

        // Snapshot xp_logs
        $logs = DB::table('xp_logs')->get();
        $logSnapshotData = $logs->map(fn($l) => [
            'snapshot_key' => $timestamp,
            'user_id'      => $l->user_id,
            'xp'           => $l->xp,
            'source'       => $l->source,
            'source_id'    => $l->source_id,
            'created_at'   => $l->created_at,
        ])->toArray();

        if (!empty($logSnapshotData)) {
            DB::table('xp_log_snapshots')->insert($logSnapshotData);
        }

        $this->info("   ✅ Backup selesai. Gunakan 'php artisan xp:rollback --key={$timestamp}' untuk rollback.");
        $this->newLine();
    }
}