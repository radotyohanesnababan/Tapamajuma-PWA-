<?php

use Illuminate\Foundation\Support\Providers\RouteServiceProvider;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use App\Models\Gallery;

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


Route::get('/s/{token}', function ($token) {
    
    // ✅ TAMBAHKAN INI DI PALING ATAS
    $userAgent = strtolower(request()->userAgent() ?? '');
    $bots = ['whatsapp', 'facebookexternalhit', 'twitterbot', 'telegrambot', 'linkedinbot', 'slackbot'];
    $isBot = collect($bots)->contains(fn($b) => str_contains($userAgent, $b));

    // 1. Cari Data Gallery
    $gallery = \App\Models\Gallery::where('share_token', $token)->first();

    if (!$gallery) {
        return redirect('https://tapamajuma.my.id'); 
    }

    // ... semua logic thumbnail kamu tetap sama ...

    // 4. BEDAKAN RESPONSE
    if ($isBot) {
        // Bot → dapat HTML OG tags (view share_meta seperti sekarang)
        return view('share_meta', compact('title', 'description', 'imageUrl', 'destinationUrl'));
    }

    // User biasa → langsung redirect ke FE, tidak perlu lihat HTML
    return redirect($destinationUrl);
});

require __DIR__.'/auth.php';
