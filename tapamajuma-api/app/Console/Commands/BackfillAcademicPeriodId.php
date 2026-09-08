<?php

namespace App\Console\Commands;

use App\Models\AcademicPeriod;
use App\Models\DailyActivity;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackfillAcademicPeriodId extends Command
{
    protected $signature = 'backfill:academic-period
                            {--dry-run : Tampilkan jumlah data yang akan di-update tanpa benar-benar mengubahnya}
                            {--table= : Pilih tabel spesifik: daily_activities, galleries, atau all (default: all)}';

    protected $description = 'Labeli data lama (academic_period_id = NULL) berdasarkan tanggal created_at vs rentang periode akademik';

    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');
        $tableOpt = $this->option('table') ?? 'all';

        // Ambil semua periode, urutkan dari terlama
        $periods = AcademicPeriod::orderBy('opened_at')->get();

        if ($periods->isEmpty()) {
            $this->error('Tidak ada AcademicPeriod ditemukan di database.');
            return self::FAILURE;
        }

        $this->info("Ditemukan {$periods->count()} periode akademik:");
        foreach ($periods as $p) {
            $closed = $p->closed_at ? $p->closed_at->format('d M Y') : 'sekarang';
            $this->line("  [{$p->id}] {$p->name} {$p->academic_year}  ({$p->opened_at->format('d M Y')} - {$closed})");
        }
        $this->newLine();

        $tables = match ($tableOpt) {
            'daily_activities' => ['daily_activities'],
            'galleries'        => ['galleries'],
            default            => ['daily_activities', 'galleries'],
        };

        $totalUpdated = 0;

        foreach ($tables as $table) {
            $this->info("--- Tabel: <fg=cyan>{$table}</>");

            foreach ($periods as $period) {
                $start = $period->opened_at;
                $end   = $period->closed_at ?? now();

                $query = DB::table($table)
                    ->whereNull('academic_period_id')
                    ->whereBetween('created_at', [$start, $end]);

                $count = $query->count();

                if ($count === 0) {
                    $this->line("  [{$period->name}] Tidak ada data NULL dalam rentang ini.");
                    continue;
                }

                if ($isDryRun) {
                    $this->warn("  [DRY-RUN] [{$period->name}] Akan update {$count} baris → academic_period_id = {$period->id}");
                } else {
                    $query->update(['academic_period_id' => $period->id]);
                    $this->info("  ✓ [{$period->name}] {$count} baris di-update → academic_period_id = {$period->id}");
                    $totalUpdated += $count;
                }
            }

            // Sisa data di luar rentang semua periode
            $orphans = DB::table($table)->whereNull('academic_period_id')->count();
            if ($orphans > 0) {
                $this->warn("  ⚠ {$orphans} baris di <fg=yellow>{$table}</> masih NULL (di luar rentang semua periode).");
            }

            $this->newLine();
        }

        if (!$isDryRun) {
            $this->info("Selesai. Total {$totalUpdated} baris di-update.");
        } else {
            $this->comment('Dry-run selesai. Jalankan tanpa --dry-run untuk benar-benar mengubah data.');
        }

        return self::SUCCESS;
    }
}
