<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validasi diubah: 'login' menggantikan 'email', dan tidak wajib format email
        $request->validate([
            'login' => ['required', 'string'], 
            'password' => ['required'],
        ], [
            'login.required' => 'Email atau NISN wajib diisi.',
        ]);

        // 2. Deteksi apakah input 'login' adalah Email atau NISN
        // Jika mengandung '@', kita anggap email. Jika tidak, kita anggap NISN.
        $loginField = str_contains($request->login, '@') ? 'email' : 'nis';

        // 3. Coba Autentikasi dengan field yang dinamis
        $credentials = [
            $loginField => $request->login,
            'password' => $request->password
        ];

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            
            // Opsional: Hapus token lama agar tidak bisa login di banyak device/browser
            // $user->tokens()->delete(); 

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login success',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]);
        }

        // 4. Pesan error disesuaikan
        return response()->json([
            'message' => 'Kredensial (Email/NISN atau Password) salah.'
        ], 401);
    }

    public function destroy(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Logout berhasil']);
    }
}