<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MaintenanceController extends Controller
{
    private function getTenantConnection(School $school): string
    {
        $connName = 'tenant_' . $school->slug;
        config(["database.connections.{$connName}" => array_merge(
            config('database.connections.tenant'),
            [
                'host'     => $school->db_host,
                'database' => $school->db_name,
                'username' => $school->db_user,
                'password' => decrypt($school->db_password),
            ]
        )]);
        DB::purge($connName);
        return $connName;
    }

    public function healthCheck()
    {
        $schools = School::where('is_active', true)->get();
        $results = [];

        foreach ($schools as $school) {
            $connName = $this->getTenantConnection($school);
            try {
                DB::connection($connName)->getPdo();

                $migrationCount = DB::connection($connName)->table('migrations')->count();

                $results[] = [
                    'id'              => $school->id,
                    'name'            => $school->name,
                    'slug'            => $school->slug,
                    'status'          => 'ok',
                    'migration_count' => $migrationCount,
                    'db_name'         => $school->db_name,
                ];
            } catch (\Exception $e) {
                $results[] = [
                    'id'     => $school->id,
                    'name'   => $school->name,
                    'slug'   => $school->slug,
                    'status' => 'error',
                    'error'  => $e->getMessage(),
                    'db_name'=> $school->db_name,
                ];
            } finally {
                DB::purge($connName);
            }
        }

        $healthy = collect($results)->where('status', 'ok')->count();

        return response()->json([
            'data' => [
                'summary' => [
                    'total'   => count($results),
                    'healthy' => $healthy,
                    'errors'  => count($results) - $healthy,
                ],
                'schools' => $results,
            ]
        ]);
    }

    public function migrateAllTenants()
    {
        $schools = School::where('is_active', true)->get();
        $results = [];

        // Naikkan time limit untuk operasi batch (bisa lama jika banyak tenant)
        set_time_limit(300);

        foreach ($schools as $school) {
            $connName = $this->getTenantConnection($school);
            try {
                // Tangkap output per-sekolah dengan buffer terpisah agar tidak cross-contaminate
                $outputBuffer = new \Symfony\Component\Console\Output\BufferedOutput();

                $exitCode = Artisan::call('migrate', [
                    '--database' => $connName,
                    '--path'     => database_path('migrations/tenant'), // Absolut, aman di semua env
                    '--force'    => true,
                ], $outputBuffer);

                $results[] = [
                    'school'    => $school->name,
                    'slug'      => $school->slug,
                    'status'    => $exitCode === 0 ? 'success' : 'failed',
                    'output'    => trim($outputBuffer->fetch()),
                ];
            } catch (\Exception $e) {
                Log::error("Migrate tenant error [{$school->slug}]: " . $e->getMessage());
                $results[] = [
                    'school' => $school->name,
                    'slug'   => $school->slug,
                    'status' => 'error',
                    'error'  => $e->getMessage(),
                ];
            } finally {
                // Selalu bersihkan koneksi setelah dipakai agar tidak menumpuk di pool
                DB::purge($connName);
            }
        }

        $success = collect($results)->where('status', 'success')->count();

        return response()->json([
            'message' => "Migrasi selesai. Berhasil: {$success} dari " . count($results) . " sekolah.",
            'data'    => $results,
        ]);
    }
}
