<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'activity_id',
        'title',
        'file_path',
        'file_type',
        'subject_id',
        'share_token',
        'is_published',
        'academic_period_id',
        'view_count',
    ];

    /**
     * Relasi ke User (Siswa pemilik karya)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke Activity (Aktivitas harian terkait)
     */
    public function activity()
    {
        return $this->belongsTo(DailyActivity::class, 'activity_id');
    }

    /**
     * Relasi ke Subject (Mata pelajaran terkait)
     */
    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }



    public function getPublicUrlAttribute()
    {
        if ($this->share_token) {
            return env('FRONTEND_URL') . '/s/' . $this->share_token;
        }
        return null;
    }
}