<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AllowedNis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class NisController extends Controller
{
    /**
     * Handle claim NISN untuk user lama yang belum memiliki NIS.
     */
public function claimNis(Request $request)
{
    $user = Auth::user();
    
    // 1. Deteksi Kondisi Akun
    $isExternalAccount = !str_contains($user->email, '@tapamajuma.id');
    
    $hasValidNis = \App\Models\AllowedNis::where('nis', $user->nis)
        ->where('is_used', true)
        ->where('used_by', $user->id)
        ->exists();

    // 2. Validasi
    $rules = [];
    if (!$hasValidNis) {
        $rules['nis'] = ['required', 'exists:allowed_nis,nis'];
    } else {
        $rules['nis'] = ['nullable', 'exists:allowed_nis,nis'];
    }

    if ($isExternalAccount) {
        $rules['password'] = ['required', 'min:6', 'confirmed'];
        // Hapus baris $updateData['needs_password'] = true; yang tadi nyasar di sini
    }

    $request->validate($rules, [
        'nis.required' => 'NISN wajib diisi.',
        'nis.exists' => 'NISN tidak terdaftar.',
        'password.required' => 'Silakan buat password untuk login manual (SEB).',
    ]);

    // 3. Eksekusi
    DB::transaction(function () use ($user, $request, $hasValidNis, $isExternalAccount) {
        $updateData = [];

        if (!$hasValidNis && $request->has('nis')) {
            $allowedNis = AllowedNis::where('nis', $request->nis)->first();

            if ($allowedNis->is_used && $allowedNis->used_by !== $user->id) {
                throw new \Exception("NISN ini sudah diklaim oleh akun lain.");
            }

            $updateData['nis'] = $allowedNis->nis;

            $allowedNis->update([
                'is_used' => true,
                'used_by' => $user->id
            ]);
        }

        // UPDATE PASSWORD & FLAG
        if ($isExternalAccount && $request->has('password')) {
            $updateData['password'] = bcrypt($request->password);
            // Kunci: Flag ini yang akan mematikan modal selamanya
            $updateData['is_password_set'] = true; 
        }

        if (!empty($updateData)) {
            $user->update($updateData);
        }
    });

    return response()->json([
        'message' => 'Kredensial berhasil diperbarui! 🔓',
        'user' => $user->fresh()
    ], 200);
}
}