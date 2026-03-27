import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PieChart, UserCircle, LogOut, BookCheck, School2Icon, FileQuestion, CircleQuestionMark, FileQuestionMark } from "lucide-react";
import ClassImprovement from "@/pages/teacher/ClassImprovement";
import ChangelogModal from '@/components/ChangelogModal';
// import api from "@/lib/axios";

export default function TeacherLayout() {
  const location = useLocation();
  // const navigate = useNavigate();
// unused but useful function for future
// const handleLogout = async () => {
// try {
//   // 1. Kirim request logout ke Laravel (Breeze API)
//   await api.post("/logout");
  
//   // 2. Bersihkan sisa-sisa cookie (Opsional tapi bagus untuk PWA)
//   // Laravel otomatis menghapus session, tapi kita bantu redirect
  
//   // 3. Redirect ke Login
//   navigate("/login", { replace: true });
  
//   // 4. Supaya state benar-benar bersih, bisa gunakan:
//    window.location.href = "/login";
// } catch (error) {
//   console.error("Logout gagal:", error.response);
//   // Jika server gagal (misal session sudah kadaluarsa), tetap lempar ke login
//   navigate("/login");
//   window.location.href = "/login";
// }
// };

  const navItems = [
    { label: "Beranda", path: "/teacher", icon: <LayoutDashboard size={20} /> },
    { label: "Perkemb. Kls", path: "/teacher/class-improvement", icon: <School2Icon size={20} /> },
    { label: "Bank Soal", path: "/teacher/bank-soal", icon: <CircleQuestionMark size={20} /> },
    { label: "CBT", path: "/teacher/cbt-center", icon: <FileQuestionMark size={20} /> },
    { label: "Profil", path: "/teacher/profile", icon: <UserCircle size={20} /> },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Konten Halaman */}
      <div className="pb-20"> 
        <Outlet />
      </div>
      <ChangelogModal />

      {/* Bottom Navigation Khusus Guru */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-2xl px-6 py-3 flex justify-between items-center z-50">
  {navItems.map((item) => (
    <Link
      key={item.path}
      to={item.path}
      className={`flex flex-col items-center gap-1 transition-all duration-300 ${
        location.pathname === item.path 
          ? "text-primary -translate-y-1" // Efek naik sedikit saat aktif
          : "text-slate-400 hover:text-slate-600"
      }`}
    >
      {item.icon}
      <span className="text-[10px] font-medium">{item.label}</span>
    </Link>
  ))}
</nav>
    </div>
  );
}