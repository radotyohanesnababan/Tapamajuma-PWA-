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
    $validated = $request->validate([
        'version'        => 'required|string|max:20',
        'title'          => 'required|string|max:255',
        'release_date'   => 'required|date',
        'changes'        => 'required|array|min:1',
        'changes.*.type' => 'required|in:new,fix,improve',
        'changes.*.text' => 'required|string',
    ]);

    // Sanitasi HTML di setiap item changes
    $purifier = new \HTMLPurifier();
    $validated['changes'] = array_map(function($change) use ($purifier) {
        $change['text'] = $purifier->purify($change['text']);
        return $change;
    }, $validated['changes']);

    $changelog = Changelog::create($validated);

    return response()->json([
        'status'  => 'success',
        'message' => 'Changelog berhasil diterbitkan!',
        'data'    => $changelog
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
