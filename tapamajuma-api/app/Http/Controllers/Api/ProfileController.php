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
    /**
     * Update profil user (Hanya untuk diri sendiri)
     */
    public function update(Request $request)
    {
        // Langsung ambil user yang sedang login tanpa parameter ID
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:4086',
            'password' => ['nullable', 'confirmed', 'min:8'],
        ]);

        // Update data dasar
        $user->name = $request->name;
        $user->email = $request->email;

        if ($request->hasFile('avatar')) {
        // Hapus foto lama jika ada (opsional)
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->avatar = $path;
    }

        // Update warna avatar jika dikirim dari PWA
        if ($request->has('avatar_color')) {
            $user->avatar_color = $request->avatar_color;
        }

        // Update password hanya jika diisi
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'Profil kamu berhasil diperbarui',
            'user' => $user
        ], 200);
    }

    /**
     * Mengambil data ringkasan untuk halaman Profile/Presentasi (Aksi C.2)
     */
   public function getSummary()
{
    $user = Auth::user();
    
    // 1. Hitung Total XP
    $totalXp = DB::table('daily_activities')
                ->where('user_id', $user->id)
                ->sum('score');

    // 2. Hitung jumlah karya
    $totalWorks = \App\Models\Gallery::where('user_id', $user->id)->count();

    // 3. Ambil data 7 hari terakhir untuk grafik
    $chartData = DB::table('daily_activities')
                ->where('user_id', $user->id)
                ->where('created_at', '>=', now()->subDays(7))
                ->select(
                    DB::raw('DATE(created_at) as date'), 
                    DB::raw('SUM(score) as daily_score')
                )
                ->groupBy('date')
                ->orderBy('date', 'ASC')
                ->get();

    // 4. Ambil Highlights
    $highlights = \App\Models\Gallery::where('user_id', $user->id)
                ->latest()
                ->limit(4)
                ->get()
                ->map(function($gallery) {
                    return [
                        'id' => $gallery->id,
                        'title' => $gallery->title,
                        'image_url' => $gallery->file_path 
                            ? asset('storage/' . $gallery->file_path) 
                            : null,
                    ];
                });

    // 5. TAMBAHAN BARU: Ambil 5 Aktivitas Terakhir untuk UI React
    $recentActivities = DB::table('daily_activities')
                ->where('user_id', $user->id)
                ->latest('created_at')
                ->limit(5)
                ->get()
                ->map(function($act) use ($user) {
                    return [
                        'id' => $act->id,
                        'student_name' => $user->name,
                        // Gunakan asset() agar melempar URL full (http://...)
                        'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null,
                        'type' => $act->type,
                        'score' => $act->score,
                        'time_ago' => \Carbon\Carbon::parse($act->created_at)->diffForHumans()
                    ];
                });

    return response()->json([
        'user' => [
            'name' => $user->name,
            'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null,
            'avatar_color' => $user->avatar_color,
        ],
        'stats' => [
            'total_xp' => (int)$totalXp,
            'total_works' => $totalWorks,
            'rank' => $this->determineRank($totalXp),
            'streak' => 5, 
            'recent_activities' => $recentActivities // <-- SEKARANG DATANYA ADA!
        ],
        'chart' => $chartData,
        'highlights' => $highlights
    ]);
}

    private function determineRank($score)
    {
        if ($score >= 1000) return 'Legenda Tapamajuma';
        if ($score >= 500) return 'Pahlawan Belajar';
        return 'Pejuang Belajar';
    }
}