<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SchoolManagementController extends Controller
{
    private function getTenantConnection(School $school): string
    {
        $connName = 'tenant_' . $school->slug;
        config(["database.connections.{$connName}" => array_merge(
            config('database.connections.tenant'),
            [
                'host'     => $school->db_host,
                'database' => $school->db_name,
                'username' => $school->db_user,
                'password' => decrypt($school->db_password),
            ]
        )]);
        DB::purge($connName);
        return $connName;
    }

    public function show($id)
    {
        $school = School::findOrFail($id);

        $stats = [];
        try {
            $conn = $this->getTenantConnection($school);
            $stats = [
                'total_students'  => DB::connection($conn)->table('users')->where('role', 'student')->count(),
                'total_teachers'  => DB::connection($conn)->table('users')->where('role', 'teacher')->count(),
                'total_activities'=> DB::connection($conn)->table('daily_activities')->count(),
            ];
        } catch (\Exception $e) {
            Log::warning("SchoolManagement show error [{$school->slug}]: " . $e->getMessage());
        }

        return response()->json([
            'data' => array_merge($school->makeVisible(['db_host','db_name','db_user'])->toArray(), ['stats' => $stats])
        ]);
    }

    public function update(Request $request, $id)
    {
        $school = School::findOrFail($id);
        $data = $request->validate([
            'name'           => 'sometimes|string',
            'address'        => 'nullable|string',
            'phone'          => 'nullable|string',
            'email'          => 'nullable|email',
            'principal_name' => 'nullable|string',
            'principal_nip'  => 'nullable|string',
            'manager_name'   => 'nullable|string',
            'manager_nip'    => 'nullable|string',
        ]);

        $school->update($data);

        return response()->json(['message' => 'Profil sekolah berhasil diperbarui', 'data' => $school]);
    }

    public function toggleStatus($id)
    {
        $school = School::findOrFail($id);
        $school->update(['is_active' => !$school->is_active]);

        return response()->json([
            'message'   => 'Status sekolah diperbarui',
            'is_active' => $school->is_active,
        ]);
    }

    public function resetAdminPassword($id)
    {
        $school = School::findOrFail($id);
        $newPassword = Str::random(12);

        try {
            $conn = $this->getTenantConnection($school);
            DB::connection($conn)->table('users')
                ->where('role', 'superadmin')
                ->update(['password' => Hash::make($newPassword)]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal reset password: ' . $e->getMessage()], 500);
        }

        return response()->json([
            'message'      => 'Password admin berhasil direset',
            'new_password' => $newPassword,
        ]);
    }

    public function impersonate($id)
    {
        $school = School::findOrFail($id);

        try {
            $conn = $this->getTenantConnection($school);
            DB::setDefaultConnection($conn);

            $admin = User::where('role', 'superadmin')->first();

            if (!$admin) {
                DB::setDefaultConnection('mysql');
                return response()->json(['message' => 'Tidak ada superadmin di sekolah ini'], 404);
            }

            $token = $admin->createToken('developer-impersonate')->plainTextToken;
            DB::setDefaultConnection('mysql');

            $baseUrl = "https://{$school->slug}.tapamajuma.my.id";

            return response()->json([
                'message'      => 'Token impersonasi berhasil dibuat',
                'token'        => $token,
                'redirect_url' => $baseUrl . '/social-callback?' . http_build_query([
                    'auth_token'        => $token,
                    'needs_onboarding'  => 'false',
                    'role'              => 'superadmin',
                ]),
                'school' => [
                    'name' => $school->name,
                    'slug' => $school->slug,
                ],
            ]);
        } catch (\Exception $e) {
            DB::setDefaultConnection('mysql');
            return response()->json(['message' => 'Gagal impersonate: ' . $e->getMessage()], 500);
        }
    }
}
