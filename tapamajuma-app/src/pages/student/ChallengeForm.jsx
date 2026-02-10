import { useState, useEffect } from "react";
import { Send, BookOpen, Calculator, Sparkles } from "lucide-react";
import api from "@/lib/axios";

// Import kartu kustom kamu
import LiteracyChallengeCard from "@/components/challenge/LiteracyChallengeCard";
import NumeracyChallengeCard from "@/components/challenge/NumeracyChallengeCard";
import { toast } from "sonner";

// 1. Definisikan HeaderSection di sini agar tidak hilang
const HeaderSection = ({ activity }) => {
  const content = {
    literacy: { 
      title: "Selasa Literasi", 
      desc: "Pembiasaan membaca & bercerita (Semua Mapel)", 
      color: "bg-indigo-600", 
      icon: <BookOpen size={28} /> 
    },
    numeracy: { 
      title: "Rabu Numerasi", 
      desc: "Pembiasaan berhitung & logika", 
      color: "bg-amber-500", 
      icon: <Calculator size={28} /> 
    },
    practice: { 
      title: "Latihan Mandiri", 
      desc: "Asah terus kemampuan literasi dan numerasimu", 
      color: "bg-slate-700", 
      icon: <Sparkles size={28} /> 
    }
  };

  const active = content[activity] || content.practice;

  return (
    <div className={`${active.color} p-6 rounded-3xl text-white shadow-lg transition-all duration-500`}>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">TAPAMAJUMA Digital</p>
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
  const [formData, setFormData] = useState({
    subject: "",
    journal: "",
    confidence_level: 3
  });

  useEffect(() => {
    // Deteksi hari otomatis (0=Minggu, 2=Selasa, 3=Rabu)
    const today = new Date().getDay();
    if (today === 5 || today === 4) setTodayActivity("literacy"); 
    else if (today === 2 || today === 3 ) setTodayActivity("numeracy");
    else setTodayActivity("practice");
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();

  // VALIDASI MANUAL SEBELUM KIRIM
  if (!formData.subject || !formData.journal) {
    toast.error("Mohon lengkapi semua data sebelum menyimpan.");
    return;
  }

  setLoading(true);
  try {
    await api.post("/api/activities", { ...formData, type: todayActivity });
    toast.success("Aktivitas berhasil dicatat!");
    // Reset form setelah sukses
    setFormData({ subject: "", journal: "", confidence_level: 3, score: "", reading_content: "" });
  } catch (err) {
    console.error(err);
    toast.error("Gagal menyimpan. Periksa kembali isian Anda.");
  } finally {
    setLoading(false);
  }
};

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

    {/* === BAGIAN 2: LITERASI (BUTUH FORM) === */}
    {/* Literasi tetap butuh form karena tombol simpannya ada di bawah */}
    {todayActivity === "literacy" && (
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
  </div>
  );
}