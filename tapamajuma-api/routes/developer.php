<?php
// routes/developer.php
use App\Http\Controllers\Auth\DeveloperAuthController;
use App\Http\Controllers\Developer\DashboardController;
use App\Http\Controllers\Developer\SchoolOnboardingController;
use Illuminate\Support\Facades\Route;

Route::prefix('developer')->group(function () {
    Route::post('/login', [DeveloperAuthController::class, 'login']);

    Route::middleware('auth.developer')->group(function () {
        Route::post('/logout', [DeveloperAuthController::class, 'logout']);
        Route::get('/me', [DeveloperAuthController::class, 'me']);
        Route::get('/schools', [DashboardController::class, 'index']);
        Route::post('/onboard-school', [SchoolOnboardingController::class, 'store']);
    });
});