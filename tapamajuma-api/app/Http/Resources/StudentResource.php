<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    /**
     * Mengubah resource menjadi array.
     *
     * Metode ini mengubah resource menjadi array dan mengembalikannya.
     * Metode ini digunakan untuk mengubah resource menjadi array yang dapat
     * dikembalikan dalam respon JSON.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Mengembalikan array yang berisi data resource.
        return [
            // ID siswa.
            'id' => $this->id,

            // Nama siswa.
            'nama' => $this->name,

            // Level siswa.
            'level' => $this->level,

            // Jumlah total aktivitas harian yang diselesaikan siswa.
            // Jika siswa telah melakukan aktivitas harian, maka jumlah aktivitas
            // yang diselesaikan akan dikembalikan. Jika tidak, maka null akan
            // dikembalikan.
            'total_activitas' => $this->daily_activities_count ?? $this->dailyActivities()->count(),

            // Peran siswa.
            'peran' => $this->role,
        ];
    }
}
