import { Outlet, NavLink } from "react-router-dom";
import { Home, BookOpen, MessageCircle, LayoutGrid, LogOut } from "lucide-react";
import api from "@/lib/axios"; // Pastikan import api ada
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function StudentLayout() {

  const handleLogout = async () => {
    // HAPUS if(confirm), biarkan AlertDialog yang menangani konfirmasi
    try {
      await api.post("/logout");
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  const navItems = [
    { to: "/", icon: <Home size={20} />, label: "Beranda" },
    { to: "/tantangan", icon: <BookOpen size={20} />, label: "Aksi" },
    { to: "/refleksi", icon: <MessageCircle size={20} />, label: "Refleksi" },
    { to: "/galeri", icon: <LayoutGrid size={20} />, label: "Galeri" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="flex-1 pb-20 p-4 max-w-md mx-auto w-full">
        <Outlet />
      </main>

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

          {/* HANYA GUNAKAN SATU STRUKTUR ALERT DIALOG DI SINI */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-1 text-red-400 active:scale-95 transition-all outline-none">
                <LogOut size={20} />
                <span className="text-[10px] font-medium">Keluar</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[90%] rounded-2xl border-none">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center text-lg">Keluar Game?</AlertDialogTitle>
                <AlertDialogDescription className="text-center text-sm">
                  Aksi kamu hari ini sudah hebat! Yakin ingin keluar sekarang?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-row gap-3 mt-4">
                <AlertDialogCancel className="flex-1 rounded-xl h-11 mt-0">Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="flex-1 bg-red-500 hover:bg-red-600 rounded-xl h-11"
                >
                  Ya, Keluar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
        </div>
      </nav>
    </div>
  );
}