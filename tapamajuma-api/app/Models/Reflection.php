<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reflection extends Model
{
    protected $fillable = [
        'user_id',
        'activity_id',
        'category',
        'content',
        'feedback_teacher'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function dailyActivity()
    {
        return $this->belongsTo(DailyActivity::class, 'activity_id');
    }
}
