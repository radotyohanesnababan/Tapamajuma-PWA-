import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudentLayout from "./layouts/StudentLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import StudentDashboard from "./pages/student/Dashboard";
import ChallengeForm from "./pages/student/ChallengeForm";
import MathGame from "./components/games/MathGame";
import TeacherDashboard from "./pages/teacher/Dashboard"; // Import dashboard guru
import { Toaster } from "@/components/ui/toaster";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthGuard from "./components/AuthGuard";
import AnalysisTab from "./pages/teacher/AnalysisTab";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Rute Publik */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
            <Route path="/refleksi" element={<div className="p-4">Halaman Refleksi</div>} />
            <Route path="/galeri" element={<div className="p-4">Halaman Galeri</div>} />
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
            <Route path="analysis" element={<AnalysisTab />} />
            <Route path="profile" element={<div className="p-4 font-bold">Pengaturan Akun Guru</div>} />
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

        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;