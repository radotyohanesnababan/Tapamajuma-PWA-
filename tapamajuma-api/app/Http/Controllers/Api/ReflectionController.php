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
            'category'        => 'required|in:mingguan,harian',
            'content'         => 'required|string',
            'improvements'    => 'required|string',
            'targets'         => 'required|string',
            'activity_id'     => 'nullable|exists:daily_activities,id',
        ]);

        $reflection = Reflection::create([
            'user_id'     => Auth::id(),
            'category'    => $category,
            'content'     => $validated['content'],
            'improvements' => $validated['improvements'],
            'targets'     => $validated['targets'],
            'activity_id' => $validated['activity_id'],
        ]);

        return response()->json([
            'message' => 'Refleksi mingguan berhasil disimpan',
            'data'    => $reflection,
        ], 201);
    }

    // Aksi B.2: Ambil Feed Teman Sekelas
    public function getPeerFeed()
    {
        $user = Auth::user();

        $feeds = Reflection::with('user:id,name,class_id')
            ->where('category', 'mingguan')
            ->whereHas('user', function ($query) use ($user) {
                $query->where('class_id', $user->class_id)
                      ->where('id', '!=', $user->id);
            })
            ->whereNotNull('improvements')
            ->latest()
            ->take(20)
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
        $feedbacks = $reflection->peer_feedback ?? [];

        $feedbacks[] = [
            'user_name'  => Auth::user()->name,
            'comment'    => $request->comment,
            'created_at' => now()->toDateTimeString(),
        ];

        $reflection->update(['peer_feedback' => $feedbacks]);

        return response()->json(['message' => 'Dukungan berhasil dikirim!']);
    }

    // ── GURU: Ambil Refleksi Siswa (PAGINATED) ──
    public function getStudentReflections(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $allowedClassIds = $user->accessible_classes ?? [];

        $perPage = $request->query('per_page', 10);
        $page    = $request->query('page', 1);

        $query = Reflection::query();

        // Security: filter by accessible classes
        if ($user->role !== 'superadmin') {
            $query->whereHas('user', function ($q) use ($allowedClassIds) {
                $q->whereIn('class_id', $allowedClassIds);
            });
        }

        // Filter: class_id
        $filterClassId = $request->query('class_id');
        if ($filterClassId && $filterClassId !== 'all' && $filterClassId !== '') {
            $query->whereHas('user', function ($q) use ($filterClassId) {
                $q->where('class_id', $filterClassId);
            });
        }

        // Filter: date range
        if ($request->query('start_date')) {
            $query->whereDate('created_at', '>=', $request->query('start_date'));
        }
        if ($request->query('end_date')) {
            $query->whereDate('created_at', '<=', $request->query('end_date'));
        }

        // Filter: only unresponded (optional)
        if ($request->query('unresponded_only') === 'true') {
            $query->whereNull('feedback_teacher');
        }

        // Relations & ordering
        $query->with([
            'user' => function ($q) {
                $q->select('id', 'name', 'class_id', 'level')
                  ->with('studentClass:id,name');
            },
        ])
        ->whereIn('category', ['harian', 'mingguan'])
        ->latest();

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data'         => $paginated->items(),
            'current_page' => $paginated->currentPage(),
            'last_page'    => $paginated->lastPage(),
            'total'        => $paginated->total(),
            'per_page'     => $paginated->perPage(),
        ]);
    }

    public function getAllStudentReflections()
    {
        $reflections = Reflection::with('user:id,name,class_id,level')
            ->whereIn('category', ['harian', 'mingguan'])
            ->latest()
            ->get();

        return response()->json($reflections);
    }
}