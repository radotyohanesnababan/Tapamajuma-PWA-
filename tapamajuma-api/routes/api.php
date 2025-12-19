<?php

use App\Http\Controllers\Api\DailyActivityController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rute untuk mendapatkan data user yang sedang login (Bawaan Breeze)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rute yang butuh Login (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Siswa
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/activities', [DailyActivityController::class, 'index']);
    Route::post('/activities', [DailyActivityController::class, 'store']);
    
    // Guru (Sekarang aman di dalam middleware)
    Route::get('/teacher/dashboard', [TeacherDashboardController::class, 'index']);
    Route::get('/teacher/stats', [TeacherDashboardController::class, 'getTeacherStats']);
});

// Pastikan baris ini ADA di paling bawah untuk memuat rute login/register Breeze
require __DIR__.'/auth.php';