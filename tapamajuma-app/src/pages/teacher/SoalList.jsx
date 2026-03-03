/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, Plus, Loader2, Trash2, Eye, EyeOff, CheckCircle2, Database, ChevronRight } from "lucide-react";
import api from "@/lib/axios";
import { getStorageUrl } from "@/lib/utils";
import { toast } from "sonner";

export default function SoalList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("numeracy"); 
  const [showKeyId, setShowKeyId] = useState(null);
  
  // STATE BARU UNTUK PAGINATION
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState([]); 

  // Fetch data dengan parameter halaman
const fetchQuestions = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/api/teacher/bank-soal`, {
        params: { type: filterType, page: page, search: searchQuery }
      });
      
      const responseData = res.data;
      
      // JURUS AMAN: Cek apakah data dari server berupa Array (lama) atau Object (baru)
      const actualQuestions = Array.isArray(responseData) 
        ? responseData 
        : (responseData.data || []);
      
      setQuestions(actualQuestions); 
      
      // Simpan info navigasi halaman (kalau server masih pakai ->get(), totalnya ngikut jumlah array)
      setPagination({
        current_page: responseData.current_page || 1,
        last_page: responseData.last_page || 1,
        total: responseData.total || actualQuestions.length
      });

    } catch (error) {
      toast.error("Gagal mengambil data soal");
    } finally {
      setIsLoading(false);
    }
  };

  // Otomatis fetch ulang saat filter kategori berubah
  useEffect(() => {
    fetchQuestions(1); // Reset ke hal 1 setiap ganti filter
  }, [filterType]);

  // Kalau mau search jalannya saat tekan enter, panggil fetchQuestions(1) di handler input.
  // Tapi untuk sekarang kita biarkan filter client-side jalan.

  // Fungsi pindah halaman
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      fetchQuestions(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll ke atas otomatis
    }
  };

  // Hapus Soal
  const handleDelete = async (id) => {
    if(!window.confirm("Yakin ingin menghapus soal ini?")) return;
    
    try {
      await api.delete(`/api/teacher/bank-soal/${id}`);
      toast.success("Soal berhasil dihapus");
      // Update UI langsung
      setQuestions(questions.filter(q => q.id !== id)); 
      // Update total data
      setPagination(prev => ({...prev, total: prev.total - 1}));
    } catch (error) {
      toast.error("Gagal menghapus soal");
    }
  };

  useEffect(() => {
    // Bikin jeda 500ms biar nggak spam server
    const delayDebounceFn = setTimeout(() => {
      fetchQuestions(1); // Mulai cari dari halaman 1
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

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
              placeholder="Ketik soal lalu tekan Enter..." 
              className="w-full pl-11 h-12 rounded-2xl border-none shadow-sm bg-white outline-none focus:ring-2 focus:ring-indigo-400 text-sm font-medium" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              // TAMBAHKAN INI: Server hanya dipanggil saat tombol Enter ditekan
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchQuestions(1); // Mulai cari dari halaman 1
                }
              }}
            />
            
            {/* Tombol X (Clear) opsional biar UX-nya bagus */}
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  // Karena fetchQuestions butuh waktu membaca state baru, 
                  // kita akali dengan mengirim string kosong langsung ke fungsinya (opsional)
                  setTimeout(() => fetchQuestions(1), 100); 
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 font-bold"
              >
                ✕
              </button>
            )}
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
          ) : questions.length === 0 ? (
             <div className="text-center py-24 bg-white rounded-[2.5rem] shadow-sm">
                <Database size={48} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-base font-black text-slate-800">Data Kosong</h3>
                <p className="text-xs font-medium text-slate-400 mt-1">Belum ada soal untuk pencarian ini.</p>
             </div>
          ) : (
            <>
              {/* RENDER LIST SOAL */}
              {questions.map((q) => (
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
                  {q.image && (
                    <div className="pl-2 mb-4">
                      <img src={getStorageUrl(q.image)} alt="Soal" className="h-60 object-cover rounded-xl border border-slate-100" />
                    </div>
                  )}
                  {/* Opsi Jawaban */}
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
              ))}

              {/* RENDER KOMPONEN PAGINASI BERSIH */}
              <div className="mt-10 mb-6 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="px-4 py-1.5 bg-slate-200/50 rounded-full">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Menampilkan {questions.length} dari {pagination.total} Soal
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100">
                  <button
                    disabled={pagination.current_page === 1}
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-20 disabled:hover:bg-transparent transition-all active:scale-90"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex items-center gap-1 px-4">
                    <span className="text-sm font-black text-indigo-600">{pagination.current_page}</span>
                    <span className="text-sm font-bold text-slate-300">/</span>
                    <span className="text-sm font-bold text-slate-400">{pagination.last_page}</span>
                  </div>

                  <button
                    disabled={pagination.current_page === pagination.last_page || pagination.last_page === 0}
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-20 disabled:hover:bg-transparent transition-all active:scale-90"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}