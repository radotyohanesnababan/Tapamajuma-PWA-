<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;

class LogActivityMiddleware
{
public function handle(Request $request, Closure $next)
{
    $response = $next($request);

    $logUrl = env('LOGGER_SERVICE_URL');

    // Skip GET biasa, kecuali yang eksplisit penting
    $importantGetPaths = [
        // tambahkan path GET yang tetap mau dicatat, contoh:
        // 'admin/certificates/verify',
    ];

    $shouldLog = $request->method() !== 'GET' 
        || collect($importantGetPaths)->contains(fn ($path) => $request->is($path . '*'));

    if ($shouldLog && Auth::check() && !empty($logUrl) && app()->bound('currentSchool')) {
        try {
            $user = Auth::user();
            $action = "Mengakses " . $request->path() . " [" . $request->method() . "]";

            $school = app('currentSchool');
            $apiKey = $school->config['logger_api_key'] ?? null;

            if (!$apiKey) {
                return $response;
            }

            Http::withoutVerifying()
                ->timeout(1)
                ->connectTimeout(1)
                ->withHeaders(['X-Tenant-API-Key' => $apiKey])
                ->post($logUrl . '/api/logs', [
                    'user_id' => $user->id,
                    'action'  => $action,
                ]);
        } catch (\Exception $e) {
            \Log::warning("Logger Go Down atau Error: " . $e->getMessage());
        }
    }

    return $response;
}
}