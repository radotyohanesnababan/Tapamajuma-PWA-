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
        $certificates = Certificate::where('user_id', Auth::user()->id)
            ->latest()
            ->get();

        return response()->json(['data' => $certificates]);
    }

    // ============================================================
    // DOWNLOAD — generate signed URL dari R2
    // ============================================================
    public function download(Certificate $certificate)
    {
        if ($certificate->user_id !== Auth::user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($certificate->status !== 'released') {
            return response()->json(['message' => 'Sertifikat belum tersedia'], 403);
        }

        if (!$certificate->pdf_path) {
            return response()->json(['message' => 'PDF belum digenerate'], 404);
        }

        $url = Storage::disk('r2')->temporaryUrl(
            $certificate->pdf_path,
            now()->addMinutes(15)
        );

        return response()->json(['url' => $url]);
    }
}
