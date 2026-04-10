<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentResource;
use Illuminate\Http\Request;
use App\Models\AllowedNis; // Import model AllowedNis

class DashboardController extends Controller
{
    public function index(Request $request)
{
    $user = $request->user();

    $isNisValid = false;
    if ($user->nis) {
        $isNisValid = AllowedNis::where('nis', $user->nis)
            ->where('is_used', true)
            ->where('used_by', $user->id)
            ->exists();
    }

    $announcements = \App\Models\Announcement::where('is_active', true)
        ->latest()
        ->get(['content']);

    return response()->json([
        'user' => new StudentResource($user),
        'is_nis_valid' => $isNisValid,
        // Logika: Hanya butuh password jika akun luar DAN flag is_password_set masih false
        'needs_password' => !str_contains($user->email, '@tapamajuma.id') && !((bool)$user->is_password_set),
        'announcements' => $announcements,
        'stats' => [
            'today_completed' => $user->dailyActivities()->whereDate('created_at', today())->count(),
            'weekly_progress' => $user->dailyActivities()->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
        ]
    ]);
}
}