import { useState, useEffect } from "react";
import { Send, BookOpen, Calculator, Sparkles, Coffee, Sun, ArrowLeft, BatteryCharging  } from "lucide-react";
import api from "@/lib/axios";
import { Link } from 'react-router-dom';

// Import kartu kustom kamu
import LiteracyChallengeCard from "@/components/challenge/LiteracyChallengeCard";
import NumeracyChallengeCard from "@/components/challenge/NumeracyChallengeCard";
import { toast } from "sonner";
import TKAChallengeCard from "@/components/challenge/TKAChallengeCard";
import OffDayPage from "./OffDayPage";



// 1. Definisikan HeaderSection di sini agar tidak hilang
const HeaderSection = ({ activity }) => {
  const content = {
    literacy: { 
      title: "Hari Literasi", 
      desc: "Pembiasaan membaca & bercerita (Semua Mapel)", 
      color: "bg-indigo-600", 
      icon: <BookOpen size={28} /> 
    },
    numeracy: { 
      title: "Hari Numerasi", 
      desc: "Pembiasaan berhitung & logika", 
      color: "bg-amber-500", 
      icon: <Calculator size={28} /> 
    },
    practice: { 
      title: "TKA Mandiri", 
      desc: "Soal soal HOTS untuk latihan mandiri", 
      color: "bg-purple-700", 
      icon: <Sparkles size={28} /> 
    }
  };

  const active = content[activity] || content.practice;

  return (
    <div className={`${active.color} p-6 rounded-3xl text-white shadow-lg transition-all duration-500`}>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-white/70 text-[10px] font-black tracking-widest">TAPAMAJUMA Learning</p>
          <h1 className="text-2xl font-bold">{active.title}</h1>
          <p className="text-sm text-white/90">{active.desc}</p>
        </div>
        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
          {active.icon}
        </div>
      </div>
    </div>
  );
};

export default function ChallengeForm() {
 const [todayActivity, setTodayActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false); // State baru
  const [checkingStatus, setCheckingStatus] = useState(true); // State loading awal
  
  const [formData, setFormData] = useState({
    subject: "",
    journal: "",
    confidence_level: 3
  });

  useEffect(() => {
    // 1. Deteksi hari (logika lama kamu)
    const today = new Date().getDay();
    if (today === 1 || today === 2) setTodayActivity("literacy"); 
    else if (today === 3 || today === 4 || today === 5) setTodayActivity("numeracy");
    else if (today === 6) setTodayActivity("tka");
    else setTodayActivity("off");

    //setTodayActivity("off");
    // 2. CEK STATUS KE BACKEND
    const checkStatus = async () => {
      try {
        const response = await api.get("/api/activities/today-status");
        if (response.data.already_submitted) {
          setIsCompleted(true);
        }
      } catch (err) {
        console.error("Gagal cek status:", err);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.journal) {
      toast.error("Mohon lengkapi semua data.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/activities", { ...formData, type: todayActivity });
      toast.success("Aktivitas berhasil dicatat!");
      setIsCompleted(true); // <--- LANGSUNG KUNCI SETELAH BERHASIL
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIKA RENDERING ---

  // 1. Jika sedang mengecek ke server
  if (checkingStatus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
         <p className="mt-4 text-slate-500 font-medium">Memeriksa status harian...</p>
      </div>
    );
  }

  // 2. Jika hari libur (Minggu)
  if (todayActivity === 'off') {
    return <OffDayPage />; 
  }

  // 3. JIKA SUDAH MENGERJAKAN (Tampilan Sukses)
  if (isCompleted) {
    return (
      <div className="p-6 space-y-6 max-w-2xl mx-auto animate-in fade-in zoom-in duration-500">
        <HeaderSection activity={todayActivity} />
        <div className="bg-white border-2 border-dashed border-slate-200 p-10 rounded-[2.5rem] text-center">
          <div className="w-20 h-20 bg-emerald-100 text-sky-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <Sparkles size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Misi Selesai!</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Kamu sudah menyelesaikan tantangan <b className="uppercase">{todayActivity}</b> untuk hari ini. <br/>
            Istirahat sejenak, dan siap-siap untuk tantangan seru berikutnya di esok hari!
          </p>
          <Link 
            to="/student" 
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
          >
            <ArrowLeft size={18} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // 4. JIKA BELUM MENGERJAKAN (Tampilkan Form Normal)

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
    <HeaderSection activity={todayActivity} />
    
    {/* === BAGIAN 1: NUMERASI (MANDIRI) === */}
    {/* Kita taruh di LUAR <form> agar tombolnya tidak bentrok */}
    {todayActivity === "numeracy" && (
       <div className="transition-all duration-500">
          {/* Numeracy menangani submit-nya sendiri di dalam MathGame */}
          <NumeracyChallengeCard formData={formData} setFormData={setFormData} />
       </div>
    )}

    {/* === BAGIAN 2: LITERASI-SOALGURU (MANDIRI) === */}
    {/* Kita taruh di LUAR <form> agar tombolnya tidak bentrok */}
    {todayActivity === "literacy" && (
       <div className="transition-all duration-500">
          {/* Numeracy menangani submit-nya sendiri di dalam MathGame */}
          <LiteracyChallengeCard formData={formData} setFormData={setFormData} />
       </div>
    )}

    
    {/* Literasi tetap butuh form karena tombol simpannya ada di bawah */}
    {todayActivity === "literacyforai" && (
      <form onSubmit={handleSubmit} className="space-y-6 transition-all duration-500">
        
        <LiteracyChallengeCard formData={formData} setFormData={setFormData} />

        {/* Input Refleksi & Tombol Simpan (Hanya untuk Literasi) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Refleksi Keyakinan Belajar
            </label>
            <span className="text-xl font-bold text-indigo-600">{formData.confidence_level}</span>
          </div>
          <input 
            type="range" min="1" max="5" 
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            value={formData.confidence_level}
            onChange={(e) => setFormData({...formData, confidence_level: e.target.value})}
          />
          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-slate-900 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
          >
            {loading ? "Menyimpan..." : (
              <>
                <Send size={20} />
                Simpan Progres Digital
              </>
            )}
          </button>
        </div>
      </form>
    )}

    {/* === BAGIAN 1: TKA === */}
    {/* Kita taruh di LUAR <form> agar tombolnya tidak bentrok */}
    {todayActivity === "tka" && (
       <div className="transition-all duration-500">
          {/* Numeracy menangani submit-nya sendiri di dalam MathGame */}
          <TKAChallengeCard formData={formData} setFormData={setFormData} />
       </div>
    )}


  </div>
  );
}