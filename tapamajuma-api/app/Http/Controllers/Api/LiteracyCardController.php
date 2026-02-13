<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;


class LiteracyCardController extends Controller
{
    public function index(){
        try {
            // Ambil kolom id dan name, lalu urutkan sesuai abjad (A-Z)
            $subjects = Subject::select('id', 'name')
                               ->orderBy('name', 'asc')
                               ->get();

            return response()->json($subjects, 200);
            
        } catch (\Exception $e) {
            // Berikan respons error yang jelas jika database gagal diakses
            return response()->json([
                'message' => 'Gagal mengambil data mata pelajaran.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
