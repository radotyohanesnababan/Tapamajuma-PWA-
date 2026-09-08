<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GlobalAnnouncement extends Model
{
    protected $connection = 'central';

    protected $fillable = [
        'title', 'content', 'target_role', 'is_active', 'expires_at', 'created_by',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(DeveloperUser::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            });
    }
}
