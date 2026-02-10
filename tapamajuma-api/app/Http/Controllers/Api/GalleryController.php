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
        $galleries = Gallery::with('user:id,name,class_id') // Pastikan class_id ada di tabel users
            ->where('is_published', true)
            ->latest()
            ->get();

        return response()->json($galleries);
    }

    public function store(Request $request)
    {
        // 1. Validasi Awal: Cek dulu user mau upload 'file' atau 'link'
        $request->validate([
            'title'       => 'required|string|max:255',
            'activity_id' => 'nullable',
            // Frontend WAJIB kirim 'type' ('file' atau 'link')
            'type'        => 'required|in:file,link', 
        ]);

        $filePath = null;
        $fileType = null;

        // --- SKENARIO 1: UPLOAD LINK (YouTube/IG/FB) ---
        if ($request->type === 'link') {
            // Validasi URL
            $request->validate([
                'url' => 'required|url',
            ]);

            // Simpan link mentah-mentah ke database
            $filePath = $request->url;
            $fileType = 'link';
        }

        // --- SKENARIO 2: UPLOAD FILE FISIK ---
        else {
            // Validasi File (Saya tambahkan pdf ke mimes agar sesuai logika bawah)
            $request->validate([
                'file' => 'required|file|mimes:jpg,jpeg,png,mp3,wav,webm,m4a,mpga,pdf|max:20480', // Max 20MB
            ]);

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $extension = strtolower($file->getClientOriginalExtension());
                
                // Simpan file ke folder 'public/galleries'
                $filePath = $file->store('galleries', 'public');

                // Deteksi Tipe File Otomatis
                if (in_array($extension, ['jpg', 'jpeg', 'png'])) {
                    $fileType = 'image';
                } elseif (in_array($extension, ['mp3', 'wav', 'webm', 'm4a', 'mpga'])) {
                    $fileType = 'audio';
                } elseif ($extension === 'pdf') {
                    $fileType = 'pdf';
                } else {
                    $fileType = 'document';
                }
            } else {
                return response()->json(['message' => 'File fisik wajib diunggah jika tipe bukan link'], 400);
            }
        }

        // --- SIMPAN KE DATABASE ---
        $gallery = Gallery::create([
            'user_id'      => Auth::id(),
            'activity_id'  => $request->activity_id,
            'title'        => $request->title,
            'file_path'    => $filePath, // Bisa berisi path file "galleries/abc.jpg" ATAU URL "https://youtube.com..."
            'file_type'    => $fileType, // 'image', 'audio', 'pdf', atau 'link'
            'is_published' => true, 
        ]);

        return response()->json([
            'message' => 'Karya berhasil dipublikasikan!',
            'data'    => $gallery
        ], 201);
    }
}