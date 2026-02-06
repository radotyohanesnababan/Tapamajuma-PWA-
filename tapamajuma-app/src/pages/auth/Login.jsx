import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Mail, Lock, School } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Panggil API Login
      // Pastikan response dari backend mengandung 'access_token' dan 'user'
      const responseData = await login({ email, password });
      
      // ---------------------------------------------------------
      // BAGIAN BARU (PENTING!): SIMPAN TOKEN
      // ---------------------------------------------------------
      // Kita cek apakah server mengirim token?
      if (responseData?.access_token) {
          // Simpan Token ke LocalStorage (Agar axios.js bisa membacanya nanti)
          localStorage.setItem("auth_token", responseData.access_token);
          
          // Simpan data user juga (opsional, biar gampang ambil nama/role)
          localStorage.setItem("user_data", JSON.stringify(responseData.user));
      } else {
          // Jaga-jaga kalau backend lupa kirim token
          console.warn("Peringatan: Server tidak mengirim access_token");
      }
      // ---------------------------------------------------------

      const user = responseData?.user;

      toast.success("Login berhasil!", {
        description: `Selamat datang kembali, ${user?.name || 'User'}`
      });

      // Redirect sesuai Role
      if (user?.role === "teacher") {
        navigate("/teacher");
      } else if (user?.role === "superadmin") {
        navigate("/superadmin");
      } else {
        navigate("/"); // Siswa
      }

    } catch (err) {
      console.error("Login Error:", err);
      // Ambil pesan error, jaga-jaga kalau struktur errornya beda
      const errMsg = err.response?.data?.message || err.message || "Cek email dan password Anda.";
      toast.error("Login Gagal", { description: errMsg });
    } finally {
      setIsLoading(false);
    }
};

  return (
    <div className="min-h-screen w-full flex bg-slate-50 lg:bg-none">
      
      {/* --- BAGIAN KIRI: BRANDING (HANYA PC / Desktop) --- */}
      {/* Class 'hidden lg:flex' artinya sembunyi di HP, tampil flex di layar besar */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        
        {/* Dekorasi Background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-0 bottom-0 w-96 h-96 bg-emerald-500 rounded-full blur-[100px] transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Logo Brand PC */}
        <div className="relative z-10 flex items-center gap-2 text-2xl font-bold tracking-tight">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
             <School size={28} className="text-white"/> 
          </div>
          Tapamajuma
        </div>

        {/* Teks Hero PC */}
        <div className="relative z-10 max-w-lg space-y-4">
          <h1 className="text-4xl font-extrabold leading-tight">
            Digitalisasi Pendidikan untuk Masa Depan.
          </h1>
          <p className="text-slate-300 text-lg">
            Platform pembelajaran terpadu untuk kelas, numerasi, dan literasi yang lebih efektif.
          </p>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          &copy; {new Date().getFullYear()}.Tapamajuma App
        </div>
      </div>

      {/* --- BAGIAN KANAN: FORM LOGIN (PC & MOBILE) --- */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 md:p-8">
        
        {/* HEADER KHUSUS MOBILE (Muncul hanya di HP karena lg:hidden) */}
        {/* Ini menggantikan Branding Kiri yang hilang saat di HP */}
        <div className="lg:hidden mb-8 text-center animate-in slide-in-from-top-5 duration-500">
           <div className="inline-flex items-center justify-center p-4 bg-slate-900 rounded-2xl mb-4 shadow-xl shadow-slate-200">
              <School size={40} className="text-white"/>
           </div>
           <h1 className="text-2xl font-bold text-slate-900">Tapamajuma App</h1>
           <p className="text-slate-500 text-sm">Portal Digital Pengembangan Siswa</p>
        </div>

        {/* CARD FORM */}
        <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Masuk Akun</h2>
            <p className="text-slate-500 text-sm">Silakan login untuk memulai sesi.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <Input 
                  id="email"
                  type="email" 
                  placeholder="user@sekolah.id" 
                  className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-900 transition-all rounded-xl"
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">Lupa?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-900 transition-all rounded-xl"
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Masuk...
                </>
              ) : (
                "Login Sekarang"
              )}
            </Button>
          </form>

          {/* Footer Card */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Butuh bantuan akses? <a href="#" className="text-indigo-600 font-bold hover:underline">Hubungi Admin</a>
            </p>
          </div>

        </div>
      </div>
      
    </div>
  );
}