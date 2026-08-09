<?php
// app/Http/Middleware/AuthenticateDeveloper.php
namespace App\Http\Middleware;

use App\Models\DeveloperToken;
use Closure;
use Illuminate\Http\Request;

class AuthenticateDeveloper
{
    public function handle(Request $request, Closure $next)
    {
        $bearer = $request->bearerToken();

        if (!$bearer) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $hashed = hash('sha256', $bearer);

        $token = DeveloperToken::with('developerUser')
            ->where('token', $hashed)
            ->first();

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $token->update(['last_used_at' => now()]);

        // Attach developer user ke request, dipakai controller lewat $request->developer
        $request->attributes->set('developer', $token->developerUser);

        return $next($request);
    }
}