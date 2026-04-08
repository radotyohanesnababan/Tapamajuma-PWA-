<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index() {
    return response()->json(Announcement::where('is_active', true)->latest()->get());
}

public function store(Request $request) {
    $request->validate(['content' => 'required']);
    Announcement::create($request->all());
    return response()->json(['message' => 'Pengumuman berhasil dibuat']);
}

public function destroy($id) 
{
    $announcement = \App\Models\Announcement::find($id);

    if (!$announcement) {
        return response()->json(['message' => 'Data tidak ditemukan'], 404);
    }

    $announcement->delete();

    return response()->json(['message' => 'Pengumuman berhasil dihapus!']);
}
}
