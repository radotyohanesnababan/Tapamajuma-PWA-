import { Outlet, NavLink } from "react-router-dom";
import { Home, BookOpen, MessageCircle, LayoutGrid } from "lucide-react";

export default function StudentLayout() {
  const navItems = [
    { to: "/", icon: <Home size={20} />, label: "Beranda" },
    { to: "/tantangan", icon: <BookOpen size={20} />, label: "Aksi" },
    { to: "/refleksi", icon: <MessageCircle size={20} />, label: "Refleksi" },
    { to: "/galeri", icon: <LayoutGrid size={20} />, label: "Galeri" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Konten Utama */}
      <main className="flex-1 pb-20 p-4 max-w-md mx-auto w-full">
        <Outlet />
      </main>

      {/* Navigasi Bawah (Fixed) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white pb-safe">
        <div className="flex h-16 max-w-md mx-auto items-center justify-around px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`
              }
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}