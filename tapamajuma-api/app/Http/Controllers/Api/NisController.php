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
    
    // 1. Deteksi Tipe Akun
    $isExternalAccount = !str_contains($user->email, '@tapamajuma.id');

    // 2. Validasi Input
    $rules = ['nis' => ['required', 'exists:allowed_nis,nis']];
    if ($isExternalAccount) {
        $rules['password'] = ['required', 'min:6', 'confirmed'];
    }

    $request->validate($rules, [
        'nis.exists' => 'NISN tidak terdaftar dalam sistem sekolah.',
        'password.required' => 'Anda login via Google, silakan buat password untuk login ujian.',
        'password.confirmed' => 'Konfirmasi password tidak cocok.',
    ]);

    // 3. Cek apakah NIS saat ini sudah valid (Mencegah Bypass)
    $isAlreadyValid = \App\Models\AllowedNis::where('nis', $user->nis)
        ->where('is_used', true)
        ->where('used_by', $user->id)
        ->exists();

    if ($isAlreadyValid) {
        return response()->json(['message' => 'Akun Anda sudah memiliki NISN yang terverifikasi.'], 400); 
    }

    // 4. Ambil data NISN target & Cek ketersediaan
    $allowedNis = AllowedNis::where('nis', $request->nis)->first();

    if ($allowedNis->is_used && $allowedNis->used_by !== $user->id) {
        return response()->json([
            'message' => 'Data tidak valid.',
            'errors' => ['nis' => ['NISN ini sudah diklaim oleh akun lain.']]
        ], 422);
    }

    // Simpan status lama sebelum update untuk menentukan pesan response
    $oldNis = $user->nis;

    // 5. Eksekusi Database
    DB::transaction(function () use ($user, $allowedNis, $request, $isExternalAccount) {
        $updateData = ['nis' => $allowedNis->nis];

        if ($isExternalAccount) {
            $updateData['password'] = bcrypt($request->password);
        }

        // Lakukan update
        $user->update($updateData);

        // Kunci di tabel master
        $allowedNis->update([
            'is_used' => true,
            'used_by' => $user->id
        ]);
    });

    // 6. Tentukan Pesan Berdasarkan $oldNis
    $isReplacement = !is_null($oldNis) && $oldNis !== $allowedNis->nis;

    return response()->json([
        'message' => $isReplacement 
            ? 'NISN & Kredensial Ujian berhasil diperbarui! 🔄' 
            : 'NISN & Kredensial Ujian berhasil diverifikasi! 🔓',
        'user' => $user->fresh() // Mengambil data terbaru dari DB
    ], 200);
}
}