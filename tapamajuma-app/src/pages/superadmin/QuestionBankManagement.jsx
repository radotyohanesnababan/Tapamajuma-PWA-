import React, { useState, useEffect } from 'react';
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, Trash2, Search, Eye, EyeOff, Filter,
  User, CheckCircle2, Loader2, LayoutGrid, ChevronLeft, ChevronRight 
} from "lucide-react";
import { toast } from "sonner";
import { getStorageUrl } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function QuestionBankManagement() {
  usePageTitle("Manajemen Bank Soal");
  
  // --- STATE DATA ---
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10
  });
  
  // Master Data Dropdown
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Filter State
  const [filters, setFilters] = useState({
    type: "",
    subject_id: "",
    class_id: "",
    teacher_id: "",
    search: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showKeyId, setShowKeyId] = useState(null); // ID soal yang kuncinya dibuka

  // --- FETCH DATA (Server-Side) ---
// --- FETCH DATA (Server-Side) ---
  const fetchData = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = {
        page: page,
        per_page: pagination.per_page,
        ...filters
      };

      const response = await api.get('/api/admin/questions', { params });
      const { 
        questions: questionsData, 
        subjects: subjectsData, 
        classes: classesData, 
        teachers: teachersData 

      } = response.data.data;

      // Gunakan variabel alias tadi
      setQuestions(questionsData.data);
      
      setPagination({
        current_page: questionsData.current_page,
        last_page: questionsData.last_page,
        total: questionsData.total,
        per_page: questionsData.per_page
      });

      // 2. PERBAIKI LOGIKA IF
      // Cek apakah STATE 'subjects' (di luar fungsi) masih kosong
      // Jika kosong, isi dengan 'subjectsData' (dari API)
      if (subjects.length === 0 && subjectsData?.length > 0) {
        setSubjects(subjectsData);
        setClasses(classesData);
        setTeachers(teachersData);
      }
      
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data soal");
    } finally {
      setIsLoading(false);
    }
  };

  // Effect: Fetch saat Filter berubah atau Page berubah
  // Note: Kita handle page change manual di tombol, jadi di sini cukup filter
  useEffect(() => {
    // Debounce search untuk performa
    const timer = setTimeout(() => {
        fetchData(1); // Reset ke halaman 1 setiap kali filter berubah
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); 

  // Handler Hapus
  const handleDelete = async (id) => {
    if (!window.confirm("Hapus soal ini secara permanen?")) return;
    try {
      await api.delete(`/api/admin/questions/${id}`);
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success("Soal dihapus");
    } catch  {
      toast.error("Gagal menghapus");
    }
  };

  // Handler Filter UI
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilter = () => {
    setFilters({ type: "", subject_id: "", class_id: "", teacher_id: "", search: "" });
  };

  // Handler Pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      fetchData(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
          <BookOpen className="h-8 w-8 text-indigo-600" />
          Bank Soal Sekolah
        </h1>
        <p className="text-slate-500 mt-1">
          Total {pagination.total} soal tersedia dalam database.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="max-w-6xl mx-auto bg-white p-4 rounded-xl border shadow-sm mb-6 space-y-4 sticky top-4 z-20">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Filter className="h-4 w-4"/> Filter Data
            </div>
            {(filters.type || filters.subject_id || filters.class_id || filters.teacher_id || filters.search) && (
                <Button variant="ghost" size="sm" onClick={handleResetFilter} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 text-xs">
                Reset Filter
                </Button>
            )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select 
            className="h-9 px-3 rounded-md border text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">Semua Kategori</option>
            <option value="numeracy">🔢 Numerasi</option>
            <option value="literacy">📚 Literasi</option>
            <option value="tka">🧠 TKA (HOTS)</option>
            <option value="official">📝 Soal Resmi</option>
          </select>

          <select 
            className="h-9 px-3 rounded-md border text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500"
            value={filters.subject_id}
            onChange={(e) => handleFilterChange('subject_id', e.target.value)}
          >
            <option value="">Semua Mapel</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <select 
            className="h-9 px-3 rounded-md border text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500"
            value={filters.class_id}
            onChange={(e) => handleFilterChange('class_id', e.target.value)}
          >
            <option value="">Semua Kelas</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select 
            className="h-9 px-3 rounded-md border text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500"
            value={filters.teacher_id}
            onChange={(e) => handleFilterChange('teacher_id', e.target.value)}
          >
            <option value="">Semua Guru</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
             <Input 
                placeholder="Cari isi soal..." 
                className="pl-9 h-9 bg-slate-50 text-sm"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
             />
          </div>
        </div>
      </div>

      {/* CONTENT LIST */}
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Loading / Empty State */}
        {isLoading ? (
            <div className="text-center py-20"><Loader2 className="animate-spin h-10 w-10 mx-auto text-indigo-600"/></div>
        ) : questions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
            <LayoutGrid className="h-12 w-12 mx-auto mb-3 opacity-50"/>
            <p>Tidak ada soal ditemukan dengan filter ini.</p>
            </div>
        ) : (
            <div className="grid gap-4">
            {questions.map((q) => (
                <div key={q.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
                
                {/* Header Card */}
                <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
                    <div className="flex flex-wrap gap-2 items-center">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold border uppercase
                        ${q.type === 'numeracy' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                          q.type === 'literacy' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                          'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {q.type}
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold border border-indigo-100">
                        {q.subject?.name || '-'}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold border border-emerald-100">
                        {q.student_class?.name || 'Umum'}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-1 rounded-md text-xs font-medium border border-slate-200">
                        <User size={12}/> {q.creator?.name || 'Admin'}
                    </span>
                    </div>

                    <button 
                        onClick={() => handleDelete(q.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                        title="Hapus Soal"
                    >
                    <Trash2 size={16} />
                    </button>
                </div>

                {/* Soal */}
                <div className="mb-4">
                    <h3 className="text-slate-800 font-medium text-base leading-relaxed whitespace-pre-line">
                        {q.question_text}
                    </h3>
                    {q.image && (
                        <div className="mt-3">
                        <img 
                            src={getStorageUrl(q.image)} 
                            alt="Visual Soal" 
                            className="max-h-60 rounded-lg border border-slate-200 object-contain"
                        />
                        </div>
                    )}
                </div>

                {/* Pilihan Jawaban */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {/* Parsing JSON Options jika dari Laravel dikirim sebagai JSON string, atau object langsung */}
                    {typeof q.options === 'object' && q.options !== null && Object.entries(q.options).map(([key, value]) => (
                    <div key={key} 
                        className={`p-3 rounded-lg border text-sm flex gap-3 items-start transition-colors
                        ${key === q.correct_key && showKeyId === q.id 
                            ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200' 
                            : 'bg-slate-50/50 border-slate-100 hover:bg-slate-100'}`}
                    >
                        <span className={`font-bold min-w-[24px] h-6 flex items-center justify-center rounded text-xs
                            ${key === q.correct_key && showKeyId === q.id ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                            {key}
                        </span>
                        <span className={key === q.correct_key && showKeyId === q.id ? 'text-emerald-900 font-medium' : 'text-slate-600'}>
                            {value}
                        </span>
                    </div>
                    ))}
                </div>

                {/* Footer / Toggle Key */}
                <div className="flex items-center justify-between border-t pt-3">
                    <button 
                        onClick={() => setShowKeyId(showKeyId === q.id ? null : q.id)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                    >
                        {showKeyId === q.id ? <EyeOff size={14}/> : <Eye size={14}/>}
                        {showKeyId === q.id ? "Sembunyikan Kunci" : "Lihat Kunci Jawaban"}
                    </button>

                    {showKeyId === q.id && (
                        <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                        <CheckCircle2 size={14} /> Jawaban Benar: <span className="text-lg ml-1">{q.correct_key}</span>
                        </div>
                    )}
                </div>

                </div>
            ))}
            </div>
        )}

        {/* PAGINATION CONTROLS */}
        {!isLoading && questions.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-slate-200 mt-6">
                <div className="text-sm text-slate-500">
                    Halaman <span className="font-bold text-slate-900">{pagination.current_page}</span> dari {pagination.last_page} 
                    <span className="mx-2">•</span> 
                    Total {pagination.total} Data
                </div>
                
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline" size="sm"
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                    </Button>
                    
                    {/* Simplifikasi navigasi angka page */}
                    <div className="hidden sm:flex items-center gap-1">
                        {[...Array(Math.min(5, pagination.last_page))].map((_, i) => {
                            // Logic sederhana untuk menampilkan halaman sekitar current page
                            let pageNum = i + 1;
                            if (pagination.last_page > 5) {
                                if (pagination.current_page > 3) pageNum = pagination.current_page - 2 + i;
                                if (pageNum > pagination.last_page) pageNum = pagination.last_page - (4 - i);
                            }
                            
                            if(pageNum > 0 && pageNum <= pagination.last_page) {
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={pagination.current_page === pageNum ? "default" : "ghost"}
                                        size="sm"
                                        className={`w-8 h-8 p-0 ${pagination.current_page === pageNum ? 'bg-indigo-600' : ''}`}
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                )
                            }
                            return null;
                        })}
                    </div>

                    <Button
                        variant="outline" size="sm"
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                    >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}