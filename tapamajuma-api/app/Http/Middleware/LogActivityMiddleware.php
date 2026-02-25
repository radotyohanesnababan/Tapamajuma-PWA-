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

        // Hanya catat jika user sudah login (Auth)
        if (Auth::check()) {
            $user = Auth::user();
            
            // Tentukan aksi berdasarkan rute atau method
            $action = "Mengakses " . $request->path() . " [" . $request->method() . "]";

            // Kirim ke service Go secara asynchronous (tanpa menunggu respon agar tidak lambat)
            Http::withoutVerifying() // Gunakan ini jika ada masalah sertifikat TLS
                ->post(env('LOGGER_SERVICE_URL'), [
                    'user_id' => $user->id,
                    'action'  => $action,
                ]);
        }

        return $response;
    }
}