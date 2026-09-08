<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\School;

class SchoolSeeder extends Seeder
{
    public function run()
    {
        $schools = [
            [
                'name'             => 'SMP Negeri 1 Siborongborong',
                'slug'             => 'smpn1siborongborong',
                'db_host'          => env('DB_HOST', '127.0.0.1'),
                'db_name'          => 'tapamajuma_db',
                'db_user'          => env('DB_USERNAME', 'root'),
                'db_password'      => encrypt(env('DB_PASSWORD', '')),
                'r2_prefix'        => 'smpn1siborongborong',
                'principal_name'   => 'Marturak Lumbantoruan, S.Pd.',
                'principal_nip'    => 'NIP. 198212082011011006',
                'manager_name'     => 'Torus Manuntun Nababan, S.Pd., M.Pd.',
                'manager_nip'      => 'NIP. 197302282002121005',
                'is_active'        => true,
            ],
            [
                'name'             => 'SMP Negeri 3 Siborongborong',
                'slug'             => 'smpn3sbb',
                'db_host'          => env('DB_HOST', '127.0.0.1'),
                'db_name'          => 'tapamajuma_tenant_smpn3sbb',
                'db_user'          => env('DB_USERNAME', 'root'),
                'db_password'      => encrypt(env('DB_PASSWORD', '')),
                'r2_prefix'        => 'smpn3sbb',
                'principal_name'   => 'Kepala SMPN 3 Siborongborong',
                'principal_nip'    => 'NIP. 198001012005011001',
                'manager_name'     => 'Pengelola SMPN 3',
                'manager_nip'      => 'NIP. 198501012010011002',
                'is_active'        => true,
            ],
            [
                'name'             => 'Tapamajuma Development',
                'slug'             => 'dev',
                'db_host'          => env('DB_HOST', '127.0.0.1'),
                'db_name'          => 'tapamajuma_dev',
                'db_user'          => env('DB_USERNAME', 'root'),
                'db_password'      => encrypt(env('DB_PASSWORD', '')),
                'r2_prefix'        => 'dev',
                'principal_name'   => 'Developer Lead',
                'principal_nip'    => null,
                'manager_name'     => 'Dev Ops',
                'manager_nip'      => null,
                'is_active'        => true,
            ],
        ];

        foreach ($schools as $schoolData) {
            School::updateOrCreate(
                ['slug' => $schoolData['slug']],
                $schoolData
            );
        }
    }
}