<?php

namespace App\Jobs; // boleh tetap, tapi idealnya pindah ke App\Services

use App\Models\DailyActivity;
use App\Models\User;
use App\Services\XpService;
use Illuminate\Support\Facades\Log;

class SimpanAktivitasSiswa
{
    public static function handle(array $data): DailyActivity
    {
        try {
            // 1. Simpan aktivitas
            $activity = DailyActivity::create($data);

            // 2. Ambil user dari relasi (lebih efisien)
            $user = $activity->user;

            if ($user) {
                // 3. Hitung XP
                $score      = (int) ($activity->score ?? 0);
                $confidence = (int) ($activity->confidence_level ?? 3);

                $xp = XpService::fromActivity($score, $confidence);

                // 4. Award XP
                XpService::award(
                    userId:   $user->id,
                    xp:       $xp,
                    source:   'daily_activity',
                    sourceId: $activity->id,
                );

                // 5. Hitung ulang level (sementara pakai cara lama)
                $totalXp = $user->dailyActivities()->sum('score');

                $literacyBonus = $user->dailyActivities()
                    ->where('type', 'literacy')
                    ->count() * 10;

                $finalXp  = $totalXp + $literacyBonus;
                $newLevel = floor($finalXp / 100) + 1;

                if ($user->level != $newLevel) {
                    $user->level = $newLevel;
                    $user->save();
                }

                Log::info("XP awarded: user_id={$user->id} xp={$xp} level={$user->level} activity_id={$activity->id}");
            }

            return $activity;

        } catch (\Exception $e) {
            Log::error('SimpanAktivitasSiswa Service Error: ' . $e->getMessage());
            throw $e;
        }
    }
}