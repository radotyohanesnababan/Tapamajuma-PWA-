/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, 
  Plus, 
  Upload, 
  Trash2, 
  Search, 
  Eye, 
  EyeOff,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  ListChecks,
  ArrowLeft,
  LayoutGrid
} from "lucide-react";
import { toast } from "sonner";

export default function BankSoal() {
  // --- STATE ---
  const [view, setView] = useState('menu'); 
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]); // <--- STATE BARU UNTUK KELAS
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showKeyId, setShowKeyId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    subject_id: "",
    class_id: "", // <--- Ganti target_class jadi class_id
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    correct_key: "A"
  });

  const [csvFile, setCsvFile] = useState(null);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Ambil Soal
      const resQuestions = await api.get('/api/teacher/bank-soal');
      setQuestions(resQuestions.data);
      
      // 2. Ambil Master Mapel
      const resSubjects = await api.get('/api/admin/subjects'); 
      setSubjects(resSubjects.data);

      // 3. Ambil Master Kelas
      const resClasses = await api.get('/api/admin/classes'); 
      setClasses(resClasses.data);

    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- HANDLERS ---
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject_id) return toast.warning("Pilih Mata Pelajaran");
    if (!formData.class_id) return toast.warning("Pilih Target Kelas"); // <--- Validasi

    setIsSubmitting(true);
    try {
      const payload = {
        subject_id: formData.subject_id,
        class_id: formData.class_id, // <--- Kirim ID Kelas
        question_text: formData.question_text,
        options: {
          A: formData.option_a,
          B: formData.option_b,
          C: formData.option_c
        },
        correct_key: formData.correct_key
      };

      await api.post('/api/teacher/bank-soal', payload);
      toast.success("Soal ditambahkan");
      
      setFormData({
        subject_id: "", class_id: "", question_text: "", 
        option_a: "", option_b: "", option_c: "", correct_key: "A"
      });
      fetchData(); 
      setView('list');
    } catch (error) {
      toast.error("Gagal menyimpan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) return toast.warning("Pilih file CSV dulu");
    
    setIsSubmitting(true);
    const data = new FormData();
    data.append('file', csvFile);

    try {
      await api.post('/api/teacher/bank-soal/import', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Import CSV Berhasil!");
      setCsvFile(null);
      fetchData();
      setView('list');
    } catch (error) {
      toast.error("Gagal import. Pastikan nama Mapel dan Kelas sesuai data Master.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus soal ini?")) return;
    try {
      await api.delete(`/api/teacher/bank-soal/${id}`);
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success("Soal dihapus");
    } catch (error) {
      toast.error("Gagal menghapus");
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.subject?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          {view !== 'menu' && (
            <button onClick={() => setView('menu')} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
              <ArrowLeft className="h-6 w-6 text-slate-700"/>
            </button>
          )}
          <h1 className="text-xl font-bold flex items-center gap-3 text-slate-900">
            <BookOpen className="h-8 w-8 text-indigo-600" /> Bank Soal Guru
          </h1>
        </div>
        {view === 'menu' && <p className="text-slate-500 ml-1">Kelola soal ujian, tambahkan soal baru, atau import masal.</p>}
      </div>

      {/* VIEW 1: MENU */}
      {view === 'menu' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4">
          <div onClick={() => setView('list')} className="group cursor-pointer bg-white p-6 rounded-2xl border hover:shadow-xl hover:border-indigo-300 transition-all relative overflow-hidden">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><ListChecks size={24} /></div>
            <h3 className="text-xl font-bold mb-1">Daftar Soal</h3>
            <p className="text-sm text-slate-500">Total: {questions.length} Soal</p>
          </div>

          <div onClick={() => setView('create')} className="group cursor-pointer bg-white p-6 rounded-2xl border hover:shadow-xl hover:border-emerald-300 transition-all relative overflow-hidden">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Plus size={24} /></div>
            <h3 className="text-xl font-bold mb-1">Tambah Manual</h3>
            <p className="text-sm text-slate-500">Input satu per satu.</p>
          </div>

          <div onClick={() => setView('import')} className="group cursor-pointer bg-white p-6 rounded-2xl border hover:shadow-xl hover:border-blue-300 transition-all relative overflow-hidden">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Upload size={24} /></div>
            <h3 className="text-xl font-bold mb-1">Import CSV</h3>
            <p className="text-sm text-slate-500">Upload masal.</p>
          </div>
        </div>
      )}

      {/* VIEW 2: LIST */}
      {view === 'list' && (
        <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input placeholder="Cari soal..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Button onClick={() => setView('create')} size="sm" className="bg-slate-900"><Plus className="h-4 w-4 mr-1"/> Baru</Button>
          </div>

          <div className="grid gap-4">
            {isLoading ? <div className="text-center py-10"><Loader2 className="animate-spin h-8 w-8 mx-auto text-indigo-600"/></div> : 
             filteredQuestions.map((q) => (
                <div key={q.id} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold border border-indigo-100">
                        {q.subject ? q.subject.name : 'Unknown Mapel'}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-bold border border-slate-200">
                        {/* UPDATE: Ambil dari relasi targetClass */}
                        Kelas {q.target_class ? q.target_class.name : '?'}
                      </span>
                    </div>
                    <button onClick={() => handleDelete(q.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                  </div>
                  <h3 className="text-slate-800 font-medium mb-4 text-base">{q.question_text}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    {Object.entries(q.options || {}).map(([key, value]) => (
                      <div key={key} className={`p-3 rounded-lg border text-sm flex gap-2 ${key === q.correct_key && showKeyId === q.id ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50'}`}>
                        <span className="font-bold">{key}.</span><span>{value}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setShowKeyId(showKeyId === q.id ? null : q.id)} className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    {showKeyId === q.id ? <EyeOff size={14}/> : <Eye size={14}/>} {showKeyId === q.id ? "Sembunyikan" : "Lihat Kunci"}
                  </button>
                  {showKeyId === q.id && <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14} /> Kunci: {q.correct_key}</div>}
                </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: CREATE MANUAL */}
      {view === 'create' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border shadow-sm animate-in fade-in zoom-in-95">
          <h2 className="text-xl font-bold mb-6 border-b pb-4">Tambah Soal Baru</h2>
          <form onSubmit={handleManualSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              
              {/* DROPDOWN MAPEL */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Mata Pelajaran</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                  value={formData.subject_id}
                  onChange={e => setFormData({...formData, subject_id: e.target.value})}
                  required
                >
                  <option value="">-- Pilih Mapel --</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* DROPDOWN KELAS (UPDATE) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Target Kelas</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                  value={formData.class_id}
                  onChange={e => setFormData({...formData, class_id: e.target.value})}
                  required
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Pertanyaan</label>
              <textarea 
                className="w-full rounded-md border p-3 text-sm focus:ring-2 focus:ring-emerald-500 min-h-[100px]" required
                value={formData.question_text} onChange={e => setFormData({...formData, question_text: e.target.value})}
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
              <p className="text-sm font-bold">Pilihan Jawaban</p>
              {['A','B','C'].map((opt) => (
                <div key={opt} className="flex gap-2 items-center">
                  <span className="font-bold w-6 text-center">{opt}</span>
                  <Input required placeholder={`Pilihan ${opt}`} value={formData[`option_${opt.toLowerCase()}`]} onChange={e => setFormData({...formData, [`option_${opt.toLowerCase()}`]: e.target.value})} className="bg-white"/>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Kunci Jawaban</label>
              <select className="w-full h-10 px-3 rounded-md border text-sm bg-white" value={formData.correct_key} onChange={e => setFormData({...formData, correct_key: e.target.value})}>
                <option value="A">A</option><option value="B">B</option><option value="C">C</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setView('menu')}>Batal</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4"/> : "Simpan Soal"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 4: IMPORT */}
      {view === 'import' && (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-xl border shadow-sm text-center animate-in fade-in zoom-in-95">
          <FileSpreadsheet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Import CSV</h2>
          <p className="text-slate-500 text-sm mb-6 bg-slate-50 p-2 rounded">
            Format: <code>NamaMapel, NamaKelas, Soal, PilA, PilB, PilC, Kunci</code>
          </p>
          <form onSubmit={handleImportSubmit} className="space-y-6">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 relative cursor-pointer hover:bg-blue-50">
              <Input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="pointer-events-none text-slate-400">
                {csvFile ? <span className="text-blue-600 font-bold">{csvFile.name}</span> : "Klik untuk upload CSV"}
              </div>
            </div>
            <div className="flex gap-3 justify-center">
               <Button type="button" variant="outline" onClick={() => setView('menu')}>Batal</Button>
               <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={!csvFile || isSubmitting}>Proses Import</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}