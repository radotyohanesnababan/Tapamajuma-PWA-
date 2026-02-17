<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuestionBank extends Model
{
    use HasFactory;

    protected $fillable = [
        'creator_id',
        'subject_id',
        'class_id',
        'question_text',
        'options',
        'image',
        'correct_key',
        'type',
    ];

    // Otomatis ubah JSON ke Array saat diambil
    protected $casts = [
        'options' => 'array',
    ];

    // Relasi ke User (Guru Pembuat)
    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
    public function targetClass()
    {
        return $this->belongsTo(ClassName::class, 'class_id');
    }
}