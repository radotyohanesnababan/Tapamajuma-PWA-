<?php

namespace App\Imports;

use App\Models\QuestionBank;
use App\Models\Subject;
use App\Models\ClassName; // Pastikan Model ClassName sudah ada
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\WithValidation;

class QuestionBankImport implements ToModel, WithHeadingRow, WithMultipleSheets
{
public function sheets(): array
    {
        return [
            0 => $this, // Artinya: Class ini HANYA menangani Sheet index ke-0 (Sheet Pertama)
        ];
    }
    protected $creator_id;

    // Kita butuh ID user yang login, jadi kita passing lewat constructor
    public function __construct($creator_id)
    {
        $this->creator_id = $creator_id;
    }

    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // 1. Cari Subject ID berdasarkan Nama (Kolom A di CSV)
        // Pastikan header CSV kamu: nama_mapel, nama_kelas, soal, pila, pilb, pilc, kunci
        $subject = Subject::where('name', trim($row['nama_mapel']))->first();

        // 2. Cari Class ID berdasarkan Nama (Kolom B di CSV)
        $classObj = ClassName::where('name', trim($row['nama_kelas']))->first();

        // Jika Mapel atau Kelas tidak ditemukan, return null (baris ini akan diskip/tidak disimpan)
        if (!$subject || !$classObj) {
            return null;
        }

        // 3. Return Model Baru
        return new QuestionBank([
            'creator_id'    => $this->creator_id,
            'subject_id'    => $subject->id,
            'class_id'      => $classObj->id,
            'question_text' => $row['soal'],
            // Susun array Options untuk kolom JSON
            'options'       => [
                'A' => $row['pilihan_a'],
                'B' => $row['pilihan_b'],
                'C' => $row['pilihan_c'],
            ],
            'correct_key'   => strtoupper($row['kunci']),
        ]);
    }
}