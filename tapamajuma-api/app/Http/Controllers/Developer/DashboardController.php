<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use App\Models\School;

class DashboardController extends Controller
{
    public function index()
{
    $schools = School::select('id', 'name', 'slug', 'is_active', 'created_at')
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json([
        'data' => $schools,
        'meta' => [
            'total'  => $schools->count(),
            'active' => $schools->where('is_active', true)->count(),
        ],
    ]);
}
}
