<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithValidation;

class StudentsImport implements ToModel, WithHeadingRow, WithValidation, WithMultipleSheets
{

public function sheets(): array
    {
        return [
            0 => $this, // Artinya: Class ini HANYA menangani Sheet index ke-0 (Sheet Pertama)
        ];
    }
public function model(array $row)
{
    // --- TAMBAHAN PENTING (Defensive Check) ---
    // Cek apakah baris ini memiliki key 'kelas_pilih'.
    // Jika TIDAK ADA (berarti ini baris sampah atau Sheet referensi), return NULL agar dilewati.
    if (!isset($row['kelas_pilih'])) {
        return null; 
    }
    
    // Cek juga jika datanya kosong (null)
    if ($row['kelas_pilih'] == null) {
        return null;
    }

    // --- LOGIC ASLI KAMU (Aman dijalankan sekarang) ---
    // Log::info('Memproses baris valid:', $row); // Opsional debugging

    $rawKelas = $row['kelas_pilih']; 
    $parts = explode(' - ', $rawKelas);
    
    // Jaga-jaga jika format stringnya rusak (tidak ada tanda strip)
    $classId = isset($parts[0]) ? $parts[0] : null;

    return new User([
        'name'     => $row['nama_lengkap'],
        'email'    => $row['email'],
        'role'     => 'student',
        'class_id' => $classId,
        'password' => Hash::make('siswa123'),
    ]);
}

public function rules(): array
{
    return [
        'kelas_pilih' => 'required', // Validasi stringnya harus ada
        // Validasi exists agak tricky karena inputnya string gabungan.
        // Sebaiknya validasi ID manual atau percayakan pada dropdown.
    ];
}
}
