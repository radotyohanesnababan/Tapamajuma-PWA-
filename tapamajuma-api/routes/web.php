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
    // 1. Cari data berdasarkan token
    // Asumsi: Token disimpan di kolom 'share_token' pada tabel 'galleries'
    $data = Gallery::where('share_token', $token)->first(); 
    
    // Jika tidak ketemu, lempar ke homepage frontend
    if (!$data) {
        return redirect('https://tapamajuma.my.id'); 
    }

    // 2. Siapkan Data untuk Meta Tag
    // Pastikan path gambar menggunakan CDN atau URL lengkap
    $imageUrl = $data->file_path;
    
    // Cek apakah path sudah ada http-nya atau belum (biar gak double)
    if (!str_starts_with($imageUrl, 'http')) {
        $imageUrl = "https://cdn.tapamajuma-api.my.id/" . $imageUrl;
    }

    $title = ($data->title ?? 'Karya Siswa') . " | TAPAMAJUMA";
    $description = "Lihat karya dari " . ($data->owner_name ?? 'Siswa') . " di TAPAMAJUMA.";
    
    // 3. URL Tujuan (Frontend React)
    // Ini adalah link asli tempat user melihat kontennya
    $destinationUrl = "https://tapamajuma.my.id/s/" . $token;

    // 4. Return View Pancingan
    return view('share_meta', compact('title', 'description', 'imageUrl', 'destinationUrl'));
});

require __DIR__.'/auth.php';
