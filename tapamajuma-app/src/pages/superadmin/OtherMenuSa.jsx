import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Presentation, 
  LogOut, 
  ChevronRight, 
  Award,
  Grid,
  CalendarDays
} from "lucide-react";
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
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';

export default function OtherMenuSa() {
   const { user} = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  const menuItems = [
    {
      title: "Profil Saya",
      subtitle: "Lihat dan ubah data diri serta password",
      icon: <User className="text-blue-600" size={32} />, // Icon lebih besar
      path: "/edit-profile",
      color: "bg-blue-100", // Warna background icon lebih soft
      hoverBorder: "hover:border-blue-200"
    },
    {
      title: "Import Data",
      subtitle: "Import data siswa atau guru dari file Excel",
      icon: <Grid className="text-green-600" size={32} />, // Icon lebih besar
      path: "/superadmin/import-data",
      color: "bg-green-100", // Warna background icon lebih soft
      hoverBorder: "hover:border-green-200"
    },
    {
      title: "Changelog Aplikasi",
      subtitle: "Ubah Riwayat perubahan aplikasi",
      icon: <CalendarDays className="text-purple-600" size={32} />, // Icon lebih besar
      path: "/superadmin/changelog",
      color: "bg-purple-100", // Warna background icon lebih soft
      hoverBorder: "hover:border-purple-200"
    },

  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* --- Header / Profile Section --- */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Besar */}
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-lg shadow-indigo-200">
            {user?.avatar ? (
              <img 
                src={user.avatar ? `http://127.0.0.1:8000/storage/${user.avatar}` : null}
                className="w-full h-full object-cover rounded-full"
                alt="Avatar"
              />
            ) : (
              <span className="text-2xl">{user?.name?.charAt(0)}</span>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              Halo, {user?.name}! 👋
            </h1>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full">
                    Superadmin {user?.class_id}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                </span>
            </div>
            <p className="text-slate-500 max-w-xl">
              Selamat datang di pusat kontrol akun.
            </p>
          </div>
        </div>

        {/* --- Grid Menu --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Card 
              key={index} 
              className={`border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group ${item.hoverBorder}`}
              onClick={() => navigate(item.path)}
            >
              <CardContent className="p-6 flex flex-col h-full justify-between gap-4">
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-2xl ${item.color} transition-transform group-hover:scale-110 duration-300`}>
                    {item.icon}
                  </div>
                  {item.badge && (
                    <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md shadow-indigo-200">
                      {item.badge}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>
                
                <div className="pt-2 flex items-center text-sm font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                  Buka Menu <ChevronRight size={16} className="ml-1" />
                </div>
              </CardContent>
            </Card>
          ))}

          {/* --- Logout Card (Integrated) --- */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Card className="border border-red-100 bg-red-50/30 hover:bg-red-50 hover:border-red-200 shadow-sm cursor-pointer group transition-all duration-300">
                <CardContent className="p-6 flex flex-col h-full justify-between gap-4">
                  <div className="flex justify-between items-start">
                    <div className="p-4 rounded-2xl bg-white border border-red-100 group-hover:bg-red-100 transition-colors">
                      <LogOut className="text-red-500" size={32} />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-red-600">
                      Keluar
                    </h3>
                    <p className="text-sm text-red-400/80 leading-relaxed">
                      Selesai sesi ini? Klik di sini untuk log out dengan aman.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center text-sm font-semibold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                    Logout Sekarang <ChevronRight size={16} className="ml-1" />
                  </div>
                </CardContent>
              </Card>
            </AlertDialogTrigger>
            
            <AlertDialogContent className="sm:max-w-md rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-center text-2xl font-bold text-slate-800">
                  Keluar Game?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center text-slate-500 text-base">
                  Aksi kamu hari ini sudah hebat! Yakin ingin menyudahi sesi ini sekarang?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-row gap-3 mt-6 sm:justify-center w-full">
                <AlertDialogCancel className="flex-1 rounded-xl h-12 text-base font-medium border-slate-200 hover:bg-slate-50 hover:text-slate-700 mt-0">
                  Batal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl h-12 text-base font-bold shadow-lg shadow-red-100"
                >
                  Ya, Keluar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Footer Info */}
        <div className="border-t border-slate-200 pt-8 mt-12 text-center">
            <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase">
                Tapamajuma Learning System v1.0 &copy; {new Date().getFullYear()}
            </p>
        </div>

      </div>
    </div>
  );
}