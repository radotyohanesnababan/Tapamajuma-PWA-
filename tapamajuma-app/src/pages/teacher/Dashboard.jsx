import React, { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"; // Tambah Loader2
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/context/AuthContext';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State Data
  const [data, setData] = useState([]);
  const [masterClasses, setMasterClasses] = useState([]);
  const [summary, setSummary] = useState({
    total_students_active: 0,
    average_score: 0,
    average_confidence: 0,
    total_submissions: 0
  });

  // State Filter & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- 1. STATE LOADING (BARU) ---
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Master Data Kelas (Sekali saja)
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

  // Filter Kelas Milik Guru
  const teacherClasses = useMemo(() => {
    const userClassIds = user?.accessible_classes || [];
    if (user?.role === 'superadmin') return masterClasses;

    return masterClasses.filter(cls => {
      return userClassIds.some(myId => String(myId) === String(cls.id));
    });
  }, [user, masterClasses]);


  // --- 2. FETCH DATA DASHBOARD & STATS (DIGABUNG AGAR LOADING RAPI) ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Mulai Loading
      try {
        // Gunakan Promise.all agar kedua request jalan bareng
        const [dashboardRes, statsRes] = await Promise.all([
          api.get(`/api/teacher/dashboard?class_id=${selectedClass}`),
          api.get(`/api/teacher/stats?class_id=${selectedClass}`) // Pastikan param konsisten class_id
        ]);

        setData(dashboardRes.data);
        setSummary(statsRes.data);
      } catch (err) {
        console.error("Gagal ambil data dashboard:", err);
      } finally {
        setIsLoading(false); // Selesai Loading (baik sukses maupun gagal)
      }
    };

    fetchData();
  }, [selectedClass]); // Trigger saat kelas berubah


  // Logic Filter Client Side
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch = (item.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch; 
    });
  }, [data, searchTerm]);
  
  // Logic Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  
  function getStatus(score, conf) {
    const s = Number(score);
    const c = Number(conf);
    if (s >= 80 && c >= 4) return { label: "Akurat", color: "bg-green-500", hex: "#22c55e" };
    if (s < 50 && c >= 3) return { label: "Overconfident", color: "bg-red-500", hex: "#ef4444" };
    if (s >= 80 && c <= 2) return { label: "Underconfident", color: "bg-yellow-500", hex: "#f59e0b" };
    return { label: "Berkembang", color: "bg-blue-500", hex: "#3b82f6" };
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24 p-4 space-y-4 text-left">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-left">Beranda Kelas</h1>
        <p className="text-xs text-muted-foreground italic text-left">Update: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Skeleton untuk Stats jika Loading */}
        {isLoading ? (
          <>
             <div className="h-24 rounded-xl bg-slate-200 animate-pulse" />
             <div className="h-24 rounded-xl bg-slate-200 animate-pulse" />
          </>
        ) : (
          <>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-blue-600 uppercase text-left">Rata-rata Skor</p>
                <p className="text-2xl font-black text-blue-900 text-left">{summary.average_score}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <p className="text-[10px] font-bold text-green-600 uppercase text-left">Siswa Aktif</p>
                <p className="text-2xl font-black text-green-900 text-left">{summary.total_students_active}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Mandiri Button */}
      <div>
        <button
            onClick={() => navigate("/teacher/mandiri-session")}
            disabled={isLoading}
            className="p-2 text-slate-800 bg-blue-300 border rounded-md disabled:opacity-30 active:scale-90 transition-transform w-full font-bold "
          >
            Catat Sesi Mandiri!
          </button>
      </div>

      {/* Filter Area */}
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
             placeholder="Cari siswa..." 
             className="pl-7 h-9 text-xs bg-white" 
             value={searchTerm}
             onChange={(e) => {
               setSearchTerm(e.target.value);
               setCurrentPage(1); 
             }}
             disabled={isLoading}
          />
        </div>
        <select 
            className="h-9 border rounded-md px-2 text-xs bg-white outline-none"
            value={selectedClass} 
            onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1); 
            }}
            disabled={isLoading} // Disable saat loading
        >
            <option value="All">Semua Kelas</option>
            {teacherClasses.map((cls) => (
                <option key={cls.id} value={cls.name}>
                    {cls.name}
                </option>
            ))}
        </select>
      </div>
      

      {/* --- 3. DAFTAR KARTU SISWA DENGAN LOADING --- */}
      <div className="space-y-3">
        {isLoading ? (
          // TAMPILAN SAAT LOADING (Skeleton)
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-none shadow-sm animate-pulse">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                   <div className="space-y-2 w-full">
                      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                   </div>
                   <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
                </div>
                <div className="h-12 bg-slate-100 rounded-lg w-full mb-2"></div>
                <div className="h-10 bg-slate-100 rounded border-l-4 border-slate-300"></div>
              </CardContent>
            </Card>
          ))
        ) : currentItems.length > 0 ? (
          // TAMPILAN DATA ASLI
          currentItems.map((item) => {
            const status = getStatus(item.score, item.confidence_level);
            return (
              <Card key={item.id} className="overflow-hidden border-none shadow-sm animate-in fade-in zoom-in duration-300">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-left">
                      <h3 className="font-bold text-sm text-left">{item.user?.name}</h3>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase text-left">
                        {item.user?.student_class?.name || "Tanpa Kelas"}
                      </p>
                    </div>
                    <Badge className={`${status.color} text-[10px] px-2 py-0 border-none text-white`}>
                      {status.label}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg mb-2">
                    <div className="text-center border-r">
                      <p className="text-[9px] text-muted-foreground uppercase italic">Skor</p>
                      <p className="text-sm font-black">{item.score}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] text-muted-foreground uppercase italic">Yakin</p>
                      <p className="text-sm font-black">{item.confidence_level}/5</p>
                    </div>
                  </div>

                  {item.journal && (
                    <div className="bg-blue-50/50 p-2 rounded border-l-2 border-blue-400 text-left">
                      <p className="text-[9px] font-bold text-blue-700 uppercase mb-1 text-left">Strategi:</p>
                      <p className="text-xs italic text-slate-600 leading-relaxed text-left">"{item.journal}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          // TAMPILAN KOSONG
          <div className="text-center py-10 text-slate-400">
             <p className="text-sm">Belum ada aktivitas siswa.</p>
          </div>
        )}
      </div>

      {/* Navigasi Pagination (Sembunyikan saat loading) */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 bg-white border rounded-full disabled:opacity-30 active:scale-90 transition-transform"
          >
            <ChevronLeft size={16} />
          </Button>
          
          <span className="text-xs font-bold">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 bg-white border rounded-full disabled:opacity-30 active:scale-90 transition-transform"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}