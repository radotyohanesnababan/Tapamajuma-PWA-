import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";

export default function ClassSummary() {
  const [classesData, setClassesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    api.get('/api/admin/activity-report/class-summary')
      .then(res => setClassesData(res.data.data || []))
      .catch(err => console.error("Gagal mengambil data kelas:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Fungsi untuk mendapatkan ranking berdasarkan rata-rata skor keseluruhan
  const getRank = (classId) => {
    // Urutkan kelas dari rata-rata tertinggi ke terendah
    const sorted = [...classesData].sort((a, b) => (Number(b.overall_avg) || 0) - (Number(a.overall_avg) || 0));
    // Cari index kelas yang dipilih lalu tambah 1 (karena index mulai dari 0)
    const rank = sorted.findIndex(c => c.id === classId) + 1;
    return rank;
  };

  const openClassModal = (cls) => {
    setSelectedClass({ ...cls, rank: getRank(cls.id) });
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Memuat data kelas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Ringkasan Aktivitas Kelas</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classesData.map((cls) => {
          const lit = Number(cls.literacy_count);
          const num = Number(cls.numeracy_count);
          const tka = Number(cls.tka_count);
          const total = lit + num + tka;

          const pLit = total > 0 ? (lit / total) * 100 : 0;
          const pNum = total > 0 ? (num / total) * 100 : 0;
          
          const colorLit = "#6366f1"; 
          const colorNum = "#10b981"; 
          const colorTka = "#f97316"; 

          return (
            <Card 
              key={cls.id} 
              onClick={() => openClassModal(cls)}
              className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-1"
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-700">
                  Kelas {cls.class_name}
                </CardTitle>
                <Badge variant="outline" className="bg-slate-50 text-slate-600">
                  {cls.total_students} Siswa
                </Badge>
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-6 mt-4">
                  <div className="relative flex-shrink-0">
                    <div 
                      className="w-24 h-24 rounded-full shadow-inner"
                      style={{
                        background: total > 0 
                          ? `conic-gradient(${colorLit} 0% ${pLit}%, ${colorNum} ${pLit}% ${pLit + pNum}%, ${colorTka} ${pLit + pNum}% 100%)`
                          : '#f1f5f9' 
                      }}
                    />
                    <div className="absolute inset-0 m-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-xs font-bold text-slate-500">{total}</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                        <span className="text-slate-600 font-medium">Literasi</span>
                      </div>
                      <span className="font-bold text-slate-700">{lit}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span className="text-slate-600 font-medium">Numerasi</span>
                      </div>
                      <span className="font-bold text-slate-700">{num}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                        <span className="text-slate-600 font-medium">TKA</span>
                      </div>
                      <span className="font-bold text-slate-700">{tka}</span>
                    </div>
                  </div>
                </div>
                
                {/* Petunjuk Interaksi */}
                <div className="mt-6 text-center text-xs text-indigo-500 font-medium flex items-center justify-center gap-1 opacity-80">
                  <span>Lihat Rincian Skor & Ranking</span>
                  <span>&rarr;</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* MODAL RINCIAN SKOR KELAS */}
      {isModalOpen && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all">
            
            {/* Modal Header */}
            <div className="bg-indigo-600 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white">Kelas {selectedClass.class_name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-indigo-500/50 text-white hover:bg-indigo-500/50 border-none">
                    Peringkat #{selectedClass.rank} dari {classesData.length}
                  </Badge>
                  <span className="text-indigo-200 text-sm">Total {selectedClass.total_students} Siswa</span>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-white/70 hover:text-white text-3xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Body: Skor Rata-rata */}
            <div className="p-6 space-y-6">
              <h3 className="font-semibold text-slate-800 border-b pb-2">Rata-rata Skor per Kategori</h3>
              
              <div className="space-y-4">
                {/* Literasi */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">L</div>
                    <div>
                      <p className="font-semibold text-slate-700">Literasi</p>
                      <p className="text-xs text-slate-500">{selectedClass.literacy_count} Aktivitas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-slate-800">{selectedClass.literacy_avg || "0.0"}</span>
                  </div>
                </div>

                {/* Numerasi */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">N</div>
                    <div>
                      <p className="font-semibold text-slate-700">Numerasi</p>
                      <p className="text-xs text-slate-500">{selectedClass.numeracy_count} Aktivitas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-slate-800">{selectedClass.numeracy_avg || "0.0"}</span>
                  </div>
                </div>

                {/* TKA */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">T</div>
                    <div>
                      <p className="font-semibold text-slate-700">TKA</p>
                      <p className="text-xs text-slate-500">{selectedClass.tka_count} Aktivitas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-slate-800">{selectedClass.tka_avg || "0.0"}</span>
                  </div>
                </div>
              </div>

              {/* Rata-rata Keseluruhan */}
              <div className="mt-4 bg-indigo-50 p-4 rounded-xl flex justify-between items-center border border-indigo-100">
                <span className="font-bold text-indigo-900">Rata-rata Keseluruhan</span>
                <span className="text-xl font-black text-indigo-700">{selectedClass.overall_avg || "0.0"}</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}