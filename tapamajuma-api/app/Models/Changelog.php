<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Changelog extends Model
{
    protected $guarded = [];

    protected $casts = [
        'changes' => 'array', // PENTING: Auto convert JSON ke Array
        'release_date' => 'date',
    ];
}
