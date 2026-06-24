<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'semester',
        'academic_year',
        'is_active',
        'opened_at',
        'closed_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function studentEnrollments(): HasMany
    {
        return $this->hasMany(StudentEnrollment::class);
    }

    public function galleries(): HasMany
    {
        return $this->hasMany(Gallery::class);
    }

    /**
     * Scope untuk ambil periode yang sedang aktif.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Helper statis: ambil periode aktif saat ini.
     * Dipakai di banyak tempat (controller, model lain) jadi disentralkan di sini.
     */
    public static function current(): ?self
    {
        return static::active()->first();
    }

    /**
     * Tutup periode ini dan aktifkan periode baru.
     * Dipakai saat proses kenaikan kelas / pergantian semester.
     */
    public function closeAndActivateNext(self $nextPeriod): void
    {
        $this->update([
            'is_active' => false,
            'closed_at' => now(),
        ]);

        $nextPeriod->update([
            'is_active' => true,
            'opened_at' => now(),
        ]);
    }
}