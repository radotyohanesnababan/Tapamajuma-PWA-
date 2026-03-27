<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamSession extends Model
{
    protected $fillable = [
        'user_id', 'exam_id', 'question_order', 
        'student_answers', 'started_at', 'finished_at'
    ];

    // FITUR KRUSIAL: Otomatis ubah JSON ke Array
    protected $casts = [
        'question_order' => 'array',
        'student_answers' => 'array',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }
}