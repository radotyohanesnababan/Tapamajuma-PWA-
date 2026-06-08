{{-- resources/views/pdf/certificate-new.blade.php --}}
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
    position: relative;
    overflow: hidden;
  }

  /* ── Background ── */
  .background {
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
  }
  .background img {
    width: 100%;
    height: 100%;
  }

  /* ── FRAME: PALING BELAKANG & SEDIKIT LEBIH KECIL ── */
  .frame {
  position: absolute;
  top: 0;           /* FULL */
  left: 0;          /* FULL */
  width: 100%;      /* FULL */
  height: 100%;     /* FULL */
  z-index: 1;       /* Di atas background, di bawah konten */
  object-fit: cover;
}
  .frame img {
    width: 100%;
    height: 100%;
    object-fit: contain;  /* JAGA ASPECT RATIO */
  }

  /* ── Main Container ── */
  .container {
    position: relative;
    width: 297mm;
    height: 210mm;
    z-index: 1;
  }

  /* ── Border Frame (Gold) ── */
  .border-outer {
    position: absolute;
    top: 8mm; left: 8mm; right: 8mm; bottom: 8mm;
    border: 3pt solid #d4a746;
    background: rgba(255, 255, 255, 0.75);
    z-index: 3;  /* DI ATAS FRAME */
  }
  .border-inner {
    position: absolute;
    top: 12mm; left: 12mm; right: 12mm; bottom: 12mm;
    border: 1.2pt solid #d4a746;
    z-index: 3;  /* DI ATAS FRAME */
  }

  /* ── Corner Ornaments ── */
  .corner {
    position: absolute;
    width: 20mm;
    height: 20mm;
    z-index: 4;  /* DI ATAS SEMUA */
  }
  .corner-tl { top: 6mm; left: 6mm; }
  .corner-tr { top: 6mm; right: 6mm; }
  .corner-bl { bottom: 6mm; left: 6mm; }
  .corner-br { bottom: 6mm; right: 6mm; }

  /* ── HEADER TABLE: 3 LOGOS ── */
  .header-wrapper {
    position: absolute;
    top: 15mm;
    left: 48.5mm;
    width: 200mm;
    z-index: 5;  /* DI ATAS FRAME */
  }
  
  .header-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .header-table td {
    vertical-align: middle;
    text-align: center;
  }
  
  .td-logo-left {
    width: 24mm;
  }
  
  .td-logo-center {
    width: auto;
  }
  
  .td-logo-right {
    width: 24mm;
  }
  
  .logo-img {
    width: 24mm;
    height: 24mm;
  }
  
  .logo-center-img {
    width: 45mm;
    height: 26mm;
  }

  /* ── Content Area ── */
  .content {
    position: absolute;
    top: 48mm;
    left: 15mm;
    right: 15mm;
    text-align: center;
    z-index: 5;  /* DI ATAS FRAME */
  }

  /* ── Title ── */
  .title {
    font-size: 32pt;
    font-weight: bold;
    color: #1e4d8b;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    line-height: 1;
    margin-bottom: 2mm;
  }
  .subtitle {
    font-size: 11pt;
    font-weight: bold;
    color: #1e4d8b;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 6mm;
  }

  /* ── Recipient ── */
  .diberikan {
    font-size: 8pt;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #333;
    margin-bottom: 2mm;
  }
  .recipient-name {
    font-size: 28pt;
    font-weight: bold;
    color: #000;
    line-height: 1.2;
    margin-bottom: 1mm;
    border-bottom: 1.5pt dotted #999;
    padding-bottom: 2mm;
    display: inline-block;
    min-width: 180mm;
  }

  /* ── Achievement ── */
  .achievement-label {
    font-size: 8pt;
    color: #333;
    margin-top: 5mm;
    margin-bottom: 2mm;
  }
  .achievement-rank {
    font-size: 18pt;
    font-weight: bold;
    color: #000;
    letter-spacing: 0.08em;
    margin-bottom: 4mm;
  }

  /* ── Description ── */
  .description {
    font-size: 8pt;
    color: #333;
    line-height: 1.6;
    text-align: center;
    max-width: 240mm;
    margin: 0 auto;
    padding: 0 10mm;
  }

  /* ── Footer: Dual Signature (TABLE) ── */
  .footer {
    position: absolute;
    bottom: 15mm;
    left: 15mm;
    right: 15mm;
    z-index: 5;  /* DI ATAS FRAME */
  }
  
  .signature-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .signature-table td {
    width: 50%;
    vertical-align: bottom;
    text-align: center;
    padding: 0 5mm;
  }

  /* ── Signature Box ── */
  .sig-title {
    font-size: 8pt;
    font-weight: bold;
    color: #333;
    margin-bottom: 0.5mm;
  }
  .sig-school {
    font-size: 7.5pt;
    color: #555;
    margin-bottom: 3mm;
  }
  
  /* ── SIGNATURE SPACE ── */
  .sig-space {
    height: 28mm;
    position: relative;
    margin-bottom: 2mm;
  }
  
  .sig-line {
    position: absolute;
    bottom: 0;
    left: 12mm;
    right: 12mm;
    border-bottom: 1pt solid #333;
  }
  
  /* TTD GAMBAR */
  .sig-image {
    position: absolute;
    bottom: 5mm;
    left: 50%;
    margin-left: -27.5mm;
    width: 55mm;
    height: auto;
    opacity: 0.92;
    z-index: 6;  /* DI ATAS FRAME */
  }
  
  /* STEMPEL */
  .stempel-wrap {
    position: absolute;
    left: 12mm;
    bottom: 4mm;
    width: 32mm;
    height: 32mm;
    opacity: 0.68;
    z-index: 5;  /* DI ATAS FRAME TAPI DI BAWAH TTD */
  }
  
  .sig-name {
    font-size: 9pt;
    font-weight: bold;
    color: #000;
    margin-bottom: 0.5mm;
  }
  .sig-nip {
    font-size: 7pt;
    color: #555;
  }

