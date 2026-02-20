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
            $isNewUser = $user->wasRecentlyCreated || !$user->role;
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            // Cari user berdasarkan email
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // Jika user ada, update google_id
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);
            } else {
                // Jika user baru, buat user
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'password' => bcrypt(Str::random(16)),
                    'role' => 'student', // Default role
                ]);
            }

            // Buat Token (Sanctum)
            $token = $user->createToken('auth_token')->plainTextToken;

            // Lempar balik ke React (Vercel) sambil bawa token
                    return redirect('https://tapamajuma.vercel.app/social-callback?' . http_build_query([
            'token' => $token,
            'needs_onboarding' => $isNewUser ? 'true' : 'false',
            'role' => $user->role // kirim role jika sudah ada
        ]));
            
        } catch (\Exception $e) {
            Log::error('Google Auth Error: ' . $e->getMessage());
            return redirect('https://tapamajuma-pwa.vercel.app/login?error=google_failed');
        }
    }
}