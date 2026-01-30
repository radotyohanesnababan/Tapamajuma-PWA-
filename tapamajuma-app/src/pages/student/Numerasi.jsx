/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Loader2, 
  ArrowLeft 
} from "lucide-react";
import { toast } from "sonner";

export default function StudentNumerasi() {
  const [step, setStep] = useState('menu'); // 'menu', 'quiz', 'result'
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Load Mapel
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/api/student/quiz/subjects');
        setSubjects(res.data);
      } catch (e) {
        toast.error("Gagal memuat mapel");
      }
    };
    fetchSubjects();
  }, []);

  // 2. Start Quiz
  const startQuiz = async (subject) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/api/student/quiz/questions?subject_id=${subject.id}`);
      setQuestions(res.data);
      setSelectedSubject(subject);
      setAnswers({});
      setCurrentIndex(0);
      setStep('quiz');
    } catch (error) {
        // Handle 404
        if (error.response?.status === 404) {
             toast.warning("Soal belum tersedia untuk kelasmu.");
        } else {
             toast.error("Gagal memuat soal");
        }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Answer
  const handleAnswer = (optionKey) => {
    const currentQ = questions[currentIndex];
    setAnswers(prev => ({ ...prev, [currentQ.id]: optionKey }));
  };

  // 4. Submit Logic
  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // SUBMIT
      setIsLoading(true);
      
      const payloadAnswer = Object.entries(answers).map(([qId, val]) => ({
        question_id: qId,
        selected_option: val
      }));

      try {
        const res = await api.post('/api/student/quiz/submit', {
          subject_id: selectedSubject.id, // Kirim ID
          answers: payloadAnswer
        });
        
        setResult(res.data);
        setStep('result');
      } catch (e) {
        toast.error("Gagal mengirim jawaban");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // UI RENDER (Sama seperti sebelumnya)
  if (step === 'menu') {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calculator className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Latihan Numerasi</h1>
            <p className="text-slate-500 text-sm">Pilih mata pelajaran untuk mulai berlatih soal.</p>
          </div>
          <div className="grid gap-3">
            {subjects.map(sub => (
              <button
                key={sub.id}
                onClick={() => startQuiz(sub)}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all flex justify-between items-center group"
              >
                <span className="font-bold text-slate-700 group-hover:text-indigo-600">{sub.name}</span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600"/>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'quiz') {
    const currentQ = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const isAnswered = answers[currentQ.id] !== undefined;

    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="h-2 bg-slate-100 w-full">
          <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex-1 p-6 max-w-md mx-auto w-full flex flex-col">
          <div className="flex justify-between items-center mb-6 text-sm text-slate-500 font-medium">
             <span>Soal {currentIndex + 1}/{questions.length}</span>
             <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">{selectedSubject?.name}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 leading-relaxed mb-8">{currentQ.question_text}</h2>
            <div className="space-y-3">
              {Object.entries(currentQ.options).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => handleAnswer(key)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${answers[currentQ.id] === key ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm" : "border-slate-200 bg-white text-slate-700"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${answers[currentQ.id] === key ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-500 border-slate-200"}`}>{key}</div>
                  <span className="font-medium text-sm">{val}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-slate-100">
            <Button onClick={handleNext} disabled={!isAnswered || isLoading} className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-slate-800 shadow-lg">
              {isLoading ? <Loader2 className="animate-spin"/> : (currentIndex === questions.length - 1 ? "Selesai & Kumpulkan" : "Lanjut")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // RESULT SCREEN
  if (step === 'result' && result) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center space-y-6">
          <Trophy className={`h-24 w-24 mx-auto ${result.score >= 70 ? 'text-yellow-400' : 'text-slate-300'}`} />
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900">{result.score}</h1>
            <p className="text-slate-500 font-medium">{result.message}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
            <div className="text-center">
              <p className="text-xs text-slate-400 font-bold uppercase">Benar</p>
              <p className="text-xl font-bold text-emerald-600 flex justify-center items-center gap-1"><CheckCircle2 size={18}/> {result.correct}</p>
            </div>
            <div className="text-center border-l border-slate-200">
              <p className="text-xs text-slate-400 font-bold uppercase">Salah</p>
              <p className="text-xl font-bold text-red-500 flex justify-center items-center gap-1"><XCircle size={18}/> {result.total - result.correct}</p>
            </div>
          </div>
          <Button onClick={() => setStep('menu')} className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Menu
          </Button>
        </div>
      </div>
    );
  }
  return null;
}