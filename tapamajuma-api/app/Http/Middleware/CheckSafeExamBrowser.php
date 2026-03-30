<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CheckSafeExamBrowser
{
    public function handle(Request $request, Closure $next)
    {
        // 1. Cek User-Agent (Tambahkan string kosong default agar terhindar dari error Null di PHP 8)
        $userAgent = $request->header('User-Agent', '');

        file_put_contents(
            public_path('seb_intel.txt'), 
            date('H:i:s') . " | IP: " . $request->ip() . " | UA: " . $userAgent . PHP_EOL, 
            FILE_APPEND
        );

        Log::info('Sedang dicek oleh Middleware SEB:', [
            'IP' => $request->ip(),
            'User-Agent-Masuk' => $userAgent
        ]);
        
        // Gunakan preg_match agar lebih fleksibel membaca versi SEB
        if (!preg_match('/(SafeExamBrowser|SEB)/i', $userAgent)) {
            return response()->json(['message' => 'Akses ditolak. Gunakan Safe Exam Browser!'], 403);
        }

        // 2. Cek Browser Exam Key (BEK)
        $incomingHash = $request->header('X-SafeExamBrowser-RequestHash');
        $bek = config('seb.browser_exam_key'); // Pastikan BEK persis sama dengan yang di Config Tool
        
        // Dapatkan URL penuh yang sedang direquest (termasuk http/https dan query param)
        $currentUrl = $request->fullUrl();

        // RUMUS RAHASIA SEB: SHA256 dari gabungan URL dan BEK
        $expectedHash = hash('sha256', $currentUrl . $bek);

        // Bandingkan Hash dari SEB dengan Hash buatan Laravel
        // Bandingkan Hash dari SEB dengan Hash buatan Laravel
        if ($incomingHash !== $expectedHash) {
            
            // =========================================================
            // JURUS HACKER PART 2: Catat data Hash ke file TXT
            // =========================================================
            $logData = "=== WAKTU: " . date('H:i:s') . " ===" . PHP_EOL;
            $logData .= "URL di Laravel   : " . $currentUrl . PHP_EOL;
            $logData .= "BEK di Laravel   : " . $bek . PHP_EOL;
            $logData .= "Hash bawaan SEB  : " . $incomingHash . PHP_EOL;
            $logData .= "Hash dari Laravel: " . $expectedHash . PHP_EOL;
            $logData .= "----------------------------------------" . PHP_EOL;

            file_put_contents(public_path('seb_hash.txt'), $logData, FILE_APPEND);

            // Response error kembalikan seperti biasa
            return response()->json([
                'message' => 'Konfigurasi SEB tidak valid atau telah dimodifikasi!',
            ], 403);
        }

        return $next($request);
    }
}