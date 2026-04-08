<?php

namespace App\Imports;

use App\Models\AllowedNis;
use App\Models\User; // <-- WAJIB IMPORT MODEL USER
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;

class NisnImport implements ToCollection
{
    public $insertedCount = 0; 
    public $autoBindCount = 0; // <-- Tambahan: Menghitung berapa yang otomatis terikat

    public function collection(Collection $rows)
    {
        $header = true;
        
        foreach ($rows as $row) {
            if ($header) {
                $header = false;
                continue;
            }

            $nisn = trim($row[0]);

            if (empty($nisn)) continue;

            // === VALIDASI NISN ===
            if (is_numeric($nisn)) {
                
                // === LOGIKA AUTO-BINDING ===
                // Cari apakah ada siswa yang sudah memakai NISN ini
                $existingUser = User::where('nis', $nisn)
                                    ->where('role', 'student')
                                    ->first();

                // Tentukan status awal berdasarkan hasil pencarian di atas
                $isUsed = $existingUser ? true : false;
                $usedBy = $existingUser ? $existingUser->id : null;

                // Masukkan ke database master
                $isNew = AllowedNis::firstOrCreate(
                    ['nis' => $nisn],
                    ['is_used' => $isUsed, 'used_by' => $usedBy]
                );
                
                if ($isNew->wasRecentlyCreated) {
                    $this->insertedCount++;
                    
                    // Hitung jika NISN langsung ter-bind dengan akun siswa lama
                    if ($isUsed) {
                        $this->autoBindCount++;
                    }
                }
            }
        }
    }
}