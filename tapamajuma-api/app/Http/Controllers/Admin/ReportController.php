<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DailyActivity;
use App\Models\SelfStudySession;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    // 1. PAGE EXECUTIVE SUMMARY
    public function executiveSummary()
    {
        // Statistik Utama
        $totalActivities = DailyActivity::count();
        $avgScore = DailyActivity::avg('score');
        $activeStudents = DailyActivity::distinct('user_id')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->count();

        // Grafik Tren Aktivitas 7 Hari Terakhir
        $trend = DailyActivity::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Distribusi Mata Pelajaran
        $subjects = DailyActivity::select('subject', DB::raw('count(*) as total'))
            ->groupBy('subject')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        return response()->json([
            'metrics' => [
                'total_activities' => $totalActivities,
                'avg_score' => round($avgScore, 1),
                'active_students_7d' => $activeStudents
            ],
            'trend' => $trend,
            'subjects' => $subjects
        ]);
    }

    // 2. PAGE STUDENT LOG
    public function studentLog(Request $request)
    {
        // Ambil semua siswa dengan ringkasan aktivitasnya
        $students = User::where('role', 'student') // Sesuaikan role kamu
            ->withCount('dailyActivities as total_tasks')
            ->withAvg('dailyActivities as avg_score', 'score')
            ->withMax('dailyActivities as last_active', 'created_at')
            ->orderByDesc('last_active') // Yang baru aktif di atas
            ->paginate(10);

        return response()->json($students);
    }

    // 3. PAGE SESSION EFFECTIVENESS
    public function sessionEffectiveness()
{
    $sessions = SelfStudySession::with(['teacher:id,name', 'students:id,name']) 
        ->orderByDesc('started_at')
        ->limit(10)
        ->get()
        ->map(function ($session) {
            
            // --- PERBAIKAN DI SINI ---
            
            // 1. Ambil list siswa dari relasi
            $studentList = $session->students->pluck('name');
            
            // 2. Hitung jumlahnya langsung dari list tersebut (JANGAN pakai total_present)
            $realCount = $session->students->count();

            // 3. Logika konversi tetap sama
            $startTime = \Carbon\Carbon::parse($session->started_at);
            $endTime = $startTime->copy()->addHours(2);
            $generatedActivities = DailyActivity::whereBetween('created_at', [$startTime, $endTime])->count();
            
            // Cegah error pembagian nol
            $conversionRate = $realCount > 0 
                ? round(($generatedActivities / $realCount) * 100) 
                : 0;

            return [
                'id' => $session->id,
                'topic' => $session->topic,
                'teacher' => $session->teacher->name,
                'date' => $startTime->format('d M Y, H:i'),
                'class_name' => $session->class_name,
                
                // Gunakan hasil hitungan real-time
                'attendees_count' => $realCount, 
                
                'attendees_list' => $studentList,
                'activities_generated' => $generatedActivities,
                'conversion_rate' => $conversionRate,
            ];
        });

    return response()->json($sessions);
}

private function imageToBase64($path) {
    // Cek apakah file ada
    if (!file_exists($path)) {
        return ''; // Atau return path ke gambar placeholder
    }
    
    $type = pathinfo($path, PATHINFO_EXTENSION);
    $data = file_get_contents($path);
    return 'data:image/' . $type . ';base64,' . base64_encode($data);
}

