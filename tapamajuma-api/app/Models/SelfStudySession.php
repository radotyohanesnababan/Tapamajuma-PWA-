<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SelfStudySession extends Model
{
    use HasFactory;

    /**
     * Kolom yang boleh diisi secara massal (create/update).
     */
    protected $fillable = [
        'teacher_id',    // ID Guru pemandu
        'class_name',     // Nama Kelas (misal: "7A")
        'started_at',    // Waktu mulai
        'total_present', // Cache jumlah kehadiran
        'topic',         // (Opsional) Topik sesi
    ];

    /**
     * Casting tipe data otomatis.
     * Mengubah string tanggal di DB menjadi objek Carbon (Date).
     */
    protected $casts = [
        'started_at' => 'datetime',
    ];

    /**
     * =============================================
     * RELASI DATABASE
     * =============================================
     */

    /**
     * Relasi: Sesi ini dibuat oleh satu Guru (User).
     */
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Relasi: Sesi ini memiliki banyak Detail Kehadiran.
     */
    public function attendances()
    {
        return $this->hasMany(SessionAttendance::class, 'session_id');
    }

    /**
     * (Opsional) Helper Relasi: Ambil daftar siswa langsung.
     * Menggunakan tabel 'session_attendances' sebagai jembatan (Pivot).
     */
    public function students()
    {
        return $this->belongsToMany(User::class, 'session_attendances', 'session_id', 'student_id')
                    ->withPivot('is_active', 'notes') // Ambil kolom tambahan di tabel pivot
                    ->withTimestamps();
    }
}