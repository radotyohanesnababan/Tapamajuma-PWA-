// TermsPage.jsx

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg,#0891b2,#6366f1)',
              }}
            >
              <ShieldCheck size={22} color="white" />
            </div>

            <div>

              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                Syarat & Ketentuan
              </h1>
            </div>
          </div>

          <p className="text-slate-500 leading-8 text-[15px] max-w-2xl">
            Dokumen ini mengatur penggunaan layanan sistem informasi sekolah
            beserta hak dan kewajiban pengguna maupun pengelola sistem.
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
                1. Definisi
              </h2>

              <div className="space-y-5">
                <p>
                  “Sistem” adalah aplikasi sistem informasi sekolah yang
                  digunakan untuk mendukung kegiatan administrasi dan akademik.
                </p>

                <p>
                  “Pengelola” adalah pihak pengembang atau pihak yang melakukan
                  maintenance sistem.
                </p>

                <p>
                  “Pengguna” adalah sekolah, admin, guru, siswa, atau pihak lain
                  yang diberikan akses oleh sekolah.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                2. Ruang Lingkup Layanan
              </h2>

              <p className="mb-5">
                Sistem digunakan untuk mendukung kegiatan administrasi dan
                akademik sekolah termasuk namun tidak terbatas pada:
              </p>

              <ul className="space-y-3 list-disc pl-6">
                <li>Pengelolaan Data Sekolah, Guru, Siswa, dan Kelas</li>
                <li>Penilaian otomatis dan penilaian manual akademik</li>
                <li>Nilai akademik</li>
                <li>Administrasi sekolah</li>
              </ul>

              <p className="mt-5">
                Layanan dapat diperluas sesuai kebutuhan sekolah dengan kesepakatan
                antara pihak sekolah dan pengelola sistem. Data yang terkait merupakan hasil olahan yang dihasilkan dari penggunaan sistem oleh sekolah.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                3. Kepemilikan Data
              </h2>

              <div className="space-y-5">
                <p>
                  Seluruh data sekolah tetap menjadi milik sekolah
                  masing-masing.
                </p>

                <p>
                  Pengelola sistem tidak memiliki hak atas klaim isi data sekolah dan
                  tidak akan membagikan data kepada pihak lain tanpa izin
                  sekolah, kecuali diwajibkan dengan situasi tertentu seperti permintaan hukum atau untuk keperluan maintenance sistem.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                4. Kepemilikan Sistem dan Source Code
              </h2>

              <div className="space-y-5">
                <p>
                  Source code aplikasi tetap menjadi hak milik pengembang atau
                  pengelola sistem.
                </p>

                <p>
                  Sekolah hanya memperoleh hak penggunaan sistem sesuai kerja
                  sama yang telah disepakati.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                5. Kewajiban Pengguna
              </h2>

              <p className="mb-5">Pengguna wajib:</p>

              <ul className="space-y-3 list-disc pl-6">
                <li>Menjaga kerahasiaan akun</li>
                <li>Menggunakan sistem secara wajar</li>
                <li>Memastikan data yang dimasukkan benar</li>
                <li>Tidak menyalahgunakan sistem</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                6. Larangan
              </h2>

              <p className="mb-5">Pengguna dilarang:</p>

              <ul className="space-y-3 list-disc pl-6">
                <li>Melakukan akses tanpa izin</li>
                <li>Melakukan tindakan yang merusak sistem</li>
                <li>Menyebarkan malware atau spam</li>
                <li>Menggunakan sistem untuk aktivitas ilegal</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                7. Backup dan Keamanan
              </h2>

              <p>
                Pengelola berupaya menjaga keamanan sistem menggunakan standar
                keamanan yang wajar termasuk autentikasi akun, HTTPS, dan backup
                berkala sesuai layanan yang didukung.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                8. Ketersediaan Layanan
              </h2>

              <p>
                Pengelola tidak menjamin layanan bebas gangguan 100% termasuk
                gangguan akibat maintenance, gangguan hosting, gangguan jaringan,
                atau force majeure.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                9. Penghentian Layanan
              </h2>

              <p>
                Layanan dapat dihentikan apabila kerja sama berakhir atau
                terdapat pelanggaran terhadap ketentuan penggunaan sistem.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                10. Perubahan Ketentuan
              </h2>

              <p>
                Syarat dan ketentuan dapat diperbarui sewaktu-waktu sesuai
                kebutuhan pengembangan sistem.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                11. Kontak
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