<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GalleryController extends Controller
{

    public function index()
    {
        // Mengambil galeri yang dipublikasikan beserta data usernya
        $galleries = Gallery::with('user:id,name,class_id')
            ->where('is_published', true)
            ->latest()
            ->get();

        return response()->json($galleries);
    }
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'file' => 'required|file|mimes:jpg,jpeg,png,mp3,wav,webm,m4a,mpga|max:20480', 
            'activity_id' => 'nullable',
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension());
            
            // Logika penentuan file_type untuk Aksi C.1
            $fileType = 'document'; // default
            if (in_array($extension, ['jpg', 'jpeg', 'png'])) {
                $fileType = 'image';
            } elseif (in_array($extension, ['mp3', 'wav'])) {
                $fileType = 'audio';
            } elseif ($extension === 'pdf') {
                $fileType = 'pdf';
            }

            // Simpan file ke folder 'public/galleries'
            $path = $file->store('galleries', 'public');

            $gallery = Gallery::create([
                'user_id' => Auth::id(),
                'activity_id' => $request->activity_id,
                'title' => $request->title,
                'file_path' => $path,
                'file_type' => $fileType,
                'is_published' => true, 
            ]);

            return response()->json([
                'message' => 'Karya berhasil diunggah ke Galeri!',
                'data' => $gallery
            ], 201);
        }

        return response()->json(['message' => 'File tidak ditemukan'], 400);
    }
}
