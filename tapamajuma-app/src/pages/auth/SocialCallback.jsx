import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function SocialCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Simpan token ke tempat biasanya
      localStorage.setItem('token', token);
      toast.success("Login Google Berhasil! ✨");
      
      // Arahkan ke dashboard/home
      window.location.href = '/dashboard'; 
    } else {
      toast.error("Gagal mengambil kunci akses.");
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 font-bold text-slate-600">Menghubungkan ke TAPAMAJUMA...</p>
      </div>
    </div>
  );
}