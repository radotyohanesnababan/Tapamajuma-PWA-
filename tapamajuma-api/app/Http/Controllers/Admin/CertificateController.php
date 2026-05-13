<?php
// app/Http/Controllers/Admin/CertificateController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\CertificateBatch;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class CertificateController extends Controller
{
    // ============================================================
    // CONSTANTS — semua tipe yang valid
    // ============================================================
        const TYPES = [
            'top_xp',
            'top_active',
            'top_active_morning',
            'top_teladan',
            'manual',
        ];

    const SCOPES = ['global', 'grade', 'class'];
    const GRADES = ['VII', 'VIII', 'IX'];

    // ============================================================
    // INDEX — list semua batch
    // ============================================================
    public function index()
    {
        $batches = CertificateBatch::withCount('certificates')
            ->latest()
            ->paginate(15);

        return response()->json(['data' => $batches]);
    }

    // ============================================================
    // PREVIEW — hitung ranking sebelum generate
    // Admin bisa lihat dulu siapa yang masuk sebelum commit
    // ============================================================
    public function preview(Request $request)
    {
        $request->validate([
            'type'        => 'required|in:' . implode(',', self::TYPES),
            'scope'       => 'required|in:' . implode(',', self::SCOPES),
            'scope_value' => 'nullable|string',
            'start_date'   => 'required_unless:type,manual|nullable|date',
            'end_date'     => 'required_unless:type,manual|nullable|date|after_or_equal:start_date',
            'limit'       => 'integer|min:1|max:10',
        ]);

        if ($request->type === 'manual') {
            return response()->json(['data' => [], 'manual' => true]);
        }

        $start = Carbon::parse($request->start_date)->startOfDay();
        $end   = Carbon::parse($request->end_date)->endOfDay();
        $limit = $request->limit ?? 5;

        $ranked = $this->getRanking(
            $request->type,
            $request->scope,
            $request->scope_value,
            $start,
            $end,
            $limit
        );

        return response()->json(['data' => $ranked]);
    }

    // ============================================================
    // GENERATE — buat batch + certificates
    // ============================================================
    public function generate(Request $request)
    {
        $request->validate([
            'type'         => 'required|in:' . implode(',', self::TYPES),
            'scope'        => 'required|in:' . implode(',', self::SCOPES),
            'scope_value'  => 'nullable|string',
            'start_date'   => 'required_unless:type,manual|nullable|date',
            'end_date'     => 'required_unless:type,manual|nullable|date|after_or_equal:start_date',
            'period_label' => 'required|string|max:100',
            'limit'        => 'integer|min:1|max:10',
            // Untuk manual
            'entries'      => 'required_if:type,manual|array',
            'entries.*.nis'     => 'required_if:type,manual|exists:users,nis',
            'entries.*.rank'        => 'required_if:type,manual|integer|min:1',
            'entries.*.score_label' => 'nullable|string|max:100',
        ]);

        $start = $request->type !== 'manual'
            ? Carbon::parse($request->start_date)->startOfDay()
            : null;
        $end = $request->type !== 'manual'
            ? Carbon::parse($request->end_date)->endOfDay()
            : null;
        $limit = $request->limit ?? 5;

        DB::transaction(function () use ($request, $start, $end, $limit) {
            // Buat batch
            $batch = CertificateBatch::create([
                'type'         => $request->type,
                'scope'        => $request->scope,
                'scope_value'  => $request->scope_value,
                'start_date'   => $start?->toDateString(),
                'end_date'     => $end?->toDateString(),
                'period_label' => $request->period_label,
                'status'       => 'draft',
            ]);

            // Ambil data ranking
            if ($request->type === 'manual') {
                $entries = collect($request->entries);
            } else {
                $entries = $this->getRanking(
                    $request->type,
                    $request->scope,
                    $request->scope_value,
                    $start,
                    $end,
                    $limit
                );
            }

            // Buat sertifikat per siswa
            foreach ($entries as $index => $entry) {
                Certificate::create([
                    'batch_id'    => $batch->id,
                    'user_id' => is_array($entry)
                    ? User::where('nis', $entry['nis'])->value('id')
                    : $entry->id,
                    'type'        => $request->type,
                    'scope'       => $request->scope,
                    'scope_value' => $request->scope_value,
                    'rank'        => is_array($entry)
                        ? $entry['rank']
                        : ($index + 1),
                    'score_label' => is_array($entry)
                        ? ($entry['score_label'] ?? null)
                        : $entry->score_label,
                    'period_label' => $request->period_label,
                    'start_date'   => $start?->toDateString(),
                    'end_date'     => $end?->toDateString(),
                    'status'       => 'draft',
                ]);
            }
        });

        return response()->json(['message' => 'Batch sertifikat berhasil dibuat']);
    }

    // ============================================================
    // RELEASE — ubah status batch + semua certificates-nya
    // ============================================================
public function release(CertificateBatch $batch)
{
    if ($batch->status !== 'printed') {
        return response()->json([
            'message' => 'Batch belum di-print, tidak bisa dirilis'
        ], 422);
    }

    DB::transaction(function () use ($batch) {
        $now = now();

        $batch->update([
            'status'      => 'released',
            'released_at' => $now,
        ]);

        $batch->certificates()->update([
            'status'      => 'released',
            'released_at' => $now,
        ]);

        
        $batch->certificates()->with('user')->get()
            ->each(function ($cert) {
                // Nanti diisi di Phase 5 (Web Push)
                // $cert->user->notify(new CertificateReleasedNotification($cert));
            });
    });

    return response()->json(['message' => 'Sertifikat berhasil dirilis ke siswa']);
}

    // ============================================================
    // MARK AS PRINTED — setelah admin cetak fisik
    // ============================================================
    public function markPrinted(CertificateBatch $batch)
    {
        if ($batch->status !== 'draft') {
            return response()->json([
                'message' => 'Status batch tidak valid'
            ], 422);
        }

        $batch->update(['status' => 'printed']);

        return response()->json(['message' => 'Batch ditandai sudah dicetak']);
    }

    // ============================================================
    // SHOW BATCH — detail batch beserta daftar sertifikat
    // ============================================================
    public function show(CertificateBatch $batch)
    {
        $batch->load(['certificates.user', 'certificates.user.classNameforCertificate']);
        return response()->json(['data' => $batch]);
    }

    // ============================================================
    // HELPER: GET RANKING
    // Mirror persis dari ReportController — satu source of truth
    // ============================================================
    private function getRanking(
        string $type,
        string $scope,
        ?string $scopeValue,
        Carbon $start,
        Carbon $end,
        int $limit = 5
    ): \Illuminate\Support\Collection {

        // Base query — selalu join class_names
        $base = fn() => User::where('users.role', 'student')
            ->join('class_names', 'users.class_id', '=', 'class_names.id')
            ->select('users.nis', 'users.id', 'users.name', 'class_names.name as class_name');

        // Filter scope
        $applyScope = function ($query) use ($scope, $scopeValue) {
            if ($scope === 'grade' && $scopeValue) {
                // VII → cari class_names.name LIKE 'VII-%'
                $query->where('class_names.name', 'like', "{$scopeValue}-%");
            } elseif ($scope === 'class' && $scopeValue) {
                $query->where('class_names.name', $scopeValue);
            }
            // global = tidak ada filter tambahan
            return $query;
        };

        $startStr = $start->toDateTimeString();
        $endStr   = $end->toDateTimeString();

        return match($type) {

            'top_xp' => $applyScope($base())
                ->addSelect(DB::raw("
                    (SELECT COALESCE(SUM(xp), 0)
                    FROM xp_logs
                    WHERE xp_logs.user_id = users.id
                    AND xp_logs.created_at BETWEEN '{$startStr}' AND '{$endStr}'
                    ) as metric
                "))
                ->orderByDesc('metric')
                ->limit($limit)
                ->get()
                ->map(fn($u) => $this->mapResult($u, $u->metric . ' XP')),

            'top_active' => $applyScope($base())
                ->withCount(['dailyActivities as metric' => fn($q) =>
                    $q->whereBetween('created_at', [$start, $end])])
                ->orderByDesc('metric')
                ->limit($limit)
                ->get()
                ->map(fn($u) => $this->mapResult($u, $u->metric . ' aktivitas')),

            'top_active_morning' => $applyScope($base())
                ->withCount(['attendances as metric' => fn($q) =>
                    $q->where('is_active', 1)
                    ->whereBetween('created_at', [$start, $end])])
                ->having('metric', '>', 0)
                ->orderByDesc('metric')
                ->limit($limit)
                ->get()
                ->map(fn($u) => $this->mapResult($u, $u->metric . ' kehadiran')),

            'top_teladan' => $applyScope($base())
            ->addSelect(DB::raw("
                (SELECT COALESCE(SUM(xp), 0)
                FROM xp_logs
                WHERE xp_logs.user_id = users.id
                AND xp_logs.created_at BETWEEN '{$startStr}' AND '{$endStr}'
                ) as metric
            "))
            ->orderByDesc('metric')
            ->limit($limit)
            ->get()
            ->map(fn($u) => $this->mapResult($u, $u->metric . ' XP')),

            default => collect(),
        };
    }

    public function generatePdf(CertificateBatch $batch)
{
    if ($batch->status !== 'draft') {
        return response()->json(['message' => 'Batch sudah diproses'], 422);
    }

    $batch->load('certificates.user.classNameforCertificate');

    foreach ($batch->certificates as $certificate) {
        $this->renderAndStorePdf($certificate);
    }

    // Update status ke printed
    $batch->update(['status' => 'printed']);
    $batch->certificates()->update(['status' => 'printed']);

    return response()->json(['message' => 'PDF berhasil digenerate']);
}

private function renderAndStorePdf(Certificate $certificate): void
{
    // 1. QR Code Dinamis (Raw SVG murni - tidak butuh imagick/gd sama sekali)
    $qrContent = route('certificates.verify', $certificate->id);
    $qrCode = QrCode::size(120)->generate($qrContent); 

    // 2. Label ranking
    $rankLabel = $this->buildRankLabel($certificate);

    // 3. Encode gambar lokal ke Base64 (Path SUDAH BENAR pakai storage/images/)
    $logoKiri           = 'data:image/png;base64,' . base64_encode(file_get_contents(public_path('storage/images/logo_pemkab.png')));
    $logoKanan          = 'data:image/png;base64,' . base64_encode(file_get_contents(public_path('storage/images/iconappp.png')));
    $stempelImage       = 'data:image/png;base64,' . base64_encode(file_get_contents(public_path('storage/images/stempel.png')));
    $principalSignature = 'data:image/png;base64,' . base64_encode(file_get_contents(public_path('storage/images/ttd_kepsek.png')));

    // 4. Load View PDF
    $pdf = Pdf::loadView('pdf.certificate', [
        'certificate'        => $certificate,
        'rankLabel'          => $rankLabel,
        'qrCode'             => $qrCode, // Ini sekarang berisi string XML <svg> murni
        'logoKiri'           => $logoKiri,
        'logoKanan'          => $logoKanan,
        'schoolName'         => 'SMP Negeri 1 Siborongborong',
        'schoolAddress'      => 'Jl Pacuan No. 02, Kecamatan Siborongborong, Kabupaten Tapanuli Utara, Sumatera Utara 22454',
        'principalName'      => 'Marturak Lumbantoruan, S.Pd.',
        'principalNip'       => '19650101 199203 1 001',
        'principalSignature' => $principalSignature,
        'stempelImage'       => $stempelImage,
    ])->setPaper('a4', 'landscape');

    // 5. Simpan ke R2
    $path = "certificates/{$certificate->batch_id}/cert-{$certificate->id}-rank{$certificate->rank}.pdf";
    Storage::disk('r2')->put($path, $pdf->output());

    // 6. Update database
    $certificate->update(['pdf_path' => $path]);
}

private function buildRankLabel(Certificate $certificate): string
{
    $scopeText = match($certificate->scope) {
        'global' => 'Global Seluruh Siswa',
        'grade'  => "Angkatan {$certificate->scope_value}",
        'class'  => "Kelas {$certificate->scope_value}",
        default  => '',
    };

    $typeText = match($certificate->type) {
        'top_xp'             => 'Top XP Tertinggi',
        'top_active'         => 'Siswa Teraktif',
        'top_active_morning' => 'Rajin Sesi Pagi',
        'top_teladan'        => 'Siswa Terbaik',
        'manual'             => 'Penghargaan Khusus',
        default              => '',
    };

    $rankText = match($certificate->rank) {
        1 => 'Peringkat 1',
        2 => 'Peringkat 2',
        3 => 'Peringkat 3',
        default => "Peringkat {$certificate->rank}",
    };

    return "{$rankText} — {$typeText} ({$scopeText})";
}

// Endpoint download PDF (untuk admin preview & siswa)
public function download(Certificate $certificate)
{
    // Cek ownership manual — tidak butuh Policy
    if (Auth::user()->id !== $certificate->user_id && Auth::user()->role !== 'superadmin') {
        return response()->json(['message' => 'Unauthorized'], 403);
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

// Halaman verifikasi publik (no auth)
public function verify(Certificate $certificate)
{
    return response()->json([
        'valid'        => true,
        'name'         => $certificate->user->name,
        'class'        => $certificate->user->className->name,
        'achievement'  => $this->buildRankLabel($certificate),
        'period'       => $certificate->period_label,
        'score'        => $certificate->score_label,
        'issued_at'    => $certificate->released_at?->translatedFormat('d F Y'),
        'blockchain_tx'=> $certificate->blockchain_tx,
    ]);
}

public function destroyBatch(CertificateBatch $batch)
{
    // Opsi: Anda bisa menambahkan pengecekan keamanan di sini, 
    // misalnya tidak mengizinkan penghapusan jika statusnya sudah 'released'.
    // Namun, sesuai permintaan Anda "hapus saja", kita abaikan pengecekan status.

    DB::transaction(function () use ($batch) {
        // 1. Hapus SEMUA File PDF di Storage (R2/Lokal)
        // Struktur folder kita: certificates/{batch_id}/...
        $batchStorageDir = "certificates/{$batch->id}";
        
        // Ambil default disk dari konfigurasi (.env) agar otomatis mendeteksi R2/Lokal
        $disk = config('filesystems.default');

        if (Storage::disk($disk)->exists($batchStorageDir)) {
            // deleteDirectory menghapus seluruh isi folder sekaligus
            Storage::disk($disk)->deleteDirectory($batchStorageDir);
        }

        // 2. Hapus semua data sertifikat siswa di MySQL
        // Pastikan Anda melakukan ini sebelum menghapus batch-nya
        $batch->certificates()->delete();

        // 3. Hapus data batch-nya sendiri di MySQL
        $batch->delete();
    });

    return response()->json(['message' => 'Batch dan semua sertifikat terkait berhasil dihapus permanen.']);
}

private function imageToBase64(string $path): string
{
    // Jika file tidak ada, catat di log, lalu kembalikan string kosong
    if (!file_exists($path)) {
        Log::error('Gambar PDF tidak ditemukan di path: ' . $path);
        return ''; 
    }

    $type = pathinfo($path, PATHINFO_EXTENSION);
    $fileData = file_get_contents($path);
    
    return 'data:image/' . $type . ';base64,' . base64_encode($fileData);
}

    // ============================================================
    // HELPER: Map result — tambah score_label
    // ============================================================
private function mapResult(User $user, string $scoreLabel): User
    {
        $user->score_label = $scoreLabel;
        return $user;
    }

    
}