<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AllowedNis; 
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB; 
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'role' => ['required', 'string', 'in:student,teacher'],
            'class_id' => ['nullable'],
            'nis' => ['required_if:role,student', 'nullable', 'string', 'max:20', 'exists:allowed_nis,nis'], 
        ]);

        // 1. Cek apakah NIS sudah dipakai (hanya dieksekusi jika NIS diisi)
        $allowedNis = null;
        if ($request->filled('nis')) {
            $allowedNis = AllowedNis::where('nis', $request->nis)->first();
            
            if ($allowedNis->is_used) {
                // Mengembalikan format error 422 standar Laravel
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => [
                        'nis' => ['NIS ini sudah terdaftar oleh pengguna lain.']
                    ]
                ], 422);
            }
        }

        // LOGIKA KELAS SISWA
        $accessibleClasses = null;
        if ($request->role === 'student' && $request->class_id) {
            $accessibleClasses = [(int) $request->class_id]; 
        }

        // 2. Gunakan DB Transaction
        DB::transaction(function () use ($request, $accessibleClasses, $allowedNis) {
            
            // A. Buat User Baru
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->string('password')),
                'role' => $request->role,
                'phone_number' => $request->phone_number,
                'class_id' => $request->class_id,
                'nis' => $request->nis,
                'accessible_classes' => $accessibleClasses, 
            ]);

            // B. Jika user memasukkan NIS yang valid, tandai terpakai & catat ID-nya
            if ($allowedNis) {
                $allowedNis->update([
                    'is_used' => true,
                    'used_by' => $user->id
                ]);
            }
        });

        // event(new Registered($user)); // Tetap matikan dulu
        // Auth::login($user);

        return response()->json(['message' => 'User created'], 201);
    }
}