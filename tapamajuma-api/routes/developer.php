<?php
// routes/developer.php
use App\Http\Controllers\Auth\DeveloperAuthController;
use App\Http\Controllers\Developer\DashboardController;
use App\Http\Controllers\Developer\SchoolOnboardingController;
use App\Http\Controllers\Developer\SchoolManagementController;
use App\Http\Controllers\Developer\DistrictReportController;
use App\Http\Controllers\Developer\GlobalAnnouncementController;
use App\Http\Controllers\Developer\MaintenanceController;
use Illuminate\Support\Facades\Route;

Route::prefix('developer')->group(function () {
    Route::post('/login', [DeveloperAuthController::class, 'login']);

    Route::middleware('auth.developer')->group(function () {
        Route::post('/logout', [DeveloperAuthController::class, 'logout']);
        Route::get('/me', [DeveloperAuthController::class, 'me']);

        // Schools list & onboarding
        Route::get('/schools', [DashboardController::class, 'index']);
        Route::post('/onboard-school', [SchoolOnboardingController::class, 'store']);

        // Analytics & Leaderboard
        Route::get('/analytics/ecosystem', [DashboardController::class, 'ecosystemMetrics']);
        Route::get('/analytics/leaderboard', [DashboardController::class, 'schoolLeaderboard']);

        // School Management
        Route::get('/schools/{id}', [SchoolManagementController::class, 'show']);
        Route::put('/schools/{id}', [SchoolManagementController::class, 'update']);
        Route::patch('/schools/{id}/toggle-status', [SchoolManagementController::class, 'toggleStatus']);
        Route::post('/schools/{id}/reset-admin', [SchoolManagementController::class, 'resetAdminPassword']);
        Route::post('/schools/{id}/impersonate', [SchoolManagementController::class, 'impersonate']);

        // District Reports
        Route::get('/reports/district-summary', [DistrictReportController::class, 'summary']);

        // Global Announcements
        Route::apiResource('/announcements', GlobalAnnouncementController::class);

        // System Maintenance
        Route::get('/maintenance/health', [MaintenanceController::class, 'healthCheck']);
        Route::post('/maintenance/migrate-all', [MaintenanceController::class, 'migrateAllTenants']);
    });
});