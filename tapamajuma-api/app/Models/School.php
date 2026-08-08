<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class School extends Model
{
    protected $connection = 'central';

    protected $fillable = [
        'name', 'slug', 'domain',
        'db_host', 'db_name', 'db_user', 'db_password',
        'r2_prefix',
        'address', 'phone', 'email',
        'principal_name', 'principal_nip',
        'manager_name', 'manager_nip',
        'logo_path', 'principal_signature_path',
        'manager_signature_path', 'stamp_path',
        'config', 'is_active',
    ];

    protected $casts = [
        'config'    => 'array',
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'db_password',
        'db_host',
        'db_name', 
        'db_user',
    ];
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($school) {
            $config = $school->config ?? [];
            if (empty($config['logger_api_key'])) {
                $config['logger_api_key'] = Str::random(40);
                $school->config = $config;
            }
        });
    }
}