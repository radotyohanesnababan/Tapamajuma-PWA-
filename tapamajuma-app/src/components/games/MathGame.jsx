import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios"; 
import { useNavigate } from "react-router-dom"; 
import { useToast } from "@/hooks/use-toast"; 

export default function MathGame() {
  const [gameState, setGameState] = useState("playing");
  const [question, setQuestion] = useState(null);
  const [userAns, setUserAns] = useState("");
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [confidence, setConfidence] = useState(3);
  const [journal, setJournal] = useState("");
  
  const totalRounds = 5;
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateQuestion = useCallback(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { a, b, ans: a + b };
  }, []);

  // Perbaikan error cascading renders: Gunakan fungsi untuk inisialisasi
  useEffect(() => {
    if (!question) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuestion(generateQuestion());
    }
  }, [generateQuestion, question]);

  const handleNext = () => {
    if (parseInt(userAns) === question?.ans) {
      setScore((prev) => prev + 20);
    }

    if (currentRound < totalRounds) {
      setCurrentRound(prev => prev + 1);
      setUserAns("");
      setQuestion(generateQuestion());
    } else {
      setGameState("reflection");
    }
  };

  const submitActivity = async () => {
    
    try {
      await api.get("http://127.0.0.1:8000/sanctum/csrf-cookie");
      await api.post("/activities", {
        type: "berhitung",
        score: score,
        confidence_level: confidence,
        journal: journal
      });
      // Sekarang 'toast' digunakan di sini
      toast({ title: "Berhasil!", description: "Skormu tersimpan." });
      // Sekarang 'navigate' digunakan di sini
      navigate("/");
    } catch {
      toast({ variant: "destructive", title: "Gagal", description: "Cek koneksi/server." });
    }
  };

  if (!question && gameState === "playing") return <p className="p-10">Menyiapkan tantangan...</p>;

  if(gameState !== "playing" && gameState !== "reflection") {
    return <p className="p-10">Memuat...</p>;
  }

  if (gameState === "playing") {
    return (
      <Card className="m-4">
        <CardHeader>
          <CardTitle>Soal {currentRound}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="text-4xl font-bold">{question.a} + {question.b} = ?</div>
          <Input 
            type="number" 
            value={userAns} 
            onChange={(e) => setUserAns(e.target.value)}
            className="text-center text-xl"
            autoFocus
          />
          <Button onClick={handleNext} className="w-full">
            {currentRound === totalRounds ? "Selesai" : "Lanjut"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Refleksi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p>Skor Akhir</p>
          <h2 className="text-3xl font-bold">{score}</h2>
        </div>
        <div className="space-y-4">
          <Label>Seberapa yakin jawabanmu benar?</Label>
          <Slider value={[confidence]} max={5} min={1} step={1} onValueChange={(v) => setConfidence(v[0])} />
          <p className="text-center font-bold">{confidence} / 5</p>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Apa strategimu saat mengerjakan tadi?
          </Label>
          <textarea 
            className="w-full p-3 border rounded-md text-sm min-h-[100px] focus:ring-2 focus:ring-primary outline-none bg-slate-50 transition-all"
            placeholder="Misal: Aku menghitung pakai jari, membayangkan angka, atau cuma menebak..."
            value={journal}
            onChange={(e) => setJournal(e.target.value)} 
          />
          <p className="text-[10px] text-muted-foreground italic">
            *Mengetahui cara belajarmu sendiri adalah kunci sukses!
          </p>
        </div>
        <Button onClick={submitActivity} disabled={gameState !== "reflection"} className="w-full">
          {gameState === "reflection" ? "Simpan ke Dashboard" : "Menyimpan..."}
        </Button>
      </CardContent>
    </Card>
  );
}