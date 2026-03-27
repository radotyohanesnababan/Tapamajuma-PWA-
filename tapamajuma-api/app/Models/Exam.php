<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    protected $fillable = [
        'title', 
        'subject_id', 
        'duration_minutes', 
        'start_time', 
        'end_time', 
        'total_questions', 
        'seb_config_key', 
        'allowed_question_types', 
        'question_ids',
        'token_released_at', 
        'token',
        'status',          // <--- Tambahkan ini
        'selection_mode',  // <--- Tambahkan ini
        'allowed_classes', // <--- Tambahkan ini (kalau ada di DB)
    ];

    protected $casts = [
        'question_ids' => 'array',
        'allowed_question_types' => 'array',
        'allowed_classes' => 'array', // <--- Tambahkan ini
        'token_released_at' => 'datetime',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function sessions()
    {
        return $this->hasMany(ExamSession::class);
    }
}