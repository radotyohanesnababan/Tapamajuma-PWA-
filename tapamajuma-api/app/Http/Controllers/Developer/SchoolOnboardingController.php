<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\SchoolOnboarding;

class SchoolOnboardingController extends Controller
{
    public function store(Request $request, SchoolOnboarding $service)
    { 
        $data = $request->validate([
            'name'           => 'required|string',
            'slug'           => 'required|string|alpha_dash|unique:App\Models\School,slug',
            'address'        => 'nullable|string',
            'phone'          => 'nullable|string',
            'email'          => 'nullable|email',
            'principal_name' => 'nullable|string',
            'principal_nip'  => 'nullable|string',
            'manager_name'   => 'nullable|string',
            'manager_nip'    => 'nullable|string',
        ]);

        try {
            $school = $service->onboard($data);

            return response()->json([
                'message' => 'Sekolah berhasil di-onboard',
                'data'    => $school,
            ], 201);
        } catch (\Throwable $e) {
            \Log::error('Onboarding gagal: ' . $e->getMessage());
            return response()->json([
                'message' => 'Onboarding gagal: ' . $e->getMessage(),
            ], 500);
        }
    }
}