<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassName;
use App\Models\DailyActivity;
use App\Models\SelfStudySession;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Http\Controllers\Api\AIController;
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

        // Distribusi Type Kegiatan
        $activity_types = DailyActivity::select('type', DB::raw('count(*) as total'))
            ->groupBy('type')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        return response()->json([
            'metrics' => [
                'total_activities' => $totalActivities,
                'avg_score' => round($avgScore, 1),
                'active_students_7d' => $activeStudents
            ],
            'activity_types' => $activity_types,
            'trend' => $trend,
            'subjects' => $subjects

        ]);
    }

    // 2. PAGE STUDENT LOG (DIPERBARUI)
    public function studentLog(Request $request)
    {
        $query = User::where('role', 'student')
            ->withCount('dailyActivities as total_tasks')
            ->withAvg('dailyActivities as avg_score', 'score')
            ->withMax('dailyActivities as last_active', 'created_at');

        // Filter Pencarian Nama Siswa
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('class_id') && $request->class_id) {
            $query->where('class_id', $request->class_id);
        }
        $classes = ClassName::orderBy('name')->get();

        // Eksekusi dengan pagination
        $students = $query->orderByDesc('last_active')->paginate(10);

        return response()->json([
            'data' => $students,
            'classes' => $classes
        ]);

    }

    // 2.5 API BARU UNTUK MODAL DETAIL AKTIVITAS
    public function studentActivityDetails(Request $request, $id)
    {
        $query = DailyActivity::where('user_id', $id)->latest();

        // Filter rentang tanggal dari modal React
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Ambil datanya (bisa diganti paginate jika datanya sangat banyak)
        $activities = $query->get();

        return response()->json(['data' => $activities]);
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

// 4. PAGE CLASS SUMMARY (Agregasi per Kelas)
    public function classSummary()
    {
        $classStats = DB::table('class_names')
            ->leftJoin('users', function($join) {
                $join->on('class_names.id', '=', 'users.class_id')
                     ->where('users.role', '=', 'student');
            })
            ->leftJoin('daily_activities', 'users.id', '=', 'daily_activities.user_id')
            ->select(
                'class_names.id',
                'class_names.name as class_name',
                DB::raw('COUNT(DISTINCT users.id) as total_students'),
                // Hitung Jumlah
                DB::raw('SUM(CASE WHEN daily_activities.type = "literacy" THEN 1 ELSE 0 END) as literacy_count'),
                DB::raw('SUM(CASE WHEN daily_activities.type = "numeracy" THEN 1 ELSE 0 END) as numeracy_count'),
                DB::raw('SUM(CASE WHEN daily_activities.type = "tka" THEN 1 ELSE 0 END) as tka_count'),
                DB::raw('COUNT(daily_activities.id) as total_activities'),
                // Hitung Rata-rata Skor (Baru)
                DB::raw('ROUND(AVG(CASE WHEN daily_activities.type = "literacy" THEN daily_activities.score END), 1) as literacy_avg'),
                DB::raw('ROUND(AVG(CASE WHEN daily_activities.type = "numeracy" THEN daily_activities.score END), 1) as numeracy_avg'),
                DB::raw('ROUND(AVG(CASE WHEN daily_activities.type = "tka" THEN daily_activities.score END), 1) as tka_avg'),
                DB::raw('ROUND(AVG(daily_activities.score), 1) as overall_avg')
            )
            ->groupBy('class_names.id', 'class_names.name')
            ->orderBy('class_names.name')
            ->get();

        return response()->json([
            'data' => $classStats
        ]);
    }
// 5. PAGE TEACHER SUMMARY (Agregasi Aktivitas Guru)
    public function teacherSummary()
    {
        // Ambil semua user dengan role 'teacher'
        $teachers = User::where('role', 'teacher')
            ->withCount([
                // Asumsi 1: Nama relasi ke SelfStudySession di model User adalah 'sessions'
                // Jika tidak ada relasi, kamu bisa query manual, tapi disarankan pakai relasi
                'sessions as total_sessions', 
                
                // Asumsi 2: Nama relasi ke tabel soal di model User adalah 'questions'
                // Sesuaikan 'questions' dengan nama fungsi relasi di model User kamu
                'questions as total_questions' 
            ])
            ->get()
            ->map(function ($teacher) {
                // Hitung total kontribusi untuk dasar perankingan nanti
                $teacher->total_contribution = $teacher->total_sessions + $teacher->total_questions;
                return $teacher;
            })
            // Urutkan dari kontribusi tertinggi agar mempermudah frontend
            ->sortByDesc('total_contribution')
            ->values(); // Reset index array

        return response()->json([
            'data' => $teachers
        ]);
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
    ini_set('memory_limit', '512M');       
    ini_set('max_execution_time', '300');  
    // ==========================================

    $logoKiri = $this->imageToBase64(public_path('images/logo_pemkab.png')); 
    $logoKanan = $this->imageToBase64(public_path('images/iconappp.png'));
    
    $startDate = $request->start_date ? Carbon::parse($request->start_date)->startOfDay() : Carbon::now()->startOfMonth();
    $endDate = $request->end_date ? Carbon::parse($request->end_date)->endOfDay() : Carbon::now()->endOfMonth(); 
    $periodText = $startDate->translatedFormat('d F Y') . ' - ' . $endDate->translatedFormat('d F Y');

    // --- BAGIAN 1 & 2: RINGKASAN & SESI (Sama seperti sebelumnya) ---
    $summary = [
        'total_siswa' => User::where('role', 'student')->count(),
        'siswa_aktif_sistem' => DailyActivity::whereBetween('created_at', [$startDate, $endDate])->distinct('user_id')->count(),
        'total_guru' => User::where('role', 'teacher')->count(),
        'guru_aktif_sesi' => SelfStudySession::whereBetween('started_at', [$startDate, $endDate])->distinct('teacher_id')->count(),
        // --- TAMBAHAN BARU UNTUK JUMLAH PER TIPE ---
        'total_literasi' => DailyActivity::where('type', 'literacy')->whereBetween('created_at', [$startDate, $endDate])->count(),
        'total_numerasi' => DailyActivity::where('type', 'numeracy')->whereBetween('created_at', [$startDate, $endDate])->count(),
        'total_tka' => DailyActivity::where('type', 'tka')->whereBetween('created_at', [$startDate, $endDate])->count(),
        'top_mapel' => DailyActivity::whereBetween('created_at', [$startDate, $endDate])
            ->select('subject', DB::raw('count(*) as total'))->groupBy('subject')->orderByDesc('total')->limit(5)->get()
    ];

    $sessions = SelfStudySession::with(['teacher', 'students'])->whereBetween('started_at', [$startDate, $endDate])->orderBy('started_at', 'desc')->get();
    
    // (Poin 9) Guru Paling Aktif Memantau / Membuat Sesi
    $teacherRecap = SelfStudySession::whereBetween('started_at', [$startDate, $endDate])
        ->select('teacher_id', DB::raw('count(*) as total_sesi'))
        ->with('teacher')->groupBy('teacher_id')->orderByDesc('total_sesi')->get();

    // --- BAGIAN 3: LITERASI & NUMERASI ---
    $numerasi = $this->getStatsByType('numeracy', $startDate, $endDate); 
    $literasi = $this->getStatsByType('literacy', $startDate, $endDate); 
    $tka = $this->getStatsByType('tka', $startDate, $endDate);

    // --- PERSIAPAN DATA ANGKATAN & SISWA TELADAN ---
    // Tarik semua siswa beserta kelasnya dan hitung total skor/keaktifan di rentang waktu ini
    $allStudentsRaw = User::where('role', 'student')
        ->join('class_names', 'users.class_id', '=', 'class_names.id') // Pastikan relasinya benar
        ->select('users.*', 'class_names.name as class_name')
        ->withCount(['dailyActivities as total_keaktifan' => function($q) use ($startDate, $endDate) {
            $q->whereBetween('created_at', [$startDate, $endDate]);
        }])
        ->withSum(['dailyActivities as total_skor' => function($q) use ($startDate, $endDate) {
            $q->whereBetween('created_at', [$startDate, $endDate]);
        }], 'score')
        ->withCount(['attendances as total_sesi_pagi' => function($q) use ($startDate, $endDate) {
            $q->where('is_active', 1)->whereBetween('created_at', [$startDate, $endDate]);
        }])
        ->get();

    $allStudents = $allStudentsRaw->sortBy('name');

    // (Poin 10) TOP 5 Siswa Teladan (Kombinasi Skor Tinggi & Paling Aktif)
    $siswaTeladan = $allStudentsRaw
        ->filter(fn($s) => $s->total_keaktifan > 0 || $s->total_sesi_pagi > 0)
        ->sortBy([
            ['total_skor', 'desc'],        // Prioritas 1: Skor tertinggi
            ['total_sesi_pagi', 'desc'],   // Prioritas 2: Paling rajin sesi pagi
            ['total_keaktifan', 'desc'],   // Prioritas 3: Tugas terbanyak
            
        ])
        ->take(5)
        ->values(); // SANGAT PENTING: Mereset index menjadi 0, 1, 2 agar rapi di Blade

   $byAngkatan = $allStudentsRaw->groupBy(function($s) {
        $name = strtoupper($s->class_name ?? ''); // Pastikan tidak error kalau null
        
        if (str_starts_with($name, 'VIII')) return 'Kelas 8'; // Cek 8 dulu
        if (str_starts_with($name, 'VII')) return 'Kelas 7';  // Baru cek 7
        if (str_starts_with($name, 'IX')) return 'Kelas 9';   // Cek 9
        
        return 'Lainnya';
    });

    $topPerAngkatan = [];
    foreach(['Kelas 7', 'Kelas 8', 'Kelas 9'] as $grade) {
        $studentsInGrade = $byAngkatan->get($grade, collect());
        $topPerAngkatan[$grade] = [
            // (Poin 5) Top 5 Teraktif
            'teraktif' => $studentsInGrade->sortByDesc('total_keaktifan')->take(5),
            // (Poin 6) Top 5 Skor Tertinggi
            'tertinggi' => $studentsInGrade->sortByDesc('total_skor')->take(5),
            'teraktif_pagi' => $studentsInGrade->filter(fn($s) => $s->total_sesi_pagi > 0)->sortByDesc('total_sesi_pagi')->take(5),
        ];
    }

    // (Poin 7) Progres Minat Siswa per Angkatan (Support Angka Romawi)
    $minatPerAngkatan = DB::table('daily_activities')
        ->join('users', 'daily_activities.user_id', '=', 'users.id')
        ->join('class_names', 'users.class_id', '=', 'class_names.id')
        ->whereBetween('daily_activities.created_at', [$startDate, $endDate])
        ->select(
            DB::raw("
                CASE 
                    WHEN UPPER(class_names.name) LIKE 'VIII%' THEN '8'
                    WHEN UPPER(class_names.name) LIKE 'VII%' THEN '7'
                    WHEN UPPER(class_names.name) LIKE 'IX%' THEN '9'
                    ELSE 'Lainnya' 
                END as grade
            "), 
            'daily_activities.type', 
            DB::raw('count(*) as total')
        )
        ->groupBy('grade', 'daily_activities.type')
        ->get()
        ->groupBy('grade');

    // (Poin 8) Masukan / Insight Otomatis untuk Sekolah (Gabungan Jumlah & Rata-rata Skor)
    
    // Query Dasar (sudah difilter berdasarkan tanggal)
    $litQuery = DailyActivity::where('type', 'literacy')->whereBetween('created_at', [$startDate, $endDate]);
    $numQuery = DailyActivity::where('type', 'numeracy')->whereBetween('created_at', [$startDate, $endDate]);
    $tkaQuery = DailyActivity::where('type', 'tka')->whereBetween('created_at', [$startDate, $endDate]);

    // Eksekusi Count & Average
    $totalLit = $litQuery->count();
    $avgLit   = round($litQuery->avg('score') ?? 0, 1);

    $totalNum = $numQuery->count();
    $avgNum   = round($numQuery->avg('score') ?? 0, 1);

    $totalTka = $tkaQuery->count();
    $avgTka   = round($tkaQuery->avg('score') ?? 0, 1);

    // === PANGGIL AI CONTROLLER ===
    // Sekarang kita kirim 6 keping data ke Gemini
    $insights = \App\Http\Controllers\Api\AIController::generateReportInsights([
        'literasi_count' => $totalLit,
        'literasi_avg'   => $avgLit,
        'numerasi_count' => $totalNum,
        'numerasi_avg'   => $avgNum,
        'tka_count'      => $totalTka,
        'tka_avg'        => $avgTka
    ]);
    // =============================

    // Tambahkan 1 kalimat apresiasi manual dari sistem di akhir poin AI
    $insights[] = "Secara keseluruhan, sekolah sudah menunjukkan upaya yang baik dalam mendorong aktivitas siswa, terutama di area {$summary['top_mapel'][0]->subject}. Terus tingkatkan dan pertahankan semangat belajar ini!";

    // --- (TAMBAHAN) PERSIAPAN DATA RANGKUMAN PER KELAS ---
    $classSuccessRates = DB::table('class_names')
        ->leftJoin('users', function($join) {
            $join->on('class_names.id', '=', 'users.class_id')
                 ->where('users.role', '=', 'student');
        })
        ->leftJoin('daily_activities', function($join) use ($startDate, $endDate) {
             // Pastikan hanya menghitung skor pada rentang tanggal yang dipilih
             $join->on('users.id', '=', 'daily_activities.user_id')
                  ->whereBetween('daily_activities.created_at', [$startDate, $endDate]);
        })
        ->select(
            'class_names.name as class_name',
            // Hitung rata-rata skor (AVG), jika kosong jadikan 0
            DB::raw('IFNULL(ROUND(AVG(CASE WHEN daily_activities.type = "literacy" THEN daily_activities.score END), 1), 0) as avg_literacy'),
            DB::raw('IFNULL(ROUND(AVG(CASE WHEN daily_activities.type = "numeracy" THEN daily_activities.score END), 1), 0) as avg_numeracy'),
            DB::raw('IFNULL(ROUND(AVG(CASE WHEN daily_activities.type = "tka" THEN daily_activities.score END), 1), 0) as avg_tka')
        )
        ->groupBy('class_names.id', 'class_names.name')
        ->orderBy('class_names.name')
        ->get();
    // --- (TAMBAHAN BARU) DATA REKAP SESI PAGI PER KELAS ---
    // Mengambil siswa, menghitung total hadir, dan mengelompokkannya per kelas
    $morningSessionData = User::where('role', 'student')
        ->join('class_names', 'users.class_id', '=', 'class_names.id')
        ->select('users.id', 'users.name', 'class_names.name as class_name')
        ->withCount(['attendances as total_active' => function ($query) use ($startDate, $endDate) {
            // Hitung hanya yang hadir (is_active = 1) di rentang tanggal laporan
            $query->where('is_active', 1)
                  ->whereBetween('created_at', [$startDate, $endDate]);
        }])
        // Opsional: Sembunyikan siswa yang total hadirnya 0 agar PDF tidak terlalu panjang
        ->having('total_active', '>', 0) 
        ->orderBy('class_names.name') // Urutkan kelasnya dulu (7A, 7B, dst)
        ->orderByDesc('total_active') // Lalu urutkan dari yang paling rajin di kelas itu
        ->orderBy('users.name')       // Terakhir urutkan abjad jika jumlah hadirnya sama
        ->get()
        ->groupBy('class_name'); // Kelompokkan datanya berdasarkan nama kelas

    $pdf = Pdf::loadView('pdf.activity-report', compact(
        'summary', 'sessions', 'teacherRecap', 'literasi', 'numerasi', 
        'allStudents', 'periodText', 'logoKiri', 'logoKanan',
        'topPerAngkatan', 'minatPerAngkatan', 'siswaTeladan', 'insights',
        'classSuccessRates', 'morningSessionData'
    ));

    $memoryBytes = memory_get_peak_usage(true);
    $memoryMB = round($memoryBytes / 1024 / 1024, 2);
    Log::info("Puncak RAM terpakai untuk Export PDF: " . $memoryMB . " MB");

    return $pdf->setPaper('a4', 'portrait')->download('Laporan-Lengkap.pdf');
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