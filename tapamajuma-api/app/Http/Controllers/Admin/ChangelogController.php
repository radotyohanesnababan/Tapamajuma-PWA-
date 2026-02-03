<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Changelog;
use Illuminate\Http\Request;

class ChangelogController extends Controller
{
    public function index()
{
    // Ambil semua history, urutkan dari yang paling baru
    $logs = Changelog::orderBy('release_date', 'desc')
                     ->orderBy('id', 'desc')
                     ->get();

    return response()->json([
        'status' => 'success',
        'data' => $logs
    ]);
}
    public function store(Request $request)
{
    // 1. Validasi Input
    $validated = $request->validate([
        'version'      => 'required|string|max:20', // contoh: 1.1.0
        'title'        => 'required|string|max:255',
        'release_date' => 'required|date',
        'changes'      => 'required|array|min:1', // Harus array
        'changes.*.type' => 'required|in:new,fix,improve', // Validasi tipe
        'changes.*.text' => 'required|string', // Validasi teks per item
    ]);

    // 2. Simpan ke Database
    // Karena di Model sudah ada casts 'changes' => 'array', 
    // Laravel otomatis mengubah Array PHP menjadi JSON saat disimpan.
    $changelog = Changelog::create($validated);

    return response()->json([
        'status' => 'success',
        'message' => 'Changelog berhasil diterbitkan!',
        'data' => $changelog
    ]);
}
    public function latest()
    {
        // Ambil 1 data paling baru berdasarkan tanggal rilis
        $log = Changelog::orderBy('release_date', 'desc')
                        ->orderBy('id', 'desc') // Jika tanggal sama, ambil ID terakhir
                        ->first();

        if (!$log) {
            return response()->json(['status' => 'empty']);
        }

        return response()->json([
            'status' => 'success',
            'data' => $log
        ]);
    }
}
