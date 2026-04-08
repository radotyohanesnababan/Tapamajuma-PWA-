<?php

namespace App\Exports;

use App\Models\Subject;
use App\Models\ClassName;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

// ==========================================
// 1. CLASS UTAMA (PENGATUR SHEET)
// ==========================================
class TemplateQuestionBankExport implements WithMultipleSheets
{
    use Exportable;

    public function sheets(): array
    {
        return [
            new QuestionInputSheet(),  // Sheet 1: Form Input
            new ReferenceDataSheet(),  // Sheet 2: Data Sumber (Hidden)
        ];
    }
}

// ==========================================
// 2. SHEET 1: FORM INPUT SOAL (VALIDASI)
// ==========================================
class QuestionInputSheet implements WithHeadings, WithTitle, WithEvents
{
    public function title(): string
    {
        return 'Input Bank Soal';
    }

    public function headings(): array
    {
        return [
            'Kategori Soal',          // A
            'Nama Mapel',             // B
            'Nama Kelas',             // C
            'Soal',                   // D
            'Link Gambar (Opsional)', // E (KOLOM BARU)
            'Pilihan A',              // F
            'Pilihan B',              // G
            'Pilihan C',              // H
            'Pilihan D',              // I
            'Pilihan E',              // J
            'Kunci'                   // K (Bergeser dari J)
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet;
                $rowCount = 100; // Terapkan validasi sampai baris 100

                // A. STYLING HEADER (Sekarang sampai kolom K)
                $sheet->getStyle('A1:K1')->getFont()->setBold(true);
                $sheet->getStyle('A1:K1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // B. ATUR LEBAR KOLOM
                $sheet->getColumnDimension('A')->setWidth(20); // Kategori
                $sheet->getColumnDimension('B')->setWidth(25); // Mapel
                $sheet->getColumnDimension('C')->setWidth(15); // Kelas
                $sheet->getColumnDimension('D')->setWidth(50); // Soal
                $sheet->getColumnDimension('E')->setWidth(30); // Link Gambar (Baru)
                $sheet->getColumnDimension('F')->setWidth(20); // Opt A
                $sheet->getColumnDimension('G')->setWidth(20); // Opt B
                $sheet->getColumnDimension('H')->setWidth(20); // Opt C
                $sheet->getColumnDimension('I')->setWidth(20); // Opt D
                $sheet->getColumnDimension('J')->setWidth(20); // Opt E
                $sheet->getColumnDimension('K')->setWidth(15); // Kunci

                // C. SETUP DROPDOWN KATEGORI SOAL (Kolom A)
                $validationKategori = $sheet->getCell('A2')->getDataValidation();
                $validationKategori->setType(DataValidation::TYPE_LIST);
                $validationKategori->setErrorStyle(DataValidation::STYLE_STOP);
                $validationKategori->setAllowBlank(false);
                $validationKategori->setShowDropDown(true);
                $validationKategori->setFormula1('"numeracy,literacy,tka,official"');

                // D. SETUP DROPDOWN MAPEL (Kolom B)
                $validationMapel = $sheet->getCell('B2')->getDataValidation();
                $validationMapel->setType(DataValidation::TYPE_LIST);
                $validationMapel->setErrorStyle(DataValidation::STYLE_STOP);
                $validationMapel->setAllowBlank(false);
                $validationMapel->setShowDropDown(true);
                $validationMapel->setFormula1("'DataReferensi'!\$A\$2:\$A\$1000");

                // E. SETUP DROPDOWN KELAS (Kolom C)
                $validationKelas = $sheet->getCell('C2')->getDataValidation();
                $validationKelas->setType(DataValidation::TYPE_LIST);
                $validationKelas->setErrorStyle(DataValidation::STYLE_STOP);
                $validationKelas->setAllowBlank(false);
                $validationKelas->setShowDropDown(true);
                $validationKelas->setFormula1("'DataReferensi'!\$B\$2:\$B\$1000");

                // F. SETUP DROPDOWN KUNCI (Kolom K)
                $validationKunci = $sheet->getCell('K2')->getDataValidation();
                $validationKunci->setType(DataValidation::TYPE_LIST);
                $validationKunci->setErrorStyle(DataValidation::STYLE_STOP);
                $validationKunci->setAllowBlank(false);
                $validationKunci->setShowDropDown(true);
                $validationKunci->setFormula1('"A,B,C,D,E"');

                // G. LOOP PENERAPAN VALIDASI & STYLE BARIS
                for ($i = 2; $i <= $rowCount; $i++) {
                    $sheet->getCell("A$i")->setDataValidation(clone $validationKategori);
                    $sheet->getCell("B$i")->setDataValidation(clone $validationMapel);
                    $sheet->getCell("C$i")->setDataValidation(clone $validationKelas);
                    $sheet->getCell("K$i")->setDataValidation(clone $validationKunci); // Di kolom K
                    
                    // Wrap text untuk kolom Soal agar tidak memanjang ke samping
                    $sheet->getStyle("D$i")->getAlignment()->setWrapText(true);
                    
                    // Align Top semua cell (Sekarang sampai kolom K)
                    $sheet->getStyle("A$i:K$i")->getAlignment()->setVertical(Alignment::VERTICAL_TOP);
                }
            },
        ];
    }
}

// ==========================================
// 3. SHEET 2: DATA REFERENSI (SUMBER DROPDOWN)
// ==========================================
class ReferenceDataSheet implements FromArray, WithTitle
{
    public function title(): string
    {
        return 'DataReferensi'; 
    }

    public function array(): array
    {
        $subjects = Subject::pluck('name')->toArray();
        $classes  = ClassName::pluck('name')->toArray();

        $maxRows = max(count($subjects), count($classes));

        $data = [['Daftar Mapel', 'Daftar Kelas']];

        for ($i = 0; $i < $maxRows; $i++) {
            $data[] = [
                $subjects[$i] ?? null, 
                $classes[$i] ?? null   
            ];
        }

        return $data;
    }
}