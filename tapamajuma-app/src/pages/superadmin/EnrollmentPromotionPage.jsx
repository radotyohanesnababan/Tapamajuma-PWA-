import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowRight, CheckCircle2, Loader2, Users, AlertTriangle,
  GraduationCap, ChevronLeft, Zap, BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate } from "react-router-dom";

export default function EnrollmentPromotionPage() {
  usePageTitle("Kenaikan Kelas");
  const navigate = useNavigate();

  // Data
  const [allClasses, setAllClasses] = useState([]);       // semua class_names
  const [periods, setPeriods] = useState([]);              // periode tidak aktif (kandidat baru)
  const [globalPreview, setGlobalPreview] = useState(null); // summary semua kelas
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);

  // Per kelas
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [classPreview, setClassPreview] = useState(null);  // siswa di kelas terpilih
  const [loadingClass, setLoadingClass] = useState(false);

  // UI state
  const [loadingInit, setLoadingInit] = useState(true);
  const [promoting, setPromoting] = useState(false);
  const [activating, setActivating] = useState(false);
  const [confirmActivate, setConfirmActivate] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState(false);  // warning sebelum bulk per kelas
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchInit();
  }, []);

  // Fetch data awal: semua kelas, periode, dan global preview
  const fetchInit = async () => {
    try {
      setLoadingInit(true);
      const [classRes, periodRes, previewRes] = await Promise.all([
        api.get("/api/admin/classes"),
        api.get("/api/admin/academic-periods"),
        api.get("/api/admin/enrollments/promotion-preview"),
      ]);

      const classes = classRes.data?.data ?? classRes.data;
      setAllClasses(classes);
      setGlobalPreview(previewRes.data);

      const inactive = periodRes.data.filter((p) => !p.is_active);
      setPeriods(inactive);
      if (inactive.length > 0) setSelectedPeriodId(inactive[0].id);

      // Default pilih kelas pertama yang ada siswa aktif
      if (classes.length > 0) {
        setSelectedClassId(classes[0].id);
      }
    } catch (err) {
      toast.error("Gagal memuat data");
    } finally {
      setLoadingInit(false);
    }
  };

  // Fetch preview siswa per kelas yang dipilih
  useEffect(() => {
    if (!selectedClassId) return;
    fetchClassPreview(selectedClassId);
  }, [selectedClassId]);

  const fetchClassPreview = async (classId) => {
    try {
      setLoadingClass(true);
      setEditingId(null);
      const res = await api.get("/api/admin/enrollments/promotion-preview-by-class", {
        params: { class_name_id: classId },
      });
      setClassPreview(res.data);
    } catch (err) {
      toast.error("Gagal memuat data kelas");
    } finally {
      setLoadingClass(false);
    }
  };

  // Bulk naik per kelas (dengan warning dulu)
  const handlePromoteClass = async () => {
    setConfirmBulk(false);
    try {
      setPromoting(true);
      const res = await api.post("/api/admin/enrollments/promote-all", {
        class_name_id: selectedClassId,
      });
      const { updated, lulus, gagal } = res.data;
      toast.success(`${updated} siswa dinaikkan, ${lulus} lulus`);
      if (gagal?.length > 0) {
        toast.warning(`Gagal di-map: ${gagal.join(", ")}`);
      }
      // Refresh global + per kelas
      const [previewRes] = await Promise.all([
        api.get("/api/admin/enrollments/promotion-preview"),
      ]);
      setGlobalPreview(previewRes.data);
      fetchClassPreview(selectedClassId);
    } catch (err) {
      toast.error("Gagal menjalankan kenaikan kelas");
    } finally {
      setPromoting(false);
    }
  };

  // Set next class per siswa
  const handleSetNextClass = async (enrollmentId, nextClassId) => {
    try {
      setSavingId(enrollmentId);
      await api.patch(`/api/admin/enrollments/${enrollmentId}/set-next-class`, {
        next_class_id: nextClassId === "lulus" ? null : parseInt(nextClassId),
      });
      toast.success("Kelas berikutnya diperbarui");
      setEditingId(null);
      // Refresh kedua preview
      const [previewRes] = await Promise.all([
        api.get("/api/admin/enrollments/promotion-preview"),
      ]);
      setGlobalPreview(previewRes.data);
      fetchClassPreview(selectedClassId);
    } catch (err) {
      toast.error("Gagal memperbarui kelas");
    } finally {
      setSavingId(null);
    }
  };

  // Aktifkan semester baru
  const handleActivate = async () => {
    if (!selectedPeriodId) {
      toast.error("Pilih periode yang akan diaktifkan");
      return;
    }
    try {
      setActivating(true);
      const res = await api.post(`/api/admin/academic-periods/${selectedPeriodId}/activate`);
      toast.success(res.data.message);
      setConfirmActivate(false);
      navigate("/superadmin/academic-periods");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Gagal mengaktifkan periode");
    } finally {
      setActivating(false);
    }
  };

  const getBadgeColor = (nextClassName) => {
    if (!nextClassName || nextClassName === "Belum ditentukan")
      return "bg-amber-50 text-amber-600 border-amber-200";
    if (nextClassName === "Lulus")
      return "bg-emerald-50 text-emerald-600 border-emerald-200";
    return "bg-blue-50 text-blue-600 border-blue-200";
  };

  const selectedClassName = allClasses.find((c) => c.id === selectedClassId)?.name ?? "";

  if (loadingInit) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/superadmin/academic-periods")}
            className="rounded-xl text-slate-500 hover:text-slate-900"
          >
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kenaikan Kelas</h1>
            <p className="text-slate-500 mt-1">
              Periode aktif:{" "}
              <span className="font-bold text-slate-700">{globalPreview?.period}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <Users size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Siswa</p>
              <p className="text-2xl font-black text-slate-900">{globalPreview?.total_siswa ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-xl">
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Belum Ditentukan</p>
              <p className="text-2xl font-black text-slate-900">{globalPreview?.total_belum_ditentukan ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${globalPreview?.ready_to_promote ? "bg-emerald-50" : "bg-slate-100"}`}>
              <CheckCircle2
                size={18}
                className={globalPreview?.ready_to_promote ? "text-emerald-600" : "text-slate-400"}
              />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status Global</p>
              <p className={`text-sm font-black ${globalPreview?.ready_to_promote ? "text-emerald-600" : "text-amber-600"}`}>
                {globalPreview?.ready_to_promote ? "Siap Diproses" : "Belum Siap"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per Kelas Section */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                <BookOpen size={18} className="text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-base font-black text-slate-900">Kenaikan Per Kelas</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Pilih kelas, atur manual, lalu naikkan</p>
              </div>
            </div>

            {/* Pilih Kelas */}
            <div className="flex items-center gap-3">
              <Select
                value={selectedClassId?.toString()}
                onValueChange={(v) => setSelectedClassId(parseInt(v))}
              >
                <SelectTrigger className="w-40 rounded-xl font-bold text-sm">
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {allClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()} className="font-semibold text-sm">
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Tombol bulk per kelas — muncul setelah kelas dipilih */}
              {selectedClassId && (
                <Button
                  onClick={() => setConfirmBulk(true)}
                  disabled={promoting || loadingClass}
                  variant="outline"
                  className="font-bold rounded-xl gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 text-sm"
                >
                  {promoting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Zap size={14} />
                  )}
                  Naikkan Kelas {selectedClassName}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 mt-4">
          {loadingClass ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-slate-400" size={24} />
            </div>
          ) : classPreview?.data?.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                <Users className="text-slate-300" size={20} />
              </div>
              <p className="text-sm text-slate-400 font-medium">
                Tidak ada siswa aktif di kelas {selectedClassName}
              </p>
            </div>
          ) : (
            <>
              {/* Info status kelas terpilih */}
              {classPreview && (
                <div className="px-6 pb-3 flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">
                    {classPreview.total_siswa} siswa
                  </span>
                  {classPreview.total_belum_ditentukan > 0 ? (
                    <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                      {classPreview.total_belum_ditentukan} belum ditentukan
                    </span>
                  ) : (
                    <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      Semua sudah ditentukan
                    </span>
                  )}
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide pl-6">Siswa</TableHead>
                    <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide">NIS</TableHead>
                    <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide">Kelas Sekarang</TableHead>
                    <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide">Kelas Berikutnya</TableHead>
                    <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide pr-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classPreview?.data?.map((student) => (
                    <TableRow key={student.enrollment_id} className="hover:bg-slate-50/50">
                      <TableCell className="font-semibold text-slate-800 pl-6">{student.name}</TableCell>
                      <TableCell className="text-slate-500 text-sm font-mono">{student.nis ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold text-xs bg-slate-50">
                          {student.current_class}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {editingId === student.enrollment_id ? (
                          <Select
                            defaultValue={student.next_class_id?.toString() ?? "lulus"}
                            onValueChange={(val) => handleSetNextClass(student.enrollment_id, val)}
                            disabled={savingId === student.enrollment_id}
                          >
                            <SelectTrigger className="w-36 h-8 rounded-lg text-xs font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lulus" className="text-xs font-semibold text-emerald-600">
                                Lulus
                              </SelectItem>
                              {allClasses.map((cls) => (
                                <SelectItem key={cls.id} value={cls.id.toString()} className="text-xs font-semibold">
                                  {cls.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getBadgeColor(student.next_class_name)}`}>
                            {student.next_class_name}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="pr-6">
                        {editingId === student.enrollment_id ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-slate-500 hover:text-slate-700 rounded-lg"
                            onClick={() => setEditingId(null)}
                          >
                            Batal
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg font-bold"
                            onClick={() => setEditingId(student.enrollment_id)}
                          >
                            Ubah
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Activate Section */}
      <Card className={`border-none shadow-sm ${globalPreview?.ready_to_promote ? "bg-emerald-50 border border-emerald-200" : "bg-slate-50"}`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${globalPreview?.ready_to_promote ? "bg-emerald-100" : "bg-slate-200"}`}>
                <GraduationCap size={20} className={globalPreview?.ready_to_promote ? "text-emerald-600" : "text-slate-400"} />
              </div>
              <div>
                <p className="font-black text-slate-900">Aktifkan Semester Baru</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {globalPreview?.ready_to_promote
                    ? "Semua siswa sudah ditentukan. Pilih periode yang akan diaktifkan."
                    : `Selesaikan penentuan kelas untuk ${globalPreview?.total_belum_ditentukan} siswa terlebih dahulu.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {periods.length > 0 ? (
                <Select
                  value={selectedPeriodId?.toString()}
                  onValueChange={(v) => setSelectedPeriodId(parseInt(v))}
                  disabled={!globalPreview?.ready_to_promote}
                >
                  <SelectTrigger className="w-52 rounded-xl font-semibold text-sm">
                    <SelectValue placeholder="Pilih periode baru" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()} className="font-semibold text-sm">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-xs text-slate-400 font-medium">
                  Belum ada periode baru. Buat dulu di halaman Periode Akademik.
                </p>
              )}

              <Button
                onClick={() => setConfirmActivate(true)}
                disabled={!globalPreview?.ready_to_promote || !selectedPeriodId || periods.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2 shadow-sm disabled:opacity-40"
              >
                <ArrowRight size={16} />
                Aktifkan Semester Baru
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Warning Bulk Per Kelas */}
      <Dialog open={confirmBulk} onOpenChange={setConfirmBulk}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-slate-900">
              Naikkan Semua Siswa Kelas {selectedClassName}?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-slate-600 leading-relaxed">
              Sistem akan mengisi kelas berikutnya secara otomatis untuk semua siswa di kelas{" "}
              <strong>{selectedClassName}</strong> berdasarkan mapping tingkat.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                ⚠️ Perubahan manual yang sudah kamu buat untuk siswa di kelas ini akan <strong>ditimpa</strong>. Pastikan kamu memang ingin menaikkan semua secara otomatis.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmBulk(false)} className="rounded-xl font-bold">
              Batal
            </Button>
            <Button
              onClick={handlePromoteClass}
              disabled={promoting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2"
            >
              {promoting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              Ya, Naikkan Semua
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Aktifkan Semester */}
      <Dialog open={confirmActivate} onOpenChange={setConfirmActivate}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-slate-900">Konfirmasi Aktivasi Semester Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-slate-600 leading-relaxed">
              Semester baru akan diaktifkan dan enrollment semua siswa akan diperbarui sesuai kelas yang sudah ditentukan.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                ⚠️ Tindakan ini <strong>tidak bisa dibatalkan</strong>. Pastikan semua kelas sudah benar sebelum melanjutkan.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmActivate(false)} className="rounded-xl font-bold">
              Batal
            </Button>
            <Button
              onClick={handleActivate}
              disabled={activating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2"
            >
              {activating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Ya, Aktifkan Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

