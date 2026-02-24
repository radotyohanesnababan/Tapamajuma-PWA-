import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import api from "@/lib/axios"; // Pastikan ini mengarah ke file axios kamu yang tadi

export default function SocialCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ role: '', class_id: '' });
  const [classes, setClasses] = useState([]);

useEffect(() => {
  // 1. Ambil 'auth_token' (sesuai URL: ...?auth_token=xxx)
  const token = searchParams.get('auth_token'); 
  const onboarding = searchParams.get('needs_onboarding') === 'true';
  const role = searchParams.get('role');

  console.log("Token ditemukan:", token); // Untuk memastikan tidak null lagi

  if (token) {
    // 2. Simpan ke localStorage dengan nama 'auth_token' (sesuai api.js/Axios)
    localStorage.setItem('auth_token', token);
    // Simpan juga minimal role-nya biar GuestGuard tau jalan pulang
localStorage.setItem('user_data', JSON.stringify({ role: role }));
    
    if (onboarding) {
      setNeedsOnboarding(true);
      fetchClasses(); // Pastikan fungsi ini ada untuk ambil daftar kelas
      setLoading(false);
    } else {
      // Jika bukan user baru, langsung arahkan
      redirectByRole(role);
    }
  } else {
    console.error("Token tidak ditemukan di URL! Pastikan kunci di URL adalah 'auth_token'");
  }
}, [searchParams]);
  const fetchClasses = async () => {
    try {
      const res = await api.get('/api/public/classes'); // Endpoint daftar kelas kamu
      setClasses(res.data);
    } catch (err) {
      console.error("Gagal ambil kelas:", err);
    } finally {
      setLoading(false);
    }
  };

const redirectByRole = (role) => {
  console.log("Redirecting for role:", role); // Untuk pantau di console

  if (role === 'teacher') {
    window.location.href = '/teacher';
  } else if (role === 'student') {
    window.location.href = '/student';
  } else if (role === 'superadmin') {
    window.location.href = '/superadmin';
  } else {
    // Jika role kosong atau tidak dikenal, balik ke home atau login
    window.location.href = '/'; 
  }
};

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('api/auth/complete-profile', formData);
      toast.success("Profil diperbarui!");
      redirectByRole(res.data.role);
    } catch (err) {
      toast.error("Gagal menyimpan profil.");
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
                className="w-full h-12 rounded-xl bg-slate-100 px-4"
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                required
              >
                <option value="">Pilih Peran</option>
                <option value="student">Siswa</option>
                <option value="teacher">Guru</option>
              </select>

              {formData.role === 'student' && (
                <select 
                  className="w-full h-12 rounded-xl bg-slate-100 px-4"
                  onChange={(e) => setFormData({...formData, class_id: e.target.value})}
                  required
                >
                  <option value="">Pilih Kelas</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.class_name || c.name}</option>)}
                </select>
              )}

              <button type="submit" className="w-full bg-indigo-600 text-white h-12 rounded-xl font-bold">
                SIMPAN & MASUK
              </button>
           </form>
        </div>
      </div>
    );
  }

  return <div className="h-screen flex items-center justify-center">Mengarahkan...</div>;
}