</style>
</head>
<body>

{{-- Background Image --}}
<div class="background">
  @if(!empty($background))
  <img src="{{ $background }}" alt="Background">
  @endif
</div>

{{-- Frame Ornament (PALING BELAKANG & SEDIKIT LEBIH KECIL) --}}
<div class="frame">
  @if(!empty($frame))
  <img src="{{ $frame }}" alt="Frame">
  @endif
</div>

<div class="container">

  {{-- Border Frame --}}
  <div class="border-outer"></div>
  <div class="border-inner"></div>

  {{-- Corner Ornaments --}}
  <svg class="corner corner-tl" viewBox="0 0 100 100" fill="none">
    <path d="M10,90 L10,10 L90,10" stroke="#d4a746" stroke-width="5" fill="none"/>
    <circle cx="10" cy="10" r="6" fill="#d4a746"/>
    <path d="M10,10 L30,30" stroke="#d4a746" stroke-width="3"/>
  </svg>
  
  <svg class="corner corner-tr" viewBox="0 0 100 100" fill="none">
    <path d="M90,90 L90,10 L10,10" stroke="#d4a746" stroke-width="5" fill="none"/>
    <circle cx="90" cy="10" r="6" fill="#d4a746"/>
    <path d="M90,10 L70,30" stroke="#d4a746" stroke-width="3"/>
  </svg>
  
  <svg class="corner corner-bl" viewBox="0 0 100 100" fill="none">
    <path d="M10,10 L10,90 L90,90" stroke="#d4a746" stroke-width="5" fill="none"/>
    <circle cx="10" cy="90" r="6" fill="#d4a746"/>
    <path d="M10,90 L30,70" stroke="#d4a746" stroke-width="3"/>
  </svg>
  
  <svg class="corner corner-br" viewBox="0 0 100 100" fill="none">
    <path d="M90,10 L90,90 L10,90" stroke="#d4a746" stroke-width="5" fill="none"/>
    <circle cx="90" cy="90" r="6" fill="#d4a746"/>
    <path d="M90,90 L70,70" stroke="#d4a746" stroke-width="3"/>
  </svg>

  {{-- Header: 3 Logos dengan TABLE --}}
  <div class="header-wrapper">
    <table class="header-table">
      <tr>
        <td class="td-logo-left">
          @if(!empty($logoKiri))
          <img src="{{ $logoKiri }}" alt="Logo Kiri" class="logo-img">
          @endif
        </td>
        
        <td class="td-logo-center">
          @if(!empty($logoTengah))
          <img src="{{ $logoTengah }}" alt="Logo Tengah" class="logo-center-img">
          @endif
        </td>
        
        <td class="td-logo-right">
          @if(!empty($logoKanan))
          <img src="{{ $logoKanan }}" alt="Logo Kanan" class="logo-img">
          @endif
        </td>
      </tr>
    </table>
  </div>

  {{-- Content --}}
  <div class="content">
    <div class="title">{{ $certificateTitle ?? 'SERTIFIKAT' }}</div>
    <div class="subtitle">{{ $certificateSubtitle ?? 'LITERASI DAN NUMERASI' }}</div>

    <div class="diberikan">{{ $givenToLabel ?? 'DIBERIKAN KEPADA :' }}</div>
    <div class="recipient-name">{{ $recipientName ?? 'John Doe' }}</div>

    <div class="achievement-label">{{ $achievementLabel ?? 'Atas Prestasi Sebagai :' }}</div>
    <div class="achievement-rank">{{ $rankLabel ?? 'Juara 1 Kelas VII-7' }}</div>

    @if(!empty($achievementDesc))
    <div class="description">
      {{ $achievementDesc }}
    </div>
    @endif
  </div>

  {{-- Footer: Dual Signature dengan TABLE --}}
  <div class="footer">
    <table class="signature-table">
      <tr>
        {{-- Signature Left: Kepala Sekolah (DENGAN STEMPEL) --}}
        <td>
          <div class="sig-title">{{ $principalTitle ?? 'Kepala Sekolah' }}</div>
          <div class="sig-school">{{ $principalSchool ?? 'SMP Negeri 1 Siborongborong' }}</div>
          
          <div class="sig-space">
            <div class="sig-line"></div>
            
            {{-- STEMPEL --}}
            @if(!empty($stempelImage))
            <img src="{{ $stempelImage }}" alt="Stempel" class="stempel-wrap">
            @else
            <svg class="stempel-wrap" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke="#1a3a6b" stroke-width="2" fill="none" opacity="0.6"/>
              <circle cx="50" cy="50" r="35" stroke="#1a3a6b" stroke-width="1.5" fill="none" opacity="0.5"/>
              <text x="50" y="45" text-anchor="middle" font-size="10" fill="#1a3a6b" font-weight="bold">SMPN 1</text>
              <text x="50" y="58" text-anchor="middle" font-size="7" fill="#1a3a6b">SIBORONGBORONG</text>
            </svg>
            @endif
            
            {{-- TTD GAMBAR --}}
            @if(!empty($principalSignature))
            <img src="{{ $principalSignature }}" alt="TTD Kepala Sekolah" class="sig-image">
            @endif
          </div>
          
          <div class="sig-name">{{ $principalName ?? 'Nama Kepala Sekolah, S.Pd.' }}</div>
          <div class="sig-nip">{{ $principalNip ?? 'NIP. -' }}</div>
        </td>

        {{-- Signature Right: Pengelola Aplikasi --}}
        <td>
          <div class="sig-title">{{ $managerTitle ?? 'Pengelola Aplikasi Tapamajuma' }}</div>
          <div class="sig-school">{{ $managerSchool ?? 'SMP N 1 Siborongborong' }}</div>
          
          <div class="sig-space">
            <div class="sig-line"></div>
            
            {{-- TTD GAMBAR SAJA --}}
            @if(!empty($managerSignature))
            <img src="{{ $managerSignature }}" alt="TTD Pengelola" class="sig-image">
            @endif
          </div>
          
          <div class="sig-name">{{ $managerName ?? 'Nama Pengelola, S.Pd., M.Pd.' }}</div>
          <div class="sig-nip">{{ $managerNip ?? 'NIP. -' }}</div>
        </td>
      </tr>
    </table>
  </div>

</div>

</body>
</html>