<?php

namespace App\Models;

use App\Models\Certificate;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

// CertificateBatch.php
class CertificateBatch extends Model
{
    protected $fillable = [
        'type', 'scope', 'scope_value',
        'start_date', 'end_date', 'period_label',
        'status', 'released_at',
    ];

    protected $casts = [
        'start_date'  => 'date',
        'end_date'    => 'date',
        'released_at' => 'datetime',
    ];

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class, 'batch_id');
    }
}
