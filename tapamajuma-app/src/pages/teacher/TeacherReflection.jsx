
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Quote, 
  CheckCircle2, 
  Sparkles,
  Filter,
  Calendar,
  SearchX
} from "lucide-react";
import { toast } from "sonner";

// --- Sub-Komponen: Kartu Refleksi Individual (TETAP SAMA SEPERTI SEBELUMNYA) ---
const ReflectionCard = ({ data, onUpdate }) => {
  const [feedback, setFeedback] = useState(data.feedback_teacher || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasResponded = !!data.feedback_teacher;

  const handleSubmit = async () => {
    if (!feedback.trim()) return toast.error("Masukan tidak boleh kosong");

    setIsSubmitting(true);
    try {
      await api.post(`/api/teacher/reflections/${data.id}/feedback`, {
        feedback_teacher: feedback,
      });
      
      toast.success("Masukan berhasil dikirim!");
      // Kita panggil onUpdate agar data refresh (atau kamu bisa update local state)
      if (onUpdate) onUpdate(); 
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim masukan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-5 hover:shadow-md transition-shadow">
      {/* Header Siswa */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
            <span className="text-sm font-black text-indigo-600">
              {data.user?.name?.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-tight">
              {data.user?.name}
            </h3>
            <p className="text-[10px] font-bold text-indigo-400 mt-0.5 uppercase tracking-wider">
              {data.user?.student_class?.name || 'Kelas Tidak Diketahui'} • {new Date(data.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>
        {hasResponded && (
          <Badge className="bg-emerald-100 text-emerald-700 border-none px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 shadow-sm">
            <CheckCircle2 size={12} /> Dijawab
          </Badge>
        )}
      </div>

      {/* Konten Refleksi Siswa */}
      <div className="relative bg-slate-50 rounded-2xl p-4 rounded-tl-sm border border-slate-200 ml-5">
        <Quote size={20} className="absolute -top-3 -left-3 text-slate-300 fill-slate-50" />
        
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Refleksi Belajar
            </p>
            <p className="text-sm text-slate-700 font-medium leading-relaxed italic">
              "{data.content}"
            </p>
          </div>
          
          {data.targets && (
            <div className="pt-3 border-t border-slate-200/60 mt-2">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Sparkles size={12} /> Target Selanjutnya
              </p>
              <p className="text-xs text-indigo-900 font-bold">
                {data.targets}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Input Respon Guru */}
      <div className={`transition-all duration-300 ${isFocused ? '-translate-y-1' : ''}`}>
        <div className="flex items-center justify-between mb-2 px-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Tanggapan Guru
          </label>
        </div>
        
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Berikan kalimat motivasi atau saran perbaikan..."
          className="text-sm min-h-[90px] bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-2xl resize-none shadow-sm font-medium"
        />
        
        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !feedback.trim() || (feedback === data.feedback_teacher)}
            className={`
              rounded-xl text-xs h-10 px-5 font-bold transition-all shadow-sm
              ${hasResponded && feedback === data.feedback_teacher 
                ? "bg-slate-100 text-slate-400 hover:bg-slate-200 cursor-not-allowed shadow-none" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md hover:shadow-indigo-200 active:scale-95"}
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2"><span className="animate-pulse">Menyimpan...</span></span>
            ) : hasResponded && feedback === data.feedback_teacher ? (
              "Sudah Ditanggapi"
            ) : (
              <span className="flex items-center gap-2">Kirim Tanggapan <Send size={14} /></span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function TeacherReflection() {
  const [reflections, setReflections] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [selectedClass, setSelectedClass] = useState("");
  // Default filter: Hari ini
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // Ambil daftar kelas yang bisa diakses guru
  useEffect(() => {
    api.get("/api/teacher/accessible-classes")
      .then(res => setClasses(res.data))
      .catch(() => toast.error("Gagal memuat daftar kelas."));
  }, []);

  // Fetch Data Refleksi
  const fetchReflections = async () => {
    setLoading(true);
    try {
      // Kirim filter sebagai query params
      const res = await api.get("/api/teacher/reflections", {
        params: {
          class_id: selectedClass,
          start_date: startDate,
          end_date: endDate
        }
      });
      setReflections(res.data);
    } catch (error) {
      toast.error("Gagal memuat data refleksi.");
    } finally {
      setLoading(false);
    }
  };

  // Jalankan fetch otomatis saat filter berubah
  useEffect(() => {
    // Hindari fetch berulang jika selectedClass belum diset (opsional, tergantung logic)
    // Di sini kita langsung fetch tiap ada perubahan filter
    fetchReflections();
  }, [selectedClass, startDate, endDate]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Ruang Refleksi</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">
              Jurnal Siswa
            </p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100">
            <MessageCircle size={20} className="text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-3xl mx-auto space-y-6">
        
        {/* AREA FILTER */}
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-end animate-in fade-in slide-in-from-top-4 duration-500">
          
          <div className="space-y-2 w-full md:w-1/3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <Filter size={12} /> Pilih Kelas
            </label>
            <select 
              className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-none text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 shadow-inner appearance-none cursor-pointer"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Semua Kelas</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2 w-full md:w-1/3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <Calendar size={12} /> Mulai Tanggal
            </label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-none text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 shadow-inner"
            />
          </div>

          <div className="space-y-2 w-full md:w-1/3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <Calendar size={12} /> Sampai Tanggal
            </label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-none text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 shadow-inner"
            />
          </div>

        </div>

        {/* AREA DAFTAR REFLEKSI */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-sm font-black text-slate-600">Daftar Jurnal Masuk</h2>
            <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
              {reflections.length} Catatan
            </span>
          </div>

          {loading ? (
            // Skeleton Loading yang lebih rapi
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-white h-56 rounded-3xl animate-pulse shadow-sm border border-slate-50 p-5 flex flex-col justify-between">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                    <div className="h-3 bg-slate-50 rounded w-1/4" />
                  </div>
                </div>
                <div className="h-20 bg-slate-50 rounded-xl mt-4" />
                <div className="h-10 bg-slate-100 rounded-xl mt-4 w-1/4 self-end" />
              </div>
            ))
          ) : reflections.length === 0 ? (
            // Empty State yang lebih cantik
            <div className="bg-white rounded-3xl border border-slate-100 border-dashed p-10 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5">
                <SearchX className="text-slate-300" size={32} />
              </div>
              <h3 className="text-base font-black text-slate-700 mb-1">Belum Ada Refleksi</h3>
              <p className="text-sm text-slate-400 font-medium max-w-[250px]">
                Tidak ada jurnal siswa yang ditemukan pada rentang tanggal dan kelas ini.
              </p>
            </div>
          ) : (
            reflections.map((item) => (
              <ReflectionCard 
                key={item.id} 
                data={item} 
                onUpdate={fetchReflections} 
              />
            ))
          )}
        </div>
        
      </div>
    </div>
  );
}