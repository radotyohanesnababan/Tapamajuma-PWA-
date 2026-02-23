<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\MediaBank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaBankController extends Controller
{
    // 1. Tampilkan semua gambar milik guru yang sedang login
    public function index(Request $request)
    {
        $media = MediaBank::where('user_id', $request->user()->id)
                    ->latest()
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'file_name' => $item->file_name,
                            // Langsung buatkan URL penuh agar React tinggal pakai
                            'url' => Storage::url($item->file_path),
                            'created_at' => $item->created_at->diffForHumans()
                        ];
                    });

        return response()->json($media);
    }

    // 2. Proses unggah gambar baru
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048' // Maksimal 2MB
        ]);

        $file = $request->file('image');
        $path = Storage::put('uploads', $request->file('image'));

        $media = MediaBank::create([
            'user_id' => $request->user()->id,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
        ]);

        return response()->json([
            'message' => 'Gambar berhasil diunggah!',
            'url' => Storage::url($path)
        ], 201);
    }

    // 3. Hapus gambar (Opsional, agar server tidak penuh)
    public function destroy($id)
    {
        $media = MediaBank::findOrFail($id);

        // Hapus file fisiknya dari storage
        if (Storage::exists($media->file_path)) {
            Storage::delete($media->file_path);
        }

        // Hapus datanya dari database
        $media->delete();

        return response()->json(['message' => 'Gambar berhasil dihapus!']);
    }
}
