import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, BookOpen } from "lucide-react";
import api from "@/lib/axios";

export default function ExecutiveReport() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/api/admin/activity-report/executive').then(res => setData(res.data));
  }, []);

  if (!data) return <div>Loading Analytics...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Ringkasan Eksekutif</h1>
      
      {/* 1. Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Total Aktivitas" value={data.metrics.total_activities} icon={<TrendingUp />} color="bg-blue-50 text-blue-600" />
        <MetricCard title="Rata-rata Skor" value={data.metrics.avg_score} icon={<BarChart3 />} color="bg-emerald-50 text-emerald-600" />
        <MetricCard title="Siswa Aktif (7 Hari)" value={data.metrics.active_students_7d} icon={<BookOpen />} color="bg-orange-50 text-orange-600" />
      </div>

      {/* 2. Simple Bar Chart (Top Subjects) */}
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Mapel Terpopuler</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {data.subjects.map((sub, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">{sub.subject}</span>
                <span className="text-slate-500">{sub.total} aktivitas</span>
              </div>
              {/* CSS Bar Chart */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full" 
                  style={{ width: `${(sub.total / data.subjects[0].total) * 100}%` }} // Relative to max
                ></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      {/* 3. Simple Bar Chart (Top Kegiatan) */}
      {/* 3. Simple Bar Chart (Top Kegiatan) */}
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>Kegiatan Terpopuler</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Tambahkan pengecekan agar tidak crash jika data kosong */}
          {data.activity_types && data.activity_types.length > 0 ? (
            data.activity_types.map((act, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm">
                  {/* Gunakan act.type dan tambahkan capitalize agar rapi */}
                  <span className="font-medium text-slate-700 capitalize">{act.type}</span>
                  <span className="text-slate-500">{act.total} aktivitas</span>
                </div>
                
                {/* CSS Bar Chart */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    // Perhitungan persentase relatif terhadap data tertinggi (index 0)
                    style={{ width: `${(act.total / data.activity_types[0].total) * 100}%` }} 
                  ></div>
                </div>
              </div>
            ))
          ) : (
             <div className="text-sm text-slate-500 text-center py-4">Belum ada data kegiatan.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Komponen Kecil Helper
const MetricCard = ({ title, value, icon, color }) => (
  <Card className="border-none shadow-sm">
    <CardContent className="p-6 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
    </CardContent>
  </Card>
);