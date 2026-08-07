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

    $hasValidNis = AllowedNis::where('nis', $user->nis)
        ->where('is_used', true)
        ->where('used_by', $user->id)
        ->exists();

    // 2. Validasi (sama seperti sebelumnya)
    $rules = [];
    if (!$hasValidNis) {
        $rules['nis'] = ['required', 'string', 'exists:allowed_nis,nis']; // tambah string
    } else {
        $rules['nis'] = ['nullable', 'string', 'exists:allowed_nis,nis'];
    }

    if ($isExternalAccount) {
        $rules['password'] = ['required', 'min:6', 'confirmed'];
    }

    $request->validate($rules, [
        'nis.required' => 'NISN wajib diisi.',
        'nis.exists' => 'NISN tidak terdaftar.',
        'password.required' => 'Silakan buat password untuk login manual (SEB).',
    ]);

    // 3. Eksekusi
    DB::transaction(function () use ($user, $request, $hasValidNis, $isExternalAccount) {
        
        // ✅ FIX 1: Lock user row JUGA untuk prevent concurrent update
        $lockedUser = \App\Models\User::lockForUpdate()->find($user->id);
        
        $updateData = [];

        if (!$hasValidNis && $request->has('nis')) {
            $allowedNis = AllowedNis::where('nis', $request->nis)
                ->lockForUpdate()
                ->first();

            if (!$allowedNis) {
                throw ValidationException::withMessages([
                    'nis' => 'NISN tidak terdaftar.',
                ]);
            }

            if ($allowedNis->is_used && $allowedNis->used_by !== $user->id) {
                throw ValidationException::withMessages([
                    'nis' => 'NISN ini sudah diklaim oleh akun lain.',
                ]);
            }

            $updateData['nis'] = (string) $allowedNis->nis; // ✅ FIX 2: cast ke string

            $allowedNis->update([
                'is_used' => true,
                'used_by' => $user->id
            ]);
        }

        if ($isExternalAccount && $request->has('password')) {
            $updateData['password'] = bcrypt($request->password);
            $updateData['is_password_set'] = true;
        }

        if (!empty($updateData)) {
            // ✅ FIX 1: Pakai locked user, bukan $user yang di-load luar transaction
            $lockedUser->update($updateData);
        }
    });

    // ✅ FIX 3: Refresh user dari DB setelah transaction commit
    $user->refresh();

    return response()->json([
        'message' => 'Kredensial berhasil diperbarui! 🔓',
        'user' => $user
    ], 200);
}
}