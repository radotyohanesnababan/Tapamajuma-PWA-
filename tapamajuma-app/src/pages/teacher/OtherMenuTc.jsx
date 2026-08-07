import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, LogOut, ChevronRight, Settings,
  ShieldCheck, LayoutGrid, KeyRound, LogOutIcon
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

const MENUS = [
  {
    title: "Profil Saya",
    subtitle: "Kelola data diri dan identitas",
    icon: User,
    path: "/edit-profile",
    accent: "text-slate-600",
    accentBg: "bg-slate-50",
    accentBorder: "border-slate-200",
    dot: "bg-slate-400",
  },
];

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
  

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* ═══ PROFILE CARD ═══ */}
        <div className="relative rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold ring-1 ring-white/20 flex-shrink-0 overflow-hidden">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    className="w-full h-full object-cover"
                    alt="Avatar"
                  />
                ) : (
                  user?.name?.charAt(0)
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-white leading-tight truncate">
                  {user?.name}
                </h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="bg-white/15 backdrop-blur-sm text-white/80 px-2.5 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wider ring-1 ring-white/10">
                    {user?.role || "teacher"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ MENU LIST ═══ */}
        <div className="space-y-2">
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider ml-1">
            Pengaturan Akun
          </p>

          {MENUS.map((menu) => {
            const Icon = menu.icon;
            return (
              <div
                key={menu.title}
                onClick={() => navigate(menu.path)}
                className="rounded-lg bg-white border border-slate-200 overflow-hidden cursor-pointer transition hover:border-slate-300 active:scale-[0.99] group"
              >
                <div className={`h-0.5 ${menu.dot} opacity-40`} />

                <div className="p-4 flex items-start gap-3.5">
                      <div className={`w-10 h-10 rounded-lg ${menu.accentBorder} ${menu.accentBg} ${menu.accent} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13px] font-semibold text-slate-800 leading-tight">
                        {menu.title}
                      </h3>
                      <div className={`w-1.5 h-1.5 rounded-full ${menu.dot} flex-shrink-0`} />
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                      {menu.subtitle}
                    </p>
                  </div>

                  <ChevronRight
                    size={16}
                    className="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0 mt-1"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══ LOGOUT ═══ */}
        <div className="space-y-2">
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider ml-1">
            Sesi
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div className="rounded-lg bg-white border border-slate-200 overflow-hidden cursor-pointer transition hover:border-slate-300 active:scale-[0.99] group">
                <div className="h-0.5 bg-rose-400 opacity-40" />

                <div className="p-4 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                    <LogOut size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-semibold text-rose-600 leading-tight">
                      Keluar Akun
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">
                      Selesaikan sesi pengajaran
                    </p>
                  </div>

                  <ChevronRight
                    size={16}
                    className="text-slate-300 group-hover:text-rose-400 transition-colors flex-shrink-0 mt-1"
                  />
                </div>
              </div>
            </AlertDialogTrigger>

            <AlertDialogContent className="w-[90%] rounded-xl border-slate-200 p-6">
              <AlertDialogHeader className="items-center">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-3">
                  <LogOut size={24} />
                </div>
                <AlertDialogTitle className="text-sm font-semibold text-slate-800">
                  Selesaikan Sesi?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center text-[11px] font-medium text-slate-500 leading-relaxed">
                  Pastikan semua data progres siswa sudah tersimpan sebelum keluar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col gap-2 mt-6">
                <AlertDialogCancel className="w-full h-10 rounded-lg border-slate-200 text-slate-600 text-[11px] font-semibold">
                  Batal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="w-full h-10 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold border-none"
                >
                  Ya, Keluar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* ═══ APP INFO ═══ */}
        <div className="rounded-lg bg-white border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-white flex-shrink-0">
            <LayoutGrid size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-slate-700">Tapamajuma PWA</p>
            <p className="text-[9px] text-slate-400 font-medium">v2.0 · Mission Control</p>
          </div>
          <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0" />
        </div>

        {/* ═══ FOOTER ═══ */}
        <p className="text-[8px] text-slate-400 text-center font-medium pt-4 uppercase tracking-wider">
          Tapamajuma © 2026
        </p>
      </div>
    </div>
  );
}
