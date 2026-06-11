<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index()
    {
        return response()->json(
            Announcement::where('is_active', true)
                ->latest()
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'content'    => 'required|string|max:1000',
            'is_active'  => 'boolean',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $announcement = Announcement::create($validated);

        return response()->json([
            'message'      => 'Pengumuman berhasil dibuat',
            'announcement' => $announcement
        ], 201);
    }

    public function destroy($id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        return response()->json(['message' => 'Pengumuman berhasil dihapus!']);
    }
}