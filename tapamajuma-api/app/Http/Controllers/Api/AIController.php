<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIController extends Controller
{
  public function generate(Request $request)
{
    $validated = $request->validate([
        'subject' => 'required|string',
        'type' => 'required|in:literacy,numeracy',
    ]);

    try {
        $apiKey = env('GEMINI_API_KEY');

        // Pastikan API Key tersedia
        if (!$apiKey) {
            return response()->json(['error' => 'GEMINI_API_KEY tidak ditemukan di .env'], 500);
        }
        $subject = $validated['subject'];
        $type = $validated['type'];
        $model = "gemini-2.5-flash"; 
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        $prompt = ($type === 'literacy') 
            ? "Buatkan teks literasi pendek (maks 150 kata) untuk siswa SMP tentang salah satu teori di mata pelajaran $subject. Sesuaikan dengan mata pelajaran dan teknis yang sederhana. Berikan satu pertanyaan refleksi tentang bacaan tersebut. Jangan buat juga ada huruf tebal, semua huruf biasa saja. Khusus untuk Pelajaran Bahasa Inggris, buat saja teks dalam bahasa Inggris."
            : "Buatkan satu soal numerasi kontekstual tentang $subject untuk siswa SMP di Tapanuli Utara. Berikan petunjuk langkah berpikirnya.";
        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->post($url, [
                'contents' => [['parts' => [['text' => $prompt]]]]
            ]);
/** @var \Illuminate\Http\Client\Response $response */
        $result = $response->json();

        // 1. Cek apakah ada error dari Google API
        if (isset($result['error'])) {
            return response()->json([
                'error' => 'API Error: ' . $result['error']['message'],
                'details' => $result['error']
            ], 400);
        }
        // Cek jika model tidak ditemukan, coba fallback ke 'gemini-pro'
        if ($response->status() === 404) {
            $fallbackModel = "gemini-2.5-flash";
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$fallbackModel}:generateContent?key={$apiKey}";
            $response = Http::post($url, [
                'contents' => [['parts' => [['text' => $prompt]]]]
            ]);
            /** @var \Illuminate\Http\Client\Response $response */
            $result = $response->json();
        }

        // 2. Cek apakah 'candidates' ada (Validasi kunci agar tidak error lagi)
        if (!isset($result['candidates']) || empty($result['candidates'])) {
            // Log response lengkap untuk debugging di storage/logs/laravel.log
            Log::error('Gemini Response Missing Candidates:', $result);
            
            return response()->json([
                'error' => 'AI tidak dapat menghasilkan konten. Coba ganti mata pelajaran atau periksa API Key.',
                'raw' => $result
            ], 500);
        }

        // 3. Ambil konten teks
        $content = $result['candidates'][0]['content']['parts'][0]['text'] ?? 'Konten kosong';

        return response()->json(['content' => $content]);

    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}
}
