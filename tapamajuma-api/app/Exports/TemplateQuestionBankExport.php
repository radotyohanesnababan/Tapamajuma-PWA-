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
use PhpOffice\PhpSpreadsheet\Style\Border;

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
            'Nama Mapel',      // A
            'Nama Kelas',      // B
            'Soal',            // C
            'Pilihan A',       // D
            'Pilihan B',       // E
            'Pilihan C',       // F
            'Kunci'    // G
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet;
                $rowCount = 100; // Terapkan validasi sampai baris 100

                // A. STYLING HEADER
                $sheet->getStyle('A1:G1')->getFont()->setBold(true);
                $sheet->getStyle('A1:G1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // B. ATUR LEBAR KOLOM
                $sheet->getColumnDimension('A')->setWidth(25); 
                $sheet->getColumnDimension('B')->setWidth(15); 
                $sheet->getColumnDimension('C')->setWidth(50); 
                $sheet->getColumnDimension('D')->setWidth(20); 
                $sheet->getColumnDimension('E')->setWidth(20); 
                $sheet->getColumnDimension('F')->setWidth(20); 
                $sheet->getColumnDimension('G')->setWidth(15); 

                // C. SETUP DROPDOWN MAPEL (Kolom A)
                // Merujuk ke Sheet 'DataReferensi', Kolom A
                $validationMapel = $sheet->getCell('A2')->getDataValidation();
                $validationMapel->setType(DataValidation::TYPE_LIST);
                $validationMapel->setErrorStyle(DataValidation::STYLE_STOP);
                $validationMapel->setAllowBlank(false);
                $validationMapel->setShowDropDown(true);
                $validationMapel->setFormula1("'DataReferensi'!\$A\$2:\$A\$1000");

                // D. SETUP DROPDOWN KELAS (Kolom B)
                // Merujuk ke Sheet 'DataReferensi', Kolom B
                $validationKelas = $sheet->getCell('B2')->getDataValidation();
                $validationKelas->setType(DataValidation::TYPE_LIST);
                $validationKelas->setErrorStyle(DataValidation::STYLE_STOP);
                $validationKelas->setAllowBlank(false);
                $validationKelas->setShowDropDown(true);
                $validationKelas->setFormula1("'DataReferensi'!\$B\$2:\$B\$1000");

                // E. SETUP DROPDOWN KUNCI (Kolom G)
                // Manual A, B, C
                $validationKunci = $sheet->getCell('G2')->getDataValidation();
                $validationKunci->setType(DataValidation::TYPE_LIST);
                $validationKunci->setErrorStyle(DataValidation::STYLE_STOP);
                $validationKunci->setAllowBlank(false);
                $validationKunci->setShowDropDown(true);
                $validationKunci->setFormula1('"A,B,C"');

                // F. LOOP PENERAPAN VALIDASI & STYLE BARIS
                for ($i = 2; $i <= $rowCount; $i++) {
                    $sheet->getCell("A$i")->setDataValidation(clone $validationMapel);
                    $sheet->getCell("B$i")->setDataValidation(clone $validationKelas);
                    $sheet->getCell("G$i")->setDataValidation(clone $validationKunci);
                    
                    // Wrap text untuk kolom Soal agar tidak memanjang ke samping
                    $sheet->getStyle("C$i")->getAlignment()->setWrapText(true);
                    // Align Top semua cell
                    $sheet->getStyle("A$i:G$i")->getAlignment()->setVertical(Alignment::VERTICAL_TOP);
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
        return 'DataReferensi'; // Nama Sheet Sumber (PENTING)
    }

    public function array(): array
    {
        // Ambil Data dari Database
        $subjects = Subject::pluck('name')->toArray();
        $classes  = ClassName::pluck('name')->toArray();

        // Cari array terpanjang untuk batas looping
        $maxRows = max(count($subjects), count($classes));

        // Header
        $data = [['Daftar Mapel', 'Daftar Kelas']];

        // Gabungkan data menjadi kolom A dan B
        for ($i = 0; $i < $maxRows; $i++) {
            $data[] = [
                $subjects[$i] ?? null, // Kolom A
                $classes[$i] ?? null   // Kolom B
            ];
        }

        return $data;
    }
}