<?php

namespace App\Imports;

use App\Models\AllowedNis;
use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading; // <-- WAJIB
use Maatwebsite\Excel\Concerns\WithBatchInserts; // <-- WAJIB

class NisnImport implements ToCollection, WithChunkReading
{
    public $insertedCount = 0; 
    public $autoBindCount = 0;

    public function collection(Collection $rows)
    {
        // Karena ToCollection memproses per chunk, 
        // pastikan header hanya dilewati di baris pertama chunk pertama jika perlu.
        // Tapi biasanya Laravel Excel menghandle ini.
        
        foreach ($rows as $index => $row) {
            // Lewati header baris pertama
            if ($index === 0) continue;

            $nisn = trim($row[0]);
            if (empty($nisn) || !is_numeric($nisn)) continue;

            // === LOGIKA AUTO-BINDING ===
            $existingUser = User::where('nis', $nisn)
                                ->where('role', 'student')
                                ->first();

            $isUsed = $existingUser ? true : false;
            $usedBy = $existingUser ? $existingUser->id : null;

            // Gunakan updateOrCreate supaya jika ada data double di CSV, 
            // tidak error dan tetap update status terbaru
            $record = AllowedNis::updateOrCreate(
                ['nis' => $nisn],
                ['is_used' => $isUsed, 'used_by' => $usedBy]
            );
            
            if ($record->wasRecentlyCreated) {
                $this->insertedCount++;
                if ($isUsed) $this->autoBindCount++;
            }
        }
    }

    // --- KUNCI AGAR SERVER KUAT ---
    
    /**
     * Membaca file per 100 baris. 
     * RAM server tidak akan pernah penuh karena data tidak dimuat semua sekaligus.
     */
    public function chunkSize(): int
    {
        return 100; 
    }
}