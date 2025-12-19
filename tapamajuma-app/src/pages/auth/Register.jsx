import { useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", 
    password_confirmation: "", role: "student", class_name: ""
  });
  const navigate = useNavigate();

 const handleRegister = async (e) => {
  e.preventDefault();
  try {
    // 1. Ambil cookie CSRF
    await api.get("http://127.0.0.1:8000/sanctum/csrf-cookie");
    
    // 2. Fungsi ambil cookie manual milikmu
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const token = decodeURIComponent(getCookie('XSRF-TOKEN'));

    // 3. Kirim Register (Laravel Breeze otomatis meloginkan user setelah register)
    await api.post("/register", form, {
      headers: {
        'X-XSRF-TOKEN': token
      }
    });

    // 4. BERI JEDA SEDIKIT (Penting agar browser sempat menulis cookie session)
    await new Promise(resolve => setTimeout(resolve, 500));

    // 5. Ambil data user dengan proteksi 401
    try {
      const userRes = await api.get("/user");
      if (userRes.data.role === "teacher") {
        navigate("/teacher");
      } else {
        navigate("/");
      }
    } catch (userErr) {
      // Jika tetap 401 di sini, artinya register sukses tapi session gagal muat.
      // Solusi: Paksa login ulang atau lempar ke halaman login
      console.error("Gagal ambil role:", userErr);
      navigate("/login"); 
    }

  } catch (err) {
    console.error("Error Detail:", err.response?.data);
    alert(err.response?.data?.message || "Gagal mendaftar");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader><CardTitle className="text-xl font-bold text-center">Daftar Akun Baru</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs">Nama Lengkap</Label>
              <Input required onChange={e => setForm({...form, name: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Daftar Sebagai</Label>
                <select 
                  className="w-full border rounded-md p-2 text-sm bg-white"
                  value={form.role}
                  onChange={e => setForm({...form, role: e.target.value, class_name: ""})}
                >
                  <option value="student">Siswa</option>
                  <option value="teacher">Guru</option>
                </select>
              </div>

              {form.role === "student" && (
                <div className="space-y-1">
                  <Label className="text-xs">Kelas</Label>
                  <select 
                    className="w-full border rounded-md p-2 text-sm bg-white"
                    required
                    onChange={e => setForm({...form, class_name: e.target.value})}
                  >
                    <option value="">Pilih...</option>
                    <option value="VII-A">VII-A</option>
                    <option value="VII-B">VII-B</option>
                    <option value="VIII-A">VIII-A</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input type="email" required onChange={e => setForm({...form, email: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Password</Label>
                <Input type="password" required onChange={e => setForm({...form, password: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Konfirmasi</Label>
                <Input type="password" required onChange={e => setForm({...form, password_confirmation: e.target.value})} />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2">Daftar</Button>
            <p className="text-center text-[10px] text-slate-500 mt-4">
              Sudah punya akun? <Link to="/login" className="text-primary font-bold">Masuk di sini</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}