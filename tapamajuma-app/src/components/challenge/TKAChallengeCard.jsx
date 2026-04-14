import React from "react";
import MathGame from "@/components/games/MathGame";

// 1. Export Konfigurasi untuk digunakan di ChallengeForm
// eslint-disable-next-line react-refresh/only-export-components
export const TKA_CONFIG = {
  title: "TKA Mandiri",
  desc: "Asah logika dan kecepatan berhitung kontekstual. Modul ini fokus pada kemandirian berpikir dan teknik pemecahan masalah tingkat tinggi.",
  time: "10 Menit",
  buttonLabel: "Mulai Latihan",
  items: "10 Soal",
  themeColor: "indigo" // sesuai desain gambar
};

export const TKAChallengeCard = ({ isPlaying, setIsPlaying, onComplete }) => {
  
  // Jika sedang bermain, tampilkan Game
  if (isPlaying) {
    return (
      <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
         <MathGame onClose={() => setIsPlaying(false)} />
      </div>
    );
  }

  // Jika tidak bermain, biarkan kosong atau tampilkan info tambahan khusus TKA
  // Karena deskripsi utama sudah dihandle ChallengeForm
  return null; 
};

export default TKAChallengeCard;