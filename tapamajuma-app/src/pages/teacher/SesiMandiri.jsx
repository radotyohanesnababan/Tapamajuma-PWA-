import React, { useState, useEffect, useMemo } from 'react';
import api from "@/lib/axios"; // Pastikan path axios Anda benar
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Search, UserCheck, Save, Users, Filter, Loader2 } from "lucide-react";
import {toast} from "sonner";

export default function SesiMandiri() {
  
  // STATE MANAGEMENT
  const [availableClasses, setAvailableClasses] = useState([]); // List kelas dari API
  const [students, setStudents] = useState([]); // List siswa dari API
  const [selectedClass, setSelectedClass] = useState(""); 
  const [searchQuery, setSearchQuery] = useState("");
  
  // LOADING STATES
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. FETCH DAFTAR KELAS (Saat halaman dimuat)
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/api/teacher/my-classes');
        const classes = response.data;
        setAvailableClasses(classes);

        // Otomatis pilih kelas pertama jika ada
        if (classes.length > 0) {
          setSelectedClass(classes[0]);
        }
      } catch (error) {
        console.error("Gagal memuat kelas:", error);
        toast.error("Gagal mengambil daftar kelas. Silakan coba lagi.");
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  // 2. FETCH SISWA (Setiap kali kelas dipilih)
  useEffect(() => {
    if (!selectedClass) return;

    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      setStudents([]); // Kosongkan dulu biar tidak flicker data lama
      
      try {
        const response = await api.get(`/api/students?class=${selectedClass}`);
        setStudents(response.data);
      } catch (error) {
        console.error("Gagal memuat siswa:", error);
        if (error.response?.status === 403) {
          toast.error("Akses Ditolak", "Anda tidak memiliki akses ke kelas ini.");
        } else {
          toast.error("Error", "Gagal mengambil data siswa.");
        }
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedClass]);

  // LOGIC: Toggle status aktif siswa
  const toggleActive = (id) => {
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, active: !student.active } : student
    ));
  };

  // LOGIC: Toggle semua siswa (Bulk Action)
  const toggleAll = (status) => {
    setStudents(prev => prev.map(student => ({ ...student, active: status })));
  };

  // LOGIC: Filter Pencarian (Client Side)
  // Note: Kita tidak perlu filter by class lagi di sini karena API sudah mengirim data spesifik per kelas
  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      student.nis?.includes(searchQuery)
    );
  }, [students, searchQuery]);

  // LOGIC: Statistik
  const activeCount = students.filter(s => s.active).length; // Hitung dari total data, bukan yang difilter
  const totalStudents = students.length;
  const percentage = totalStudents > 0 ? Math.round((activeCount / totalStudents) * 100) : 0;

  // 3. SIMPAN KE SERVER
  const handleSave = async () => {
    if (totalStudents === 0) return;
    
    setIsSaving(true);
    try {
        const cleanStudents = students.map(s => ({
        id: s.id,
        // Pakai operator !! agar pasti jadi true/false (bukan null/undefined)
        active: !!s.active 
      }));
      const payload = {
        class_id: selectedClass,
        students: cleanStudents // Mengirim array siswa beserta status active-nya
      };

      await api.post('/api/self-study/store', payload);

        toast.success("Aktifitas berhasil disimpan!");
    } catch (error) {
      console.error("Gagal simpan:", error);
      const errorMsg = error.response?.data?.message || "Terjadi kesalahan";
      const errorDetail = JSON.stringify(error.response?.data?.errors || {});
      toast.error("Gagal menyimpan Aktifitas", `${errorMsg}\n${errorDetail}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-3xl mx-auto">
      <Card className="border-none shadow-md bg-white overflow-hidden">
        
        {/* BAGIAN HEADER */}
        <CardHeader className="pb-4 space-y-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-indigo-600" />
              Presensi Sesi Mandiri
            </CardTitle>
            <CardDescription className="mt-1">
              Kelola kehadiran siswa dalam sesi belajar hari ini.
            </CardDescription>
          </div>

          {/* DASHBOARD STATISTIK */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex justify-between items-center transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-full text-indigo-600 shadow-sm">
                <UserCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                  Kehadiran {selectedClass ? `Kelas ${selectedClass}` : '-'}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-indigo-700">{activeCount}</span>
                  <span className="text-sm font-medium text-indigo-400">/ {totalStudents} Siswa</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-lg font-black text-indigo-600">{percentage}%</span>
              <p className="text-[10px] text-indigo-400 font-bold uppercase">Partisipasi</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          
          {/* PILIH KELAS (Horizontal Scroll) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Filter size={12} /> Pilih Kelas
            </label>
            
            {isLoadingClasses ? (
              <div className="flex gap-2 animate-pulse">
                <div className="h-9 w-24 bg-slate-100 rounded-full"></div>
                <div className="h-9 w-24 bg-slate-100 rounded-full"></div>
              </div>
            ) : availableClasses.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {availableClasses.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`
                      px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap
                      ${selectedClass === cls 
                        ? "bg-slate-900 text-white shadow-lg transform scale-105" 
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }
                    `}
                  >
                    Kelas {cls}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                Anda belum ditugaskan ke kelas manapun. Hubungi admin.
              </div>
            )}
          </div>

          {/* JIKA KELAS DIPILIH, TAMPILKAN KONTEN */}
          {selectedClass && (
            <>
              {/* TOOLBAR: SEARCH & ACTIONS */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input 
                    placeholder={`Cari siswa di ${selectedClass}...`}
                    className="pl-9 bg-white border-slate-200 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isLoadingStudents}
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs bg-white"
                    onClick={() => toggleAll(true)}
                    disabled={isLoadingStudents || students.length === 0}
                  >
                    Semua Hadir
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => toggleAll(false)}
                    disabled={isLoadingStudents || students.length === 0}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* LIST SISWA */}
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {isLoadingStudents ? (
                  // Loading Skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-100 rounded-full animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                          <div className="h-2 w-20 bg-slate-100 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <div 
                      key={student.id}
                      onClick={() => toggleActive(student.id)}
                      className={`
                        group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none
                        ${student.active 
                          ? "bg-indigo-50 border-indigo-200 shadow-sm" 
                          : "bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className={`h-10 w-10 transition-all ${student.active ? "ring-2 ring-indigo-400 ring-offset-2" : "bg-slate-100"}`}>
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} />
                          <AvatarFallback className="text-slate-500 text-xs font-bold">
                            {student.name.substring(0,2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className={`text-sm font-bold ${student.active ? "text-indigo-900" : "text-slate-700"}`}>
                            {student.name}
                          </h4>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <span className="bg-slate-100 px-1.5 rounded text-[10px] font-bold text-slate-500">
                              {student.class}
                            </span>
                            <span>• NIS: {student.nis || '-'}</span>
                          </p>
                        </div>
                      </div>

                      <div className={`
                        h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300
                        ${student.active 
                          ? "bg-indigo-600 text-white scale-110 shadow-indigo-200 shadow-lg" 
                          : "bg-slate-100 text-slate-300 group-hover:bg-slate-200"
                        }
                      `}>
                        {student.active ? <Check size={16} strokeWidth={4} /> : <UserCheck size={16} />}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Search className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm font-medium">Siswa tidak ditemukan.</p>
                    <p className="text-xs">Pastikan data siswa untuk kelas ini sudah diinput.</p>
                  </div>
                )}
              </div>
              
              {/* TOMBOL SIMPAN */}
              <Button 
                className="w-full h-12 text-sm font-bold bg-slate-900 hover:bg-indigo-600 transition-all shadow-lg"
                onClick={handleSave}
                disabled={isSaving || students.length === 0}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan Data...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-4" />
                    Simpan Presensi {selectedClass}
                  </>
                )}
              </Button>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}