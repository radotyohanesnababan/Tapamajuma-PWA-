<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\User; // Sesuaikan dengan model User kamu
use App\Models\DailyActivity; // Jangan lupa import model Kegiatan/Aktivitas
use Illuminate\Support\Facades\DB;

class SendWeeklyReport extends Command
{
    protected $signature = 'report:weekly';
    protected $description = 'Kirim laporan mingguan siswa ke orang tua via WhatsApp menggunakan Wablas/Fonnte';


    public function handle()
    {
        $this->info('🚀 Memulai pengiriman laporan mingguan...');

        // 1. Ambil Siswa yang punya No HP
        // Tips: Tambahkan ->where('role', 'student') jika sistemmu punya guru/admin
        $users = User::whereNotNull('phone_number')->get();
        
        // 2. Set Rentang Waktu (Minggu Ini)
        $startOfWeek = now()->startOfWeek();
        $endOfWeek   = now()->endOfWeek();

        foreach ($users as $user) {
            $this->info("Sedang memproses: {$user->name}...");

            // --- A. HITUNG KEGIATAN MANDIRI (RUMAH) ---
            // Sumber: Table daily_activities
            $mandiriActivities = DailyActivity::where('user_id', $user->id)
                ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
                ->get(); // Ambil datanya dulu

            $totalMandiri = $mandiriActivities->count();
            
            // Hitung Rata-rata Nilai (Jika ada kolom score)
            $avgScore = $totalMandiri > 0 ? round($mandiriActivities->avg('score'), 1) : 0;
            
            // Cek Mapel Favorit (Literasi/Numerasi)
            // Mengambil tipe terbanyak yang dikerjakan
            if ($totalMandiri > 0) {
                // 1. Grouping berdasarkan kolom 'subject'
                $topSubject = $mandiriActivities
                    ->whereNotNull('subject') // Pastikan subject tidak null
                    ->where('subject', '!=', '') // Pastikan subject tidak string kosong
                    ->groupBy('subject')      // Kelompokkan per nama mapel
                    ->map->count()            // Hitung jumlah aktivitas per mapel
                    ->sortDesc()              // Urutkan dari yang paling sering
                    ->keys()                  // Ambil nama-nama mapelnya
                    ->first();                // Ambil urutan pertama (Juara 1)
                
                // Fallback: Jika ternyata kolom subject kosong semua, baru ambil dari 'type'
                if (!$topSubject) {
                     $topSubject = $mandiriActivities->groupBy('type')->map->count()->sortDesc()->keys()->first();
                }
            } else {
                $topSubject = '-';
            }
            // --- B. HITUNG KEGIATAN SEKOLAH (PAGI) ---
            // Sumber: Tabel Pivot (session_students / nama tabelmu)
            // Pastikan ganti 'session_students' dengan NAMA TABEL PIVOT ASLIMU
            $totalSekolah = DB::table('session_attendances') // Ganti dengan tabel pivot yang benar
                ->where('student_id', $user->id) // Kolom student_id di pivot
                ->where('is_active', 1) // Hanya hitung yang aktif/hadir
                ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
                ->count();


            // --- C. LOGIKA STATUS & KESIMPULAN ---
            $totalAktivitas = $totalMandiri + $totalSekolah;

            if ($totalAktivitas == 0) {
                $status = "Tidak Aktif 😴";
                $pesanSemangat = "Mohon bimbingan lebih intensif di rumah.";
            } elseif ($avgScore >= 80) {
                $status = "Sangat Membanggakan 🌟";
                $pesanSemangat = "Nilai yang luar biasa! Pertahankan.";
            } elseif ($totalAktivitas >= 5) {
                $status = "Rajin & Konsisten ✅";
                $pesanSemangat = "Terima kasih sudah aktif belajar. Lanjutkan!";
            } else {
                $status = "Perlu Ditingkatkan ⚠️";
                $pesanSemangat = "Mohon bimbingan lebih intensif di rumah.";
            }

            // --- D. SUSUN PESAN WHATSAPP ---
            $message =  "Halo, Orang Tua dari *{$user->name}*! 👋\n\n" .
                        "Laporan Belajar Minggu Ini:\n" .
                        "📅 " . $startOfWeek->format('d M') . " - " . $endOfWeek->format('d M Y') . "\n\n" .
                        "📊 *Ringkasan Aktivitas:*\n" .
                        "🏫 Sekolah (Pagi): {$totalSekolah}x Aktif Di Kelas\n" .
                        "🏠 Mandiri (Rumah): {$totalMandiri} Sesi\n" .
                        "----------------------------\n" .
                        "∑  *TOTAL: {$totalAktivitas} Aktivitas*\n\n" .
                        "📝 *Detail Prestasi Tugas Mandiri:*\n" .
                        "- Rata-rata Nilai: *{$avgScore}*\n" .
                        "- Fokus Mapel: " . ucwords($topSubject) . "\n\n" .
                        "💡 Status: {$status}\n" .
                        "💬 _{$pesanSemangat}_\n\n" .
                        
                        "_*Tapamajuma* - Pemantauan Aktivitas Siswa_";

            // // --- E. KIRIM KE WABLAS ---
            // try {
            //     $response = Http::withHeaders([
            //         'Authorization' => env('WABLAS_TOKEN'),
            //     ])->post(env('WABLAS_DOMAIN') . '/send', [
            //         'target' => $user->phone_number,
            //         'message' => $message,
            //         'countryCode' => '62', // Auto ubah 08 jadi 62
            //     ]);

            //     // Casting ke string & decode manual (Anti-Error)
            //     $res = json_decode((string)$response, true);

            //     if (($res['status'] ?? false) == true || ($res['detail'] ?? '') == 'success') {
            //         $this->info("✅ Terkirim ke {$user->name}");
            //     } else {
            //         $this->error("⚠️ Gagal ke {$user->name}: " . ($res['reason'] ?? 'Unknown'));
            //     }
                
            //     // Jeda 2 detik agar tidak dianggap SPAM oleh WA
            //     sleep(10);

            // } catch (\Exception $e) {
            //     $this->error("❌ Error Koneksi: " . $e->getMessage());
            // }

            // --- E. KIRIM KE WABLAS ---
try {
    $token = env('WABLAS_TOKEN');
    $secret = env('WABLAS_SECRET_KEY');
    $apiUrl = rtrim(env('WABLAS_DOMAIN'), '/') . '/api/send-message';

    // Gabungkan Token dan Secret pakai titik sesuai dokumentasi
    $authHeader = $token . "." . $secret;
    
    /** @var Response $response */
    $response = Http::withHeaders([
        'Authorization' => $authHeader,
    ])
    ->asForm() // PENTING: Dokumentasi pakai http_build_query, jadi kita pakai asForm()
    ->post($apiUrl, [
        'phone'   => $user->phone_number,
        'message' => $message,
        'flag'    => 'instant', // Sesuai dokumentasi kamu
    ]);

    $res = $response->json();

    if ($response->successful() && ($res['status'] ?? false) == true) {
        $this->info("✅ Terkirim ke {$user->name}");
    } else {
        $this->error("⚠️ Gagal ke {$user->name}: " . json_encode($res));
    }
    
    sleep(2); // Jeda aman

} catch (\Exception $e) {
    $this->error("❌ Error: " . $e->getMessage());
}
        }

        $this->info("🎉 Selesai! Laporan mingguan terkirim.");
    }
}