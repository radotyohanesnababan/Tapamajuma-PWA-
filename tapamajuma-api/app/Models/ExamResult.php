<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamResult extends Model
{
    protected $fillable = [
        'user_id', 'exam_id', 'total_questions', 
        'correct_answers', 'wrong_answers', 'score'
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
