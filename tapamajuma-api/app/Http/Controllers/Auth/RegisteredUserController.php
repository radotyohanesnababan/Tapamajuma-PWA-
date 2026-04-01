<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
        'nis' => ['nullable', 'string', 'max:20'],
        'role' => ['required', 'string', 'in:student,teacher'],
        'class_id' => ['nullable'], 
    ]);

    // LOGIKA BARU:
    // Jika siswa, kita simpan ID kelasnya ke accessible_classes.
    // Kita simpan dalam format Array JSON "[1]" agar konsisten jika nanti guru punya banyak kelas "[1, 2, 3]"
    $accessibleClasses = null;
    
    if ($request->role === 'student' && $request->class_id) {
        // Bungkus dalam array karena nama kolomnya jamak (classes)
        $accessibleClasses = [(int) $request->class_id]; 
        // Jika kolom database Anda bukan JSON (tapi String), hapus array-nya: $request->class_id
    }

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->string('password')),
        'role' => $request->role,
        'phone_number' => $request->phone_number,
        'class_id' => $request->class_id,
        'nis' => $request->nis,
        'accessible_classes' => $accessibleClasses, // <--- Simpan di sini
    ]);

    //event(new Registered($user)); // Tetap matikan dulu

    //Auth::login($user);

 return response()->json(['message' => 'User created'], 201);
}
}
