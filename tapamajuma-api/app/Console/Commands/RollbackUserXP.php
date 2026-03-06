<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RollbackUserXP extends Command
{
    protected $signature = 'xp:rollback
                            {--key= : Snapshot key (timestamp) yang mau di-restore. Kosongkan untuk pakai snapshot terbaru.}
                            {--list : Tampilkan semua snapshot yang tersedia}';

    protected $description = 'Rollback xp_points & xp_logs ke snapshot sebelumnya.';

    public function handle(): void
    {
        // Cek tabel snapshot ada atau tidak
        if (!DB::getSchemaBuilder()->hasTable('xp_snapshots')) {
            $this->error('❌ Belum ada snapshot. Jalankan dulu: php artisan xp:recalculate --backup');
            return;
        }

        // Tampilkan daftar snapshot
        if ($this->option('list')) {
            $this->listSnapshots();
            return;
        }

        // Tentukan snapshot key yang dipakai
        $key = $this->option('key');

        if (!$key) {
            // Pakai snapshot terbaru
            $latest = DB::table('xp_snapshots')
                ->orderByDesc('snapshot_key')
                ->value('snapshot_key');

            if (!$latest) {
                $this->error('❌ Tidak ada snapshot tersedia.');
                return;
            }

            $key = $latest;
            $this->warn("Tidak ada --key, menggunakan snapshot terbaru: {$key}");
        }

        // Konfirmasi
        if (!$this->confirm("⚠️  Rollback ke snapshot [{$key}]? Data XP saat ini akan ditimpa.")) {
            $this->info('Rollback dibatalkan.');
            return;
        }

        $this->info("🔄 Memulai rollback ke snapshot: {$key}");

        DB::beginTransaction();
        try {
            // 1. Restore xp_points ke users
            $snapshots = DB::table('xp_snapshots')
                ->where('snapshot_key', $key)
                ->get();

            foreach ($snapshots as $snap) {
                User::where('id', $snap->user_id)
                    ->update(['xp_points' => $snap->xp_points]);
            }

            $this->info("   ✅ xp_points di-restore untuk {$snapshots->count()} siswa.");

            // 2. Kosongkan xp_logs saat ini
            DB::table('xp_logs')->delete();

            // 3. Restore xp_logs dari snapshot
            $logSnapshots = DB::table('xp_log_snapshots')
                ->where('snapshot_key', $key)
                ->get();

            $logsToRestore = $logSnapshots->map(fn($l) => [
                'user_id'    => $l->user_id,
                'xp'         => $l->xp,
                'source'     => $l->source,
                'source_id'  => $l->source_id,
                'created_at' => $l->created_at,
                'updated_at' => $l->created_at,
            ])->toArray();

            if (!empty($logsToRestore)) {
                // Insert per chunk agar tidak timeout di prod
                foreach (array_chunk($logsToRestore, 500) as $chunk) {
                    DB::table('xp_logs')->insert($chunk);
                }
            }

            $this->info("   ✅ xp_logs di-restore ({$logSnapshots->count()} entri).");

            DB::commit();
            $this->newLine();
            $this->info("✅ Rollback ke snapshot [{$key}] berhasil!");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("❌ Rollback gagal: {$e->getMessage()}");
        }
    }

    private function listSnapshots(): void
    {
        $snapshots = DB::table('xp_snapshots')
            ->select('snapshot_key', DB::raw('COUNT(*) as total_siswa'), DB::raw('SUM(xp_points) as total_xp'), DB::raw('MIN(created_at) as dibuat_pada'))
            ->groupBy('snapshot_key')
            ->orderByDesc('snapshot_key')
            ->get();

        if ($snapshots->isEmpty()) {
            $this->warn('Belum ada snapshot tersedia.');
            return;
        }

        $this->table(
            ['Snapshot Key', 'Total Siswa', 'Total XP', 'Dibuat Pada'],
            $snapshots->map(fn($s) => [
                $s->snapshot_key,
                $s->total_siswa,
                $s->total_xp,
                $s->dibuat_pada,
            ])->toArray()
        );

        $this->newLine();
        $this->info("Gunakan: php artisan xp:rollback --key=<snapshot_key>");
    }
}