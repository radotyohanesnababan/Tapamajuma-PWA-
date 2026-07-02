import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, CheckCircle2, Clock, ChevronRight, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate } from "react-router-dom";

export default function AcademicPeriodPage() {
  usePageTitle("Periode Akademik");
  const navigate = useNavigate();

  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    semester: "",
    academic_year: "",
  });

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/academic-periods");
      setPeriods(res.data);
    } catch (err) {
      toast.error("Gagal memuat data periode");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.semester || !form.academic_year) {
      toast.error("Semua field wajib diisi");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/api/admin/academic-periods", form);
      toast.success("Periode berhasil dibuat");
      setDialogOpen(false);
      setForm({ name: "", semester: "", academic_year: "" });
      fetchPeriods();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Gagal membuat periode");
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-generate name saat semester + academic_year diisi
  const handleSemesterOrYearChange = (field, value) => {
    const updated = { ...form, [field]: value };
    if (updated.semester && updated.academic_year) {
      const label = updated.semester === "ganjil" ? "Ganjil" : "Genap";
      updated.name = `Semester ${label} ${updated.academic_year}`;
    }
    setForm(updated);
  };

  const activePeriod = periods.find((p) => p.is_active);
  const inactivePeriods = periods.filter((p) => !p.is_active);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Periode Akademik</h1>
          <p className="text-slate-500 mt-1">Kelola semester aktif dan riwayat tahun ajaran</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 shadow-sm"
        >
          <Plus size={16} />
          Periode Baru
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      ) : (
        <>
          {/* Periode Aktif */}
          {activePeriod ? (
            <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden relative">
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
                        Periode Aktif
                      </span>
                    </div>
                    <h2 className="text-2xl font-black">{activePeriod.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-blue-100">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        Dibuka {formatDate(activePeriod.opened_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <BookOpen size={24} className="text-white" />
                    </div>
                    <Button
                      onClick={() => navigate("/superadmin/enrollment-promotion")}
                      className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-lg gap-1.5 shadow-lg"
                    >
                      Kelola Kenaikan Kelas
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-sm border-dashed border-2 border-slate-200 bg-slate-50">
              <CardContent className="p-8 text-center space-y-3">
                <div className="w-14 h-14 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                  <Calendar className="text-slate-300" size={24} />
                </div>
                <p className="text-slate-500 font-medium">Belum ada periode aktif</p>
                <p className="text-xs text-slate-400">Buat periode baru dan aktifkan untuk mulai mencatat data siswa</p>
              </CardContent>
            </Card>
          )}

          {/* Periode Tidak Aktif / Riwayat */}
          {inactivePeriods.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Riwayat Periode</h2>
              <div className="space-y-2">
                {inactivePeriods.map((period) => (
                  <Card key={period.id} className="border-none shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-slate-100 rounded-xl">
                            <Clock size={18} className="text-slate-400" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{period.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {formatDate(period.opened_at)} — {formatDate(period.closed_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs font-semibold bg-slate-100 text-slate-500">
                            Selesai
                          </Badge>
                          {/* Tombol aktifkan — untuk kasus rollback atau aktivasi manual */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs font-bold border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg"
                            onClick={() => navigate(`/superadmin/enrollment-promotion?period_id=${period.id}`)}
                          >
                            Lihat Detail
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty state kalau tidak ada periode sama sekali */}
          {periods.length === 0 && (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                <Calendar className="text-slate-300" size={28} />
              </div>
              <p className="text-slate-500 font-medium">Belum ada periode akademik</p>
              <p className="text-xs text-slate-400">Mulai dengan membuat periode pertama</p>
            </div>
          )}
        </>
      )}

      {/* Dialog Buat Periode Baru */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-slate-900">Buat Periode Baru</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Semester</Label>
                <Select
                  value={form.semester}
                  onValueChange={(v) => handleSemesterOrYearChange("semester", v)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Pilih semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ganjil">Ganjil</SelectItem>
                    <SelectItem value="genap">Genap</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Tahun Ajaran</Label>
                <Input
                  placeholder="2026/2027"
                  value={form.academic_year}
                  onChange={(e) => handleSemesterOrYearChange("academic_year", e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Nama Periode</Label>
              <Input
                placeholder="Otomatis terisi"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl"
              />
              <p className="text-[11px] text-slate-400">Otomatis terisi dari semester + tahun ajaran, bisa diubah manual</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                Periode baru dibuat dalam status <strong>tidak aktif</strong>. Untuk mengaktifkannya, perlu menyelesaikan proses kenaikan kelas terlebih dahulu melalui halaman Kenaikan Kelas.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="rounded-xl font-bold"
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Buat Periode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}