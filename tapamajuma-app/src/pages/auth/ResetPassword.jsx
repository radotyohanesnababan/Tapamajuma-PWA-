/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, CheckCircle } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function ResetPassword() {
  const { token } = useParams(); // Ambil token dari URL path /password-reset/:token
  const [searchParams] = useSearchParams(); // Ambil email dari ?email=...
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Otomatis isi email jika ada di URL
  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) setEmail  (emailFromUrl);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Endpoint standar Laravel Reset Password
      await api.post("/reset-password", {
        token: token,
        email: email,
        password: password,
        password_confirmation: passwordConfirmation,
      });

      toast.success("Password berhasil diubah! Silakan login.");
      
      // Redirect ke login setelah 2 detik
      setTimeout(() => navigate("/login"), 2000);

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Gagal mereset password. Token mungkin kadaluarsa.";
      toast.error(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-slate-800">
            Buat Password Baru
          </CardTitle>
          <CardDescription className="text-center">
            Silakan masukkan password baru untuk akun Anda.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Email (Readonly jika sudah ada dari URL, tapi tetap harus dikirim) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!!searchParams.get("email")} // Readonly jika email ada di URL
                className="bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password Baru</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  placeholder="Minimal 8 karakter"
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="password_confirmation" 
                  type="password" 
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="pl-9"
                  placeholder="Ulangi password baru"
                  required 
                />
              </div>
            </div>

            <Button type="submit" className="w-full font-bold bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
                </>
              ) : (
                "Simpan Password Baru"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}