public function downloadFullReport(Request $request)
{
    // === SET LIMIT MEMORY ===
        ini_set('memory_limit', '512M');       // Menaikkan batas RAM menjadi 512 MB
        ini_set('max_execution_time', '300');  // Memberi waktu ekstra 5 menit agar tidak Timeout
        // ==========================================

    // 1. TENTUKAN RENTANG TANGGAL
    // Jika user mengirim param ?start_date=... & ?end_date=..., pakai itu.
    // Jika tidak, default ke "Bulan Ini" (Tanggal 1 s/d Hari Ini/Akhir Bulan).
    $logoKiri = $this->imageToBase64(public_path('images/logo_pemkab.png')); 
    $logoKanan = $this->imageToBase64(public_path('images/iconappp.png'));
    $startDate = $request->start_date 
        ? Carbon::parse($request->start_date)->startOfDay() 
        : Carbon::now()->startOfMonth(); // Default: Tgl 1 bulan ini
        
    $endDate = $request->end_date 
        ? Carbon::parse($request->end_date)->endOfDay() 
        : Carbon::now()->endOfMonth(); // Default: Akhir bulan ini

    // Format tanggal untuk judul PDF
    $periodText = $startDate->translatedFormat('d F Y') . ' - ' . $endDate->translatedFormat('d F Y');


    // --- BAGIAN 1: RINGKASAN (DIFILTER TANGGAL) ---
    $summary = [
        'total_siswa' => User::where('role', 'student')->count(), // Total siswa tetap semua
        
        // Siswa yg aktif HANYA di rentang tanggal ini
        'siswa_aktif_sistem' => DailyActivity::whereBetween('created_at', [$startDate, $endDate])
            ->distinct('user_id')->count(),
            
        'total_guru' => User::where('role', 'teacher')->count(),
        
        // Guru yg bikin sesi HANYA di rentang tanggal ini
        'guru_aktif_sesi' => SelfStudySession::whereBetween('started_at', [$startDate, $endDate])
            ->distinct('teacher_id')->count(),
            
        // Mapel populer di rentang tanggal ini
        'top_mapel' => DailyActivity::whereBetween('created_at', [$startDate, $endDate])
            ->select('subject', DB::raw('count(*) as total'))
            ->groupBy('subject')->orderByDesc('total')->limit(5)->get()
    ];


    // --- BAGIAN 2: SESI (DIFILTER TANGGAL) ---
    $sessions = SelfStudySession::with(['teacher', 'students'])
        ->whereBetween('started_at', [$startDate, $endDate]) // Filter Sesi
        ->orderBy('started_at', 'desc')
        ->get();
    
    // Rekap Guru di rentang tanggal ini
    $teacherRecap = SelfStudySession::whereBetween('started_at', [$startDate, $endDate])
        ->select('teacher_id', DB::raw('count(*) as total_sesi'))
        ->with('teacher')
        ->groupBy('teacher_id')
        ->get();


    // --- BAGIAN 3: LITERASI & NUMERASI (BY TYPE & DATE) ---
    // Kirim tanggal ke fungsi helper
    $numerasi = $this->getStatsByType('numeracy', $startDate, $endDate); 
    $literasi = $this->getStatsByType('literacy', $startDate, $endDate); 


    // --- BAGIAN 4: LAMPIRAN LENGKAP (SCOPED RELATIONS) ---
    // Kita ingin list SEMUA siswa, tapi kolom 'Total Keaktifan'-nya hanya menghitung di bulan ini
    $allStudents = User::where('role', 'student')
        ->withCount(['dailyActivities as total_keaktifan' => function($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }])
        ->withSum(['dailyActivities as total_skor' => function($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }], 'score')
        ->orderBy('name')
        ->get();


    $pdf = Pdf::loadView('pdf.activity-report', compact(
        'summary', 'sessions', 'teacherRecap', 'literasi', 'numerasi', 'allStudents', 'periodText', 'logoKiri', 'logoKanan'
    ));

    // === TAMBAHKAN KODE INI SEBELUM RETURN ===
    // Mengambil puncak memori dalam satuan Bytes, lalu dikonversi ke MegaBytes (MB)
    $memoryBytes = memory_get_peak_usage(true);
    $memoryMB = round($memoryBytes / 1024 / 1024, 2);
    
    // Mencatatnya ke log Laravel
    Log::info("Puncak RAM terpakai untuk Export PDF: " . $memoryMB . " MB");
    // =========================================

    return $pdf->setPaper('a4', 'portrait')->stream('Laporan-Lengkap.pdf');
}

// Update Helper Function untuk menerima tanggal
private function getStatsByType($type, $start, $end) {
    
    // Filter Type DAN Tanggal
    $query = DailyActivity::where('type', $type)
            ->whereBetween('created_at', [$start, $end]);

    $q1 = clone $query;
    $q2 = clone $query;

    return [
        'top_active' => $q1->select('user_id', DB::raw('count(*) as total'))
            ->with('user')
            ->groupBy('user_id')
            ->orderByDesc('total')
            ->limit(5)
            ->get(),

        'top_score' => $q2->select('user_id', DB::raw('sum(score) as total_score'))
            ->with('user')
            ->groupBy('user_id')
            ->orderByDesc('total_score')
            ->limit(5)
            ->get(),
    ];
}

// Helper function biar kodingan rapi
private function getSubjectStats($subjects) {
    return [
        // Total aktif per tanggal (Group by Date)
        'daily_active' => DailyActivity::whereIn('subject', $subjects)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(distinct user_id) as total'))
            ->groupBy('date')->get(),
            
        // Siswa Paling Aktif
        'top_active' => DailyActivity::whereIn('subject', $subjects)
            ->select('user_id', DB::raw('count(*) as total'))
            ->with('user')
            ->groupBy('user_id')->orderByDesc('total')->limit(5)->get(),

        // Siswa Terpintar (Skor Tertinggi)
        'top_score' => DailyActivity::whereIn('subject', $subjects)
            ->select('user_id', DB::raw('sum(score) as total_score'))
            ->with('user')
            ->groupBy('user_id')->orderByDesc('total_score')->limit(5)->get(),
    ];
}

}