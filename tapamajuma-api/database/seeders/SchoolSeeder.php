<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\School;

class SchoolSeeder extends Seeder
{
    public function run()
    {
        School::create([
            'name'             => 'SMP Negeri 1 Siborongborong',
            'slug'             => 'smpn1siborongborong',
            'db_host'          => env('DB_HOST'),
            'db_name'          => env('DB_DATABASE'),
            'db_user'          => env('DB_USERNAME'),
            'db_password'      => encrypt(env('DB_PASSWORD', '')),
            'r2_prefix'        => 'smpn1siborongborong',
            'principal_name'   => 'Marturak Lumbantoruan, S.Pd.',
            'principal_nip'    => 'NIP. 198212082011011006',
            'manager_name'     => 'Torus Manuntun Nababan, S.Pd., M.Pd.',
            'manager_nip'      => 'NIP. 197302282002121005',
            'is_active'        => true,
        ]);
    }
}