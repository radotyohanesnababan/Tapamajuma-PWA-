import React, { useState, useEffect } from 'react';
import { Search, Printer, User, CheckCircle2, XCircle, ChevronLeft, Filter } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

const ExamResultsList = ({ exam, setView }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State Kelas
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [availableClasses, setAvailableClasses] = useState(['Semua']);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/teacher/cbt/exams/${exam.id}/results`);
      const data = res.data.data || [];
      setResults(data);
            const classes = ['Semua', ...new Set(
        data.map(item => item.user?.student_class?.name).filter(Boolean)
      )].sort();
      setAvailableClasses(classes);
    } catch (err) {
      toast.error("Gagal memuat daftar nilai");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResults(); }, [exam.id]);

  // Handle Cetak PDF
  const handlePrint = () => {
    window.print();
  };

  const filteredResults = results.filter(r => {
    const matchName = r.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    // Cocokkan dengan nama kelas dari relasi classes
    const matchClass = selectedClass === 'Semua' || r.user?.student_class?.name === selectedClass;
    return matchName && matchClass;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 print:space-y-2 print:bg-white print:m-0 print:p-0">
      
      {/* HEADER (Sembunyi saat cetak) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
           <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase mb-2">
              <ChevronLeft size={16} /> Kembali ke Daftar
           </button>
           <h2 className="text-2xl font-black text-slate-800 uppercase">{exam.title}</h2>
           <p className="text-sm font-bold text-slate-400 tracking-widest uppercase italic">Laporan Hasil Ujian</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari Nama Siswa..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <Printer size={18} /> CETAK PDF
          </button>
        </div>
      </div>

      {/* FILTER KELAS (Sembunyi saat cetak) */}
      <div className="flex flex-col gap-3 print:hidden">
        <div className="flex items-center gap-2 text-slate-400">
           <Filter size={16} />
           <span className="text-[10px] font-black uppercase tracking-widest">Filter Berdasarkan Kelas</span>
        </div>
        <div className="flex flex-wrap gap-2">
           {availableClasses.map((cls) => (
             <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-5 py-2 rounded-2xl text-xs font-black transition-all border-2 ${
                  selectedClass === cls 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200' 
                  : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-600'
                }`}
             >
               {cls === 'Semua' ? 'SEMUA KELAS' : `KELAS ${cls}`}
             </button>
           ))}
        </div>
      </div>

      {/* HEADER KHUSUS CETAK (Hanya muncul saat print) */}
      <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-black uppercase">LAPORAN HASIL UJIAN CBT</h1>
        <h2 className="text-lg font-bold uppercase">{exam.title}</h2>
        <p className="text-sm">Filter: {selectedClass === 'Semua' ? 'Semua Kelas' : `Kelas ${selectedClass}`} | Mapel: {exam.subject?.name}</p>
      </div>

      {/* TABLE RESULTS */}
      <div className="bg-white rounded-[2.5rem] print:rounded-none border border-slate-100 print:border-none shadow-sm print:shadow-none overflow-hidden">
        <table className="w-full text-left border-collapse print:text-sm print:border print:border-black">
          <thead>
            <tr className="bg-slate-50/50 print:bg-gray-200 border-b border-slate-100 print:border-black text-[10px] print:text-xs font-black text-slate-400 print:text-black uppercase tracking-widest">
              <th className="p-6 print:p-2 print:border-r print:border-black">No</th>
              <th className="p-6 print:p-2 print:border-r print:border-black">Nama Siswa</th>
              <th className="p-6 print:p-2 print:border-r print:border-black">Kelas</th>
              <th className="p-6 print:p-2 text-center print:border-r print:border-black">Benar</th>
              <th className="p-6 print:p-2 text-center print:border-r print:border-black">Salah</th>
              <th className="p-6 print:p-2 text-center print:border-r print:border-black">Skor</th>
              <th className="p-6 print:p-2 text-center print:hidden">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 print:divide-black">
            {loading ? (
              <tr><td colSpan="7" className="p-20 text-center font-bold text-slate-300">Memproses data nilai...</td></tr>
            ) : filteredResults.length > 0 ? (
              filteredResults.map((res, index) => (
                <tr key={res.id} className="hover:bg-slate-50/50 transition-colors group print:border-b print:border-black">
                  <td className="p-6 print:p-2 font-mono font-black text-slate-400 print:text-black print:border-r print:border-black">
                    {index + 1}
                  </td>
                  <td className="p-6 print:p-2 print:border-r print:border-black">
                    <span className="font-bold text-slate-700 print:text-black">{res.user?.name}</span>
                  </td>
                  <td className="p-6 print:p-2 font-bold text-slate-500 print:text-black print:border-r print:border-black">
                    {res.user?.student_class?.name || '-'}
                  </td>
                  <td className="p-6 print:p-2 text-center font-bold text-emerald-500 print:text-black print:border-r print:border-black">
                    {res.correct_answers}
                  </td>
                  <td className="p-6 print:p-2 text-center font-bold text-red-400 print:text-black print:border-r print:border-black">
                    {res.wrong_answers}
                  </td>
                  <td className="p-6 print:p-2 text-center print:border-r print:border-black">
                    <span className="text-xl print:text-base font-black text-slate-800 print:text-black">
                       {res.score}
                    </span>
                  </td>
                  <td className="p-6 text-center print:hidden">
                     {res.score >= 75 ? (
                       <span className="bg-emerald-100 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center justify-center gap-2 w-fit mx-auto">
                          <CheckCircle2 size={14} /> Tuntas
                       </span>
                     ) : (
                       <span className="bg-red-50 text-red-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center justify-center gap-2 w-fit mx-auto">
                          <XCircle size={14} /> Remedial
                       </span>
                     )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" className="p-20 text-center font-bold text-slate-300 uppercase tracking-widest print:text-black">Belum ada data nilai / Kelas tidak ditemukan</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamResultsList;