import React, { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, ChevronLeft, ChevronRight, Loader2, 
  Trophy, Users, Target, BookOpen, 
  Filter, LayoutDashboard, BrainCircuit, Zap
} from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/context/AuthContext';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [data, setData] = useState([]);
  const [masterClasses, setMasterClasses] = useState([]);
  const [summary, setSummary] = useState({
    total_students_active: 0,
    average_score: 0,
    average_confidence: 0,
    total_submissions: 0
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/api/public/classes'); 
        setMasterClasses(response.data);
      } catch (error) {
        console.error("Gagal ambil data kelas", error);
      }
    };
    fetchClasses();
  }, []);

  const teacherClasses = useMemo(() => {
    const userClassIds = user?.accessible_classes || [];
    if (user?.role === 'superadmin') return masterClasses;
    return masterClasses.filter(cls => userClassIds.some(myId => String(myId) === String(cls.id)));
  }, [user, masterClasses]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [dashboardRes, statsRes] = await Promise.all([
          api.get(`/api/teacher/dashboard?class_id=${selectedClass}`),
          api.get(`/api/teacher/stats?class_id=${selectedClass}`)
        ]);
        setData(dashboardRes.data);
        setSummary(statsRes.data);
      } catch (err) {
        console.error("Gagal ambil data dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedClass]);

  const filteredData = useMemo(() => {
    return data.filter((item) => (item.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data, searchTerm]);
  
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  function getStatus(score, conf) {
    const s = Number(score);
    const c = Number(conf);
    if (s >= 80 && c >= 4) return { label: "Akurat", color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", icon: <Trophy size={12} /> };
    if (s < 50 && c >= 3) return { label: "Overconfident", color: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50", icon: <Zap size={12} /> };
    if (s >= 80 && c <= 2) return { label: "Underconfident", color: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", icon: <BrainCircuit size={12} /> };
    return { label: "Berkembang", color: "bg-indigo-500", text: "text-indigo-700", bg: "bg-indigo-50", icon: <Target size={12} /> };
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24 p-4 space-y-6 max-w-2xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start pt-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Beranda Kelas</h1>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Monitoring</p>
          </div>
        </div>
        <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100">
           <LayoutDashboard className="text-indigo-600" size={20} />
        </div>
      </div>

      {/* QUICK STATS - Menggunakan Desain Kartu Modern */}
      <div className="grid grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-28 rounded-[2rem] bg-white animate-pulse shadow-sm" />)
        ) : (
          <>
            <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-3 opacity-10 text-indigo-600 group-hover:scale-110 transition-transform">
                <Target size={48} />
              </div>
              <CardContent className="p-5">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Rata-rata Skor</p>
                <p className="text-3xl font-black text-slate-900">{summary.average_score}</p>
                <p className="text-[9px] font-bold text-indigo-500 mt-1 flex items-center gap-1">
                   <Zap size={10} fill="currentColor" /> Target: 80+
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-3 opacity-10 text-emerald-600 group-hover:scale-110 transition-transform">
                <Users size={48} />
              </div>
              <CardContent className="p-5">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Siswa Aktif</p>
                <p className="text-3xl font-black text-slate-900">{summary.total_students_active}</p>
                <p className="text-[9px] font-bold text-emerald-500 mt-1 italic">Minggu ini</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* PRIMARY ACTION */}
      <Button
        onClick={() => navigate("/teacher/mandiri-session")}
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-7 rounded-[1.5rem] shadow-lg shadow-indigo-100 transition-all active:scale-95 text-sm"
      >
        <BookOpen className="mr-2" size={18} />
        CATAT SESI KELAS SISWA
      </Button>

      {/* SEARCH & FILTER AREA */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
             placeholder="Cari nama siswa..." 
             className="pl-10 h-12 rounded-2xl bg-white border-none shadow-sm text-xs" 
             value={searchTerm}
             onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
             disabled={isLoading}
          />
        </div>
        <div className="relative">
          <select 
              className="h-12 border-none rounded-2xl px-4 text-[11px] font-bold bg-white shadow-sm outline-none appearance-none pr-8 text-slate-600 cursor-pointer"
              value={selectedClass} 
              onChange={(e) => { setSelectedClass(e.target.value); setCurrentPage(1); }}
              disabled={isLoading}
          >
              <option value="All">Semua Kelas</option>
              {teacherClasses.map((cls) => <option key={cls.id} value={cls.name}>{cls.name}</option>)}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* STUDENT FEED */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-[2rem] bg-white animate-pulse shadow-sm" />
          ))
        ) : currentItems.length > 0 ? (
          currentItems.map((item) => {
            const status = getStatus(item.score, item.confidence_level);
            return (
              <Card key={item.id} className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden transition-all hover:shadow-md">
                <CardContent className="p-6">
                  {/* Card Header Info */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl ${status.bg} ${status.text} flex items-center justify-center font-black text-sm`}>
                            {item.user?.name?.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm leading-tight">{item.user?.name}</h3>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">
                                {item.user?.student_class?.name || "No Class"}
                            </p>
                        </div>
                    </div>
                    <Badge className={`${status.color} border-none text-[9px] font-black uppercase px-3 py-1 rounded-full text-white flex gap-1 items-center`}>
                      {status.icon} {status.label}
                    </Badge>
                  </div>
                  
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Skor Aksi</p>
                      <p className="text-xl font-black text-slate-800">{item.score}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Keyakinan</p>
                      <p className="text-xl font-black text-slate-800">{item.confidence_level}<span className="text-[10px] text-slate-400">/5</span></p>
                    </div>
                  </div>

                  {/* Strategy Journal */}
                  {item.journal && (
                    <div className="bg-indigo-50/40 p-3.5 rounded-2xl border-l-4 border-indigo-400">
                      <p className="text-[9px] font-black text-indigo-600 uppercase mb-1.5 flex items-center gap-1.5">
                         <Zap size={10} fill="currentColor" /> Strategi Belajar:
                      </p>
                      <p className="text-xs italic text-slate-600 leading-relaxed">"{item.journal}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
             <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-slate-300" />
             </div>
             <p className="text-xs font-bold text-slate-400">Belum ada aktivitas di kelas ini.</p>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 pt-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-full w-10 h-10 p-0 bg-white shadow-sm border-none hover:bg-indigo-50 text-indigo-600 disabled:opacity-20"
          >
            <ChevronLeft size={20} />
          </Button>
          
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Halaman <span className="text-indigo-600">{currentPage}</span> / {totalPages}
          </div>

          <Button
            variant="ghost"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="rounded-full w-10 h-10 p-0 bg-white shadow-sm border-none hover:bg-indigo-50 text-indigo-600 disabled:opacity-20"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      )}
    </div>
  );
}