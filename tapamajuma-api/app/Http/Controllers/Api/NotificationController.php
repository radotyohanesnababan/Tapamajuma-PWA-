<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\GlobalAnnouncement;
use App\Models\Reflection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['data' => []]);
        }

        $notifications = collect();

        if ($user->role === 'superadmin') {
            // 1. Global Announcement dari Stakeholder / Developer (Central DB)
            $globalAnnouncements = GlobalAnnouncement::where('is_active', true)
                ->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })
                ->whereIn('target_role', ['all', 'admin'])
                ->latest()
                ->get()
                ->map(function ($item) {
                    return [
                        'id'          => 'global_' . $item->id,
                        'raw_id'      => $item->id,
                        'type'        => 'global_announcement',
                        'title'       => $item->title,
                        'content'     => $item->content,
                        'source'      => 'Dinas / Stakeholder',
                        'target_role' => $item->target_role,
                        'created_at'  => $item->created_at?->toISOString() ?? (string)$item->created_at,
                        'can_forward' => true,
                    ];
                });

            // 2. Pengumuman Lokal Tenant (Tenant DB)
            $localAnnouncements = Announcement::where('is_active', true)
                ->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })
                ->latest()
                ->get()
                ->map(function ($item) {
                    return [
                        'id'          => 'local_' . $item->id,
                        'raw_id'      => $item->id,
                        'type'        => 'local_announcement',
                        'title'       => $item->title ?: 'Pengumuman Sekolah',
                        'content'     => $item->content,
                        'source'      => 'Sekolah (Internal)',
                        'target_role' => $item->target_role,
                        'created_at'  => $item->created_at?->toISOString() ?? (string)$item->created_at,
                        'can_forward' => false,
                    ];
                });

            $notifications = $notifications->merge($globalAnnouncements)->merge($localAnnouncements);
        } elseif ($user->role === 'teacher') {
            // 1. Global Announcements untuk teacher / all
            $globalAnnouncements = GlobalAnnouncement::where('is_active', true)
                ->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })
                ->whereIn('target_role', ['all', 'teacher'])
                ->latest()
                ->get()
                ->map(function ($item) {
                    return [
                        'id'          => 'global_' . $item->id,
                        'raw_id'      => $item->id,
                        'type'        => 'global_announcement',
                        'title'       => $item->title,
                        'content'     => $item->content,
                        'source'      => 'Dinas / Stakeholder',
                        'target_role' => $item->target_role,
                        'created_at'  => $item->created_at?->toISOString() ?? (string)$item->created_at,
                        'can_forward' => false,
                    ];
                });

            // 2. Pengumuman Lokal Sekolah untuk teacher / all
            $localAnnouncements = Announcement::where('is_active', true)
                ->whereIn('target_role', ['all', 'teacher'])
                ->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })
                ->latest()
                ->get()
                ->map(function ($item) {
                    return [
                        'id'          => 'local_' . $item->id,
                        'raw_id'      => $item->id,
                        'type'        => 'local_announcement',
                        'title'       => $item->title ?: 'Pengumuman Sekolah',
                        'content'     => $item->content,
                        'source'      => 'Sekolah',
                        'target_role' => $item->target_role,
                        'created_at'  => $item->created_at?->toISOString() ?? (string)$item->created_at,
                        'can_forward' => false,
                    ];
                });

            $notifications = $notifications->merge($globalAnnouncements)->merge($localAnnouncements);
        } else {
            // SISWA
            // 1. Global Announcements untuk student / all
            $globalAnnouncements = GlobalAnnouncement::where('is_active', true)
                ->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })
                ->whereIn('target_role', ['all', 'student'])
                ->latest()
                ->get()
                ->map(function ($item) {
                    return [
                        'id'          => 'global_' . $item->id,
                        'raw_id'      => $item->id,
                        'type'        => 'global_announcement',
                        'title'       => $item->title,
                        'content'     => $item->content,
                        'source'      => 'Dinas / Stakeholder',
                        'target_role' => $item->target_role,
                        'created_at'  => $item->created_at?->toISOString() ?? (string)$item->created_at,
                        'can_forward' => false,
                    ];
                });

            // 2. Pengumuman Lokal Sekolah untuk student / all
            $localAnnouncements = Announcement::where('is_active', true)
                ->whereIn('target_role', ['all', 'student'])
                ->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })
                ->latest()
                ->get()
                ->map(function ($item) {
                    return [
                        'id'          => 'local_' . $item->id,
                        'raw_id'      => $item->id,
                        'type'        => 'local_announcement',
                        'title'       => $item->title ?: 'Pengumuman Sekolah',
                        'content'     => $item->content,
                        'source'      => 'Sekolah',
                        'target_role' => $item->target_role,
                        'created_at'  => $item->created_at?->toISOString() ?? (string)$item->created_at,
                        'can_forward' => false,
                    ];
                });

            // 3. Balasan Refleksi dari Guru
            $reflections = Reflection::where('user_id', $user->id)
                ->whereNotNull('feedback_teacher')
                ->latest('updated_at')
                ->take(20)
                ->get()
                ->map(function ($ref) {
                    return [
                        'id'              => 'ref_feedback_' . $ref->id,
                        'raw_id'          => $ref->id,
                        'type'            => 'teacher_feedback',
                        'title'           => 'Tanggapan Refleksi Guru',
                        'content'         => $ref->feedback_teacher,
                        'student_content' => $ref->content,
                        'improvements'    => $ref->improvements,
                        'targets'         => $ref->targets,
                        'category'        => $ref->category,
                        'source'          => 'Guru Pembimbing',
                        'created_at'      => $ref->updated_at?->toISOString() ?? (string)$ref->updated_at,
                        'can_forward'     => false,
                    ];
                });

            $notifications = $notifications
                ->merge($globalAnnouncements)
                ->merge($localAnnouncements)
                ->merge($reflections);
        }

        $sorted = $notifications->sortByDesc('created_at')->values();

        return response()->json([
            'data'  => $sorted,
            'total' => $sorted->count(),
        ]);
    }
}
