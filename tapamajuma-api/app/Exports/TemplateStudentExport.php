<?php

namespace App\Exports;

use App\Exports\Sheets\ClassReferenceSheet;
use App\Exports\Sheets\StudentInputSheet;
use App\Models\ClassName;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class TemplateStudentExport implements WithMultipleSheets
{
    use Exportable;

    public function sheets(): array
    {
        return [
            new StudentInputSheet(),     // Sheet 1: Form Input User
            new ClassReferenceSheet(),   // Sheet 2: Data Sumber (Hidden)
        ];
    }
}

// --- CLASS SHEET 1: INPUT USER ---
namespace App\Exports\Sheets; // Sesuaikan namespace jika dipisah file

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;

class StudentInputSheet implements WithHeadings, WithTitle, WithEvents
{
    public function title(): string
    {
        return 'Input Siswa';
    }

    public function headings(): array
    {
        return [
            'Nama Lengkap',
            'Email',
            'Kelas (Pilih)' // Nanti user pilih di sini
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                // Set lebar kolom agar rapi
                $event->sheet->getColumnDimension('A')->setWidth(30);
                $event->sheet->getColumnDimension('B')->setWidth(30);
                $event->sheet->getColumnDimension('C')->setWidth(25);

                // LOGIC DROPDOWN
                // Kita ambil referensi dari Sheet bernama 'DataKelas', Kolom A
                // A1 sampai A1000 (asumsi max 1000 kelas)
                $validation = $event->sheet->getCell('C2')->getDataValidation();
                $validation->setType(DataValidation::TYPE_LIST);
                $validation->setErrorStyle(DataValidation::STYLE_STOP);
                $validation->setAllowBlank(false);
                $validation->setShowInputMessage(true);
                $validation->setShowErrorMessage(true);
                $validation->setShowDropDown(true);
                $validation->setErrorTitle('Kesalahan Input');
                $validation->setError('Pilih kelas dari daftar yang tersedia.');
                
                // Rumus merujuk ke sheet sebelah
                $validation->setFormula1("'DataKelas'!\$A\$1:\$A\$1000");

                // Terapkan validasi ke baris 2 sampai 100
                for ($i = 2; $i <= 100; $i++) {
                    $event->sheet->getCell("C$i")->setDataValidation(clone $validation);
                }
            },
        ];
    }
}

// --- CLASS SHEET 2: REFERENSI DATA (HIDDEN) ---
namespace App\Exports\Sheets;

use App\Models\Classes; // Model Kelas
use App\Models\ClassName;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithTitle;

class ClassReferenceSheet implements FromCollection, WithTitle
{
    public function title(): string
    {
        return 'DataKelas'; // Nama ini PENTING, harus sama dengan formula di atas
    }

    public function collection()
    {
        // Format data: "ID - Nama Kelas"
        // Contoh: "1 - X RPL 1"
        // Kita butuh format ini agar saat import kita bisa ambil ID-nya (angka depan)
        return ClassName::selectRaw("CONCAT(id, ' - ', name) as label")->get();
    }
}
