import React from "react";
import MathGame from "@/components/games/MathGame";
import { button } from "framer-motion/client";

// Metadata untuk dikonsumsi ChallengeForm
export const NUMERACY_CONFIG = {
  title: "Hari Numerasi",
  desc: "Latihan logika matematika praktis untuk mengasah ketajaman berhitung sehari-hari dan pemecahan masalah kontekstual.",
  time: "10 Menit",
  items: "10 Soal",
  themeColor: "orange",
  buttonLabel: "Mulai Latihan"
};

export const NumeracyChallengeCard = ({ isPlaying, setIsPlaying, onComplete }) => {
  // Jika sedang bermain, tampilkan Game secara full screen overlay
  if (isPlaying) {
    return (
      <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
        <MathGame onClose={() => setIsPlaying(false)} />
      </div>
    );
  }

  // Tampilan kartu minimalis (jika ada info tambahan di luar wrapper)
  return null;
};

export default NumeracyChallengeCard;