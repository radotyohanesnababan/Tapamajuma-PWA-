
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Pencil, Trash2, Search, X, School, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePageTitle } from '@/hooks/usePageTitle';
import { getStorageUrl } from '@/lib/utils';

export default function TeacherManagement() {
  usePageTitle("Manajemen Guru");
  
  // DATA MASTER
  const [teachers, setTeachers] = useState([]);
  const [allClasses, setAllClasses] = useState([]); // <--- Data Kelas dari DB
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
    accessible_classes: [] // Isinya nanti array of IDs: [1, 5, 8]
  });

  // 1. FETCH DATA GURU & KELAS
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/admin/teachers');
      // Backend sekarang mengirim object { teachers: [], all_classes: [] }
      setTeachers(response.data.teachers);
      setAllClasses(response.data.all_classes); 
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data guru");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- CRUD HANDLERS ---
  const handleAdd = () => {
    setIsEditing(false);
    setFormData({ name: "", email: "", password: "", accessible_classes: [] });
    setIsModalOpen(true);
  };

  const handleEdit = (teacher) => {
    setIsEditing(true);
    setCurrentId(teacher.id);
    
    // Pastikan accessible_classes berupa array angka (ID)
    // Jika user lama masih punya data string ["7A"], ini akan error/bug, 
    // jadi asumsikan data sudah bersih atau reset ke [].
    const classes = Array.isArray(teacher.accessible_classes) 
      ? teacher.accessible_classes 
      : [];

    setFormData({
      name: teacher.name,
      email: teacher.email,
      password: "",
      accessible_classes: classes
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditing) {
        await api.put(`/api/admin/teachers/${currentId}`, formData);
        toast.success("Berhasil memperbarui data guru.");
      } else {
        await api.post('/api/admin/teachers', formData);
        toast.success("Guru baru berhasil ditambahkan.");
      }
      setIsModalOpen(false);
      fetchData(); // Refresh data total agar sinkron
    } catch (error) {
      toast.error("Gagal menyimpan data guru.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus guru ini?")) return;
    try {
      await api.delete(`/api/admin/teachers/${id}`);
      setTeachers(prev => prev.filter(t => t.id !== id));
     toast.success("Guru berhasil dihapus.");
    } catch (error) {
      toast.error("Gagal menghapus guru.");
    }
  };

  // Logic Toggle Kelas (By ID)
  const toggleClass = (classId) => {
    setFormData(prev => {
      const currentIds = prev.accessible_classes;
      if (currentIds.includes(classId)) {
        return { ...prev, accessible_classes: currentIds.filter(id => id !== classId) };
      } else {
        return { ...prev, accessible_classes: [...currentIds, classId] };
      }
    });
  };

  // Helper untuk mendapatkan Nama Kelas dari ID
  const getClassName = (id) => {
    const cls = allClasses.find(c => c.id === id);
    return cls ? cls.name : `ID:${id}`; // Fallback jika ID tidak ketemu
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 space-y-8 font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <School className="h-8 w-8 text-indigo-600" /> Manajemen Guru
          </h1>
          <p className="text-slate-500 mt-2">Total {teachers.length} Guru • {allClasses.length} Kelas Terdaftar</p>
        </div>
        <Button onClick={handleAdd} className="bg-slate-900">
          <Plus className="mr-2 h-4 w-4" /> Tambah Guru
        </Button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {/* ... (Bagian Toolbar Search sama seperti sebelumnya) ... */}
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 border-b text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Identitas Guru</th>
                <th className="px-6 py-4">Akses Kelas (ID)</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-slate-50 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={getStorageUrl(teacher.avatar)} />
                        <AvatarFallback>{teacher.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold">{teacher.name}</div>
                        <div className="text-xs text-slate-500">{teacher.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {/* RENDER BADGES BERDASARKAN ID */}
                      {teacher.accessible_classes?.map(classId => (
                        <span key={classId} className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {getClassName(classId)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(teacher)}>Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(teacher.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between">
              <h2 className="font-bold">{isEditing ? "Edit Guru" : "Tambah Guru"}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5"/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Input Nama & Email (Sama seperti sebelumnya) */}
              <div className="grid grid-cols-2 gap-4">
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nama" required />
                  <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email" required />
              </div>
              <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Password" />

              {/* GRID PILIH KELAS (DYNAMIC FROM DB) */}
              <div className="pt-4 border-t">
                <label className="font-bold mb-3 block text-sm">Hak Akses Kelas</label>
                {allClasses.length > 0 ? (
                  <div className="grid grid-cols-4 gap-3">
                    {allClasses.map((cls) => {
                      const isSelected = formData.accessible_classes.includes(cls.id); // Cek by ID
                      return (
                        <div 
                          key={cls.id}
                          onClick={() => toggleClass(cls.id)} // Toggle by ID
                          className={`
                            cursor-pointer flex items-center justify-center p-3 rounded-xl border transition-all
                            ${isSelected ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-slate-200 hover:bg-slate-50"}
                          `}
                        >
                          <span className="text-sm font-bold">{cls.name}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-red-500 text-sm">Belum ada master kelas. Tambahkan kelas dulu di menu Kelas.</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" disabled={isSaving}>Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}