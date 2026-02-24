<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\ChangelogController;
use App\Http\Controllers\Admin\ClassMgmtController;
use App\Http\Controllers\Admin\MorningSessionController;
use App\Http\Controllers\Admin\QuestionMgmtController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\StudentMgmtController;
use App\Http\Controllers\Admin\SubjectMgmtController;
use App\Http\Controllers\Admin\TeacherMgmtController as AdminTeacherMgmtController;
use App\Http\Controllers\Api\AIController as ApiAIController;
use App\Http\Controllers\Api\DailyActivityController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\LiteracyCardController;
use App\Http\Controllers\Api\ReflectionController;
use App\Http\Controllers\Api\ProfileController; // Tambahkan ini
use App\Http\Controllers\Api\PublicDataController;
use App\Http\Controllers\Api\StudentQuizController;
use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
use App\Http\Controllers\Teacher\MandiriSessionController;
use App\Http\Controllers\Teacher\MediaBankController;
use App\Http\Controllers\Teacher\QuestionBankController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Teacher\PrintSessionController as TeacherPrintSessionController;


/*
|--------------------------------------------------------------------------
| Logout API Routes
|--------------------------------------------------------------------------
*/



/*
|--------------------------------------------------------------------------
| Public Routes (Tanpa Login)
|--------------------------------------------------------------------------
*/
Route::get('/public/classes', [PublicDataController::class, 'getClasses']);
 Route::get('/bank-soal/template', [QuestionBankController::class, 'downloadTemplate']);
