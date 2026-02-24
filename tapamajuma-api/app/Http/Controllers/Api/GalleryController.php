<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GalleryController extends Controller
{
    private function formatGalleryUrl($gallery)
    {
        // Jika tipenya 'link' (YouTube/IG), biarkan URL aslinya
        if ($gallery->file_type === 'link') {
            return $gallery->file_path;
        }

        
        return $gallery->file_path ? Storage::url($gallery->file_path) : null;
    }

    public function index()
    {
        $galleries = Gallery::with('user:id,name,class_id')
            ->where('is_published', true)
            ->latest()
            ->get()
            ->map(function($item) {
               $item->file_url = $this->formatGalleryUrl($item);
            return $item;
            });

        return response()->json($galleries);
    }

    public function indexfortc(Request $request)
    {
        $user = $request->user();
        $allowedClassIds = $user->accessible_classes ?? [];
        $query = Gallery::query();
        
        if ($user->role !== 'superadmin') {
            $query->whereHas('user', function($q) use ($allowedClassIds) {
                $q->whereIn('class_id', $allowedClassIds);
            });
        }
        
        $filterName = $request->query('class_id'); 
        if ($filterName && !in_array(strtolower($filterName), ['all'])) {
            $query->whereHas('user.studentClass', function($q) use ($filterName) {
                $q->where('name', $filterName);
            });
        }
        
        $galleries = $query->with([
            'user' => function($q) {
                $q->select('id', 'name', 'class_id')->with('studentClass:id,name');
            }
        ])
        ->latest()->get()
        ->map(function($item) {
            $item->file_url = $this->formatGalleryUrl($item);
            return $item;
        });
        
        return response()->json($galleries);
    }

    public function destroy($id)
    {
        $gallery = Gallery::findOrFail($id);

        // PERBAIKAN: Hapus dari disk default (R2) jika tipe adalah file
        if ($gallery->file_type !== 'link' && $gallery->file_path) {
            Storage::delete($gallery->file_path);
        }

        $gallery->delete();
        return response()->json(['message' => 'Karya berhasil dihapus']);
    }
    public function share(Request $request, $id)
    {
        $gallery = Gallery::findOrFail($id);

        // Opsional: Cek apakah user punya hak akses (misal hanya user login yang bisa share)
        // if (!Auth::check()) abort(401);

        // 1. Jika belum punya token, buatkan sekarang
        if (!$gallery->share_token) {
            $gallery->update([
                'share_token' => Str::random(32), // Token unik 32 karakter
                'is_public' => true // Pastikan statusnya public
            ]);
        }

        // 2. Return URL Frontend yang siap dicopy
        // Pastikan FRONTEND_URL ada di .env (misal: https://tapamajuma.my.id)
        $shareUrl = env('FRONTEND_URL') . '/s/' . $gallery->share_token;

        return response()->json([
            'message' => 'Link siap dibagikan!',
            'url' => $shareUrl
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'activity_id' => 'nullable',
            'type'        => 'required|in:file,link', 
        ]);

        $filePath = null;
        $fileType = null;

        if ($request->type === 'link') {
            $request->validate(['url' => 'required|url']);
            $filePath = $request->url;
            $fileType = 'link';
        } else {
            $request->validate([
                'file' => 'required|file|mimes:jpg,jpeg,png,mp3,wav,webm,m4a,mpga,pdf,ogg,mov|max:20480',
            ]);

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $extension = strtolower($file->getClientOriginalExtension());
                
                // PERBAIKAN: Hapus 'public', biarkan mengikuti disk default R2
                $path = $file->store('galleries'); 
                $filePath = ltrim($path, '/'); // Bersihkan slash di depan agar tidak double slash

                // Deteksi Tipe File
                if (in_array($extension, ['jpg', 'jpeg', 'png'])) {
                    $fileType = 'image';
                } elseif (in_array($extension, ['mp3', 'wav', 'webm', 'm4a', 'mpga'])) {
                    $fileType = 'audio';
                } elseif ($extension === 'pdf') {
                    $fileType = 'pdf';
                } else {
                    $fileType = 'document';
                }
            }
        }

        $gallery = Gallery::create([
            'user_id'      => Auth::id(),
            'activity_id'  => $request->activity_id,
            'title'        => $request->title,
            'file_path'    => $filePath,
            'file_type'    => $fileType,
            'is_published' => true, 
        ]);

        return response()->json([
            'message' => 'Karya berhasil dipublikasikan!',
            'data'    => $gallery,
            'url'     => $this->formatGalleryUrl($gallery) // Berikan URL matang ke React
        ], 201);
    }
}