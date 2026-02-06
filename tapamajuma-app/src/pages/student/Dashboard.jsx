import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

// Tambahkan import grafik ini

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
// 1. Ambil data dari Context (Global)
  // user: data user yang login
  // isAuthLoading: status loading dari proses cek token di AuthContext
  const { user, isLoading: isAuthLoading } = useAuth(); 
  
  const navigate = useNavigate();

  // 2. State Lokal (Khusus data dashboard)
  const [activities, setActivities] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // 3. useEffect 1: Cek Role & Redirect
  // Taruh di paling atas, jangan di bawah return
  useEffect(() => {
    // Jalankan hanya jika AuthContext sudah selesai loading
    if (!isAuthLoading) {
      if (!user) {
        // Kalau tidak ada user, lempar ke login
        navigate("/login");
      } else if (user.role === "superadmin") {
        navigate("/superadmin", { replace: true });
      } else if (user.role === "teacher") {
        navigate("/teacher", { replace: true });
      }
      // Jika role student, biarkan lanjut
    }
  }, [user, isAuthLoading, navigate]);

  // 4. useEffect 2: Ambil Data Activities
  // Kita tidak perlu fetch /api/user lagi karena sudah ada dari useAuth
  useEffect(() => {
    // Pastikan user ada dulu baru fetch data
    if (user) {
        api.get("/api/activities")
        .then((res) => {
            setActivities(res.data);
        })
        .catch((err) => {
            console.error("Gagal ambil activities", err);
        })
        .finally(() => {
            // Loading data dashboard selesai (entah sukses atau gagal)
            setIsDataLoading(false);
        });
    }
  }, [user]);

  // 5. RENDER LOGIC (Baru boleh return di sini)
  
  // Tampilkan loading jika Auth sedang bekerja ATAU Data Dashboard sedang ditarik
  if (isAuthLoading || isDataLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            Loading Dashboard...
        </div>
    ); 
  }

  // Jika user null (tapi lolos loading), return null dulu biar gak error saat render nama
  if (!user) return null;

  // Cek loading menggunakan state loading, bukan variabel 'data'
  const loading = isDataLoading;

  // Format data untuk grafik
  const chartData = activities.map((act, index) => ({
    name: `Aksi ${index + 1}`,
    skor: act.score,
    yakin: act.confidence_level * 20, 
  }));

  // Cek loading menggunakan state loading, bukan variabel 'data'
  if (loading) return <p className="p-4 text-center text-xs animate-pulse">Memuat data... </p>;

  return (
    <div className="space-y-6 pb-20"> 
      <h2 className="text-xl font-bold">Halo, {user?.name}</h2>
      
      {/* Grafik Perkembangan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Skor vs Keyakinan</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="skor" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="yakin" stroke="#82ca9d" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-[10px] mt-2">
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#8884d8] rounded-full" /> Skor</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#82ca9d] rounded-full" /> Keyakinan</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Kartu Progres Total */}
      <Card className="bg-primary text-primary-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-normal">Total Aksi Selesai</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Ganti data.length menjadi activities.length */}
          <div className="text-3xl font-bold">{activities.length} Aksi</div>
          <Progress value={(activities.length / 10) * 100} className="bg-white/20 mt-2 h-2" />
          <p className="text-[10px] mt-1 text-white/80">{10 - activities.length} aksi lagi untuk naik level!</p>
        </CardContent>
      </Card>

      {/* List Aktivitas Terakhir */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Aktivitas Terakhir</h3>
        {/* Pastikan menggunakan activities.map */}
        {activities.slice().reverse().map((act) => (
          <Card key={act.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold capitalize text-sm">{act.type}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(act.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{act.score}</p>
                <div className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 rounded-full mt-1">
                  Yakin: {act.confidence_level}/5
                </div>
                        </div>
                        
            </CardContent>
          </Card>
        ))}

        {activities.length === 0 && (
          <p className="text-center text-muted-foreground text-xs py-10">Belum ada aktivitas. Ayo mulai tantangan!</p>
        )}
      </div>
    </div>
  );
}