import React, { useState } from "react";
import MathGame from "@/components/games/MathGame";
import { Calculator } from "lucide-react";


export const NumeracyChallengeCard = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Jika sedang bermain, tampilkan Game
  // Kita tidak lagi mengirim 'selectedSubject' karena pemilihan dilakukan di dalam game
  if (isPlaying) {
    return (
      <MathGame 
        onClose={() => setIsPlaying(false)} 
      />
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 space-y-6 animate-in slide-in-from-bottom-4">
      <div>
        <h2 className="text-xl font-bold text-blue-900 mb-2">Tantangan Literasi</h2>
        <p className="text-slate-500 text-sm">
          Asah logika dan kecepatan membaca kontekstual hari ini.
        </p>
      </div>

      <div className="space-y-4">
        {/* BUTTON LANGSUNG MULAI GAME */}
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          className="w-full py-6 px-6 rounded-2xl bg-blue-50 text-blue-700 font-bold border-2 border-dashed border-blue-200 hover:bg-blue-100 flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Calculator className="w-8 h-8" />
          <div className="text-center">
            <span className="block text-lg">Mulai Latihan Literasi</span>
            <span className="text-xs font-medium opacity-70">
              Klik untuk memulai permainan
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default NumeracyChallengeCard;