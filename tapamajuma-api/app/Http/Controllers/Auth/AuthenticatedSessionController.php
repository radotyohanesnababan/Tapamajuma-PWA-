<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();
            
            // Hapus semua token lama user ini (biar single device login - Opsional)
            // $user->tokens()->delete(); 

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login success',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]);
        }

        return response()->json(['message' => 'Email atau password salah'], 401);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        // JANGAN pakai Auth::guard('web')->logout(); 
        // Karena itu menghapus session browser, bukan token API.
        
        if ($request->user()) {
            // Hapus token yang dipakai saat request ini
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Logout berhasil']);
    }
}