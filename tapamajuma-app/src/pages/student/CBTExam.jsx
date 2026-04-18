/* eslint-disable no-undef */
/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect, useRef } from 'react';
// Hapus useParams karena kita tidak pakai ID di URL lagi
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle, Monitor } from 'lucide-react';
import api from '@/lib/axios'; 
import { toast } from 'sonner';
import DOMPurify from "dompurify"; // Import DOMPurify untuk sanitasi HTML

// 1. Tambahkan props { examData, onFinish }
const CBTExam = ({ examData, onFinish }) => {
  // 2. Ambil ID dari props, bukan dari useParams
  const examId = examData?.id;
  
  const [isLoading, setIsLoading] = useState(true);
  const [examInfo, setExamInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer); // Bersihkan setiap detik agar tidak tumpuk
    } else if (timeLeft === 0 && !isLoading) {
      handleFinishExam(true);
    }
  }, [timeLeft, isLoading]);

  useEffect(() => {
    const initExam = async () => {
      if (!examId) return;
      try {
        const res = await api.post('/api/cbt/start', { exam_id: examId });
        const { exam_info, questions, session_data } = res.data;

        // DEBUG: Cek di console browser (F12) untuk lihat struktur soalnya
        console.log("Data Soal Pertama:", questions[0]);

        setExamInfo(exam_info);
        setQuestions(questions);
        setAnswers(session_data.current_answers || {});

        const end = new Date(session_data.started_at).getTime() + (exam_info.duration * 60000);
        const remain = Math.max(0, Math.floor((end - new Date().getTime()) / 1000));
        
        setTimeLeft(remain);
        setIsLoading(false);
      } catch (err) {
        toast.error("Gagal masuk ruang ujian.");
        if (onFinish) onFinish();
      }
    };
    initExam();
  }, [examId]);

  const saveAnswer = async (qId, selected, isDoubtful) => {
    try {
      await api.post('/api/cbt/update-answer', {
        exam_id: examId,
        question_id: qId,
        answer: selected,
        is_doubtful: isDoubtful
      });
    } catch  {
      console.error("Sync error");
    }
  };

