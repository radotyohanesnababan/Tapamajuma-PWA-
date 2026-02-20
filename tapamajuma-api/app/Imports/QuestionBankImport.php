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
        \Illuminate\Support\Facades\Log::info("MEMBACA BARIS EXCEL: ", $row);

        if (!isset($row['nama_mapel']) || !isset($row['nama_kelas'])) {
            \Illuminate\Support\Facades\Log::warning("BARIS DI-SKIP KARENA HEADER TIDAK COCOK ATAU KOSONG");
            return null;
        }

        $subject = Subject::where('name', trim($row['nama_mapel']))->first();
        $classObj = ClassName::where('name', trim($row['nama_kelas']))->first();

        if (!$subject) {
            \Illuminate\Support\Facades\Log::error("IMPORT GAGAL: Mapel '" . $row['nama_mapel'] . "' tidak ditemukan.");
            return null;
        }
        if (!$classObj) {
            \Illuminate\Support\Facades\Log::error("IMPORT GAGAL: Kelas '" . $row['nama_kelas'] . "' tidak ditemukan.");
            return null;
        }

        // ==========================================
        // FITUR BARU: PEMANGKASAN URL GAMBAR (STRIPPING)
        // ==========================================
        $rawImageLink = $row['link_gambar_opsional'] ?? null; // Pastikan key ini sesuai dengan log kamu sebelumnya
        $cleanImagePath = null;

        if ($rawImageLink) {
            // 1. Ambil URL dasar storage kita secara dinamis (misal: http://127.0.0.1:8000/storage)
            $baseUrlToStrip = Storage::url(''); // Ini akan memberikan URL dasar untuk disk default (biasanya R2 di Render)
            
            // 2. Ganti URL dasar tersebut menjadi string kosong ('')
            // Contoh: http://127.0.0.1:8000/storage/brankas/foto.jpg -> /brankas/foto.jpg
            $cleanImagePath = str_replace($baseUrlToStrip, '', $rawImageLink);

            // 3. Bersihkan garis miring '/' di awal teks jika ada, agar rapi
            $cleanImagePath = ltrim($cleanImagePath, '/');
        }
        // ==========================================

        return new QuestionBank([
            'creator_id'    => $this->creator_id,
            'type'          => trim($row['kategori_soal'] ?? 'numeracy'),
            'subject_id'    => $subject->id,    
            'class_id'      => $classObj->id,
            'question_text' => $row['soal'],
            
            // Masukkan path yang sudah bersih ke database!
            'image'         => $cleanImagePath, 
            
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