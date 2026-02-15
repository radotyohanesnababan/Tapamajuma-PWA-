/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function StudentLog() {
  // --- STATE UTAMA ---
  const [students, setStudents] = useState({ data: [], current_page: 1, last_page: 1 }); 
  const [classes, setClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ class_id: "" });
  const [page, setPage] = useState(1); // State untuk Pagination
  
  // --- STATE MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activities, setActivities] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  // --- FUNGSI AMBIL DATA SISWA ---
  const fetchStudents = useCallback(() => {
    api.get('/api/admin/activity-report/student', {
      params: {
        search: searchQuery,
        class_id: filters.class_id,
        page: page // Kirim halaman ke Laravel
      }
    }).then(res => {
      setStudents(res.data.data || { data: [] });
      if (res.data.classes) {
        setClasses(res.data.classes);
      }
    }).catch(err => console.error("Gagal mengambil data:", err));
  }, [searchQuery, filters.class_id, page]);

  // Reset ke halaman 1 jika user mengetik pencarian atau mengganti filter kelas
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filters.class_id]);

  // Trigger fetch ketika ada perubahan state di atas
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchStudents]);

  // --- FUNGSI HELPER UNTUK NAMA KELAS ---
  // Mencocokkan class_id siswa dengan array classes dari Backend
  const getClassName = (classId) => {
    const matchedClass = classes.find(c => c.id === classId);
    return matchedClass ? matchedClass.name : 'Belum Atur Kelas';
  };

  // --- FUNGSI MODAL ---
  const openStudentModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
    fetchStudentActivities(student.id, startDate, endDate);
  };

  const fetchStudentActivities = (studentId, start, end) => {
    setIsLoadingActivities(true);
    api.get(`/api/admin/activity-report/student-details/${studentId}`, { 
      params: { start_date: start, end_date: end } 
    })
      .then(res => setActivities(res.data.data || []))
      .catch(err => console.error(err))
      .finally(() => setIsLoadingActivities(false));
  };

  useEffect(() => {
    if (isModalOpen && selectedStudent) {
      fetchStudentActivities(selectedStudent.id, startDate, endDate);
    }
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Log Aktivitas Siswa</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select 
            className="h-10 px-3 rounded-md border text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500"
            value={filters.class_id}
            onChange={(e) => setFilters({...filters, class_id: e.target.value})}
          >
            <option value="">Semua Kelas</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <input 
            type="text" 
            placeholder="Cari nama siswa..." 
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* TABEL SISWA */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">Nama Siswa</th>
                <th className="px-6 py-4">Total Tugas</th>
                <th className="px-6 py-4">Rata-rata Skor</th>
                <th className="px-6 py-4">Terakhir Aktif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.data && students.data.length > 0 ? (
                students.data.map((student) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => openStudentModal(student)}
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      <Avatar className="h-8 w-8 bg-indigo-100 text-indigo-600 font-bold">
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                          <span className="font-medium text-slate-700 block">{student.name}</span>
                          {/* MENGGUNAKAN HELPER UNTUK NAMA KELAS */}
                          <span className="text-xs text-slate-400">Kelas {getClassName(student.class_id)}</span> 
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-600">{student.total_tasks || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                          student.avg_score >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                          {student.avg_score ? Number(student.avg_score).toFixed(1) : '0.0'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {student.last_active 
                          ? formatDistanceToNow(new Date(student.last_active), { addSuffix: true, locale: localeId }) 
                          : 'Belum Aktif'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-500">Tidak ada data siswa ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* KONTROL PAGINATION */}
      {students.last_page > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-slate-500 font-medium">
            Halaman {students.current_page} dari {students.last_page}
          </span>
          <div className="flex gap-2">
            <button
              disabled={students.current_page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 text-sm font-medium bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sebelumnya
            </button>
            <button
              disabled={students.current_page === students.last_page}
              onClick={() => setPage(p => Math.min(students.last_page, p + 1))}
              className="px-4 py-2 text-sm font-medium bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {/* MODAL RIWAYAT DETAIL */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Riwayat: {selectedStudent.name}</h2>
                <p className="text-sm text-slate-500">Log aktivitas pembelajaran harian</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-2xl font-bold">&times;</button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {/* Filter Tanggal */}
              <div className="flex gap-4 mb-6 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Dari Tanggal</label>
                  <input type="date" className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Sampai Tanggal</label>
                  <input type="date" className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                {(startDate || endDate) && (
                  <button onClick={() => { setStartDate(""); setEndDate(""); }} className="text-sm text-slate-500 hover:text-red-500 underline pb-2">Reset</button>
                )}
              </div>

              {/* Tabel Detail Aktivitas */}
              {isLoadingActivities ? (
                <div className="py-10 text-center text-slate-500">Memuat data...</div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Tipe</th>
                        <th className="px-4 py-3">Subjek/Skor</th>
                        <th className="px-4 py-3">Jurnal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activities.length > 0 ? (
                        activities.map((act) => (
                          <tr key={act.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 whitespace-nowrap">{format(parseISO(act.created_at), 'dd MMM yyyy, HH:mm', { locale: localeId })}</td>
                            <td className="px-4 py-3"><Badge variant="outline" className="uppercase text-[10px]">{act.type}</Badge></td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-700">{act.subject || 'Umum'}</div>
                              <div className="text-xs text-slate-500">Skor: {act.score}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{act.journal}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-6 text-slate-500">Tidak ada aktivitas pada rentang tanggal ini.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}