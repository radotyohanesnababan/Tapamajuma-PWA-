import React, { useState, useEffect } from 'react';
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  X, 
  LibraryBig, 
  Users,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner"; // <--- Menggunakan Sonner
import { usePageTitle } from '@/hooks/usePageTitle';

export default function ClassManagement() {
    usePageTitle("Manajemen Kelas");
  
  // State Data
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State UI
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ name: "" });

  // 1. FETCH DATA
  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/admin/classes');
      setClasses(response.data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal memuat data", {
        description: "Tidak dapat mengambil daftar kelas dari server."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // --- CRUD HANDLERS ---

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({ name: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (cls) => {
    setIsEditing(true);
    setCurrentId(cls.id);
    setFormData({ name: cls.name });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditing) {
        // Update
        await api.put(`/api/admin/classes/${currentId}`, formData);
        toast.success("Berhasil diperbarui", {
          description: `Nama kelas berhasil diubah menjadi ${formData.name}.`
        });
      } else {
        // Create
        await api.post('/api/admin/classes', formData);
        toast.success("Kelas berhasil dibuat", {
          description: `${formData.name} telah ditambahkan ke daftar master.`
        });
      }
      setIsModalOpen(false);
      fetchClasses(); // Refresh data
    } catch (error) {
      const msg = error.response?.data?.message || "Terjadi kesalahan.";
      toast.error("Gagal menyimpan", {
        description: msg
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, studentCount, className) => {
    // Validasi jika masih ada siswa
    if (studentCount > 0) {
      return toast.warning("Tidak bisa menghapus kelas", {
        description: `Kelas ${className} masih memiliki ${studentCount} siswa. Harap pindahkan siswa terlebih dahulu.`
      });
    }

    // Konfirmasi manual browser (atau bisa ganti modal konfirmasi custom)
    if (!window.confirm(`Yakin ingin menghapus kelas ${className}? Tindakan ini permanen.`)) return;

    try {
      await api.delete(`/api/admin/classes/${id}`);
      setClasses(prev => prev.filter(c => c.id !== id));
      toast.success("Terhapus", {
        description: `Kelas ${className} berhasil dihapus.`
      });
    } catch  {
      toast.error("Gagal menghapus", {
        description: "Terjadi kesalahan pada server."
      });
    }
  };

  // Filter Search
  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 space-y-8 font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <LibraryBig className="h-8 w-8 text-indigo-600" />
            Manajemen Kelas Master
          </h1>
          <p className="text-slate-500 mt-2">
            Total {classes.length} Kelas Terdaftar
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-slate-900 hover:bg-slate-800 shadow-lg px-6">
          <Plus className="mr-2 h-4 w-4" /> Tambah Kelas
        </Button>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input 
              placeholder="Cari kelas (contoh: 7A)..." 
              className="pl-9 bg-white border-slate-200 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-xs font-medium text-slate-500">
            Data Master
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b">
              <tr>
                <th className="px-6 py-4 w-[100px]">ID</th>
                <th className="px-6 py-4">Nama Kelas</th>
                <th className="px-6 py-4">Jumlah Siswa</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                      <p>Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredClasses.length > 0 ? (
                filteredClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-slate-400 text-xs">#{cls.id}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md border border-indigo-100">
                        {cls.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        {/* Menggunakan cls.students_count dari API */}
                        <span>{cls.students_count || 0} Siswa</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline" size="sm" 
                          className="h-8 hover:text-indigo-600 hover:border-indigo-200"
                          onClick={() => handleEdit(cls)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" size="sm" 
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(cls.id, cls.students_count, cls.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-slate-300" />
                      <p>Tidak ada data kelas ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DIALOG --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b bg-slate-50/50">
              <h2 className="font-bold text-slate-800">
                {isEditing ? "Edit Nama Kelas" : "Tambah Kelas Baru"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="transition-colors hover:text-slate-600 text-slate-400">
                <X className="h-5 w-5"/>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nama Kelas</label>
                <Input 
                  required 
                  autoFocus
                  placeholder="Contoh: 7A, 8B, IX-C" 
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400">
                  Pastikan nama kelas unik dan belum terdaftar.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-slate-900 hover:bg-slate-800" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}