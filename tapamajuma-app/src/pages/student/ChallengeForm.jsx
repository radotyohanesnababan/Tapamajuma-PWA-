/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  ChevronLeft, Timer, HelpCircle, Play, Rocket,
  GraduationCap, Dumbbell, BarChart2, User, Sparkles,
  Flame, Trophy, Zap, Star, CircleDot, CheckCircle2,
  ArrowLeft, Clock, ListChecks, Shield, Swords, BookOpen
} from "lucide-react";
import api from "@/lib/axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import LiteracyChallengeCard, { LITERACY_CONFIG } from "@/components/challenge/LiteracyChallengeCard";
import NumeracyChallengeCard, { NUMERACY_CONFIG } from "@/components/challenge/NumeracyChallengeCard";
import TKAChallengeCard, { TKA_CONFIG } from "@/components/challenge/TKAChallengeCard";
import OffDayPage from "./OffDayPage";

const ACTIVITY_CONFIGS = {
  tka: TKA_CONFIG,
  numeracy: NUMERACY_CONFIG,
  literacy: LITERACY_CONFIG
};

const themeStyles = {
  indigo: {
    badge: "bg-indigo-100 text-indigo-600",
    gradient: "from-indigo-500 to-violet-500",
    shadow: "shadow-[0_8px_24px_rgba(99,102,241,0.3)]",
    light: "bg-indigo-50",
    ring: "ring-indigo-200",
    text: "text-indigo-600",
    iconBg: "bg-indigo-500",
    dot: "bg-indigo-400",
  },
  orange: {
    badge: "bg-orange-100 text-orange-600",
    gradient: "from-orange-500 to-rose-500",
    shadow: "shadow-[0_8px_24px_rgba(249,115,22,0.3)]",
    light: "bg-orange-50",
    ring: "ring-orange-200",
    text: "text-orange-600",
    iconBg: "bg-orange-500",
    dot: "bg-orange-400",
  },
  blue: {
    badge: "bg-sky-100 text-sky-600",
    gradient: "from-sky-500 to-cyan-500",
    shadow: "shadow-[0_8px_24px_rgba(14,165,233,0.3)]",
    light: "bg-sky-50",
    ring: "ring-sky-200",
    text: "text-sky-600",
    iconBg: "bg-sky-500",
    dot: "bg-sky-400",
  }
};

