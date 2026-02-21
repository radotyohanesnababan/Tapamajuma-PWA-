<!DOCTYPE html>
<html>
<head>
    <title>Laporan Lengkap Tapamajuma</title>
    <style>
        /* Mengatur margin global kertas, beri ruang di atas untuk header dan di bawah untuk footer */
        @page { margin: 150px 40px 50px 40px; }
        
        body { font-family: sans-serif; font-size: 11px; }

        /* Tambahkan di dalam <style> */
        .col-third { width: 31%; display: inline-block; vertical-align: top; margin-right: 2%; }
        .col-third:last-child { margin-right: 0; }
        
        /* HEADER FIXED (Otomatis muncul di tiap halaman) */
        header { position: fixed; top: -130px; left: 0px; right: 0px; height: 110px; text-align: center; border-bottom: 3px double black; }
        header h2, header h3, header p { margin: 2px 0; }
        .logo-kiri { position: absolute; left: 0; top: 0; width: 60px; }
        .logo-kanan { position: absolute; right: 0; top: 0; width: 60px; }

        /* FOOTER FIXED (Otomatis muncul di tiap halaman) */
        footer { position: fixed; bottom: -30px; left: 0px; right: 0px; height: 20px; text-align: right; font-style: italic; font-size: 9px; color: #64748b; }

        /* JUDUL HALAMAN */
        .page-title { font-weight: bold; font-size: 14px; margin-bottom: 15px; text-decoration: underline; background-color: #e2e8f0; padding: 5px; }
        .sub-title { font-weight: bold; margin-top: 15px; margin-bottom: 5px; color: #1e293b; }

        /* TABEL */
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid #94a3b8; padding: 5px; text-align: left; }
        th { background-color: #f1f5f9; font-weight: bold; }
        
        /* BOX REKOMENDASI */
        .insight-box { border: 2px dashed #64748b; background-color: #f8fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px;}
        .insight-box li { margin-bottom: 8px; line-height: 1.4;}

        /* UTILITIES */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .page-break { page-break-after: always; }
        .col-half { width: 48%; display: inline-block; vertical-align: top; }

        /* CSS UNTUK TANDA TANGAN */
        .signature-container { width: 100%; margin-top: 40px; overflow: hidden; }
        .signature-box { float: right; width: 280px; text-align: center; }
        .signature-box p { margin: 3px 0; }
        .signature-space { height: 70px; } /* Ruang kosong untuk ttd basah/stempel */
    </style>
</head>
<body>

    <header>
        <img src="{{ $logoKiri }}" class="logo-kiri" alt="Logo Kiri">
        <img src="{{ $logoKanan }}" class="logo-kanan" alt="Logo Kanan">
        <h3>PEMERINTAH KABUPATEN TAPANULI UTARA</h3>
        <h3>DINAS PENDIDIKAN DAN KEBUDAYAAN</h3>
        <h2>SMP NEGERI 1 SIBORONGBORONG</h2>
        <p>Jalan Siliwangi No.2 Siborongborong 22474</p>
    </header>

    <footer>
        Dicetak Otomatis Oleh Sistem Tapamajuma pada {{ date('d-m-Y H:i') }}
    </footer>

    <main>
        <p class="text-center" style="font-weight: bold; margin-bottom: 20px;">
            Periode Laporan: {{ $periodText }}
        </p>

        <div class="page-title">BAGIAN 1: RINGKASAN PERFORMA SEKOLAH</div>

        <div class="sub-title">a. Partisipasi Pengguna</div>
        <table>
            <tr>
                <td width="70%">Total Siswa Terdaftar</td><td class="text-right">{{ $summary['total_siswa'] }}</td>
            </tr>
            <tr>
                <td>Total Siswa Aktif (Mengerjakan Tugas/Membaca)</td><td class="text-right">{{ $summary['siswa_aktif_sistem'] }}</td>
            </tr>
            <tr>
                <td>Total Guru Terdaftar</td><td class="text-right">{{ $summary['total_guru'] }}</td>
            </tr>
            <tr>
                <td>Total Guru Melaksanakan Sesi Pemantauan</td><td class="text-right">{{ $summary['guru_aktif_sesi'] }}</td>
            </tr>
        </table>

        <div class="sub-title">b. Distribusi Tipe Kegiatan</div>
        <table>
            <tr>
                <td width="70%">Total Kegiatan Literasi</td><td class="text-right">{{ $summary['total_literasi'] }} Kegiatan</td>
            </tr>
            <tr>
                <td>Total Kegiatan Numerasi</td><td class="text-right">{{ $summary['total_numerasi'] }} Kegiatan</td>
            </tr>
            <tr>
                <td>Total Kegiatan TKA (Tes Kemampuan Akademik)</td><td class="text-right">{{ $summary['total_tka'] }} Kegiatan</td>
            </tr>
        </table>

        <div class="sub-title">c. Mata Pelajaran (5 Paling Diminati)</div>
        <table>
            <thead>
                <tr>
                    <th width="10%" class="text-center">No</th>
                    <th>Mata Pelajaran</th>
                    <th width="20%" class="text-center">Total Aktivitas</th>
                </tr>
            </thead>
            <tbody>
                @foreach($summary['top_mapel'] as $idx => $m)
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td>{{ $m->subject }}</td>
                    <td class="text-center">{{ $m->total }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="page-break"></div>


        <div class="page-title">BAGIAN 2: EFEKTIFITAS SESI & KEAKTIFAN GURU</div>

        <div class="sub-title">a. Guru Pemantau Paling Aktif (Ranking)</div>
        <p><i>Menampilkan guru yang paling rajin membuka sesi keaktifan kelas.</i></p>
        <table>
            <thead>
                <tr>
                    <th width="10%" class="text-center">Rank</th>
                    <th>Nama Guru</th>
                    <th width="20%" class="text-center">Total Sesi Dipandu</th>
                </tr>
            </thead>
            <tbody>
                @foreach($teacherRecap as $idx => $tr)
                <tr>
                    <td class="text-center">#{{ $idx + 1 }}</td>
                    <td>{{ $tr->teacher->name ?? '-' }}</td>
                    <td class="text-center">{{ $tr->total_sesi }} Sesi</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="sub-title">b. Riwayat Pelaksanaan Sesi</div>
        <table>
            <thead>
                <tr>
                    <th>Tanggal</th>
                    <th>Guru Pengampu</th>
                    <th>Kelas</th>
                    <th class="text-center">Siswa Hadir</th>
                </tr>
            </thead>
            <tbody>
                @foreach($sessions as $sess)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($sess->started_at)->format('d-m-Y') }}</td>
                    <td>{{ $sess->teacher->name ?? '-' }}</td>
                    <td>{{ $sess->class_name }}</td>
                    <td class="text-center">{{ $sess->students->count() }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="page-break"></div>


<div class="page-title">BAGIAN 3: ANALISIS KINERJA PER JENJANG ANGKATAN</div>

        @foreach(['Kelas 7', 'Kelas 8', 'Kelas 9'] as $grade)
        <div class="sub-title" style="background-color: #cbd5e1; padding: 3px;">Statistik {{ $grade }}</div>
        
        <div style="width: 100%; margin-bottom: 15px;">
            
            <div style="width: 32%; float: left; margin-right: 2%;">
                <p style="font-size: 11px;"><strong>Top 5 Aktif (Tugas/Soal)</strong></p>
                <table style="font-size: 10px;">
                    <tr><th>Nama Siswa</th><th class="text-center">Aktivitas</th></tr>
                    @forelse($topPerAngkatan[$grade]['teraktif'] as $t)
                    <tr><td>{{ $t->name }} ({{ $t->class_name }})</td><td class="text-center">{{ $t->total_keaktifan }}</td></tr>
                    @empty
                    <tr><td colspan="2" class="text-center">Belum ada data</td></tr>
                    @endforelse
                </table>
            </div>

            <div style="width: 32%; float: left; margin-right: 2%;">
                <p style="font-size: 11px;"><strong>Top 5 Skor Tertinggi</strong></p>
                <table style="font-size: 10px;">
                    <tr><th>Nama Siswa</th><th class="text-center">Skor</th></tr>
                    @forelse($topPerAngkatan[$grade]['tertinggi'] as $t)
                    <tr><td>{{ $t->name }} ({{ $t->class_name }})</td><td class="text-center">{{ $t->total_skor }}</td></tr>
                    @empty
                    <tr><td colspan="2" class="text-center">Belum ada data</td></tr>
                    @endforelse
                </table>
            </div>

            <div style="width: 32%; float: left;">
                <p style="font-size: 11px;"><strong>Top 5 Rajin Sesi Pagi</strong></p>
                <table style="font-size: 10px;">
                    <tr><th>Nama Siswa</th><th class="text-center">Hadir</th></tr>
                    @forelse($topPerAngkatan[$grade]['teraktif_pagi'] as $t)
                    <tr><td>{{ $t->name }} ({{ $t->class_name }})</td><td class="text-center">{{ $t->total_sesi_pagi }}</td></tr>
                    @empty
                    <tr><td colspan="2" class="text-center">Belum ada data</td></tr>
                    @endforelse
                </table>
            </div>
            
            <div style="clear: both;"></div>
        </div>

        <p style="margin-top:0;"><strong>Distribusi Minat Belajar {{ $grade }}:</strong></p>
        <table>
            <tr>
                <th class="text-center">Literasi</th>
                <th class="text-center">Numerasi</th>
                <th class="text-center">TKA</th>
            </tr>
            <tr>
                @php 
                    $numGr = str_replace('Kelas ', '', $grade);
                    $minat = isset($minatPerAngkatan[$numGr]) ? $minatPerAngkatan[$numGr]->pluck('total', 'type') : collect();
                @endphp
                <td class="text-center">{{ $minat['literacy'] ?? 0 }} Kegiatan</td>
                <td class="text-center">{{ $minat['numeracy'] ?? 0 }} Kegiatan</td>
                <td class="text-center">{{ $minat['tka'] ?? 0 }} Kegiatan</td>
            </tr>
        </table>
        @endforeach

        <div class="page-break"></div>
        
        <div class="page-title">BAGIAN 4: RANGKUMAN PERSENTASE KEBERHASILAN KELAS</div>
        <p><i>Persentase keberhasilan di bawah ini dihitung berdasarkan akumulasi rata-rata pencapaian skor siswa di masing-masing kelas.</i></p>

        <div>
            <div class="col-third">
                <div class="sub-title">A. LITERASI</div>
                <table>
                    <thead>
                        <tr>
                            <th>Kelas</th>
                            <th class="text-center">Keberhasilan</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($classSuccessRates as $c)
                        <tr>
                            <td>{{ $c->class_name }}</td>
                            <td class="text-center">{{ $c->avg_literacy }}%</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <div class="col-third">
                <div class="sub-title">B. NUMERASI</div>
                <table>
                    <thead>
                        <tr>
                            <th>Kelas</th>
                            <th class="text-center">Keberhasilan</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($classSuccessRates as $c)
                        <tr>
                            <td>{{ $c->class_name }}</td>
                            <td class="text-center">{{ $c->avg_numeracy }}%</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <div class="col-third">
                <div class="sub-title">C. TKA</div>
                <table>
                    <thead>
                        <tr>
                            <th>Kelas</th>
                            <th class="text-center">Keberhasilan</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($classSuccessRates as $c)
                        <tr>
                            <td>{{ $c->class_name }}</td>
                            <td class="text-center">{{ $c->avg_tka }}%</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>

        <div class="page-break"></div>


        <div class="page-title">BAGIAN 5: KEPUTUSAN SISTEM & REKOMENDASI</div>

        <div class="sub-title">a. Nominasi Siswa Teladan (Top 5 Keseluruhan)</div>
        <p style="font-size: 11px;"><i>Penilaian ini digabungkan secara otomatis oleh sistem berdasarkan kedisiplinan (jumlah tugas selesai & kehadiran sesi pagi) dan kualitas pemahaman (akumulasi skor nilai) pada kegiatan Literasi, Numerasi, dan TKA.</i></p>
        
        <table>
            <thead>
                <tr>
                    <th width="8%" class="text-center">Rank</th>
                    <th width="32%">Nama Siswa</th>
                    <th width="15%">Kelas</th>
                    <th width="15%" class="text-center">Tugas Selesai</th>
                    <th width="15%" class="text-center">Aktif Sesi Pagi</th>
                    <th width="15%" class="text-center">Total Skor(K.Mandiri)</th>
                </tr>
            </thead>
            <tbody>
                @forelse($siswaTeladan as $idx => $teladan)
                <tr>
                    <td class="text-center" style="font-weight: bold;">Ke-{{ $loop->iteration }}</td>
                    <td style="font-weight: bold; color: #1e3a8a;">{{ $teladan->name }}</td>
                    <td>{{ $teladan->class_name }}</td>
                    <td class="text-center">{{ $teladan->total_keaktifan }}</td>
                    <td class="text-center">{{ $teladan->total_sesi_pagi ?? 0 }}</td>
                    <td class="text-center">{{ $teladan->total_skor }}</td>
                </tr>
                @empty
                <tr><td colspan="6" class="text-center">Data belum mencukupi untuk penilaian.</td></tr>
                @endforelse
            </tbody>
        </table>

        <div class="sub-title">b. Rekomendasi & Masukan Tindakan Untuk Sekolah</div>
        <div class="insight-box">
            <strong>Hasil Analisis Otomatis Tapamajuma:</strong>
            <ul>
                @foreach($insights as $insight)
                    <li>{{ $insight }}</li>
                @endforeach
            </ul>
        </div>

        <table style="width: 100%; border: none; margin-top: 40px; margin-bottom: 20px;">
            <tr>
                <td style="width: 60%; border: none; background-color: transparent;"></td>
                
                <td style="width: 40%; border: none; text-align: center; background-color: transparent;">
                    <p style="margin: 3px 0;">Siborongborong, {{ \Carbon\Carbon::parse(now())->locale('id')->translatedFormat('d F Y') }}</p>
                    <p style="margin: 3px 0;">Koordinator Pengelola Aplikasi Tapamajuma</p>
                    
                    <div style="height: 70px;"></div>
                    
                    <p style="margin: 3px 0; font-weight: bold; text-decoration: underline;">Torus Manuntun Nababan, S.Pd, M.Pd.</p>
                    <p style="margin: 3px 0;">NIP. 197302282002121005</p>
                </td>
            </tr>
        </table>
        <div class="page-break"></div>

        <div class="page-title" style="text-align: center;">LAMPIRAN</div>
        <div class="page-title">LAMPIRAN RECORD SELURUH SISWA</div>

        <table>
            <thead>
                <tr>
                    <th width="5%" class="text-center">ID</th>
                    <th>Nama Siswa</th>
                    <th>Kelas</th>
                    <th class="text-center">Total Keaktifan</th>
                    <th class="text-center">Total Skor</th>
                </tr>
            </thead>
            <tbody>
                @foreach($allStudents as $idx => $s)
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td>{{ $s->name }}</td>
                    <td>{{ $s->class_name ?? '-' }}</td>
                    <td class="text-center">{{ $s->total_keaktifan }}</td>
                    <td class="text-center">{{ $s->total_skor }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        <div style="page-break-before: always;"></div>

        <div class="page-title" style="text-align: center;">LAMPIRAN</div>
        <div class="page-title">REKAPITULASI KEAKTIFAN SESI PAGI PER KELAS</div>
        
        <p class="text-center" style="margin-top: -10px; margin-bottom: 20px; font-size: 12px;">
            Periode: {{ $periodText }}
        </p>

        @forelse($morningSessionData as $className => $students)
            <div style="margin-top: 20px; font-weight: bold; background-color: #f8fafc; padding: 5px 10px; border: 1px solid #000; border-bottom: none;">
                Kelas: {{ $className }}
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th width="5%" class="text-center">No</th>
                        <th width="65%">Nama Siswa</th>
                        <th width="30%" class="text-center">Total Kehadiran Aktif</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($students as $index => $student)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td>{{ $student->name }}</td>
                        <td class="text-center"><strong>{{ $student->total_active }}</strong> Sesi</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @empty
            <p style="text-align: center; font-style: italic; margin-top: 30px;">
                Tidak ada data kehadiran siswa pada periode ini.
            </p>
        @endforelse

    </main>
</body>
</html>