/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, Plus, Upload, Trash2, Search, Eye, EyeOff,
  FileSpreadsheet, CheckCircle2, Loader2, ListChecks,
  ArrowLeft, Download, Zap, Database, Layers,
  Badge
} from "lucide-react";
import { toast } from "sonner";

export default function BankSoal() {
  const [view, setView] = useState('menu');
  const [isDownloading, setIsDownloading] = useState(false); 
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showKeyId, setShowKeyId] = useState(null);

  const [formData, setFormData] = useState({
    subject_id: "", class_id: "", question_text: "",
    option_a: "", option_b: "", option_c: "", option_d: "", option_e: "", correct_key: "A"
  });

  const [xlsxFile, setXlsxFile] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resQ, resS, resC] = await Promise.all([
        api.get('/api/teacher/bank-soal'),
        api.get('/api/admin/subjects'),
        api.get('/api/admin/classes')
      ]);
      setQuestions(resQ.data);
      setSubjects(resS.data);
      setClasses(resC.data);
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject_id || !formData.class_id) return toast.warning("Lengkapi Mapel & Kelas!");
    setIsSubmitting(true);
    try {
      const payload = {
        subject_id: formData.subject_id,
        class_id: formData.class_id,
        question_text: formData.question_text,
        options: { A: formData.option_a, B: formData.option_b, C: formData.option_c, D: formData.option_d, E: formData.option_e },
        correct_key: formData.correct_key
      };
      await api.post('/api/teacher/bank-soal', payload);
      toast.success("Soal berhasil disimpan! ✨");
      setFormData({ subject_id: "", class_id: "", question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", option_e: "", correct_key: "A" });
      fetchData(); 
      setView('list');
    } catch { toast.error("Gagal menyimpan"); } finally { setIsSubmitting(false); }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!xlsxFile) return toast.warning("Pilih file dulu!");
    setIsSubmitting(true);
    const data = new FormData();
    data.append('file', xlsxFile);
    try {
      await api.post('/api/teacher/bank-soal/import', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success("Import masal sukses! 🚀");
      setXlsxFile(null);
      fetchData();
      setView('list');
    } catch { toast.error("Cek format Excel Anda"); } finally { setIsSubmitting(false); }
  };

  const downloadTemplate = async () => {
    setIsDownloading(true);
    try {
        const response = await api.get('/api/teacher/bank-soal/template', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'template_bank_soal.xlsx'); 
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch { toast.error("Gagal unduh template"); } finally { setIsDownloading(false); }
  };

  const filteredQuestions = questions.filter(q => 
    q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.subject?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 pb-24 space-y-8 max-w-5xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start pt-2">
        <div className="flex items-center gap-3">
          {view !== 'menu' && (
            <Button variant="ghost" onClick={() => setView('menu')} className="rounded-2xl h-12 w-12 p-0 bg-white shadow-sm">
              <ArrowLeft className="text-slate-600" />
            </Button>
          )}
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bank Soal Guru</h1>
            <div className="flex items-center gap-2">
              <Database className="text-indigo-500" size={12} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pusat Data Ujian</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
           <BookOpen className="text-indigo-600" size={24} />
        </div>
      </div>

      {/* VIEW 1: MENU UTAMA */}
      {view === 'menu' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
          {[
            { id: 'list', title: 'Daftar Soal', desc: `${questions.length} Soal Tersedia`, icon: <ListChecks />, color: 'indigo', light: 'bg-indigo-50', text: 'text-indigo-600' },
            { id: 'create', title: 'Tambah Manual', desc: 'Input soal satu-per-satu', icon: <Plus />, color: 'emerald', light: 'bg-emerald-50', text: 'text-emerald-600' },
            { id: 'import', title: 'Import Masal', desc: 'Gunakan template Excel', icon: <Upload />, color: 'blue', light: 'bg-blue-50', text: 'text-blue-600' }
          ].map((item) => (
            <Card key={item.id} onClick={() => setView(item.id)} className="group cursor-pointer border-none rounded-[2.5rem] bg-white shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
               <div className={`absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${item.text}`}>
                  {React.cloneElement(item.icon, { size: 120 })}
               </div>
               <CardContent className="p-8">
                  <div className={`w-14 h-14 ${item.light} ${item.text} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    {React.cloneElement(item.icon, { size: 28 })}
                  </div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1">{item.title}</h3>
                  <p className="text-xs font-medium text-slate-400">{item.desc}</p>
               </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* VIEW 2: DAFTAR SOAL */}
      {view === 'list' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input placeholder="Cari pertanyaan atau mata pelajaran..." className="pl-11 h-12 rounded-2xl border-none shadow-sm bg-white" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Button onClick={() => setView('create')} className="bg-indigo-600 hover:bg-indigo-700 h-12 rounded-2xl px-6 font-black shadow-lg shadow-indigo-100"><Plus className="mr-2" size={18}/> SOAL BARU</Button>
          </div>

          <div className="grid gap-4">
            {isLoading ? <div className="text-center py-20"><Loader2 className="animate-spin h-10 w-10 mx-auto text-indigo-500"/></div> : 
             filteredQuestions.map((q) => (
                <Card key={q.id} className="border-none rounded-[2rem] bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-indigo-50 text-indigo-600 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                          {q.subject?.name || 'General'}
                        </Badge>
                        <Badge className="bg-slate-100 text-slate-500 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                          Kelas {q.target_class?.name || '?'}
                        </Badge>
                      </div>
                      <Button variant="ghost" onClick={() => fetchData(q.id)} className="h-8 w-8 p-0 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    <h3 className="text-slate-800 font-bold mb-6 text-base leading-relaxed">{q.question_text}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(q.options || {}).map(([key, value]) => (
                        <div key={key} className={`p-4 rounded-2xl border transition-all text-sm flex gap-3 ${key === q.correct_key && showKeyId === q.id ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] ${key === q.correct_key && showKeyId === q.id ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}>{key}</span>
                          <span className="flex-1">{value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <button onClick={() => setShowKeyId(showKeyId === q.id ? null : q.id)} className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2 hover:opacity-70">
                            {showKeyId === q.id ? <EyeOff size={14}/> : <Eye size={14}/>} {showKeyId === q.id ? "Sembunyikan Kunci" : "Lihat Jawaban Benar"}
                        </button>
                        {showKeyId === q.id && (
                          <div className="flex items-center gap-2 text-emerald-600 font-black text-xs animate-in slide-in-from-right-2">
                            <CheckCircle2 size={14} /> KUNCI: {q.correct_key}
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: CREATE MANUAL */}
      {view === 'create' && (
        <div className="max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-500">
          <Card className="border-none rounded-[2.5rem] bg-white shadow-xl overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Zap size={24} /></div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Buat Soal Baru</h2>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mata Pelajaran</label>
                    <select className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-none text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-400" value={formData.subject_id} onChange={e => setFormData({...formData, subject_id: e.target.value})} required>
                      <option value="">-- Pilih Mapel --</option>
                      {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Kelas</label>
                    <select className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-none text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-400" value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})} required>
                      <option value="">-- Pilih Kelas --</option>
                      {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pertanyaan Utama</label>
                  <textarea className="w-full rounded-2xl bg-slate-50 border-none p-5 text-sm font-medium focus:ring-2 focus:ring-emerald-400 min-h-[120px] shadow-inner" required placeholder="Tuliskan butir soal di sini..." value={formData.question_text} onChange={e => setFormData({...formData, question_text: e.target.value})} />
                </div>

                <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pilihan Jawaban (A-E)</p>
                  {['A','B','C','D','E'].map((opt) => (
                    <div key={opt} className="flex gap-4 items-center">
                      <span className="font-black text-slate-300 w-4">{opt}</span>
                      <Input required placeholder={`Teks pilihan ${opt}...`} value={formData[`option_${opt.toLowerCase()}`]} onChange={e => setFormData({...formData, [`option_${opt.toLowerCase()}`]: e.target.value})} className="bg-white rounded-xl border-none h-11 shadow-sm focus-visible:ring-emerald-400"/>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kunci Jawaban Benar</label>
                    <select className="w-full h-12 px-4 rounded-2xl bg-emerald-50 border-none text-emerald-700 font-black outline-none focus:ring-2 focus:ring-emerald-400" value={formData.correct_key} onChange={e => setFormData({...formData, correct_key: e.target.value})}>
                      {['A','B','C','D','E'].map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="ghost" className="flex-1 rounded-2xl font-bold" onClick={() => setView('menu')}>Batal</Button>
                    <Button type="submit" className="flex-[2] bg-emerald-600 hover:bg-emerald-700 rounded-2xl h-12 font-black shadow-lg shadow-emerald-100" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin h-4 w-4"/> : "SIMPAN SOAL ✨"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* VIEW 4: IMPORT XLSX */}
{view === 'import' && (
  <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-500">
    <Card className="border-none rounded-[2rem] sm:rounded-[2.5rem] bg-white shadow-xl text-center overflow-hidden">
      {/* Padding disesuaikan: p-6 di HP, p-10 di Laptop */}
      <CardContent className="p-6 sm:p-10">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 text-blue-600 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-inner">
          <FileSpreadsheet className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mb-2">Import Masal via Excel</h2>
        <p className="text-[10px] sm:text-xs font-medium text-slate-500 mb-6 sm:mb-8 px-2 sm:px-8 leading-relaxed">
          Pastikan format file Anda sesuai dengan template sistem untuk menghindari error.
        </p>
        
        <div className="bg-blue-50/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-6 sm:mb-8 border border-blue-100/50 border-dashed">
          <p className="text-[9px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 text-center">Langkah 1: Gunakan Template</p>
          <Button 
            variant="outline" 
            onClick={downloadTemplate} 
            disabled={isDownloading} 
            className="w-full sm:w-auto rounded-xl sm:rounded-2xl border-blue-200 text-blue-600 font-black text-[10px] px-6 h-10 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
             {isDownloading ? <Loader2 size={14} className="animate-spin mr-2"/> : <Download size={14} className="mr-2"/>}
             DOWNLOAD TEMPLATE
          </Button>
        </div>

        <form onSubmit={handleImportSubmit} className="space-y-6">
          <div className="space-y-3">
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-left ml-2">Langkah 2: Unggah File</p>
              {/* Padding dropzone dikurangi untuk HP */}
              <div className="border-4 border-dashed border-slate-100 rounded-[1.5rem] sm:rounded-[2.5rem] p-8 sm:p-12 relative cursor-pointer hover:bg-slate-50 group transition-colors">
                <input 
                  type="file" 
                  accept=".xlsx" 
                  onChange={e => setXlsxFile(e.target.files[0])} 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                />
                <div className="text-center space-y-2">
                    <Layers size={28} className="mx-auto text-slate-300 group-hover:text-blue-400 transition-colors" />
                    <div className="text-[10px] sm:text-xs font-black text-slate-400 break-all px-2">
                        {xlsxFile ? (
                          <span className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full inline-block border border-blue-100">
                            ✅ {xlsxFile.name.length > 20 ? xlsxFile.name.substring(0, 20) + '...' : xlsxFile.name}
                          </span>
                        ) : "Klik atau Tarik file .xlsx"}
                    </div>
                </div>
              </div>
          </div>

          {/* PERBAIKAN TOMBOL: Stacked on Mobile, Row on Desktop */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full sm:flex-1 rounded-xl sm:rounded-2xl font-bold h-12 sm:h-14" 
              onClick={() => setView('menu')}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:flex-[2] bg-blue-600 hover:bg-blue-700 rounded-xl sm:rounded-2xl h-12 sm:h-14 font-black shadow-lg shadow-blue-100 transition-all active:scale-95" 
              disabled={!xlsxFile || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Upload className="mr-2" size={16} />
              )}
              {isSubmitting ? "PROSES..." : "IMPORT SEKARANG"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
)}
    </div>
  );
}