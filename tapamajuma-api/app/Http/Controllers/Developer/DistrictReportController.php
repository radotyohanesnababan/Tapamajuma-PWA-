<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DistrictReportController extends Controller
{
    private function getTenantConnection(School $school): string
    {
        $connName = 'tenant_' . $school->slug;
        config(["database.connections.{$connName}" => array_merge(
            config('database.connections.tenant'),
            [
                'host'     => $school->db_host,
                'database' => $school->db_name,
                'username' => $school->db_user,
                'password' => decrypt($school->db_password),
            ]
        )]);
        DB::purge($connName);
        return $connName;
    }

    /**
     * Rekapitulasi Laporan Daerah (District Summary)
     */
    public function summary(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date',
        ]);

        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate   = $request->input('end_date', now()->toDateString());

        $schools = School::where('is_active', true)->get();
        $report  = [];
        $totals  = [
            'total_schools'      => $schools->count(),
            'active_schools'     => 0,
            'inactive_schools'   => 0,
            'students'           => 0,
            'active_students'    => 0,
            'teachers'           => 0,
            'active_teachers'    => 0,
            'activities'         => 0,
            'literacy'           => 0,
            'numeracy'           => 0,
            'tka'                => 0,
            'other_activities'   => 0,
            'galleries'          => 0,
            'reflections'        => 0,
            'sessions'           => 0,
            'status_distribution'=> [
                'sangat_aktif'    => 0,
                'aktif'           => 0,
                'perlu_perhatian' => 0,
                'pasif'           => 0,
            ],
        ];

        $dailyAggregation = [];

        foreach ($schools as $school) {
            try {
                $conn = $this->getTenantConnection($school);

                // Total Siswa & Guru
                $totalStudents = DB::connection($conn)->table('users')
                    ->where('role', 'student')->count();

                $totalTeachers = DB::connection($conn)->table('users')
                    ->whereIn('role', ['teacher', 'guru'])->count();

                // Guru aktif (membuat sesi belajar mandiri dalam rentang tanggal)
                $activeTeachers = 0;
                try {
                    $activeTeachers = DB::connection($conn)->table('self_study_sessions')
                        ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                        ->distinct('teacher_id')
                        ->count('teacher_id');
                } catch (\Exception $e) {
                    // Fallback jika tabel belum ada di tenant tertentu
                }

                // Aktivitas Belajar Siswa
                $activities = DB::connection($conn)->table('daily_activities')
                    ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                    ->selectRaw("
                        COUNT(*) as total,
                        SUM(type = 'literacy' OR type = 'membaca' OR type = 'bercerita') as literacy,
                        SUM(type = 'numeracy' OR type = 'berhitung') as numeracy,
                        SUM(type = 'tka') as tka
                    ")
                    ->first();

                $totalAct = (int)($activities->total ?? 0);
                $litAct   = (int)($activities->literacy ?? 0);
                $numAct   = (int)($activities->numeracy ?? 0);
                $tkaAct   = (int)($activities->tka ?? 0);
                $othAct   = max(0, $totalAct - ($litAct + $numAct + $tkaAct));

                // Siswa Aktif
                $activeStudents = DB::connection($conn)->table('daily_activities')
                    ->distinct('user_id')
                    ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                    ->count('user_id');

                // Galeri (Karya Siswa)
                $galleriesCount = 0;
                try {
                    $galleriesCount = DB::connection($conn)->table('galleries')
                        ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                        ->count();
                } catch (\Exception $e) {}

                // Refleksi
                $reflectionsCount = 0;
                try {
                    $reflectionsCount = DB::connection($conn)->table('reflections')
                        ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                        ->count();
                } catch (\Exception $e) {}

                // Sesi Belajar Mandiri
                $sessionsCount = 0;
                try {
                    $sessionsCount = DB::connection($conn)->table('self_study_sessions')
                        ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                        ->count();
                } catch (\Exception $e) {}

                // Adoption Rate & Status Klasifikasi
                $adoptionRate = $totalStudents > 0
                    ? round(($activeStudents / $totalStudents) * 100, 1)
                    : 0;

                if ($adoptionRate >= 75) {
                    $status = 'sangat_aktif';
                } elseif ($adoptionRate >= 50) {
                    $status = 'aktif';
                } elseif ($adoptionRate >= 25) {
                    $status = 'perlu_perhatian';
                } else {
                    $status = 'pasif';
                }

                $schoolData = [
                    'id'               => $school->id,
                    'name'             => $school->name,
                    'slug'             => $school->slug,
                    'address'          => $school->address ?? '-',
                    'phone'            => $school->phone ?? '-',
                    'principal_name'   => $school->principal_name ?? '-',
                    'total_students'   => $totalStudents,
                    'active_students'  => $activeStudents,
                    'total_teachers'   => $totalTeachers,
                    'active_teachers'  => $activeTeachers,
                    'total_activities' => $totalAct,
                    'literacy'         => $litAct,
                    'numeracy'         => $numAct,
                    'tka'              => $tkaAct,
                    'other_activities' => $othAct,
                    'galleries'        => $galleriesCount,
                    'reflections'      => $reflectionsCount,
                    'sessions'         => $sessionsCount,
                    'adoption_rate'    => $adoptionRate,
                    'status'           => $status,
                ];

                $report[] = $schoolData;

                // Akumulasi Total
                $totals['students']         += $totalStudents;
                $totals['active_students']  += $activeStudents;
                $totals['teachers']         += $totalTeachers;
                $totals['active_teachers']  += $activeTeachers;
                $totals['activities']       += $totalAct;
                $totals['literacy']         += $litAct;
                $totals['numeracy']         += $numAct;
                $totals['tka']              += $tkaAct;
                $totals['other_activities'] += $othAct;
                $totals['galleries']        += $galleriesCount;
                $totals['reflections']      += $reflectionsCount;
                $totals['sessions']         += $sessionsCount;
                $totals['status_distribution'][$status]++;

                if ($totalAct > 0) {
                    $totals['active_schools']++;
                } else {
                    $totals['inactive_schools']++;
                }

                // Ambil agregasi timeline harian untuk grafik tren se-kabupaten
                $dailyRows = DB::connection($conn)->table('daily_activities')
                    ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                    ->selectRaw("
                        DATE(created_at) as log_date,
                        COUNT(*) as total,
                        SUM(type = 'literacy' OR type = 'membaca' OR type = 'bercerita') as literacy,
                        SUM(type = 'numeracy' OR type = 'berhitung') as numeracy
                    ")
                    ->groupBy('log_date')
                    ->get();

                foreach ($dailyRows as $row) {
                    $d = $row->log_date;
                    if (!isset($dailyAggregation[$d])) {
                        $dailyAggregation[$d] = [
                            'date'       => $d,
                            'activities' => 0,
                            'literacy'   => 0,
                            'numeracy'   => 0,
                        ];
                    }
                    $dailyAggregation[$d]['activities'] += (int)$row->total;
                    $dailyAggregation[$d]['literacy']   += (int)$row->literacy;
                    $dailyAggregation[$d]['numeracy']   += (int)$row->numeracy;
                }

            } catch (\Exception $e) {
                Log::warning("District report error for school [{$school->slug}]: " . $e->getMessage());
                $totals['inactive_schools']++;
            }
        }

        // Urutkan sekolah dari adopsi tertinggi
        usort($report, fn($a, $b) => $b['adoption_rate'] <=> $a['adoption_rate'] ?: $b['total_activities'] <=> $a['total_activities']);

        // Format timeline terurut berdasarkan tanggal
        ksort($dailyAggregation);
        $timeline = array_values($dailyAggregation);

        // Hitung rata-rata adopsi se-wilayah
        $avgAdoption = $totals['students'] > 0
            ? round(($totals['active_students'] / $totals['students']) * 100, 1)
            : 0;

        return response()->json([
            'data' => [
                'period'               => ['start' => $startDate, 'end' => $endDate],
                'average_adoption_rate'=> $avgAdoption,
                'totals'               => $totals,
                'timeline'             => $timeline,
                'schools'              => $report,
            ]
        ]);
    }

    /**
     * Simplifikasi & Analisis Eksekutif Cerdas Menggunakan Gemini AI
     */
    public function aiExecutiveSummary(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date',
        ]);

        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate   = $request->input('end_date', now()->toDateString());

        // Ambil data summary dari method summary
        $summaryResponse = $this->summary($request);
        $data = $summaryResponse->getData(true)['data'] ?? null;

        if (!$data) {
            return response()->json(['message' => 'Data ringkasan tidak tersedia'], 400);
        }

        $totals = $data['totals'];
        $schools = $data['schools'];
        $avgAdoption = $data['average_adoption_rate'];

        // Top 3 dan Bottom 3 sekolah
        $topSchools = array_slice($schools, 0, 3);
        $bottomSchools = array_slice(array_reverse($schools), 0, 3);

        $topText = implode(', ', array_map(fn($s) => "{$s['name']} (Adopsi: {$s['adoption_rate']}%, Akt: {$s['total_activities']})", $topSchools));
        $bottomText = implode(', ', array_map(fn($s) => "{$s['name']} (Adopsi: {$s['adoption_rate']}%, Akt: {$s['total_activities']})", $bottomSchools));

        $apiKey = env('GEMINI_API_KEY');

        if ($apiKey) {
            try {
                $prompt = "Kamu adalah Penasihat Strategis Pendidikan dan Konsultan Ahli untuk Dinas Pendidikan & Bupati.\n";
                $prompt .= "Analisis data rekapitulasi keaktifan belajar siswa dari platform digital Tapamajuma pada rentang {$startDate} s/d {$endDate}:\n";
                $prompt .= "- Total Sekolah: {$totals['total_schools']} (Aktif beraktivitas: {$totals['active_schools']}, Pasif/Belum aktif: {$totals['inactive_schools']})\n";
                $prompt .= "- Rata-rata Partisipasi Wilayah: {$avgAdoption}%\n";
                $prompt .= "- Populasi Siswa: {$totals['students']} siswa (Siswa Aktif: {$totals['active_students']})\n";
                $prompt .= "- Guru Terlibat: {$totals['active_teachers']} dari {$totals['teachers']} guru\n";
                $prompt .= "- Total Aktivitas: {$totals['activities']} (Literasi: {$totals['literacy']}, Numerasi: {$totals['numeracy']}, Tes Akademik: {$totals['tka']}, Karya Galeri: {$totals['galleries']}, Refleksi: {$totals['reflections']})\n";
                $prompt .= "- Sekolah Kinerja Teratas: {$topText}\n";
                $prompt .= "- Sekolah Perlu Perhatian/Rendah: {$bottomText}\n\n";
                $prompt .= "Tugasmu: Sederhanakan data di atas menjadi format eksekutif yang elegan, tajam, dan solutif untuk laporan pimpinan daerah.\n";
                $prompt .= "Balas HANYA dengan JSON valid (tanpa markdown backtick ```json, tanpa formatting aneh) dengan struktur berikut:\n";
                $prompt .= "{\n";
                $prompt .= '  "executive_summary": "Satu paragraf padat (3-4 kalimat) menyimpulkan performa ekosistem belajar digital daerah pada periode ini.",' . "\n";
                $prompt .= '  "key_highlights": ["3 poin capaian positif dan keberhasilan utama"],' . "\n";
                $prompt .= '  "attention_areas": ["2-3 poin kendala spesifik atau sekolah yang butuh supervisi mendesak"],' . "\n";
                $prompt .= '  "policy_recommendations": ["3 rekomendasi kebijakan taktis dan terukur untuk Pengawas & Kepala Dinas Pendidikan"],' . "\n";
                $prompt .= '  "health_score": 85,' . "\n";
                $prompt .= '  "health_label": "Optimal / Sangat Baik / Cukup / Perlu Peningkatan Khusus"' . "\n";
                $prompt .= "}";

                $model = "gemini-2.5-flash";
                $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

                $aiResponse = Http::timeout(25)
                    ->withHeaders(['Content-Type' => 'application/json'])
                    ->post($url, [
                        'contents' => [['parts' => [['text' => $prompt]]]]
                    ]);

                if ($aiResponse->successful()) {
                    $rawText = $aiResponse->json('candidates.0.content.parts.0.text');
                    if ($rawText) {
                        // Bersihkan backtick jika model mengembalikan format markdown
                        $cleanJson = preg_replace('/^```(?:json)?\s*/i', '', trim($rawText));
                        $cleanJson = preg_replace('/\s*```$/', '', $cleanJson);
                        $parsed = json_decode($cleanJson, true);

                        if ($parsed && isset($parsed['executive_summary'])) {
                            return response()->json([
                                'data' => array_merge($parsed, [
                                    'generated_at' => now()->toIso8601String(),
                                    'source'       => 'gemini-ai'
                                ])
                            ]);
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::warning('AI Executive Summary Error: ' . $e->getMessage());
            }
        }

        // Fallback cerdas berbasis data statistik aktual jika API Key belum tersedia atau jaringan AI offline
        $healthScore = min(100, max(20, (int)($avgAdoption * 0.9 + ($totals['active_schools'] / max(1, $totals['total_schools']) * 20))));
        $healthLabel = $healthScore >= 75 ? 'Optimal' : ($healthScore >= 50 ? 'Baik' : 'Perlu Pendampingan Khusus');

        $fallbackData = [
            'executive_summary' => "Pada periode {$startDate} hingga {$endDate}, keaktifan belajar se-kabupaten mencatatkan tingkat adopsi rata-rata {$avgAdoption}% dengan partisipasi {$totals['active_students']} siswa aktif dari total {$totals['students']} siswa. Sebanyak {$totals['active_schools']} dari {$totals['total_schools']} sekolah telah aktif menggunakan platform pembelajaran digital dengan total {$totals['activities']} aktivitas pembelajaran terselesaikan.",
            'key_highlights' => [
                "Partisipasi aktif sebanyak {$totals['active_students']} siswa dengan total {$totals['activities']} kegiatan terekam.",
                "Rasio pembelajaran didominasi oleh {$totals['literacy']} aktivitas literasi dan {$totals['numeracy']} aktivitas numerasi.",
                "Sekolah unggulan seperti " . ($topSchools[0]['name'] ?? 'Sekolah Percontohan') . " berhasil mencapai tingkat adopsi di atas target wilayah.",
            ],
            'attention_areas' => [
                "Terdapat {$totals['status_distribution']['pasif']} sekolah yang berstatus pasif dengan tingkat adopsi di bawah 25%.",
                "Keterlibatan guru perlu ditingkatkan, saat ini tercatat {$totals['active_teachers']} guru aktif dari total {$totals['teachers']} guru terdaftar.",
            ],
            'policy_recommendations' => [
                "Dinas Pendidikan perlu menginstruksikan Pengawas Sekolah untuk melakukan supervisi khusus ke sekolah berkategori Pasif.",
                "Menyelenggarakan workshop penyegaran integrasi modul literasi & numerasi bagi para guru pendamping.",
                "Memberikan apresiasi kepada sekolah dengan adopsi di atas 75% sebagai sekolah rujukan digital tingkat kabupaten.",
            ],
            'health_score' => $healthScore,
            'health_label' => $healthLabel,
            'generated_at' => now()->toIso8601String(),
            'source'       => 'rule-based-engine'
        ];

        return response()->json(['data' => $fallbackData]);
    }

    /**
     * Rincian Mendalam (Drill-Down) Satu Sekolah
     */
    public function schoolDetail($id, Request $request)
    {
        $school = School::where('is_active', true)->findOrFail($id);

        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate   = $request->input('end_date', now()->toDateString());

        try {
            $conn = $this->getTenantConnection($school);

            // Statistik Kelas
            $classesData = [];
            try {
                $classes = DB::connection($conn)->table('class_names')->get();
                foreach ($classes as $cls) {
                    $studentCount = DB::connection($conn)->table('users')
                        ->where('role', 'student')
                        ->where('class_id', $cls->id)
                        ->count();

                    $actCount = DB::connection($conn)->table('daily_activities')
                        ->join('users', 'daily_activities.user_id', '=', 'users.id')
                        ->whereBetween('daily_activities.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                        ->where('users.class_id', $cls->id)
                        ->count();

                    $classesData[] = [
                        'id'            => $cls->id,
                        'name'          => $cls->name,
                        'total_students'=> $studentCount,
                        'activities'    => $actCount,
                    ];
                }
            } catch (\Exception $e) {
                Log::warning("District school detail classes error: " . $e->getMessage());
            }

            // Top Mata Pelajaran
            $topSubjects = [];
            try {
                $topSubjects = DB::connection($conn)->table('daily_activities')
                    ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                    ->whereNotNull('subject')
                    ->where('subject', '!=', '')
                    ->select('subject', DB::raw('count(*) as total'))
                    ->groupBy('subject')
                    ->orderByDesc('total')
                    ->limit(5)
                    ->get();
            } catch (\Exception $e) {}

            // Aktivitas Terbaru
            $recentActivities = [];
            try {
                $recentActivities = DB::connection($conn)->table('daily_activities')
                    ->join('users', 'daily_activities.user_id', '=', 'users.id')
                    ->leftJoin('class_names', 'users.class_id', '=', 'class_names.id')
                    ->whereBetween('daily_activities.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                    ->select(
                        'daily_activities.id',
                        'daily_activities.type',
                        'daily_activities.subject',
                        'daily_activities.created_at',
                        'users.name as student_name',
                        'class_names.name as student_class'
                    )
                    ->orderByDesc('daily_activities.created_at')
                    ->limit(10)
                    ->get();
            } catch (\Exception $e) {}

            return response()->json([
                'data' => [
                    'school'           => [
                        'id'             => $school->id,
                        'name'           => $school->name,
                        'slug'           => $school->slug,
                        'domain'         => $school->domain,
                        'address'        => $school->address,
                        'phone'          => $school->phone,
                        'email'          => $school->email,
                        'principal_name' => $school->principal_name,
                        'principal_nip'  => $school->principal_nip,
                    ],
                    'classes'          => $classesData,
                    'top_subjects'     => $topSubjects,
                    'recent_activities'=> $recentActivities,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengambil detail sekolah: ' . $e->getMessage()], 500);
        }
    }
}
