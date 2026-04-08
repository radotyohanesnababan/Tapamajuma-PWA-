import React, { Suspense, lazy} from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { HelmetProvider } from 'react-helmet-async'; // Ditambahkan untuk SEO




// ==========================================
// 1. IMPORT SINKRON (Critical Load)
// ==========================================
// Layout dan AuthGuard harus dimuat langsung agar kerangka dasar web tidak telat muncul.
import AuthGuard from "./components/AuthGuard";
import StudentLayout from "./layouts/StudentLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import SuperadminLayout from "./layouts/SuperadminLayout";
import Welcome from "./pages/Welcome";
import SebPage from "./pages/SebPage";
import GuestGuard from './components/GuestGuard';
import SharedGallery from './pages/SharedGallery';
import CBTManager from './pages/student/CBTManager';

// ==========================================
// 2. IMPORT ASINKRON (Lazy Load)
// ==========================================
// -- Auth --
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const SocialCallback = lazy(() => import("./pages/auth/SocialCallback"));

// -- Student --
const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const ChallengeForm = lazy(() => import("./pages/student/ChallengeForm"));
const WeeklyReflection = lazy(() => import("./pages/student/WeeklyReflection"));
const PeerFeed = lazy(() => import("./pages/student/PeerFeed"));
const GalleryStudent = lazy(() => import("./pages/student/GalleryStudent"));
const OtherMenu = lazy(() => import("./pages/student/OtherMenu"));
const PresentationPage = lazy(() => import("./pages/student/PresentationPage"));
const EditProfile = lazy(() => import("./pages/student/EditProfile"));
// const Certificate = lazy(() => import("./pages/student/Certificate")); // (Dicoment di asli)

// -- Teacher --
const TeacherDashboard = lazy(() => import("./pages/teacher/Dashboard"));
const SesiMandiri = lazy(() => import("./pages/teacher/SesiMandiri"));
const ClassImprovement = lazy(() => import("./pages/teacher/ClassImprovement"));
const AnalysisTab = lazy(() => import("./pages/teacher/AnalysisTab"));
const TeacherReflection = lazy(() => import("./pages/teacher/TeacherReflection"));
const GalleryTeacher = lazy(() => import("./pages/teacher/GalleryTeacher"));
const PrintSession = lazy(() => import("./pages/teacher/PrintSession"));
const BankSoal = lazy(() => import("./pages/teacher/BankSoal"));
const SoalList = lazy(() => import("./pages/teacher/SoalList"));
const SoalAdd = lazy(() => import("./pages/teacher/SoalAdd"));
const SoalImport = lazy(() => import("./pages/teacher/SoalImport"));
const MediaBank = lazy(() => import("./pages/teacher/MediaBank"));
const OtherMenuTc = lazy(() => import("./pages/teacher/OtherMenuTc"));
const CBTCenter = lazy(() => import("./pages/teacher/CBTCenter"));

// -- Superadmin --
const SuperadminDashboard = lazy(() => import("./pages/superadmin/Dashboard"));
const TeacherManagement = lazy(() => import("./pages/superadmin/TeacherManagement"));
const StudentManagement = lazy(() => import("./pages/superadmin/StudentManagement"));
const ClassManagement = lazy(() => import("./pages/superadmin/ClassManagement"));
const SubjectManagement = lazy(() => import("./pages/superadmin/SubjectManagement"));
const QuestionBankManagement = lazy(() => import("./pages/superadmin/QuestionBankManagement"));
const ImportData = lazy(() => import("./pages/superadmin/ImportData"));
const OtherMenuSa = lazy(() => import("./pages/superadmin/OtherMenuSa"));
const ActivityReport = lazy(() => import("./pages/superadmin/ActivityReport"));
const Changelog = lazy(() => import("./pages/superadmin/Changelog"));
const ExecutiveReport = lazy(() => import("./pages/superadmin/ExcecutiveReport"));
const StudentLog = lazy(() => import("./pages/superadmin/StudentLog"));
const SessionReport = lazy(() => import("./pages/superadmin/SessionReport"));
const ClassSummary = lazy(() => import("./pages/superadmin/ClassSummary"));
const TeacherSummary = lazy(() => import("./pages/superadmin/TeacherSummary"));
const MorningSessionStudent = lazy(() => import("./pages/superadmin/MorningSessionStudent"));

// -- Games --
const MathGame = lazy(() => import("./components/games/MathGame"));



// -- CBT (Ujian Resmi) --
const CBTStart = lazy(() => import("./pages/student/CBTStart"));
const CBTExam = lazy(() => import("./pages/student/CBTExam"));

// ==========================================
// KOMPONEN LOADING
// ==========================================
// Dimunculkan oleh Suspense saat file Javascript halaman tujuan sedang di-download (percepatan mikro)
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
    <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
  </div>
);




