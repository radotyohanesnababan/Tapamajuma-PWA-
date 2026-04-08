import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from "@/lib/axios";

export default function SocialCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 1. TAMBAHKAN 'nis' KE DEFAULT STATE
  const [formData, setFormData] = useState({ role: '', class_id: '', nis: '' });
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const token = searchParams.get('auth_token'); 
    const onboarding = searchParams.get('needs_onboarding') === 'true';
    const role = searchParams.get('role');

    if (token) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify({ role: role }));
      
      if (onboarding) {
        setNeedsOnboarding(true);
        fetchClasses(); 
      } else {
        redirectByRole(role);
      }
    } else {
      console.error("Token tidak ditemukan di URL!");
    }
  }, [searchParams]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/api/public/classes'); 
      setClasses(res.data);
    } catch (err) {
      console.error("Gagal ambil kelas:", err);
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (role === 'teacher') {
      window.location.href = '/teacher';
    } else if (role === 'student') {
      window.location.href = '/student';
    } else if (role === 'superadmin') {
      window.location.href = '/superadmin';
    } else {
      window.location.href = '/'; 
    }
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    try {
      // Pastikan backend menggunakan payload 'nis'
      const res = await api.post('api/auth/complete-profile', formData);
      toast.success("Profil diperbarui!");
      redirectByRole(res.data.role || formData.role);
    } catch (err) {
      // 2. TANGKAP ERROR VALIDASI DARI LARAVEL (Sama seperti halaman Register)
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const firstErrorKey = Object.keys(validationErrors)[0];
        const errorMessage = validationErrors[firstErrorKey][0];
        
        toast.error("Validasi Gagal", { description: errorMessage });
      } else {
        const msg = err.response?.data?.message || "Gagal menyimpan profil.";
        toast.error("Error", { description: msg });
      }
    }
  };

  if (loading && needsOnboarding) return <div className="h-screen flex items-center justify-center">Loading form...</div>;

  if (needsOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-md">
           <h2 className="text-2xl font-black mb-4">Satu Langkah Lagi! 🚀</h2>
           <form onSubmit={handleCompleteProfile} className="space-y-4">
              
              <select 
                className="w-full h-12 rounded-xl bg-slate-100 px-4 focus:ring-2 focus:ring-indigo-600 outline-none"
                value={formData.role}
                onChange={(e) => setFormData({
                  ...formData, 
                  role: e.target.value, 
                  class_id: '', // Reset class_id jika ganti role
                  nis: ''       // Reset nis jika ganti role
                })}
                required
              >
                <option value="">Pilih Peran</option>
                <option value="student">Siswa</option>
                <option value="teacher">Guru</option>
              </select>

              {/* 3. TAMPILKAN INPUT KELAS & NIS HANYA JIKA SISWA */}
              {formData.role === 'student' && (
                <div className="space-y-4">
                  <select 
                    className="w-full h-12 rounded-xl bg-slate-100 px-4 focus:ring-2 focus:ring-indigo-600 outline-none"
                    value={formData.class_id}
                    onChange={(e) => setFormData({...formData, class_id: e.target.value})}
                    required
                  >
                    <option value="">Pilih Kelas</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.class_name || c.name}</option>)}
                  </select>

                  <input 
                    type="text"
                    placeholder="Masukkan NISN (10 Digit)"
                    className="w-full h-12 rounded-xl bg-slate-100 px-4 focus:ring-2 focus:ring-indigo-600 outline-none"
                    value={formData.nis}
                    onChange={(e) => setFormData({...formData, nis: e.target.value})}
                    required
                  />
                </div>
              )}

              <button type="submit" className="w-full bg-indigo-600 text-white h-12 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                SIMPAN & MASUK
              </button>
           </form>
        </div>
      </div>
    );
  }

  return <div className="h-screen flex items-center justify-center">Mengarahkan...</div>;
}