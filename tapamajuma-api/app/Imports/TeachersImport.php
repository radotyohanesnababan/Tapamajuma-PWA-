<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithValidation;

class TeachersImport implements ToModel, WithHeadingRow, WithValidation, WithMultipleSheets
{
    public function sheets(): array
    {
        return [0 => $this];
    }

    /**
     * Jurus Tangkis: Bersihkan data sebelum divalidasi
     */
    public function prepareForValidation($data, $index)
    {
        // Jika nama dan email kosong, anggap baris sampah
        if (empty($data['nama_lengkap']) && empty($data['email'])) {
            return []; 
        }

        return $data;
    }

    public function model(array $row)
    {
        // Jika baris tidak punya kolom penting, lewati saja
        if (!isset($row['nama_lengkap']) || empty($row['nama_lengkap'])) {
            return null;
        }

        $subjectId = null;
        if (isset($row['mapel_utama_pilih']) && $row['mapel_utama_pilih'] != null) {
            $rawMapel = $row['mapel_utama_pilih'];
            $parts = explode(' - ', $rawMapel);
            $subjectId = isset($parts[0]) ? $parts[0] : null;
        }

        return new User([
            'name'       => $row['nama_lengkap'],
            'email'      => $row['email'],
            'role'       => 'teacher',
            'nis'        => $row['nis_opsional'] ?? null,
            'subject_id' => $subjectId,
            'password'   => Hash::make('guru123'),
        ]);
    }

    public function rules(): array
    {
        return [
            // Pakai sometimes agar baris kosong tidak memicu error required
            'nama_lengkap' => 'sometimes|required',
            'email'        => 'sometimes|required|email|unique:users,email',
            
            // Perbaikan: pastikan menunjuk ke kolom 'nis' di DB, bukan 'nis'
            'nis_opsional' => 'nullable|numeric|unique:users,nis', 
        ];
    }

    public function customValidationMessages()
    {
        return [
            'email.unique' => 'Email :input sudah terdaftar.',
            'nis_opsional.unique' => 'nis :input sudah digunakan guru lain.',
            'email.required' => 'Ada email yang belum diisi di baris data.',
        ];
    }
}