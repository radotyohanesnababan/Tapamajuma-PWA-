<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\CertificateController;
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
use App\Http\Controllers\Api\CertificateStudentController;
use App\Http\Controllers\Api\DailyActivityController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\LiteracyCardController;
use App\Http\Controllers\Api\NisController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PublicDataController;
use App\Http\Controllers\Api\ReflectionController;
use App\Http\Controllers\Api\StudentQuizController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Teacher\CBTAdminController;
use App\Http\Controllers\Teacher\DashboardController as TeacherDashboardController;
use App\Http\Controllers\Teacher\MandiriSessionController;
use App\Http\Controllers\Teacher\MediaBankController;
use App\Http\Controllers\Teacher\PrintSessionController as TeacherPrintSessionController;
use App\Http\Controllers\Teacher\QuestionBankController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes — Tanpa Tenant
|--------------------------------------------------------------------------
*/
Route::get('/auth/google/redirect', [GoogleController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);
Route::get('/changelog/latest', [ChangelogController::class, 'latest']);

/*
|--------------------------------------------------------------------------
| Semua Route dengan Tenant Context
|--------------------------------------------------------------------------
*/
Route::middleware('tenant')->group(function () {

    // Test tenant (bisa dihapus setelah confirmed works)
    Route::get('/test-tenant', function () {
        $school = app('currentSchool');
        return response()->json([
            'school' => $school->name,
            'db'     => DB::connection()->getDatabaseName(),
        ]);
    });

    /*
    |----------------------------------------------------------------------
    | Public + Tenant (tanpa auth)
    |----------------------------------------------------------------------
    */
    Route::get('/public/classes', [PublicDataController::class, 'getClasses']);
    Route::get('/public/gallery/{token}', [GalleryController::class, 'showPublic']);

    // Verifikasi sertifikat — public tapi butuh tenant DB
    Route::get('/admin/certificates/verify/{certificate}', [CertificateController::class, 'verify'])
        ->name('certificates.verify');

    // Open Graph untuk share karya siswa
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
        $imageUrl  = 'https://cdn.tapamajuma-api.my.id/images/iconappp.png';

        if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/', $urlOrPath, $matches)) {
            $imageUrl = "https://img.youtube.com/vi/{$matches[1]}/hqdefault.jpg";
        } elseif (preg_match('/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([-\w]+)/', $urlOrPath, $matches)) {
            $imageUrl = "https://lh3.googleusercontent.com/d/{$matches[1]}=w1200";
        } elseif (str_contains($urlOrPath, 'instagram.com')) {
            $imageUrl = 'https://cdn.tapamajuma-api.my.id/images/ig-pld.png';
        } elseif (str_contains($urlOrPath, 'facebook.com') || str_contains($urlOrPath, 'fb.watch')) {
            $imageUrl = 'https://cdn.tapamajuma-api.my.id/images/fb-pld.png';
        } elseif (str_contains($urlOrPath, 'tiktok.com')) {
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
    |----------------------------------------------------------------------
    | Authenticated + Tenant
    |----------------------------------------------------------------------
    */
    Route::middleware('auth:sanctum')->group(function () {

        // Auth & User
        Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
        Route::get('/user', fn(Request $request) => $request->user());
        Route::post('/auth/complete-profile', [GoogleController::class, 'completeProfile']);
        Route::post('/claim-nis', [NisController::class, 'claimNis']);

        /*
        |----------------------------------------------------------------------
        | Siswa
        |----------------------------------------------------------------------
        */
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/summary', [ProfileController::class, 'getSummary']);
        Route::post('/user/profile-update', [ProfileController::class, 'update']);
        Route::post('/generate-content', [ApiAIController::class, 'generate']);

        // Aktivitas Harian
        Route::prefix('activities')->group(function () {
            Route::get('/', [DailyActivityController::class, 'index']);
            Route::post('/', [DailyActivityController::class, 'store']);
            Route::get('/today-status', [DailyActivityController::class, 'checkStatus']);
        });

        // Quiz Numerasi & Literasi
        Route::prefix('quiz')->group(function () {
            Route::get('/subjects', [StudentQuizController::class, 'getSubjects']);
            Route::get('/literacy-subjects', [LiteracyCardController::class, 'index']);
            Route::get('/questions', [StudentQuizController::class, 'getQuestions']);
            Route::post('/submit', [StudentQuizController::class, 'submit']);
        });

        // Refleksi & Sosial
        Route::prefix('reflections')->group(function () {
            Route::post('/', [ReflectionController::class, 'store']);
            Route::get('/peer-feed', [ReflectionController::class, 'getPeerFeed']);
            Route::post('/{id}/peer-feedback', [ReflectionController::class, 'storePeerFeedback']);
        });

        // Galeri Karya Siswa
        Route::prefix('galleries')->group(function () {
            Route::get('/', [GalleryController::class, 'index']);
            Route::post('/', [GalleryController::class, 'store']);
            Route::post('/{id}/share', [GalleryController::class, 'share']);
        });

        // CBT Siswa
        Route::middleware('check.seb')->prefix('cbt')->group(function () {
            Route::post('/start', [CBTController::class, 'startExam']);
            Route::post('/update-answer', [CBTController::class, 'updateAnswer']);
            Route::post('/submit', [CBTController::class, 'submitExam']);
            Route::post('/verify-token-only', [CBTController::class, 'verifyTokenByCode']);
        });

        // Sertifikat Siswa
        Route::get('/certificates', [CertificateStudentController::class, 'index']);
        Route::get('/certificates/{certificate}/download', [CertificateStudentController::class, 'download']);

        // Presensi Mandiri
        Route::get('/students', [MandiriSessionController::class, 'getStudents']);
        Route::post('/self-study/store', [MandiriSessionController::class, 'store']);

        /*
        |----------------------------------------------------------------------
        | Guru
        |----------------------------------------------------------------------
        */
        Route::prefix('teacher')->group(function () {

            Route::get('/dashboard', [TeacherDashboardController::class, 'index']);
            Route::get('/stats', [TeacherDashboardController::class, 'getTeacherStats']);
            Route::get('/my-classes', [MandiriSessionController::class, 'getMyClasses']);
            Route::get('/accessible-classes', [TeacherPrintSessionController::class, 'getAccessibleClasses']);
            Route::get('/print-session', [TeacherPrintSessionController::class, 'getMorningSession']);

            Route::get('/student-summary/{id}', [ProfileController::class, 'getSummary']);
            Route::put('/user-update/{id}', [ProfileController::class, 'update']);

            Route::get('/galleries', [GalleryController::class, 'indexfortc']);
            Route::delete('/galleries/{id}', [GalleryController::class, 'destroy']);

            Route::get('/reflections', [ReflectionController::class, 'getStudentReflections']);
            Route::post('/reflections/{id}/feedback', [ReflectionController::class, 'giveFeedback']);

            Route::prefix('bank-soal')->group(function () {
                Route::get('/', [QuestionBankController::class, 'index']);
                Route::post('/', [QuestionBankController::class, 'store']);
                Route::post('/import', [QuestionBankController::class, 'import']);
                Route::get('/template', [QuestionBankController::class, 'downloadTemplate']);
                Route::delete('/{id}', [QuestionBankController::class, 'destroy']);
            });

            Route::prefix('media-bank')->group(function () {
                Route::get('/', [MediaBankController::class, 'index']);
                Route::post('/', [MediaBankController::class, 'store']);
                Route::delete('/{id}', [MediaBankController::class, 'destroy']);
            });

            Route::prefix('cbt')->group(function () {
                Route::get('/options', [CBTAdminController::class, 'getOptions']);
                Route::get('/question-bank', [CBTAdminController::class, 'getQuestionBank']);

                Route::prefix('exams')->group(function () {
                    Route::get('/', [CBTAdminController::class, 'index']);
                    Route::post('/', [CBTAdminController::class, 'store']);
                    Route::delete('/{id}', [CBTAdminController::class, 'destroy']);
                    Route::get('/{id}/preview', [CBTAdminController::class, 'getPreview']);
                    Route::get('/{id}/results', [CBTAdminController::class, 'getResults']);
                    Route::post('/{id}/release-token', [CBTAdminController::class, 'releaseToken']);
                    Route::post('/{id}/close', [CBTAdminController::class, 'closeExam']);
                });
            });
        }); // end teacher

        /*
        |----------------------------------------------------------------------
        | Admin
        |----------------------------------------------------------------------
        */
        Route::prefix('admin')->group(function () {

            Route::apiResource('teachers', AdminTeacherMgmtController::class);
            Route::apiResource('students', StudentMgmtController::class);
            Route::apiResource('classes', ClassMgmtController::class);
            Route::apiResource('subjects', SubjectMgmtController::class);

            Route::post('/stimport', [StudentMgmtController::class, 'import']);
            Route::post('/tcimport', [AdminTeacherMgmtController::class, 'import']);

            Route::prefix('templates')->group(function () {
                Route::get('/download-template-student', [StudentMgmtController::class, 'downloadTemplateStudent']);
                Route::get('/download-template-teacher', [AdminTeacherMgmtController::class, 'downloadTemplateTeacher']);
            });

            Route::prefix('certificates')->group(function () {
                Route::get('/', [CertificateController::class, 'index']);
                Route::post('/preview', [CertificateController::class, 'preview']);
                Route::post('/generate', [CertificateController::class, 'generate']);
                Route::get('/{batch}', [CertificateController::class, 'show']);
                Route::post('/{batch}/mark-printed', [CertificateController::class, 'markPrinted']);
                Route::post('/{batch}/release', [CertificateController::class, 'release']);
                Route::post('/{batch}/generate-pdf', [CertificateController::class, 'generatePdf']);
                Route::delete('/{batch}', [CertificateController::class, 'destroyBatch']);
                Route::get('/cert/{certificate}/download', [CertificateController::class, 'download']);
            });

            Route::get('/student-summary', [AdminController::class, 'getStudentSummary']);

            Route::get('/questions', [QuestionMgmtController::class, 'index']);
            Route::delete('/questions/{id}', [QuestionMgmtController::class, 'destroy']);

            Route::prefix('nis')->group(function () {
                Route::get('/', [ControllersAdminNisController::class, 'index']);
                Route::get('/template', [ControllersAdminNisController::class, 'downloadTemplate']);
                Route::post('/import', [ControllersAdminNisController::class, 'import']);
                Route::post('/{id}/unbind', [ControllersAdminNisController::class, 'unbind']);
            });

            Route::prefix('announcements')->group(function () {
                Route::get('/', [AnnouncementController::class, 'index']);
                Route::post('/', [AnnouncementController::class, 'store']);
                Route::put('/{id}', [AnnouncementController::class, 'update']);
                Route::delete('/{id}', [AnnouncementController::class, 'destroy']);
            });

            Route::prefix('changelog')->group(function () {
                Route::get('/all', [ChangelogController::class, 'index']);
                Route::post('/', [ChangelogController::class, 'store']);
            });

            Route::prefix('activity-report')->group(function () {
                Route::get('/executive', [ReportController::class, 'executiveSummary']);
                Route::get('/session', [ReportController::class, 'sessionEffectiveness']);
                Route::get('/student', [ReportController::class, 'studentLog']);
                Route::get('/student-details/{id}', [ReportController::class, 'studentActivityDetails']);
                Route::get('/class-summary', [ReportController::class, 'classSummary']);
                Route::get('/class-ranking/{classId}', [ReportController::class, 'classRanking']);
                Route::get('/teacher-summary', [ReportController::class, 'teacherSummary']);
                Route::get('/pdf', [ReportController::class, 'downloadFullReport']);
                Route::get('/morning-session/classes-list', [MorningSessionController::class, 'getClasses']);
                Route::get('/morning-session-details/{student_id}', [MorningSessionController::class, 'getStudentSummary']);
            });
        }); // end admin

    }); // end auth:sanctum

}); // end tenant