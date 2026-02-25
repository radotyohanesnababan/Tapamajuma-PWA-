<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        
        // 1. Masukkan Middleware Khusus ke Grup API saja (Biar Web ga error)
        $middleware->api(prepend: [
            \App\Http\Middleware\ForceJsonResponse::class, // Paksa JSON
            \App\Http\Middleware\LogActivityMiddleware::class, // Log Aktivitas
        ]);
        
        $middleware->validateCsrfTokens(except: [
            '*' 
        ]);

        // 3. Matikan Redirect Fisik (SOLUSI YANG BENAR)
        // Return null artinya: "Jangan redirect kemana-mana".
        // Laravel otomatis akan melempar AuthenticationException,
        // yang nanti ditangkap oleh Laravel jadi response 401 JSON (karena header Accept: json).
        $middleware->redirectGuestsTo(fn (Request $request) => null);
        
        // Sama juga untuk user yang sudah login tapi akses halaman guest
        $middleware->redirectUsersTo(fn (Request $request) => null);

        // 4. CSRF (Biasanya tidak perlu di-set untuk API, tapi kalau mau aman biarkan default)
        // API Routes secara default TIDAK melewati CSRF check.
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Opsional: Custom error handling jika perlu
    })->create();