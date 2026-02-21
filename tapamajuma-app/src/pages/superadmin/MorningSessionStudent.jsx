import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Filter, Loader2, Trophy } from "lucide-react";
import api from "@/lib/axios";

export default function MorningSessionStudent() {
  const [studentsData, setStudentsData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Ambil daftar kelas saat pertama kali render
  useEffect(() => {
    api.get('/api/admin/activity-report/morning-session/classes-list') // Sesuaikan endpoint kelasmu
      .then(res => setClasses(res.data))
      .catch(err => console.error("Gagal mengambil kelas:", err));
  }, []);

  // Ambil data siswa setiap kali filter kelas berubah
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    const params = selectedClass ? { class_id: selectedClass } : {};
    
    api.get('/api/admin/activity-report/morning-session-details/{student_id}', { params })
      .then(res => setStudentsData(res.data.data || []))
      .catch(err => console.error("Gagal mengambil data siswa:", err))
      .finally(() => setIsLoading(false));
  }, [selectedClass]);

  const openStudentModal = (student, rank) => {
    setSelectedStudent({ ...student, rank });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Rekapitulasi Keaktifan Siswa</h1>
        
        {/* Dropdown Filter Kelas */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Filter size={16} className="text-slate-400" />
          </div>
          <select
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm appearance-none outline-none transition-all"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Semua Kelas</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CARD UNTUK TABEL */}
      <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 w-16 text-center">Rank</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Siswa</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Kelas</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Total Keaktifan</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-400">
                      <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2 text-indigo-500" />
                      Memuat data siswa...
                    </td>
                  </tr>
                ) : studentsData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center font-medium text-slate-500 bg-white">
                      Tidak ada data siswa ditemukan untuk kelas ini.
                    </td>
                  </tr>
                ) : (
                  studentsData.map((student, index) => {
                    const rank = index + 1;
                    const totalActive = Number(student.total_active || 0);

                    return (
                      <tr 
                        key={student.id} 
                        onClick={() => openStudentModal(student, rank)}
                        className="border-b border-slate-50 hover:bg-indigo-50/50 transition-colors cursor-pointer group"
                      >
                        {/* Kolom Peringkat */}
                        <td className="py-4 px-6 text-center">
                          {rank <= 3 ? (
                            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-black text-sm shadow-sm ${
                              rank === 1 ? 'bg-amber-100 text-amber-600' :
                              rank === 2 ? 'bg-slate-200 text-slate-600' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {rank}
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-slate-400">{rank}</span>
                          )}
                        </td>

                        {/* Kolom Profil Siswa */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 bg-indigo-100 text-indigo-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">
                              {student.name}
                            </span>
                          </div>
                        </td>

                        {/* Kolom Kelas */}
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">
                            {student.class_name}
                          </span>
                        </td>

                        {/* Kolom Keaktifan */}
                        <td className="py-4 px-6 text-center">
                           <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1 text-sm font-black shadow-sm">
                            {totalActive} Sesi
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL DETAIL SISWA */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="bg-indigo-600 p-8 text-center relative">
               <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-4 right-5 text-white/70 hover:text-white text-2xl font-bold leading-none active:scale-90 transition-transform"
              >
                &times;
              </button>
              <Avatar className="h-20 w-20 bg-white text-indigo-600 font-bold mx-auto mb-4 shadow-xl border-4 border-indigo-400/30">
                  <AvatarFallback className="text-3xl">{selectedStudent.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-white">{selectedStudent.name}</h2>
              <p className="text-indigo-200 text-sm mt-1">{selectedStudent.class_name}</p>
              
              {selectedStudent.rank <= 3 && (
                <div className="absolute top-4 left-4 flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-black px-2 py-1 rounded-lg shadow-sm">
                  <Trophy size={14} /> Top {selectedStudent.rank}
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex items-center justify-between p-5 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-900">Total Aktif</p>
                    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 mt-1">Sesi Pagi</p>
                  </div>
                </div>
                <span className="text-3xl font-black text-emerald-700">{selectedStudent.total_active}</span>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full mt-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Tutup Ringkasan
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}