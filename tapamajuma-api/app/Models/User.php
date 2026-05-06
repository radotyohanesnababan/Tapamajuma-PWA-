<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\DailyActivity;
use App\Models\ClassName;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * Override method bawaan Laravel untuk kirim reset password
     */
    public function sendPasswordResetNotification($token)
    {
        // 2. Panggil class notifikasi kita
        $this->notify(new ResetPasswordNotification($token));
    }


    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_password_set',
        'google_id',
        'phone_number',
        'class_id',
        'nis',
        'level',
        'accessible_classes',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $with = ['studentClass'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'accessible_classes' => 'array',
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected static function booted()
    {
        // EVENT 1: Ketika user di-update (misal NIS-nya diganti atau dihapus/null)
        static::updated(function ($user) {
            // Cek apakah kolom 'nis' mengalami perubahan
            if ($user->wasChanged('nis')) {
                
                $oldNis = $user->getOriginal('nis'); // Ambil NIS yang lama
                
                // Jika sebelumnya dia punya NIS, bebaskan NIS lama tersebut
                if ($oldNis) {
                    AllowedNis::where('nis', $oldNis)->update([
                        'is_used' => false,
                        'used_by' => null
                    ]);
                }
            }
        });

        // EVENT 2: Ketika akun user dihapus permanen dari sistem
        static::deleted(function ($user) {
            // Bebaskan NIS yang sedang dia pakai sebelum akunnya lenyap
            if ($user->nis) {
                AllowedNis::where('nis', $user->nis)->update([
                    'is_used' => false,
                    'used_by' => null
                ]);
            }
        });
    }


    /**
     * Get the daily activities associated with the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
   public function dailyActivities()
{
    return $this->hasMany(DailyActivity::class);
}

public function attendances()
    {
        // Sesuaikan 'SessionAttendance::class' dengan nama model absensimu
        // 'student_id' adalah foreign key di tabel session_attendances
        return $this->hasMany(SessionAttendance::class, 'student_id');
    }
public function classes()
{
    return $this->belongsToMany(
        ClassName::class,           // Model
        'class_id',
    )->withTimestamps();            // Opsional
}
public function classNameforCertificate(): BelongsTo
{
    return $this->belongsTo(ClassName::class, 'class_id');
}


public function xpLogs()
{
    return $this->hasMany(\App\Models\XpLog::class);
}


    /**
     * Get the reflections associated with the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
public function reflections()
{
    return $this->hasMany(Reflection::class);
}


    /**
     * Update the user's level based on the number of daily activities they have completed.
     *
     * Level 1: 0-9 daily activities
     * Level 2: 10-19 daily activities
     * Level 3: 20 or more daily activities
     */
public function updateLevel() {
    $count = $this->dailyActivities()->count();
    
    if ($count >= 20) {
        $this->level = 3;
    } elseif ($count >= 10) {
        $this->level = 2;
    } else {
        $this->level = 1;
    }
    $this->save();
}

public function canAccessClass($targetClassId)
    {
        if ($this->role === 'superadmin') return true;
        
        // Cek apakah ID kelas ada di array JSON guru
        return in_array($targetClassId, $this->accessible_classes ?? []);
    }

public function studentClass()
    {
        return $this->belongsTo(ClassName::class, 'class_id');
    }

    // Mutator: Otomatis mengubah format nomor HP saat disimpan
protected function phoneNumber(): Attribute
{
    return Attribute::make(
        set: fn (string $value) => $this->formatPhoneNumber($value),
    );
}
/**
     * Relasi untuk fitur Guru: Satu guru memandu banyak Sesi Belajar Mandiri.
     */
    public function sessions()
    {
        // Pastikan 'teacher_id' adalah nama kolom di tabel self_study_sessions
        return $this->hasMany(\App\Models\SelfStudySession::class, 'teacher_id');
    }

    /**
     * Relasi untuk fitur Guru: Satu guru membuat banyak Soal.
     * PERHATIAN: Sesuaikan 'QuestionBank::class' dengan nama model tabel soalmu!
     */
    public function questions()
    {
        // Jika nama model soalmu bukan QuestionBank, ubah bagian ini.
        // Jika nama kolom pembuatnya bukan 'creator_id', ubah juga bagian ini.
        return $this->hasMany(\App\Models\QuestionBank::class, 'creator_id'); 
    }

// Helper function untuk ubah 08 jadi 628
private function formatPhoneNumber($number)
{
    // Hapus spasi, strip, atau tanda plus (+)
    $number = preg_replace('/[^0-9]/', '', $number);

    // Kalau diawali 08, ganti jadi 628
    if (substr($number, 0, 2) === '08') {
        return '62' . substr($number, 1);
    }

    return $number;
}
}


