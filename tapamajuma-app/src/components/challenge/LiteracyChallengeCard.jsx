/* eslint-disable react-refresh/only-export-components */
import React from "react";
import MathGame from "@/components/games/MathGame"; // Asumsi menggunakan MathGame sesuai kode awalmu

// Metadata untuk dikonsumsi ChallengeForm
export const LITERACY_CONFIG = {
  title: "Hari Literasi",
  desc: "Pembiasaan membaca dan bercerita untuk meningkatkan kemampuan analisis teks, imajinasi, dan pemahaman konten.",
  time: "10 Menit",
  buttonLabel: "Mulai Latihan",
  items: "10 Soal",
  themeColor: "blue"
};

export const LiteracyChallengeCard = ({ isPlaying, setIsPlaying, onComplete }) => {
  // Jika sedang bermain, tampilkan Game secara full screen overlay
  if (isPlaying) {
    return (
      <div className="fixed inset-0 z-[100] bg-white">
        {/* Kamu bisa mengganti ini dengan LiteracyGame jika nanti tersedia */}
        <MathGame onClose={() => setIsPlaying(false)} />
      </div>
    );
  }

  return null;
};

export default LiteracyChallengeCard;