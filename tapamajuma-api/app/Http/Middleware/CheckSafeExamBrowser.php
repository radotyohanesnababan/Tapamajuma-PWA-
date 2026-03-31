<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckSafeExamBrowser
{
    public function handle(Request $request, Closure $next)
    {
        // 1. Ambil KTP Browser (User-Agent)
        $userAgent = $request->header('User-Agent', '');

        // 2. Cek apakah ada kata "SafeExamBrowser" atau "SEB" di KTP-nya
        if (!preg_match('/(SafeExamBrowser|SEB)/i', $userAgent)) {
            // Kalau buka pakai Chrome/Edge biasa, TENDANG!
            return response()->json([
                'message' => 'Akses ditolak. Gunakan Safe Exam Browser!'
            ], 403);
        }

        // 3. Kalau dia pakai SEB, LANGSUNG IZINKAN MASUK! (BEK Hash dihapus)
        return $next($request);
    }
}