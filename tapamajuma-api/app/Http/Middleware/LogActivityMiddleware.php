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

    // 1. Abaikan jika method-nya OPTIONS (CORS)
    if ($request->isMethod('OPTIONS')) {
        return $response;
    }

    // 2. Abaikan route tertentu yang terlalu sering diakses (seperti cek user)
    $ignoredPaths = ['api/user', 'api/notifications/count'];
    if ($request->is($ignoredPaths)) {
        return $response;
    }

    if (Auth::check()) {
        try {
            Http::timeout(1)->post('http://localhost:5000/api/logs', [
                'user_id' => Auth::id(),
                'action'  => "Mengakses " . $request->path(), // Gunakan path() agar lebih pendek
            ]);
        } catch (\Exception $e) {
            report($e);
        }
    }

    return $response;
}
}