import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Tambahkan FileText, Link as LinkIcon, dan X di sini
import { ChevronLeft, ChevronRight, Award, Image as ImageIcon, TrendingUp, Star, FileText, Link as LinkIcon, X, ExternalLink, FileIcon, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";

export default function PresentationPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

 // Pastikan fungsi ini menerima parameter (item)
const renderPreview = (item) => {
  // PINDAHKAN KE SINI (Di dalam fungsi)
  const karyaTitle = item?.title || "Karya Tanpa Judul";
  
  const fileUrl = item?.image_url || '';
  const type = item?.file_type?.toLowerCase() || '';
  const extension = fileUrl.split('.').pop().toLowerCase();

  // 1. Logika Gambar
  const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  if (imageExtensions.includes(extension) || type.includes('image')) {
    return <img src={fileUrl} className="w-full h-full object-cover" alt={karyaTitle} />;
  }

  // 2. Logika Audio (Warna Biru)
  const audioExtensions = ['mp3', 'wav', 'm4a','webm','ogg'];
  if (audioExtensions.includes(extension) || type.includes('audio')) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-blue-50 text-blue-500 p-2">
        <Music size={32} fill="currentColor" />
        <p className="text-[10px] font-bold mt-2 uppercase tracking-tighter">Audio</p>
        {/* Nama karya muncul di sini */}
        <p className="text-[8px] text-center font-medium line-clamp-1 mt-1 opacity-80">{karyaTitle}</p>
      </div>
    );
  }

  // 3. Logika PDF (Warna Amber)
  if (extension === 'pdf' || type.includes('pdf')) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-amber-50 text-amber-600 p-2">
        <div className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded mb-1">PDF</div>
        {/* Nama karya muncul di sini */}
        <p className="text-[9px] text-center font-bold line-clamp-2 leading-tight uppercase">{karyaTitle}</p>
      </div>
    );
  }

  // 4. Default (File Umum)
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-slate-100 text-slate-400 p-2">
      <FileText size={32} />
      <p className="text-[10px] font-bold mt-1 uppercase">FILE</p>
      <p className="text-[8px] text-center line-clamp-1">{karyaTitle}</p>
    </div>
  );
};
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/summary');
        setData(response.data);
      } catch (error) {
        console.error("Gagal memuat data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-indigo-600">Memasuki Mode Presentasi...</div>;

  const slides = [
    // Slide 1: Welcome
    <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
      <div className={`w-32 h-32 rounded-full ${data?.user?.avatar_color || 'bg-indigo-600'} flex items-center justify-center text-white text-5xl font-black shadow-2xl border-4 border-white`}>
        {data?.user?.avatar ? <img src={data.user.avatar} className="rounded-full w-full h-full object-cover" /> : data?.user?.name.charAt(0)}
      </div>
      <div>
        <h1 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">Laporan Progres</h1>
        <p className="text-slate-500 font-medium italic">"{data?.user?.name}"</p>
      </div>
      <div className="bg-white p-6 rounded-[32px] shadow-xl border-4 border-indigo-100 w-full">
        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Total Energi Terkumpul</p>
        <div className="text-6xl font-black text-indigo-600 leading-none">{data?.stats?.total_xp} <span className="text-2xl">XP</span></div>
      </div>
    </div>,

    // Slide 2: Chart
    <div className="w-full space-y-6 animate-in slide-in-from-right duration-500">
      <div className="flex items-center gap-3 bg-amber-100 p-4 rounded-2xl">
        <TrendingUp className="text-amber-600" size={28} />
        <h2 className="text-xl font-bold text-amber-900">Grafik Pertumbuhan</h2>
      </div>
      <div className="bg-white p-6 rounded-[32px] shadow-lg h-64 flex items-end justify-between gap-2 border-b-8 border-indigo-500">
        {data?.chart?.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center group">
            <div 
              className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl transition-all duration-1000 ease-out"
              style={{ height: `${Math.max((day.daily_score / 200) * 150, 10)}px` }}
            ></div>
            <span className="text-[10px] font-bold text-slate-400 mt-2">H{i+1}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-slate-500 text-sm font-medium">"Setiap batang menunjukkan usaha saya setiap hari."</p>
    </div>,

    // Slide 3: Gallery
    <div className="w-full space-y-6 animate-in slide-in-from-right duration-500">
      <div className="flex items-center gap-3 bg-rose-100 p-4 rounded-2xl">
        <ImageIcon className="text-rose-600" size={28} />
        <h2 className="text-xl font-bold text-rose-900">Karya Terbaik</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {data?.highlights?.map((work, i) => (
          <div 
            key={i} 
            onClick={() => setSelectedItem(work)} 
            className="aspect-square rounded-[24px] overflow-hidden border-4 border-white shadow-md bg-white active:scale-95 transition-transform"
          >
            {renderPreview(work)} 
          </div>
        ))}
      </div>
      <div className="text-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <p className="font-bold text-slate-700">Total {data?.stats?.total_works} Karya Terkumpul</p>
      </div>
    </div>
  ];

  return (
    <div className="h-screen bg-slate-50 flex flex-col p-6 overflow-hidden relative">
      {/* Header Navigasi */}
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full bg-white shadow-sm border border-slate-100">
          <ChevronLeft size={20} />
        </Button>
        <div className="px-4 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold tracking-widest uppercase">
          Slide {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* Area Slide */}
      <div className="flex-1 flex items-center justify-center">
        {slides[currentSlide]}
      </div>

      {/* Kontrol Bawah */}
      <div className="mt-8 flex gap-4">
        {currentSlide > 0 && (
          <Button 
            onClick={() => setCurrentSlide(prev => prev - 1)}
            className="flex-1 h-16 rounded-2xl bg-white text-slate-600 border border-slate-200 shadow-sm font-bold"
          >
            Mundur
          </Button>
        )}
        
        <Button 
          onClick={() => currentSlide === slides.length - 1 ? navigate('/other') : setCurrentSlide(prev => prev + 1)}
          className={`flex-[2] h-16 rounded-2xl shadow-lg font-black text-lg ${currentSlide === slides.length - 1 ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-indigo-600'}`}
        >
          {currentSlide === slides.length - 1 ? "Selesai ✨" : "Lanjut"} 
          <ChevronRight size={24} className="ml-2" />
        </Button>
      </div>

      {/* MODAL DETAIL (Jika item diklik) */}
      {selectedItem && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <button 
            onClick={() => setSelectedItem(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white"
          >
            <X size={24} />
          </button>
          <div className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="aspect-video bg-slate-100 flex items-center justify-center">
              {renderPreview(selectedItem)}
            </div>
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-slate-800">{selectedItem.title}</h3>
              <div className="flex gap-2">
                 <Button className="flex-1 bg-indigo-600 rounded-xl" onClick={() => window.open(selectedItem.image_url)}>Lihat Asli</Button>
                 <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setSelectedItem(null)}>Tutup</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}