Route::get('/changelog/latest', [ChangelogController::class, 'latest']);


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Jalur Login Google
Route::get('/auth/google/redirect', [GoogleController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/auth/complete-profile', [GoogleController::class, 'completeProfile']);
    
    // --- KHUSUS SISWA ---
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/activities', [DailyActivityController::class, 'index']);
    Route::post('/activities', [DailyActivityController::class, 'store']);
    Route::post('/generate-content', [ApiAIController::class, 'generate']);

    //Fitur Quiz Numerasi & Literasi
    // GET: Ambil daftar Mapel Numerasi
        Route::get('/quiz/subjects', [StudentQuizController::class, 'getSubjects']);
        Route::get('/quiz/literacy-subjects', [LiteracyCardController::class, 'index']); // Tambahkan route ini untuk mengambil literacy cards
        
        // GET: Ambil Soal (Ini yang error "Not Found" tadi)
        Route::get('/quiz/questions', [StudentQuizController::class, 'getQuestions']);
        
        // POST: Submit Jawaban
        Route::post('/quiz/submit', [StudentQuizController::class, 'submit']);
    
    // Fitur Refleksi & Sosial (Aksi Mingguan)
    Route::post('/reflections', [ReflectionController::class, 'store']);
    Route::get('/peer-feed', [ReflectionController::class, 'getPeerFeed']);
    Route::post('/reflections/{id}/peer-feedback', [ReflectionController::class, 'storePeerFeedback']);

    // Fitur Galeri Karya (Aksi C.1)
    Route::get('/galleries', [GalleryController::class, 'index']);
    Route::post('/galleries', [GalleryController::class, 'store']);
    Route::post('/galleries/{id}/share', [GalleryController::class, 'share']);

    // --- OTHER MENU & PROFILE (Aksi C.2) ---
    // Route ini digunakan siswa untuk edit mandiri dan melihat ringkasan presentasi
    Route::get('/summary', [ProfileController::class, 'getSummary']);
    Route::post('/user/profile-update', [ProfileController::class, 'update']);

    // --- KHUSUS GURU  ---
    Route::prefix('teacher')->group(function () {

        Route::get('/dashboard', [TeacherDashboardController::class, 'index']);
        Route::get('/stats', [TeacherDashboardController::class, 'getTeacherStats']);
        Route::get('/my-classes', [MandiriSessionController::class, 'getMyClasses']);
        

        //Route Galeri Siswa Dilihat oleh Guru (Aksi C.1)
        Route::get('/galleries', [GalleryController::class, 'indexfortc']);
        Route::delete('/galleries/{id}', [GalleryController::class, 'destroy']);

        // Route khusus guru untuk memberi feedback (Aksi B.2)
        Route::get('/reflections', [ReflectionController::class, 'getStudentReflections']);
        Route::post('/reflections/{id}/feedback', [ReflectionController::class, 'giveFeedback']);


        

        // Fleksibilitas: Guru/Admin bisa mengedit profil siswa jika diperlukan
        Route::put('/user-update/{id}', [ProfileController::class, 'update']);
        Route::get('/student-summary/{id}', [ProfileController::class, 'getSummary']);

        // Route Guru Bank Soal
    Route::get('/bank-soal', [QuestionBankController::class, 'index']);
    Route::post('/bank-soal', [QuestionBankController::class, 'store']);
    Route::post('/bank-soal/import', [QuestionBankController::class, 'import']);
    Route::delete('/bank-soal/{id}', [QuestionBankController::class, 'destroy']);
    Route::get('/bank-soal/template', [QuestionBankController::class, 'downloadTemplate']);
    Route::get('/media-bank', [MediaBankController::class, 'index']);
    Route::post('/media-bank', [MediaBankController::class, 'store']);
    Route::delete('/media-bank/{id}', [MediaBankController::class, 'destroy']);
    // Route Import
    Route::post('/bank-soal/import', [QuestionBankController::class, 'import']);
        // Cetak Aktivitas Sesi (Aksi B.3)
    Route::get('/print-session', [TeacherPrintSessionController::class, 'getMorningSession']);
    Route::get('/accessible-classes', [TeacherPrintSessionController::class, 'getAccessibleClasses']);
    });


    // [BARU] 2. Ambil Siswa (Sesuai React: /api/students?class=7A)
    Route::get('/students', [MandiriSessionController::class, 'getStudents']);

    // [BARU] 3. Simpan Presensi (Sesuai React: /api/self-study/store)
    Route::post('/self-study/store', [MandiriSessionController::class, 'store']);



    // --- KHUSUS ADMIN  ---
    Route::prefix('admin')->group(function () {
        Route::get('/student-summary', [AdminController::class, 'getStudentSummary']);
        Route::apiResource('teachers', AdminTeacherMgmtController::class);
        Route::apiResource('classes', ClassMgmtController::class);
        Route::apiResource('students', StudentMgmtController::class);
        Route::apiResource('subjects', SubjectMgmtController::class);
        Route::get('/questions', [QuestionMgmtController::class, 'index']);
        Route::delete('/questions/{id}', [QuestionMgmtController::class, 'destroy']);
        Route::post('/stimport', [StudentMgmtController::class, 'import']);
        Route::post('/tcimport', [AdminTeacherMgmtController::class, 'import']);
        Route::get('/templates/download-template-student', [StudentMgmtController::class, 'downloadTemplateStudent']);
        Route::get('/templates/download-template-teacher', [AdminTeacherMgmtController::class, 'downloadTemplateTeacher']);
        Route::post('/changelog', [ChangelogController::class, 'store']);
        Route::get('/changelog/all', [ChangelogController::class, 'index']);
        
        // Route untuk laporan aktivitas 
        Route::get('/activity-report/executive', [ReportController::class, 'executiveSummary']);
        Route::get('/activity-report/session', [ReportController::class, 'sessionEffectiveness']);
        Route::get('/activity-report/student', [ReportController::class, 'studentLog']);
        Route::get('/activity-report/student-details/{id}', [ReportController::class, 'studentActivityDetails']);
        Route::get('/activity-report/class-summary', [ReportController::class, 'classSummary']);
        Route::get('/activity-report/teacher-summary', [ReportController::class, 'teacherSummary']);
        Route::get('/activity-report/pdf/', [ReportController::class, 'downloadFullReport']);
        Route::get('/activity-report/morning-session/classes-list', [MorningSessionController::class, 'getClasses']);
        Route::get('/activity-report/morning-session-details/{student_id}', [MorningSessionController::class, 'getStudentSummary']);
    });

});