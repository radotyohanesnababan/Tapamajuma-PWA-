<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\DailyActivity;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;


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
        'class_name',
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

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
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
}
