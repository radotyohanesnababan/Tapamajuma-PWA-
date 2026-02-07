import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Presentation, 
  LogOut, 
  ChevronRight, 
  Settings, 
  Award,
  LayoutGrid
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

export default function OtherMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // HAPUS if(confirm), biarkan AlertDialog yang menangani konfirmasi
    try {
      await api.post("/logout");
      localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
      window.location.href = "/login";
    } catch (err) {
      window.location.href = "/login";
    }
  };

  const menuItems = [
    {
      title: "Profil Saya",
      subtitle: "Lihat dan ubah data diri kamu",
      icon: <User className="text-blue-500" size={22} />,
      path: "/edit-profile",
      color: "bg-blue-50"
    },
    {
      title: "Siap Presentasi",
      subtitle: "Laporan bulanan kamu (Aksi C.2)",
      icon: <Presentation className="text-indigo-500" size={22} />,
      path: "/presentation",
      color: "bg-indigo-50",
      badge: "C.2"
    },
    // {
    //   title: "Sertifikat",
    //   subtitle: "Koleksi apresiasi belajar",
    //   icon: <Award className="text-amber-500" size={22} />,
    //   path: "/certificates",
    //   color: "bg-amber-50"
    // }
  ];

  return (
    <div className="p-4 pb-24 max-w-md mx-auto bg-slate-50 min-h-screen">
      {/* Profil Header Singkat */}
      <div className="flex items-center gap-4 mb-8  bg-white rounded-3xl p-4 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-inner">
          {user?.name?.charAt(0)}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{user?.name}</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Siswa Kelas {user?.class_id}</p>
        </div>
      </div>

      <div className="space-y-3">
        {menuItems.map((item, index) => (
          <Card 
            key={index} 
            className="border-none shadow-sm rounded-2xl cursor-pointer active:scale-[0.98] transition-all bg-white"
            onClick={() => navigate(item.path)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800">{item.title}</p>
                    {item.badge && (
                      <span className="text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-md font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">{item.subtitle}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </CardContent>
          </Card>
        ))}

        {/* --- INTEGRASI ALERT DIALOG KAMU DI SINI --- */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Card className="border-none shadow-sm rounded-2xl cursor-pointer active:scale-[0.98] transition-all bg-white group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-red-50 group-hover:bg-red-100 transition-colors">
                    <LogOut className="text-red-500" size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-500">Keluar</p>
                    <p className="text-[10px] text-slate-400">Selesai bermain dan belajar</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </CardContent>
            </Card>
          </AlertDialogTrigger>
          
          <AlertDialogContent className="w-[90%] rounded-3xl border-none p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center text-lg font-bold">Keluar Game?</AlertDialogTitle>
              <AlertDialogDescription className="text-center text-sm text-slate-500">
                Aksi kamu hari ini sudah hebat! Yakin ingin keluar sekarang?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row gap-3 mt-6">
              <AlertDialogCancel className="flex-1 rounded-2xl h-12 mt-0 border-slate-100 text-slate-500 font-bold">
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="flex-1 bg-red-500 hover:bg-red-600 rounded-2xl h-12 font-bold shadow-lg shadow-red-200"
              >
                Ya, Keluar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* --- AKHIR INTEGRASI --- */}

      </div>

      <p className="text-center text-[10px] text-slate-300 mt-10 font-bold tracking-widest uppercase">
        Tapamajuma PWA  | All Rights Reserved 2026
      </p>
    </div>
  );
}