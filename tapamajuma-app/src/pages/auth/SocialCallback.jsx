import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from "@/lib/axios"; // Pastikan axios terkonfigurasi

export default function SocialCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State untuk Onboarding
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ role: '', class_id: '' });
  const [classes, setClasses] = useState([]); // Untuk daftar kelas siswa

  useEffect(() => {
    const token = searchParams.get('token');
    const onboarding = searchParams.get('needs_onboarding') === 'true';
    const existingRole = searchParams.get('role');

    if (token) {
      localStorage.setItem('token', token);
      
      if (onboarding) {
        setNeedsOnboarding(true);
        fetchClasses(); // Ambil daftar kelas dari API
        setLoading(false);
      } else {
        // Jika sudah lengkap, langsung redirect sesuai role
        redirectByRole(existingRole);
      }
    } else {
      toast.error("Gagal login.");
      navigate('/login');
    }
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/api/public/classes'); // Buat endpoint ini di Laravel
      setClasses(res.data);
    } catch (err) { console.error(err); }
  };

  const redirectByRole = (role) => {
    if (role === 'teacher') window.location.href = '/teacher';
    else if (role === 'student') window.location.href = '/';
    else window.location.href = '/'; 
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/complete-profile', formData);
      toast.success("Profil diperbarui!");
      redirectByRole(res.data.role);
    } catch (err) {
      toast.error("Gagal menyimpan data.");
    }
  };

  if (loading) return <LoadingScreen />; // Tampilkan loading spinner

  if (needsOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-black text-slate-800 mb-2">Satu langkah lagi! 🚀</h2>
          <p className="text-sm text-slate-500 mb-6">Pilih peranmu di TAPAMAJUMA</p>
          
          <form onSubmit={handleCompleteProfile} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Saya adalah...</label>
              <select 
                className="w-full h-12 rounded-2xl bg-slate-50 border-none px-4"
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                required
              >
                <option value="">Pilih Role</option>
                <option value="student">Siswa</option>
                <option value="teacher">Guru</option>
              </select>
            </div>

            {formData.role === 'student' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Kelas</label>
                <select 
                  className="w-full h-12 rounded-2xl bg-slate-50 border-none px-4"
                  onChange={(e) => setFormData({...formData, class_id: e.target.value})}
                  required
                >
                  <option value="">Pilih Kelas</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            <button type="submit" className="w-full bg-indigo-600 text-white h-14 rounded-2xl font-black">
              MULAI BELAJAR ✨
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}

function LoadingScreen() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
    );
}