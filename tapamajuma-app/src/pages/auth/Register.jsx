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
    nis: "",
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
  {/* BAGIAN KANAN: FORM REGISTER */}
  <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
    <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 hidden lg:block">Pendaftaran</h2>
        <p className="text-slate-500 text-sm">Lengkapi data diri Anda di bawah ini.</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Nama Lengkap */}
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

        {/* Role & Kelas/Info Tambahan */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label>Daftar Sebagai</Label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <select 
                className="w-full h-10 pl-9 pr-3 rounded-md border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none appearance-none"
                required
                value={form.role}
                onChange={e => setForm({...form, role: e.target.value, class_id: "", nis: "", phone_number: ""})}
              >
                <option value="student">Siswa</option>
                <option value="teacher">Guru</option>
              </select>
            </div>
          </div>
          
          {form.role === "student" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                {/* Field Kelas */}
                <div className="space-y-1.5">
                  <Label>Kelas</Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <select
                      className="w-full h-10 pl-9 pr-3 rounded-md border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none appearance-none"
                      required
                      value={form.class_id}
                      onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                    >
                      <option value="">Pilih...</option>
                      {availableClasses.map((cls) => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Field NISN */}
                <div className="space-y-1.5">
                  <Label>NISN</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Contoh: 0012345678"
                      type="text"
                      
                      required
                      className="pl-9 bg-slate-50 focus:bg-white"
                      value={form.nis}
                      onChange={(e) => setForm({ ...form, nis: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Nomor WhatsApp Orangtua */}
              <div className="space-y-1.5">
                <Label>Nomor WhatsApp <b>Orangtua</b></Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={form.phone_number}
                    onChange={e => setForm({...form, phone_number: e.target.value})}
                    placeholder="Contoh: 08123456789"
                    className="bg-slate-50 focus:bg-white"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  *Wajib nomor aktif untuk notifikasi laporan mingguan.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-1.5 opacity-50 pointer-events-none">
              <Label>Kelas (N/A)</Label>
              <Input disabled placeholder="-" className="bg-slate-100" />
            </div>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label>Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              type="email" 
              required 
              placeholder="nama@email.com"
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
              className="pl-9 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        {/* Password & Konfirmasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                type="password" 
                required 
                placeholder="********"
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                className="pl-9 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Konfirmasi</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                type="password" 
                required 
                placeholder="********"
                value={form.password_confirmation} 
                onChange={e => setForm({...form, password_confirmation: e.target.value})} 
                className="pl-9 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 mt-2 bg-emerald-700 hover:bg-emerald-800 font-bold rounded-xl" 
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : "Daftar Akun"}
        </Button>

        {/* ... Tombol Google & Link Login (Tetap Sama) ... */}
      </form>
    </div>
  </div>
</div>
  );
}