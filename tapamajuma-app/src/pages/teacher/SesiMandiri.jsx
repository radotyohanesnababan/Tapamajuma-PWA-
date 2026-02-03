import React, { useState, useEffect, useMemo } from 'react';
import api from "@/lib/axios"; 
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Search, UserCheck, Save, Users, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner"; 

export default function SesiMandiri() {
  
  // STATE MANAGEMENT
  const [availableClasses, setAvailableClasses] = useState([]); 
  const [students, setStudents] = useState([]); 
  const [selectedClass, setSelectedClass] = useState(null); 
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. FETCH DAFTAR KELAS
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/api/teacher/my-classes');
        const classesData = response.data;
        setAvailableClasses(classesData);

        if (classesData.length > 0) {
          setSelectedClass(classesData[0].id);
        }
      } catch (error) {
        console.error("Gagal memuat kelas:", error);
        toast.error("Gagal mengambil daftar kelas.");
      } finally {
        setIsLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  // 2. FETCH SISWA
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

  // LOGIC ACTIONS
  const toggleActive = (id) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const toggleAll = (status) => {
    setStudents(prev => prev.map(s => ({ ...s, active: status })));
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.nis && s.nis.includes(searchQuery))
    );
  }, [students, searchQuery]);

  const activeCount = students.filter(s => s.active).length;
  const totalStudents = students.length;
  const percentage = totalStudents > 0 ? Math.round((activeCount / totalStudents) * 100) : 0;

  const getSelectedClassName = () => {
    const cls = availableClasses.find(c => c.id === selectedClass);
    return cls ? cls.name : '-';
  };

  // 3. SIMPAN KE SERVER
  const handleSave = async () => {
    if (totalStudents === 0) return;
    setIsSaving(true);
    try {
      const payload = {
        class_id: selectedClass,
        students: students.map(s => ({ id: s.id, active: !!s.active }))
      };

      await api.post('/api/self-study/store', payload);
      toast.success("Presensi berhasil disimpan!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan presensi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-3xl mx-auto pb-24">
      <Card className="border-none shadow-md bg-white overflow-hidden">
        
        <CardHeader className="pb-4 space-y-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-indigo-600" />
              Presensi Sesi Mandiri
            </CardTitle>
            <CardDescription className="mt-1">
              Sesi untuk Kelas: <span className="font-bold text-indigo-600">{getSelectedClassName()}</span>
            </CardDescription>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex justify-between items-center transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-full text-indigo-600 shadow-sm">
                <UserCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-400 uppercase">Kehadiran</p>
                <div className="flex items-baseline gap-1">
                  {/* Tampilkan Loading kecil atau angka */}
                  {isLoadingStudents ? (
                    <div className="h-6 w-16 bg-indigo-200 rounded animate-pulse mt-1"></div>
                  ) : (
                    <>
                        <span className="text-2xl font-black text-indigo-700">{activeCount}</span>
                        <span className="text-sm font-medium text-indigo-400">/ {totalStudents}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
               {isLoadingStudents ? (
                    <div className="h-6 w-10 bg-indigo-200 rounded animate-pulse ml-auto"></div>
               ) : (
                    <span className="text-lg font-black text-indigo-600">{percentage}%</span>
               )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          
          {/* PILIH KELAS (Loading Skeleton) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Filter size={12} /> Pilih Kelas
            </label>
            
            {isLoadingClasses ? (
              // SKELETON LOAD KELAS
              <div className="flex gap-2 overflow-hidden">
                <div className="h-9 w-24 bg-slate-100 rounded-full animate-pulse"></div>
                <div className="h-9 w-24 bg-slate-100 rounded-full animate-pulse"></div>
                <div className="h-9 w-24 bg-slate-100 rounded-full animate-pulse"></div>
              </div>
            ) : availableClasses.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {availableClasses.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls.id)}
                    className={`
                      px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap
                      ${selectedClass === cls.id 
                        ? "bg-slate-900 text-white shadow-lg transform scale-105" 
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }
                    `}
                  >
                    Kelas {cls.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-red-50 text-red-600 text-xs rounded-lg">
                Anda belum memiliki kelas.
              </div>
            )}
          </div>

          {/* AREA SISWA */}
          {selectedClass && (
            <>
              {/* TOOLBAR */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input 
                    placeholder="Cari nama atau NIS..."
                    className="pl-9 bg-white border-slate-200 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isLoadingStudents} // Disable saat loading
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                  <Button 
                    variant="outline" size="sm" onClick={() => toggleAll(true)} 
                    className="flex-1 bg-white"
                    disabled={isLoadingStudents || students.length === 0}
                   >
                    Hadir Semua
                   </Button>
                  <Button 
                    variant="ghost" size="sm" onClick={() => toggleAll(false)} 
                    className="flex-1 text-red-500 hover:bg-red-50"
                    disabled={isLoadingStudents || students.length === 0}
                   >
                    Reset
                   </Button>
                </div>
              </div>

              {/* LIST SISWA (Dengan Skeleton Loading) */}
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {isLoadingStudents ? (
                  // --- SKELETON LOADING SISWA ---
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-white animate-pulse">
                      <div className="flex items-center gap-3 w-full">
                        <div className="h-10 w-10 bg-slate-200 rounded-full" /> {/* Avatar Skeleton */}
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-32 bg-slate-200 rounded" /> {/* Nama Skeleton */}
                          <div className="h-3 w-20 bg-slate-100 rounded" /> {/* Info Skeleton */}
                        </div>
                      </div>
                      <div className="h-8 w-8 bg-slate-200 rounded-full" /> {/* Checkbox Skeleton */}
                    </div>
                  ))
                ) : filteredStudents.length > 0 ? (
                  // --- DATA ASLI ---
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
                              {student.class_name}
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
                  // --- KOSONG ---
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Search className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm font-medium">Siswa tidak ditemukan.</p>
                  </div>
                )}
              </div>
              
              {/* TOMBOL SIMPAN */}
              <Button 
                className="w-full h-12 text-sm font-bold bg-slate-900 hover:bg-indigo-600 transition-all shadow-lg"
                onClick={handleSave}
                disabled={isSaving || students.length === 0 || isLoadingStudents} // Disable jika loading
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan Data...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-4" />
                    Simpan Presensi Kelas {getSelectedClassName()}
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