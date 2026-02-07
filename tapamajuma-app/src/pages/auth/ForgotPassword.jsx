import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import api from "@/lib/axios"; // Pastikan path axios kamu benar
import { toast } from "sonner"; // Atau library toast lain yg kamu pakai

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false); // State jika email sukses terkirim

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      
      await api.get('/sanctum/csrf-cookie');
      // Endpoint standar Laravel Fortify/Breeze untuk forgot password
      await api.post("/forgot-password", { email });
      
      setIsSent(true);
      toast.success("Link reset password telah dikirim ke email Anda.");
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Gagal mengirim link. Cek email Anda.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-slate-800">
            Lupa Password?
          </CardTitle>
          <CardDescription className="text-center">
            {isSent 
              ? "Cek email Anda untuk instruksi selanjutnya."
              : "Masukkan email Anda, kami akan mengirimkan link reset."}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isSent ? (
            <div className="text-center space-y-4 animate-in fade-in zoom-in">
              <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} />
              </div>
              <p className="text-sm text-slate-600">
                Kami telah mengirimkan link reset password ke <strong>{email}</strong>. 
                Silakan cek kotak masuk atau folder spam Anda.
              </p>
              <Button variant="outline" className="w-full" onClick={() => setIsSent(false)}>
                Kirim Ulang Link
              </Button>
              <div className="pt-4">
                <Link to="/login" className="text-sm text-indigo-600 hover:underline font-medium flex items-center justify-center gap-2">
                  <ArrowLeft size={16} /> Kembali ke Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Terdaftar</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="nama@sekolah.sch.id" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="bg-slate-50"
                />
              </div>

              <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...
                  </>
                ) : (
                  "Kirim Link Reset"
                )}
              </Button>

              <div className="text-center mt-4">
                <Link to="/login" className="text-sm text-slate-500 hover:text-indigo-600 flex items-center justify-center gap-2">
                  <ArrowLeft size={14} /> Kembali ke Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}