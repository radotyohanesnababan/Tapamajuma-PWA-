<?php

namespace App\Services;

use App\Models\User;
use App\Models\XpLog;

class XpService
{
    // =========================================================
    //  KONSTANTA XP — ubah di sini jika ingin sesuaikan nilai
    // =========================================================
    const XP_GALLERY    = 50;
    const XP_ATTENDANCE = 50;

    /**
     * Hitung XP dari Daily Activity.
     * Formula: score × multiplier berdasarkan confidence_level
     *
     * Confidence 1-2 → ×0.8 (kurang yakin)
     * Confidence 3   → ×1.0 (normal)
     * Confidence 4   → ×1.2 (yakin)
     * Confidence 5   → ×1.5 (sangat yakin)
     */
    public static function fromActivity(int $score, int $confidence): int
    {
        $multipliers = [
            1 => 0.8,
            2 => 0.8,
            3 => 1.0,
            4 => 1.2,
            5 => 1.5,
        ];

        // Bonus confidence hanya berlaku kalau score >= 60
        // Di bawah 60, confidence diabaikan dan kena penalti flat 0.8
        // Tujuan: mencegah siswa ngasal confidence 5 untuk dongkrak XP
        if ($score < 60) {
            return (int) round($score * 0.8);
        }

        $multiplier = $multipliers[$confidence] ?? 1.0;

        return (int) round($score * $multiplier);
    }

    /**
     * Berikan XP ke user dan catat ke xp_logs.
     *
     * @param int         $userId
     * @param int         $xp        Jumlah XP yang diberikan
     * @param string      $source    'daily_activity' | 'gallery' | 'attendance'
     * @param int|null    $sourceId  ID record sumber (opsional, untuk audit)
     */
    public static function award(int $userId, int $xp, string $source, ?int $sourceId = null): void
    {
        // Tambah XP ke kolom user
        User::where('id', $userId)->increment('xp_points', $xp);

        // Catat log untuk audit / riwayat XP
        XpLog::create([
            'user_id'   => $userId,
            'xp'        => $xp,
            'source'    => $source,
            'source_id' => $sourceId,
        ]);
    }

   public static function deduct(int $userId, int $xp, string $source, ?int $sourceId = null): void
    {
        // Kurangi XP tapi tidak boleh minus (minimum 0)
        User::where('id', $userId)
            ->where('xp_points', '>=', $xp)
            ->decrement('xp_points', $xp);

        // Kalau XP user kurang dari yang mau dikurangi, set ke 0
        User::where('id', $userId)
            ->where('xp_points', '<', $xp)
            ->update(['xp_points' => 0]);

        // Hapus log XP terkait agar recalculate tidak menghitung ulang
        XpLog::where('user_id', $userId)
            ->where('source', $source)
            ->where('source_id', $sourceId)
            ->delete();
    }
}