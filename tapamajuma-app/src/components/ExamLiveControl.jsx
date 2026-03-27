import React, { useState, useEffect } from 'react';
import { RefreshCw, Users, Clock, AlertTriangle, Monitor } from 'lucide-react';
import api from '@/lib/axios'; 
import { toast } from 'sonner';

const ExamLiveControl = ({ exam, setView }) => {
  // Ambil token awal dari data exam yang dikirim atau default strip
  const [token, setToken] = useState(exam?.token || '------');
  const [studentCount, setStudentCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  
  // 1. Timer untuk Jam Server (Realtime)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fungsi Refresh Token (Panggil API yang sama dengan Rilis Token)
  const handleRefreshToken = async () => {
    try {
      toast.loading("Memperbarui token...");
      const res = await api.post(`/api/teacher/cbt/exams/${exam.id}/release-token`);
      setToken(res.data.token);
      toast.dismiss();
      toast.success("Token baru berhasil dirilis!");
    } catch (err) {
      toast.dismiss();
      toast.error("Gagal memperbarui token");
    }
  };

  // 3. Fungsi Tutup Ujian
  const handleCloseExam = async () => {
    if (!window.confirm("Yakin ingin menutup ujian ini? Siswa tidak akan bisa masuk lagi.")) return;
    
    try {
      await api.post(`/api/teacher/cbt/exams/${exam.id}/close`);
      toast.success("Ujian telah ditutup.");
      setView('list'); // Kembali ke daftar paket
    } catch (err) {
      toast.error("Gagal menutup ujian");
    }
  };

  if (!exam) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">
      
      {/* 1. LAYAR PROYEKTOR (TAMPILKAN KE SISWA) */}
      <div className="md:col-span-2 bg-white rounded-[3rem] p-12 shadow-2xl shadow-blue-100 border-4 border-blue-50 flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        
        <div className="flex flex-col items-center gap-2 z-10">
            <span className="bg-blue-600 text-white px-6 py-1.5 rounded-full text-xs font-black tracking-widest uppercase">
              Token Ujian Aktif
            </span>
            <p className="text-slate-400 text-sm font-bold">Silakan masukkan kode di bawah pada aplikasi Anda</p>
        </div>

        <div className="bg-slate-50 border-2 border-dashed border-blue-200 rounded-[2.5rem] px-1 py-12 w-full text-center z-10 shadow-inner">
          <h2 className="text-9xl font-mono font-black text-blue-700 tracking-[0.2em] drop-shadow-sm">
            {token}
          </h2>
        </div>

        <div className="flex gap-4 z-10">
          <button 
            onClick={handleRefreshToken}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-blue-200 transition-all text-lg active:scale-95"
          >
            <RefreshCw size={24} /> REFRESH TOKEN
          </button>
          
          <button 
            onClick={handleCloseExam}
            className="flex items-center gap-3 bg-red-50 hover:bg-red-100 text-red-600 px-8 py-5 rounded-2xl font-black transition-all border-2 border-transparent hover:border-red-200"
          >
            <AlertTriangle size={24} /> SELESAIKAN UJIAN
          </button>
        </div>
        
        <p className="text-xs text-slate-400 font-bold animate-pulse uppercase tracking-widest italic">
          *Jangan tutup halaman ini selama ujian berlangsung
        </p>
      </div>

      {/* 2. PANEL MONITORING GURU */}
      <div className="space-y-6">
        {/* Live Status Card */}
        <div className="bg-emerald-500 text-white rounded-[2.5rem] p-8 shadow-xl shadow-emerald-100 flex flex-col justify-between h-48 relative overflow-hidden group">
          <div className="flex justify-between items-start z-10">
            <Users size={40} strokeWidth={2.5} />
            <div className="flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                <span className="text-xs font-black uppercase">Monitoring Live</span>
            </div>
          </div>
          <div className="z-10">
            <div className="text-5xl font-black tracking-tighter">0</div>
            <div className="text-sm font-bold opacity-80 uppercase tracking-widest">Siswa Mengerjakan</div>
          </div>
          {/* Abstract background */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
        </div>

        {/* Info Detail Card */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
           <div className="flex items-center gap-3 text-slate-800 font-black border-b border-slate-50 pb-4">
              <Clock size={20} className="text-blue-500" /> JAM SERVER
              <span className="ml-auto font-mono text-blue-600 text-xl">
                {currentTime.toLocaleTimeString('id-ID')}
              </span>
           </div>
           
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold uppercase">Mata Pelajaran</span>
                <span className="text-slate-700 font-black text-sm">{exam.subject?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold uppercase">Durasi Sisa</span>
                <span className="text-slate-700 font-black text-sm">{exam.duration_minutes} Menit</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold uppercase">Status Paket</span>
                <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Berjalan</span>
              </div>
           </div>
        </div>

        {/* Shortcut Button */}
        <button 
          onClick={() => setView('list')}
          className="w-full flex items-center justify-center gap-2 p-4 bg-slate-50 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-all border border-slate-200/50"
        >
          <Monitor size={18} /> Kembali ke Daftar Paket
        </button>
      </div>
      
    </div>
  );
};

export default ExamLiveControl;