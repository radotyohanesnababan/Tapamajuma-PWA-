// PrivacyPolicyPage.jsx

import React from 'react';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg,#6366f1,#0891b2)',
              }}
            >
              <Shield size={22} color="white" />
            </div>

            <div>

              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                Kebijakan Privasi
              </h1>
            </div>
          </div>

          <p className="text-slate-500 leading-8 text-[15px] max-w-2xl">
            Dokumen ini menjelaskan bagaimana data pengguna dikumpulkan,
            digunakan, disimpan, dan dilindungi dalam penggunaan sistem
            informasi sekolah.
          </p>

          <p className="text-sm text-slate-400 mt-6">
            Terakhir diperbarui: 12 Mei 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-14 leading-8 text-[15px] text-slate-600">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                1. Data yang Dikumpulkan
              </h2>

              <p className="mb-5">
                Sistem dapat menyimpan data berikut:
              </p>

              <ul className="space-y-3 list-disc pl-6">
                <li>Nama pengguna</li>
                <li>Email</li>
                <li>NISN Siswa</li>
                <li>Nomor telepon orangtua</li>
                <li>Identitas Akademik Siswa</li>
                <li>Identitas Akademik Guru</li>
                <li>Nilai akademik siswa</li>
                <li>Log aktivitas sistem</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                2. Tujuan Penggunaan Data
              </h2>

              <p className="mb-5">Data digunakan untuk:</p>

              <ul className="space-y-3 list-disc pl-6">
                <li>Operasional sistem sekolah</li>
                <li>Administrasi akademik</li>
                <li>Pengolahan nilai akademik</li>
                <li>Autentikasi akun pengguna</li>
                <li>Pembuatan laporan sekolah</li>
                <li>Peningkatan keamanan sistem</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                3. Penyimpanan dan Keamanan Data
              </h2>

              <div className="space-y-5">
                <p>
                  Data disimpan pada server atau hosting yang digunakan sekolah.
                </p>

                <p>
                  Pengelola menggunakan langkah keamanan yang wajar seperti:
                </p>

                <ul className="space-y-3 list-disc pl-6">
                  <li>HTTPS</li>
                  <li>Autentikasi akun</li>
                  <li>Pembatasan hak akses</li>
                  <li>Backup berkala</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                4. Akses Data
              </h2>

              <p className="mb-5">Data hanya dapat diakses oleh:</p>

              <ul className="space-y-3 list-disc pl-6">
                <li>Pihak sekolah</li>
                <li>Pengguna yang memiliki izin</li>
                <li>
                  Pengelola sistem untuk keperluan maintenance apabila
                  diperlukan
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                5. Pembagian Data
              </h2>

              <p>
                Data tidak diperjualbelikan atau dibagikan kepada pihak ketiga
                tanpa izin sekolah kecuali diwajibkan oleh hukum.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                6. Cookies dan Log Sistem
              </h2>

              <p className="mb-5">
                Sistem dapat menggunakan cookies dan log aktivitas untuk:
              </p>

              <ul className="space-y-3 list-disc pl-6">
                <li>Menjaga keamanan sistem</li>
                <li>Mempermudah proses login</li>
                <li>Meningkatkan pengalaman pengguna</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                7. Hak Pengguna
              </h2>

              <p className="mb-5">Pengguna dapat:</p>

              <ul className="space-y-3 list-disc pl-6">
                <li>Meminta perubahan data</li>
                <li>Meminta penghapusan akun tertentu</li>
                <li>Meminta informasi penggunaan data</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                8. Retensi Data
              </h2>

              <p>
                Data disimpan selama sistem digunakan oleh sekolah atau sesuai
                kebijakan sekolah masing-masing.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                9. Perubahan Kebijakan
              </h2>

              <p>
                Kebijakan privasi dapat diperbarui sewaktu-waktu sesuai
                kebutuhan pengembangan sistem.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                10. Kontak
              </h2>

              <div className="space-y-3">
                <p>Nama Pengembang Sistem : Mikami Satoru</p>
                <p>Email: admin@tpid.id</p>
                <p>WhatsApp: 085761304046</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}