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
    'improvements', 
    'targets', 
    'feedback_teacher'
    ];

    protected $casts = [
    'peer_feedback' => 'array',
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
