<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\ChangelogController;
use App\Http\Controllers\Admin\ClassMgmtController;
use App\Http\Controllers\Admin\MorningSessionController;
use App\Http\Controllers\Admin\NisController as ControllersAdminNisController;
use App\Http\Controllers\Admin\QuestionMgmtController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\StudentMgmtController;
use App\Http\Controllers\Admin\SubjectMgmtController;
use App\Http\Controllers\Admin\TeacherMgmtController as AdminTeacherMgmtController;
use App\Http\Controllers\Api\AIController as ApiAIController;
use App\Http\Controllers\Api\CBTController;
use App\Http\Controllers\Api\DailyActivityController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\LiteracyCardController;
use App\Http\Controllers\Api\NisController;
use App\Http\Controllers\Api\ReflectionController;
use App\Http\Controllers\Api\ProfileController; // Tambahkan ini
use App\Http\Controllers\Api\PublicDataController;
use App\Http\Controllers\Api\StudentQuizController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
use App\Http\Controllers\Teacher\MandiriSessionController;
use App\Http\Controllers\Teacher\MediaBankController;
use App\Http\Controllers\Teacher\QuestionBankController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Teacher\CBTAdminController;
use App\Http\Controllers\Teacher\PrintSessionController as TeacherPrintSessionController;


/*
|--------------------------------------------------------------------------
| Share Routes
|--------------------------------------------------------------------------
*/

Route::get('/public/gallery/{token}', [GalleryController::class, 'showPublic']);

/*
|--------------------------------------------------------------------------
| Public Routes (Tanpa Login)
|--------------------------------------------------------------------------
*/
Route::get('/public/classes', [PublicDataController::class, 'getClasses']);
 Route::get('/bank-soal/template', [QuestionBankController::class, 'downloadTemplate']);
Route::get('/changelog/latest', [ChangelogController::class, 'latest']);


Route::get('/debug-sentry', function () {
    throw new Exception('My first Sentry error in Laravel!');
});


/*
|--------------------------------------------------------------------------
| Share Routes (Bisa diakses tanpa login, untuk keperluan share karya siswa)
|--------------------------------------------------------------------------
*/

