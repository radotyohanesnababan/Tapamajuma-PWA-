<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SessionAttendance extends Model
{
    use HasFactory;

    /**
     * Kolom yang boleh diisi.
     */
    protected $fillable = [
        'session_id', // ID Header Sesi
        'student_id', // ID Siswa
        'is_active',  // Status (true = hadir/aktif)
        'notes',      // Catatan perilaku (opsional)
    ];

    /**
     * Casting tipe data.
     */
    protected $casts = [
        'is_active' => 'boolean', // 1/0 di DB jadi true/false di PHP
    ];

    /**
     * =============================================
     * RELASI DATABASE
     * =============================================
     */

    /**
     * Relasi: Data kehadiran ini milik Sesi siapa?
     */
    public function session()
    {
        return $this->belongsTo(SelfStudySession::class, 'session_id');
    }

    /**
     * Relasi: Data kehadiran ini milik Siswa siapa?
     */
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}