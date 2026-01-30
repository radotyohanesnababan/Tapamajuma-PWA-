<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Auth;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
    // 1. Cukup gunakan satu baris ini (Otomatis menangani Sanctum)
    $middleware->statefulApi();

    // 2. Paksa JSON (Wajib agar tidak Redirect)
    $middleware->append(\App\Http\Middleware\ForceJsonResponse::class);

    // 3. Matikan Redirect Fisik (Penyebab utama Network Error)
    $middleware->redirectUsersTo(fn () => response()->json(['message' => 'Success'], 200));
    $middleware->redirectGuestsTo(fn () => response()->json(['message' => 'Unauthorized'], 401));

    $middleware->validateCsrfTokens(except: []);
})
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