Route::get('/share-og/{token}', function ($token) {
    $gallery = \App\Models\Gallery::with('user')
        ->where('share_token', $token)
        ->where('is_published', true)
        ->first();

    if (!$gallery) {
        return response()->json([
            'title'       => 'TAPAMAJUMA',
            'description' => 'Platform pemantauan aktivitas belajar siswa.',
            'image'       => 'https://cdn.tapamajuma-api.my.id/images/iconappp.png',
            'url'         => 'https://tapamajuma.smpn1siborongborong.sch.id',
        ]);
    }

    $ownerName = $gallery->user->name ?? 'Siswa';
    $urlOrPath = $gallery->file_path;

    $imageUrl = 'https://cdn.tapamajuma-api.my.id/images/iconappp.png';

    if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/', $urlOrPath, $matches)) {
        $imageUrl = "https://img.youtube.com/vi/{$matches[1]}/hqdefault.jpg";
    } elseif (preg_match('/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([-\w]+)/', $urlOrPath, $matches)) {
        $imageUrl = "https://lh3.googleusercontent.com/d/{$matches[1]}=w1200";
    } elseif (strpos($urlOrPath, 'instagram.com') !== false) {
        $imageUrl = 'https://cdn.tapamajuma-api.my.id/images/ig-pld.png';
    } elseif (strpos($urlOrPath, 'facebook.com') !== false || strpos($urlOrPath, 'fb.watch') !== false) {
        $imageUrl = 'https://cdn.tapamajuma-api.my.id/images/fb-pld.png';
    } elseif (strpos($urlOrPath, 'tiktok.com') !== false) {
        try {
            $response = \Illuminate\Support\Facades\Http::timeout(3)
                ->get('https://www.tiktok.com/oembed?url=' . $urlOrPath);
            $imageUrl = $response->successful()
                ? ($response->json()['thumbnail_url'] ?? 'https://cdn.tapamajuma-api.my.id/images/tiktok-pld.png')
                : 'https://cdn.tapamajuma-api.my.id/images/tiktok-pld.png';
        } catch (\Exception $e) {
            $imageUrl = 'https://cdn.tapamajuma-api.my.id/images/tiktok-pld.png';
        }
    } elseif (in_array($gallery->file_type, ['image']) || preg_match('/\.(jpg|jpeg|png|webp|gif)$/i', $urlOrPath)) {
        $imageUrl = str_starts_with($urlOrPath, 'http')
            ? $urlOrPath
            : 'https://cdn.tapamajuma-api.my.id/' . $urlOrPath;
    } elseif ($gallery->file_type === 'pdf') {
        $imageUrl = 'https://cdn.tapamajuma-api.my.id/images/pdf-pld.png';
    } elseif ($gallery->file_type === 'audio') {
        $imageUrl = 'https://cdn.tapamajuma-api.my.id/images/audio-pld.png';
    }

    return response()->json([
        'title'       => $gallery->title . ' | TAPAMAJUMA',
        'description' => "Lihat karya kreatif dari {$ownerName} di platform TAPAMAJUMA.",
        'image'       => $imageUrl,
        'url'         => "https://tapamajuma.smpn1siborongborong.sch.id/s/{$token}",
    ]);
});


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Jalur Login Google
Route::get('/auth/google/redirect', [GoogleController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);


Route::middleware('auth:sanctum',)->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/auth/complete-profile', [GoogleController::class, 'completeProfile']);
    // Endpoint untuk Claim NISN
    Route::post('/claim-nis', [NisController::class, 'claimNis']);
    
    // --- KHUSUS SISWA ---
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/activities', [DailyActivityController::class, 'index']);
    Route::post('/activities', [DailyActivityController::class, 'store']);
    Route::get('/activities/today-status', [DailyActivityController::class, 'checkStatus']);
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

   
    Route::middleware(['auth:sanctum', 'check.seb'])->group(function () {
        
        Route::post('cbt/start', [CBTController::class, 'startExam']);
        Route::post('cbt/update-answer', [CBTController::class, 'updateAnswer']);
        Route::post('cbt/submit', [CBTController::class, 'submitExam']);
        Route::post('cbt/verify-token-only', [CBTController::class, 'verifyTokenByCode']);
        
        // Tambahkan rute CBT lainnya yang butuh keamanan tinggi di sini
    });

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

            Route::get('cbt/exams', [CBTAdminController::class, 'index']); // Daftar paket
            Route::post('cbt/exams', [CBTAdminController::class, 'store']); // Buat paket baru
            Route::delete('cbt/exams/{id}', [CBTAdminController::class, 'destroy']); // Hapus paket
            Route::get('cbt/options', [CBTAdminController::class, 'getOptions']);
            Route::get('cbt/question-bank', [CBTAdminController::class, 'getQuestionBank']);
            Route::get('cbt/exams/{id}/preview', [CBTAdminController::class, 'getPreview']);
            ROute ::get('cbt/exams/{id}/results', [CBTAdminController::class, 'getResults']);
            // Action khusus token & status
            Route::post('cbt/exams/{id}/release-token', [CBTAdminController::class, 'releaseToken']);
            Route::post('cbt/exams/{id}/close', [CBTAdminController::class, 'closeExam']);

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
        Route::get('/activity-report/class-ranking/{classId}', [ReportController::class, 'classRanking']);
        Route::get('/activity-report/teacher-summary', [ReportController::class, 'teacherSummary']);
        Route::get('/activity-report/pdf/', [ReportController::class, 'downloadFullReport']);
        Route::get('/activity-report/morning-session/classes-list', [MorningSessionController::class, 'getClasses']);
        Route::get('/activity-report/morning-session-details/{student_id}', [MorningSessionController::class, 'getStudentSummary']);
        
        Route::get('nis', [ControllersAdminNisController::class, 'index']);
        Route::get('nis/template', [ControllersAdminNisController::class, 'downloadTemplate']);
        Route::post('nis/import', [ControllersAdminNisController::class, 'import']);
        Route::post('nis/{id}/unbind', [ControllersAdminNisController::class, 'unbind']);

        Route::get('/announcements', [AnnouncementController::class, 'index']);
        Route::post('/announcements', [AnnouncementController::class, 'store']);
        Route::put('/announcements/{id}', [AnnouncementController::class, 'update']);
        Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);



    
    });

});