<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index()
    {
        $schools = School::select('id', 'name', 'slug', 'is_active', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $schools,
            'meta' => [
                'total'  => $schools->count(),
                'active' => $schools->where('is_active', true)->count(),
            ],
        ]);
    }

    public function ecosystemMetrics()
    {
        $cacheKey = 'developer:ecosystem_metrics';
        $refresh = request()->boolean('refresh', false);

        if ($refresh) {
            Cache::forget($cacheKey);
        }

        $metrics = Cache::remember($cacheKey, 900, function () {
            $schools = School::where('is_active', true)->get();

            $totalStudents = 0;
            $totalTeachers = 0;
            $totalActivitiesThisMonth = 0;

            foreach ($schools as $school) {
                try {
                    $conn = $this->getTenantConnection($school);

                    $totalStudents += DB::connection($conn)->table('users')
                        ->where('role', 'student')->count();

                    $totalTeachers += DB::connection($conn)->table('users')
                        ->where('role', 'teacher')->count();

                    $totalActivitiesThisMonth += DB::connection($conn)->table('daily_activities')
                        ->whereYear('created_at', now()->year)
                        ->whereMonth('created_at', now()->month)
                        ->count();
                } catch (\Exception $e) {
                    Log::warning("Ecosystem metrics error for school [{$school->slug}]: " . $e->getMessage());
                }
            }

            return [
                'total_schools'               => $schools->count(),
                'total_students'              => $totalStudents,
                'total_teachers'              => $totalTeachers,
                'total_activities_this_month' => $totalActivitiesThisMonth,
                'cached_at'                   => now()->toDateTimeString(),
            ];
        });

        return response()->json(['data' => $metrics]);
    }

    public function schoolLeaderboard()
    {
        $schools = School::where('is_active', true)->get();
        $leaderboard = [];

        foreach ($schools as $school) {
            try {
                $conn = $this->getTenantConnection($school);

                $totalStudents = DB::connection($conn)->table('users')
                    ->where('role', 'student')->count();

                $activeStudents = DB::connection($conn)->table('daily_activities')
                    ->distinct('user_id')
                    ->where('created_at', '>=', now()->subDays(14))
                    ->count('user_id');

                $lastActivityAt = DB::connection($conn)->table('daily_activities')
                    ->max('created_at');

                $daysSinceLastActivity = $lastActivityAt
                    ? now()->diffInDays($lastActivityAt)
                    : null;

                $status = 'pasif';
                if ($daysSinceLastActivity !== null) {
                    if ($daysSinceLastActivity <= 3) $status = 'sangat_aktif';
                    elseif ($daysSinceLastActivity <= 7) $status = 'aktif';
                    elseif ($daysSinceLastActivity <= 14) $status = 'perlu_perhatian';
                }

                $adoptionRate = $totalStudents > 0
                    ? round(($activeStudents / $totalStudents) * 100, 1)
                    : 0;

                $leaderboard[] = [
                    'id'                      => $school->id,
                    'name'                    => $school->name,
                    'slug'                    => $school->slug,
                    'is_active'               => $school->is_active,
                    'total_students'          => $totalStudents,
                    'active_students_14d'     => $activeStudents,
                    'adoption_rate'           => $adoptionRate,
                    'days_since_last_activity'=> $daysSinceLastActivity,
                    'status'                  => $status,
                ];
            } catch (\Exception $e) {
                Log::warning("Leaderboard error for school [{$school->slug}]: " . $e->getMessage());
                $leaderboard[] = [
                    'id'     => $school->id,
                    'name'   => $school->name,
                    'slug'   => $school->slug,
                    'status' => 'error',
                    'error'  => $e->getMessage(),
                ];
            }
        }

        usort($leaderboard, fn($a, $b) => ($b['adoption_rate'] ?? 0) <=> ($a['adoption_rate'] ?? 0));

        return response()->json(['data' => $leaderboard]);
    }

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
}
