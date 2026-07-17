<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Services\XpService;
use Carbon\Carbon;
use App\Models\Subject;
use App\Models\AcademicPeriod;

class GalleryController extends Controller
{
    public function subjects()
    {
        return response()->json(
            Subject::orderBy('name')->get(['id', 'name'])
        );
    }

    private function formatGalleryUrl($gallery)
    {
        if ($gallery->file_type === 'link') {
            return $gallery->file_path;
        }

        return $gallery->file_path ? Storage::url($gallery->file_path) : null;
    }

    public function index(Request $request)
    {
        $user = $request->user();

        // Hitung sisa kuota (hanya untuk student)
        $quota = null;
        if (!in_array($user->role, ['teacher', 'superadmin'])) {
            $startOfWeek = now('Asia/Jakarta')->copy()->startOfWeek(Carbon::MONDAY)->utc();
            $endOfWeek   = now('Asia/Jakarta')->copy()->endOfWeek(Carbon::SUNDAY)->utc();

            $uploaded = Gallery::where('user_id', $user->id)
                ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
                ->count();

            $quota = [
                'used'      => $uploaded,
                'max'       => self::MAX_UPLOAD_PER_WEEK,
                'remaining' => max(0, self::MAX_UPLOAD_PER_WEEK - $uploaded),
            ];
        }

        $query = Gallery::with([
                'user:id,name',
                'subject:id,name',
            ])
            ->where('is_published', true);

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        $galleries = $query->latest()->paginate(10);

        $galleries->getCollection()->transform(function ($item) {
            $item->file_url = $this->formatGalleryUrl($item);
            return $item;
        });

        return response()->json([
            'quota' => $quota,
            ...$galleries->toArray(),
        ]);
    }

    public function indexfortc(Request $request)
    {
        $user = $request->user();

        // accessible_classes tetap dipakai untuk teacher (array of class_name_id)
        $allowedClassIds = $user->accessible_classes ?? [];

        $query = Gallery::query();

        // Batasi gallery berdasarkan kelas yang boleh diakses teacher
        // Sekarang join ke student_enrollments, bukan class_id di users
        if ($user->role !== 'superadmin') {
            $query->whereHas('user.activeEnrollment', function ($q) use ($allowedClassIds) {
                $q->whereIn('class_name_id', $allowedClassIds);
            });
        }

        // Filter kelas spesifik (dari ?class_id=1)
        if ($request->filled('class_id') && strtolower($request->class_id) !== 'all') {
            $classId = $request->class_id;
            $query->whereHas('user.activeEnrollment', function ($q) use ($classId) {
                $q->where('class_name_id', $classId);
            });
        }

        // Search by judul atau nama siswa
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        // Filter subject
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        $perPage = $request->get('per_page', 12);

        $galleries = $query
            ->with([
                // Load user + enrollment aktif + nama kelas dari enrollment
                'user' => function ($q) {
                    $q->select('id', 'name')
                      ->with([
                          'activeEnrollment' => function ($eq) {
                              $eq->with('className:id,name');
                          }
                      ]);
                },
                'subject:id,name',
            ])
            ->latest()
            ->paginate($perPage);

        $galleries->getCollection()->transform(function ($item) {
            $item->file_url = $this->formatGalleryUrl($item);

            // Tambah class_name langsung di item supaya frontend tidak perlu
            // drill ke user.activeEnrollment.className.name
            $item->class_name = $item->user?->activeEnrollment?->className?->name;

            return $item;
        });

        return response()->json($galleries);
    }

    public function destroy($id)
    {
        $gallery = Gallery::findOrFail($id);

        XpService::deduct(
            userId:   $gallery->user_id,
            xp:       XpService::XP_GALLERY,
            source:   'gallery',
            sourceId: $gallery->id,
        );

        if ($gallery->file_type !== 'link' && $gallery->file_path) {
            Storage::delete($gallery->file_path);
        }

        $gallery->delete();
        return response()->json(['message' => 'Karya berhasil dihapus']);
    }

    public function share(Request $request, $id)
    {
        $gallery = Gallery::findOrFail($id);

        if (!$gallery->share_token) {
            $gallery->update([
                'share_token' => Str::random(32),
                'is_public'   => true,
            ]);
        }

        $shareUrl = config('app.frontend_url') . '/s/' . $gallery->share_token;

        return response()->json([
            'message' => 'Link siap dibagikan!',
            'url'     => $shareUrl,
        ]);
    }

