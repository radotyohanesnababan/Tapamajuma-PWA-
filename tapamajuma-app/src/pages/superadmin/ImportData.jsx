import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileSpreadsheet, Download, GraduationCap, Briefcase } from "lucide-react"; // Icon Guru & Siswa
import api from '@/lib/axios';
import { toast } from "sonner"; 

export default function ImportData() {
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'teacher'
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Ganti Tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFile(null); // Reset file saat ganti tab agar tidak salah kirim
    setErrors([]);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImport = async () => {
    if (!file) return;
    setUploading(true);
    setErrors([]);

    const formData = new FormData();
    formData.append('file', file);
    
    // PERBAIKAN 1: Masukkan kembali 'type' karena validator backend memintanya
    formData.append('type', activeTab); 

    const endpoint = activeTab === 'student' 
        ? '/api/admin/stimport' 
        : '/api/admin/tcimport';

    try {
      // PERBAIKAN 2: Tambahkan config headers 'multipart/form-data' sebagai argumen ke-3
      await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', 
        },
      });
      
      toast.success(`Data ${activeTab === 'student' ? 'Siswa' : 'Guru'} berhasil diimport!`);
      setFile(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
      
    } catch (err) {
      console.error("Error upload:", err.response); // Debugging
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors); // Menangani array error dari Laravel
        toast.error("Gagal: Periksa detail kesalahan di bawah.");
      } else {
        toast.error("Terjadi kesalahan: " + (err.response?.data?.message || "Server Error"));
      }
    } finally {
      setUploading(false);
    }
  };

 const downloadTemplate = async () => {
    if (activeTab === 'student') {
        try {
            // Kita request ke API Laravel
            const response = await api.get('api/admin/templates/download-template-student', {
                responseType: 'blob', // PENTING: Agar dibaca sebagai file
            });

            // Logic download file dari Blob di Browser
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'template_siswa_pro.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            toast.error("Gagal mendownload template");
        }
    } else {
         try {
            // Kita request ke API Laravel
            const response = await api.get('api/admin/templates/download-template-teacher', {
                responseType: 'blob', // PENTING: Agar dibaca sebagai file
            });

            // Logic download file dari Blob di Browser
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'template_guru_pro.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch {
            toast.error("Gagal mendownload template");
        }
    }
};

  return (
    <div className="p-6 max-w-3xl mx-auto">
      
      {/* --- Tab Switcher --- */}
      <div className="flex p-1 bg-slate-200 rounded-xl mb-6 w-full md:w-fit mx-auto md:mx-0">
        <button
            onClick={() => handleTabChange('student')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex-1 md:flex-none justify-center ${
                activeTab === 'student' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
        >
            <GraduationCap size={18} /> Import Siswa
        </button>
        <button
            onClick={() => handleTabChange('teacher')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex-1 md:flex-none justify-center ${
                activeTab === 'teacher' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
        >
            <Briefcase size={18} /> Import Guru
        </button>
      </div>

      <Card className="border-none shadow-md rounded-2xl bg-white">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                    {activeTab === 'student' ? (
                        <>Import Data Siswa <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">Kelas Wajib</span></>
                    ) : (
                        <>Import Data Guru <span className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full">NIP Opsional</span></>
                    )}
                </CardTitle>
                <CardDescription>
                    {activeTab === 'student' 
                        ? "Pastikan file Excel memiliki kolom: nama_lengkap, email, kelas_id" 
                        : "Pastikan file Excel memiliki kolom: nama_lengkap, email, nip (opsional)"}
                </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2 text-xs w-full md:w-auto">
                <Download size={14}/> Download Template {activeTab === 'student' ? 'Siswa' : 'Guru'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Dropzone Area (Sama seperti sebelumnya) */}
          <div 
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
              file ? "border-indigo-300 bg-indigo-50" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
            }`}
            onClick={() => fileInputRef.current.click()}
          >
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e) => {
                    const f = e.target.files[0];
                    if(f) { setFile(f); setErrors([]); }
                }}
                accept=".xlsx, .xls, .csv" 
            />
             {file ? (
                <div className="flex flex-col items-center">
                    <FileSpreadsheet size={48} className="text-green-600 mb-2" />
                    <p className="font-bold text-slate-700">{file.name}</p>
                    <p className="text-xs text-slate-500">Siap diimport sebagai {activeTab === 'student' ? 'Siswa' : 'Guru'}</p>
                </div>
            ) : (
                <div className="space-y-2 pointer-events-none">
                    <UploadCloud size={32} className="mx-auto text-slate-400" />
                    <p className="text-sm font-medium text-slate-700">Klik untuk upload Excel {activeTab === 'student' ? 'Siswa' : 'Guru'}</p>
                </div>
            )}
          </div>

          {/* List Error */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-xs text-red-600">
                <p className="font-bold mb-2">Error Validasi:</p>
                <ul className="list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                    {errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button 
                onClick={handleImport} 
                disabled={!file || uploading}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-xl w-full md:w-auto"
            >
                {uploading ? "Memproses..." : `Import Data ${activeTab === 'student' ? 'Siswa' : 'Guru'}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}