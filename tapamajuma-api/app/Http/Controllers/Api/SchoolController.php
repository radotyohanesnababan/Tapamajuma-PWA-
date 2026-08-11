<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\JsonResponse;

class SchoolController extends Controller
{
    /**
     * Daftar sekolah publik untuk keperluan pemilihan tenant di client
     * (mis. dropdown "Pilih Sekolah" di native app). Tidak menyertakan
     * data sensitif seperti kredensial database.
     */
    public function publicList(): JsonResponse
    {
        $schools = School::where('is_active', true)
            ->select('id', 'name', 'slug')
            ->orderBy('name')
            ->get();

        return response()->json($schools);
    }
}