    public function showPublic($token)
    {
        $gallery = Gallery::where('share_token', $token)
                          ->where('is_published', true)
                          ->firstOrFail();

        return response()->json([
            'title'      => $gallery->title,
            'type'       => $gallery->file_type,
            'url'        => $this->formatGalleryUrl($gallery),
            'owner_name' => $gallery->user->name ?? 'Anonim',
            'created_at' => $gallery->created_at->isoFormat('D MMMM Y'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'activity_id' => 'nullable',
            'type'        => 'required|in:file,link',
            'subject_id'  => 'nullable|exists:subjects,id',
        ]);

        $eligibilityError = $this->checkUploadEligibility(Auth::user());
        if ($eligibilityError) {
            return response()->json(
                ['message' => $eligibilityError['message']],
                $eligibilityError['status']
            );
        }

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
                $file      = $request->file('file');
                $extension = strtolower($file->getClientOriginalExtension());
                $path      = $file->store('galleries');
                $filePath  = ltrim($path, '/');

                if (in_array($extension, ['jpg', 'jpeg', 'png'])) {
                    $fileType = 'image';
                } elseif (in_array($extension, ['mp3', 'wav', 'webm', 'm4a', 'mpga', 'ogg'])) {
                    $fileType = 'audio';
                } elseif ($extension === 'pdf') {
                    $fileType = 'pdf';
                } elseif ($extension === 'mov') {
                    $fileType = 'video';
                } else {
                    $fileType = 'document';
                }
            }
        }

        // Ambil academic_period_id yang aktif saat ini
        $activePeriod = AcademicPeriod::current();

        $gallery = Gallery::create([
            'user_id'            => Auth::id(),
            'activity_id'        => $request->activity_id,
            'title'              => $request->title,
            'file_path'          => $filePath,
            'file_type'          => $fileType,
            'subject_id'         => $request->subject_id,
            'is_published'       => true,
            'academic_period_id' => $activePeriod?->id, // nullable, aman kalau belum ada periode
        ]);

        XpService::award(
            userId:   Auth::id(),
            xp:       XpService::XP_GALLERY,
            source:   'gallery',
            sourceId: $gallery->id,
        );

        return response()->json([
            'message' => 'Karya berhasil dipublikasikan!',
            'data'    => $gallery,
            'url'     => $this->formatGalleryUrl($gallery),
        ], 201);
    }

    const MAX_UPLOAD_PER_WEEK = 3;

    const UPLOAD_SCHEDULE = [
        7 => ['day' => Carbon::THURSDAY, 'label' => 'Kamis'],
        8 => ['day' => Carbon::FRIDAY,   'label' => 'Jumat'],
        9 => ['day' => Carbon::SATURDAY, 'label' => 'Sabtu'],
    ];

    private function checkUploadEligibility(User $user): ?array
    {
        if (in_array($user->role, ['teacher', 'superadmin'])) {
            return null;
        }

        // DIUBAH: pakai currentClass() dari enrollment, bukan studentClass dari class_id
        $className = $user->currentClass()?->name ?? '';

        $romanMap = [
            'VII'  => 7,
            'VIII' => 8,
            'IX'   => 9,
        ];

        $romanPart = explode('-', trim($className))[0];
        $grade     = $romanMap[$romanPart] ?? null;

        if (!$grade || !isset(self::UPLOAD_SCHEDULE[$grade])) {
            return null;
        }

        $schedule = self::UPLOAD_SCHEDULE[$grade];
        $nowWib   = now('Asia/Jakarta');
        $today    = $nowWib->dayOfWeek;

        if ($today !== $schedule['day']) {
            return [
                'status'  => 403,
                'message' => "Kelas {$grade} hanya bisa upload pada hari {$schedule['label']}. 🗓️",
            ];
        }

        $startOfWeek = $nowWib->copy()->startOfWeek(Carbon::MONDAY)->utc();
        $endOfWeek   = $nowWib->copy()->endOfWeek(Carbon::SUNDAY)->utc();

        $uploadedThisWeek = Gallery::where('user_id', $user->id)
            ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
            ->count();

        if ($uploadedThisWeek >= self::MAX_UPLOAD_PER_WEEK) {
            return [
                'status'  => 429,
                'message' => "Kuota minggu ini sudah penuh (maks. " . self::MAX_UPLOAD_PER_WEEK . " karya/minggu). Sampai {$schedule['label']} depan ya! ",
            ];
        }

        return null;
    }
}