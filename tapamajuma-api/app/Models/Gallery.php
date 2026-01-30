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
        'is_published'
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
}