<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\GlobalAnnouncement;
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
            'title'       => 'nullable|string|max:255',
            'content'     => 'required|string',
            'target_role' => 'nullable|in:all,teacher,student',
            'is_active'   => 'nullable|boolean',
            'expires_at'  => 'nullable|date',
        ]);

        $validated['target_role'] = $validated['target_role'] ?? 'all';
        $validated['is_active'] = $validated['is_active'] ?? true;

        $announcement = Announcement::create($validated);

        return response()->json([
            'message'      => 'Pengumuman berhasil dibuat',
            'announcement' => $announcement,
            'data'         => $announcement,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);

        $validated = $request->validate([
            'title'       => 'nullable|string|max:255',
            'content'     => 'nullable|string',
            'target_role' => 'nullable|in:all,teacher,student',
            'is_active'   => 'nullable|boolean',
            'expires_at'  => 'nullable|date',
        ]);

        $announcement->update($validated);

        return response()->json([
            'message' => 'Pengumuman berhasil diperbarui',
            'data'    => $announcement,
        ]);
    }

    public function forwardGlobal(Request $request)
    {
        $request->validate([
            'global_announcement_id' => 'required|integer',
            'target_role'            => 'required|in:all,teacher,student',
        ]);

        $global = GlobalAnnouncement::findOrFail($request->global_announcement_id);

        $announcement = Announcement::create([
            'title'       => $global->title,
            'content'     => $global->content,
            'target_role' => $request->target_role,
            'is_active'   => true,
            'expires_at'  => $global->expires_at,
        ]);

        return response()->json([
            'message' => 'Pengumuman dinas berhasil diteruskan ke warga sekolah',
            'data'    => $announcement,
        ], 201);
    }

    public function destroy($id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        return response()->json(['message' => 'Pengumuman berhasil dihapus!']);
    }
}