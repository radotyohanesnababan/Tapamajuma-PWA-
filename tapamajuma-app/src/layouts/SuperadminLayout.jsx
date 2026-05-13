// SuperadminLayout.jsx - REVISED VERSION
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getStorageUrl } from '@/lib/utils';
import {
  LayoutDashboard, Users, BookOpen, Settings,
  LogOut, Menu, Bell, UserSquare, Book,
  BookAIcon, ActivityIcon, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { IconCertificate } from "@tabler/icons-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/superadmin",
    icon: <LayoutDashboard size={20} />,
  },
  {
    name: "Manajemen SDM",
    icon: <Users size={20} />,
    children: [
      { name: "Manajemen Siswa",  path: "/superadmin/student-mgmt",  icon: <Users size={16} /> },
      { name: "Manajemen Guru",   path: "/superadmin/teacher-mgmt",  icon: <UserSquare size={16} /> },
      { name: "Manajemen Kelas",  path: "/superadmin/class-mgmt",    icon: <Book size={16} /> },
    ],
  },
  {
    name: "Mapel & Bank Soal",
    icon: <BookOpen size={20} />,
    children: [
      { name: "Mata Pelajaran",  path: "/superadmin/subject-mgmt",       icon: <BookAIcon size={16} /> },
      { name: "Bank Soal",       path: "/superadmin/question-bank-mgmt", icon: <BookOpen size={16} /> },
    ],
  },
  {
    name: "Manajemen Sertifikat",
    path: "/superadmin/certificate-mgmt",
    icon: <IconCertificate size={20} />,
  },
  {
    name: "Laporan Keaktifan Siswa",
    path: "/superadmin/activity-report",
    icon: <ActivityIcon size={20} />,
  },
  {
    name: "Pengaturan & Profil",
    path: "/superadmin/other",
    icon: <Settings size={20} />,
  },
];

export default function SuperadminLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const [openGroup, setOpenGroup] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    window.location.href = "/login";
  };

  const isChildActive = (children) =>
    children?.some((c) => location.pathname === c.path);

  const toggleGroup = (name) =>
    setOpenGroup((prev) => (prev === name ? null : name));

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Sidebar - REVISED ── */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col fixed h-full shadow-2xl border-r border-slate-800/50">
        {/* Header with refined spacing */}
        <div className="p-6 border-b border-slate-800/50">
          <h2 className="text-xl font-black tracking-tight text-white leading-tight">
            Tapamajuma
            <span className="block text-[11px] font-medium tracking-wide text-slate-400 mt-1.5">
              Control Room
            </span>
          </h2>
        </div>

        {/* Navigation with improved contrast */}
        <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {menuItems.map((item) => {
            // ── Item dengan children (dropdown) ──
            if (item.children) {
              const isOpen = openGroup === item.name;
              const hasActive = isChildActive(item.children);

              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleGroup(item.name)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-semibold transition-all group
                      ${isOpen || hasActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      }`}
                  >
                    <span className={`${isOpen || hasActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"}`}>
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left">{item.name}</span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform duration-200
                        ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown with refined animation */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out
                    ${isOpen ? "max-h-48 opacity-100 mt-1" : "max-h-0 opacity-0"}`}
                  >
                    <div className="pl-3 pt-1 pb-1 flex flex-col gap-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[13px] font-medium
                            transition-all relative group/child
                            before:content-[''] before:absolute before:left-0 before:top-1/2
                            before:-translate-y-1/2 before:w-1 before:h-5 before:rounded-full before:transition-all
                            ${location.pathname === child.path
                              ? "text-white bg-slate-800/80 before:bg-blue-500 before:shadow-lg before:shadow-blue-500/50"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 before:bg-slate-700/50"
                            }`}
                        >
                          <span className={location.pathname === child.path ? "text-blue-400" : "text-slate-500 group-hover/child:text-slate-300"}>
                            {child.icon}
                          </span>
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            // ── Item biasa dengan improved contrast ──
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-semibold transition-all group
                  ${location.pathname === item.path
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
              >
                <span className={location.pathname === item.path ? "text-white" : "text-slate-400 group-hover:text-blue-400"}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer with refined styling */}
        <div className="p-3 border-t border-slate-800/50 mt-auto">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 rounded-lg font-semibold text-sm py-3 transition-all"
          >
            <LogOut size={20} />
            Keluar Sistem
          </Button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 ml-64">
        {/* Header with refined styling */}
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-slate-600">
            <Menu size={20} className="md:hidden" />
            <span className="text-sm font-medium">
              Selamat Datang,{" "}
              <span className="font-bold text-slate-900">Superadmin</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </Button>
            <div className="h-9 w-9 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs overflow-hidden">
              {user?.avatar ? (
                <img
                  src={getStorageUrl(user.avatar)}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span>{user?.name?.charAt(0)}</span>
              )}
            </div>
          </div>
        </header>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}