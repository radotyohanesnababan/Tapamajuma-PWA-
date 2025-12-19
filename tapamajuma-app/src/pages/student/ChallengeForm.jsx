import { useState } from "react";
import MathGame from "@/components/games/MathGame";
import { Button } from "@/components/ui/button";

export default function ChallengeForm() {
  const [activeGame, setActiveGame] = useState(null);

  if (activeGame === "math") {
    return <MathGame />;
  }

  return (
    <div className="p-4 space-y-6 text-center mt-10">
      <h1 className="text-2xl font-bold">Pilih Tantangan Hari Ini</h1>
      <div className="grid grid-cols-1 gap-4">
        <Button 
          onClick={() => setActiveGame("math")}
          className="h-24 text-lg flex flex-col gap-2"
        >
          <span className="text-3xl">🧮</span>
          Berhitung Cepat
        </Button>
        
        <Button disabled variant="outline" className="h-24 text-lg flex flex-col gap-2">
          <span className="text-3xl">📖</span>
          Membaca (Segera Hadir)
        </Button>
      </div>
    </div>
  );
}