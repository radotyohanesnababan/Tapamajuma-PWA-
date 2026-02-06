import React, { useState, useEffect } from 'react';
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, X, BookMarked, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { usePageTitle } from '@/hooks/usePageTitle';

export default function SubjectManagement() {
    usePageTitle("Manajemen Mapel");
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ name: "" });

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/admin/subjects');
      setSubjects(res.data);
    } catch { toast.error("Gagal memuat mapel"); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/api/admin/subjects/${currentId}`, formData);
        toast.success("Mapel diupdate");
      } else {
        await api.post('/api/admin/subjects', formData);
        toast.success("Mapel ditambahkan");
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch  {
      toast.error("Gagal menyimpan (Nama mungkin duplikat)");
    }
  };

  const handleDelete = async (id, count) => {
    if (count > 0) return toast.warning(`Mapel ini dipakai di ${count} soal. Hapus soal dulu.`);
    if (!confirm("Hapus mapel ini?")) return;
    try {
      await api.delete(`/api/admin/subjects/${id}`);
      setSubjects(prev => prev.filter(s => s.id !== id));
      toast.success("Terhapus");
    } catch { toast.error("Gagal hapus"); }
  };

  const openModal = (subject = null) => {
    if (subject) {
      setIsEditing(true);
      setCurrentId(subject.id);
      setFormData({ name: subject.name });
    } else {
      setIsEditing(false);
      setFormData({ name: "" });
    }
    setIsModalOpen(true);
  };

  const filtered = subjects.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 space-y-8 font-sans text-slate-900">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookMarked className="h-8 w-8 text-indigo-600" /> Manajemen Mapel
          </h1>
          <p className="text-slate-500 mt-2">Total {subjects.length} Mata Pelajaran</p>
        </div>
        <Button onClick={() => openModal()} className="bg-slate-900 shadow-lg"><Plus className="mr-2 h-4 w-4"/> Tambah Mapel</Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden max-w-4xl">
        <div className="p-4 border-b flex items-center">
          <Search className="text-slate-400 h-4 w-4 mr-2" />
          <Input placeholder="Cari mapel..." className="border-none shadow-none focus-visible:ring-0" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Nama Mata Pelajaran</th>
              <th className="px-6 py-4">Total Soal</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <tr><td colSpan="3" className="p-8 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto"/></td></tr> : 
             filtered.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 group">
                <td className="px-6 py-4 font-bold text-slate-700">{s.name}</td>
                <td className="px-6 py-4 text-slate-500">{s.questions_count} Soal</td>
                <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => openModal(s)}><Pencil className="h-4 w-4 text-blue-500"/></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id, s.questions_count)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95">
            <h2 className="font-bold text-lg mb-4">{isEditing ? "Edit Mapel" : "Mapel Baru"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <Input autoFocus placeholder="Nama Mapel (ex: Matematika)" value={formData.name} onChange={e => setFormData({name: e.target.value})} required />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-slate-900">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}