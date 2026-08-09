<?php
// app/Http/Controllers/Auth/DeveloperAuthController.php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\DeveloperUser;
use App\Models\DeveloperToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DeveloperAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $developer = DeveloperUser::where('email', $request->email)->first();

        if (!$developer || !Hash::check($request->password, $developer->password)) {
            return response()->json(['message' => 'Kredensial salah'], 401);
        }

        $plainToken = Str::random(64);

        DeveloperToken::create([
            'developer_user_id' => $developer->id,
            'token' => hash('sha256', $plainToken),
        ]);

        return response()->json([
            'message' => 'Login berhasil',
            'developer' => $developer,
            'access_token' => $plainToken,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $bearer = $request->bearerToken();
        DeveloperToken::where('token', hash('sha256', $bearer))->delete();

        return response()->json(['message' => 'Logout berhasil']);
    }

    public function me(Request $request)
    {
        return response()->json($request->attributes->get('developer'));
    }
}