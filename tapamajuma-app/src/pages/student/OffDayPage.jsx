import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Coffee, ArrowLeft, BatteryCharging } from 'lucide-react';

const OffDayPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-[60vh]">
      
      {/* Ilustrasi Utama */}
      <div className="relative mb-10">
        {/* Efek Lingkaran Cahaya Mentari */}
        <div className="absolute inset-0 bg-amber-200 blur-[80px] opacity-40 rounded-full animate-pulse"></div>
        
        <div className="relative bg-white p-10 rounded-[3rem] shadow-2xl shadow-amber-100 border border-amber-50 flex items-center justify-center">
          <div className="absolute -top-4 -right-4 bg-amber-500 text-white p-3 rounded-2xl shadow-lg rotate-12">
            {/* Catatan: animate-spin-slow memerlukan konfigurasi di tailwind.config.js atau gunakan animate-spin */}
            <Sun size={24} className="animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <Coffee size={80} className="text-amber-600" />
        </div>
      </div>

      {/* Konten Teks */}
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          <BatteryCharging size={14} />
          Weekend Mode: On
        </div>
        
        <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4">
          Selamat Hari Minggu! 
        </h2>
        
        <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
          Hari ini tidak ada aktivitas belajar formal di sistem. <br className="hidden md:block" />
          Waktunya beristirahat dan mengisi energi untuk esok hari.
        </p>
      </div>

      {/* Navigasi */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-none justify-center">
        <Link
          to="/student"
          className="group flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-1 transition-all active:scale-95"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Beranda
        </Link>
      </div>

      {/* Pesan Kecil di Bawah */}
      <p className="mt-16 text-sm font-bold text-slate-400 italic">
        "Istirahat yang cukup adalah bagian dari strategi belajar yang hebat."
      </p>
    </div>
  );
};

export default OffDayPage;