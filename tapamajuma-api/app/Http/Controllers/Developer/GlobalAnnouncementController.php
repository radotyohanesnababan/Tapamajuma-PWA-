<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use App\Models\GlobalAnnouncement;
use Illuminate\Http\Request;

class GlobalAnnouncementController extends Controller
{
    public function index()
    {
        $announcements = GlobalAnnouncement::with('creator:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $announcements]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'content'     => 'required|string',
            'target_role' => 'required|in:all,student,teacher,admin',
            'expires_at'  => 'nullable|date|after:now',
        ]);

        $developer = $request->attributes->get('developer') ?? $request->user();

        $announcement = GlobalAnnouncement::create([
            ...$data,
            'created_by' => $developer?->id,
            'is_active'  => true,
        ]);

        return response()->json(['message' => 'Pengumuman berhasil dibuat', 'data' => $announcement], 201);
    }

    public function show($id)
    {
        $announcement = GlobalAnnouncement::with('creator:id,name')->findOrFail($id);
        return response()->json(['data' => $announcement]);
    }

    public function update(Request $request, $id)
    {
        $announcement = GlobalAnnouncement::findOrFail($id);
        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'content'     => 'sometimes|string',
            'target_role' => 'sometimes|in:all,student,teacher,admin',
            'is_active'   => 'sometimes|boolean',
            'expires_at'  => 'nullable|date',
        ]);

        $announcement->update($data);
        return response()->json(['message' => 'Pengumuman diperbarui', 'data' => $announcement]);
    }

    public function destroy($id)
    {
        GlobalAnnouncement::findOrFail($id)->delete();
        return response()->json(['message' => 'Pengumuman dihapus']);
    }
}
