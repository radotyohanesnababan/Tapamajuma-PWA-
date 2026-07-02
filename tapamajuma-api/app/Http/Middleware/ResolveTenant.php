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
        $school = null;

        // 1. Lokal: pakai query param ?tenant=xxx
        if (app()->isLocal() && $request->has('tenant')) {
            $slug = $request->query('tenant');
            
            $school = School::where('slug', $slug)
                ->where('is_active', true)
                ->first();
        }
        
        // 2. Production: cek header X-Tenant-Slug
        if (!$school && $request->hasHeader('X-Tenant-Slug')) {
            $slug = $request->header('X-Tenant-Slug');
            
            $school = School::where('slug', $slug)
                ->where('is_active', true)
                ->first();
        }
        
        // 3. Fallback: cek query param ?tenant=xxx (untuk production juga)
        if (!$school && $request->has('tenant')) {
            $slug = $request->query('tenant');
            
            $school = School::where('slug', $slug)
                ->where('is_active', true)
                ->first();
        }

        if (!$school) {
            return response()->json([
                'message' => 'School not found',
                'hint' => 'Send X-Tenant-Slug header or ?tenant=xxx query param'
            ], 404);
        }

        // Bind ke container
        app()->instance('currentSchool', $school);

        // Switch database connection
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
