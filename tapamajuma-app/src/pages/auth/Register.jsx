import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { 
  Loader2, User, Mail, Lock, School, GraduationCap, BookOpen 
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  
  // State Form
  const [form, setForm] = useState({
    name: "", 
    email: "", 
    password: "", 
    phone_number: "",
    password_confirmation: "", 
    role: "student", 
    class_id: "" 
  });
  const handleGoogleLogin = () => {
  // Langsung arahkan ke API Laravel kamu di Domcloud
  window.location.href = "https://tapamajuma-api.my.id/api/auth/google/redirect";
};
  const [isLoading, setIsLoading] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]);

  // Fetch Kelas
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get("/api/public/classes"); 
        setAvailableClasses(response.data);
      } catch (error) {
        console.error("Gagal memuat kelas", error);
      }
    };
    fetchClasses();
  }, []);

  // HANDLER REGISTER (VERSI SIMPLE)
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validasi Client Side
    if (form.password !== form.password_confirmation) {
      return toast.warning("Password konfirmasi tidak cocok.");
    }
    if (form.role === 'student' && !form.class_id) {
      return toast.warning("Siswa wajib memilih kelas.");
    }

    setIsLoading(true);

    try {
      // 1. Ambil CSRF (Wajib)
      await api.get("/sanctum/csrf-cookie");

      // 2. Kirim Data (Backend hanya simpan, tidak login)
      await api.post("/register", form);

      // 3. Sukses! Arahkan ke Login
      toast.success("Pendaftaran Berhasil!", {
        description: "Silakan login dengan akun baru Anda."
      });
      
      // Langsung pindah ke halaman Login
      navigate("/login");

    } catch (err) {
      console.error("Register Error:", err);
      const msg = err.response?.data?.message || "Gagal mendaftar.";
      toast.error("Registrasi Gagal", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 lg:bg-none">
       {/* ... (Tampilan JSX Sisanya TETAP SAMA seperti sebelumnya) ... */}
       {/* ... Pastikan bagian <form> memanggil handleRegister ini ... */}
       
       {/* BAGIAN KANAN: FORM REGISTER */}
       <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
          {/* ... Header Mobile ... */}
          <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
             <div className="text-center space-y-1 mb-6">
                <h2 className="text-2xl font-bold text-slate-900 hidden lg:block">Pendaftaran</h2>
                <p className="text-slate-500 text-sm">Lengkapi data diri Anda di bawah ini.</p>
             </div>

             <form onSubmit={handleRegister} className="space-y-4">
                {/* ... Input-input form Anda (Nama, Email, Password, dll) COPY PASTE SAJA DARI KODE SEBELUMNYA ... */}
                
                {/* Bagian Input Nama */}
                <div className="space-y-1.5">
                  <Label>Nama Lengkap</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Nama Lengkap" 
                      className="pl-9 bg-slate-50 focus:bg-white"
                      required 
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})} 
                    />
                  </div>
                </div>

                {/* Bagian Role & Kelas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Daftar Sebagai</Label>
                    <div className="relative">
                       <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                       <select 
                        className="w-full h-10 pl-9 pr-3 rounded-md border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none appearance-none"
                        value={form.role}
                        onChange={e => setForm({...form, role: e.target.value, class_id: ""})}
                       >
                        <option value="student">Siswa</option>
                        <option value="teacher">Guru</option>
                      </select>
                    </div>
                  </div>
                  
                  {form.role === "student" ? (
                    <div className="space-y-1.5">
                      <Label>Kelas</Label>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                        <select 
                          className="w-full h-10 pl-9 pr-3 rounded-md border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none appearance-none"
                          required
                          value={form.class_id}
                          onChange={e => setForm({...form, class_id: e.target.value})}
                        >
                          <option value="">Pilih...</option>
                          {availableClasses.map(cls => (
                              <option key={cls.id} value={cls.id}>{cls.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 opacity-50 pointer-events-none">
                       <Label>Mapel (N/A)</Label>
                       <Input disabled placeholder="-" className="bg-slate-100" />
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="pl-9 bg-slate-50 focus:bg-white"/>
                  </div>
                </div>
            {/* Phone Number */}
            <div className="space-y-1.5">
              <Label>Nomor WhatsApp <b>Orangtua</b> (Aktif)</Label>
              <div className="relative">
                <Input
                  type="text"
                  name="phone_number"
                  value={form.phone_number}
                  onChange={e => setForm({...form, phone_number: e.target.value})}
                  placeholder="Contoh: 08123456789/628123456789"
                  className="pl-3 bg-slate-50 focus:bg-white"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                *Wajib nomor aktif untuk notifikasi laporan mingguan.
              </p>
            </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="pl-9 bg-slate-50 focus:bg-white"/>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Konfirmasi</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input type="password" required value={form.password_confirmation} onChange={e => setForm({...form, password_confirmation: e.target.value})} className="pl-9 bg-slate-50 focus:bg-white"/>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 mt-2 bg-emerald-700 hover:bg-emerald-800 font-bold rounded-xl" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : "Daftar Akun"}
                </Button>

                <div className="flex items-center justify-center mt-4 text-slate-500">Daftar Lewat Media Sosial Anda</div>
                <Button 
            onClick={handleGoogleLogin}
            variant="outline" 
            className="w-full rounded-2xl h-12 border-slate-200 gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Daftar dengan Google
          </Button>
                <div className="text-center mt-4">
                  <p className="text-xs text-slate-500">
                    Sudah punya akun? <Link to="/login" className="text-emerald-700 font-bold hover:underline">Masuk di sini</Link>
                  </p>
                </div>

             </form>
          </div>
       </div>
    </div>
  );
}