function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        {/* Suspense membungkus rute yang di-lazy load */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Rute Publik & Utama (NO GUARD) */}
            <Route path="/s/:token" element={<SharedGallery />} />
            <Route path="/seb" element={<SebPage />} />            
            {/* Rute Publik & Utama */}
            <Route element={<GuestGuard />}>
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/password-reset/:token" element={<ResetPassword />} />
            </Route>
            <Route path="/edit-profile" element={
              <AuthGuard>
                <EditProfile />
              </AuthGuard>
            } />
            <Route path="/social-callback" element={<SocialCallback />} />

            {/* GRUP 1: HALAMAN SISWA */}
            <Route 
              path="/student" 
              element={
                <AuthGuard> 
                  <StudentLayout />
                </AuthGuard>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="tantangan" element={<ChallengeForm />} />
              <Route path="refleksi" element={
                <div className="space-y-8">
                  <WeeklyReflection />
                  <hr />
                  <PeerFeed />
                </div>
              } />
              <Route path="galeri" element={<GalleryStudent />} />
              <Route path="other" element={<OtherMenu />} />
              <Route path="presentation" element={<PresentationPage />} />
            </Route>

            {/* GRUP 2: HALAMAN GURU */}
            <Route 
              path="/teacher" 
              element={
                <AuthGuard roleRequired="teacher">
                  <TeacherLayout />
                </AuthGuard>
              }
            >
              <Route index element={<TeacherDashboard />} />
              <Route path="mandiri-session" element={<div className="p-4 font-bold"><SesiMandiri /></div>} />
              <Route path="profile" element={<div className="p-4 font-bold"><OtherMenuTc /></div>} />
              
              {/* GRUP 2.1: Peningkatan Kelas */}
              {/* PERBAIKAN: Hapus awalan '/' pada child routes agar mengikuti induk '/teacher' */}
              <Route path="class-improvement" element={<div className="p-4"><ClassImprovement /></div>} />
              <Route path="class-improvement/analysis" element={<AnalysisTab />} />
              <Route path="class-improvement/reflection" element={<TeacherReflection />} />
              <Route path="class-improvement/gallery" element={<GalleryTeacher />} />
              <Route path="class-improvement/print-session-activity" element={<PrintSession />} />
              
              {/* GRUP 2.2: Bank Soal */}
              <Route path="bank-soal" element={<div className="p-4"><BankSoal /></div>} />
              <Route path="bank-soal/list" element={<div className="p-4"><SoalList /></div>} />
              <Route path="bank-soal/add" element={<div className="p-4"><SoalAdd /></div>} />
              <Route path="bank-soal/import" element={<div className="p-4"><SoalImport /></div>} />
              <Route path="bank-soal/mediabank" element={<div className="p-4"><MediaBank /></div>} />

              {/* GRUP 2.3: CBT */}
              <Route path="cbt-center" element={<div className="p-4"><CBTCenter /></div>} />
            </Route>

            {/* GRUP 3: GAME */}
            <Route 
              path="/game/math" 
              element={
                <AuthGuard>
                  <MathGame />
                </AuthGuard>
              } 
            />

            {/* GRUP 4: SUPERADMIN */}
            <Route 
              path="/superadmin" 
              element={
                <AuthGuard roleRequired="superadmin">
                  <SuperadminLayout />
                </AuthGuard>
              }
            >
              <Route index element={<SuperadminDashboard />} />
              <Route path="teacher-mgmt" element={<div className="p-4 font-bold"><TeacherManagement /></div>} />
              <Route path="student-mgmt" element={<div className="p-4 font-bold"><StudentManagement /></div>} />
              <Route path="class-mgmt" element={<div className="p-4 font-bold"><ClassManagement /></div>} />
              <Route path="subject-mgmt" element={<div className="p-4 font-bold"><SubjectManagement /></div>} />
              <Route path="question-bank-mgmt" element={<div className="p-4 font-bold"><QuestionBankManagement /></div>} />
              <Route path="import-data" element={<div className="p-4 font-bold"><ImportData /></div>} />
              <Route path="other" element={<div className="p-4 font-bold"><OtherMenuSa /></div>} />
              <Route path="activity-report" element={<div className="p-4 font-bold"><ActivityReport/></div>} />
              <Route path="changelog" element={<div className="p-4 font-bold"><Changelog /></div>} />
              
              {/* GRUP 4.1: Laporan */}
              <Route path="activity-report/executive" element={<ExecutiveReport />} />
              <Route path="activity-report/students" element={<StudentLog />} />
              <Route path="activity-report/sessions" element={<SessionReport />} />
              <Route path="activity-report/classes" element={<ClassSummary />} />
              <Route path="activity-report/teachers" element={<TeacherSummary />} />
              <Route path="activity-report/morning-sessions" element={<MorningSessionStudent />} />
            </Route>
            {/* CBT SYSTEM: SINGLE ENDPOINT */}
            <Route 
              path="/cbt" 
              element={
                <AuthGuard roleRequired="student">
                  <CBTManager />
                </AuthGuard>
              } 
            />

          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-center" richColors closeButton />
      <SpeedInsights />
    </HelmetProvider>
  );
}

export default App;