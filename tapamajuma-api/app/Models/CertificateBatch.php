<?php

namespace App\Models;

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

// Certificate.php
class Certificate extends Model
{
    protected $fillable = [
        'batch_id', 'user_id', 'type', 'scope', 'scope_value',
        'rank', 'score_label', 'period_label',
        'start_date', 'end_date',
        'pdf_path', 'blockchain_tx',
        'status', 'released_at',
    ];

    protected $casts = [
        'start_date'  => 'date',
        'end_date'    => 'date',
        'released_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(CertificateBatch::class, 'batch_id');
    }
}
