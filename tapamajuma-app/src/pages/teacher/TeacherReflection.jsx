/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  User, 
  Quote, 
  CheckCircle2, 
  Sparkles,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

// --- Sub-Komponen: Kartu Refleksi Individual ---
// Dipisah agar setiap textarea memiliki state sendiri (Controlled Component)
const ReflectionCard = ({ data, onUpdate }) => {
  const [feedback, setFeedback] = useState(data.feedback_teacher || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Cek apakah sudah ada respon sebelumnya dari database
  const hasResponded = !!data.feedback_teacher;

  const handleSubmit = async () => {
    if (!feedback.trim()) return toast.error("Masukan tidak boleh kosong");

    setIsSubmitting(true);
    try {
      await api.post(`/api/teacher/reflections/${data.id}/feedback`, {
        feedback_teacher: feedback,
      });
      
      toast.success("Masukan berhasil dikirim!");
      // Panggil fungsi refresh data di parent jika perlu, 
      // atau biarkan state lokal yang menangani UI 'sudah terkirim'
      if (onUpdate) onUpdate(); 
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim masukan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
      {/* Header Siswa */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
             {/* Avatar inisial */}
            <span className="text-xs font-bold text-slate-600">
              {data.user?.name?.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-tight">
              {data.user?.name}
            </h3>
            <p className="text-[10px] text-slate-500">
              Kelas {data.user?.class_id || '-'}
            </p>
          </div>
        </div>
        {hasResponded && (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-[9px] gap-1 px-2 py-0.5">
            <CheckCircle2 size={10} /> Dijawab
          </Badge>
        )}
      </div>

      {/* Konten Refleksi Siswa (Style Chat Bubble) */}
      <div className="relative bg-slate-50 rounded-xl p-4 rounded-tl-none border border-slate-100 ml-4">
        <Quote size={16} className="absolute -top-2 -left-2 text-slate-300 fill-slate-50" />
        
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Kendala & Tantangan
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">
              "{data.content}"
            </p>
          </div>
          
          {data.targets && (
            <div className="pt-2 border-t border-slate-200/60">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles size={10} /> Target Perbaikan
              </p>
              <p className="text-xs text-indigo-900 font-medium">
                {data.targets}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Input Respon Guru */}
      <div className={`transition-all duration-200 ${isFocused ? 'ring-2 ring-indigo-100 rounded-xl' : ''}`}>
        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block flex items-center justify-between">
          <span>Respon Pedagogis</span>
          <span className="text-[9px] font-normal text-slate-400">
            {feedback.length} karakter
          </span>
        </label>
        
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Berikan apresiasi dan saran konkret..."
          className="text-xs min-h-[80px] bg-white border-slate-200 focus-visible:ring-indigo-500 rounded-xl resize-none"
        />
        
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !feedback.trim() || (feedback === data.feedback_teacher)}
            className={`
              rounded-xl text-xs h-9 px-4 shadow-sm transition-all
              ${hasResponded && feedback === data.feedback_teacher 
                ? "bg-slate-100 text-slate-400 hover:bg-slate-200" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white"}
            `}
          >
            {isSubmitting ? (
              <span className="animate-pulse">Mengirim...</span>
            ) : hasResponded && feedback === data.feedback_teacher ? (
              "Tersimpan"
            ) : (
              <>
                Kirim Masukan <Send size={12} className="ml-2" />
              </>
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
  const [loading, setLoading] = useState(true);

  // Fetch Data
  const fetchReflections = async () => {
    try {
      const res = await api.get("/api/teacher/reflections");
      // Asumsikan data diurutkan dari yang terbaru atau yang belum dijawab
      setReflections(res.data);
    } catch (error) {
      toast.error("Gagal memuat data refleksi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReflections();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-lg mx-auto pt-20">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white h-48 rounded-2xl animate-pulse shadow-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Sticky Header Mobile */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Bimbingan Refleksi</h1>
            <p className="text-xs text-slate-500">
              {reflections.length} siswa menunggu review
            </p>
          </div>
          <div className="bg-indigo-50 p-2 rounded-full">
            <MessageCircle size={20} className="text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="px-4 py-4 max-w-xl mx-auto space-y-4">
        {reflections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="text-slate-300" size={32} />
            </div>
            <h3 className="text-sm font-bold text-slate-700">Semua Bersih!</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              Belum ada refleksi baru dari siswa saat ini.
            </p>
          </div>
        ) : (
          reflections.map((item) => (
            <ReflectionCard 
              key={item.id} 
              data={item} 
              onUpdate={fetchReflections} // Opsi: Refresh data setelah submit
            />
          ))
        )}
      </div>
    </div>
  );
}