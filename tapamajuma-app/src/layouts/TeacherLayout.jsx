import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, PieChart, UserCircle, LogOut } from "lucide-react";
import api from "@/lib/axios";

export default function TeacherLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = async () => {
  try {
    // 1. Kirim request logout ke Laravel (Breeze API)
    await api.post("/logout");
    
    // 2. Bersihkan sisa-sisa cookie (Opsional tapi bagus untuk PWA)
    // Laravel otomatis menghapus session, tapi kita bantu redirect
    
    // 3. Redirect ke Login
    navigate("/login", { replace: true });
    
    // 4. Supaya state benar-benar bersih, bisa gunakan:
     window.location.href = "/login";
  } catch (error) {
    console.error("Logout gagal:", error.response);
    // Jika server gagal (misal session sudah kadaluarsa), tetap lempar ke login
    navigate("/login");
    window.location.href = "/login";
  }
};

  const navItems = [
    { label: "Monitor", path: "/teacher", icon: <LayoutDashboard size={20} /> },
    { label: "Analisis", path: "/teacher/analysis", icon: <PieChart size={20} /> },
    { label: "Profil", path: "/teacher/profile", icon: <UserCircle size={20} /> },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Konten Halaman */}
      <div className="pb-20"> 
        <Outlet />
      </div>

      {/* Bottom Navigation Khusus Guru */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 shadow-lg">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 ${
              location.pathname === item.path ? "text-primary" : "text-slate-400"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 text-red-400"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-medium">Keluar</span>
        </button>
      </nav>
    </div>
  );
}