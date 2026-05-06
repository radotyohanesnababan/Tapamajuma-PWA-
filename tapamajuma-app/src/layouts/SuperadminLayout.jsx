// SuperadminLayout.jsx
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
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="p-6">
          <h2 className="text-xl font-black tracking-tighter text-indigo-400">
            Tapamajuma Control Room
            <span className="text-white text-xs block font-normal tracking-normal opacity-60">
              Control Panel
            </span>
          </h2>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto">
          {menuItems.map((item) => {
            // ── Item dengan children (dropdown) ──
            if (item.children) {
              const isOpen = openGroup === item.name;
              const hasActive = isChildActive(item.children);

              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleGroup(item.name)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${isOpen || hasActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                  >
                    {item.icon}
                    <span className="flex-1 text-left">{item.name}</span>
                    <ChevronDown
                      size={15}
                      className={`opacity-60 transition-transform duration-200
                        ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown */}
                  <div className={`overflow-hidden transition-all duration-200
                    ${isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <div className="pl-4 pt-1 pb-1 flex flex-col gap-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-medium
                            transition-all relative
                            before:content-[''] before:absolute before:left-0 before:top-1/2
                            before:-translate-y-1/2 before:w-0.5 before:h-4 before:rounded-full
                            ${location.pathname === child.path
                              ? "text-white bg-slate-700 before:bg-indigo-400"
                              : "text-slate-500 hover:text-slate-300 hover:bg-slate-800 before:bg-slate-700"
                            }`}
                        >
                          {child.icon}
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            // ── Item biasa ──
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${location.pathname === item.path
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
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

      {/* ── Main ── */}
      <div className="flex-1 ml-64">
        <header className="h-16 bg-white border-b px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-slate-500">
            <Menu size={20} className="md:hidden" />
            <span className="text-sm font-medium">
              Selamat Datang,{" "}
              <span className="font-bold text-slate-800">Superadmin</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
              <Bell size={20} />
            </Button>
            <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xs overflow-hidden">
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