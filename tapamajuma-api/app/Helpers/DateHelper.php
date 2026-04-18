<?php
namespace App\Helpers;

class DateHelper
{
    public static function todayRangeWIB()
{
    if (config('app.timezone') === 'UTC') {
        return [
            now('Asia/Jakarta')->startOfDay()->utc(),
            now('Asia/Jakarta')->endOfDay()->utc(),
        ];
    }

    return [
        now()->startOfDay(),
        now()->endOfDay(),
    ];
}
}
