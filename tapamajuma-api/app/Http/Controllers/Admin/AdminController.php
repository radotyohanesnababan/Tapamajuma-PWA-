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
            // 1. Ambil Statistik Utama
            $totalStudents = User::where('role', 'student')->count();
            $totalXP = DailyActivity::sum('score');

            // 2. Ambil Sebaran Aktivitas per Mata Pelajaran (Keterlibatan Lintas Mapel)
            // Ini membuktikan poin "Mengaktifkan keterlibatan guru lintas mata pelajaran"
            $subjectDistribution = DailyActivity::select('subject', DB::raw('count(*) as total'))
                ->whereNotNull('subject')
                ->groupBy('subject')
                ->orderBy('total', 'desc')
                ->get();

            // 3. Ambil 5 Aktivitas Terbaru (Log Autentik)
            $recentActivities = DailyActivity::with('user')
                ->latest()
                ->limit(5)
                ->get()
                ->map(function($activity) {
                    return [
                        'id' => $activity->id,
                        'student_name' => $activity->user->name ?? 'Siswa',
                        'type' => $activity->type, // literasi atau numeracy
                        'subject' => $activity->subject, // Mapel terkait
                        'score' => $activity->score,
                        'time_ago' => $activity->created_at->diffForHumans(),
                    ];
                });

            return response()->json([
                'total_students' => $totalStudents,
                'total_xp' => $totalXP,
                'subject_stats' => $subjectDistribution, // Data untuk grafik mapel
                'recent_activities' => $recentActivities
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


}
