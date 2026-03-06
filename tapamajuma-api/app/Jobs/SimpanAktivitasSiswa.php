<?php

namespace App\Jobs;

use App\Models\DailyActivity;
use App\Models\User;
use App\Services\XpService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SimpanAktivitasSiswa implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function handle(): void
    {
        try {
            // 1. Simpan aktivitas ke database
            $activity = DailyActivity::create($this->data);

            $user = User::find($this->data['user_id']);

            if ($user) {
                // 2. Hitung XP baru dengan formula score × multiplier confidence
                $score      = (int) ($this->data['score'] ?? 0);
                $confidence = (int) ($this->data['confidence_level'] ?? 3);

                $xp = XpService::fromActivity($score, $confidence);

                // 3. Berikan XP ke siswa + catat log
                XpService::award(
                    userId:   $user->id,
                    xp:       $xp,
                    source:   'daily_activity',
                    sourceId: $activity->id,
                );

                // 4. Hitung ulang level dari logika lama (tetap dipertahankan)
                $totalXp       = $user->dailyActivities()->sum('score');
                $literacyBonus = $user->dailyActivities()->where('type', 'literacy')->count() * 10;
                $finalXp       = $totalXp + $literacyBonus;
                $newLevel      = floor($finalXp / 100) + 1;

                if ($user->level != $newLevel) {
                    $user->level = $newLevel;
                    $user->save();
                }

                Log::info("XP awarded: user_id={$user->id} xp={$xp} level={$user->level} source=daily_activity activity_id={$activity->id}");
            }

        } catch (\Exception $e) {
            Log::error('SimpanAktivitasSiswa Job Error: ' . $e->getMessage());
            throw $e;
        }
    }
}