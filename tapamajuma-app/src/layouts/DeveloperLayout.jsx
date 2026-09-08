import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, School, LogOut, Terminal } from "lucide-react";
import { useDeveloperAuth } from "@/context/DeveloperAuthContext";
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

export default function DeveloperLayout() {
  const { developer, logout } = useDeveloperAuth();

  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, to: "/developer" },
    { label: "Onboard Sekolah", icon: <School size={18} />, to: "/developer/onboard-school" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
            <Terminal size={16} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-200">Developer</h2>
            <p className="text-[10px] text-slate-500">TAPAMAJUMA Platform</p>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/developer"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-violet-500/10 text-violet-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <p className="text-xs text-slate-500 px-3 mb-2 truncate">{developer?.email}</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-400 hover:bg-rose-500/10 w-full transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Keluar</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin keluar dari konsol developer?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={logout} className="bg-rose-600 hover:bg-rose-700 text-white">
                  Ya, Keluar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}