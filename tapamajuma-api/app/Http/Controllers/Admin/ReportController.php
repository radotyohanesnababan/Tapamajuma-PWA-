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
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    // ============================================================
    // HELPER: Konversi gambar ke base64 untuk PDF
    // ============================================================
    private function imageToBase64($path)
    {
        if (!file_exists($path)) return '';
        $type = pathinfo($path, PATHINFO_EXTENSION);
        $data = file_get_contents($path);
        return 'data:image/' . $type . ';base64,' . base64_encode($data);
    }

    // ============================================================
    // MAIN: Download Full Report (VERSI HEMAT RAM)
    // ============================================================
    public function downloadFullReport(Request $request)
    {
        // --- Persiapan Rentang Tanggal ---
        $startDate = $request->start_date
            ? Carbon::parse($request->start_date)->startOfDay()
            : Carbon::now()->startOfMonth();

        $endDate = $request->end_date
            ? Carbon::parse($request->end_date)->endOfDay()
            : Carbon::now()->endOfMonth();

        $periodText = $startDate->translatedFormat('d F Y') . ' - ' . $endDate->translatedFormat('d F Y');

        $logoKiri  = $this->imageToBase64(public_path('images/logo_pemkab.png'));
        $logoKanan = $this->imageToBase64(public_path('images/iconappp.png'));

        // --------------------------------------------------------
        // BAGIAN 1: RINGKASAN UTAMA
        // Semua dihitung langsung di DB, tidak ada Collection besar
        // --------------------------------------------------------
        $summary = [
            'total_siswa'        => User::where('role', 'student')->count(),
            'total_guru'         => User::where('role', 'teacher')->count(),
            'siswa_aktif_sistem' => DailyActivity::whereBetween('created_at', [$startDate, $endDate])
                                        ->distinct('user_id')->count('user_id'),
            'guru_aktif_sesi'    => SelfStudySession::whereBetween('started_at', [$startDate, $endDate])
                                        ->distinct('teacher_id')->count('teacher_id'),
            'total_literasi'     => DailyActivity::where('type', 'literacy')
                                        ->whereBetween('created_at', [$startDate, $endDate])->count(),
            'total_numerasi'     => DailyActivity::where('type', 'numeracy')
                                        ->whereBetween('created_at', [$startDate, $endDate])->count(),
            'total_tka'          => DailyActivity::where('type', 'tka')
                                        ->whereBetween('created_at', [$startDate, $endDate])->count(),
            'top_mapel'          => DailyActivity::whereBetween('created_at', [$startDate, $endDate])
                                        ->select('subject', DB::raw('count(*) as total'))
                                        ->groupBy('subject')
                                        ->orderByDesc('total')
                                        ->limit(5)
                                        ->get(),
        ];

        // --------------------------------------------------------
        // BAGIAN 2: SESI BELAJAR
        // Gunakan withCount untuk siswa — tidak load list nama ke RAM
        // --------------------------------------------------------
        $sessions = SelfStudySession::with(['teacher:id,name'])
            ->withCount('students')                                       // hanya angka hadir
            ->whereBetween('started_at', [$startDate, $endDate])
            ->orderByDesc('started_at')
            ->get(['id', 'topic', 'teacher_id', 'started_at', 'class_name']);

        // Rekap guru paling aktif membuat sesi
        $teacherRecap = SelfStudySession::whereBetween('started_at', [$startDate, $endDate])
            ->select('teacher_id', DB::raw('count(*) as total_sesi'))
            ->with('teacher:id,name')
            ->groupBy('teacher_id')
            ->orderByDesc('total_sesi')
            ->get();

        // --------------------------------------------------------
        // BAGIAN 3: STATISTIK PER TIPE (Literasi, Numerasi, TKA)
        // --------------------------------------------------------
        $literasi = $this->getStatsByType('literacy', $startDate, $endDate);
        $numerasi = $this->getStatsByType('numeracy', $startDate, $endDate);
        $tka      = $this->getStatsByType('tka', $startDate, $endDate);

        // --------------------------------------------------------
        // BAGIAN 4: DAFTAR SEMUA SISWA
        // Hanya select kolom yang dipakai di PDF (hemat RAM)
        // --------------------------------------------------------
        $allStudents = User::where('role', 'student')
            ->join('class_names', 'users.class_id', '=', 'class_names.id')
            ->select('users.id', 'users.name', 'class_names.name as class_name')
            ->orderBy('class_names.name')
            ->orderBy('users.name')
            ->get();

        // --------------------------------------------------------
        // BAGIAN 5: TOP PER ANGKATAN
        // Masing-masing langsung query ke DB dengan limit(5),
        // tidak lagi load semua siswa ke RAM lalu filter Collection
        // --------------------------------------------------------
                $topPerAngkatan = [];
        $gradeMap = ['Kelas 7' => 'VII-', 'Kelas 8' => 'VIII-', 'Kelas 9' => 'IX-'];

        foreach ($gradeMap as $label => $roman) {
            $baseQuery = fn() => User::where('users.role', 'student')
                ->join('class_names', 'users.class_id', '=', 'class_names.id')
                ->where('class_names.name', 'like', "{$roman}%")
                ->select('users.id', 'users.name', 'class_names.name as class_name');

            $topPerAngkatan[$label] = [
                'teraktif' => $baseQuery()
                    ->withCount(['dailyActivities as total_keaktifan' => fn($q) =>
                        $q->whereBetween('created_at', [$startDate, $endDate])])
                    ->orderByDesc('total_keaktifan')
                    ->limit(5)
                    ->get(),

                            'tertinggi' => $baseQuery()
                ->addSelect(DB::raw('(SELECT COALESCE(SUM(xp), 0) FROM xp_logs WHERE xp_logs.user_id = users.id AND xp_logs.created_at BETWEEN "' . $startDate . '" AND "' . $endDate . '") as xp_periode'))
                ->orderByDesc('xp_periode')
                ->limit(5)
                ->get(),

                'teraktif_pagi' => $baseQuery()
                    ->withCount(['attendances as total_sesi_pagi' => fn($q) =>
                        $q->where('is_active', 1)->whereBetween('created_at', [$startDate, $endDate])])
                    ->having('total_sesi_pagi', '>', 0)
                    ->orderByDesc('total_sesi_pagi')
                    ->limit(5)
                    ->get(),
            ];
        }

        // --------------------------------------------------------
        // BAGIAN 6: SISWA TELADAN (Top 5 Global)
        // Query langsung dengan sorting di DB
        // --------------------------------------------------------
            $siswaTeladan = User::where('role', 'student')
        ->join('class_names', 'users.class_id', '=', 'class_names.id')
        ->select(
            'users.id', 'users.name', 'class_names.name as class_name',
            DB::raw('(SELECT COALESCE(SUM(xp), 0) FROM xp_logs WHERE xp_logs.user_id = users.id AND xp_logs.created_at BETWEEN "' . $startDate . '" AND "' . $endDate . '") as xp_periode')
        )
        ->orderByDesc('xp_periode')
        ->limit(5)
        ->get();

        // --------------------------------------------------------
        // BAGIAN 7: MINAT SISWA PER ANGKATAN
        // --------------------------------------------------------
        $minatPerAngkatan = DB::table('daily_activities')
            ->join('users', 'daily_activities.user_id', '=', 'users.id')
            ->join('class_names', 'users.class_id', '=', 'class_names.id')
            ->whereBetween('daily_activities.created_at', [$startDate, $endDate])
            ->select(
                DB::raw("
                    CASE
                        WHEN UPPER(class_names.name) LIKE 'VIII%' THEN '8'
                        WHEN UPPER(class_names.name) LIKE 'VII%'  THEN '7'
                        WHEN UPPER(class_names.name) LIKE 'IX%'   THEN '9'
                        ELSE 'Lainnya'
                    END as grade
                "),
                'daily_activities.type',
                DB::raw('count(*) as total')
            )
            ->groupBy('grade', 'daily_activities.type')
            ->get()
            ->groupBy('grade');

        // --------------------------------------------------------
        // BAGIAN 8: INSIGHT OTOMATIS DARI AI
        // Hitung agregat dulu (query ringan), baru panggil AI
        // --------------------------------------------------------
        $aiStats = DB::table('daily_activities')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(
                'type',
                DB::raw('count(*) as total'),
                DB::raw('ROUND(AVG(score), 1) as avg_score')
            )
            ->groupBy('type')
            ->get()
            ->keyBy('type');

        $insights = \App\Http\Controllers\Api\AIController::generateReportInsights([
            'literasi_count' => $aiStats->get('literacy')->total    ?? 0,
            'literasi_avg'   => $aiStats->get('literacy')->avg_score ?? 0,
            'numerasi_count' => $aiStats->get('numeracy')->total    ?? 0,
            'numerasi_avg'   => $aiStats->get('numeracy')->avg_score ?? 0,
            'tka_count'      => $aiStats->get('tka')->total         ?? 0,
            'tka_avg'        => $aiStats->get('tka')->avg_score      ?? 0,
        ]);

        // Tambah kalimat apresiasi di akhir
        $topSubject = $summary['top_mapel'][0]->subject ?? '-';
        $insights[] = "Secara keseluruhan, sekolah sudah menunjukkan upaya yang baik dalam mendorong aktivitas siswa, "
                    . "terutama di area {$topSubject}. Terus tingkatkan dan pertahankan semangat belajar ini!";

        // --------------------------------------------------------
        // BAGIAN 9: RANGKUMAN RATA-RATA SKOR PER KELAS
        // --------------------------------------------------------
        $classSuccessRates = DB::table('class_names')
            ->leftJoin('users', function ($join) {
                $join->on('class_names.id', '=', 'users.class_id')
                     ->where('users.role', '=', 'student');
            })
            ->leftJoin('daily_activities', function ($join) use ($startDate, $endDate) {
                $join->on('users.id', '=', 'daily_activities.user_id')
                     ->whereBetween('daily_activities.created_at', [$startDate, $endDate]);
            })
            ->select(
                'class_names.name as class_name',
                DB::raw('IFNULL(ROUND(AVG(CASE WHEN daily_activities.type = "literacy"  THEN daily_activities.score END), 1), 0) as avg_literacy'),
                DB::raw('IFNULL(ROUND(AVG(CASE WHEN daily_activities.type = "numeracy"  THEN daily_activities.score END), 1), 0) as avg_numeracy'),
                DB::raw('IFNULL(ROUND(AVG(CASE WHEN daily_activities.type = "tka"       THEN daily_activities.score END), 1), 0) as avg_tka')
            )
            ->groupBy('class_names.id', 'class_names.name')
            ->orderBy('class_names.name')
            ->get();

        // --------------------------------------------------------
        // BAGIAN 10: REKAP SESI PAGI PER KELAS
        // --------------------------------------------------------
        $morningSessionData = User::where('role', 'student')
            ->join('class_names', 'users.class_id', '=', 'class_names.id')
            ->select('users.id', 'users.name', 'class_names.name as class_name')
            ->withCount(['attendances as total_active' => fn($q) =>
                $q->where('is_active', 1)->whereBetween('created_at', [$startDate, $endDate])])
            ->having('total_active', '>', 0)
            ->orderBy('class_names.name')
            ->orderByDesc('total_active')
            ->orderBy('users.name')
            ->get()
            ->groupBy('class_name');

        // --------------------------------------------------------
        // GENERATE PDF
        // --------------------------------------------------------
        $memBefore = memory_get_usage(true);

        $pdf = Pdf::loadView('pdf.activity-report', compact(
            'summary', 'sessions', 'teacherRecap',
            'literasi', 'numerasi', 'tka',
            'allStudents', 'periodText', 'logoKiri', 'logoKanan',
            'topPerAngkatan', 'minatPerAngkatan', 'siswaTeladan',
            'insights', 'classSuccessRates', 'morningSessionData'
        ));

        $memPeak = round(memory_get_peak_usage(true) / 1024 / 1024, 2);
        Log::info("Peak RAM Export PDF: {$memPeak} MB");

        return $pdf->setPaper('a4', 'portrait')->download('Laporan-Lengkap.pdf');
    }

    // ============================================================
    // HELPER: Statistik top siswa per tipe aktivitas
    // ============================================================
    private function getStatsByType($type, $start, $end)
    {
        return [
            'top_active' => DailyActivity::where('type', $type)
                ->whereBetween('created_at', [$start, $end])
                ->select('user_id', DB::raw('count(*) as total'))
                ->with('user:id,name')
                ->groupBy('user_id')
                ->orderByDesc('total')
                ->limit(5)
                ->get(),

            'top_score' => DailyActivity::where('type', $type)
                ->whereBetween('created_at', [$start, $end])
                ->select('user_id', DB::raw('sum(score) as total_score'))
                ->with('user:id,name')
                ->groupBy('user_id')
                ->orderByDesc('total_score')
                ->limit(5)
                ->get(),
        ];
    }

    // ============================================================
    // API ENDPOINTS LAINNYA (tidak berubah)
    // ============================================================

    public function executiveSummary()
    {
        $totalActivities = DailyActivity::count();
        $avgScore        = DailyActivity::avg('score');
        $activeStudents  = DailyActivity::distinct('user_id')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->count();

        $trend = DailyActivity::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('date')->orderBy('date')->get();

        $subjects = DailyActivity::select('subject', DB::raw('count(*) as total'))
            ->groupBy('subject')->orderByDesc('total')->limit(5)->get();

        $activity_types = DailyActivity::select('type', DB::raw('count(*) as total'))
            ->groupBy('type')->orderByDesc('total')->limit(5)->get();

        return response()->json([
            'metrics'        => [
                'total_activities'    => $totalActivities,
                'avg_score'           => round($avgScore, 1),
                'active_students_7d'  => $activeStudents,
            ],
            'activity_types' => $activity_types,
            'trend'          => $trend,
            'subjects'       => $subjects,
        ]);
    }

    public function studentLog(Request $request)
    {
        $query = User::where('role', 'student')
            ->withCount('dailyActivities as total_tasks')
            ->withAvg('dailyActivities as avg_score', 'score')
            ->withMax('dailyActivities as last_active', 'created_at');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        $classes  = ClassName::orderBy('name')->get();
        $students = $query->orderByDesc('last_active')->paginate(10);

        return response()->json(['data' => $students, 'classes' => $classes]);
    }

    public function studentActivityDetails(Request $request, $id)
    {
        $query = DailyActivity::where('user_id', $id)->latest();

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        return response()->json(['data' => $query->get()]);
    }

    public function sessionEffectiveness()
    {
        $sessions = SelfStudySession::with(['teacher:id,name', 'students:id,name'])
            ->orderByDesc('started_at')
            ->limit(10)
            ->get()
            ->map(function ($session) {
                $studentList = $session->students->pluck('name');
                $realCount   = $session->students->count();
                $startTime   = Carbon::parse($session->started_at);
                $endTime     = $startTime->copy()->addHours(2);

                $generatedActivities = DailyActivity::whereBetween('created_at', [$startTime, $endTime])->count();
                $conversionRate      = $realCount > 0
                    ? round(($generatedActivities / $realCount) * 100)
                    : 0;

                return [
                    'id'                   => $session->id,
                    'topic'                => $session->topic,
                    'teacher'              => $session->teacher->name,
                    'date'                 => $startTime->format('d M Y, H:i'),
                    'class_name'           => $session->class_name,
                    'attendees_count'      => $realCount,
                    'attendees_list'       => $studentList,
                    'activities_generated' => $generatedActivities,
                    'conversion_rate'      => $conversionRate,
                ];
            });

        return response()->json($sessions);
    }

    public function classSummary()
    {
        $classStats = DB::table('class_names')
            ->leftJoin('users', function ($join) {
                $join->on('class_names.id', '=', 'users.class_id')
                     ->where('users.role', '=', 'student');
            })
            ->leftJoin('daily_activities', 'users.id', '=', 'daily_activities.user_id')
            ->select(
                'class_names.id',
                'class_names.name as class_name',
                DB::raw('COUNT(DISTINCT users.id) as total_students'),
                DB::raw('SUM(CASE WHEN daily_activities.type = "literacy"  THEN 1 ELSE 0 END) as literacy_count'),
                DB::raw('SUM(CASE WHEN daily_activities.type = "numeracy"  THEN 1 ELSE 0 END) as numeracy_count'),
                DB::raw('SUM(CASE WHEN daily_activities.type = "tka"       THEN 1 ELSE 0 END) as tka_count'),
                DB::raw('COUNT(daily_activities.id) as total_activities'),
                DB::raw('ROUND(AVG(CASE WHEN daily_activities.type = "literacy"  THEN daily_activities.score END), 1) as literacy_avg'),
                DB::raw('ROUND(AVG(CASE WHEN daily_activities.type = "numeracy"  THEN daily_activities.score END), 1) as numeracy_avg'),
                DB::raw('ROUND(AVG(CASE WHEN daily_activities.type = "tka"       THEN daily_activities.score END), 1) as tka_avg'),
                DB::raw('ROUND(AVG(daily_activities.score), 1) as overall_avg')
            )
            ->groupBy('class_names.id', 'class_names.name')
            ->orderBy('class_names.name')
            ->get();

        return response()->json(['data' => $classStats]);
    }

    // Tambahkan di dalam Controller yang sama
    public function classRanking($classId)
    {
        $studentRankings = DB::table('users')
            ->leftJoin('daily_activities', 'users.id', '=', 'daily_activities.user_id')
            ->where('users.class_id', $classId)
            ->where('users.role', 'student')
            ->select(
                'users.id',
                'users.name',
                // Gunakan COALESCE agar jika belum ada aktivitas, nilainya 0 bukan NULL
                DB::raw('COALESCE(ROUND(AVG(daily_activities.score), 1), 0) as score'),
                DB::raw('COUNT(daily_activities.id) as total_activities')
            )
            ->groupBy('users.id', 'users.name')
            // Urutkan dari nilai tertinggi ke terendah
            ->orderBy('score', 'desc') 
            // Opsional: Jika nilai sama, urutkan berdasarkan aktivitas terbanyak
            ->orderBy('total_activities', 'desc') 
            ->get();

        // Tambahkan nomor urut (rank) secara dinamis
        $rank = 1;
        foreach ($studentRankings as $student) {
            $student->rank = $rank++;
        }

        return response()->json(['data' => $studentRankings]);
    }

    public function teacherSummary()
    {
        $teachers = User::where('role', 'teacher')
            ->withCount(['sessions as total_sessions', 'questions as total_questions'])
            ->get()
            ->map(function ($teacher) {
                $teacher->total_contribution = $teacher->total_sessions + $teacher->total_questions;
                return $teacher;
            })
            ->sortByDesc('total_contribution')
            ->values();

        return response()->json(['data' => $teachers]);
    }
}