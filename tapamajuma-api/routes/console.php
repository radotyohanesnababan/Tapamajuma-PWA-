<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


Schedule::command('report:weekly')
        ->weeklyOn(5, '17:00')
        ->timezone('Asia/Jakarta');

//Schedule::command('report:weekly')->everyMinute();