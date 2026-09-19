import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeftRight,
  Loader2,
  Users,
  Search,
  ChevronLeft,
  RefreshCw,
  GraduationCap,
  ArrowRight,
  School,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate } from "react-router-dom";

export default function TransferKelas() {
  usePageTitle("Transfer Antar Kelas");
  const navigate = useNavigate();

  // Data Global
  const [allClasses, setAllClasses] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);

  // State Pilihan Kelas (Card yang diklik)
  // null = Tampilan Card Grid, object { id, name } = Tampilan Detail Siswa per Kelas
  const [selectedClass, setSelectedClass] = useState(null);

  // Filter & Search di Grid Card
  const [cardSearch, setCardSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");

  // State Detail Siswa di Kelas Terpilih
  const [classStudents, setClassStudents] = useState([]);
  const [loadingClass, setLoadingClass] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  // State Modal Transfer
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [targetClassId, setTargetClassId] = useState("");
  const [transferring, setTransferring] = useState(false);

  // Load Data Awal
  useEffect(() => {
    fetchInit();
  }, []);

  const fetchInit = async () => {
    try {
      setLoadingInit(true);
      const [classRes, previewRes] = await Promise.all([
        api.get("/api/admin/classes"),
        api.get("/api/admin/enrollments/promotion-preview"),
      ]);

      const classes = classRes.data?.data ?? classRes.data ?? [];
      setAllClasses(classes);
      setCurrentPeriod(previewRes.data?.period ?? null);
      setAllEnrollments(previewRes.data?.data ?? []);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Gagal memuat data kelas & enrollment");
    } finally {
      setLoadingInit(false);
    }
  };

  // Hitung jumlah siswa per kelas dari allEnrollments
  const studentCountByClass = useMemo(() => {
    const counts = {};
    allEnrollments.forEach((item) => {
      const clsName = item.current_class;
      if (clsName) {
        counts[clsName] = (counts[clsName] || 0) + 1;
      }
    });
    return counts;
  }, [allEnrollments]);

  // Helper identifikasi tingkat kelas (7, 8, 9 atau VII, VIII, IX)
  const getGradeLevel = (name = "") => {
    const trimmed = name.trim().toUpperCase();
    // Cek VIII sebelum VII karena string 'VIII' diawali dengan 'VII'
    if (/^(VIII|8)[\s\-_.]?/i.test(trimmed)) return "8";
    if (/^(VII|7)[\s\-_.]?/i.test(trimmed)) return "7";
    if (/^(IX|9)[\s\-_.]?/i.test(trimmed)) return "9";
    return "other";
  };

  // Filter Card Kelas berdasarkan Search & Grade
  const filteredClasses = useMemo(() => {
    return allClasses.filter((cls) => {
      const matchSearch =
        !cardSearch ||
        cls.name.toLowerCase().includes(cardSearch.toLowerCase());
      const matchGrade =
        gradeFilter === "all" || getGradeLevel(cls.name) === gradeFilter;
      return matchSearch && matchGrade;
    });
  }, [allClasses, cardSearch, gradeFilter]);

  // Ketika sebuah card kelas diklik, load data siswa kelas tersebut
  const handleSelectClass = async (cls) => {
    setSelectedClass(cls);
    setStudentSearch("");
    fetchClassStudents(cls.id);
  };

  const fetchClassStudents = async (classId) => {
    try {
      setLoadingClass(true);
      const res = await api.get("/api/admin/enrollments/promotion-preview-by-class", {
        params: { class_name_id: classId },
      });
      setClassStudents(res.data?.data ?? []);
    } catch {
      toast.error("Gagal memuat daftar siswa di kelas ini");
    } finally {
      setLoadingClass(false);
    }
  };

  // Filter Siswa dalam kelas terpilih berdasarkan pencarian nama / NIS
  const filteredStudents = useMemo(() => {
    if (!studentSearch) return classStudents;
    const q = studentSearch.toLowerCase();
    return classStudents.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.nis?.toLowerCase().includes(q)
    );
  }, [classStudents, studentSearch]);

  // Modal Transfer
  const openTransferModal = (student) => {
    setSelectedStudent(student);
    setTargetClassId("");
    setModalOpen(true);
  };

  // Eksekusi Pemindahan Kelas
  const handleExecuteTransfer = async () => {
    if (!targetClassId) {
      toast.error("Pilih rombel/kelas tujuan terlebih dahulu");
      return;
    }

    const targetClassObj = allClasses.find(
      (c) => c.id.toString() === targetClassId.toString()
    );

    try {
      setTransferring(true);
      const res = await api.patch(
        `/api/admin/enrollments/${selectedStudent.enrollment_id}/transfer-class`,
        { class_name_id: parseInt(targetClassId) }
      );

      toast.success(
        res.data?.message ??
          `Siswa ${selectedStudent.name} berhasil dipindahkan ke ${targetClassObj?.name ?? "kelas baru"}`
      );

      // Optimistic update:
      // 1. Keluarkan siswa dari daftar kelas saat ini
      setClassStudents((prev) =>
        prev.filter((s) => s.enrollment_id !== selectedStudent.enrollment_id)
      );

      // 2. Update allEnrollments agar counter di card kelas tetap akurat
      setAllEnrollments((prev) =>
        prev.map((e) =>
          e.enrollment_id === selectedStudent.enrollment_id
            ? { ...e, current_class: targetClassObj?.name ?? e.current_class }
            : e
        )
      );

      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Gagal memindahkan siswa");
    } finally {
      setTransferring(false);
    }
  };

  // Dropdown kelas tujuan (hanya kelas dengan tingkat yang sama, exclude kelas saat ini)
  const targetClassOptions = useMemo(() => {
    if (!selectedClass) return [];
    const currentGrade = getGradeLevel(selectedClass.name);
    return allClasses.filter(
      (c) => c.id !== selectedClass.id && getGradeLevel(c.name) === currentGrade
    );
  }, [allClasses, selectedClass]);

  if (loadingInit) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-3">
        <Loader2 className="animate-spin text-cyan-600" size={36} />
        <p className="text-sm font-semibold text-slate-500">
          Memuat data rombel & enrollment...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* ========================================================= */}
      {/* HEADER UMUM                                               */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (selectedClass) {
                // Jika sedang di dalam kelas, tombol back kembali ke grid card
                setSelectedClass(null);
              } else {
                // Jika di grid card, kembali ke menu periode akademik
                navigate("/superadmin/academic-periods");
              }
            }}
            className="rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            title={selectedClass ? "Kembali ke Daftar Kelas" : "Kembali"}
          >
            <ChevronLeft size={22} />
          </Button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {selectedClass ? `Kelas ${selectedClass.name}` : "Transfer Antar Kelas"}
              </h1>
              {currentPeriod && (
                <Badge
                  variant="outline"
                  className="bg-cyan-50 text-cyan-700 border-cyan-200 font-bold text-xs"
                >
                  Periode: {currentPeriod}
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {selectedClass
                ? `Kelola perpindahan rombel untuk siswa di Kelas ${selectedClass.name}`
                : "Pilih kelas asal untuk melihat daftar siswa dan melakukan pemindahan rombel."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedClass ? (
            <Button
              variant="outline"
              onClick={() => fetchClassStudents(selectedClass.id)}
              className="rounded-xl gap-2 font-bold text-slate-700 hover:bg-slate-50"
              disabled={loadingClass}
            >
              <RefreshCw size={15} className={loadingClass ? "animate-spin" : ""} />
              Muat Ulang
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={fetchInit}
              className="rounded-xl gap-2 font-bold text-slate-700 hover:bg-slate-50"
              disabled={loadingInit}
            >
              <RefreshCw size={15} className={loadingInit ? "animate-spin" : ""} />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAMPILAN 1: GRID CARD PER KELAS                           */}
      {/* ========================================================= */}
      {!selectedClass && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="p-4 rounded-2xl border bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-transparent border-cyan-200/80 text-cyan-950 flex items-start gap-3.5 shadow-sm">
            <div className="p-2.5 rounded-xl bg-cyan-600 text-white shadow-sm mt-0.5">
              <ArrowLeftRight size={18} />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-sm text-cyan-900">
                Pilih Kelas Asal Siswa
              </h3>
              <p className="text-xs text-cyan-800/90 leading-relaxed max-w-3xl">
                Klik salah satu card rombel/kelas di bawah untuk membuka daftar siswa yang aktif. 
                Anda dapat memindahkan siswa ke rombel lain secara individual tanpa merusak riwayat nilai dan aktivitas siswa.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <School size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Rombel
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">
                    {allClasses.length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Siswa Aktif
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">
                    {allEnrollments.length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white rounded-2xl col-span-2 sm:col-span-1">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Rata-rata Siswa / Kelas
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">
                    {allClasses.length > 0
                      ? Math.round(allEnrollments.length / allClasses.length)
                      : 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter & Search Controls */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
            {/* Grade Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { label: "Semua Rombel", value: "all" },
                { label: "Kelas 7", value: "7" },
                { label: "Kelas 8", value: "8" },
                { label: "Kelas 9", value: "9" },
              ].map((tab) => (
                <Button
                  key={tab.value}
                  variant={gradeFilter === tab.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setGradeFilter(tab.value)}
                  className={`rounded-xl text-xs font-bold px-3.5 h-8 transition-all ${
                    gradeFilter === tab.value
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Cari nama rombel/kelas..."
                value={cardSearch}
                onChange={(e) => setCardSearch(e.target.value)}
                className="pl-9 rounded-xl text-xs font-medium h-9 bg-slate-50/50 border-slate-200 focus:bg-white"
              />
            </div>
          </div>

          {/* Card Grid */}
          {filteredClasses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
              <div className="w-14 h-14 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <School size={26} />
              </div>
              <p className="text-sm font-bold text-slate-700">
                Tidak ada kelas yang sesuai pencarian
              </p>
              <p className="text-xs text-slate-400">
                Coba ubah kata kunci pencarian atau filter tingkat kelas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredClasses.map((cls) => {
                const count = studentCountByClass[cls.name] || 0;
                const grade = getGradeLevel(cls.name);

                return (
                  <div
                    key={cls.id}
                    onClick={() => handleSelectClass(cls)}
                    className="group relative bg-white border border-slate-200/80 hover:border-cyan-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Badge Row */}
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-700 hover:bg-slate-100 font-bold text-[11px] px-2.5 py-0.5 rounded-lg"
                        >
                          {grade === "7"
                            ? "Tingkat VII"
                            : grade === "8"
                            ? "Tingkat VIII"
                            : grade === "9"
                            ? "Tingkat IX"
                            : "Rombel"}
                        </Badge>
                        <Badge
                          className={`font-black text-xs px-2 py-0.5 rounded-lg border ${
                            count > 0
                              ? "bg-cyan-50 text-cyan-700 border-cyan-200/80"
                              : "bg-slate-50 text-slate-400 border-slate-200"
                          }`}
                        >
                          {count} Siswa
                        </Badge>
                      </div>

                      {/* Class Name */}
                      <div className="flex items-center gap-3 my-2">
                        <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-200">
                          <GraduationCap size={22} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-cyan-700 transition-colors">
                            {cls.name}
                          </h3>
                          <p className="text-xs text-slate-400 font-medium">
                            Rombongan Belajar
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Action */}
                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-cyan-600 transition-colors">
                      <span>Buka Kelas</span>
                      <ArrowRight
                        size={15}
                        className="transform group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAMPILAN 2: DETAIL SISWA DI KELAS TERPILIH                */}
      {/* ========================================================= */}
      {selectedClass && (
        <div className="space-y-6">
          {/* Action & Switcher Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedClass(null)}
                className="rounded-xl font-bold text-xs gap-1.5 text-slate-700"
              >
                <ChevronLeft size={16} />
                Daftar Kelas
              </Button>

              <div className="h-5 w-px bg-slate-200 hidden sm:block" />

              {/* Class Switcher Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                  Pindah Rombel:
                </span>
                <Select
                  value={selectedClass.id.toString()}
                  onValueChange={(val) => {
                    const found = allClasses.find((c) => c.id.toString() === val);
                    if (found) handleSelectClass(found);
                  }}
                >
                  <SelectTrigger className="h-8 w-44 rounded-xl text-xs font-bold bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Pilih Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {allClasses.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.id.toString()}
                        className="text-xs font-bold"
                      >
                        {c.name} ({studentCountByClass[c.name] || 0} siswa)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Student */}
            <div className="relative w-full sm:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Cari nama atau NIS siswa..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-9 rounded-xl text-xs font-medium h-8 bg-slate-50/50 border-slate-200 focus:bg-white"
              />
            </div>
          </div>

          {/* Tabel Siswa di Kelas Terpilih */}
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>Daftar Siswa Kelas {selectedClass.name}</span>
                    <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 font-bold text-xs">
                      {classStudents.length} Siswa
                    </Badge>
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Klik tombol <strong>Pindah</strong> untuk mentransfer siswa ke kelas rombel lain.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loadingClass ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                  <Loader2 className="animate-spin text-cyan-600" size={28} />
                  <p className="text-xs text-slate-400 font-medium">
                    Memuat daftar siswa kelas {selectedClass.name}...
                  </p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <Users size={20} />
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    {studentSearch
                      ? "Tidak ada siswa yang sesuai pencarian"
                      : "Belum ada siswa aktif di kelas ini"}
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {studentSearch
                      ? "Pastikan ejaan nama atau NIS sudah benar."
                      : "Siswa dapat ditambahkan melalui menu Kenaikan Kelas atau Enroll Siswa."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-100">
                      <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider pl-6 w-16">
                        No
                      </TableHead>
                      <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Siswa
                      </TableHead>
                      <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider">
                        NIS
                      </TableHead>
                      <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider">
                        Kelas Saat Ini
                      </TableHead>
                      <TableHead className="font-bold text-slate-500 text-xs uppercase tracking-wider pr-6 text-right">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student, idx) => (
                      <TableRow
                        key={student.enrollment_id}
                        className="hover:bg-slate-50/60 border-b border-slate-100/80 transition-colors"
                      >
                        <TableCell className="text-xs font-bold text-slate-400 pl-6">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-bold text-slate-800 text-sm">
                          {student.name}
                        </TableCell>
                        <TableCell className="text-slate-500 text-xs font-mono">
                          {student.nis || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-bold text-xs bg-slate-50 text-slate-700 border-slate-200"
                          >
                            {student.current_class}
                          </Badge>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openTransferModal(student)}
                            className="text-xs text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50 border-cyan-200 rounded-xl font-bold gap-1.5 h-8"
                          >
                            <ArrowLeftRight size={13} />
                            Pindah Kelas
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL / DIALOG TRANSFER KELAS                             */}
      {/* ========================================================= */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-slate-900 text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-100 text-cyan-700">
                <ArrowLeftRight size={18} />
              </div>
              Pindah Rombel / Kelas
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4 py-2">
              {/* Info Siswa */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Siswa yang akan dipindahkan
                </p>
                <p className="text-base font-black text-slate-900">
                  {selectedStudent.name}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium pt-1">
                  <span>NIS: <strong className="font-mono">{selectedStudent.nis || "—"}</strong></span>
                  <span>•</span>
                  <span>Kelas Saat Ini: <strong className="text-slate-800">{selectedStudent.current_class}</strong></span>
                </div>
              </div>

              {/* Pilih Kelas Tujuan */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Pilih Kelas Tujuan
                  </label>
                  <span className="text-[11px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-200/70 px-2 py-0.5 rounded-md">
                    Khusus Sesama Tingkat {getGradeLevel(selectedClass?.name) === "7" ? "VII" : getGradeLevel(selectedClass?.name) === "8" ? "VIII" : getGradeLevel(selectedClass?.name) === "9" ? "IX" : ""}
                  </span>
                </div>
                <Select
                  value={targetClassId}
                  onValueChange={setTargetClassId}
                  disabled={targetClassOptions.length === 0}
                >
                  <SelectTrigger className="w-full rounded-xl font-bold text-sm h-10 border-slate-200">
                    <SelectValue placeholder={targetClassOptions.length === 0 ? "Tidak ada rombel lain di tingkat ini" : "Pilih rombel tujuan..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {targetClassOptions.map((cls) => (
                      <SelectItem
                        key={cls.id}
                        value={cls.id.toString()}
                        className="font-bold text-sm"
                      >
                        {cls.name} ({studentCountByClass[cls.name] || 0} siswa)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {targetClassOptions.length === 0 && (
                  <p className="text-xs text-rose-500 font-medium mt-1">
                    Tidak ditemukan rombel lain pada tingkat yang sama.
                  </p>
                )}
              </div>

              {/* Alert Catatan */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-800 leading-relaxed space-y-1">
                <p className="font-bold">⚠️ Perhatian:</p>
                <p className="text-amber-700">
                  Perpindahan kelas langsung berlaku pada periode akademik berjalan saat ini. 
                  Seluruh data aktivitas harian, kuis, dan portofolio siswa akan tetap tersimpan dan mengikuti siswa ke rombel barunya.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="rounded-xl font-bold text-slate-600"
              disabled={transferring}
            >
              Batal
            </Button>
            <Button
              onClick={handleExecuteTransfer}
              disabled={!targetClassId || transferring}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl gap-2 shadow-sm"
            >
              {transferring ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowLeftRight size={16} />
              )}
              Pindahkan Siswa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