export default function ChallengeForm() {
  const [todayActivity, setTodayActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const [formData, setFormData] = useState({
    subject: "",
    journal: "",
    confidence_level: 3
  });

  useEffect(() => {
    const today = new Date().getDay();
    if (today === 1 || today === 2) setTodayActivity("literacy");
    else if (today === 3 || today === 4 || today === 5) setTodayActivity("numeracy");
    else if (today === 6) setTodayActivity("tka");
    else setTodayActivity("off");

    const checkStatus = async () => {
      try {
        const response = await api.get("/api/activities/today-status");
        if (response.data.already_submitted) setIsCompleted(true);
      } catch (err) {
        console.error("Gagal cek status:", err);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkStatus();
  }, []);

  const handleActionTrigger = () => {
    setIsPlaying(true);
  };

  const currentUI = ACTIVITY_CONFIGS[todayActivity] || ACTIVITY_CONFIGS.tka;
  const styles = themeStyles[currentUI.themeColor] || themeStyles.indigo;

  // Peta ikon per tipe aktivitas
  const activityIcons = {
    tka: Swords,
    numeracy: Dumbbell,
    literacy: BookOpen,
  };
  const ActivityIcon = activityIcons[todayActivity] || Zap;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.subject || !formData.journal) {
      toast.error("Mohon lengkapi semua data.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/activities", { ...formData, type: todayActivity });
      toast.success("Aktivitas berhasil dicatat!");
      setIsCompleted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-[#f6f5fb] flex items-center justify-center">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&display=swap');
          .font-display { font-family: 'Baloo 2', system-ui, sans-serif; }
          @keyframes floaty { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
          .float { animation: floaty 2.6s ease-in-out infinite; }
        `}</style>
        <div className="flex flex-col items-center gap-4">
          <Rocket className="text-indigo-500 float" size={48} />
          <p className="font-display font-extrabold text-slate-600 animate-pulse">Menyiapkan misi hari ini...</p>
        </div>
      </div>
    );
  }

  if (todayActivity === "off") return <OffDayPage />;

  return (
    <div className={`min-h-screen bg-[#f6f5fb] pb-28 ${isPlaying ? "overflow-hidden" : ""}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Inter:wght@400;/500;600;700;800&display=swap');
        .font-display { font-family: 'Baloo 2', system-ui, sans-serif; }
        @keyframes floaty { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        .float { animation: floaty 2.6s ease-in-out infinite; }
        @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 1 } 100% { transform: scale(1.8); opacity: 0 } }
        .pulse-ring::before {
          content: ''; position: absolute; inset: -4px; border-radius: 50%;
          border: 2px solid currentColor; animation: pulse-ring 1.8s ease-out infinite;
        }
        @keyframes shine { 0% { transform: translateX(-100%) } 100% { transform: translateX(220%) } }
        .shine { position: relative; overflow: hidden; }
        .shine::after {
          content: ''; position: absolute; inset: 0; width: 40%;
          background: linear-gradient(115deg, transparent, rgba(255,255,255,0.55), transparent);
          animation: shine 2.8s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ── HEADER ── */}
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-slate-400">
              TAPAMAJUMA LEARNING
            </p>
            <h2 className="font-display text-[28px] font-extrabold text-slate-800 leading-tight">
              {currentUI.title}
            </h2>
          </div>
          <div className={`flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-full text-white text-[10px] font-extrabold w-fit bg-gradient-to-r ${styles.gradient} shadow-md mt-1`}>
            <ActivityIcon size={13} />
            HARI INI
          </div>
        </div>

        {/* ── MISSION CARD ── */}
        <div className="relative rounded-[1.75rem] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.05)] overflow-hidden">
          {/* Gradient accent strip at top */}
          <div className={`h-1.5 bg-gradient-to-r ${styles.gradient}`} />

          <div className="p-6 pt-5">
            <span className={`${styles.badge} text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest`}>
              Kegiatan Hari Ini
            </span>

            <h3 className={`font-display text-2xl font-extrabold mt-4 mb-2 ${styles.text}`}>
              {currentUI.title}
            </h3>

            <p className="text-slate-500 leading-relaxed text-[13px] font-medium">
              {currentUI.desc}
            </p>

            {/* Mini stats inline */}
            <div className="flex gap-4 mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${styles.iconBg} text-white`}>
                  <Clock size={14} />
                </div>
                <div>
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Waktu</p>
                  <p className="text-sm font-extrabold text-slate-700">{currentUI.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${styles.iconBg} text-white`}>
                  <ListChecks size={14} />
                </div>
                <div>
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Soal</p>
                  <p className="text-sm font-extrabold text-slate-700">{currentUI.items}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ACTIVITY CONTENT ── */}
        <div className="space-y-5">
          {isCompleted ? (
            <SuccessState styles={styles} />
          ) : (
            <>
              {/* Challenge Cards */}
              {todayActivity === "tka" && (
                <TKAChallengeCard isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
              )}
              {todayActivity === "numeracy" && (
                <NumeracyChallengeCard isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
              )}
              {todayActivity === "literacy" && (
                <LiteracyChallengeCard isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
              )}

              {/* ── ACTION BUTTON ── */}
              <button
                onClick={handleActionTrigger}
                disabled={loading}
                className={`w-full rounded-[1.75rem] p-3 flex items-center group relative overflow-hidden text-white ${styles.shadow} bg-gradient-to-r ${styles.gradient} transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {/* Play icon circle */}
                <div className="bg-white/20 p-4 rounded-full mr-4 transition-transform group-hover:scale-110 flex-shrink-0">
                  <Play fill="white" size={22} />
                </div>

                <div className="text-left flex-1">
                  <p className="font-display text-xl font-extrabold leading-tight">
                    {loading ? "Menyimpan..." : currentUI.buttonLabel || "Mulai Latihan"}
                  </p>
                  <p className="text-white/70 text-[11px] font-semibold mt-0.5">
                    Start Practice Session
                  </p>
                </div>

                <Rocket
                  className="absolute right-5 opacity-15 -rotate-12"
                  size={44}
                />

                {/* Shine sweep */}
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="absolute inset-y-0 -left-full w-1/3"
                    style={{
                      background: "linear-gradient(115deg, transparent, rgba(255,255,255,0.2), transparent)",
                      animation: "shine 3s ease-in-out infinite",
                    }}
                  />
                </div>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

/* ── SUCCESS STATE ── */
const SuccessState = ({ styles }) => (
  <div className="rounded-[1.75rem] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.05)] p-8 relative overflow-hidden text-center">
    {/* Confetti-like dots */}
    <div className="absolute top-4 left-6 w-2 h-2 bg-emerald-400 rounded-full opacity-60" />
    <div className="absolute top-8 right-10 w-1.5 h-1.5 bg-amber-400 rounded-full opacity-50" />
    <div className="absolute bottom-6 left-12 w-1 h-1 bg-indigo-400 rounded-full opacity-40" />
    <div className="absolute top-12 left-1/2 w-2.5 h-2.5 bg-rose-400 rounded-full opacity-30" />

    <div className="relative z-10">
      <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white mb-5 rotate-3 shadow-[0_8px_20px_rgba(52,211,153,0.35)]">
        <CheckCircle2 size={32} fill="currentColor" fillOpacity={0.2} />
      </div>

      <h2 className="font-display text-2xl font-extrabold text-slate-800 mb-2">
        Misi Selesai! 🎉
      </h2>
      <p className="text-slate-500 text-sm font-medium mb-6">
        Kerja bagus hari ini. Istirahat sebentar, lanjut lagi besok!
      </p>

      <Link
        to="/student"
        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-md"
      >
        <ArrowLeft size={16} />
        Kembali ke Dashboard
      </Link>
    </div>
  </div>
);