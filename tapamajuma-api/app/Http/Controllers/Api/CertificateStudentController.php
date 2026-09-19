<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CertificateStudentController extends Controller
{
    // ============================================================
    // LIST — semua sertifikat milik siswa yang login
    // ============================================================
    public function index()
    {
        $certificates = Certificate::where('user_id', Auth::id())
            ->latest()
            ->get();

        return response()->json(['data' => $certificates]);
    }

    // ============================================================
    // DOWNLOAD — generate signed URL dari R2 / public URL
    // ============================================================
    public function download(Certificate $certificate)
    {
        if ((int)$certificate->user_id !== (int)Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($certificate->status !== 'released') {
            return response()->json(['message' => 'Sertifikat belum tersedia'], 403);
        }

        if (!$certificate->pdf_path) {
            return response()->json(['message' => 'PDF belum digenerate'], 404);
        }

        $disk = config('filesystems.default');

        if ($disk === 'r2' || $disk === 's3') {
            $url = Storage::disk($disk)->temporaryUrl(
                $certificate->pdf_path,
                now()->addMinutes(15)
            );
        } else {
            $url = Storage::disk('public')->url($certificate->pdf_path);
        }

        return response()->json(['url' => $url]);
    }
}
