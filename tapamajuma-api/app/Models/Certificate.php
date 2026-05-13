<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// app/Models/Certificate.php
class Certificate extends Model
{
    protected $fillable = [
    'batch_id', 'nis', 'type', 'scope', 'scope_value',
    'rank', 'score_label', 'period_label',  // ← tambah ini
    'start_date', 'end_date',
    'pdf_path', 'blockchain_tx',
    'status', 'released_at',
    ];

    protected $casts = [
        'released_at' => 'datetime',
        'rank' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'nis', 'nis');
    }

    public function isReleased(): bool
    {
        return $this->status === 'released';
    }
}
