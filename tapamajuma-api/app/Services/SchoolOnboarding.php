<?php

namespace App\Services;

use App\Models\School;
use App\Models\AcademicPeriod;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

class SchoolOnboarding
{
    public function onboard(array $data): School
    {
        $slug = $data['slug'];
        $dbName = "tapamajuma_tenant_{$slug}";
        $dbHost = env('CENTRAL_DB_HOST');

        // Step 1: Buat database baru di TiDB (pakai koneksi central buat CREATE DATABASE)
        DB::connection('central')->statement("CREATE DATABASE IF NOT EXISTS `{$dbName}`");

        // Step 2: Insert School ke central DB
        $school = School::create([
            'name'           => $data['name'],
            'slug'           => $slug,
            'domain'         => null,
            'db_host'        => $dbHost,
            'db_name'        => $dbName,
            'db_user'        => env('CENTRAL_DB_USER'),
            'db_password'    => encrypt(env('CENTRAL_DB_PASSWORD')),
            'r2_prefix'      => $slug,
            'address'        => $data['address'] ?? null,
            'phone'          => $data['phone'] ?? null,
            'email'          => $data['email'] ?? null,
            'principal_name' => $data['principal_name'] ?? null,
            'principal_nip'  => $data['principal_nip'] ?? null,
            'manager_name'   => $data['manager_name'] ?? null,
            'manager_nip'    => $data['manager_nip'] ?? null,
            'is_active'      => true,
        ]);

        // Step 3-4: Setup koneksi sementara ke tenant DB baru, migrate + seed
        config(['database.connections.school_temp' => array_merge(
            config('database.connections.tenant'),
            ['database' => $dbName]
        )]);
        DB::purge('school_temp');

        Artisan::call('migrate', [
            '--database' => 'school_temp',
            '--path'     => 'database/migrations/tenant',
            '--force'    => true,
        ]);

        DB::setDefaultConnection('school_temp');
        (new \Database\Seeders\DatabaseSeeder())->run();

        // Step 4b: Buat academic period aktif
        AcademicPeriod::create([
            'name'          => $data['academic_period_name'] ?? 'Semester Ganjil ' . now()->year . '/' . (now()->year + 1),
            'semester'      => $data['semester'] ?? 'ganjil',
            'academic_year' => $data['academic_year'] ?? now()->year . '/' . (now()->year + 1),
            'is_active'     => true,
            'opened_at'     => now(),
        ]);

        DB::setDefaultConnection('mysql'); // kembalikan ke default

        return $school;
    }
}