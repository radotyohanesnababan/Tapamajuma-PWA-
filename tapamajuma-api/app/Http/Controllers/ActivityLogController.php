<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ActivityLogController extends Controller
{
    public function index(Request $request)
{
    $school = app('currentSchool');
    $apiKey = $school->config['logger_api_key'] ?? null;

    if (!$apiKey) {
        return response()->json(['data' => [], 'meta' => []]);
    }

    $logUrl = env('LOGGER_SERVICE_URL');

    try {
        $response = Http::timeout(5)
            ->withHeaders(['X-Tenant-API-Key' => $apiKey])
            ->get($logUrl . '/api/logs', $request->only(['page', 'per_page', 'date']));

        if ($response->failed()) {
            return response()->json(['data' => [], 'error' => 'Logger service unavailable']);
        }

        return response()->json($response->json());
    } catch (\Exception $e) {
        \Log::warning("Gagal ambil activity log: " . $e->getMessage());
        return response()->json(['data' => [], 'error' => 'Logger service unavailable']);
    }
}
}