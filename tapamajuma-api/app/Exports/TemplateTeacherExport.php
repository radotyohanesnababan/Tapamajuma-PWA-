<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Events\AfterSheet;

class TemplateTeacherExport implements WithHeadings, WithTitle, WithEvents, ShouldAutoSize
{
    use Exportable;

    public function title(): string
    {
        return 'Template Import Guru';
    }

    public function headings(): array
    {
        return [
            'Nama Lengkap',
            'Email',
            'NIS',
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                // 1. Atur Style Header (Baris 1)
                $headerRange = 'A1:C1';
                
                // Warna background Indigo dan teks putih
                $event->sheet->getStyle($headerRange)->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'color' => ['argb' => 'FFFFFFFF'],
                    ],
                    'fill' => [
                        'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FF4F46E5'],
                    ],
                    'alignment' => [
                        'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                    ],
                ]);

                // 2. Tambahkan border tipis untuk area input (opsional, biar rapi)
                $event->sheet->getStyle('A1:C100')->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                            'color' => ['argb' => 'FFCCCCCC'],
                        ],
                    ],
                ]);
            },
        ];
    }
}