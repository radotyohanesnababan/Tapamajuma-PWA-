/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import { getStorageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Trophy, Timer, Brain, CheckCircle2, Calculator, 
  Send, Loader2, ArrowRight, BookOpen, 
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";




// ================= THEME CONFIGURATION =================
const GAME_MODES = {
  numeracy: {
    title: "Numerasi",
    subtitle: "Latihan logika dan hitungan dasar hari ini.",
    icon: Calculator,
    timePerQuestion: 20,
    colors: {
      text: "text-amber-500",
      bgMain: "bg-amber-500",
      bgHover: "hover:bg-amber-50",
      borderHover: "hover:border-amber-500",
      textGroupHover: "group-hover:text-amber-600",
      bgIconHover: "group-hover:bg-amber-200",
      iconGroupHover: "group-hover:text-amber-700",
    }
  },
  tka: {
    title: "TKA Mandiri",
    subtitle: "Uji nalar dan kemampuan akademik tingkat tinggi.",
    icon: Brain,
    timePerQuestion: 60,
    colors: {
      text: "text-purple-500",
      bgMain: "bg-purple-500",
      bgHover: "hover:bg-purple-50",
      borderHover: "hover:border-purple-500",
      textGroupHover: "group-hover:text-purple-600",
      bgIconHover: "group-hover:bg-purple-200",
      iconGroupHover: "group-hover:text-purple-700",
    }
  },
  literacy: {
    title: "Literasi",
    subtitle: "Latihan pemahaman teks dan literatur lintas mapel.",
    icon: BookOpen,
    timePerQuestion: 45,
    colors: {
      text: "text-blue-500",
      bgMain: "bg-blue-500",
      bgHover: "hover:bg-blue-50",
      borderHover: "hover:border-blue-500",
      textGroupHover: "group-hover:text-blue-600",
      bgIconHover: "group-hover:bg-blue-200",
      iconGroupHover: "group-hover:text-blue-700",
    }
  }
};

// ================= FUNGSI PENJADWALAN HARI =================
const getTodayMode = () => {
  const day = new Date().getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  
  if (day === 1 || day === 2 ) return "literacy"; // 1=Senin, 2=Selasa
  if (day === 3 ||day === 4 || day === 5) return "numeracy";   // 3=Rabu, 4=Kamis, 5=Jumat
  return "tka";                                  // 0=Minggu, 6=Sabtu
};

// ================= MAIN COMPONENT =================
export default function QuizEngine() {
  const navigate = useNavigate();
  const {refreshUser} = useAuth();
  
  // Otomatis tentukan mode dari hari ini
  const [mode] = useState(getTodayMode());
  const activeTheme = GAME_MODES[mode];
  
  // Ambil nama hari untuk ditampilkan di UI
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const currentDayName = dayNames[new Date().getDay()];
  const ActiveIcon = activeTheme.icon;

  // --- STATE ---
  
  const [gameState, setGameState] = useState("menu");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [finalScore, setFinalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(activeTheme.timePerQuestion);
  const [confidence, setConfidence] = useState(3);
  const [journal, setJournal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  // --- 1. LOAD MAPEL (MENU AWAL) ---
  useEffect(() => {
    api.get('/api/admin/subjects')
      .then(res => setSubjects(res.data))
      .catch(() => toast.error("Gagal memuat mapel"));
  }, []);

  // --- 2. START GAME (LOAD SOAL) ---
  const startGame = async (subject) => {
    setIsSubmitting(true);
    try {
      const res = await api.get(`/api/quiz/questions?subject_id=${subject.id}&type=${mode}`);
      setQuestions(res.data);
      setSelectedSubject(subject);
      setGameState("playing");
      setCurrentIndex(0);
      setAnswers({});
      setTimeLeft(activeTheme.timePerQuestion);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.warning(`Belum ada soal ${activeTheme.title} untuk mapel ini.`);
      } else {
        toast.error("Gagal memuat soal.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. GAME LOGIC ---
  const handleAnswer = useCallback((optionKey) => {
    const currentQ = questions[currentIndex];
    
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionKey 
    }));

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(activeTheme.timePerQuestion); 
    } else {
      setGameState("calculating");
    }
  }, [currentIndex, questions, activeTheme.timePerQuestion]);

  useEffect(() => {
    let timer;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (gameState === "playing" && timeLeft === 0) {
      handleAnswer(null); 
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState, handleAnswer]);

  // --- 4. CALCULATE SCORE ---
  useEffect(() => {
    if (gameState === "calculating") {
      const submitQuiz = async () => {
        try {
          const payloadAnswer = Object.entries(answers).map(([qId, val]) => ({
            question_id: qId,
            selected_option: val
          }));

          const res = await api.post('/api/quiz/submit', {
            subject_id: selectedSubject.id,
            type: mode, 
            answers: payloadAnswer
          });

          setFinalScore(res.data.score);
          setGameState("reflection");
        } catch (error) {
          toast.error("Gagal menghitung nilai.");
          setGameState("menu");
        }
      };
      submitQuiz();
    }
  }, [gameState]);
  // Penyesuaian skor berdasarkan tingkat kepercayaan diri
  const adjustedScore = useMemo(() => {
  const multipliers = { 1: 0.8, 2: 0.8, 3: 1.0, 4: 1.2, 5: 1.5 };
  if (finalScore < 60) return Math.round(finalScore * 0.8);
  const multiplier = multipliers[confidence] ?? 1.0;
  return Math.round(finalScore * multiplier);
}, [finalScore, confidence]);

  // --- 5. FINAL SUBMIT (JURNAL) ---
  const submitReflection = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!journal.trim()) return toast.error("Isi jurnal dulu ya!");

    setIsSubmitting(true);
   try {
      await api.post("/api/activities", {
        type: mode,
        subject: selectedSubject.name,
        score: finalScore,
        confidence_level: confidence,
        journal: journal,
        reading_content: `Latihan Soal ${activeTheme.title} - ${selectedSubject.name}`
      });

      await refreshUser();

      toast.success("Latihan selesai! Hebat!");
      setIsRevealed(true);

      let countdown = 5;
      toast.loading(`Kamu akan dialihkan dalam ${countdown} detik...`, { id: "redirect-toast" });
      const interval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          toast.loading(`Kamu akan dialihkan dalam ${countdown} detik...`, { id: "redirect-toast" });
        } else {
          clearInterval(interval);
          toast.dismiss("redirect-toast");
          navigate("/");
        }
      }, 1000);
    } catch (error) {
      toast.error("Gagal menyimpan jurnal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= RENDER UI =================

  // 1. MENU: PILIH MAPEL
  if (gameState === "menu") {
    return (
<div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-start py-10">
        <div className="w-full max-w-md space-y-8 animate-in zoom-in duration-300">
          <div className="text-center space-y-2">
             <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-2 border border-slate-100">
               <ActiveIcon size={48} className={activeTheme.colors.text} />
             </div>
             <h1 className="text-3xl font-black text-slate-800">Mulai {activeTheme.title}</h1>
             <p className="text-slate-500">{activeTheme.subtitle}</p>
          </div>

          <div className="grid gap-3">
            {isSubmitting ? (
               <div className="text-center text-slate-400 py-10"><Loader2 className="animate-spin mx-auto h-8 w-8"/> Memuat data...</div>
            ) : subjects.length === 0 ? (
               <div className="text-center p-4 border-2 border-dashed rounded-xl text-slate-400">Tidak ada mapel tersedia.</div>
            ) : (
              subjects.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => startGame(sub)}
                  className={`w-full bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm transition-all flex justify-between items-center group text-left ${activeTheme.colors.borderHover} ${activeTheme.colors.bgHover}`}
                >
                  <div>
                    <span className={`block font-bold text-lg text-slate-700 transition-colors ${activeTheme.colors.textGroupHover}`}>{sub.name}</span>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Mulai Latihan</span>
                  </div>
                  <div className={`bg-slate-100 p-2 rounded-full transition-colors ${activeTheme.colors.bgIconHover}`}>
                    <ArrowRight className={`h-5 w-5 text-slate-400 ${activeTheme.colors.iconGroupHover}`}/>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. LOADING SCORE
  if (gameState === "calculating") {
    return (
      <div className="min-h-screen flex items-center justify-start py-6 bg-slate-900">
        <div className={`text-white text-center space-y-4 animate-pulse ${activeTheme.colors.text}`}>
           <ActiveIcon size={64} className="mx-auto"/>
           <h2 className="text-2xl font-bold text-white">Menghitung Skor...</h2>
        </div>
      </div>
    );
  }

  // 3. PLAYING: TAMPILAN KUIS ADAPTIF
  if (gameState === "playing" && questions.length > 0) {
    const currentQ = questions[currentIndex];
    
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex flex-col items-center justify-start py-6 overflow-y-auto">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
          
          {/* Top Bar (Timer & Progress) Dinamis warnanya */}
          <div className={`${activeTheme.colors.bgMain} p-5 text-white flex justify-between items-center`}>
            <div className="flex items-center gap-2">
              <Timer size={20} className={timeLeft < 10 ? "animate-pulse text-red-200" : ""} />
              <span className="font-mono text-xl font-bold">{timeLeft}s</span>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{selectedSubject?.name}</span>
               <span className="text-sm font-bold">Soal {currentIndex + 1} / {questions.length}</span>
            </div>
          </div>

          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="min-h-[120px] flex items-center justify-center">
               <h2 className="text-xl md:text-2xl font-bold text-slate-800 text-center leading-relaxed">
                 {currentQ.question_text}
               </h2>
            </div>
              {/* Jika soal memiliki gambar, tampilkan di bawah teks */}
            {currentQ.image && (
              <div className="w-full h-48 bg-slate-100 rounded-lg overflow-hidden">
                <img 
                  src={getStorageUrl(currentQ.image)} 
                  alt={currentQ.question_text} 
                  className="w-full h-full object-contain max-h-64"
                />
              </div>
            )}

            <div className="space-y-3">
              {Object.entries(currentQ.options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleAnswer(key)}
                  className={`w-full group relative overflow-hidden bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl transition-all duration-200 flex items-center gap-4 text-left active:scale-95 ${activeTheme.colors.borderHover} ${activeTheme.colors.bgHover}`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center font-bold text-slate-500 transition-colors group-hover:border-transparent group-hover:text-white ${activeTheme.colors.bgIconHover.replace('bg-', 'group-hover:bg-').replace('200', '500')}`}>
                    {key}
                  </div>
                  <span className="text-sm font-bold text-slate-700 w-full break-words">
                    {value}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4. REFLECTION: HASIL & JURNAL
  if (gameState === "reflection") {
    return (
      <div className={`min-h-screen p-6 flex flex-col items-center justify-start bg-slate-50 overflow-y-auto`}>
        <div className="w-full max-w-md space-y-6 animate-in slide-in-from-bottom-8 duration-500 mb-6">
                <div className="text-center space-y-2">
        <div className="inline-block p-4 bg-white rounded-full shadow-xl mb-2">
          <Trophy size={48} className={
            isRevealed 
              ? (adjustedScore >= 70 ? "text-yellow-500" : "text-slate-400") 
              : "text-slate-300"
          } />
        </div>
        <h1 className="text-2xl font-black text-slate-800">Selesai!</h1>

        {!isRevealed ? (
          /* HIDDEN STATE */
          <div className="space-y-1">
            <p className="text-slate-400 text-sm">Isi keyakinanmu dulu untuk reveal skor</p>
            <div className="text-7xl font-black tracking-tighter text-slate-200 select-none">?</div>
          </div>
        ) : (
          /* REVEALED STATE */
          <div className="space-y-1 animate-in zoom-in-75 duration-500">
                      <p className="text-slate-400 text-xs">Skor</p>
            <div className="text-2xl font-bold text-slate-400">{finalScore}</div>

            {/* XP */}
            <p className="text-slate-500 text-sm mt-2">XP Didapat</p>
            <div className={`text-6xl font-black tracking-tighter ${activeTheme.colors.text}`}>
              +{adjustedScore} XP
            </div>

            {/* Badge */}
            <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full 
              ${adjustedScore > finalScore ? 'bg-green-100 text-green-600' : 
                adjustedScore < finalScore ? 'bg-red-100 text-red-600' : 
                'bg-slate-100 text-slate-500'}`}>
              {adjustedScore > finalScore ? `+${adjustedScore - finalScore} bonus` :
              adjustedScore < finalScore ? `${adjustedScore - finalScore} penalti` :
              'Netral'}
            </div>
          </div>
        )}
      </div>

      {/* Slider & jurnal hanya tampil kalau belum reveal */}
      {!isRevealed && (
        <Card className="rounded-[32px] border-none shadow-xl bg-white">
          <CardContent className="p-6 space-y-8">
            {/* ... slider + textarea + button simpan ... */}
          </CardContent>
        </Card>
      )}

          <Card className="rounded-[32px] border-none shadow-xl bg-white">
            <CardContent className="p-6 space-y-8">
              
              <div className="space-y-4">
                <Label className="font-bold text-slate-700 flex justify-between">
                   <span>Tingkat Kepercayaan Diri</span>
                   <span className={activeTheme.colors.text}>{confidence}/5</span>
                </Label>
                <Slider value={[confidence]} max={5} min={1} step={1} onValueChange={(v) => setConfidence(v[0])} />
              </div>

              <div className="space-y-3">
                <Label className="font-bold text-slate-700">Jurnal Belajar</Label>
                <textarea 
                  className="w-full p-4 border-2 border-slate-50 rounded-2xl text-sm min-h-[100px] focus:border-slate-300 outline-none bg-slate-50 transition-all placeholder:text-slate-400"
                  placeholder="Soal mana yang paling menjebak? Kenapa?"
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)} 
                />
              </div>

              <Button 
                type="button"
                onClick={submitReflection} 
                disabled={isSubmitting || !journal}
                className={`w-full h-14 rounded-2xl font-bold text-lg shadow-lg transition-all ${activeTheme.colors.bgMain} hover:opacity-90 text-white`}
              >
                {isSubmitting ? "Menyimpan..." : (
                  <span className="flex items-center gap-2"><Send size={18}/> Simpan Hasil</span>
                )}
              </Button>

            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}