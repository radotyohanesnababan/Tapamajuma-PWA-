import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Printer, Users, Loader2, Calendar } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function SesiPrint() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Data Guru & Kelas
  const [teacherName, setTeacherName] = useState("Memuat Nama...");
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  
  // State untuk Tanggal (Default: Hari ini)
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // Data Absensi & UI Interaction
  const [attendances, setAttendances] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // 1. Ambil Profil Guru & Kelas yang diampu saat komponen dimuat
  useEffect(() => {
    // Ambil Profil Guru
    api.get('/api/user')
      .then(res => setTeacherName(res.data.name))
      .catch(() => setTeacherName("________________________"));

    // Ambil Kelas sesuai accessible_classes
    api.get("/api/teacher/accessible-classes")
      .then(res => setClasses(res.data))
      .catch(() => toast.error("Gagal memuat daftar kelas."));
  }, []);

  // 2. Fungsi Ambil Data Rekapitulasi
  const fetchAttendances = async (classId, start, end) => {
    if (!classId) return setAttendances([]);
    setIsLoading(true);
    
    try {
      const res = await api.get(`/api/teacher/print-session`, {
        params: {
          class_id: classId,
          start_date: start,
          end_date: end
        }
      });
      setAttendances(res.data);
      setSelectedStudent(null); // Reset rincian yang terbuka
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat rekapitulasi sesi.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Efek jika Filter Berubah
  useEffect(() => {
    if (selectedClass) {
      fetchAttendances(selectedClass, startDate, endDate);
    }
  }, [selectedClass, startDate, endDate]);

  const handlePrint = () => {
    setIsPrinting(true);
    // Tutup rincian tanggal sebelum print agar tabel rapi
    setSelectedStudent(null);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 print:bg-white print:pb-0">
      
      {/* TRIK CSS GLOBAL: Menyembunyikan Navbar Bawah (BottomNav) saat di Print */}
      <style>
        {`
          @media print {
            nav, footer, .bottom-nav, [role="navigation"], .fixed.bottom-0 {
              display: none !important;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
      </style>

      {/* STICKY HEADER - Web Only */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-4 flex items-center justify-between z-20 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-slate-50 transition-all active:scale-95">
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Cetak Rekap Sesi</h2>
            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.15em]">Laporan Keaktifan</p>
          </div>
        </div>
        
        {attendances.length > 0 && (
          <button 
            onClick={handlePrint} 
            disabled={isPrinting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70"
          >
            {isPrinting ? <Loader2 size={16} className="animate-spin"/> : <Printer size={16} />}
            CETAK
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500 mt-6 px-4 print:mt-0 print:p-0 print:animate-none">
        
        <div className="border-none rounded-[2.5rem] bg-white shadow-xl overflow-hidden p-8 md:p-12 print:shadow-none print:rounded-none print:p-0">
          
          {/* HEADER KONTEN (Logo & Judul) */}
          <div className="flex items-center justify-between mb-8 print:mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center print:hidden">
                <Users size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight print:text-xl">Rekapitulasi Keaktifan Siswa Sesi Pagi</h2>
                <p className="text-sm font-medium text-slate-400 mt-1 print:hidden">
                  Pilih parameter di bawah untuk melihat rekapitulasi data sesi belajar mandiri.
                </p>
              </div>
            </div>
          </div>

          {/* AREA FILTER - Disembunyikan saat print */}
          <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 mb-8 print:hidden flex flex-wrap gap-4 items-end">
            
            <div className="space-y-2 flex-1 min-w-[200px]">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Kelas</label>
              <select 
                className="w-full h-12 px-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">-- Pilih Kelas --</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-2 flex-1 min-w-[150px]">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dari Tanggal</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2 flex-1 min-w-[150px]">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sampai Tanggal</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                />
              </div>
            </div>

          </div>

          {/* AREA TABEL */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 print:hidden">
              <Loader2 className="animate-spin h-8 w-8 mb-4 text-indigo-500" />
              <p className="text-sm font-bold tracking-wide">Merekap data kehadiran...</p>
            </div>
          ) : attendances.length > 0 ? (
            <div className="space-y-4">

              <div className="overflow-x-auto rounded-2xl border border-slate-100 print:border-black print:rounded-none">
                <table className="w-full text-left border-collapse">
                  
                  {/* Judul Tabel Khusus Print */}
                  <caption className="mb-4 caption-top print:mb-6">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center print:text-black print:text-sm">
                      Laporan Kehadiran Aktif
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center print:text-black print:border-b print:border-black pb-2 print:text-sm">
                      Periode : {new Date(startDate).toLocaleDateString('id-ID')} s/d {new Date(endDate).toLocaleDateString('id-ID')}
                    </div>
                  </caption>

                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-100 print:bg-white print:border-black">
                      <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-black print:border-b print:border-black w-16">No</th>
                      <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-black print:border-b print:border-black">Nama Siswa</th>
                      <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-black print:border-b print:border-black text-center w-32">Total Aktif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendances.map((item, index) => (
                      <React.Fragment key={index}>
                        {/* Baris Utama (Bisa diklik di Web) */}
                        <tr 
                          onClick={() => setSelectedStudent(selectedStudent === index ? null : index)}
                          className="border-b border-slate-50 cursor-pointer hover:bg-indigo-50/50 transition-colors print:border-b print:border-slate-300 print:cursor-default print:hover:bg-transparent"
                        >
                          <td className="py-4 px-6 text-sm font-bold text-slate-500">{index + 1}</td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-800">{item.student_name}</span>
                              <span className="text-[9px] text-indigo-400 font-bold uppercase mt-0.5 print:hidden">
                                {selectedStudent === index ? "Tutup Detail ▲" : "Klik untuk rincian tanggal ▼"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-black text-sm print:bg-transparent print:text-black print:p-0">
                              {item.total_active}x
                            </span>
                          </td>
                        </tr>

                        {/* Rincian Tanggal (HANYA MUNCUL DI WEB SAAT DIKLIK) */}
                        {selectedStudent === index && item.active_dates && (
                          <tr className="bg-slate-50/50 print:hidden animate-in slide-in-from-top-2 duration-300">
                            <td colSpan="3" className="px-12 py-4 border-b border-slate-100">
                              <div className="flex items-center gap-2 mb-3">
                                <Calendar size={14} className="text-slate-400" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Riwayat Tanggal Aktif:</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {item.active_dates.map((date, dIdx) => (
                                  <span key={dIdx} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-medium text-slate-600 shadow-sm">
                                    {date}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TANDA TANGAN (Hanya Muncul Saat Diprint) */}
              <div className="hidden print:flex justify-end mt-16 pr-12">
                <div className="text-center min-w-[200px]">
                  <p className="text-sm">
                    Siborongborong, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-sm mb-24">
                    Guru Pengampu,
                  </p>
                  <p className="text-sm font-bold underline tracking-wide ">
                    {teacherName}
                  </p>
                  <p className="text-xs mt-1">
                    NIP. ...........................
                  </p>
                </div>
              </div>

            </div>
          ) : (
            selectedClass && !isLoading && (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 print:hidden">
                <p className="text-sm font-bold text-slate-400">Belum ada data kehadiran aktif pada periode ini.</p>
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
}