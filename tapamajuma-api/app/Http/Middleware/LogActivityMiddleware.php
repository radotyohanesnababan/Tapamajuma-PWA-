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

    // Ambil URL dari env
    $logUrl = env('LOGGER_SERVICE_URL');

    // Hanya kirim jika user login DAN URL log tersedia
    if (Auth::check() && !empty($logUrl)) {
        try {
            $user = Auth::user();
            $action = "Mengakses " . $request->path() . " [" . $request->method() . "]";

            Http::withoutVerifying()
                ->timeout(1)
                ->connectTimeout(1)
                ->post($logUrl, [ // Variabel $logUrl dipastikan bukan null di sini
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