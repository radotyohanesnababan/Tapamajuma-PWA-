<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = ['title', 'content', 'target_role', 'is_active', 'expires_at'];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
