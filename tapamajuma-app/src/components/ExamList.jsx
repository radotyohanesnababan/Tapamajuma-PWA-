import React, { useState, useEffect } from 'react';
import { Play, Trash2, Eye, RefreshCw, X, Check, FileText, MonitorPlay, BarChart2 } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

const ExamList = ({ setView, setActiveExam }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedExamTitle, setSelectedExamTitle] = useState('');

  const fetchExams = async () => {
    try {
      const res = await api.get('/api/teacher/cbt/exams');
      setExams(res.data.data || []);
    } catch (err) {
      toast.error("Gagal memuat daftar paket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExams(); }, []);

  const handleOpenPreview = async (exam) => {
    setSelectedExamTitle(exam.title);
    setPreviewLoading(true);
    setShowPreview(true);
    try {
      const res = await api.get(`/api/teacher/cbt/exams/${exam.id}/preview`);
      setPreviewData(res.data.data);
    } catch (err) {
      toast.error("Gagal memuat detail soal");
      setShowPreview(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus paket ujian ini? Data hasil ujian (jika ada) juga akan hilang.")) return;
    try {
      const res = await api.delete(`/api/teacher/cbt/exams/${id}`);
      toast.success(res.data.message);
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus paket");
    }
  };

  const handleReleaseToken = async (id) => {
    try {
      toast.loading("Sedang merilis token...");
      const res = await api.post(`/api/teacher/cbt/exams/${id}/release-token`);
      toast.dismiss();
      if (res.data.status === 'success') {
        toast.success("Token Berhasil Dirilis!");
        fetchExams(); 
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Gagal merilis token");
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400">Memuat paket...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Daftar Paket Ujian</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Manajemen & Monitoring Real-time</p>
          </div>
          <button onClick={fetchExams} className="p-3 bg-white text-slate-400 hover:text-blue-600 hover:rotate-180 transition-all duration-500 rounded-2xl border shadow-sm">
            <RefreshCw size={20} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-slate-50 text-slate-400 text-[10px] uppercase tracking-[0.2em]">
              <tr>
                <th className="p-6 font-black">Detail Paket</th>
                <th className="p-6 font-black text-center">Status</th>
                <th className="p-6 font-black text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="font-black text-slate-700 text-base uppercase leading-tight">{exam.title}</div>
                    <div className="flex gap-3 mt-2">
                       <span className="text-[10px] text-blue-600 font-black bg-blue-50 px-2 py-0.5 rounded uppercase">{exam.subject?.name}</span>
                       <span className="text-[10px] text-slate-400 font-bold uppercase">{exam.total_questions} Soal • {exam.duration_minutes} Menit</span>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                     <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter ${
                       exam.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                     }`}>
                       {exam.status}
                     </span>
                  </td>
                  <td className="p-6 flex justify-center gap-2">
                    <button onClick={() => handleOpenPreview(exam)} className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm" title="Pratinjau Soal">
                      <Eye size={18} />
                    </button>
                    
                    <button 
                      onClick={() => { setActiveExam(exam); setView('results'); }} 
                      className="p-3 bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all shadow-sm" 
                      title="Lihat Laporan Nilai"
                    >
                      <BarChart2 size={18} />
                    </button>

                    <button 
                      onClick={() => exam.status === 'active' ? (setActiveExam(exam), setView('live')) : handleReleaseToken(exam.id)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black shadow-lg transition-all ${
                        exam.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-100' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'
                      }`}
                    >
                      {exam.status === 'active' ? <><MonitorPlay size={16} /> MONITOR LIVE</> : <><Play size={16} fill="currentColor" /> RILIS TOKEN</>}
                    </button>

                    <button onClick={() => handleDelete(exam.id)} className="p-3 text-red-300 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all" title="Hapus Paket">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL PREVIEW --- */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
          <div className="bg-slate-50 w-full max-w-5xl h-full max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 md:p-8 bg-white border-b flex justify-between items-center">
               <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={24} /></div>
                 <div>
                   <h3 className="text-xl font-black text-slate-800 uppercase leading-none">{selectedExamTitle}</h3>
                   <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Daftar Soal Terkunci</p>
                 </div>
               </div>
               <button onClick={() => setShowPreview(false)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
               {previewLoading ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                    <RefreshCw size={40} className="animate-spin text-blue-500" />
                    <span className="font-bold">Menyusun pratinjau soal...</span>
                 </div>
               ) : (
                 previewData.map((q, index) => (
                   <div key={q.id} className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <div className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase">Pertanyaan #{index + 1}</div>
                        <div className="flex gap-2">
                           <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg uppercase">{q.type}</span>
                        </div>
                      </div>
                      <div className="text-slate-800 text-lg leading-relaxed font-medium mb-8" dangerouslySetInnerHTML={{ __html: q.question_text }} />
                      {q.options && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(typeof q.options === 'string' ? JSON.parse(q.options) : q.options).map(([key, value]) => (
                            <div key={key} className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${key === q.correct_key ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 bg-slate-50'}`}>
                              <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm ${key === q.correct_key ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border'}`}>
                                {key.toUpperCase()}
                              </div>
                              <div className={`flex-1 text-sm font-bold ${key === q.correct_key ? 'text-emerald-700' : 'text-slate-600'}`}>{value}</div>
                              {key === q.correct_key && <Check size={20} className="text-emerald-500" />}
                            </div>
                          ))}
                        </div>
                      )}
                   </div>
                 ))
               )}
            </div>

            <div className="p-6 bg-white border-t flex justify-center">
               <button onClick={() => setShowPreview(false)} className="bg-slate-900 text-white px-10 py-3 rounded-2xl font-black text-sm shadow-xl hover:bg-slate-800">TUTUP PRATINJAU</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamList;