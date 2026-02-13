/* eslint-disable react-hooks/static-components */
import React, { useState, useEffect, useMemo } from 'react';
import api from "@/lib/axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertCircle, CheckCircle2, HelpCircle, User, X, ChevronRight, TrendingUp } from 'lucide-react';

export default function AnalysisTab() {
  const [analysisList, setAnalysisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    api.get("/api/teacher/dashboard")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setAnalysisList(data);
      })
      .catch((err) => {
        console.error(err);
        setAnalysisList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    if (!analysisList.length) return [];

    const akurat = analysisList.filter(d => Number(d.score) >= 80 && Number(d.confidence_level) >= 4).length;
    const overconfident = analysisList.filter(d => Number(d.score) < 50 && Number(d.confidence_level) >= 3).length;
    const underconfident = analysisList.filter(d => Number(d.score) >= 80 && Number(d.confidence_level) <= 2).length;
    const berkembang = analysisList.length - (akurat + overconfident + underconfident);

    return [
      { name: 'Akurat', value: akurat, color: '#10b981', icon: CheckCircle2, desc: 'Paham & Yakin' },
      { name: 'Overconfident', value: overconfident, color: '#ef4444', icon: AlertCircle, desc: 'Keliru tapi Yakin' },
      { name: 'Underconfident', value: underconfident, color: '#f59e0b', icon: HelpCircle, desc: 'Paham tapi Ragu' },
      { name: 'Berkembang', value: berkembang, color: '#3b82f6', icon: TrendingUp, desc: 'Proses Belajar' },
    ].filter(item => item.value > 0);
  }, [analysisList]);

  const handleOpenModal = (categoryName) => {
    let list = [];
    if (categoryName === 'Overconfident') {
      list = analysisList.filter(d => Number(d.score) < 50 && Number(d.confidence_level) >= 3);
    } else if (categoryName === 'Underconfident') {
      list = analysisList.filter(d => Number(d.score) >= 80 && Number(d.confidence_level) <= 2);
    } else if (categoryName === 'Akurat') {
      list = analysisList.filter(d => Number(d.score) >= 80 && Number(d.confidence_level) >= 4);
    } else {
       list = analysisList.filter(d => {
         const s = Number(d.score);
         const c = Number(d.confidence_level);
         const isAkurat = s >= 80 && c >= 4;
         const isOver = s < 50 && c >= 3;
         const isUnder = s >= 80 && c <= 2;
         return !isAkurat && !isOver && !isUnder;
       });
    }

    setSelectedCategory({ 
      name: categoryName, 
      students: list,
      meta: chartData.find(c => c.name === categoryName)
    });
    setIsModalOpen(true);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm p-2.5 border border-slate-100 shadow-xl rounded-lg text-xs z-50">
          <p className="font-bold mb-1" style={{ color: data.color }}>{data.name}</p>
          <div className="flex justify-between gap-4 text-slate-600">
            <span>Jumlah:</span>
            <span className="font-mono font-bold">{data.value}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 max-w-[120px] leading-tight">{data.desc}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        <p className="text-xs font-medium text-slate-500 animate-pulse">Menganalisis data...</p>
      </div>
    );
  }

  if (analysisList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 mx-4 mt-4">
        <div className="bg-white p-3 rounded-full shadow-sm mb-3">
          <User className="w-6 h-6 text-slate-300" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">Belum ada data</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
          Data analisis akan muncul setelah siswa mengerjakan kuis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 sm:pb-0"> {/* Padding bottom untuk mobile agar tidak tertutup menu bawah */}
      
      {/* Chart Section */}
      <Card className="border-none shadow-none sm:border sm:border-slate-100 sm:shadow-sm bg-transparent sm:bg-white overflow-hidden">
        <CardHeader className="pb-2 px-0 sm:px-6">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <span>Sebaran Pemahaman</span>
            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              Total: {analysisList.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
            {/* Chart - Responsive Size */}
            <div className="h-48 w-48 sm:h-56 sm:w-56 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={chartData} 
                    innerRadius="65%" 
                    outerRadius="100%" 
                    paddingAngle={4} 
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-800 leading-none">{analysisList.length}</span>
                <span className="text-[10px] text-slate-400 mt-1">Siswa</span>
              </div>
            </div>

            {/* Legend - Grid 2 kolom di Mobile, List Vertikal di Desktop */}
            <div className="grid grid-cols-2 sm:flex sm:flex-col gap-3 w-full sm:w-auto px-1">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: item.color }}></div>
                  <div className="flex-1 min-w-0"> {/* min-w-0 agar text truncate jalan */}
                    <div className="flex justify-between items-center gap-2">
                      <p className="text-xs font-semibold text-slate-700 truncate">{item.name}</p>
                      <span className="text-xs font-bold text-slate-900 font-mono">{item.value}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actionable Insights Section */}
      <div className="px-1 sm:px-0">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-slate-500" />
          Rekomendasi Tindakan
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {['Overconfident', 'Underconfident', 'Akurat'].map((key) => {
            const data = chartData.find(c => c.name === key);
            if (!data) return null;

            // Mapping warna untuk styling dinamis
            const colors = {
              Overconfident: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', icon: 'text-red-600', hover: 'active:bg-red-100' },
              Underconfident: { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: 'text-amber-600', hover: 'active:bg-amber-100' },
              Akurat: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-600', hover: 'active:bg-emerald-100' }
            };
            const style = colors[key];

            return (
              <div 
                key={key}
                onClick={() => handleOpenModal(key)}
                className={`
                  relative overflow-hidden p-4 rounded-xl border shadow-sm transition-all cursor-pointer
                  bg-white ${style.border} ${style.hover}
                `}
              >
                {/* Indikator samping warna */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5`} style={{ backgroundColor: data.color }}></div>
                
                <div className="flex items-start gap-3 pl-1">
                  <div className={`p-2 rounded-lg shrink-0 ${style.bg} ${style.icon}`}>
                    <data.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-slate-800 truncate pr-2">
                        {key === 'Overconfident' ? 'Prioritas Intervensi' : 
                         key === 'Underconfident' ? 'Bangun Kepercayaan' : 'Siap Pengayaan'}
                      </h4>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>
                        {data.value} Siswa
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                      {key === 'Overconfident' ? 'Siswa yakin tapi salah. Perlu perbaikan konsep segera.' :
                       key === 'Underconfident' ? 'Siswa benar tapi ragu. Butuh penguatan mental.' :
                       'Pemahaman optimal. Bisa menjadi tutor sebaya.'}
                    </p>
                  </div>
                  <ChevronRight className="text-slate-300 self-center shrink-0" size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile-Optimized Modal */}
      {isModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative bg-white w-[95%] sm:w-full sm:max-w-sm max-h-[80vh] flex flex-col shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200">
            {/* Header Sticky */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: selectedCategory.meta?.color + '20' }}>
                   {selectedCategory.meta && <selectedCategory.meta.icon size={16} style={{ color: selectedCategory.meta?.color }} />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{selectedCategory.name}</h3>
                  <p className="text-[10px] text-slate-500">{selectedCategory.students.length} Siswa Terdata</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 -mr-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* List Scrollable */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
              {selectedCategory.students.length > 0 ? (
                selectedCategory.students.map((student, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold border border-slate-200 shrink-0">
                        {student.user?.name?.substring(0, 2).toUpperCase() || 'SIS'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate max-w-[120px] sm:max-w-none">
                          {student.user?.name || 'Siswa Tanpa Nama'}
                        </span>
                        <span className="text-[10px] text-slate-400">ID: {student.user?.id || '-'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-slate-400">Skor</span>
                        <span className="text-xs font-bold text-slate-900">{student.score}</span>
                      </div>
                      {/* Bar Keyakinan Mini */}
                      <div className="flex gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-1 h-1.5 rounded-full ${i < student.confidence_level ? 'bg-slate-800' : 'bg-slate-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 px-4">
                  <p className="text-xs text-slate-400">Tidak ada siswa dalam kategori ini.</p>
                </div>
              )}
            </div>
            
            {/* Footer Sticky */}
            <div className="p-3 border-t border-slate-100 bg-white rounded-b-2xl z-10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-transform shadow-lg shadow-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}