import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from "@/lib/axios";

export default function TeacherSummary() {
  const [teachersData, setTeachersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    api.get('/api/admin/activity-report/teacher-summary')
      .then(res => setTeachersData(res.data.data || []))
      .catch(err => console.error("Gagal mengambil data guru:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const openTeacherModal = (teacher, rank) => {
    setSelectedTeacher({ ...teacher, rank });
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Memuat log aktivitas guru...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Log Aktivitas Guru</h1>
      </div>

      {/* GRID KARTU GURU */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachersData.map((teacher, index) => {
          const rank = index + 1; // Karena dari backend sudah di-sortDesc
          const totalSessions = Number(teacher.total_sessions || 0);
          const totalQuestions = Number(teacher.total_questions || 0);

          return (
            <Card 
              key={teacher.id} 
              onClick={() => openTeacherModal(teacher, rank)}
              className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-1 group"
            >
              <CardHeader className="pb-4 border-b border-slate-50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-indigo-100 text-indigo-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-700">
                      {teacher.name}
                    </CardTitle>
                    <p className="text-xs text-slate-400">Guru / Pengajar</p>
                  </div>
                </div>
                {/* Badge Peringkat Mini */}
                {rank <= 3 && (
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
                    Top {rank}
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Kolom Info Sesi */}
                  <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium mb-1">Sesi Keaktifan</p>
                    <p className="text-2xl font-black text-slate-700">{totalSessions}</p>
                  </div>
                  
                  {/* Kolom Info Soal */}
                  <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium mb-1">Soal Dibuat</p>
                    <p className="text-2xl font-black text-slate-700">{totalQuestions}</p>
                  </div>
                </div>
                
                <div className="mt-5 text-center text-xs text-indigo-500 font-medium flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Lihat Detail Performa</span>
                  <span>&rarr;</span>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {teachersData.length === 0 && !isLoading && (
          <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-xl">
            Tidak ada data guru yang ditemukan.
          </div>
        )}
      </div>

      {/* MODAL DETAIL GURU */}
      {isModalOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all">
            
            {/* Modal Header */}
            <div className="bg-indigo-600 p-6 text-center relative">
               <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl font-bold leading-none"
              >
                &times;
              </button>
              <Avatar className="h-20 w-20 bg-white text-indigo-600 font-bold mx-auto mb-3 shadow-md border-4 border-indigo-400/30">
                  <AvatarFallback className="text-2xl">{selectedTeacher.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-white">{selectedTeacher.name}</h2>
              <Badge className="bg-indigo-500/50 text-white mt-2 border-none">
                Peringkat #{selectedTeacher.rank} Keseluruhan
              </Badge>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-900">Sesi Keaktifan</p>
                    <p className="text-xs text-emerald-700">Total sesi yang dipandu</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-emerald-700">{selectedTeacher.total_sessions || 0}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <p className="font-bold text-orange-900">Soal Dibuat</p>
                    <p className="text-xs text-orange-700">Bank soal kontribusi</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-orange-700">{selectedTeacher.total_questions || 0}</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}