/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Presentation, LogOut, ChevronRight, Award,
  Sparkles, ShieldCheck, LayoutGrid, Gamepad2,
  Rocket, Heart, Zap, Star, Crown, Gem, CircleDot
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
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { getStorageUrl } from "@/lib/utils";

export default function OtherMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState(
    user?.avatar ? getStorageUrl(user.avatar) : null
  );

  const handleLogout = async () => {
    try {
      await api.post("/api/logout");
    } catch (error) {
      console.warn("Backend logout error (abaikan):", error);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("onboarding_data");
      window.location.href = "/login";
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
      subtitle: "Kelola identitas dan avatar kamu",
      icon: User,
      iconColor: "text-sky-500",
      path: "/edit-profile",
      grad: "from-sky-400 to-blue-500",
      light: "bg-sky-50",
      shadow: "shadow-[0_4px_14px_rgba(56,189,248,0.2)]",
    },
    {
      title: "Siap Presentasi",
      subtitle: "Laporan bulanan kamu",
      icon: Presentation,
      iconColor: "text-indigo-500",
      path: "/student/presentation",
      grad: "from-indigo-400 to-violet-500",
      light: "bg-indigo-50",
      shadow: "shadow-[0_4px_14px_rgba(99,102,241,0.2)]",
    },
    {
      title: "Koleksi Sertifikat",
      subtitle: "Apresiasi atas kerja kerasmu!",
      icon: Award,
      iconColor: "text-amber-500",
      path: "/student/certificates",
      grad: "from-amber-400 to-orange-500",
      light: "bg-amber-50",
      shadow: "shadow-[0_4px_14px_rgba(251,191,36,0.2)]",
      badge: "Baru!",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f5fb] pb-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
        .font-display { font-family: 'Baloo 2', system-ui, sans-serif; }
        @keyframes floaty { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        .float { animation: floaty 2.6s ease-in-out infinite; }
        @keyframes shine { 0% { transform: translateX(-100%) } 100% { transform: translateX(220%) } }
        .shine { position: relative; overflow: hidden; }
        .shine::after {
          content: ''; position: absolute; inset: 0; width: 40%;
          background: linear-gradient(115deg, transparent, rgba(255,255,255,0.55), transparent);
          animation: shine 2.8s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-5">

        {/* ── PROFILE HERO CARD ── */}
        <div className="relative rounded-[1.75rem] overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500" />
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }} />

          <div className="relative p-6 pt-7">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-[68px] h-[68px] rounded-[1.25rem] bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-extrabold shadow-[0_8px_24px_rgba(0,0,0,0.15)] ring-2 ring-white/30 flex-shrink-0 overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  user?.name?.charAt(0)
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="font-display text-[22px] font-extrabold text-white leading-tight truncate">
                  {user?.name?.split(" ")[0]}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest ring-1 ring-white/10">
                    Kelas {user?.student_class?.name || "-"}
                  </span>
                  <Sparkles size={12} className="text-amber-300 float" fill="currentColor" />
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* ── MENU SECTION ── */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-2 mb-3">
            Pengaturan Akun
          </p>

          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`rounded-[1.75rem] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] overflow-hidden cursor-pointer active:scale-[0.97] transition-all group hover:shadow-[0_8px_20px_rgba(99,102,241,0.1)] ${
                  item.isComingSoon ? "opacity-50 grayscale-[0.5]" : ""
                }`}
                onClick={() => !item.isComingSoon && navigate(item.path)}
              >
                <div className="h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                  style={{ 
                    backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                    // Inline the gradient since we can't use dynamic Tailwind
                  }}
                />
                {/* Use the item's gradient as a left accent instead */}
                <div className={`h-1 bg-gradient-to-r ${item.grad} opacity-60`} />

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.light} transition-transform group-hover:scale-110`}>
                      <Icon className={item.iconColor} size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-extrabold text-slate-800 tracking-tight">
                          {item.title}
                        </p>
                        {item.badge && (
                          <span className="text-[8px] bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-2 py-0.5 rounded-full font-extrabold shadow-sm">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        {item.isComingSoon ? "Segera Hadir! ✨" : item.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── LOGOUT SECTION ── */}
        <div className="space-y-2.5 pt-2">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-2 mb-3">
            Sesi Akhir
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div className="rounded-[1.75rem] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] overflow-hidden cursor-pointer active:scale-[0.97] transition-all group hover:shadow-[0_8px_20px_rgba(251,113,133,0.1)]">
                <div className="h-1 bg-gradient-to-r from-rose-400 to-orange-400 opacity-60" />

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-50 text-rose-500 transition-transform group-hover:scale-110">
                      <LogOut size={22} />
                    </div>
                    <div>
                      <p className="text-[13px] font-extrabold text-rose-500 tracking-tight">
                        Keluar Game
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        Selesai beraksi hari ini
                      </p>
                    </div>
                  </div>
                  <div className="bg-rose-50 p-2 rounded-xl text-rose-300 group-hover:bg-rose-100 group-hover:text-rose-400 transition-colors">
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </AlertDialogTrigger>

            <AlertDialogContent className="w-[90%] rounded-[2rem] border-none p-8 shadow-2xl overflow-hidden">
              {/* Gradient strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 via-orange-400 to-rose-400" />

              <AlertDialogHeader className="items-center pt-2">
                <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-orange-400 text-white rounded-[2rem] flex items-center justify-center mb-4 shadow-[0_8px_24px_rgba(251,113,133,0.3)] rotate-3">
                  <LogOut size={36} />
                </div>
                <AlertDialogTitle className="font-display text-2xl font-extrabold text-slate-800 tracking-tight">
                  Istirahat Dulu?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center text-xs font-medium text-slate-500 leading-relaxed px-2">
                  Aksi kamu hari ini sudah luar biasa! Pastikan semua progres belajarmu sudah tersimpan ya.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter className="flex flex-col gap-3 mt-8">
                <AlertDialogAction
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 rounded-2xl h-14 font-extrabold shadow-[0_8px_24px_rgba(251,113,133,0.3)] text-white order-1 border-none text-sm transition-all active:scale-[0.98]"
                >
                  YA, KELUAR SEKARANG
                </AlertDialogAction>
                <AlertDialogCancel className="w-full rounded-2xl h-14 border-none bg-slate-100 text-slate-500 font-extrabold text-xs hover:bg-slate-200 order-2 transition-all active:scale-[0.98]">
                  LANJUTKAN AKSI 🚀
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* ── APP INFO ── */}

        {/* ── FOOTER ── */}
        <div className="text-center pt-6 pb-4">
          <p className="text-[9px] text-slate-400 font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2">
            <Heart size={10} className="text-rose-400" fill="currentColor" fillOpacity={0.3} />
            Tapamajuma © 2026
          </p>
        </div>
      </div>
    </div>
  );
}