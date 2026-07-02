<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentEnrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'class_name_id',
        'academic_period_id',
        'is_active',
        'enrolled_at',
        'left_at',
        'next_class_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'enrolled_at' => 'date',
        'left_at' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function className(): BelongsTo
    {
        return $this->belongsTo(ClassName::class, 'class_name_id');
    }
    // Tambah relasi ini di bawah relasi className()
    public function nextClass(): BelongsTo
    {
        return $this->belongsTo(ClassName::class, 'next_class_id');
    }

    public function academicPeriod(): BelongsTo
    {
        return $this->belongsTo(AcademicPeriod::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}