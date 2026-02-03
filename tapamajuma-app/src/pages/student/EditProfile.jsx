import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, 
  Camera, 
  User, 
  Mail, 
  Lock, 
  Save, 
  AlertCircle,
  Home 
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from "sonner"; 
import api from "@/lib/axios";

export default function EditProfileStandalone() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar ? `http://tapamajuma-api.my.id/storage/${user.avatar}` : null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  // Isi data saat user load
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: ''
      });
      setPreviewUrl(user.avatar ? getStorageUrl(user.avatar) : null);
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

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
      toast.success("Profil berhasil diperbarui!");
    } catch(err)  {
      console.error("Detail Error:", err);
      toast.error("Gagal: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    // Container Full Screen (Standalone)
    <div className="min-h-screen bg-slate-100 flex flex-col">
        <div className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 md:px-8">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
              <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
                    className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                >
                    <ChevronLeft size={20} className="mr-1" /> Kembali
                </Button>
                <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
                <h1 className="text-lg font-bold text-slate-800">Pengaturan Akun</h1>
            </div>
            
            {/* Logo kecil atau Identitas App */}
            <div className="text-XL font-bold text-indigo-500 tracking-widest hidden md:block">
                Tapamajuma Learning App
            </div>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="flex-1 py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
            
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
            
            {/* --- LEFT SIDE: Profile Card --- */}
            <div className="md:col-span-4 space-y-4">
              <Card className="border-none shadow-md rounded-2xl bg-white overflow-hidden sticky top-24">
                <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <CardContent className="px-6 pb-6 pt-0 flex flex-col items-center -mt-12">
                  
                  {/* Avatar Wrapper */}
                  <div className="relative group mb-3">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white p-1 shadow-lg">
                        <div className="w-full h-full rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-400 text-4xl font-bold">
                             {previewUrl ? (
                                <img src={previewUrl} className="w-full h-full object-cover" alt="Avatar" />
                              ) : (
                                user?.name?.charAt(0)
                              )}
                        </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-full shadow-md border-2 border-white hover:bg-indigo-700 transition-all"
                      title="Ganti Foto"
                    >
                      <Camera size={16} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                  
                  <h2 className="text-lg font-bold text-slate-800 text-center">{user?.name}</h2>
                  <p className="text-xs text-slate-500 text-center mb-4">{user?.email}</p>
                </CardContent>
              </Card>

              {/* Tips / Info */}
              <div className="hidden md:block bg-blue-50 border border-blue-100 p-4 rounded-2xl text-xs text-blue-700 leading-relaxed">
                 <span className="font-bold block mb-1">Tips Keamanan:</span>
                 Gunakan password yang kuat gabungan huruf dan angka agar akun kamu tetap aman.
              </div>
            </div>

            {/* --- RIGHT SIDE: Edit Form --- */}
            <div className="md:col-span-8 space-y-6">
              
              <Card className="border-none shadow-md rounded-2xl bg-white">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800">Edit Profil</CardTitle>
                  <CardDescription>Perbarui data identitas kamu di sini.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label>Nama Lengkap</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-400" size={18} />
                            <Input 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                            <Input 
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            />
                        </div>
                    </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md rounded-2xl bg-white">
                 <CardHeader>
                  <CardTitle className="text-lg text-slate-800">Ubah Password</CardTitle>
                  <CardDescription>Biarkan kosong jika tidak ingin mengubah password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Password Baru</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                                <Input 
                                    type="password"
                                    placeholder="********"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Ulangi Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                                <Input 
                                    type="password"
                                    placeholder="********"
                                    value={formData.password_confirmation}
                                    onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                                    className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button 
                    type="button" 
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="text-slate-500"
                >
                    Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 px-8 rounded-xl shadow-lg shadow-indigo-200"
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}