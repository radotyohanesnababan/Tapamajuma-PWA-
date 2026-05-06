{{-- resources/views/pdf/certificate.blade.php --}}
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  @page { size: A4 landscape; margin: 0; }

  body {
    width: 297mm;
    height: 210mm;
    font-family: 'DejaVu Serif', serif;
    background: #f8f9fd;
    position: relative;
    overflow: hidden;
  }

  /* ── Border luar & dalam ── */
  .border-outer {
    position: absolute;
    top: 7mm; left: 7mm; right: 7mm; bottom: 7mm;
    border: 2pt solid #1a3a6b;
  }
  .border-inner {
    position: absolute;
    top: 11mm; left: 11mm; right: 11mm; bottom: 11mm;
    border: 0.8pt solid #c9a84c;
  }

  /* ── Corner ornament ── */
  .corner { position: absolute; width: 10mm; height: 10mm; }
  .corner-tl { top: 4mm;  left: 4mm;  }
  .corner-tr { top: 4mm;  right: 4mm; transform: scaleX(-1); }
  .corner-bl { bottom: 4mm; left: 4mm;  transform: scaleY(-1); }
  .corner-br { bottom: 4mm; right: 4mm; transform: scale(-1); }

  /* ── Watermark ── */
  .watermark {
    position: absolute;
    top: 75mm; left: 118mm;
    width: 60mm; height: 60mm;
    opacity: 0.04;
  }

  /* ── Header navy bar ── */
  .header {
    position: absolute;
    top: 11mm; left: 11mm; right: 11mm;
    height: 22mm;
    background: #1a3a6b;
    border-bottom: 2pt solid #c9a84c;
  }
  .header table {
    width: 100%;
    height: 22mm;
    border-collapse: collapse;
  }
  .header td { vertical-align: middle; padding: 0 3mm; }
  .header .td-logo  { width: 22mm; text-align: center; }
  .header .td-info  { text-align: center; }
  .header .td-logo-r{ width: 22mm; text-align: center; }

  .logo-wrap {
    width: 16mm; height: 16mm;
    background: #fff;
    border-radius: 50%;
    overflow: hidden;
    margin: 0 auto;
    border: 1.5pt solid #c9a84c;
  }
  .logo-wrap img { width: 100%; height: 100%; object-fit: cover; }

  .school-name {
    font-size: 9.5pt;
    font-weight: bold;
    color: #f0d060;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .school-addr {
    font-size: 6pt;
    color: #a8c4e8;
    margin-top: 1mm;
    letter-spacing: 0.03em;
  }

  /* ── Content area ── */
  .content {
    position: absolute;
    top: 35mm; left: 13mm; right: 13mm; bottom: 13mm;
  }

  /* ── Divider ── */
  .divider {
    width: 100%;
    border-top: 0.6pt solid #c9a84c;
    margin: 1.5mm 0;
  }

  /* ── Title ── */
  .title {
    font-size: 26pt;
    font-weight: bold;
    color: #1a3a6b;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    text-align: center;
    line-height: 1;
    margin-top: 2mm;
  }
  .title-sub {
    font-size: 9pt;
    font-style: italic;
    color: #c9a84c;
    letter-spacing: 0.22em;
    text-align: center;
    margin-top: 1mm;
  }

  /* ── Recipient ── */
  .diberikan {
    font-size: 7pt;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #999;
    text-align: center;
    margin-top: 3mm;
  }
  .recipient {
    font-size: 22pt;
    font-weight: bold;
    color: #1a3a6b;
    text-align: center;
    line-height: 1.1;
    margin-top: 1mm;
  }
  .recipient-meta {
    font-size: 8pt;
    color: #888;
    text-align: center;
    margin-top: 1mm;
  }

  /* ── Achievement box ── */
  .ach-wrap {
    margin-top: 3mm;
    border-top: 0.5pt solid #c9a84c;
    border-bottom: 0.5pt solid #c9a84c;
    padding: 2mm 0;
    text-align: center;
  }
  .ach-label {
    font-size: 6.5pt;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #999;
  }
  .ach-rank {
    font-size: 13pt;
    font-weight: bold;
    color: #1a3a6b;
    margin-top: 0.8mm;
  }
  .ach-score {
    font-size: 8pt;
    font-style: italic;
    color: #c9a84c;
    margin-top: 0.5mm;
  }

  /* ── Footer table — hanya TTD di tengah ── */
  .footer-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 3mm;
  }
  .footer-table td { vertical-align: bottom; padding: 0; }
  .td-spacer-l { width: 15%; }
  .td-ttd      { width: 70%; text-align: center; }
  .td-spacer-r { width: 15%; }

  /* TTD tengah — besar dan mencolok */
  .ttd-city { font-size: 8pt; color: #444; text-align: center; }
  .ttd-role { font-size: 8pt; color: #444; margin-top: 0.8mm; text-align: center; }

  .ttd-space-wrap {
    position: relative;
    width: 70mm;
    height: 30mm;
    margin: 1.5mm auto 0;
  }
  .ttd-line {
    position: absolute;
    bottom: 0; left: 8mm; right: 8mm;
    border-bottom: 0.8pt solid #1a3a6b;
  }
  /* Stempel overlap pojok kiri, menimpa TTD dan garis */
  .stempel-wrap {
    position: absolute;
    left: 0; top: 0;
    width: 30mm; height: 30mm;
    opacity: 0.65;
  }
  /* TTD gambar — tengah, besar */
  .ttd-img-wrap {
    position: absolute;
    bottom: 2mm;
    left: 0; right: 0;
    text-align: center;
  }
  .ttd-img-wrap img {
    width: 46mm;
    height: auto;
    opacity: 0.93;
  }

  .ttd-name {
    font-size: 9pt;
    font-weight: bold;
    color: #1a3a6b;
    margin-top: 1.5mm;
    text-align: center;
  }
  .ttd-nip {
    font-size: 7pt;
    color: #666;
    margin-top: 0.5mm;
    text-align: center;
  }

  /* ── Footer kecil absolute — periode kiri, QR kanan ── */
  .footer-small {
    position: absolute;
    bottom: 13mm; left: 14mm; right: 14mm;
  }
  .footer-small table {
    width: 100%;
    border-collapse: collapse;
  }
  .footer-small td { vertical-align: bottom; padding: 0; }
  .fs-left  { width: 50%; text-align: left; }
  .fs-right { width: 50%; text-align: right; }

  .fs-period-label {
    font-size: 5.5pt;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #aaa;
  }
  .fs-period-value {
    font-size: 6.5pt;
    color: #1a3a6b;
    font-weight: bold;
    margin-top: 0.3mm;
  }
  .fs-period-dates {
    font-size: 6pt;
    font-style: italic;
    color: #c9a84c;
    margin-top: 0.3mm;
  }

  /* QR kecil di kanan bawah */
  .qr-box {
    width: 18mm; height: 18mm;
    border: 0.6pt solid #1a3a6b;
    padding: 1mm;
    background: #fff;
    margin: 0 0 0 auto;
  }
  .qr-box img { width: 100%; height: 100%; }
  .qr-label {
    font-size: 5pt;
    color: #888;
    margin-top: 0.5mm;
    text-align: right;
  }

  /* ── Blockchain badge ── */
  .blockchain {
    position: absolute;
    bottom: 8.5mm; left: 14mm;
    font-size: 4.5pt;
    color: #c9a84c;
    letter-spacing: 0.04em;
    font-family: 'DejaVu Sans Mono', monospace;
  }
</style>
</head>
<body>

{{-- Watermark --}}
<svg class="watermark" viewBox="0 0 100 100">
  <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="#1a3a6b"/>
</svg>

{{-- Border --}}
<div class="border-outer"></div>
<div class="border-inner"></div>

{{-- Corner ornaments --}}
@foreach(['corner-tl','corner-tr','corner-bl','corner-br'] as $c)
<svg class="corner {{ $c }}" viewBox="0 0 30 30" fill="none">
  <path d="M2 28 L2 2 L28 2" stroke="#1a3a6b" stroke-width="1.5"/>
  <path d="M2 2 L8 8" stroke="#c9a84c" stroke-width="0.8"/>
  <circle cx="2" cy="2" r="2" fill="#c9a84c"/>
</svg>
@endforeach

{{-- Header --}}
<div class="header">
  <table>
    <tr>
      <td class="td-logo">
        <div class="logo-wrap">
          <img src="{{ $logoKiri }}" alt="Logo">
        </div>
      </td>
      <td class="td-info">
        <div class="school-name">{{ $schoolName }}</div>
        <div class="school-addr">{{ $schoolAddress }}</div>
      </td>
      <td class="td-logo-r">
        <div class="logo-wrap">
          <img src="{{ $logoKanan }}" alt="Logo App">
        </div>
      </td>
    </tr>
  </table>
</div>

{{-- Content --}}
<div class="content">

  <div class="divider"></div>

  <div class="title">Sertifikat</div>
  <div class="title-sub">Penghargaan Prestasi Siswa</div>

  <div class="diberikan">Diberikan kepada</div>
  <div class="recipient">{{ $certificate->user->name }}</div>
  <div class="recipient-meta">
    Kelas {{ $certificate->user->className->name ?? '-' }}
    &nbsp;&middot;&nbsp;
    NISN: {{ $certificate->user->nis ?? '-' }}
  </div>

  <div class="ach-wrap">
    <div class="ach-label">Atas pencapaian sebagai</div>
    <div class="ach-rank">{{ $rankLabel }}</div>
    <div class="ach-score">
      {{ $certificate->score_label }}
      &nbsp;&middot;&nbsp;
      {{ $certificate->period_label }}
    </div>
  </div>

  <div class="divider" style="margin-top:3mm"></div>

  {{-- Footer: hanya TTD di tengah --}}
  <table class="footer-table">
    <tr>
      <td class="td-spacer-l"></td>

      {{-- TTD Tengah — mencolok --}}
      <td class="td-ttd">
        <div class="ttd-city">
          Siborongborong, {{ \Carbon\Carbon::parse($certificate->released_at ?? now())->translatedFormat('d F Y') }}
        </div>
        <div class="ttd-role">Kepala Sekolah,</div>

        <div class="ttd-space-wrap">
          <div class="ttd-line"></div>

          {{-- Stempel kiri overlap --}}
          @if(!empty($stempelImage))
          <img src="{{ $stempelImage }}" alt="Stempel" class="stempel-wrap">
          @else
          <svg class="stempel-wrap" viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="27" stroke="#1a3a6b" stroke-width="1.5" stroke-dasharray="3 2"/>
            <circle cx="30" cy="30" r="20" stroke="#1a3a6b" stroke-width="1"/>
            <text x="30" y="26" text-anchor="middle" font-size="6" fill="#1a3a6b" font-family="serif" font-weight="bold">SMPN 1</text>
            <text x="30" y="34" text-anchor="middle" font-size="4.5" fill="#1a3a6b" font-family="serif">SIBORONGBORONG</text>
          </svg>
          @endif

          {{-- TTD gambar besar di tengah --}}
          @if(!empty($principalSignature))
          <div class="ttd-img-wrap">
            <img src="{{ $principalSignature }}" alt="TTD Kepala Sekolah">
          </div>
          @endif
        </div>

        <div class="ttd-name">{{ $principalName }}</div>
        <div class="ttd-nip">NIP. {{ $principalNip }}</div>
      </td>

      <td class="td-spacer-r"></td>
    </tr>
  </table>

</div>

{{-- Footer kecil absolute: periode kiri, QR kanan --}}
<div class="footer-small">
  <table>
    <tr>
      <td class="fs-left">
        <div class="fs-period-label">Periode Penilaian</div>
        <div class="fs-period-value">{{ $certificate->period_label }}</div>
        <div class="fs-period-dates">
          {{ \Carbon\Carbon::parse($certificate->start_date)->translatedFormat('d F Y') }}
          &ndash;
          {{ \Carbon\Carbon::parse($certificate->end_date)->translatedFormat('d F Y') }}
        </div>
      </td>
      <td class="fs-right">
        <div class="qr-box">
          <img src="data:image/svg+xml;base64,{{ base64_encode($qrCode) }}" alt="QR" style="width:100%;height:100%;">
        </div>
        <div class="qr-label">Scan verifikasi</div>
      </td>
    </tr>
  </table>
</div>

{{-- Blockchain badge kecil --}}
@if(!empty($certificate->blockchain_tx))
<div class="blockchain">
  &#9679; Verified on Polygon &nbsp;&middot;&nbsp; TX: {{ Str::limit($certificate->blockchain_tx, 42) }}
</div>
@endif

</body>
</html>