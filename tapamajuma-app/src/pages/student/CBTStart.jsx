/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, BookOpen, Clock, ShieldCheck, CheckCircle2, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

const CBTStart = ({ onVerified }) => {
  
  // State Management
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const { id } = useParams();
  
  // Data State
  const [studentInfo, setStudentInfo] = useState({ name: "Radot Nababan", nisn: "009827361" });
  const [examDetails, setExamDetails] = useState(null);

  // 1. Fungsi Cek Token
const handleCheckToken = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    // Tembak endpoint baru tanpa ID di URL
    const res = await api.post('/api/cbt/verify-token-only', { token });
    
    if (res.data.status === 'success') {
      // Simpan data ujian (termasuk ID aslinya) ke state
      setExamDetails(res.data.exam); 
      setIsTokenValid(true);
      toast.success("Token terverifikasi!");
    }
  } catch (err) {
    toast.error(err.response?.data?.message || "Token Salah!");
  } finally {
    setIsLoading(false);
  }
};
  // 2. Fungsi Mulai Ujian (Final)
  const handleStartExam = () => {
    if (!isAgreed) return toast.error("Anda harus menyetujui aturan ujian!");
    onVerified(examDetails);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-100 w-full max-w-5xl overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[600px]">
        
        {/* SISI KIRI: PROFIL & INFO (STATIC) */}
        <div className="md:w-2/5 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[120px] opacity-20 -mr-32 -mt-32"></div>
           
           <div className="z-10">
              <h1 className="text-2xl font-black tracking-tighter mb-12">TAPAMAJUMA <span className="text-blue-500">CBT</span></h1>
              
              <div className="space-y-8">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 shadow-xl">
                       <User size={28} className="text-blue-400" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nama Peserta</p>
                       <p className="text-lg font-bold">{studentInfo.name}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 shadow-xl">
                       <ShieldCheck size={28} className="text-emerald-400" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID Perangkat</p>
                       <p className="text-sm font-mono text-slate-300">LAPTOP-RN-2026</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="z-10 bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Peringatan</p>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                Dilarang keras membuka tab baru atau aplikasi lain selama ujian berlangsung. Sistem akan mencatat setiap pelanggaran.
              </p>
           </div>
        </div>

        {/* SISI KANAN: TOKEN & REVEAL INFO (DYNAMIC) */}
        <div className="flex-1 p-12 flex flex-col justify-center">
          
          {!isTokenValid ? (
            /* STEP 1: INPUT TOKEN */
            <div className="max-w-md mx-auto w-full animate-in fade-in slide-in-from-right duration-500">
               <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                    <KeyRound size={40} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Konfirmasi Token</h2>
                  <p className="text-slate-400 font-medium mt-2">Masukkan 6 digit kode dari proyektor kelas</p>
               </div>

               <form onSubmit={handleCheckToken} className="space-y-6">
                  <input 
                    type="text" required maxLength={6}
                    value={token} onChange={(e) => setToken(e.target.value.toUpperCase())}
                    className="w-full text-center text-5xl font-mono font-black tracking-[0.4em] py-6 bg-slate-50 border-4 border-slate-100 rounded-[2rem] focus:border-blue-500 focus:bg-white transition-all outline-none uppercase placeholder:text-slate-200"
                    placeholder="------"
                  />
                  <button 
                    disabled={isLoading || token.length < 6}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[2rem] text-lg shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                  >
                    {isLoading ? 'MEMVERIFIKASI...' : <><CheckCircle2 size={24} /> CEK VALIDASI</>}
                  </button>
               </form>
            </div>
          ) : (
            /* STEP 2: REVEAL INFO & ATURAN */
            <div className="animate-in fade-in zoom-in duration-500">
               <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3 uppercase tracking-tighter">
                 <BookOpen className="text-blue-600" size={32} /> Konfirmasi Ujian
               </h2>

               <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mata Pelajaran</p>
                    <p className="text-xl font-bold text-slate-700">{examDetails?.subject}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Durasi Waktu</p>
                    <p className="text-xl font-bold text-slate-700">{examDetails?.duration} Menit</p>
                  </div>
               </div>

               {/* AREA ATURAN */}
               <div className="bg-amber-50 border-2 border-amber-100 p-8 rounded-[2rem] mb-10">
                  <h4 className="font-black text-amber-800 mb-4 flex items-center gap-2 uppercase text-sm tracking-widest">
                    <AlertCircle size={18} /> Tata Tertib Ujian
                  </h4>
                  <ul className="text-sm text-amber-900/70 space-y-3 font-medium">
                    <li className="flex gap-3"><span>1.</span> Jawaban akan tersimpan otomatis setiap Anda berpindah soal.</li>
                    <li className="flex gap-3"><span>2.</span> Dilarang menekan tombol back atau refresh browser.</li>
                    <li className="flex gap-3"><span>3.</span> Ujian akan otomatis terhenti jika waktu habis.</li>
                  </ul>
                  
                  <label className="mt-8 flex items-center gap-4 cursor-pointer group">
                    <input 
                      type="checkbox" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)}
                      className="w-6 h-6 rounded-lg accent-blue-600 cursor-pointer"
                    />
                    <span className="text-sm font-black text-amber-900 group-hover:text-amber-700 transition-colors">
                      SAYA MENGERTI DAN SIAP MENGERJAKAN JUJUR
                    </span>
                  </label>
               </div>

               <button 
                onClick={handleStartExam}
                disabled={!isAgreed}
                className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-20"
               >
                 MULAI KERJAKAN SOAL <ArrowRight size={24} />
               </button>
               
               <button onClick={() => setIsTokenValid(false)} className="w-full mt-4 text-slate-400 text-xs font-bold hover:text-red-500 transition-colors uppercase">
                 Ganti Token / Batalkan
               </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CBTStart;