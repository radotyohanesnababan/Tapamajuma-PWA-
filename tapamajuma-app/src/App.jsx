import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentLayout from "./layouts/StudentLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import StudentDashboard from "./pages/student/Dashboard";
import ChallengeForm from "./pages/student/ChallengeForm";
import MathGame from "./components/games/MathGame";
import TeacherDashboard from "./pages/teacher/Dashboard"; // Import dashboard guru
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthGuard from "./components/AuthGuard";
import AnalysisTab from "./pages/teacher/AnalysisTab";
import WeeklyReflection from "./pages/student/WeeklyReflection";
import PeerFeed from "./pages/student/PeerFeed";
import TeacherReflection from "./pages/teacher/TeacherReflection";
import { Toaster } from "@/components/ui/sonner";
import GalleryStudent from "./pages/student/GalleryStudent";
import OtherMenu from "./pages/student/OtherMenu";
import OtherMenuTc from "./pages/teacher/OtherMenuTc";
import OtherMenuSa from "./pages/superadmin/OtherMenuSa";
import EditProfile from "./pages/student/EditProfile";
import PresentationPage from "./pages/student/PresentationPage";
import SuperadminDashboard from "./pages/superadmin/Dashboard";
import SuperadminLayout from "./layouts/SuperadminLayout";
import SesiMandiri from "./pages/teacher/SesiMandiri";
import TeacherManagement from "./pages/superadmin/TeacherManagement";
import StudentManagement from "./pages/superadmin/StudentManagement";
import ClassManagement from "./pages/superadmin/ClassManagement";
import ClassImprovement from "./pages/teacher/ClassImprovement";
import BankSoal from "./pages/teacher/BankSoal";
import SubjectManagement from "./pages/superadmin/SubjectManagement";
import QuestionBankManagement from "./pages/superadmin/QuestionBankManagement";
import ImportData from "./pages/superadmin/ImportData";
import Changelog from "./pages/superadmin/Changelog"; 
import Certificate from "./pages/student/Certificate";
import ActivityReport from "./pages/superadmin/ActivityReport";
import ExecutiveReport from "./pages/superadmin/ExcecutiveReport";
import StudentLog from "./pages/superadmin/StudentLog";
import SessionReport from "./pages/superadmin/SessionReport";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import GalleryTeacher from "./pages/teacher/GalleryTeacher";



function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Rute Publik */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path="/password-reset/:token" element={<ResetPassword/>}/>
          <Route path="/edit-profile" element={<EditProfile/>}/>

          {/* GRUP 1: HALAMAN SISWA (Dibungkus AuthGuard & StudentLayout) */}
          <Route 
            element={
              <AuthGuard>
                <StudentLayout />
              </AuthGuard>
            }
          >
            <Route path="/" element={<StudentDashboard />} />
            <Route path="/tantangan" element={<ChallengeForm />} />
            <Route path="/refleksi" element={
            <div className="space-y-8">
              <WeeklyReflection /> {/* Form Input 3 Box */}
              <hr />
              <PeerFeed /> {/* Kabar Baik Teman Sekelas */}
            </div>
          } />
            <Route path="/galeri" element={<GalleryStudent />} />
            <Route path="/other" element={<OtherMenu />} />
            <Route path="/presentation" element={<PresentationPage />} />
            {/* <Route path="/certificates" element={<Certificate />} /> */}
          </Route>

          {/* GRUP 2: HALAMAN GURU (Dibungkus AuthGuard dengan Role Required) */}
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
            {/* GRUP 2.1: Peningkatan Kelas */}
            <Route path="class-improvement" element={<div className="p-4"><ClassImprovement /></div>} />
            <Route path="/teacher/class-improvement/analysis" element={<AnalysisTab />} />
        <Route path="/teacher/class-improvement/reflection" element={<TeacherReflection />} />
        <Route path="/teacher/class-improvement/gallery" element={<GalleryTeacher />} />
            {/* GRUP 2.2: Bank Soal */}
          <Route path="bank-soal" element={<div className="p-4"><BankSoal /></div>} />
          {/* GRUP 2.3: Pengaturan */}
            <Route path="profile" element={<div className="p-4 font-bold"><OtherMenuTc /></div>} />

            
          </Route>

          {/* GRUP 3: GAME (Bisa tambahkan AuthGuard juga agar siswa harus login dulu) */}
          <Route 
            path="/game/math" 
            element={
              <AuthGuard>
                <MathGame />
              </AuthGuard>
            } 
          />
          {/* SUPERADMIN */}
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
            
            {/* GRUP 3.1: Laporan */}
            <Route path="activity-report/executive" element={<ExecutiveReport />} />
            <Route path="activity-report/students" element={<StudentLog />} />
            <Route path="activity-report/sessions" element={<SessionReport />} />

            {/* <Route path="scores" element={<div className="p-4 font-bold">Rekap Nilai Siswa</div>} />
            <Route path="settings" element={<div className="p-4 font-bold">Pengaturan Superadmin</div>} /> */}
          </Route>

        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}

export default App;