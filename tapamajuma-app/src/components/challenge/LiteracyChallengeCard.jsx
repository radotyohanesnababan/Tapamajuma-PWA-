import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const LiteracyChallengeCard = ({ formData, setFormData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State baru untuk menampung data mata pelajaran dari database
  const [subjectList, setSubjectList] = useState([]);
  const [loadingMapel, setLoadingMapel] = useState(true);

  // Mengambil data mata pelajaran saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        // Sesuaikan endpoint ini dengan route Laravel kamu
        const res = await api.get("/api/quiz/literacy-subjects");
        setSubjectList(res.data);
      } catch (error) {
        console.error("Gagal memuat mata pelajaran:", error);
        toast.error("Gagal memuat daftar mata pelajaran.");
      } finally {
        setLoadingMapel(false);
      }
    };

    fetchSubjects();
  }, []);

  // Fungsi untuk memicu AI membuatkan bacaan sesuai mapel
  const handleGenerateAI = async () => {
    if (!formData.subject) {
      toast.error("Silakan pilih mata pelajaran terlebih dahulu.");
      return;
    }

    setIsGenerating(true);
    try {
      // Mengirim request ke backend yang terhubung dengan Gemini API
      const res = await api.post("/api/generate-content", {
        subject: formData.subject,
        type: "literacy",
      });

      // Menyimpan hasil bacaan ke dalam state utama agar tersimpan di database
      setFormData({ 
        ...formData, 
        reading_content: res.data.content 
      });
    } catch (err) {
      console.error("Gagal membuat bacaan AI:", err);
      toast.error("Terjadi kesalahan saat menghubungi AI. Coba lagi nanti.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-100 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-indigo-900 mb-2">Tantangan Literasi</h2>
        <p className="text-slate-500 text-sm">
          Membaca teks bermakna dan bercerita lintas mata pelajaran.
        </p>
      </div>

      <div className="space-y-4">
        {/* PILIHAN MATA PELAJARAN DINAMIS DARI DATABASE */}
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
            1. Pilih Mata Pelajaran Hari Ini
          </label>
          <select
            className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none mt-1 transition-all disabled:opacity-60"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
            disabled={loadingMapel}
          >
            <option value="">
              {loadingMapel ? "Memuat Mata Pelajaran..." : "-- Pilih Mapel --"}
            </option>
            
            {/* Render data dari API */}
            {!loadingMapel && subjectList.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
            
            {/* Opsi Cadangan */}
            {!loadingMapel && <option value="Lainnya">Lainnya</option>}
          </select>
        </div>

        {/* GENERATOR BACAAN AI */}
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
            2. Bacaan Literasi
          </label>
          
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={isGenerating || !formData.subject}
            className="w-full py-4 px-6 rounded-2xl bg-indigo-50 text-indigo-700 font-bold border-2 border-dashed border-indigo-200 hover:bg-indigo-100 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {isGenerating 
              ? "AI Sedang Menulis..." 
              : formData.subject 
                ? `Dapatkan Bacaan ${formData.subject}` 
                : "Pilih Mapel Dulu"}
          </button>

          {/* MENAMPILKAN TEKS HASIL GENERATE */}
          {formData.reading_content && (
            <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-in fade-in duration-700">
              <p className="text-sm leading-relaxed text-slate-700 italic whitespace-pre-line">
                {formData.reading_content}
              </p>
            </div>
          )}
        </div>

        {/* RINGKASAN & REFLEKSI (METAKOGNISI) */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
            3. Ringkasan / Cerita Kamu
          </label>
          <textarea
            className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none mt-1 transition-all resize-none"
            rows="4"
            placeholder="Tuliskan inti dari apa yang kamu baca atau ceritakan hari ini..."
            value={formData.journal}
            onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default LiteracyChallengeCard;