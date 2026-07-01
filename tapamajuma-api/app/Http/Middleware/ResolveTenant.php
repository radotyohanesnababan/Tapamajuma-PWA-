<?php

namespace App\Http\Middleware;

use App\Models\School;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ResolveTenant 
{
    public function handle(Request $request, Closure $next)
    {
        $host = $request->getHost();
        $slug = explode('.', $host)[0];

        // Lokal: pakai query param ?tenant=smpn1siborongborong
        // supaya bisa test tanpa subdomain
        if (app()->isLocal() && $request->has('tenant')) {
            $slug = $request->query('tenant');
        }

        $school = School::where('slug', $slug)
            ->where('is_active', true)
            ->first();
        if (!$school) {
            $school = School::where('domain', $host)
            ->where('is_active', true)
            ->first();
        }

        if (!$school) {
            return response()->json(['message' => 'School not found'], 404);
        }

        // Bind ke container — bisa diakses dari mana saja
        app()->instance('currentSchool', $school);

        // Switch default connection ke tenant DB sekolah ini
        config(['database.connections.tenant' => [
            'driver'    => 'mysql',
            'host'      => $school->db_host,
            'port'      => env('DB_PORT', '3306'),
            'database'  => $school->db_name,
            'username'  => $school->db_user,
            'password'  => decrypt($school->db_password),
            'charset'   => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'strict'    => true,
            'options'   => extension_loaded('pdo_mysql') ? array_filter([
                \PDO::MYSQL_ATTR_SSL_CA => env('DB_SSL_CA'),
                \PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => !empty(env('DB_SSL_CA')),
            ]) : [],
        ]]);

        DB::purge('tenant');
        DB::reconnect('tenant');
        DB::setDefaultConnection('tenant');

        return $next($request);
    }
}