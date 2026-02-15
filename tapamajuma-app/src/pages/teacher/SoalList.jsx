/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Plus, Loader2, Trash2, Eye, EyeOff, CheckCircle2, Database } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function SoalList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("numeracy"); 
  const [showKeyId, setShowKeyId] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState([]); 

  // Ambil Data dari Database
  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/api/teacher/bank-soal?type=${filterType}`);
      setQuestions(res.data);
    } catch (error) {
      toast.error("Gagal mengambil data soal");
    } finally {
      setIsLoading(false);
    }
  };

  // Otomatis fetch ulang saat filter kategori berubah
  useEffect(() => {
    fetchQuestions();
  }, [filterType]);

  // Hapus Soal
  const handleDelete = async (id) => {
    if(!window.confirm("Yakin ingin menghapus soal ini?")) return;
    
    try {
      await api.delete(`/api/teacher/bank-soal/${id}`);
      toast.success("Soal berhasil dihapus");
      setQuestions(questions.filter(q => q.id !== id)); // Update UI
    } catch (error) {
      toast.error("Gagal menghapus soal");
    }
  };

  // Filter pencarian teks
  const filteredQuestions = questions.filter(q => 
    q.question_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* STICKY HEADER PWA */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-4 flex items-center gap-4 z-20 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all active:scale-95">
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Daftar Soal</h2>
          <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.15em]">Manajemen Data</p>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500 mt-2">
        <div className="flex flex-col sm:flex-row gap-4">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-12 px-4 rounded-2xl border-none shadow-sm bg-white text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 appearance-none"
          >
            <option value="numeracy">🔢 Numerasi</option>
            <option value="literacy">📚 Literasi</option>
            <option value="tka">🧠 TKA (HOTS)</option>
          </select>

          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              placeholder="Cari pertanyaan..." 
              className="w-full pl-11 h-12 rounded-2xl border-none shadow-sm bg-white outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
            />
          </div>
          <button 
            onClick={() => navigate('/teacher/bank-soal/add')} 
            className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-2xl px-6 font-black shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus className="mr-2" size={18}/> SOAL BARU
          </button>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <div className="text-center py-24"><Loader2 className="animate-spin h-10 w-10 mx-auto text-indigo-500"/></div>
          ) : filteredQuestions.length === 0 ? (
             <div className="text-center py-24 bg-white rounded-[2.5rem] shadow-sm">
                <Database size={48} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-base font-black text-slate-800">Data Kosong</h3>
                <p className="text-xs font-medium text-slate-400 mt-1">Belum ada soal untuk kategori ini.</p>
             </div>
          ) : (
            filteredQuestions.map((q) => (
              <div key={q.id} className="border-none rounded-[2rem] bg-white shadow-sm hover:shadow-md transition-all overflow-hidden p-6 relative">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500"></div>
                <div className="flex justify-between items-start mb-4 pl-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      {q.subject?.name || 'UMUM'}
                    </span>
                    <span className="bg-slate-50 text-slate-500 border border-slate-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      Kelas {q.target_class?.name || '?'}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(q.id)} className="p-2 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <h3 className="text-slate-800 font-bold mb-6 text-base leading-relaxed pl-2">{q.question_text}</h3>
                
                {/* Opsi Jawaban (Karena tipe datanya JSON array) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(q.options || {}).map(([key, value]) => (
                    <div key={key} className={`p-4 rounded-2xl border transition-all text-sm flex gap-3 ${key === q.correct_key && showKeyId === q.id ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${key === q.correct_key && showKeyId === q.id ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>{key}</span>
                      <span className="flex-1 font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <button onClick={() => setShowKeyId(showKeyId === q.id ? null : q.id)} className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 hover:text-indigo-700 transition-colors">
                      {showKeyId === q.id ? <EyeOff size={14}/> : <Eye size={14}/>} {showKeyId === q.id ? "Sembunyikan Kunci" : "Lihat Jawaban Benar"}
                  </button>
                  {showKeyId === q.id && (
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-xs animate-in slide-in-from-right-2">
                      <CheckCircle2 size={16} /> KUNCI: {q.correct_key}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}