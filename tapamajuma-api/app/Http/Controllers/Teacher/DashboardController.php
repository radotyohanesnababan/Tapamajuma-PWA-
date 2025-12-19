<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\DailyActivity;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
       try {
            $activities = DailyActivity::with('user')->latest()->get();
            return response()->json($activities);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getTeacherStats(Request $request)
{
    $className = $request->query('class_name'); 
    
    $query = DailyActivity::query();

    if ($className) {
        $query->whereHas('user', function($q) use ($className) {
            $q->where('class_name', $className);
        });
    }

    $activities = $query->get();

    return response()->json([
        'total_students_active' => $activities->pluck('user_id')->unique()->count(),
        'average_score' => round($activities->avg('score'), 1) ?: 0,
        'average_confidence' => round($activities->avg('confidence_level'), 1) ?: 0,
        'total_submissions' => $activities->count(),
    ]);
}
}
