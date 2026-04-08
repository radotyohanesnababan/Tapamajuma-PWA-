<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AllowedNis extends Model
{
    protected $table = 'allowed_nis';

    protected $fillable = [
        'nis',
        'is_used',
        'used_by',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'used_by');
    }
}
