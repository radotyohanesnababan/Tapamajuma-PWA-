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
        
        // 1. Group API Middleware
        $middleware->api(prepend: [
            \App\Http\Middleware\ForceJsonResponse::class, // Paksa return JSON
            \App\Http\Middleware\LogActivityMiddleware::class, // Pastikan nama class & file ini SAMA
        ]);

        // 2. Setting CORS (Agar domain frontend diizinkan)
        // Ini akan menimpa setting default config/cors.php
        $middleware->validateCsrfTokens(except: ['*']); // Matikan CSRF untuk API

        // 3. FIX ERROR 500: Jangan return response()->json() disini!
        // Return NULL agar Laravel tahu "Jangan Redirect".
        // Karena header Accept: application/json ada (dari frontend/ForceJsonResponse),
        // Laravel otomatis akan melempar error 401 Unauthorized JSON.
        $middleware->redirectGuestsTo(fn (Request $request) => null);
        $middleware->redirectUsersTo(fn (Request $request) => null);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Opsional: Custom exception handling
    })->create();