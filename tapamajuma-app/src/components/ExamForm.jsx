import React, { useState, useEffect, useCallback } from 'react';
import { Save, ListChecks, Shuffle, Filter, Search, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import DOMPurify from "dompurify";

const ExamForm = ({ setView }) => {
  const [loading, setLoading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [options, setOptions] = useState({ subjects: [], classes: [], teachers: [] });
  const [questionData, setQuestionData] = useState({ data: [], current_page: 1, last_page: 1 });
  const [filters, setFilters] = useState({ type: '', subject_id: '', class_id: '', teacher_id: '', search: '', page: 1 });

  const [formData, setFormData] = useState({
    title: '',
    subject_id: '',
    duration_minutes: 90,
    selection_mode: 'random',
    total_questions: 40,
    allowed_classes: [],
    allowed_types: { official: true, numeracy: false, tka: false, literacy: false },
    question_ids: [] 
  });

  // 1. Load Options
  useEffect(() => {
    const getOptions = async () => {
      try {
        const res = await api.get('/api/teacher/cbt/options');
        const data = res.data.subjects ? res.data : res.data.data;
        setOptions(data || { subjects: [], classes: [], teachers: [] });
      } catch (err) {
        console.error("Gagal ambil options:", err);
      }
    };
    getOptions();
  }, []);

  // 2. Fetch Soal (SSR)
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api.get(`/api/teacher/cbt/question-bank?${params}`);
      setQuestionData(res.data); 
    } catch  {
      toast.error("Gagal memuat bank soal");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (showGallery) fetchQuestions();
  }, [showGallery, fetchQuestions]);

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      allowed_types: { ...prev.allowed_types, [type]: !prev.allowed_types[type] }
    }));
  };

  const handleClassChange = (classId) => {
  setFormData(prev => {
    const isSelected = prev.allowed_classes.includes(classId);
    return {
      ...prev,
      allowed_classes: isSelected 
        ? prev.allowed_classes.filter(id => id !== classId) 
        : [...prev.allowed_classes, classId]
    };
  });
};

  const handleSelectQuestion = (id) => {
    setFormData(prev => {
      const isSelected = prev.question_ids.includes(id);
      return {
        ...prev,
        question_ids: isSelected 
          ? prev.question_ids.filter(qId => qId !== id) 
          : [...prev.question_ids, id]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const selectedTypes = Object.keys(formData.allowed_types).filter(key => formData.allowed_types[key]);

    try {
      await api.post('/api/teacher/cbt/exams', {
        ...formData,
        allowed_question_types: selectedTypes
      });
      toast.success('Paket Ujian Berhasil Disimpan!');
      setView('list');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan paket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Buat Paket Ujian Baru</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* INPUT JUDUL & SUBJECT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="block text-sm font-bold text-slate-600">Judul Ujian</label>
               <input 
                 required type="text" value={formData.title}
                 onChange={(e) => setFormData({...formData, title: e.target.value})}
                 className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-blue-500 outline-none"
                 placeholder="Misal: UTS Ganjil Matematika"
               />
             </div>
             <div className="space-y-2">
               <label className="block text-sm font-bold text-slate-600">Mata Pelajaran</label>
               <select 
                 required value={formData.subject_id} onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                 className="w-full border-2 border-slate-200 rounded-xl p-3 focus:border-blue-500 outline-none bg-white">
                 <option value="">Pilih Mapel...</option>
                 {options.subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
               </select>
             </div>
          </div>

          {/* TOGGLE MODE */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex gap-4 mb-6">
              <button type="button" onClick={() => setFormData({...formData, selection_mode: 'random'})}
                className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${formData.selection_mode === 'random' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}>
                <Shuffle className="inline mr-2" size={20} /> Acak Sistem
              </button>
              <button type="button" onClick={() => setFormData({...formData, selection_mode: 'manual'})}
                className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${formData.selection_mode === 'manual' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}>
                <ListChecks className="inline mr-2" size={20} /> Pilih Manual
              </button>
            </div>

            {/* AREA KONDISIONAL */}
            {formData.selection_mode === 'random' ? (
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-8 animate-in fade-in">
    {/* Input Durasi & Jumlah Soal (Sama seperti sebelumnya) */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-600">Durasi (Menit)</label>
        <input type="number" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-600">Jumlah Soal</label>
        <input type="number" value={formData.total_questions} onChange={e => setFormData({...formData, total_questions: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl p-3 outline-none" />
      </div>
    </div>

    {/* FILTER KELAS (SIMPLIFIED) */}
    <div className="space-y-3">
      <label className="text-sm font-bold text-slate-700">Target Kelas (Bisa pilih lebih dari satu)</label>
      <div className="flex flex-wrap gap-4">
        {/* Kita mapping dari options.classes yang sudah di-fetch sebelumnya */}
        {options.classes?.map((c) => (
          <label key={c.id} className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border-2 border-slate-100 cursor-pointer hover:border-blue-200 transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
            <input 
              type="checkbox" 
              className="w-5 h-5 accent-blue-600" 
              checked={formData.allowed_classes.includes(c.id)}
              onChange={() => handleClassChange(c.id)}
            />
            <span className="font-bold text-slate-700">{c.name}</span>
          </label>
        ))}
      </div>
      <p className="text-[11px] text-slate-400 italic">*Sistem akan mengacak soal yang hanya terdaftar di kelas yang Anda pilih.</p>
    </div>

    {/* SUMBER BANK SOAL */}
    <div className="space-y-3 pt-2">
      <label className="text-sm font-bold text-slate-700">Tipe Soal</label>
      <div className="flex flex-wrap gap-3">
        {['official', 'numeracy', 'literacy', 'tka'].map(type => (
          <label key={type} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 cursor-pointer">
            <input type="checkbox" checked={formData.allowed_types[type]} onChange={() => handleTypeChange(type)} className="w-4 h-4 accent-blue-600" />
            <span className="text-sm font-bold text-slate-700 capitalize">{type}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
              
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-center justify-between animate-in fade-in">
                <div>
                  <h4 className="font-bold text-amber-800">Mode Manual Aktif</h4>
                  <p className="text-sm text-amber-700">Terpilih: <b>{formData.question_ids.length}</b> soal</p>
                </div>
                <button type="button" onClick={() => setShowGallery(true)} className="bg-amber-600 text-white px-6 py-2 rounded-lg font-bold">
                  Buka Galeri Soal
                </button>
              </div>
            )}
          </div>

          {/* TOMBOL SUBMIT */}
          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-lg shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'MENYIMPAN...' : <><Save size={20} /> SIMPAN PAKET UJIAN</>}
          </button>
        </form>
      </div>

      {/* MODAL GALERI SOAL */}
      {showGallery && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-50 w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 bg-white border-b flex justify-between items-center">
               <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Galeri Bank Soal</h3>
               <button onClick={() => setShowGallery(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                 <X size={24} />
               </button>
            </div>

            {/* FILTER BAR */}
            <div className="p-4 bg-white border-b grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 shadow-sm">
                <select className="h-10 px-3 rounded-xl border bg-slate-50 text-sm" value={filters.type} onChange={e => setFilters({...filters, type: e.target.value, page: 1})}>
                  <option value="">Semua Tipe</option>
                  <option value="official">Resmi</option>
                  <option value="numeracy">Numerasi</option>
                  <option value="literacy">Literasi</option>
                  <option value="tka">TKA</option>
                </select>
                <select className="h-10 px-3 rounded-xl border bg-slate-50 text-sm" value={filters.subject_id} onChange={e => setFilters({...filters, subject_id: e.target.value, page: 1})}>
                   <option value="">Semua Mapel</option>
                   {options.subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select className="h-10 px-3 rounded-xl border bg-slate-50 text-sm" value={filters.class_id} onChange={e => setFilters({...filters, class_id: e.target.value, page: 1})}>
                   <option value="">Semua Kelas</option>
                   {options.classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input placeholder="Cari isi soal..." className="w-full pl-10 pr-4 h-10 rounded-xl border bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                    value={filters.search} onChange={e => setFilters({...filters, search: e.target.value, page: 1})} />
                </div>
            </div>

            {/* DAFTAR SOAL */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
               {questionData.data?.map((q) => {
                 const isSelected = formData.question_ids.includes(q.id);
                 return (
                   <div key={q.id} 
                     onClick={() => handleSelectQuestion(q.id)}
                     className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 items-start ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-white bg-white hover:border-slate-200'}`}>
                     <div className={`mt-1 rounded-full ${isSelected ? 'text-blue-600' : 'text-slate-300'}`}>
                        <CheckCircle2 size={24} fill={isSelected ? 'currentColor' : 'none'} />
                     </div>
                     <div className="flex-1">
                        <div className="flex gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded">{q.type}</span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded">{q.subject?.name}</span>
                        </div>
                        <div className="text-slate-700 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.question_text) }} />
                     </div>
                   </div>
                 )
               })}
               {questionData.data?.length === 0 && <div className="text-center py-20 text-slate-400">Soal tidak ditemukan...</div>}
            </div>

            {/* FOOTER PAGINATION */}
            <div className="p-4 bg-white border-t flex justify-between items-center">
                <div className="text-sm font-bold text-slate-500 italic">Terpilih: {formData.question_ids.length} Soal</div>
                <div className="flex gap-2">
                   <button 
                     disabled={filters.page === 1}
                     onClick={() => setFilters({...filters, page: filters.page - 1})}
                     className="px-6 py-2 border rounded-xl disabled:opacity-30 font-bold text-sm hover:bg-slate-50 transition-all">Prev</button>
                   <button 
                     disabled={filters.page >= questionData.last_page}
                     onClick={() => setFilters({...filters, page: filters.page + 1})}
                     className="px-6 py-2 bg-slate-800 text-white rounded-xl disabled:opacity-30 font-bold text-sm hover:bg-slate-700 transition-all">Next</button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamForm;