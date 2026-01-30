/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Trash2, 
  Search, 
  Eye, 
  EyeOff,
  Filter,
  User,
  CheckCircle2,
  Loader2,
  LayoutGrid
} from "lucide-react";
import { toast } from "sonner";
import { usePageTitle } from '@/hooks/usePageTitle';

export default function QuestionBankManagement() {
    usePageTitle("Manajemen Bank Soal");
  // --- STATE ---
  const [questions, setQuestions] = useState([]);
  
  // Master Data untuk Filter
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Filter State
  const [filters, setFilters] = useState({
    subject_id: "",
    class_id: "",
    teacher_id: "",
    search: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showKeyId, setShowKeyId] = useState(null);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Mengirim parameter filter ke backend
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/api/admin/questions?${params}`);
      
      setQuestions(response.data.questions);
      
      // Set Master Data hanya sekali (atau update jika perlu)
      if (subjects.length === 0) {
        setSubjects(response.data.subjects);
        setClasses(response.data.classes);
        setTeachers(response.data.teachers);
      }
    } catch (error) {
      toast.error("Gagal memuat data soal");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch saat component mount atau filter berubah
  useEffect(() => {
    // Debounce search sedikit agar tidak spam request saat ketik
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleDelete = async (id) => {
    if (!window.confirm("Admin: Hapus soal ini secara permanen?")) return;
    try {
      await api.delete(`/api/admin/questions/${id}`);
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success("Soal dihapus");
    } catch (error) {
      toast.error("Gagal menghapus");
    }
  };

  // Helper Handle Change Filter
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilter = () => {
    setFilters({ subject_id: "", class_id: "", teacher_id: "", search: "" });
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
          Memantau dan mengelola koleksi soal ujian yang dibuat oleh guru.
        </p>
      </div>

      {/* FILTER BAR (Khusus Admin) */}
      <div className="max-w-6xl mx-auto bg-white p-4 rounded-xl border shadow-sm mb-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <Filter className="h-4 w-4"/> Filter Data
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filter Mapel */}
          <select 
            className="h-10 px-3 rounded-md border text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500"
            value={filters.subject_id}
            onChange={(e) => handleFilterChange('subject_id', e.target.value)}
          >
            <option value="">Semua Mapel</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          {/* Filter Kelas */}
          <select 
            className="h-10 px-3 rounded-md border text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500"
            value={filters.class_id}
            onChange={(e) => handleFilterChange('class_id', e.target.value)}
          >
            <option value="">Semua Kelas</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Filter Guru */}
          <select 
            className="h-10 px-3 rounded-md border text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500"
            value={filters.teacher_id}
            onChange={(e) => handleFilterChange('teacher_id', e.target.value)}
          >
            <option value="">Semua Guru</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          {/* Search */}
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
             <Input 
                placeholder="Cari isi soal..." 
                className="pl-9 h-10 bg-slate-50"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
             />
          </div>
        </div>

        {/* Reset Button */}
        {(filters.subject_id || filters.class_id || filters.teacher_id || filters.search) && (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleResetFilter} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              Reset Filter
            </Button>
          </div>
        )}
      </div>

      {/* CONTENT LIST */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
           <h2 className="font-bold text-lg text-slate-700">Daftar Soal ({questions.length})</h2>
        </div>

        <div className="grid gap-4">
            {isLoading ? (
              <div className="text-center py-10"><Loader2 className="animate-spin h-8 w-8 mx-auto text-indigo-600"/></div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
                <LayoutGrid className="h-10 w-10 mx-auto mb-2 opacity-50"/>
                <p>Tidak ada soal ditemukan dengan filter ini.</p>
              </div>
            ) : (
              questions.map((q) => (
                <div key={q.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
                  
                  {/* Header Card */}
                  <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      {/* Badge Mapel */}
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold border border-indigo-100">
                        {q.subject ? q.subject.name : 'Unknown'}
                      </span>
                      {/* Badge Kelas */}
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold border border-emerald-100">
                        Kelas {q.target_class ? q.target_class.name : '?'}
                      </span>
                      {/* Badge Creator (Khusus Admin) */}
                      <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-medium border border-slate-200">
                        <User size={12}/> {q.creator ? q.creator.name : 'Admin'}
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
                  <h3 className="text-slate-800 font-medium mb-4 text-base leading-relaxed">
                    {q.question_text}
                  </h3>

                  {/* Pilihan Jawaban */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    {Object.entries(q.options || {}).map(([key, value]) => (
                      <div key={key} className={`p-3 rounded-lg border text-sm flex gap-2 ${key === q.correct_key && showKeyId === q.id ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-100'}`}>
                        <span className="font-bold min-w-[20px]">{key}.</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Toggle Kunci */}
                  <button 
                    onClick={() => setShowKeyId(showKeyId === q.id ? null : q.id)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    {showKeyId === q.id ? <EyeOff size={14}/> : <Eye size={14}/>}
                    {showKeyId === q.id ? "Sembunyikan Kunci" : "Lihat Kunci Jawaban"}
                  </button>

                  {showKeyId === q.id && (
                    <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                      <CheckCircle2 size={14} /> Kunci: {q.correct_key}
                    </div>
                  )}
                </div>
              ))
            )}
        </div>
      </div>

    </div>
  );
}