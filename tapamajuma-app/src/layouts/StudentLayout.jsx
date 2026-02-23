import { Outlet, Link, useLocation } from "react-router-dom"; // Tambah useLocation
import { Home, BookOpen, MessageCircle, LayoutGrid, CircleUser } from "lucide-react";
import ChangelogModal from '@/components/ChangelogModal';

export default function StudentLayout() {
  const location = useLocation(); // Hook untuk tahu kita sedang di halaman mana

  const navItems = [
    { to: "/student", icon: <Home size={20} />, label: "Beranda" },
    { to: "/student/tantangan", icon: <BookOpen size={20} />, label: "Aksi" },
    { to: "/student/refleksi", icon: <MessageCircle size={20} />, label: "Refleksi" },
    { to: "/student/galeri", icon: <LayoutGrid size={20} />, label: "Galeri" },
    { to: "/student/other", icon: <CircleUser size={20} />, label: "Lainnya" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="flex-1 pb-24 p-4 max-w-md mx-auto w-full">
        <Outlet />
      </main>
      <ChangelogModal />

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-2xl px-6 py-3 flex justify-between items-center z-50">
        {navItems.map((item) => {
          // Logic cek aktif: 
          // 1. Jika path tepat sama (misal "/")
          // 2. Atau jika bukan home, cek apakah pathname diawali dengan item.to (agar submenu tetap nyala)
          const isActive = location.pathname === item.to || (item.to !== "/student" && location.pathname.startsWith(item.to));

          return (
            <Link
              key={item.to} // PERBAIKAN 1: Gunakan item.to sebagai key
              to={item.to}  // PERBAIKAN 2: Gunakan item.to untuk link
              className={`flex flex-col items-center gap-1 transition-all duration-300 relative ${
                isActive
                  ? "text-slate-900 -translate-y-1" // Ganti text-primary jadi slate-900 biar aman (atau sesuaikan tema)
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {item.icon}
              <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>
                {item.label}
              </span>
              
              {/* Pemanis: Titik indikator aktif */}
              <span 
                className={`absolute -bottom-2 w-1 h-1 bg-slate-900 rounded-full transition-all duration-300 ${
                  isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
                }`} 
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}