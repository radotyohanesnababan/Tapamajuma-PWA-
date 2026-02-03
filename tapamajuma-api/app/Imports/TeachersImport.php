<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithValidation;
// use Maatwebsite\Excel\Concerns\WithMultipleSheets; // (Opsional: Aktifkan jika ingin strict sheet 1 saja)

class TeachersImport implements ToModel, WithHeadingRow, WithValidation, WithMultipleSheets
{
    public function sheets(): array
    {
        return [
            0 => $this, // Artinya: Class ini HANYA menangani Sheet index ke-0 (Sheet Pertama)
        ];
    }
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // --- 1. DEFENSIVE CODING (PENTING) ---
        // Cek apakah baris ini memiliki kolom 'nama_lengkap' atau 'email'.
        // Jika tidak ada (misal baris kosong atau ini adalah Sheet 2), LEWATI.
        if (!isset($row['nama_lengkap']) || !isset($row['email'])) {
            return null;
        }

        // --- 2. PARSING LOGIC UNTUK DROPDOWN MAPEL ---
        // Format di Excel: "10 - Matematika"
        // Kita butuh ambil angka "10" saja.
        
        $subjectId = null;
        
        // Cek apakah user memilih mapel (karena kolom ini bisa saja kosong/opsional)
        if (isset($row['mapel_utama_pilih']) && $row['mapel_utama_pilih'] != null) {
            $rawMapel = $row['mapel_utama_pilih'];
            $parts = explode(' - ', $rawMapel);
            
            // Ambil angka depan (ID)
            $subjectId = isset($parts[0]) ? $parts[0] : null;
        }

        // --- 3. CREATE USER ---
        return new User([
            'name'       => $row['nama_lengkap'],
            'email'      => $row['email'],
            'role'       => 'teacher',       // Set role Guru
            'nip'        => $row['nip_opsional'] ?? null, // Pakai null coalescing jika kosong
            'subject_id' => $subjectId,      // Masukkan ID Mapel hasil parsing
            'password'   => Hash::make('guru123'), // Default password
        ]);
    }

    public function rules(): array
    {
        return [
            'nama_lengkap' => 'required',
            'email'        => 'required|email|unique:users,email',
            
            // Mapel boleh kosong (nullable), tapi jika diisi harus format string
            // Sesuaikan header Excel kamu: 'mapel_utama_pilih'
            'mapel_utama_pilih' => 'nullable', 
            
            'nip_opsional' => 'nullable|numeric|unique:users,nis',
        ];
    }
    
    // (Opsional) Custom pesan error agar lebih mudah dibaca user
    public function customValidationMessages()
    {
        return [
            'email.unique' => 'Email :input sudah terdaftar.',
            'nip_opsional.unique' => 'NIP :input sudah digunakan guru lain.',
        ];
    }
}