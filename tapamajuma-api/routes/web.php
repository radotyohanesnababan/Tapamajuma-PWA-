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
    
    // 1. Cari Data Gallery
    $gallery = \App\Models\Gallery::where('share_token', $token)->first();

    // Jika data tidak ketemu, lempar user ke halaman utama Frontend
    if (!$gallery) {
        return redirect('https://tapamajuma.my.id'); 
    }

    // 2. TENTUKAN GAMBAR THUMBNAIL (OG:IMAGE)
    // Default: Pakai logo aplikasi
    $imageUrl = "https://cdn.tapamajuma-api.my.id/images/iconappp.png"; 

    // Ambil URL atau File Path
    $urlOrPath = $gallery->url ?? $gallery->file_path; 
    
    // --- LOGIKA UTAMA ---

    // A. JIKA YOUTUBE (Ambil Thumbnail HD)
    if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/', $urlOrPath, $matches)) {
        $videoId = $matches[1];
        $imageUrl = "https://img.youtube.com/vi/{$videoId}/hqdefault.jpg";
    } 
    
    // B. JIKA GOOGLE DRIVE (Trik Ambil Thumbnail)
    elseif (preg_match('/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([-\w]+)/', $urlOrPath, $matches)) {
        $driveId = $matches[1];
        // URL Ajaib Google untuk thumbnail file publik (w=lebar)
        $imageUrl = "https://lh3.googleusercontent.com/d/{$driveId}=w1200";
    }

    // C. JIKA INSTAGRAM (Pakai Placeholder IG)
    elseif (strpos($urlOrPath, 'instagram.com') !== false || strpos($urlOrPath, 'instagr.am') !== false) {
        $imageUrl = "https://cdn.tapamajuma-api.my.id/images/ig-pld.png"; 
    }
     // C. JIKA Facebook (Pakai Placeholder IG)
    elseif (strpos($urlOrPath, 'facebook.com') !== false || strpos($urlOrPath, 'fb.watch') !== false || strpos($urlOrPath, 'fb.com') !== false) {
        $imageUrl = "https://cdn.tapamajuma-api.my.id/images/fb-pld.png"; 
    }

    // B. TIKTOK (Pakai OEmbed) - INI YANG BARU
    elseif (strpos($urlOrPath, 'tiktok.com') !== false) {
        try {
            // Laravel "nanya" ke TikTok
            $response = Http::timeout(3)->get("https://www.tiktok.com/oembed?url=" . $urlOrPath);
            
            if ($response->successful()) {
                // TikTok jawab JSON, kita ambil thumbnail_url
                $data = $response->json();
                $imageUrl = $data['thumbnail_url'] ?? $imageUrl;
            } else {
                // Kalau gagal/timeout, pakai placeholder
                $imageUrl = "https://cdn.tapamajuma-api.my.id/images/tiktok-pld.png";
            }
        } catch (\Exception $e) {
            // Kalau error koneksi, pakai placeholder
            $imageUrl = "https://cdn.tapamajuma-api.my.id/images/tiktok-pld.png";
        }
    }

    // E. JIKA TIKTOK (Pakai Placeholder TikTok - Opsional)
    elseif (strpos($urlOrPath, 'tiktok.com') !== false) {
        $imageUrl = "https://cdn.tapamajuma-api.my.id/images/tiktok-pld.png";
    }

    // F. JIKA GAMBAR UPLOAD (File Sendiri)
    elseif ($gallery->type == 'image' || preg_match('/\.(jpg|jpeg|png|webp|gif)$/i', $urlOrPath)) {
        if (str_starts_with($urlOrPath, 'http')) {
             $imageUrl = $urlOrPath;
        } else {
             $imageUrl = "https://cdn.tapamajuma-api.my.id/" . $urlOrPath;
        }
    }

    // G. JIKA PDF
    elseif ($gallery->type == 'pdf' || preg_match('/\.pdf$/i', $urlOrPath)) {
        $imageUrl = "https://cdn.tapamajuma-api.my.id/images/pdf-pld.png";
    }

    // H. JIKA AUDIO
    elseif ($gallery->type == 'audio' || preg_match('/\.(mp3|wav|ogg)$/i', $urlOrPath)) {
        $imageUrl = "https://cdn.tapamajuma-api.my.id/images/audio-pld.png";
    }

    // 3. SIAPKAN DATA LAINNYA
    $title = ($gallery->title ?? 'Karya Siswa') . " | TAPAMAJUMA";
    $description = "Lihat karya kreatif dari " . ($gallery->owner_name ?? 'Siswa') . " di platform TAPAMAJUMA.";
    $destinationUrl = "https://tapamajuma.my.id/s/" . $token;

    // 4. KIRIM KE VIEW
    return view('share_meta', compact('title', 'description', 'imageUrl', 'destinationUrl'));
});

require __DIR__.'/auth.php';
