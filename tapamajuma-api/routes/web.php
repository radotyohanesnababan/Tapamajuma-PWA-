<?php

use Illuminate\Foundation\Support\Providers\RouteServiceProvider;
use Illuminate\Support\Facades\Route;
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
    
    // 1. Cari Data
    $gallery = Gallery::where('share_token', $token)->first();

    if (!$gallery) {
        return redirect('https://tapamajuma.my.id'); 
    }

    // 2. LOGIKA DETEKSI GAMBAR / YOUTUBE
    $imageUrl = $gallery->file_path; // Default ambil dari file path
    
    // Cek apakah ini Link YouTube?
    if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/', $gallery->url ?? $gallery->file_path, $matches)) {
        // Jika YouTube, ambil thumbnail otomatis dari Google
        $videoId = $matches[1];
        $imageUrl = "https://img.youtube.com/vi/{$videoId}/hqdefault.jpg";
    } 
    // Jika bukan YouTube, tapi path gambar biasa
    elseif (!str_starts_with($imageUrl, 'http')) {
        $imageUrl = "https://cdn.tapamajuma-api.my.id/" . $imageUrl;
    }

    $title = ($gallery->title ?? 'Karya Siswa') . " | TAPAMAJUMA";
    $description = "Lihat karya dari " . ($gallery->owner_name ?? 'Siswa') . " di TAPAMAJUMA.";
    $destinationUrl = "https://tapamajuma.my.id/s/" . $token;

    return view('share_meta', compact('title', 'description', 'imageUrl', 'destinationUrl'));
});

require __DIR__.'/auth.php';
