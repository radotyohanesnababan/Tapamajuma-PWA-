import React, { useState, useEffect } from "react";
import MathGame from "@/components/games/MathGame";
import { Calculator, PlayCircle, Loader2 } from "lucide-react";
import api from "@/lib/axios"; // Pastikan path axios benar
import { toast } from "sonner";

export const NumeracyChallengeCard = ({ formData, setFormData }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  // 1. AMBIL DAFTAR MAPEL DARI DATABASE
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        // Menggunakan endpoint yang sudah dibuat di StudentQuizController
        const response = await api.get('/api/admin/subjects');
        setSubjects(response.data);
      } catch (error) {
        console.error("Gagal memuat mapel:", error);
        toast.error("Gagal memuat daftar mata pelajaran.");
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  // Jika sedang bermain, tampilkan Game
  if (isPlaying) {
    return (
      <MathGame 
        selectedSubject={formData.subject} // Mengirim objek subject (id & name)
        onClose={() => setIsPlaying(false)} 
      />
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 space-y-6 animate-in slide-in-from-bottom-4">
      <div>
        <h2 className="text-xl font-bold text-orange-900 mb-2">Tantangan Numerasi</h2>
        <p className="text-slate-500 text-sm">
          Asah logika dan kecepatan berhitung kontekstual hari ini.
        </p>
      </div>

      <div className="space-y-4">
        {/* STEP 1: PILIH MAPEL (DINAMIS DARI DB) */}
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
            1. Pilih Mata Pelajaran
          </label>
          
          {isLoadingSubjects ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
               <Loader2 className="animate-spin h-4 w-4"/> Memuat mapel...
            </div>
          ) : (
            <select
              className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white outline-none mt-1 transition-all"
              // Simpan seluruh objek subject (id & name) atau ID-nya saja, tergantung kebutuhan MathGame.
              // Di sini kita asumsikan MathGame butuh ID dan Name, jadi kita simpan ID dulu di formData, 
              // tapi logic 'value' select harus string/number.
              value={formData.subject?.id || ""} 
              onChange={(e) => {
                const selectedId = parseInt(e.target.value);
                const selectedSub = subjects.find(s => s.id === selectedId);
                setFormData({ ...formData, subject: selectedSub });
              }}
            >
              <option value="">-- Pilih Mapel --</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* STEP 2: MULAI GAME */}
        <button
          type="button"
          disabled={!formData.subject}
          onClick={() => setIsPlaying(true)}
          className="w-full py-6 px-6 rounded-2xl bg-orange-50 text-orange-700 font-bold border-2 border-dashed border-orange-200 hover:bg-orange-100 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
        >
          <Calculator className="w-8 h-8" />
          <div className="text-center">
            <span className="block text-lg">Mulai Game Numerasi</span>
            <span className="text-xs font-medium opacity-70">
              {formData.subject ? `Mapel: ${formData.subject.name}` : "Pilih mapel dulu"}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default NumeracyChallengeCard;