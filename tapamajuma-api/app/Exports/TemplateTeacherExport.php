<?php

namespace App\Exports;

use App\Models\ClassName; // Pastikan Model Kelas kamu namanya ClassName
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;

// --- CLASS UTAMA ---
class TemplateTeacherExport implements WithMultipleSheets
{
    use Exportable;

    public function sheets(): array
    {
        return [
            new TeacherInputSheet(),    // Sheet 1: Form Input
            new ClassReferenceSheet(),  // Sheet 2: Data Kelas (Hidden)
        ];
    }
}

// --- SHEET 1: FORM INPUT GURU ---
class TeacherInputSheet implements WithHeadings, WithTitle, WithEvents
{
    public function title(): string
    {
        return 'Input Guru';
    }

    public function headings(): array
    {
        return [
            'Nama Lengkap',
            'Email',
            'Kelas (Pilih)' // Dropdown Kelas (misal untuk Wali Kelas)
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                // 1. Atur Lebar Kolom
                $event->sheet->getColumnDimension('A')->setWidth(30);
                $event->sheet->getColumnDimension('B')->setWidth(30);
                $event->sheet->getColumnDimension('C')->setWidth(25);

                // 2. LOGIC DROPDOWN (Validasi List)
                $validation = $event->sheet->getCell('C2')->getDataValidation();
                $validation->setType(DataValidation::TYPE_LIST);
                $validation->setErrorStyle(DataValidation::STYLE_STOP);
                $validation->setAllowBlank(true); // Boleh kosong jika bukan wali kelas
                $validation->setShowInputMessage(true);
                $validation->setShowErrorMessage(true);
                $validation->setShowDropDown(true);
                $validation->setErrorTitle('Kesalahan Input');
                $validation->setError('Pilih kelas dari daftar yang tersedia.');
                
                // 3. Rumus merujuk ke Sheet 'DataKelas'
                // Pastikan nama sheet di rumus sama persis dengan title() di ClassReferenceSheet
                $validation->setFormula1("'DataKelas'!\$A\$1:\$A\$1000");

                // 4. Terapkan validasi ke baris 2 sampai 100
                for ($i = 2; $i <= 100; $i++) {
                    $event->sheet->getCell("C$i")->setDataValidation(clone $validation);
                }
            },
        ];
    }
}

// --- SHEET 2: REFERENSI DATA (HIDDEN) ---
class ClassReferenceSheet implements FromCollection, WithTitle
{
    public function title(): string
    {
        return 'DataKelas'; // Nama ini PENTING, harus sama dengan formula di atas
    }

    public function collection()
    {
        // Format dropdown: "ID - Nama Kelas" (Contoh: "1 - X RPL 1")
        // Pastikan tabel kamu memiliki kolom 'name'
        return ClassName::selectRaw("CONCAT(id, ' - ', name) as label")->get();
    }
}