<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
   public function update(Request $request)
{
    /** @var \App\Models\User $user */
    $user = Auth::user();

    $request->validate([
        'name' => ['nullable', 'string', 'max:255'],
        'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        'nis' => ['nullable', 'string', 'max:20'],
        'phone_number' => ['nullable', 'string', 'max:20'],
        'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:4086',
        'password' => ['nullable', 'confirmed', 'min:8'],
    ]);

    // --- BAGIAN YANG HARUS DITAMBAHKAN ---
    $user->name = $request->name;
    $user->email = $request->email;
    $user->nis = $request->nis; // Tambahkan ini
    $user->phone_number = $request->phone_number; // Tambahkan ini
    // -------------------------------------

    if ($request->hasFile('avatar')) {
        if ($user->avatar && Storage::exists($user->avatar)) {
            Storage::delete($user->avatar);
        }
        $path = $request->file('avatar')->store('avatars'); 
        $user->avatar = $path;
    }

    if ($request->has('avatar_color')) {
        $user->avatar_color = $request->avatar_color;
    }

    if ($request->filled('password')) {
        $user->password = Hash::make($request->password);
    }

    $user->save();

    return response()->json([
        'message' => 'Profil kamu berhasil diperbarui',
        'user' => [
            'name' => $request->name ?? $user->name,
            'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
            'avatar_color' => $user->avatar_color,
            'email' => $request->email ?? $user->email,
            'nis' => $request->nis ?? $user->nis,
            'phone_number' => $request->phone_number ?? $user->phone_number,
        ]
    ], 200);
}

   public function getSummary()
   {
        $user = Auth::user();
        
        $totalXp = DB::table('daily_activities')->where('user_id', $user->id)->sum('score');
        $totalWorks = \App\Models\Gallery::where('user_id', $user->id)->count();

        $chartData = DB::table('daily_activities')
                    ->where('user_id', $user->id)
                    ->where('created_at', '>=', now()->subDays(7))
                    ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(score) as daily_score'))
                    ->groupBy('date')->orderBy('date', 'ASC')->get();

        $highlights = \App\Models\Gallery::where('user_id', $user->id)
                    ->latest()->limit(4)->get()
                    ->map(function($gallery) {
                        return [
                            'id' => $gallery->id,
                            'title' => $gallery->title,
                            // PERBAIKAN: Gunakan Storage::url
                            'image_url' => $gallery->file_path ? Storage::url($gallery->file_path) : null,
                        ];
                    });

        $recentActivities = DB::table('daily_activities')
                    ->where('user_id', $user->id)
                    ->latest('created_at')->limit(5)->get()
                    ->map(function($act) use ($user) {
                        return [
                            'id' => $act->id,
                            'student_name' => $user->name,
                            // PERBAIKAN: Gunakan Storage::url
                            'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
                            'type' => $act->type,
                            'score' => $act->score,
                            'time_ago' => \Carbon\Carbon::parse($act->created_at)->diffForHumans()
                        ];
                    });

        return response()->json([
            'user' => [
                'name' => $user->name,
                // PERBAIKAN: Gunakan Storage::url
                'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
                'avatar_color' => $user->avatar_color,
            ],
            'stats' => [
                'total_xp' => (int)$totalXp,
                'total_works' => $totalWorks,
                'rank' => $this->determineRank($totalXp),
                'streak' => 5, 
                'recent_activities' => $recentActivities
            ],
            'chart' => $chartData,
            'highlights' => $highlights
        ]);
    }

    private function determineRank($score) {
        if ($score >= 1000) return 'Legenda Tapamajuma';
        if ($score >= 500) return 'Pahlawan Belajar';
        return 'Pejuang Belajar';
    }
}