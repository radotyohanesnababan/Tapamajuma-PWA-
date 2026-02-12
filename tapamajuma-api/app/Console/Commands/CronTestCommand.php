<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CronTestCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:cron'; // Nama perintahnya
protected $description = 'Cek apakah cron jalan atau tidak';

public function handle()
{
    // Dia bakal nulis pesan ke storage/logs/laravel.log
    \Log::info("DETEKTIF CRON: Saya ngetuk pintu pada " . now());
}
}
