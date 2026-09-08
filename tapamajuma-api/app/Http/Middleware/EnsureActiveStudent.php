<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureActiveStudent
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user && $user->role === 'student' && $user->is_alumni) {
            return response()->json([
                'message' => 'Akun Anda dalam status Alumni (Lulus) dengan mode baca saja. Anda tidak dapat membuat aktivitas atau mengikuti ujian baru.',
                'is_alumni' => true
            ], 403);
        }

        return $next($request);
    }
}
