<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class StudentsImport implements ToModel, WithHeadingRow, WithValidation, WithMultipleSheets
{
    public function sheets(): array
    {
        return [0 => $this];
    }

    // --- LOGIKA MANUAL: Bersihkan data sebelum divalidasi ---
    public function prepareForValidation($data, $index)
    {
        // Jika kolom utama kosong, kita buat kelas_pilih jadi 'null' agar bisa kita 'skakmat' di rules
        if (empty($data['nama_lengkap']) && empty($data['email'])) {
            return [];
        }

        return $data;
    }

    public function model(array $row)
    {
        
        if (!isset($row['kelas_pilih']) || empty($row['nama_lengkap'])) {
            return null;
        }

        $rawKelas = $row['kelas_pilih']; 
        $parts = explode(' - ', $rawKelas);
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
            // 'sometimes' artinya: Hanya divalidasi kalau datanya ada (nggak kosong total)
            'nama_lengkap' => 'sometimes|required',
            'email'        => 'sometimes|required|email',
            'kelas_pilih'  => 'sometimes|required',
        ];
    }
}