const handleSelect = (label) => {
  // 1. Ambil soal yang sedang aktif
  const currentQ = questions[currentIndex];
  if (!currentQ) return;

  const qId = currentQ.id;
  
  // 2. Ambil status ragu-ragu yang lama (jika ada)
  const isDoubtful = answers[qId]?.is_doubtful || false;

  // 3. Update State Lokal (PENTING: Gunakan callback prev agar state terbaru terbaca)
  setAnswers(prev => {
    const updated = {
      ...prev,
      [qId]: { selected: label, is_doubtful: isDoubtful }
    };
    // Simpan progres ke database (Background)
    saveAnswer(qId, label, isDoubtful);
    return updated;
  });
};

  const toggleDoubtful = () => {
    const qId = questions[currentIndex].id;
    if (!answers[qId]?.selected) return toast.warning("Pilih jawaban dulu!");
    
    const newDoubtful = !answers[qId].is_doubtful;
    const newAns = { ...answers, [qId]: { ...answers[qId], is_doubtful: newDoubtful } };
    setAnswers(newAns);
    saveAnswer(qId, answers[qId].selected, newDoubtful);
  };

  const handleFinishExam = async (isAuto = false) => {
    if (!isAuto && !window.confirm("Selesaikan ujian sekarang?")) return;
    try {
      const res = await api.post('/api/cbt/submit', { exam_id: examId });
      toast.success("Ujian Selesai!");
      
      // 3. Panggil onFinish untuk membersihkan session dan balik ke menu awal
      if (onFinish) onFinish(res.data.score);
    } catch (e) {
      toast.error("Gagal submit, cek koneksi!");
    }
  };

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 text-slate-400">
       <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
       <span className="font-black text-sm uppercase tracking-widest">Menyiapkan Soal...</span>
    </div>
  );

  const currentQ = questions[currentIndex];

  const renderOptions = () => {
    if (!currentQ || !currentQ.options) return null;
    
    // Jika dari Laravel masih string, kita parse. Jika sudah casting array, langsung pakai.
    const optionsObj = typeof currentQ.options === 'string' 
      ? JSON.parse(currentQ.options) 
      : currentQ.options;

    // Mapping berdasarkan Entries [Key, Value]
    return Object.entries(optionsObj).map(([key, value]) => {
      const isSelected = answers[currentQ.id]?.selected === key;

      return (
        <button 
          key={key}
          onClick={() => handleSelect(key)} // Key di sini adalah "A", "B", dst.
          className={`flex items-center gap-5 p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.98] 
            ${isSelected 
              ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50 shadow-sm' 
              : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
        >
          <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl font-black text-lg transition-colors 
            ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border shadow-sm'}`}>
            {key}
          </div>
          <div 
            className={`font-bold transition-colors ${isSelected ? 'text-blue-800' : 'text-slate-600'}`} 
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(value) }} 
          />
        </button>
      );
    });
  };
  const formatSec = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-[#F3F4F6] flex flex-col overflow-hidden select-none">
      
      {/* TOPBAR */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-lg text-white"><Monitor size={20}/></div>
          <div>
            <h2 className="font-black text-slate-800 uppercase tracking-tight leading-none">{examInfo?.title}</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{examInfo?.subject}</p>
          </div>
        </div>

        <div className={`flex items-center gap-3 px-6 py-2 rounded-2xl border-2 font-mono font-bold text-xl transition-all ${timeLeft < 300 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
          <Clock size={20} />
          {formatSec(timeLeft)}
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        
        {/* LEFT: Question Area */}
        <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <span className="bg-blue-600 text-white px-4 py-1 rounded-full font-black text-sm uppercase tracking-tighter">
                Pertanyaan {currentIndex + 1}
            </span>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">ID_{currentQ?.id}</div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
            <div className="text-xl text-slate-800 leading-relaxed mb-10 font-medium" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentQ?.question_text) }} />
            
            <div className="grid grid-cols-1 gap-3 max-w-3xl">
            {renderOptions()}
            </div>
          </div>

          {/* Nav Bottom */}
          <div className="p-6 border-t bg-slate-50 flex justify-between items-center">
            <button 
              disabled={currentIndex === 0} 
              onClick={() => setCurrentIndex(c => c - 1)}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20}/> SEBELUMNYA
            </button>

            <button 
              onClick={toggleDoubtful}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black transition-all ${answers[currentQ?.id]?.is_doubtful ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-amber-100 text-amber-600 hover:bg-amber-200'}`}
            >
              <AlertTriangle size={20}/> RAGU-RAGU
            </button>

            {currentIndex === questions.length - 1 ? (
              <button onClick={() => handleFinishExam()} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-red-200 flex items-center gap-2 transition-all">
                <Send size={18}/> SELESAI
              </button>
            ) : (
              <button onClick={() => setCurrentIndex(c => c + 1)} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-blue-200 flex items-center gap-2 transition-all">
                BERIKUTNYA <ChevronRight size={18}/>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Question Grid */}
        <div className="w-[340px] hidden lg:flex flex-col bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-slate-50 text-center font-black text-slate-700 uppercase tracking-widest text-xs">Navigasi Soal</div>
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-4 gap-3 content-start custom-scrollbar">
            {questions.map((q, idx) => {
              const ans = answers[q.id];
              const isCurrent = currentIndex === idx;
              let bgClass = "bg-white border-slate-100 text-slate-300";
              
              if (ans?.selected) {
                bgClass = ans.is_doubtful ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-100" : "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-14 rounded-2xl border-2 font-black transition-all relative text-sm ${bgClass} ${isCurrent ? 'ring-4 ring-blue-100 scale-105 border-blue-600 !text-blue-600 !bg-white' : ''} ${isCurrent && ans?.selected ? '!bg-blue-600 !text-white' : ''}`}
                >
                  {idx + 1}
                  {ans?.selected && <span className="absolute bottom-1 right-2 text-[9px] opacity-70 font-black">{ans.selected}</span>}
                </button>
              );
            })}
          </div>
          <div className="p-6 border-t bg-slate-50 space-y-2">
             <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400">
                <div className="w-3 h-3 bg-blue-600 rounded-sm"></div> Terjawab
             </div>
             <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400">
                <div className="w-3 h-3 bg-amber-500 rounded-sm"></div> Ragu-ragu
             </div>
             <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 text-blue-600 pt-2 border-t border-slate-200">
                <div className="w-3 h-3 border-2 border-blue-600 rounded-sm"></div> Posisi Sekarang
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CBTExam;