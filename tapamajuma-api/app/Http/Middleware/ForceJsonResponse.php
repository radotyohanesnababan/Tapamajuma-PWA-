<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceJsonResponse
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Logika: Paksa header Accept jadi application/json
        // agar Laravel tidak me-redirect jika ada error validasi/auth
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}