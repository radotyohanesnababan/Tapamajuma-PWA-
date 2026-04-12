/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { 
  ChevronLeft, Timer, HelpCircle, Play, Rocket, 
  GraduationCap, Dumbbell, BarChart2, User, Sparkles 
} from "lucide-react";
import api from "@/lib/axios";
import { Link } from 'react-router-dom';
import { toast } from "sonner";

import LiteracyChallengeCard, { LITERACY_CONFIG } from "@/components/challenge/LiteracyChallengeCard";
import NumeracyChallengeCard, { NUMERACY_CONFIG } from "@/components/challenge/NumeracyChallengeCard";
import TKAChallengeCard, { TKA_CONFIG } from "@/components/challenge/TKAChallengeCard";
import OffDayPage from "./OffDayPage";

// Mapping Konfigurasi Aktivitas
const ACTIVITY_CONFIGS = {
  tka: TKA_CONFIG,
  numeracy: NUMERACY_CONFIG,
  literacy: LITERACY_CONFIG
};

const colorStyles = {
  indigo: {
    badge: "bg-indigo-100 text-indigo-600",
    title: "text-indigo-950",
    border: "border-indigo-100"
  },
  orange: {
    badge: "bg-orange-100 text-orange-600",
    title: "text-orange-950",
    border: "border-orange-100"
  },
  blue: {
    badge: "bg-blue-100 text-blue-600",
    title: "text-blue-950",
    border: "border-blue-100"
  }
};

export default function ChallengeForm() {
  const [todayActivity, setTodayActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false); 
  const [checkingStatus, setCheckingStatus] = useState(true); 
  const [isPlaying, setIsPlaying] = useState(false); // State untuk trigger game (TKA/Numerasi)

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

  // Fungsi dinamis saat tombol utama ditekan
const handleActionTrigger = () => {
  // Semua aktivitas (TKA, Lit, Num) sekarang langsung trigger isPlaying
  setIsPlaying(true);
};

 const currentUI = ACTIVITY_CONFIGS[todayActivity] || ACTIVITY_CONFIGS.tka;

const styles = colorStyles[currentUI.themeColor] || colorStyles.indigo;

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

  if (checkingStatus) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (todayActivity === 'off') return <OffDayPage />;

 

  return (
    <div className={`min-h-screen bg-[#F9F9FF] pb-28 font-sans ${isPlaying ? 'overflow-hidden' : ''}`}>

      <main className="px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <section className="mt-4">
          <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase mb-1">TAPAMAJUMA LEARNING</p>
          <h2 className="text-4xl font-black text-indigo-950 leading-tight">
            {currentUI.title} <br />
          </h2>
        </section>

        {/* Info Card - Data diambil dari currentUI (Config masing-masing card) */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative">
                <span className={`${styles.badge} text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest`}>
              Kegiatan Hari Ini
            </span>
            
            {/* Judul Dinamis */}
            <h3 className={`text-3xl font-bold ${styles.title} mt-4 mb-3`}>
              {currentUI.title}
            </h3>
            
            <p className="text-slate-500 leading-relaxed text-sm">
              {currentUI.desc}
            </p>
          
        </div>

        {/* Stats Grid */}
        <div className="flex gap-4">
          <StatBox icon={Timer} label="Waktu Pengerjaan" value={currentUI.time} color="indigo" />
          <StatBox icon={HelpCircle} label="Total Pertanyaan" value={currentUI.items} color="pink" />
        </div>

        {/* Activity Container */}
        <div className="space-y-6">
          {isCompleted ? (
             <SuccessState />
          ) : (
            <>
              {/* Render Kartu Spesifik secara invisible/logic-only jika TKA */}
              {todayActivity === "tka" && (
                <TKAChallengeCard isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
              )}
              {todayActivity === "numeracy" && (
                <NumeracyChallengeCard isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
              )}
              {todayActivity === "literacy" && (
                <LiteracyChallengeCard isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
              )}

              {/* Dynamic Start Button */}
              <button 
                onClick={handleActionTrigger}
                disabled={loading}
                className="w-full bg-indigo-600 text-white rounded-[2rem] p-2 flex items-center group shadow-xl relative overflow-hidden"
              >
                <div className="bg-white/20 p-5 rounded-full mr-4 transition-transform group-hover:scale-110">
                  <Play fill="white" size={24} />
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold">
                    {/* SEKARANG DINAMIS MENGGUNAKAN currentUI */}
                    {loading ? "Menyimpan..." : (currentUI.buttonLabel || "Mulai Latihan")}
                  </p>
                  <p className="text-indigo-100 text-xs">Start Practice Session</p>
                </div>
                <Rocket className="absolute right-6 opacity-20" size={40} />
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Sub-components untuk kerapihan
const StatBox = ({ icon: Icon, label, value, color }) => (
  <div className={`bg-${color}-50/50 p-5 rounded-[2rem] flex flex-col gap-2 w-full`}>
    <div className={`p-2 bg-${color}-600 text-white rounded-xl w-fit`}><Icon size={18} /></div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-xl font-bold text-indigo-950">{value}</p>
  </div>
);

const SuccessState = () => (
  <div className="bg-emerald-100/50 border-2 border-dashed border-emerald-200 p-10 rounded-[2.5rem] text-center">
    <Sparkles size={40} className="text-emerald-500 mx-auto mb-4" />
    <h2 className="text-xl font-bold text-slate-800">Misi Selesai!</h2>
    <Link to="/student" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm mt-4">Kembali</Link>
  </div>
);