<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class DailyActivity extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'score',
        'audio_path',
        'confidence_level',
        'journal'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke Refleksi (Setiap aktivitas bisa punya 1 strategi berpikir)
    public function reflection(): HasOne
    {
        return $this->hasOne(Reflection::class, 'activity_id');
    }
}
