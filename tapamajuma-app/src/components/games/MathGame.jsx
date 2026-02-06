/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios"; 
import { toast } from "sonner";
import { Trophy, Timer, Brain, CheckCircle2, Calculator, Send, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MathGame() {
  const navigate = useNavigate();

  // --- STATE ---
  const [gameState, setGameState] = useState("menu"); // menu | playing | calculating | reflection
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  // Game Data
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { 12: 'A', 15: 'C' }
  const [finalScore, setFinalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20); // 20 detik per soal
  
  // Refleksi Data
  const [confidence, setConfidence] = useState(3);
  const [journal, setJournal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const res = await api.get(`/api/quiz/questions?subject_id=${subject.id}`);
      setQuestions(res.data);
      setSelectedSubject(subject);
      setGameState("playing");
      setCurrentIndex(0);
      setAnswers({});
      setTimeLeft(20);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.warning("Belum ada soal untuk kelasmu di mapel ini.");
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
    
    // Simpan jawaban
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionKey // Jika timeout, optionKey dikirim null/undefined
    }));

    // Pindah Soal / Selesai
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(20); // Reset timer
    } else {
      finishGame();
    }
  }, [currentIndex, questions]);

  // Timer Countdown
  useEffect(() => {
    let timer;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (gameState === "playing" && timeLeft === 0) {
      handleAnswer(null); // Waktu habis = Salah/Kosong
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState, handleAnswer]);

  // --- 4. FINISH & CALCULATE SCORE ---
  const finishGame = async () => {
    setGameState("calculating");
    
    // Siapkan payload jawaban
    // Kita ambil state 'answers' yang terbaru langsung dari parameter atau state
    // Note: Karena setState async, lebih aman kita construct payload saat render calculating atau pakai ref. 
    // Tapi untuk simplifikasi, kita asumsikan state sudah update terakhir di handleAnswer logic.
    
    // Karena handleAnswer memanggil finishGame, state answers mungkin belum ter-update sepenuhnya di siklus ini.
    // Trik: Kita kirim jawaban terakhir secara manual ke fungsi submit atau gunakan useEffect pada gameState.
  };

  // Effect khusus untuk submit saat masuk phase 'calculating'
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
            answers: payloadAnswer
          });

          setFinalScore(res.data.score); // Simpan skor dari server
          setGameState("reflection");    // Masuk ke layar refleksi
        } catch (error) {
          toast.error("Gagal menghitung nilai.");
          setGameState("menu");
        }
      };
      submitQuiz();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);


  // --- 5. FINAL SUBMIT (JURNAL) ---
  // Karena skor sudah disimpan di tahap sebelumnya (quiz_results), 
  // di sini kita simpan Jurnal ke daily_activities sebagai pelengkap laporan.
  const submitReflection = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!journal.trim()) return toast.error("Isi jurnal dulu ya!");

    setIsSubmitting(true);
    try {
      await api.post("/api/activities", {
        type: "numeracy",
        subject: selectedSubject.name,
        score: finalScore,
        confidence_level: confidence,
        journal: journal,
        reading_content: `Latihan Soal ${selectedSubject.name}`
      });

      toast.success("Latihan selesai! Hebat!");
      setTimeout(() => navigate("/"), 1500);
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
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-8 animate-in zoom-in duration-300">
          <div className="text-center space-y-2">
             <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-2">
               <Calculator size={48} className="text-amber-500" />
             </div>
             <h1 className="text-3xl font-black text-slate-800">Mulai Numerasi</h1>
             <p className="text-slate-500">Pilih mata pelajaran untuk tantangan hari ini.</p>
          </div>

          <div className="grid gap-3">
            {isSubmitting ? (
               <div className="text-center text-slate-400 py-10"><Loader2 className="animate-spin mx-auto h-8 w-8"/> Memuat soal...</div>
            ) : subjects.length === 0 ? (
               <div className="text-center p-4 border-2 border-dashed rounded-xl text-slate-400">Tidak ada mapel tersedia.</div>
            ) : (
              subjects.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => startGame(sub)}
                  className="w-full bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-amber-500 hover:shadow-md hover:bg-amber-50 transition-all flex justify-between items-center group text-left"
                >
                  <div>
                    <span className="block font-bold text-lg text-slate-700 group-hover:text-amber-600">{sub.name}</span>
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Mulai Latihan</span>
                  </div>
                  <div className="bg-slate-100 p-2 rounded-full group-hover:bg-amber-200 transition-colors">
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-amber-700"/>
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
      <div className="min-h-screen flex items-center justify-center bg-indigo-600">
        <div className="text-white text-center space-y-4 animate-pulse">
           <Brain size={64} className="mx-auto"/>
           <h2 className="text-2xl font-bold">Menghitung Skor...</h2>
        </div>
      </div>
    );
  }

  // 3. PLAYING: TAMPILAN MATHGAME ADAPTED
  if (gameState === "playing" && questions.length > 0) {
    const currentQ = questions[currentIndex];
    
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
          
          {/* Top Bar (Timer & Progress) */}
          <div className="bg-amber-500 p-5 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Timer size={20} className={timeLeft < 6 ? "animate-pulse text-red-200" : ""} />
              <span className="font-mono text-xl font-bold">{timeLeft}s</span>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{selectedSubject?.name}</span>
               <span className="text-sm font-bold">Soal {currentIndex + 1} / {questions.length}</span>
            </div>
          </div>

          <CardContent className="p-6 md:p-8 space-y-6">
            {/* Soal Area */}
            <div className="min-h-[120px] flex items-center justify-center">
               <h2 className="text-2xl md:text-3xl font-black text-slate-800 text-center leading-relaxed">
                 {currentQ.question_text}
               </h2>
            </div>

            {/* Jawaban Area (Grid Buttons) */}
            <div className="space-y-3">
              {Object.entries(currentQ.options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleAnswer(key)}
                  className="w-full group relative overflow-hidden bg-slate-50 hover:bg-indigo-50 border-2 border-slate-100 hover:border-indigo-500 p-4 rounded-2xl transition-all duration-200 flex items-center gap-4 text-left active:scale-95"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-slate-200 group-hover:border-indigo-500 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center font-bold text-slate-500 transition-colors">
                    {key}
                  </div>
                  <span className="text-base font-bold text-slate-700 group-hover:text-indigo-900 w-full break-words">
                    {value}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-center">
               <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                 Pilih jawaban yang benar
               </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4. REFLECTION: HASIL & JURNAL
  if (gameState === "reflection") {
    return (
      <div className="min-h-screen bg-indigo-50 p-6 flex flex-col items-center py-10">
        <div className="w-full max-w-md space-y-6 animate-in slide-in-from-bottom-8 duration-500">
          
          <div className="text-center space-y-2">
            <div className="inline-block p-4 bg-white rounded-full shadow-xl mb-2">
              <Trophy size={48} className={finalScore >= 70 ? "text-yellow-500" : "text-slate-400"} />
            </div>
            <h1 className="text-2xl font-black text-slate-800">Selesai!</h1>
            <p className="text-slate-500 text-sm">Skor Akhir Kamu</p>
            <div className="text-6xl font-black text-indigo-600 tracking-tighter">{finalScore}</div>
          </div>

          <Card className="rounded-[32px] border-none shadow-xl bg-white">
            <CardContent className="p-6 space-y-8">
              
              {/* Slider Confidence */}
              <div className="space-y-4">
                <Label className="font-bold text-slate-700 flex justify-between">
                   <span>Tingkat Kepercayaan Diri</span>
                   <span className="text-indigo-600">{confidence}/5</span>
                </Label>
                <Slider value={[confidence]} max={5} min={1} step={1} onValueChange={(v) => setConfidence(v[0])} />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Ragu</span>
                  <span>Sangat Yakin</span>
                </div>
              </div>

              {/* Jurnal Input */}
              <div className="space-y-3">
                <Label className="font-bold text-slate-700">Jurnal Belajar</Label>
                <textarea 
                  className="w-full p-4 border-2 border-slate-50 rounded-2xl text-sm min-h-[100px] focus:border-indigo-500 outline-none bg-slate-50 transition-all placeholder:text-slate-400"
                  placeholder="Soal mana yang paling sulit? Kenapa?"
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)} 
                />
              </div>

              <Button 
                type="button"
                onClick={submitReflection} 
                disabled={isSubmitting || !journal}
                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-indigo-600 font-bold text-lg shadow-lg transition-all"
              >
                {isSubmitting ? "Menyimpan..." : (
                  <span className="flex items-center gap-2"><Send size={18}/> Simpan Jurnal</span>
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