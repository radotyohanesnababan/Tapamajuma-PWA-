<?php
// app/Models/DeveloperToken.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeveloperToken extends Model
{
    protected $connection = 'central';

    protected $fillable = ['developer_user_id', 'token', 'last_used_at'];

    public function developerUser()
    {
        return $this->belongsTo(DeveloperUser::class);
    }
}