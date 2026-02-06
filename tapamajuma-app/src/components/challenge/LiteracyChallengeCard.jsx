import React, { useState } from "react";
import api from "@/lib/axios";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const LiteracyChallengeCard = ({ formData, setFormData }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Fungsi untuk memicu AI membuatkan bacaan sesuai mapel
  const handleGenerateAI = async () => {
    if (!formData.subject) {
      toast.error("Silakan pilih mata pelajaran terlebih dahulu.");
      return;
    }

    setIsGenerating(true);
    try {
      // Mengirim request ke backend yang terhubung dengan Gemini AI
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
        {/* PILIHAN MATA PELAJARAN (Bukti Keterlibatan Lintas Guru) */}
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
            1. Pilih Mata Pelajaran Hari Ini
          </label>
          <select
            className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none mt-1 transition-all"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
          >
            <option value="">-- Pilih Mapel --</option>
            <option value="Agama">Agama Kristen Protestan</option>
            <option value="Agama">Agama Kristen Katolik</option>
            <option value="Agama">Agama Islam</option>
            <option value="Seni Budaya">Seni Budaya</option>
            <option value="PJOK">PJOK</option>
            <option value="Bahasa Indonesia">Bahasa Indonesia</option>
            <option value="Bahasa Inggris">Bahasa Inggris</option>
            <option value="Informatika">Informatika</option>
            <option value="IPS">Ilmu Pengetahuan Sosial</option>
            <option value="Lainnya">Lainnya</option>
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
            disabled={isGenerating}
            className="w-full py-4 px-6 rounded-2xl bg-indigo-50 text-indigo-700 font-bold border-2 border-dashed border-indigo-200 hover:bg-indigo-100 flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {isGenerating ? "AI Sedang Menulis..." : `Dapatkan Bacaan ${formData.subject || ""}`}
          </button>

          {/* MENAMPILKAN TEKS HASIL GENERATE */}
          {formData.reading_content && (
            <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-in fade-in duration-700">
              <p className="text-sm leading-relaxed text-slate-700 italic">
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