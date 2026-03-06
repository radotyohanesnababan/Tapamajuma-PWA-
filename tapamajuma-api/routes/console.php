<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


Schedule::command('report:weekly')
        ->weeklyOn(5, '17:00')
        ->timezone('Asia/Jakarta');

Schedule::call(function () {
    DB::table('cache')->where('expiration', '<', now()->timestamp)->delete();
})->daily()->timezone('Asia/Jakarta');


//Schedule::command('report:weekly')->everyMinute()->withoutOverlapping();;
//Schedule::command('test:cron')->everyMinute();