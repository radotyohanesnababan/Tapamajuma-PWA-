<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
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
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. Cek Onboarding (Jika role kosong, berarti user baru/belum pilih role)
        $needsOnboarding = is_null($user->role) ? 'true' : 'false';

        return redirect('https://tapamajuma-pwa.vercel.app/social-callback?' . http_build_query([
            'token' => $token,
            'needs_onboarding' => $needsOnboarding,
            'role' => $user->role ?? ''
        ]));
        
    } catch (\Exception $e) {
        \Log::error('Google Auth Error: ' . $e->getMessage());
        return redirect('https://tapamajuma-pwa.vercel.app/login?error=google_failed');
    }
}
}