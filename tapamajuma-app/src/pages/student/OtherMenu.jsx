import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  Presentation, 
  LogOut, 
  ChevronRight, 
  Settings, 
  Award,
  Sparkles,
  ShieldCheck,
  LayoutGrid,
  Gamepad2
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
    try {
      await api.post("/logout");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  const menuItems = [
    {
      title: "Profil Saya",
      subtitle: "Kelola identitas dan avatar kamu",
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
    {
        title: "Koleksi Sertifikat",
        subtitle: "Apresiasi atas kerja kerasmu",
        icon: <Award className="text-amber-500" size={22} />,
        path: "/certificates",
        color: "bg-amber-50",
        isComingSoon: true
    }
  ];

  return (
    <div className="p-4 pb-24 max-w-md mx-auto bg-[#F8FAFC] min-h-screen space-y-6">
      
      {/* HEADER PROFIL - Gaya Card Melayang */}
      <div className="flex items-center gap-5 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
        {/* Dekorasi Latar Belakang */}
        <div className="absolute -top-4 -right-4 opacity-[0.03] rotate-12 text-slate-900">
            <Gamepad2 size={120} />
        </div>
        
        <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-100 relative z-10">
          {user?.name?.charAt(0)}
        </div>
        
        <div className="relative z-10">
          <h2 className="text-xl font-black text-slate-800 leading-tight">{user?.name?.split(' ')[0]}</h2>
          <div className="flex items-center gap-1.5 mt-1">
             <span className="bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                KELAS {user?.class_id || '-'}
             </span>
             <Sparkles size={10} className="text-amber-400 fill-amber-400" />
          </div>
        </div>
      </div>

      {/* MENU LIST */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-3 mb-4">Misi & Akun</p>
        
        {menuItems.map((item, index) => (
          <Card 
            key={index} 
            className={`border-none shadow-sm rounded-[1.8rem] cursor-pointer active:scale-95 transition-all bg-white group ${item.isComingSoon ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-md'}`}
            onClick={() => !item.isComingSoon && navigate(item.path)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-2xl ${item.color} transition-transform group-hover:scale-110`}>
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-slate-800 tracking-tight">{item.title}</p>
                    {item.badge && (
                      <span className="text-[8px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                    {item.isComingSoon ? "Segera Hadir! ✨" : item.subtitle}
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl text-slate-300">
                <ChevronRight size={14} />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* LOGOUT ACTION */}
        <div className="pt-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-3 mb-4">Sesi Akhir</p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Card className="border-none shadow-sm rounded-[1.8rem] cursor-pointer active:scale-95 transition-all bg-white group border-l-4 border-l-rose-500">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-500 transition-transform group-hover:scale-110">
                        <LogOut size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-rose-500 tracking-tight">Keluar Game</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Selesai beraksi hari ini</p>
                      </div>
                    </div>
                    <div className="bg-rose-50 p-2 rounded-xl text-rose-300">
                        <ChevronRight size={14} />
                    </div>
                  </CardContent>
                </Card>
              </AlertDialogTrigger>
              
              <AlertDialogContent className="w-[90%] rounded-[2.5rem] border-none p-8 shadow-2xl">
                <AlertDialogHeader className="items-center">
                  <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mb-4">
                    <LogOut size={40} />
                  </div>
                  <AlertDialogTitle className="text-2xl font-black text-slate-800 tracking-tight">Istirahat Dulu?</AlertDialogTitle>
                  <AlertDialogDescription className="text-center text-xs font-medium text-slate-500 leading-relaxed px-2">
                    Aksi kamu hari ini sudah luar biasa! Pastikan semua progres belajarmu sudah tersimpan ya.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-col gap-3 mt-8">
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="w-full bg-rose-600 hover:bg-rose-700 rounded-2xl h-14 font-black shadow-lg shadow-rose-100 text-white order-1"
                  >
                    YA, KELUAR SEKARANG
                  </AlertDialogAction>
                  <AlertDialogCancel className="w-full rounded-2xl h-14 border-none bg-slate-100 text-slate-500 font-black text-xs hover:bg-slate-200 order-2">
                    LANJUTKAN AKSI 🚀
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center pt-10 pb-4">
         <div className="inline-flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-100">
            <LayoutGrid size={12} className="text-indigo-500" />
            <p className="text-[9px] text-slate-400 font-black tracking-[0.2em] uppercase">
                Tapamajuma PWA | All Rights Reserved 2026
            </p>
         </div>
      </div>
    </div>
  );
}