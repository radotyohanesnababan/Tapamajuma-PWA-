<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DailyActivity;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function getStudentSummary()
{
    try {
        $totalStudents = User::where('role', 'student')->count();
        
        // ✅ Ambil dari sum xp_points, bukan sum score
        $totalXP = User::where('role', 'student')->sum('xp_points');

        $subjectDistribution = DailyActivity::select('subject', DB::raw('count(*) as total'))
            ->whereNotNull('subject')
            ->groupBy('subject')
            ->orderBy('total', 'desc')
            ->get();

        $recentActivities = DailyActivity::with('user')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function($activity) {
                // ✅ Ambil XP dari xp_logs
                $xp = DB::table('xp_logs')
                    ->where('source', 'daily_activity')
                    ->where('source_id', $activity->id)
                    ->value('xp') ?? 0;

                return [
                    'id'           => $activity->id,
                    'student_name' => $activity->user->name ?? 'Siswa',
                    'type'         => $activity->type,
                    'subject'      => $activity->subject,
                    'score'        => $activity->score,
                    'xp'           => $xp, // ✅ tambah ini
                    'avatar'       => $activity->user->avatar ?? null,
                    'time_ago'     => $activity->created_at->setTimezone('Asia/Jakarta')->diffForHumans(),
                ];
            });

        return response()->json([
            'total_students'   => $totalStudents,
            'total_xp'         => $totalXP,
            'subject_stats'    => $subjectDistribution,
            'recent_activities' => $recentActivities
        ]);

    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}


}
