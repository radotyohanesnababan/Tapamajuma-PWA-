<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    protected $fillable = ['name'];

    public function questions()
    {
        return $this->hasMany(QuestionBank::class);
    }

    public function galleries()
    {
        return $this->hasMany(Gallery::class, 'subject_id');
    }
}