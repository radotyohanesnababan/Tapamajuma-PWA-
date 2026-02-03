import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  LogOut, 
  Menu,
  Bell,
  Users2,
  UserSquare,
  CircleSlash,
  Book,
  BookAIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";


export default function SuperadminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { name: "Dashboard", path: "/superadmin", icon: <LayoutDashboard size={20} /> },
    { name: "Manajemen Siswa", path: "/superadmin/student-mgmt", icon: <Users size={20} /> },
    { name: "Manajemen Guru", path: "/superadmin/teacher-mgmt", icon: <UserSquare size={20} /> },
    { name: "Manajemen Kelas", path: "/superadmin/class-mgmt", icon: <Book size={20} /> },
    { name: "Manajemen Mata Pelajaran", path: "/superadmin/subject-mgmt", icon: <BookAIcon size={20} /> },
    { name: "Manajemen Bank Soal", path: "/superadmin/question-bank-mgmt", icon: <BookOpen size={20} /> },
    { name: "Pengaturan dan Profil", path: "/superadmin/other", icon: <Settings size={20} /> },
    
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR (Desktop) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full transition-all duration-300">
        <div className="p-6">
          <h2 className="text-2xl font-black tracking-tighter text-indigo-400">Tapamajuma Control Room <span className="text-white text-xs block font-normal tracking-normal opacity-60">Control Panel</span></h2>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname === item.path 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-rose-400 hover:bg-rose-950 hover:text-rose-300 rounded-xl"
          >
            <LogOut size={20} />
            Keluar Sistem
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 ml-64">
        {/* Header Atas */}
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-slate-500">
            <Menu size={20} className="md:hidden" />
            <span className="text-sm font-medium">Selamat Datang, <span className="font-bold text-slate-800">Superadmin</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
              <Bell size={20} />
            </Button>
            <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xs">
              {user?.avatar ? (
              <img 
                src={getStorageUrl(user.avatar)} 
                alt="User Avatar" 
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-2xl">{user?.name?.charAt(0)}</span>
            )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}