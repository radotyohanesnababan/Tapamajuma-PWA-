<?php

namespace App\Imports;

use App\Models\QuestionBank;
use App\Models\Subject;
use App\Models\ClassName; // Pastikan Model ClassName sudah ada
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class QuestionBankImport implements ToModel, WithHeadingRow, WithMultipleSheets
{
    protected $creator_id;

    // Kita butuh ID user yang login, jadi kita passing lewat constructor
    public function __construct($creator_id)
    {
        $this->creator_id = $creator_id;
    }

    public function sheets(): array
    {
        return [
            0 => $this, // Artinya: Class ini HANYA menangani Sheet index ke-0 (Sheet Pertama yang berisi Form)
        ];
    }

    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // KITA INTIP ISI EXCEL-NYA DI SINI
        \Illuminate\Support\Facades\Log::info("MEMBACA BARIS EXCEL: ", $row);

        // Cek baris kosong (pintu depan)
        if (!isset($row['nama_mapel']) || !isset($row['nama_kelas'])) {
            \Illuminate\Support\Facades\Log::warning("BARIS DI-SKIP KARENA HEADER TIDAK COCOK ATAU KOSONG");
            return null;
        }

        // 1. Cari Relasi
        $subject = Subject::where('name', trim($row['nama_mapel']))->first();
        $classObj = ClassName::where('name', trim($row['nama_kelas']))->first();

        // 2. LOGGING ERROR JIKA RELASI GAGAL
        if (!$subject) {
            \Illuminate\Support\Facades\Log::error("IMPORT GAGAL: Mapel '" . $row['nama_mapel'] . "' tidak ditemukan.");
            return null;
        }
        if (!$classObj) {
            \Illuminate\Support\Facades\Log::error("IMPORT GAGAL: Kelas '" . $row['nama_kelas'] . "' tidak ditemukan.");
            return null;
        }

        // 3. Simpan jika aman
        return new QuestionBank([
            'creator_id'    => $this->creator_id,
            'type'          => trim($row['kategori_soal'] ?? 'numeracy'),
            'subject_id'    => $subject->id,
            'class_id'      => $classObj->id,
            'question_text' => $row['soal'],
            'options'       => [
                'A' => $row['pilihan_a'] ?? '',
                'B' => $row['pilihan_b'] ?? '',
                'C' => $row['pilihan_c'] ?? '',
                'D' => $row['pilihan_d'] ?? '',
                'E' => $row['pilihan_e'] ?? '',
            ],
            'correct_key'   => strtoupper(trim($row['kunci'])),
        ]);
    }
}