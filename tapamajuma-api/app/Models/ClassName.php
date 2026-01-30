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
}
