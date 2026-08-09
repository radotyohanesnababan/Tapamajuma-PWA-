<?php
// app/Models/DeveloperUser.php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class DeveloperUser extends Authenticatable
{
    protected $connection = 'central';

    protected $fillable = ['name', 'email', 'password'];
    protected $hidden = ['password'];

    public function tokens()
    {
        return $this->hasMany(DeveloperToken::class);
    }
}