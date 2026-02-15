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
            'Kategori Soal',   // A (Baru)
            'Nama Mapel',      // B
            'Nama Kelas',      // C
            'Soal',            // D
            'Pilihan A',       // E
            'Pilihan B',       // F
            'Pilihan C',       // G
            'Pilihan D',       // H
            'Pilihan E',       // I
            'Kunci'            // J
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet;
                $rowCount = 100; // Terapkan validasi sampai baris 100

                // A. STYLING HEADER (Diperbarui sampai kolom J)
                $sheet->getStyle('A1:J1')->getFont()->setBold(true);
                $sheet->getStyle('A1:J1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // B. ATUR LEBAR KOLOM
                $sheet->getColumnDimension('A')->setWidth(20); // Kategori
                $sheet->getColumnDimension('B')->setWidth(25); // Mapel
                $sheet->getColumnDimension('C')->setWidth(15); // Kelas
                $sheet->getColumnDimension('D')->setWidth(50); // Soal
                $sheet->getColumnDimension('E')->setWidth(20); // Opt A
                $sheet->getColumnDimension('F')->setWidth(20); // Opt B
                $sheet->getColumnDimension('G')->setWidth(20); // Opt C
                $sheet->getColumnDimension('H')->setWidth(20); // Opt D
                $sheet->getColumnDimension('I')->setWidth(20); // Opt E
                $sheet->getColumnDimension('J')->setWidth(15); // Kunci

                // C. SETUP DROPDOWN KATEGORI SOAL (Kolom A) -> BARU
                // Menggunakan value baku agar sesuai dengan backend database (numeracy, literacy, tka)
                $validationKategori = $sheet->getCell('A2')->getDataValidation();
                $validationKategori->setType(DataValidation::TYPE_LIST);
                $validationKategori->setErrorStyle(DataValidation::STYLE_STOP);
                $validationKategori->setAllowBlank(false);
                $validationKategori->setShowDropDown(true);
                $validationKategori->setFormula1('"numeracy,literacy,tka"');

                // D. SETUP DROPDOWN MAPEL (Kolom B)
                // Merujuk ke Sheet 'DataReferensi', Kolom A
                $validationMapel = $sheet->getCell('B2')->getDataValidation();
                $validationMapel->setType(DataValidation::TYPE_LIST);
                $validationMapel->setErrorStyle(DataValidation::STYLE_STOP);
                $validationMapel->setAllowBlank(false);
                $validationMapel->setShowDropDown(true);
                $validationMapel->setFormula1("'DataReferensi'!\$A\$2:\$A\$1000");

                // E. SETUP DROPDOWN KELAS (Kolom C)
                // Merujuk ke Sheet 'DataReferensi', Kolom B
                $validationKelas = $sheet->getCell('C2')->getDataValidation();
                $validationKelas->setType(DataValidation::TYPE_LIST);
                $validationKelas->setErrorStyle(DataValidation::STYLE_STOP);
                $validationKelas->setAllowBlank(false);
                $validationKelas->setShowDropDown(true);
                $validationKelas->setFormula1("'DataReferensi'!\$B\$2:\$B\$1000");

                // F. SETUP DROPDOWN KUNCI (Kolom J)
                $validationKunci = $sheet->getCell('J2')->getDataValidation();
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
                    $sheet->getCell("J$i")->setDataValidation(clone $validationKunci);
                    
                    // Wrap text untuk kolom Soal (sekarang di kolom D) agar tidak memanjang ke samping
                    $sheet->getStyle("D$i")->getAlignment()->setWrapText(true);
                    
                    // Align Top semua cell (Sekarang sampai kolom J)
                    $sheet->getStyle("A$i:J$i")->getAlignment()->setVertical(Alignment::VERTICAL_TOP);
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
                $subjects[$i] ?? null, // Kolom A
                $classes[$i] ?? null   // Kolom B
            ];
        }

        return $data;
    }
}