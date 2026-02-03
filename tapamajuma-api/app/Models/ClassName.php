<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassName extends Model
{
   protected $fillable = ['name'];

    // Relasi ke Siswa
    public function students()
    {
        return $this->hasMany(User::class, 'class_id');
    }

    public function teachers()
    {
        return $this->belongsToMany(User::class, 'class_name_user');
    }
}
