<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentResource;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
   public function index(Request $request)
{
    $user = $request->user();
    
    return response()->json([
        'user' => new StudentResource($user),
        'stats' => [
            'today_completed' => $user->dailyActivities()->whereDate('created_at', today())->count(),
            'weekly_progress' => $user->dailyActivities()->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
        ]
    ]);
}
}
