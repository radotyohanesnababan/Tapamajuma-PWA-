import React, { useState, useEffect } from 'react'; // Tambahkan ini
import api from "@/lib/axios"; // Tambahkan ini
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function AnalysisTab() {
  const [analysisList, setAnalysisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    api.get("/teacher/dashboard")
      .then((res) => {
        setAnalysisList(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);
  const chartData = [
    { 
      name: 'Akurat', 
      value: analysisList.filter(d => Number(d.score) >= 80 && Number(d.confidence_level) >= 4).length, 
      color: '#22c55e' 
    },
    { 
      name: 'Overconfident', 
      // Syarat diturunkan ke >= 3 agar data skor 0 yakin 3 kamu terbaca MERAH
      value: analysisList.filter(d => Number(d.score) < 50 && Number(d.confidence_level) >= 3).length, 
      color: '#ef4444' 
    },
    { 
      name: 'Underconfident', 
      value: analysisList.filter(d => Number(d.score) >= 80 && Number(d.confidence_level) <= 2).length, 
      color: '#f59e0b' 
    },
    { 
      name: 'Berkembang', 
      value: analysisList.filter(d => {
        const s = Number(d.score);
        const c = Number(d.confidence_level);
        // Menghitung sisa data yang tidak masuk 3 kategori ekstrem di atas
        const isAkurat = s >= 80 && c >= 4;
        const isOver = s < 50 && c >= 3;
        const isUnder = s >= 80 && c <= 2;
        return !isAkurat && !isOver && !isUnder;
      }).length, 
      color: '#3b82f6' 
    },
  ].filter(item => item.value > 0);
  const openStudentList = (categoryName) => {
  let list = [];
  if (categoryName === 'Overconfident') {
    list = analysisList.filter(d => Number(d.score) < 50 && Number(d.confidence_level) >= 3);
  } else if (categoryName === 'Underconfident') {
    list = analysisList.filter(d => Number(d.score) >= 80 && Number(d.confidence_level) <= 2);
  } else if (categoryName === 'Akurat') {
    list = analysisList.filter(d => Number(d.score) >= 80 && Number(d.confidence_level) >= 4);
  }

  setSelectedCategory({ name: categoryName, students: list });
  setIsModalOpen(true);
};

  if (loading) return <div className="p-10 text-center animate-pulse text-xs">Menganalisis data...</div>;

  // Cek ke analysisList, bukan 'data' dari props
  if (analysisList.length === 0) return <div className="p-10 text-center text-xs text-muted-foreground">Belum ada data siswa untuk dianalisis.</div>;

  return (
    <div className="space-y-6 p-4">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold">Sebaran Pemahaman Kelas</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={chartData} // Ganti ke chartData
                innerRadius={60} 
                outerRadius={80} 
                paddingAngle={5} 
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold mb-3">Rekomendasi Strategi:</h3>
        <div className="space-y-3">
  {/* Filter untuk mendapatkan objek kategori tertentu */}
  {chartData.find(c => c.name === 'Overconfident')?.value > 0 && (
    <div 
      onClick={() => openStudentList('Overconfident')}
      className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500 text-left cursor-pointer hover:bg-red-100 transition-colors"
    >
      <p className="text-xs font-bold text-red-700">Fokus Intervensi (Klik untuk detail)</p>
      <p className="text-[11px] text-red-600">
        Terdapat {chartData.find(c => c.name === 'Overconfident').value} siswa yang terlalu percaya diri namun skor rendah.
      </p>
    </div>
  )}
  {chartData.find(c => c.name === 'Underconfident')?.value > 0 && (
    <div 
      onClick={() => openStudentList('Underconfident')}
      className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500 text-left cursor-pointer hover:bg-red-100 transition-colors"
    >
      <p className="text-xs font-bold text-red-700">Bangun Kepercayaan Diri (Klik untuk detail)</p>
      <p className="text-[11px] text-red-600">
        Terdapat {chartData.find(c => c.name === 'Underconfident').value} siswa sudah paham tapi masih ragu. Berikan apresiasi lebih.
      </p>
    </div>
  )}
  
  {/* Tambahkan saran untuk yang Akurat jika perlu */}
  {chartData.find(c => c.name === 'Akurat')?.value > 0 && (
    <div 
      onClick={() => openStudentList('Akurat')}
      className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500 text-left cursor-pointer hover:bg-green-100 transition-colors"
    >
      <p className="text-xs font-bold text-green-700">Pertahankan Performa</p>
      <p className="text-[11px] text-green-600">
        {chartData.find(c => c.name === 'Akurat').value} siswa sudah mencapai pemahaman optimal.
      </p>
    </div>
  )}

  {isModalOpen && selectedCategory && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
    <div className="bg-white rounded-xl w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-bold text-sm">Daftar Siswa: {selectedCategory.name}</h3>
        <button onClick={() => setIsModalOpen(false)} className="text-gray-500 text-xl">&times;</button>
      </div>
      
      <div className="p-4 overflow-y-auto space-y-2">
        {selectedCategory.students.length > 0 ? (
          selectedCategory.students.map((student, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded border">
              <span className="text-xs font-medium">{student.user?.name}</span>
              <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600">
                Skor: {student.score}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-center text-muted-foreground py-4">Tidak ada data.</p>
        )}
      </div>
      
      <div className="p-4 border-t">
        <button 
          onClick={() => setIsModalOpen(false)}
          className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
)}
</div>
      </div>
    </div>
  );
}