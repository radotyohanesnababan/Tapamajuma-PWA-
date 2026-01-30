import React, { useRef, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Camera, Check, Save, User, Mail, Lock } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from "sonner"; // Pastikan sudah install sonner atau ganti dengan toast librarymu
import api from "@/lib/axios";

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar ? `https://tapamajuma-api.my.id/storage/${user.avatar}` : null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    password_confirmation: '',
    // Avatar sementara kita simpan dalam bentuk warna bg saja
    avatar_color: user?.avatar_color || 'bg-indigo-600'
  });


const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Buat preview sementara
    }
  };
const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Gunakan FormData karena kita mengirim FILE
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    if (selectedFile) data.append('avatar', selectedFile);
    if (formData.password) {
      data.append('password', formData.password);
      data.append('password_confirmation', formData.password_confirmation);
    }

    try {
      const response = await api.post('/api/user/profile-update', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(response.data.user);
      toast.success("Profil & Foto berhasil diperbarui!");
      navigate('/edit-profile');
    } catch(err)  {
      console.error("Detail Error:", err); // Ini akan memberitahu apa yang salah
  toast.error("Gagal memperbarui profil: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-24 max-w-md mx-auto bg-slate-50 min-h-screen">
      {/* Header Navigasi */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="rounded-full bg-white shadow-sm"
        >
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold text-slate-800">Edit Profil</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-indigo-600 overflow-hidden ring-4 ring-white shadow-xl flex items-center justify-center text-white text-4xl font-bold">
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                user?.name?.charAt(0)
              )}
            </div>
            <button 
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg border border-slate-100 text-indigo-600 active:scale-90 transition-all"
            >
              <Camera size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-through">Ketuk kamera untuk ganti foto</p>
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">Fitur Foto tidak bisa digunakan sementara</p>

        </div>

        {/* Form Input */}
        <div className="space-y-4">
          <Card className="border-none shadow-sm rounded-[24px]">
            <CardContent className="p-5 space-y-4">
              
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={18} />
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-indigo-500"
                    placeholder="Nama kamu..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-indigo-500"
                    placeholder="email@sekolah.com"
                  />
                </div>
                <p className="text-[9px] text-amber-500 italic ml-1">* Email akan langsung aktif tanpa verifikasi</p>
              </div>

            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[24px]">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Password Baru (Opsional)</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                  <Input 
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-indigo-500"
                    placeholder="Isi jika ingin ganti"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 ml-1">Konfirmasi Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                  <Input 
                    type="password"
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                    className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-indigo-500"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-100 font-bold text-lg"
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </form>
    </div>
  );
}