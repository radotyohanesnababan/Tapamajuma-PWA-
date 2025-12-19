import { useEffect, useState, useMemo } from "react"; // Tambahkan useMemo
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function TeacherDashboard() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [summary, setSummary] = useState({
    total_students_active: 0,
    average_score: 0,
    average_confidence: 0,
    total_submissions: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    api.get("/teacher/dashboard").then((res) => setData(res.data));
  }, []);



  useEffect(() => {
    api.get(`/teacher/stats?class=${selectedClass}`)
      .then(res => setSummary(res.data))
      .catch(err => console.error(err));
  }, [selectedClass]);



  // --- PERBAIKAN: Definisikan filteredData dulu ---
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch = (item.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = selectedClass === "All" || item.user?.class_name === selectedClass;
      return matchSearch && matchClass;
    });
  }, [data, searchTerm, selectedClass]);

  // --- LOGIKA PAGINATION ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  
  function getStatus(score, conf) {
  // Pastikan data diproses sebagai angka
  const s = Number(score);
  const c = Number(conf);

  // Akurat: Skor tinggi (>=80), Yakin tinggi (>=4)
  if (s >= 80 && c >= 4) {
    return { label: "Akurat", color: "bg-green-500", hex: "#22c55e" };
  }
  
  // Overconfident: Skor rendah (<50), tapi Yakin lumayan/tinggi (>=3)
  // Ini akan menangkap data skor 0 yakin 3 kamu menjadi warna MERAH
  if (s < 50 && c >= 3) {
    return { label: "Overconfident", color: "bg-red-500", hex: "#ef4444" };
  }
  
  // Underconfident: Skor tinggi (>=80), tapi Yakin rendah (<=2)
  if (s >= 80 && c <= 2) {
    return { label: "Underconfident", color: "bg-yellow-500", hex: "#f59e0b" };
  }
  
  // Berkembang: Selain kategori ekstrem di atas
  return { label: "Berkembang", color: "bg-blue-500", hex: "#3b82f6" };
}

  return (
    <div className="bg-slate-50 min-h-screen pb-24 p-4 space-y-4 text-left">
      {/* Header & Summary Cards tetap sama ... */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-left">Analisis Kelas</h1>
        <p className="text-xs text-muted-foreground italic text-left">Update: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
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
      </div>

      {/* Filter Area */}
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="Cari siswa..." 
            className="pl-7 h-9 text-xs" 
            value={searchTerm}
            onChange={(e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset halaman langsung di sini
  }}
          />
        </div>
        <select 
          className="h-9 border rounded-md px-2 text-xs bg-white outline-none"
          value={selectedClass}
          onChange={(e) => {
    setSelectedClass(e.target.value);
    setCurrentPage(1); // Reset halaman langsung di sini
  }}
        >
          <option value="All">Semua Kelas</option>
          <option value="VII-A">VII-A</option>
          <option value="VII-B">VII-B</option>
        </select>
      </div>

      {/* Daftar Kartu Siswa */}
      <div className="space-y-3">
        {currentItems.map((item) => {
          const status = getStatus(item.score, item.confidence_level);
          return (
            <Card key={item.id} className="overflow-hidden border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-left">
                    <h3 className="font-bold text-sm text-left">{item.user?.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase text-left">
                      {item.user?.class_name || "Tanpa Kelas"}
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
        })}
      </div>

      {/* Navigasi Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 bg-white border rounded-full disabled:opacity-30 active:scale-90 transition-transform"
          >
            <ChevronLeft size={16} />
          </button>
          
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