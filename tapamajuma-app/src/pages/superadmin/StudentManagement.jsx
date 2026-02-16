import React, { useState, useEffect } from 'react';
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  X, 
  GraduationCap, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { usePageTitle } from '@/hooks/usePageTitle';
import { getStorageUrl } from '@/lib/utils';

export default function StudentManagement() {
  usePageTitle("Manajemen Siswa");
  // STATE DATA
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]); // Master kelas untuk dropdown
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // STATE UI
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // FORM STATE
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nis: "",
    password: "",
    class_id: "" // Menyimpan ID kelas yang dipilih
  });

  // 1. FETCH DATA (SISWA + KELAS)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/admin/students');
      setStudents(response.data.students);
      setClasses(response.data.classes);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data", { description: "Terjadi kesalahan koneksi server." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- CRUD HANDLERS ---

  const handleAdd = () => {
    setIsEditing(false);
    // Reset form, class_id default ke string kosong (pilihan "Pilih Kelas")
    setFormData({ name: "", email: "", nis: "", password: "", class_id: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (student) => {
    setIsEditing(true);
    setCurrentId(student.id);
    setFormData({
      name: student.name,
      email: student.email,
      nis: student.nis || "",
      password: "", // Kosongkan password
      class_id: student.class_id || "" // ID kelas saat ini
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!formData.class_id) {
      return toast.warning("Pilih Kelas", { description: "Siswa wajib dimasukkan ke dalam kelas." });
    }

    setIsSaving(true);
    try {
      if (isEditing) {
        // UPDATE
        const response = await api.put(`/api/admin/students/${currentId}`, formData);
        
        // Update local state (response controller sudah include relasi studentClass)
        setStudents(prev => prev.map(s => s.id === currentId ? response.data : s));
        toast.success("Berhasil Update", { description: "Data siswa diperbarui." });
      } else {
        // CREATE
        const response = await api.post('/api/admin/students', formData);
        
        setStudents(prev => [response.data, ...prev]);
        toast.success("Siswa Ditambahkan", { description: "Siswa baru berhasil didaftarkan." });
      }
      setIsModalOpen(false);
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal menyimpan data.";
      toast.error("Gagal", { description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus siswa ini?")) return;

    try {
      await api.delete(`/api/admin/students/${id}`);
      setStudents(prev => prev.filter(s => s.id !== id));
      toast.success("Terhapus", { description: "Data siswa dihapus dari sistem." });
    } catch {
      toast.error("Gagal Hapus", { description: "Terjadi kesalahan server." });
    }
  };

  // FILTER SEARCH
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nis?.includes(searchQuery) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 space-y-8 font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            Manajemen Siswa
          </h1>
          <p className="text-slate-500 mt-2">
            Total {students.length} Siswa Terdaftar
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-slate-900 hover:bg-slate-800 shadow-lg px-6">
          <Plus className="mr-2 h-4 w-4" /> Tambah Siswa
        </Button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input 
              placeholder="Cari Nama, NIS, atau Email..." 
              className="pl-9 bg-white border-slate-200 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-xs font-medium text-slate-500">
            {isLoading ? "Memuat..." : `Menampilkan ${filteredStudents.length} siswa`}
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b">
              <tr>
                <th className="px-6 py-4 w-[300px]">Identitas Siswa</th>
                <th className="px-6 py-4">NIS</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                      <p>Mengambil data siswa...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                    
                    {/* Identity Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                                                <AvatarImage src={getStorageUrl(student.avatar)} />
                                                <AvatarFallback>{student.name[0]}</AvatarFallback>
                                              </Avatar>
                        <div>
                          <div className="font-bold text-slate-800">{student.name}</div>
                          <div className="text-xs text-slate-500">{student.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* NIS Column */}
                    <td className="px-6 py-4 font-mono text-slate-600">
                      {student.nis || "-"}
                    </td>

                    {/* Class Column */}
                    <td className="px-6 py-4">
                      {student.student_class ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {student.student_class.name}
                        </span>
                      ) : (
                        <span className="text-xs text-red-400 italic">Belum ada kelas</span>
                      )}
                    </td>

                    {/* Action Column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline" size="sm" 
                          className="h-8 hover:text-indigo-600 hover:border-indigo-200"
                          onClick={() => handleEdit(student)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="ghost" size="sm" 
                          className="h-8 w-8 p-0 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(student.id)}
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
                      <p>Tidak ada data siswa ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b bg-slate-50/50">
              <h2 className="font-bold text-slate-800">
                {isEditing ? "Edit Data Siswa" : "Registrasi Siswa Baru"}
              </h2>
              <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5 text-slate-400 hover:text-slate-600"/></button>
            </div>

            <form onSubmit={handleSave} className="p-6 grid gap-4">
              
              {/* Nama & NIS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                  <Input 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Nama Siswa"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">NIS</label>
                  <Input 
                    required 
                    value={formData.nis} 
                    onChange={e => setFormData({...formData, nis: e.target.value})}
                    placeholder="Nomor Induk"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <Input 
                  required type="email"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="siswa@sekolah.id"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Password <span className="text-xs font-normal text-slate-400 ml-1">(Kosongkan jika tidak ubah)</span>
                </label>
                <Input 
                  type="password"
                  required={!isEditing} 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="Min 6 karakter"
                />
              </div>

              {/* Pilihan Kelas (Dropdown) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kelas</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.class_id}
                  onChange={e => setFormData({...formData, class_id: e.target.value})}
                  required
                >
                  <option value="" disabled>-- Pilih Kelas --</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3 mt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-slate-900 hover:bg-slate-800" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Data"}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}