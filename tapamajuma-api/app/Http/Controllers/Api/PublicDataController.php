<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClassName;
use Illuminate\Http\Request;

class PublicDataController extends Controller
{
    public function getClasses()
    {
        // Ambil ID dan Nama saja, urutkan abjad
        $classes = ClassName::select('id', 'name')->orderBy('name')->get();
        return response()->json($classes);
    }
}