import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Pencil, Trash2, Search, X, Loader2, AlertCircle } from "lucide-react";
import { getStorageUrl } from '@/lib/utils';
import { toast } from "sonner";

export default function StudentDataTable({ hookData }) {
  const { 
    students, classes, isStudentLoading, searchQuery, setSearchQuery, 
    pagination, setPagination, handleSaveStudent, handleDeleteStudent 
  } = hookData;

  // Local State untuk Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", nis: "", password: "", class_id: "" });

  const handleAdd = () => {
    setIsEditing(false);
    setFormData({ name: "", email: "", nis: "", password: "", class_id: "" });
    setIsModalOpen(true);
  };

  const handleEdit = (student) => {
    setIsEditing(true);
    setCurrentId(student.id);
    setFormData({
      name: student.name, email: student.email, nis: student.nis || "",
      password: "", class_id: student.class_id || ""
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!formData.class_id) return toast.warning("Pilih Kelas");
    setIsSaving(true);
    
    const success = await handleSaveStudent(formData, isEditing, currentId);
    if (success) setIsModalOpen(false);
    
    setIsSaving(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input 
            placeholder="Cari Siswa..." className="pl-9 bg-white"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={handleAdd} className="bg-slate-900 hover:bg-slate-800 w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Tambah Siswa
        </Button>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b">
            <tr>
              <th className="px-6 py-4">Siswa</th>
              <th className="px-6 py-4">NISN</th>
              <th className="px-6 py-4">Kelas</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isStudentLoading ? (
              <tr><td colSpan="4" className="text-center py-12"><Loader2 className="animate-spin mx-auto text-indigo-600" /></td></tr>
            ) : students.length > 0 ? (
              students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 group">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <Avatar><AvatarImage src={getStorageUrl(s.avatar)} /><AvatarFallback>{s.name[0]}</AvatarFallback></Avatar>
                    <div><div className="font-bold">{s.name}</div><div className="text-xs text-slate-500">{s.email}</div></div>
                  </td>
                  <td className="px-6 py-4 font-mono">{s.nis || "-"}</td>
                  <td className="px-6 py-4">
                    {s.student_class ? <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">{s.student_class.name}</span> : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteStudent(s.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="text-center py-12 text-slate-400"><AlertCircle className="mx-auto mb-2"/> Tidak ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- PAGINATION (BAGIAN YANG HILANG) --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-slate-100 bg-white">
        
        {/* KIRI: Info & Selector Jumlah Data */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500">
            Menampilkan <span className="font-medium text-slate-700">{pagination.from || 0}</span> - <span className="font-medium text-slate-700">{pagination.to || 0}</span> dari <span className="font-medium text-slate-700">{pagination.total || 0}</span>
          </div>
          
          <select 
            className="text-xs border rounded p-1.5 bg-white text-slate-600 outline-none focus:border-indigo-500"
            value={pagination.perPage} 
            onChange={(e) => {
              const newPerPage = Number(e.target.value);
              setPagination(prev => ({ ...prev, perPage: newPerPage, currentPage: 1 }));
            }}
          >
            <option value={15}>15 per hal</option>
            <option value={50}>50 per hal</option>
            <option value={100}>100 per hal</option>
          </select>
        </div>

        {/* KANAN: Navigasi & Jump to Page */}
        <div className="flex items-center gap-3">
          
          {/* Input Loncat ke Halaman */}
          <div className="flex items-center gap-2 mr-2">
            <span className="text-xs text-slate-400">Ke hal:</span>
            <input 
              type="number" 
              min="1" 
              max={pagination.lastPage}
              className="w-12 border rounded p-1 text-xs text-center outline-none focus:border-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = Math.max(1, Math.min(Number(e.target.value), pagination.lastPage));
                  setPagination(prev => ({ ...prev, currentPage: val }));
                }
              }}
              placeholder={pagination.currentPage}
            />
          </div>

          {/* Tombol Navigasi */}
          <div className="flex gap-1">
            
            {/* Tombol Prev */}
            <Button
              variant="outline" size="sm"
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={pagination.currentPage === 1}
              className="h-8 px-3"
            >
              Prev
            </Button>

            <div className="hidden md:flex gap-1">
              {[...Array(pagination.lastPage)].map((_, i) => {
                const pageNum = i + 1;
                
                // Logika Tampilan: Tampilkan halaman 1, terakhir, dan sekitar halaman aktif
                if (
                  pageNum === 1 || 
                  pageNum === pagination.lastPage || 
                  (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                ) {
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.currentPage === pageNum ? "default" : "ghost"}
                      size="sm"
                      className={`h-8 w-8 p-0 ${pagination.currentPage === pageNum ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                    >
                      {pageNum}
                    </Button>
                  );
                } 
                else if (pageNum === pagination.currentPage - 2 || pageNum === pagination.currentPage + 2) {
                  return <span key={pageNum} className="px-1 text-slate-300">...</span>;
                }
                return null;
              })}
            </div>

            {/* Tombol Next */}
            <Button
              variant="outline" size="sm"
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={pagination.currentPage === pagination.lastPage || pagination.lastPage === 0}
              className="h-8 px-3"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b bg-slate-50/50">
              <h2 className="font-bold text-slate-800">{isEditing ? "Edit Siswa" : "Registrasi Siswa"}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5 text-slate-400"/></button>
            </div>
            <form onSubmit={onSubmit} className="p-6 grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Nama</label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">NISN</label>
                  <Input value={formData.nis} onChange={e => setFormData({...formData, nis: e.target.value})} placeholder="10 Digit (Opsional)" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Email</label>
                <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Password</label>
                  <Input type="password" required={!isEditing} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={isEditing ? "Kosongkan jika tak ubah" : "Min 6 Karakter"} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Kelas</label>
                  <select className="w-full h-10 px-3 border rounded-md" value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})} required>
                    <option value="" disabled>Pilih...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button><Button type="submit" disabled={isSaving}>{isSaving ? "Menyimpan..." : "Simpan"}</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}