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
            ? "Buatkan teks literasi pendek (maks 100 kata) untuk siswa SMP tentang salah satu teori di mata pelajaran $subject. Sesuaikan dengan mata pelajaran dan teknis yang sederhana. Berikan satu pertanyaan refleksi tentang bacaan tersebut. Jangan buat juga ada huruf tebal, semua huruf biasa saja. Khusus untuk Pelajaran Bahasa Inggris, buat saja teks dalam bahasa Inggris."
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

/**
     * Fungsi bantuan internal untuk men-generate Insight Laporan
     * Bisa dipanggil dari controller manapun tanpa melalui Route API.
     */
   public static function generateReportInsights($data)
    {
        try {
            $apiKey = env('GEMINI_API_KEY');
            if (!$apiKey) {
                return ["Fitur Insight cerdas belum aktif karena API Key tidak ditemukan."];
            }

            // Susun Prompt baru yang mengkombinasikan Partisipasi (Kuantitas) dan Skor (Kualitas)
            $prompt = "Kamu adalah konsultan pendidikan analitik. Analisis data aktivitas siswa SMP berikut dari sisi tingkat partisipasi dan kualitas pemahaman (rata-rata nilai maksimal 100):\n";
            $prompt .= "- Literasi: {$data['literasi_count']} kegiatan, Rata-rata Nilai: {$data['literasi_avg']}\n";
            $prompt .= "- Numerasi: {$data['numerasi_count']} kegiatan, Rata-rata Nilai: {$data['numerasi_avg']}\n";
            $prompt .= "- TKA (Tes Akademik): {$data['tka_count']} kegiatan, Rata-rata Nilai: {$data['tka_avg']}\n";
            $prompt .= "Berikan 3 poin masukan evaluasi dan rekomendasi tindakan konkrit untuk Kepala Sekolah. Fokus pada perbandingan antara kuantitas kegiatan dan kualitas nilainya. Format kalimat harus profesional, langsung ke poinnya, maksimal 2 kalimat per poin, dan JANGAN gunakan format bintang/tebal/markdown.";

            $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}";

            $response = \Illuminate\Support\Facades\Http::withHeaders(['Content-Type' => 'application/json'])
                ->post($url, [
                    'contents' => [['parts' => [['text' => $prompt]]]]
                ]);
                /** @var \Illuminate\Http\Client\Response $response */
            if ($response->successful()) {
                $resultText = $response->json('candidates.0.content.parts.0.text');
                $cleanedText = str_replace('*', '', $resultText ?? '');
                return array_filter(explode("\n", trim($cleanedText)));
            }

            return ["AI gagal merumuskan analisis (Status: " . $response->status() . ")."];

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Gemini Insight Error: ' . $e->getMessage());
            return ["Sistem AI sedang sibuk. Silakan evaluasi manual berdasarkan data tabel di atas."];
        }
    }
}
