<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reflection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReflectionController extends Controller
{
    // Aksi B.1: Simpan Refleksi Mingguan
    public function store(Request $request)
    {

        $category = $request->category === 'weekly' ? 'mingguan' : $request->category;
        $validated = $request->validate([
            'category' => 'required|in:mingguan,harian', 
            'content' => 'required|string',  
            'improvements' => 'required|string',
            'targets' => 'required|string',
            'activity_id' => 'nullable|exists:daily_activities,id'
        ]);

        $reflection = Reflection::create([
            'user_id' => Auth::id(),
            'category' => $category,
            'content' => $validated['content'],
            'improvements' => $validated['improvements'],
            'targets' => $validated['targets'],
            'activity_id' => $validated['activity_id'],
        ]);

        return response()->json(['message' => 'Refleksi mingguan berhasil disimpan', 'data' => $reflection], 201);
    }

    // Aksi B.2: Ambil Feed Teman Sekelas
    public function getPeerFeed()
    {
        $user = Auth::user();

        $feeds = Reflection::with('user:id,name,class_id')
            ->where('category', 'mingguan')
            ->whereHas('user', function($query) use ($user) {
                $query->where('class_id', $user->class_id)
                      ->where('id', '!=', $user->id); // Agar tidak melihat postingan sendiri
            })
            ->whereNotNull('improvements')
            ->latest()
            ->take(20)
            // PENTING: Tambahkan 'peer_feedback' agar kolom JSON terambil
            ->get(['id', 'user_id', 'improvements', 'peer_feedback', 'created_at']);

        return response()->json($feeds);
    }

    // Aksi B.2: Guru Memberi Feedback
    public function giveFeedback(Request $request, $id)
    {
        $request->validate(['feedback_teacher' => 'required|string']);

        $reflection = Reflection::findOrFail($id);
        $reflection->update(['feedback_teacher' => $request->feedback_teacher]);

        return response()->json(['message' => 'Feedback guru berhasil dikirim']);
    }

    // Aksi B.2: Siswa Memberi Komentar Positif (Template)
    public function storePeerFeedback(Request $request, $id)
    {
        $request->validate(['comment' => 'required|string']);
        
        $reflection = Reflection::findOrFail($id);
        
        // Ambil data JSON lama atau buat array kosong
        $feedbacks = $reflection->peer_feedback ?? [];
        
        // Tambahkan komentar baru
        $feedbacks[] = [
            'user_name' => Auth::user()->name,
            'comment' => $request->comment,
            'created_at' => now()->toDateTimeString(),
        ];

        // Update kolom JSON
        $reflection->update(['peer_feedback' => $feedbacks]);

        return response()->json(['message' => 'Dukungan berhasil dikirim!']);
    }

    public function getStudentReflections(Request $request)
{
    /** @var \App\Models\User $user */
    $user = Auth::user(); // Ambil data Guru/Superadmin

    // 1. Ambil daftar ID Kelas yang boleh diakses (Array [1, 2, 3])
    $allowedClassIds = $user->accessible_classes ?? [];

    $query = Reflection::query();

    // 2. Security Check: Filter berdasarkan hak akses Guru
    if ($user->role !== 'superadmin') {
        $query->whereHas('user', function($q) use ($allowedClassIds) {
            $q->whereIn('class_id', $allowedClassIds);
        });
    }

    // 3. Filter Dropdown (Jika Guru memilih kelas spesifik di UI)
    $filterClassId = $request->query('class_id'); 
    if ($filterClassId && $filterClassId !== 'all') {
        $query->whereHas('user', function($q) use ($filterClassId) {
            $q->where('class_id', $filterClassId);
        });
    }

    // 4. Load Relasi & Ambil Data
    $reflections = $query->with([
        'user' => function($q) {
            $q->select('id', 'name', 'class_id', 'level') // Ambil level juga untuk badge
              ->with('studentClass:id,name'); // Agar di JSX bisa panggil .student_class.name
        }
    ])
    ->whereIn('category', ['harian', 'mingguan']) // Pastikan mengambil semua kategori
    ->latest()
    ->get();

    return response()->json($reflections);
}

public function getAllStudentReflections()
{
    $reflections = Reflection::with('user:id,name,class_id,level')
        ->whereIn('category', ['harian', 'mingguan']) // Mengambil kedua kategori
        ->latest()
        ->get();

    return response()->json($reflections);
}
    
}