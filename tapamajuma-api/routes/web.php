<?php

use Illuminate\Foundation\Support\Providers\RouteServiceProvider;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});
Route::get('/cek-hantu', function () {
    $url = config('app.url');
    $frontend = config('app.frontend_url') ?? env('FRONTEND_URL');
    
    return [
        'APP_URL_VALUE' => $url,
        'APP_URL_LENGTH' => strlen($url), // PENTING: Jika panjangnya beda dengan jumlah huruf, berarti ada spasi/enter
        'FRONTEND_URL_VALUE' => $frontend,
        'FRONTEND_URL_LENGTH' => strlen($frontend),
        
    ];
});

require __DIR__.'/auth.php';
