<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AllowedNisSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [];
        $now = Carbon::now();

        // Looping untuk membuat data 1 sampai 100
        for ($i = 1; $i <= 100; $i++) {
            
            // Catatan: Jika ingin formatnya seperti "0001", "0002", gunakan str_pad:
            // $nis = str_pad($i, 4, '0', STR_PAD_LEFT);
            // Tapi di sini kita pakai angka 1-100 langsung diubah ke string
            $nis = (string) $i;

            $data[] = [
                'nis'        => $nis,
                'is_used'    => false,
                'used_by'    => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // Gunakan insert() agar lebih cepat daripada create() berulang-ulang
        DB::table('allowed_nis')->insert($data);
    }
}