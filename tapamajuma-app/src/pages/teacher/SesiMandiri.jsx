import React, { useState, useEffect, useMemo } from "react";
import api from "@/lib/axios";
import {
  Check, Search, UserCheck, Save, Users, Filter,
  Loader2, ChevronDown, AlertTriangle, Hash,
  ToggleLeft, ToggleRight, CheckCircle2, XCircle,
  ArrowRight, Zap, SlidersHorizontal
} from "lucide-react";
import { toast } from "sonner";

export default function SesiMandiri() {
  // STATE
  const [availableClasses, setAvailableClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. FETCH CLASSES
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get("/api/teacher/my-classes");
        const classesData = response.data;
        setAvailableClasses(classesData);
        if (classesData.length > 0) setSelectedClass(classesData[0].id);
      } catch (error) {
        console.error("Gagal memuat kelas:", error);
        toast.error("Gagal mengambil daftar kelas.");
      } finally {
        setIsLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  // 2. FETCH STUDENTS
  useEffect(() => {
    if (!selectedClass) return;
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      setStudents([]);
      try {
        const response = await api.get(`/api/students?class_id=${selectedClass}`);
        setStudents(response.data);
      } catch (error) {
        console.error("Gagal memuat siswa:", error);
        const msg = error.response?.data?.error || "Gagal mengambil data siswa.";
        toast.error("Error", msg);
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  // ACTIONS
  const toggleActive = (id) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, active: !s.active, nilai: !s.active ? s.nilai : 0 } : s
      )
    );
  };

  const updateNilai = (id, nilai) => {
    const val = Math.min(100, Math.max(0, Number(nilai)));
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, nilai: val } : s)));
  };

  const toggleAll = (status) => {
    setStudents((prev) => prev.map((s) => ({ ...s, active: status })));
  };

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.nis && s.nis.includes(searchQuery))
    );
  }, [students, searchQuery]);

  const activeCount = students.filter((s) => s.active).length;
  const inactiveCount = students.length - activeCount;
  const totalStudents = students.length;
  const percentage = totalStudents > 0 ? Math.round((activeCount / totalStudents) * 100) : 0;

  const getSelectedClassName = () => {
    const cls = availableClasses.find((c) => c.id === selectedClass);
    return cls ? cls.name : "—";
  };

  // 3. SAVE
  const handleSave = async () => {
    if (totalStudents === 0) return;
    setIsSaving(true);
    try {
      const payload = {
        class_id: selectedClass,
        students: students.map((s) => ({
          id: s.id,
          active: !!s.active,
          nilai: s.active ? s.nilai || 0 : 0,
        })),
      };
      await api.post("/api/self-study/store", payload);
      toast.success("Presensi berhasil disimpan.");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan presensi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes pulse-soft { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
        .pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
      `}</style>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">

        {/* ═══ HEADER ═══ */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-400">
              Pencatatan Sesi Keaktifan Kelas
            </p>
            <h1 className="text-lg font-bold text-slate-800 mt-0.5">
              Kelas {getSelectedClassName()}
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <Hash size={12} className="text-slate-400" />
            <span className="font-mono text-xs font-semibold text-slate-500">
              {totalStudents} siswa
            </span>
          </div>
        </div>

        {/* ═══ CLASS SELECTOR ═══ */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
            Pilih Kelas
          </label>

          {isLoadingClasses ? (
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 w-20 bg-slate-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : availableClasses.length > 0 ? (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {availableClasses.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  className={`px-3.5 py-2 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap border ${
                    selectedClass === cls.id
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {cls.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-lg font-medium">
              Anda belum memiliki kelas.
            </div>
          )}
        </div>

        {/* ═══ ATTENDANCE STATS BAR ═══ */}
        {selectedClass && (
          <div className="rounded-xl bg-white border border-slate-200 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Active count */}
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-mono text-sm font-bold text-slate-800">
                    {isLoadingStudents ? "—" : activeCount}
                  </span>
                  <span className="text-[9px] font-medium text-slate-400">aktif</span>
                </div>

                {/* Inactive count */}
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                  <span className="font-mono text-sm font-bold text-slate-500">
                    {isLoadingStudents ? "—" : inactiveCount}
                  </span>
                  <span className="text-[9px] font-medium text-slate-400">tidak aktif</span>
                </div>
              </div>

              {/* Percentage */}
              <div className="flex items-center gap-1.5">
                <span className={`font-mono text-sm font-bold ${
                  percentage >= 80 ? "text-emerald-600" :
                  percentage >= 50 ? "text-amber-600" :
                  "text-rose-600"
                }`}>
                  {isLoadingStudents ? "—" : `${percentage}%`}
                </span>
              </div>
            </div>

            {/* Stacked bar */}
            <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-100">
              <div
                className="bg-emerald-500 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
              <div
                className="bg-slate-300 transition-all duration-300"
                style={{ width: `${100 - percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* ═══ TOOLBAR ═══ */}
        {selectedClass && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama / NIS..."
                className="w-full pl-8 pr-3 h-9 rounded-lg bg-white border border-slate-200 text-[11px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoadingStudents}
              />
            </div>

            <button
              onClick={() => toggleAll(true)}
              disabled={isLoadingStudents || students.length === 0}
              className="h-9 px-3 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition disabled:opacity-40"
            >
              Hadir Semua
            </button>

            <button
              onClick={() => toggleAll(false)}
              disabled={isLoadingStudents || students.length === 0}
              className="h-9 px-3 rounded-lg text-[10px] font-semibold bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 transition disabled:opacity-40"
            >
              Reset
            </button>
          </div>
        )}

        {/* ═══ STUDENT LIST ═══ */}
        {selectedClass && (
          <div className="space-y-0.5">
            {/* Column headers */}
            {!isLoadingStudents && filteredStudents.length > 0 && (
              <div className="flex items-center px-2.5 py-1.5 text-[8px] font-semibold text-slate-400 uppercase tracking-wider select-none">
                <span className="w-7" />
                <span className="flex-1 ml-2">Nama</span>
                <span className="w-14 text-center">NIS</span>
                <span className="w-16 text-center">Nilai</span>
                <span className="w-7" />
              </div>
            )}

            <div className="space-y-0.5 max-h-[420px] overflow-y-auto">
              {isLoadingStudents ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-11 rounded-lg bg-white border border-slate-100 animate-pulse"
                  />
                ))
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => toggleActive(student.id)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-all cursor-pointer select-none group ${
                      student.active
                        ? "bg-emerald-50/60 border-emerald-200 border-l-[3px]"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {/* Toggle indicator */}
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                        student.active
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                      }`}
                    >
                      {student.active ? (
                        <Check size={12} strokeWidth={3} />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[11px] font-semibold leading-tight truncate ${
                          student.active ? "text-slate-800" : "text-slate-600"
                        }`}
                      >
                        {student.name}
                      </p>
                    </div>

                    {/* NIS — monospace */}
                    <div className="w-14 flex-shrink-0 text-right">
                      <span className="font-mono text-[10px] font-medium text-slate-400">
                        {student.nis || "—"}
                      </span>
                    </div>

                    {/* Nilai input — only when active */}
                    <div className="w-16 flex-shrink-0">
                      {student.active ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={student.nilai || ""}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateNilai(student.id, e.target.value)}
                          placeholder="—"
                          className="w-full h-7 text-center font-mono text-[11px] font-semibold rounded border border-slate-200 bg-white text-slate-700 placeholder:text-slate-300 outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
                        />
                      ) : (
                        <span className="block text-center font-mono text-[10px] text-slate-300">
                          —
                        </span>
                      )}
                    </div>

                    {/* Status dot */}
                    <div className="w-7 flex-shrink-0 flex items-center justify-center">
                      <div
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          student.active ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg bg-white border border-slate-200 p-8 text-center">
                  <Search size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-400">
                    Siswa tidak ditemukan.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ SAVE ACTION ═══ */}
        {selectedClass && (
          <button
            onClick={handleSave}
            disabled={isSaving || students.length === 0 || isLoadingStudents}
            className="w-full h-11 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-none"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={14} />
                Simpan Sesi Kelas {getSelectedClassName()}
                <ArrowRight size={12} className="opacity-50" />
              </>
            )}
          </button>
        )}

        {/* ═══ FOOTER ═══ */}
        <p className="text-[9px] text-slate-400 text-center font-medium pt-2">
          Klik baris untuk toggle kehadiran · Nilai hanya aktif untuk siswa hadir
        </p>
      </div>
    </div>
  );
}