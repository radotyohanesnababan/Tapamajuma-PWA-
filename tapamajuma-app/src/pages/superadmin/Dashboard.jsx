import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Star, Activity, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function SuperadminDashboard() {
  usePageTitle("Dashboard");
  const [stats, setStats] = useState({
    total_students: 0,
    total_xp: 0
  });


  useEffect(() => {
    api.get("/api/admin/student-summary")
      .then((response) => {
        setStats(response.data);
      })
      .catch((error) => {
        console.log(error);
        console.error("CORS atau URL Salah:");
      });
  }, []);

  const statCards = [
    { title: "Total Siswa", value: stats.total_students, icon: <Users className="text-blue-500" />, color: "bg-blue-50" },
    { title: "Total Energi (XP)", value: stats.total_xp, icon: <Star className="text-amber-500" />, color: "bg-amber-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Ringkasan Sistem</h1>
        <p className="text-slate-500">Pantau progres belajar dan aktivitas siswa di sini.</p>
      </div>

      {/* Grid Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
                <h3 className="text-3xl font-black text-slate-800 mt-1">{card.value}</h3>
              </div>
              <div className={`p-4 rounded-2xl ${card.color}`}>
                {card.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Area Grafik atau Tabel Penting (Placeholder) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm min-h-[300px]">
            <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Aktivitas Terbaru 
            <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full uppercase tracking-tighter">Live Update</span>
          </CardTitle>
            </CardHeader>
            <CardContent>
          <div className="space-y-4">
            {stats.recent_activities?.length > 0 ? (
              stats.recent_activities.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 uppercase">
              {item.student_name.charAt(0)}
                </div>
                <div>
              <p className="text-sm font-bold text-slate-800">{item.student_name}</p>
              <p className="text-xs text-slate-400">
                Baru saja menyelesaikan{" "}
                {item.type === 'literacy' 
                  ? 'Kegiatan Literasi' 
                  : item.type === 'numeracy' 
                  ? 'Kegiatan Numerasi' 
                  : 'Tidak Diketahui'}
              </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-indigo-600">+{item.score} XP</p>
                <p className="text-[10px] text-slate-400">{item.time_ago}</p>
              </div>
            </div>
              ))
            ) : (
              <div className="text-center py-4 text-slate-400 text-xs italic">
            Belum ada aktivitas siswa terekam.
              </div>
            )}
          </div>
            </CardContent>
          </Card>

          {/* Grafik Shortcut */}
        {/* <Card className="border-none shadow-sm bg-indigo-900 text-white relative overflow-hidden">
          <CardContent className="p-8">
            <div className="relative z-10 space-y-4">
              <h2 className="text-2xl font-bold leading-tight">Siap untuk Laporan ?</h2>
              <p className="text-indigo-200 text-sm opacity-80">Ekspor semua data aktivitas siswa ke dalam format Excel atau PDF untuk diunduh.</p>
              <Button className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-xl gap-2">
                Download Rekapitulasi <ArrowUpRight size={16} />
              </Button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-800 rounded-full opacity-50 blur-3xl"></div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}