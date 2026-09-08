<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $totals  = ['students' => 0, 'activities' => 0, 'literacy' => 0, 'numeracy' => 0];

        foreach ($schools as $school) {
            try {
                $conn = $this->getTenantConnection($school);

                $totalStudents = DB::connection($conn)->table('users')
                    ->where('role', 'student')->count();

                $activities = DB::connection($conn)->table('daily_activities')
                    ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                    ->selectRaw("COUNT(*) as total, SUM(type = 'literacy') as literacy, SUM(type = 'numeracy') as numeracy")
                    ->first();

                $activeStudents = DB::connection($conn)->table('daily_activities')
                    ->distinct('user_id')
                    ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                    ->count('user_id');

                $schoolData = [
                    'id'              => $school->id,
                    'name'            => $school->name,
                    'slug'            => $school->slug,
                    'total_students'  => $totalStudents,
                    'active_students' => $activeStudents,
                    'total_activities'=> (int)($activities->total ?? 0),
                    'literacy'        => (int)($activities->literacy ?? 0),
                    'numeracy'        => (int)($activities->numeracy ?? 0),
                    'adoption_rate'   => $totalStudents > 0
                        ? round(($activeStudents / $totalStudents) * 100, 1)
                        : 0,
                ];

                $report[] = $schoolData;
                $totals['students']   += $totalStudents;
                $totals['activities'] += $schoolData['total_activities'];
                $totals['literacy']   += $schoolData['literacy'];
                $totals['numeracy']   += $schoolData['numeracy'];
            } catch (\Exception $e) {
                Log::warning("District report error for school [{$school->slug}]: " . $e->getMessage());
            }
        }

        usort($report, fn($a, $b) => $b['adoption_rate'] <=> $a['adoption_rate']);

        return response()->json([
            'data' => [
                'period'  => ['start' => $startDate, 'end' => $endDate],
                'totals'  => $totals,
                'schools' => $report,
            ]
        ]);
    }
}
