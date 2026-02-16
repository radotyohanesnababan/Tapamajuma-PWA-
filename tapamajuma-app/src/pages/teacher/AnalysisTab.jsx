/* eslint-disable react-hooks/static-components */
import React, { useState, useEffect, useMemo } from 'react';
import api from "@/lib/axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertCircle, CheckCircle2, HelpCircle, User, X, ChevronRight, TrendingUp, BookOpen, Calendar, Filter } from 'lucide-react';

export default function AnalysisTab() {
  // Simpan data mentah dari API
  const [rawAnalysisList, setRawAnalysisList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Tab, Modal, & Filter Tanggal
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    api.get("/api/teacher/dashboard")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setRawAnalysisList(data);
      })
      .catch((err) => {
        console.error(err);
        setRawAnalysisList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // 1. FILTER TANGGAL LOKAL (Instan tanpa loading server)
  const analysisList = useMemo(() => {
    let list = rawAnalysisList;

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // Mulai dari jam 00:00:00
      list = list.filter(item => new Date(item.created_at) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Sampai jam 23:59:59
      list = list.filter(item => new Date(item.created_at) <= end);
    }

    return list;
  }, [rawAnalysisList, startDate, endDate]);

  // Helper membaca nama kelas
  const getClassName = (item) => {
    return item.user?.student_class?.name || item.user?.class?.name || item.class_name || item.user?.class_id || 'Lainnya';
  };

  // 2. AMBIL DAFTAR KELAS UNIK DARI DATA YANG SUDAH DIFILTER TANGGAL
  const availableClasses = useMemo(() => {
    const classes = new Set();
    analysisList.forEach(item => {
      if (item.user) classes.add(getClassName(item));
    });
    return Array.from(classes).sort();
  }, [analysisList]);

  // 3. FILTER DATA BERDASARKAN TAB KELAS YANG DIPILIH
  const filteredList = useMemo(() => {
    if (activeTab === 'all') return analysisList;
    return analysisList.filter(item => getClassName(item) === activeTab);
  }, [analysisList, activeTab]);

  // 4. HITUNG CHART BERDASARKAN DATA FINAL
  const chartData = useMemo(() => {
    if (!filteredList.length) return [];

    const akurat = filteredList.filter(d => Number(d.score) >= 80 && Number(d.confidence_level) >= 4).length;
    const overconfident = filteredList.filter(d => Number(d.score) < 50 && Number(d.confidence_level) >= 3).length;
    const underconfident = filteredList.filter(d => Number(d.score) >= 80 && Number(d.confidence_level) <= 2).length;
    const berkembang = filteredList.length - (akurat + overconfident + underconfident);

    return [
      { name: 'Akurat', value: akurat, color: '#10b981', icon: CheckCircle2, desc: 'Paham & Yakin' },
      { name: 'Overconfident', value: overconfident, color: '#ef4444', icon: AlertCircle, desc: 'Keliru tapi Yakin' },
      { name: 'Underconfident', value: underconfident, color: '#f59e0b', icon: HelpCircle, desc: 'Paham tapi Ragu' },
      { name: 'Berkembang', value: berkembang, color: '#3b82f6', icon: TrendingUp, desc: 'Proses Belajar' },
    ].filter(item => item.value > 0);
  }, [filteredList]);

  const handleOpenModal = (categoryName) => {
    let list = [];
    if (categoryName === 'Overconfident') {
      list = filteredList.filter(d => Number(d.score) < 50 && Number(d.confidence_level) >= 3);
    } else if (categoryName === 'Underconfident') {
      list = filteredList.filter(d => Number(d.score) >= 80 && Number(d.confidence_level) <= 2);
    } else if (categoryName === 'Akurat') {
      list = filteredList.filter(d => Number(d.score) >= 80 && Number(d.confidence_level) >= 4);
    } else {
       list = filteredList.filter(d => {
         const s = Number(d.score);
         const c = Number(d.confidence_level);
         return !(s >= 80 && c >= 4) && !(s < 50 && c >= 3) && !(s >= 80 && c <= 2);
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        <p className="text-xs font-medium text-slate-500 animate-pulse">Menganalisis data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 sm:px-6 pb-20 sm:pb-6 pt-2"> 
      
      {/* FILTER TANGGAL (INTERAKTIF) */}
      <Card className="border sm:border-slate-100 shadow-sm bg-white overflow-hidden rounded-2xl">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} className="text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800">Saring Periode Data</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Dari Tanggal</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sampai Tanggal</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            {/* Tombol Reset Muncul Kalau Ada Filter Aktif */}
            {(startDate || endDate) && (
              <div className="flex items-end justify-end sm:justify-start">
                <button 
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-lg transition-colors h-[38px] w-full sm:w-auto mt-1 sm:mt-0"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* JIKA TIDAK ADA DATA SAMA SEKALI */}
      {analysisList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 mx-4 mt-4">
          <div className="bg-white p-3 rounded-full shadow-sm mb-3">
            <User className="w-6 h-6 text-slate-300" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Belum ada data</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
            {rawAnalysisList.length > 0 ? "Tidak ada aktivitas pada rentang tanggal tersebut." : "Data analisis akan muncul setelah siswa mengerjakan tugas."}
          </p>
        </div>
      ) : (
        <>
          {/* TABS KELAS */}
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-colors shadow-sm border
                  ${activeTab === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}
                `}
              >
                Keseluruhan
              </button>
              {availableClasses.map(className => (
                <button
                  key={className}
                  onClick={() => setActiveTab(className)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-colors shadow-sm border
                    ${activeTab === className ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}
                  `}
                >
                  Kelas {className}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Section */}
          <Card className="border sm:border-slate-100 shadow-sm bg-white overflow-hidden rounded-2xl">
            <CardHeader className="pb-2 px-4 sm:px-6 pt-5">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Sebaran Pemahaman {activeTab !== 'all' && <span className="text-indigo-600">(Kelas {activeTab})</span>}</span>
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  Total: {filteredList.length} Data
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-5">
              {filteredList.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">Tidak ada data untuk kelas ini pada rentang waktu terpilih.</div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 mt-2">
                  {/* Chart */}
                  <div className="h-48 w-48 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} innerRadius="65%" outerRadius="100%" paddingAngle={4} dataKey="value" stroke="none">
                          {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-slate-800 leading-none">{filteredList.length}</span>
                      <span className="text-[10px] text-slate-400 mt-1">Siswa</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-col gap-3 w-full sm:w-auto">
                    {chartData.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                        <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: item.color }}></div>
                        <div className="flex-1 min-w-0">
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
              )}
            </CardContent>
          </Card>

          {/* Actionable Insights Section */}
          {filteredList.length > 0 && (
            <div className="pt-2">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-slate-500" />
                Rekomendasi Tindakan
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {['Overconfident', 'Underconfident', 'Akurat'].map((key) => {
                  const data = chartData.find(c => c.name === key);
                  if (!data) return null;

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
                      className={`relative overflow-hidden p-4 rounded-xl border shadow-sm transition-all cursor-pointer bg-white ${style.border} ${style.hover}`}
                    >
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
          )}
        </>
      )}

      {/* Modal Detail Kegiatan */}
      {isModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>

          <div className="relative bg-white w-full sm:max-w-md max-h-[85vh] flex flex-col shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200">
            {/* Header Sticky */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: selectedCategory.meta?.color + '20' }}>
                   {selectedCategory.meta && <selectedCategory.meta.icon size={16} style={{ color: selectedCategory.meta?.color }} />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{selectedCategory.name}</h3>
                  <p className="text-[10px] text-slate-500">
                    {activeTab !== 'all' ? `Kelas ${activeTab}` : 'Keseluruhan'} • {selectedCategory.students.length} Kegiatan
                  </p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 -mr-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {/* List Scrollable dengan Detail */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
              {selectedCategory.students.length > 0 ? (
                selectedCategory.students.map((student, idx) => (
                  <div key={idx} className="flex flex-col p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors">
                    {/* Top: Info User & Skor */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold border border-slate-200 shrink-0">
                          {student.user?.name?.substring(0, 2).toUpperCase() || 'SIS'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-800 truncate max-w-[140px] sm:max-w-[200px]">
                            {student.user?.name || 'Siswa Tanpa Nama'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Kelas {getClassName(student)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">Skor</span>
                          <span className="text-sm font-black text-slate-800">{student.score}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`w-1 h-1.5 rounded-full ${i < student.confidence_level ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Detail Kegiatan */}
                    <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white border border-slate-200 text-slate-600">
                          {student.type || 'Umum'}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Calendar size={10} />
                          {formatDate(student.created_at)}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-start gap-1.5">
                          <BookOpen size={12} className="text-slate-400 mt-0.5 shrink-0" />
                          <span className="text-[11px] font-semibold text-slate-700">
                            {student.subject || 'Tanpa Mata Pelajaran'}
                          </span>
                        </div>
                        {student.journal && (
                          <p className="text-[10px] text-slate-500 italic pl-4 border-l-2 border-slate-200 ml-1 line-clamp-2">
                            "{student.journal}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 px-4">
                  <p className="text-xs text-slate-400">Tidak ada data kegiatan di kategori ini.</p>
                </div>
              )}
            </div>
            
            {/* Footer Sticky */}
            <div className="p-3 border-t border-slate-100 bg-white rounded-b-2xl z-10">
              <button onClick={() => setIsModalOpen(false)} className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold active:scale-[0.98] transition-transform shadow-lg shadow-slate-200">
                Tutup Analisis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}