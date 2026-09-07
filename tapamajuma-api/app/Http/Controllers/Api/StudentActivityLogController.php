<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use App\Models\DailyActivity;
use App\Models\Gallery;
use Illuminate\Http\Request;

class StudentActivityLogController extends Controller
{
    /**
     * Mengambil riwayat aktivitas siswa:
     * - Ringkasan latihan soal & galeri
     * - Rata-rata nilai per semester
     * - Riwayat latihan soal (dengan filter & pagination)
     * - Riwayat galeri karya siswa (dengan pagination)
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // 1. Ringkasan Keseluruhan
        $totalActivities = DailyActivity::where('user_id', $user->id)->count();
        $avgScore = round((float) (DailyActivity::where('user_id', $user->id)->avg('score') ?? 0), 1);
        $totalGalleries = Gallery::where('user_id', $user->id)->count();
        $avgConfidence = round((float) (DailyActivity::where('user_id', $user->id)->avg('confidence_level') ?? 0), 1);

        $typeCounts = [
            'literacy' => DailyActivity::where('user_id', $user->id)->where('type', 'literacy')->count(),
            'numeracy' => DailyActivity::where('user_id', $user->id)->where('type', 'numeracy')->count(),
            'tka'      => DailyActivity::where('user_id', $user->id)->where('type', 'tka')->count(),
        ];

        // 2. Statistik per Semester (Academic Periods)
        $periods = AcademicPeriod::orderBy('created_at', 'desc')->get();
        $semesterStats = $periods->map(function ($period) use ($user) {
            $activitiesQuery = DailyActivity::where('user_id', $user->id)
                ->where(function ($q) use ($period) {
                    $q->where('academic_period_id', $period->id);
                    if ($period->opened_at) {
                        $end = $period->closed_at ?? now();
                        $q->orWhere(function ($sub) use ($period, $end) {
                            $sub->whereNull('academic_period_id')
                                ->whereBetween('created_at', [$period->opened_at, $end]);
                        });
                    }
                });

            $count = $activitiesQuery->count();
            $avg = $count > 0 ? round((float) $activitiesQuery->avg('score'), 1) : 0;

            $galleryCount = Gallery::where('user_id', $user->id)
                ->where(function ($q) use ($period) {
                    $q->where('academic_period_id', $period->id);
                    if ($period->opened_at) {
                        $end = $period->closed_at ?? now();
                        $q->orWhere(function ($sub) use ($period, $end) {
                            $sub->whereNull('academic_period_id')
                                ->whereBetween('created_at', [$period->opened_at, $end]);
                        });
                    }
                })->count();

            return [
                'id'               => $period->id,
                'name'             => $period->name,
                'semester'         => $period->semester,
                'academic_year'    => $period->academic_year,
                'is_active'        => (bool) $period->is_active,
                'activities_count' => $count,
                'average_score'    => $avg,
                'galleries_count'  => $galleryCount,
            ];
        });

        // 3. Riwayat Kegiatan Latihan Soal
        $activitiesQuery = DailyActivity::where('user_id', $user->id)
            ->with(['reflection', 'academicPeriod']);

        // Filter Tipe
        if ($request->filled('type') && $request->type !== 'all') {
            $activitiesQuery->where('type', $request->type);
        }

        // Filter Semester
        if ($request->filled('academic_period_id') && $request->academic_period_id !== 'all') {
            $periodId = $request->academic_period_id;
            $period = AcademicPeriod::find($periodId);
            if ($period) {
                $activitiesQuery->where(function ($q) use ($period) {
                    $q->where('academic_period_id', $period->id);
                    if ($period->opened_at) {
                        $end = $period->closed_at ?? now();
                        $q->orWhere(function ($sub) use ($period, $end) {
                            $sub->whereNull('academic_period_id')
                                ->whereBetween('created_at', [$period->opened_at, $end]);
                        });
                    }
                });
            }
        }

        // Filter Mata Pelajaran
        if ($request->filled('subject') && $request->subject !== 'all') {
            $activitiesQuery->where('subject', $request->subject);
        }

        // Paginasi 20 item per halaman
        $activities = $activitiesQuery->latest()->paginate($request->input('per_page', 20));

        // 4. Riwayat Galeri Siswa
        $galleriesQuery = Gallery::where('user_id', $user->id)
            ->with(['subject', 'academicPeriod']);

        if ($request->filled('academic_period_id') && $request->academic_period_id !== 'all') {
            $galleriesQuery->where('academic_period_id', $request->academic_period_id);
        }

        if ($request->filled('subject_id') && $request->subject_id !== 'all') {
            $galleriesQuery->where('subject_id', $request->subject_id);
        }

        $galleries = $galleriesQuery->latest()->paginate($request->input('gallery_per_page', 20));

        // 5. Daftar Mata Pelajaran untuk Dropdown Filter
        $dbSubjects = \App\Models\Subject::orderBy('name')->get(['id', 'name']);
        $activitySubjects = DailyActivity::where('user_id', $user->id)
            ->whereNotNull('subject')
            ->where('subject', '!=', '')
            ->distinct()
            ->pluck('subject');

        // Gabungkan list nama mapel yang unik
        $allSubjectNames = collect($dbSubjects->pluck('name'))
            ->merge($activitySubjects)
            ->unique()
            ->filter()
            ->sort()
            ->values();

        return response()->json([
            'summary' => [
                'total_activities'   => $totalActivities,
                'average_score'      => $avgScore,
                'total_galleries'    => $totalGalleries,
                'type_counts'        => $typeCounts,
                'average_confidence' => $avgConfidence,
            ],
            'semester_stats'   => $semesterStats,
            'activities'       => $activities,
            'galleries'        => $galleries,
            'subjects'         => $allSubjectNames,
            'db_subjects'      => $dbSubjects,
            'academic_periods' => $periods->map(fn($p) => [
                'id'        => $p->id,
                'name'      => $p->name,
                'semester'  => $p->semester,
                'academic_year' => $p->academic_year,
                'is_active' => (bool) $p->is_active,
            ]),
        ]);
    }
}
