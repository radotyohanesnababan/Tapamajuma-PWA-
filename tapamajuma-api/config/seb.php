<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Safe Exam Browser Configuration
    |--------------------------------------------------------------------------
    |
    | Di sinilah kita memetakan nilai dari file .env agar aman saat di-cache
    | oleh sistem production Laravel.
    |
    */

    'browser_exam_key' => env('SEB_BROWSER_EXAM_KEY', ''),
];