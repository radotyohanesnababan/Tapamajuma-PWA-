<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\User; 
use App\Models\DailyActivity; 
use Illuminate\Support\Facades\DB;

class SendWeeklyReport extends Command
{
    protected $signature = 'report:weekly';
    protected $description = 'Kirim laporan mingguan siswa ke orang tua via WhatsApp dengan perbandingan rata-rata kelas';

    public function handle()
    {
        $this->info('🚀 Memulai pengiriman laporan mingguan...');

        $startOfWeek = now()->startOfWeek();
        $endOfWeek   = now()->endOfWeek();

        // 1. PRE-CALCULATE: Hitung rata-rata kelas untuk minggu ini sekaligus agar database tidak jebol
        $this->info('📊 Menghitung rata-rata kelas...');
        $classAveragesRaw = DB::table('daily_activities')
            ->join('users', 'daily_activities.user_id', '=', 'users.id')
            ->whereBetween('daily_activities.created_at', [$startOfWeek, $endOfWeek])
            ->select(
                'users.class_id',
                'daily_activities.type',
                DB::raw('ROUND(AVG(daily_activities.score), 1) as avg_score')
            )
            ->groupBy('users.class_id', 'daily_activities.type')
            ->get();

        // Ubah format data agar mudah dicari: $classAverages[class_id][type] = skor
        $classAverages = [];
        foreach ($classAveragesRaw as $row) {
            if ($row->class_id) {
                $classAverages[$row->class_id][$row->type] = $row->avg_score;
            }
        }

        // 2. Ambil Siswa beserta relasi kelasnya
        $users = User::where('role', 'student')
            ->whereNotNull('phone_number')
            ->with('studentClass') // Menggunakan relasi yang sudah kamu buat
            ->get();

        foreach ($users as $user) {
// --- A. HITUNG KEGIATAN MANDIRI & SEKOLAH ---
            $className = $user->studentClass ? $user->studentClass->name : '-';
            $classId = $user->class_id;

            // 1. Kegiatan Mandiri (Rumah)
            $mandiriActivities = DailyActivity::where('user_id', $user->id)
                ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
                ->get();
            
            $totalMandiri = $mandiriActivities->count();
            $avgScore = $totalMandiri > 0 ? round($mandiriActivities->avg('score'), 1) : 0;

            // 2. Rincian Skor Individu
            $litSkor = round($mandiriActivities->where('type', 'literacy')->avg('score') ?? 0, 1);
            $numSkor = round($mandiriActivities->where('type', 'numeracy')->avg('score') ?? 0, 1);
            $tkaSkor = round($mandiriActivities->where('type', 'tka')->avg('score') ?? 0, 1);

            // 3. Kegiatan Sekolah (Pagi) - Pastikan nama tabel pivot-nya benar
            $totalSekolah = DB::table('session_attendances') 
                ->where('student_id', $user->id)
                ->where('is_active', 1) 
                ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
                ->count();

            $totalAktivitas = $totalMandiri + $totalSekolah;

            // --- B. AMBIL RATA-RATA KELAS (Dari Pre-Calculate di luar loop) ---
            // Catatan: Pastikan variabel $classAverages sudah dihitung di luar loop foreach
            $classLit = $classAverages[$classId]['literacy'] ?? 0;
            $classNum = $classAverages[$classId]['numeracy'] ?? 0;
            $classTka = $classAverages[$classId]['tka'] ?? 0;

            // --- C. LOGIKA STATUS & KESIMPULAN ---
            if ($totalAktivitas == 0) {
                $status = "Tidak Aktif 😴";
                $pesanSemangat = "Kami belum melihat aktivitas minggu ini. Mohon bimbingan lebih intensif di rumah ya, Bapak/Ibu.";
            } elseif ($avgScore >= 80 && $totalAktivitas >= 5) {
                $status = "Sangat Membanggakan 🌟";
                $pesanSemangat = "Luar biasa! Keaktifan dan nilainya sangat baik. Mari kita pertahankan prestasi ini!";
            } elseif ($totalAktivitas >= 5) {
                $status = "Rajin & Konsisten ✅";
                $pesanSemangat = "Terima kasih sudah aktif belajar. Coba tingkatkan lagi skornya di minggu depan!";
            } else {
                $status = "Perlu Ditingkatkan ⚠️";
                $pesanSemangat = "Sudah mulai belajar, tapi yuk tambah lagi frekuensinya agar hasilnya lebih maksimal.";
            }

            // --- D. SUSUN PESAN WHATSAPP INTERAKTIF ---
            $message =  "Halo, Orang Tua dari *{$user->name}*! 👋\n\n" .
                        "Berikut adalah laporan belajar dari aplikasi TAPAMAJUMA:\n" .
                        "📅 " . $startOfWeek->format('d M') . " - " . $endOfWeek->format('d M Y') . "\n" .
                        "🏫 Kelas: *{$className}*\n\n" .
                        
                        "📊 *Ringkasan Aktivitas:*\n" .
                        "• Sekolah (Pagi): {$totalSekolah}x Hadir Sesi\n" .
                        "• Mandiri (Rumah): {$totalMandiri}x Mengerjakan Tugas\n" .
                        "----------------------------\n" .
                        "∑ *TOTAL: {$totalAktivitas} Aktivitas*\n\n" .
                        
                        "📝 *Capaian Nilai vs Rata-rata Kelas:*\n" .
                        "a. LITERASI\n" .
                        "   Skor Anak: *{$litSkor}*\n" .
                        "   Rata-rata Kelas: {$classLit}\n\n" .
                        
                        "b. NUMERASI\n" .
                        "   Skor Anak: *{$numSkor}*\n" .
                        "   Rata-rata Kelas: {$classNum}\n\n" .
                        
                        "c. TKA\n" .
                        "   Skor Anak: *{$tkaSkor}*\n" .
                        "   Rata-rata Kelas: {$classTka}\n\n" .
                        
                        "💡 Status: {$status}\n" .
                        "💬 _{$pesanSemangat}_\n\n" .
                        
                        "_*Tapamajuma* - Pemantauan Aktivitas Siswa_";

            // --- D. KIRIM KE WABLAS ---
            try {
                $token = env('WABLAS_TOKEN');
                $secret = env('WABLAS_SECRET_KEY');
                $apiUrl = rtrim(env('WABLAS_DOMAIN'), '/') . '/api/send-message';

                $authHeader = $token . "." . $secret;
                
                $response = Http::withHeaders([
                    'Authorization' => $authHeader,
                ])
                ->asForm()
                ->post($apiUrl, [
                    'phone'   => $user->phone_number,
                    'message' => $message,
                    'flag'    => 'instant', 
                ]);
                /** @var \Illuminate\Http\Client\Response $response */

                $res = $response->json();

                if ($response->successful() && ($res['status'] ?? false) == true) {
                    $this->info("✅ Terkirim ke {$user->name}");
                } else {
                    $this->error("⚠️ Gagal ke {$user->name}: " . json_encode($res));
                }
                
                sleep(2); // Jeda aman agar tidak diblokir WA

            } catch (\Exception $e) {
                $this->error("❌ Error: " . $e->getMessage());
            }
        }

        $this->info("🎉 Selesai! Laporan mingguan terkirim.");
    }
}