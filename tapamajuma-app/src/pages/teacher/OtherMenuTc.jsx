/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  LogOut, 
  ChevronRight, 
  Settings, 
  ShieldCheck,
  Info,
  LayoutGrid,
  Sparkles
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
import { getStorageUrl } from '@/lib/utils';

export default function OtherMenu() {

  const { user } = useAuth();
const [previewUrl, setPreviewUrl] = useState(
  user?.avatar
    ? getStorageUrl(user.avatar)
    : null
);
  const navigate = useNavigate();

  const handleLogout = async () => {
    // 1. Kabari Backend (Sopan santun)
    try {
        await api.post('/api/logout'); 
    } catch (error) {
        console.warn("Backend logout error (abaikan):", error);
    } finally {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('onboarding_data');


        window.location.href = '/login';
    }
};
  useEffect(() => {
      if (user) {
        setPreviewUrl(user.avatar ? getStorageUrl(user.avatar) : null);
      }
    }, [user]);

  const menuItems = [
    {
      title: "Profil Saya",
      subtitle: "Kelola data diri dan identitas",
      icon: <User className="text-blue-500" size={22} />,
      path: "/edit-profile",
      color: "bg-blue-50"
    },
  ];

  return (
    <div className="p-4 pb-24 max-w-md mx-auto bg-[#F8FAFC] min-h-screen space-y-6">
      
      <div className="flex items-center gap-5 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
          <Settings size={100} />
        </div>
        
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-100 relative z-10 overflow-hidden">
          {previewUrl ? (
                                <img src={previewUrl} className="w-full h-full object-cover" alt="Avatar" />
                              ) : (
                                user?.name?.charAt(0)
                              )}
        </div>
        
        <div className="relative z-10">
          <h2 className="text-xl font-black text-slate-800 leading-tight">{user?.name}</h2>
          <div className="flex items-center gap-1.5 mt-1">
          </div>
        </div>
      </div>

      {/* MENU SECTION */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-4">Pengaturan Akun</p>
        
        {menuItems.map((item, index) => (
          <Card 
            key={index} 
            className="border-none shadow-sm rounded-[1.8rem] cursor-pointer active:scale-95 transition-all bg-white group hover:shadow-md"
            onClick={() => navigate(item.path)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-2xl ${item.color} transition-transform group-hover:scale-110`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 tracking-tight">{item.title}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{item.subtitle}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl text-slate-300">
                <ChevronRight size={14} />
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="pt-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-4">Sesi</p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Card className="border-none shadow-sm rounded-[1.8rem] cursor-pointer active:scale-95 transition-all bg-white group hover:shadow-md border-l-4 border-l-rose-500">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-500 transition-transform group-hover:scale-110">
                        <LogOut size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-rose-500 tracking-tight">Keluar Akun</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Selesaikan sesi pengajaran</p>
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
                  <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-4">
                    <LogOut size={32} />
                  </div>
                  <AlertDialogTitle className="text-xl font-black text-slate-800">Selesaikan Sesi?</AlertDialogTitle>
                  <AlertDialogDescription className="text-center text-xs font-medium text-slate-500 leading-relaxed">
                    Pastikan semua data progres siswa sudah tersimpan sebelum kamu keluar dari aplikasi.
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
                    BATALKAN
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>

      <div className="text-center pt-10 pb-4">
         <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <LayoutGrid size={12} className="text-indigo-500" />
            <p className="text-[9px] text-slate-400 font-black tracking-[0.2em] uppercase">
                Tapamajuma PWA All Rights Reserved 2026
            </p>
         </div>
      </div>
    </div>
  );
}