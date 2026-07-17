<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use App\Models\DailyActivity;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function getStudentSummary()
    {
        try {
            $period = AcademicPeriod::current(); // ✅ Ambil periode aktif

            $totalStudents = User::where('role', 'student')->count();

            // ✅ XP dari periode aktif (xp_points sudah di-reset per semester)
            $totalXP = User::where('role', 'student')->sum('xp_points');

            // ✅ Filter by periode aktif
            $subjectDistribution = DailyActivity::select('subject', DB::raw('count(*) as total'))
                ->whereNotNull('subject')
                ->when($period, fn($q) => $q->where('academic_period_id', $period->id))
                ->groupBy('subject')
                ->orderBy('total', 'desc')
                ->get();

            // ✅ Filter by periode aktif
            $recentActivities = DailyActivity::with(['user', 'xpLog'])
                ->when($period, fn($q) => $q->where('academic_period_id', $period->id))
                ->latest()
                ->limit(5)
                ->get()
                ->map(function ($activity) {
                    return [
                        'id'           => $activity->id,
                        'student_name' => $activity->user->name ?? 'Siswa',
                        'type'         => $activity->type,
                        'subject'      => $activity->subject,
                        'score'        => $activity->score,
                        'xp'           => $activity->xpLog->xp ?? 0,
                        'avatar'       => $activity->user->avatar ?? null,
                        'time_ago'     => $activity->created_at->setTimezone('Asia/Jakarta')->diffForHumans(),
                    ];
                });

            return response()->json([
                'period'            => $period?->name, // ✅ Info periode aktif
                'total_students'    => $totalStudents,
                'total_xp'         => $totalXP,
                'subject_stats'    => $subjectDistribution,
                'recent_activities' => $recentActivities,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
