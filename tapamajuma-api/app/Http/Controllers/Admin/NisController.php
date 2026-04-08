<?php

namespace App\Http\Controllers\Admin;

use App\Exports\TemplateNisnExport;
use App\Http\Controllers\Controller;
use App\Imports\NisnImport;
use App\Models\AllowedNis;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class NisController extends Controller
{
    // 1. TAMPILKAN SEMUA DATA NISN
    public function index(Request $request)
{
    // Tangkap parameter dari React
    $search = $request->query('search');
    $perPage = $request->query('per_page', 15);

    $query = AllowedNis::with('user:id,name,email,class_id')
                ->orderBy('created_at', 'desc');

    // Jika ada pencarian, filter berdasarkan NISN
    if ($search) {
        $query->where('nis', 'like', "%{$search}%");
        
        // Opsional: Buka komentar di bawah jika ingin bisa mencari nama siswa juga
        
        $query->orWhereHas('user', function($q) use ($search) {
            $q->where('name', 'like', "%{$search}%");
        });
        
    }

    // Gunakan paginate() bukan get()
    $nisList = $query->paginate($perPage);
                
    return response()->json($nisList);
}
    /**
     * Download Template Excel
     */
    public function downloadTemplate()
    {
        // Akan men-download file bernama 'template_nisn.xlsx'
        return Excel::download(new TemplateNisnExport, 'template_nisn.xlsx');
    }

    /**
     * Import Data Excel/CSV
     */
    public function import(Request $request)
    {
        $request->validate([
            // Tambahkan xlsx dan xls untuk support Excel
            'file' => 'required|mimes:xlsx,xls,csv|max:2048' 
        ]);

        DB::beginTransaction();
        try {
            // Instansiasi class Import yang kita buat
            $import = new NisnImport();
            
            // Eksekusi proses import
            Excel::import($import, $request->file('file'));

            DB::commit();

            return response()->json([
                'message' => "{$import->insertedCount} NISN baru berhasil ditambahkan!"
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal mengimpor data. Pastikan format file sesuai template.'
            ], 500);
        }
    }

    // 3. CABUT AKSES (RESET NISN)
    public function unbind($id)
    {
        $allowedNis = AllowedNis::findOrFail($id);
        
        if (!$allowedNis->is_used || !$allowedNis->used_by) {
            return response()->json(['message' => 'NISN ini memang belum dipakai.'], 400);
        }

        $user = User::find($allowedNis->used_by);

        // Eksekusi pelepasan secara EKSPLISIT dengan Transaction
        DB::transaction(function () use ($allowedNis, $user) {
            
            // 1. Kosongkan NIS di profil user (jika akun usernya masih ada di DB)
            if ($user) {
                $user->update(['nis' => null]);
            }
            
            // 2. KEMBALIKAN STATUS NISN MENJADI TERSEDIA
            $allowedNis->update([
                'is_used' => false,
                'used_by' => null
            ]);
            
        });

        return response()->json(['message' => 'Akses NISN dicabut! Akun siswa tersebut sekarang terkunci.']);
    }
}