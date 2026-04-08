/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import api from "@/lib/axios";
import { toast } from "sonner";

export function useAdminData() {
  // === STATE SISWA ===
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isStudentLoading, setIsStudentLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1, lastPage: 1, total: 0, perPage: 15, from: 0, to: 0
  });

// === STATE NISN ===
  const [nisList, setNisList] = useState([]);
  const [isNisLoading, setIsNisLoading] = useState(true);
  const [nisSearchQuery, setNisSearchQuery] = useState("");
  const [nisPagination, setNisPagination] = useState({
    currentPage: 1, lastPage: 1, total: 0, perPage: 15, from: 0, to: 0
  });

  // === FUNGSI FETCH SISWA ===
  const fetchStudents = useCallback(async (page = 1) => {
    setIsStudentLoading(true);
    try {
      const params = { page, per_page: pagination.perPage, search: searchQuery };
      const response = await api.get('/api/admin/students', { params });
      
      const { students: studentData, classes: classData } = response.data;
      setStudents(studentData.data);
      setClasses(classData);
      setPagination(prev => ({
        ...prev,
        currentPage: studentData.current_page,
        lastPage: studentData.last_page,
        total: studentData.total,
        perPage: studentData.per_page,
        from: studentData.from,
        to: studentData.to,
      }));
    } catch (error) {
      toast.error("Gagal memuat data siswa");
    } finally {
      setIsStudentLoading(false);
    }
  }, [pagination.perPage, searchQuery]);

  // Efek untuk pencarian & pagination siswa
  useEffect(() => {
    const timer = setTimeout(() => {
      const targetPage = searchQuery ? 1 : pagination.currentPage;
      fetchStudents(targetPage); 
    }, 300);
    return () => clearTimeout(timer);
  }, [pagination.currentPage, pagination.perPage, searchQuery, fetchStudents]);

  // === FUNGSI FETCH NISN ===


  // === FUNGSI FETCH NISN ===
  const fetchNis = useCallback(async (page = 1) => {
    setIsNisLoading(true);
    try {
      const params = { 
        page: page, 
        per_page: nisPagination.perPage, 
        search: nisSearchQuery 
      };
      
      const res = await api.get('/api/admin/nis', { params });
      
      // Simpan array datanya
      setNisList(res.data.data);
      
      // Update meta pagination
      setNisPagination(prev => ({
        ...prev,
        currentPage: res.data.current_page,
        lastPage: res.data.last_page,
        total: res.data.total,
        perPage: res.data.per_page,
        from: res.data.from,
        to: res.data.to,
      }));
    } catch (err) {
      toast.error("Gagal memuat data NISN Master");
    } finally {
      setIsNisLoading(false);
    }
  }, [nisPagination.perPage, nisSearchQuery]);

  // Efek Debounce & Pagination untuk NISN
  useEffect(() => {
    const timer = setTimeout(() => {
      const targetPage = nisSearchQuery ? 1 : nisPagination.currentPage;
      fetchNis(targetPage); 
    }, 300);
    return () => clearTimeout(timer);
  }, [nisPagination.currentPage, nisPagination.perPage, nisSearchQuery, fetchNis]);

  useEffect(() => {
    fetchNis(); // Panggil sekali saat mount
  }, [fetchNis]);

  // === HANDLER AKSI SISWA ===
  const handleSaveStudent = async (formData, isEditing, currentId) => {
    try {
      if (isEditing) {
        await api.put(`/api/admin/students/${currentId}`, formData);
        toast.success("Berhasil Update Siswa");
        fetchStudents(pagination.currentPage);
      } else {
        await api.post('/api/admin/students', formData);
        toast.success("Siswa Ditambahkan");
        fetchStudents(1);
      }
      return true; // Return true jika sukses untuk menutup modal
    } catch (error) {
      const msg = error.response?.data?.message || "Gagal menyimpan data.";
      toast.error("Gagal", { description: msg });
      return false;
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Yakin hapus siswa ini?")) return;
    try {
      await api.delete(`/api/admin/students/${id}`);
      toast.success("Siswa Terhapus");
      fetchStudents(pagination.currentPage);
    } catch {
      toast.error("Gagal Hapus Siswa");
    }
  };

  // === HANDLER AKSI NISN ===
  const handleNisImport = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const uploadToast = toast.loading("Mengimpor data CSV/Excel...");
    try {
      const res = await api.post('/api/admin/nis/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message, { id: uploadToast });
      fetchNis(); // Refresh tabel NIS
    } catch (err) {
      toast.error("Gagal impor file", { id: uploadToast });
    }
  };

  const handleNisUnbind = async (id, studentName) => {
    if (!window.confirm(`Yakin cabut akses NISN dari ${studentName}?`)) return;
    try {
      const res = await api.post(`/api/admin/nis/${id}/unbind`);
      toast.success(res.data.message);
      fetchNis(); // Refresh tabel NIS
      fetchStudents(pagination.currentPage); // Refresh tabel siswa juga karena nis-nya hilang
    } catch (err) {
      toast.error("Gagal mencabut akses.");
    }
  };

  const handleDownloadNisTemplate = async () => {
    try {
      const res = await api.get('/api/admin/nis/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template_nisn.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error("Gagal mengunduh template");
    }
  };

  // Export semua data dan fungsi agar bisa dipakai di UI
  return {
   // === Data Siswa ===
    students, classes, isStudentLoading, searchQuery, setSearchQuery, 
    pagination, setPagination, handleSaveStudent, handleDeleteStudent,
    
    // === Data NISN ===
    nisList, isNisLoading, handleNisImport, handleNisUnbind, handleDownloadNisTemplate,
    
    // PASTIKAN 4 VARIABEL INI ADA DI SINI:
    nisSearchQuery, setNisSearchQuery, nisPagination, setNisPagination
  };
}