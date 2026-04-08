<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AllowedNis;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Laravel\Socialite\Two\AbstractProvider;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class GoogleController extends Controller
{

    // 1. Arahkan user ke Google
    public function redirectToGoogle()
    {
       
        return Socialite::driver('google')->stateless()->redirect();
    }

    // 2. Tangani balasan dari Google
    public function handleGoogleCallback()
{
    try {
        $googleUser = Socialite::driver('google')->stateless()->user();
        $baseUrl = env('FRONTEND_URL', 'https://tapamajuma.smpn1siborongborong.sch.id'); // Ganti dengan URL frontend Anda
        
        // 1. Cari user berdasarkan email
        $user = User::where('email', $googleUser->getEmail())->first();

        if (!$user) {
            // 2. Jika tidak ada, buat user BARU
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'password' => bcrypt(\Illuminate\Support\Str::random(16)), // Password aman
                'role' => null, // Biarkan null agar masuk onboarding
            ]);
        } else {
            // 3. Jika ada, update google_id-nya saja
            $user->update(['google_id' => $googleUser->getId()]);
        }

        // 4. Buat Token Sanctum
        $auth_token = $user->createToken('auth_token')->plainTextToken;
        Log::info('Token Generated: ' . $auth_token);

        // 5. Cek Onboarding (Jika role kosong, berarti user baru/belum pilih role)
        $needsOnboarding = is_null($user->role) ? 'true' : 'false';
        Log::info('Needs Onboarding: ' . $needsOnboarding);
        
        return redirect($baseUrl . '/social-callback?' . http_build_query([
            'auth_token' => $auth_token,
            'needs_onboarding' => $needsOnboarding,
            'role' => $user->role ?? ''
        ]));
        
    } catch (\Exception $e) {
        Log::error('Google Auth Error: ' . $e->getMessage());
        return redirect($baseUrl . '/login?error=google_failed');
    }

    // 3. Lengkapi Profil (Pilih Role & Kelas)

}
public function completeProfile(Request $request)
{
    // 1. Validasi Input KETAT
    $request->validate([
        'role' => ['required', 'string', 'in:student,teacher'],
        'class_id' => ['required_if:role,student', 'nullable', 'integer'],
        // Validasi NIS: Wajib jika siswa, harus 10 digit, dan harus terdaftar di allowed_nis
        'nis' => ['required_if:role,student', 'nullable', 'digits:10', 'exists:allowed_nis,nis'],
    ]);

    $user = Auth::user(); // Ambil user yang sedang login lewat token

    // 2. Cek Status NIS Khusus untuk Siswa
    $allowedNis = null;
    if ($request->role === 'student' && $request->filled('nis')) {
        $allowedNis = AllowedNis::where('nis', $request->nis)->first();
        
        // Tolak jika NISN sudah dipakai orang lain
        if ($allowedNis->is_used) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => [
                    'nis' => ['NISN ini sudah terdaftar oleh pengguna lain.']
                ]
            ], 422);
        }
    }

    // 3. Gunakan DB Transaction agar aman
    DB::transaction(function () use ($user, $request, $allowedNis) {
        
        // A. Update profil user
        $user->update([
            'role' => $request->role,
            'class_id' => $request->role === 'student' ? $request->class_id : null,
            'nis' => $request->role === 'student' ? $request->nis : null,
        ]);

        // B. Jika yang login siswa dan NIS-nya valid, tandai NIS tersebut terpakai
        if ($allowedNis) {
            $allowedNis->update([
                'is_used' => true,
                'used_by' => $user->id
            ]);
        }
    });

    return response()->json([
        'message' => 'Profil berhasil dilengkapi!',
        'role' => $user->role,
        'user' => $user
    ]);
}
}