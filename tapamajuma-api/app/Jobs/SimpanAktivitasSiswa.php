<?php

namespace App\Jobs;

use App\Models\DailyActivity;
use App\Models\User; // <-- Pastikan import model User
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SimpanAktivitasSiswa implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function handle()
    {
        try {
            // 1. Koki mencatat aktivitas ke Database
            DailyActivity::create($this->data);

            // 2. Koki menghitung XP dan Level terbaru
            $user = User::find($this->data['user_id']);
            
            if ($user) {
                $totalXp = $user->dailyActivities()->sum('score');
                $literacyBonus = $user->dailyActivities()->where('type', 'literacy')->count() * 10; 
                
                $finalXp = $totalXp + $literacyBonus;
                $newLevel = floor($finalXp / 100) + 1;

                if ($user->level != $newLevel) {
                    $user->level = $newLevel;
                    $user->save();
                }
            }
        } catch (\Exception $e) {
            // Kalau Koki gagal, catat di log agar kita bisa perbaiki
            Log::error("Job SimpanAktivitas Gagal: " . $e->getMessage());
        }
    }
}