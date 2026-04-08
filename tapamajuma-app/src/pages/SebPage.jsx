import React, { useState, useEffect } from 'react';
import {
    Shield, Monitor, Apple, Key, Download,
    CheckCircle2, AlertTriangle, Wifi, Battery, Clock,
    XCircle, HelpCircle, Info,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
  .seb-page { font-family: 'Plus Jakarta Sans', sans-serif; }

  .seb-fade-up { opacity:0; transform:translateY(24px); transition:opacity 0.5s ease,transform 0.5s ease; }
  .seb-fade-up.visible { opacity:1; transform:translateY(0); }

  @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
  @keyframes orbFloat  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
  @keyframes particleRise { 0%{transform:translateY(0) scale(1);opacity:0.6} 100%{transform:translateY(-100px) scale(0);opacity:0} }

  .seb-orb      { position:absolute;border-radius:50%;pointer-events:none;animation:orbFloat 12s ease-in-out infinite; }
  .seb-particle { position:absolute;border-radius:50%;background:rgba(8,145,178,0.3);animation:particleRise linear infinite; }
  .seb-pulse    { animation:pulseDot 2s ease-in-out infinite; }

  .seb-nav {
    position:fixed;top:0;left:0;right:0;z-index:100;height:64px;padding:0 1.5rem;
    display:flex;align-items:center;justify-content:space-between;
    backdrop-filter:blur(16px);background:rgba(255,255,255,0.85);
    border-bottom:1px solid rgba(8,145,178,0.12);box-shadow:0 2px 16px rgba(8,145,178,0.06);
  }
  .seb-hero-bg {
    background-color:#f8fafc;
    background-image:radial-gradient(at 20% 10%,rgba(8,145,178,0.08) 0px,transparent 55%),
                     radial-gradient(at 80% 5%,rgba(99,102,241,0.07) 0px,transparent 50%);
  }
  .seb-section-alt {
    background-color:#f0f9ff;
    background-image:radial-gradient(at 10% 50%,rgba(8,145,178,0.07) 0px,transparent 55%),
                     radial-gradient(at 90% 50%,rgba(99,102,241,0.06) 0px,transparent 50%);
  }
  .seb-dl-btn {
    display:inline-flex;align-items:center;gap:0.5rem;width:100%;justify-content:center;
    background:linear-gradient(135deg,#0891b2,#6366f1);color:#fff;
    font-weight:700;font-size:0.85rem;padding:0.6rem 1rem;border-radius:0.75rem;
    border:none;cursor:pointer;text-decoration:none;
    transition:box-shadow 0.2s,transform 0.2s;font-family:'Plus Jakarta Sans',sans-serif;
  }
  .seb-dl-btn:hover  { box-shadow:0 8px 24px rgba(8,145,178,0.35);transform:translateY(-2px); }
  .seb-cfg-btn {
    display:inline-flex;align-items:center;gap:0.5rem;width:100%;justify-content:center;
    background:linear-gradient(135deg,#f59e0b,#f97316);color:#fff;
    font-weight:700;font-size:0.85rem;padding:0.6rem 1rem;border-radius:0.75rem;
    border:none;cursor:pointer;text-decoration:none;
    transition:box-shadow 0.2s,transform 0.2s;font-family:'Plus Jakarta Sans',sans-serif;
  }
  .seb-cfg-btn:hover { box-shadow:0 8px 24px rgba(245,158,11,0.35);transform:translateY(-2px); }

  .seb-step-num {
    width:2rem;height:2rem;border-radius:50%;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,#0891b2,#6366f1);
    color:#fff;font-weight:800;font-size:0.85rem;
  }
  .seb-badge-pill {
    display:inline-flex;align-items:center;gap:0.4rem;
    background:rgba(8,145,178,0.08);border:1px solid rgba(8,145,178,0.2);
    border-radius:99px;padding:0.25rem 0.8rem;
    font-size:0.75rem;font-weight:600;color:#0369a1;
  }
  .seb-badge-dot { width:6px;height:6px;border-radius:50%;background:#0891b2; }
  .seb-grad-text {
    background:linear-gradient(135deg,#0891b2,#6366f1);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  }
`;

/* ── Data ─────────────────────────────────────────────────────────────────── */
const downloads = [
    { os: 'Windows', version: 'SEB 3.10.1', icon: Monitor, url: 'https://twds.dl.sourceforge.net/project/seb/seb/SEB_3.10.1/SEB_3.10.1.864_SetupBundle.exe?viasf=1' },
    { os: 'macOS',   version: 'SEB 3.6.1', icon: Apple,   url: 'https://twds.dl.sourceforge.net/project/seb/seb-macosx/seb_macos_3.6.1/SafeExamBrowser-3.6.1.dmg?viasf=1' },
];

const steps = [
    {
        n: 1, title: 'Unduh & Instal',
        points: ['Klik tombol download sesuai OS laptop Anda.', 'Buka file installer (.exe atau .dmg) dan ikuti instruksi hingga selesai.'],
    },
    {
        n: 2, title: 'Buat Password (Untuk Siswa dengan Login Google dan Belum Mengatur Password Manual)',
        points: ['Login ke Dashboard Siswa via Google di browser biasa.', 'Tampil modal "Akun Terkunci" → isi NISN valid dan buat password manual.', 'Google Login TIDAK AKTIF di dalam SEB — gunakan password manual.'],
    },
];

const prohibitions = [
    { label: 'Matikan Aplikasi Background', desc: 'Tutup Zoom, Discord, TeamViewer, atau app screen-sharing sebelum membuka SEB.' },
    { label: 'Jangan Gunakan VPN', desc: 'Nonaktifkan VPN untuk memastikan koneksi lancar ke server ujian.' },
    { label: 'Hindari Multi-Login', desc: 'Pastikan hanya satu sesi SEB yang aktif di laptop Anda.' },
    { label: 'Jangan Gunakan Perangkat Mobile', desc: 'Ujian hanya dapat diakses melalui laptop/PC dengan SEB terinstal.' },];

const readiness = [
    { icon: Battery, label: 'Baterai Penuh',  desc: 'Pastikan laptop terhubung ke charger atau baterai penuh.' },
    { icon: Wifi,    label: 'Koneksi Stabil', desc: 'Gunakan Wi-Fi stabil atau tethering dengan kuota cukup.' },
    { icon: Clock,   label: 'Cek Waktu',      desc: 'Atur jam otomatis (sinkron internet) agar tidak ada kegagalan koneksi.' },
];



const faqs = [
    { q: 'Kenapa muncul pesan "You are not allowed to use this version"?', a: 'Artinya Anda menggunakan versi SEB yang terlalu lama atau terlalu baru dari yang ditentukan sekolah. Gunakan link download resmi di halaman ini.' },
    { q: 'Saya lupa password ujian, bagaimana?', a: 'Login ke Dashboard via Google di browser biasa (Chrome/Edge), buka modal gembok, dan reset password. Gunakan password baru saat masuk melalui SEB. Atau Hubungi admin.' },
    { q: 'Bolehkah ujian menggunakan HP atau tablet?', a: 'Tidak. Ujian hanya di laptop/PC dengan SEB terinstal. Perangkat mobile tidak mendukung mode kunci layar penuh SEB.' },
];

/* ─────────────────────────────────────────────────────────────────────────── */
export default function SebPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

    return (
        <>
            <style>{globalStyle}</style>
            <div className="seb-page w-full min-h-screen">

                {/* ── NAV ── */}
                <nav className="seb-nav">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg,#0891b2,#6366f1)' }}>
                            <Shield size={16} color="white" />
                        </div>
                        <span className="font-extrabold text-slate-900 text-sm tracking-tight">TAPAMAJUMA CBT</span>
                        <span className="text-slate-300 mx-1">|</span>
                        <span className="text-slate-500 text-xs font-semibold">Powered by Safe Exam Browser</span>
                    </div>
                    
                </nav>

                {/* ── HERO ── */}
                <section className="seb-hero-bg relative overflow-hidden flex items-center justify-center" style={{ paddingTop: '8.5rem', paddingBottom: '5rem', minHeight: '55vh' }}>
                    <div className="seb-orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle,rgba(8,145,178,0.11) 0%,transparent 70%)', top: '-80px', left: '-100px' }} />
                    <div className="seb-orb" style={{ width: 320, height: 320, background: 'radial-gradient(circle,rgba(99,102,241,0.09) 0%,transparent 70%)', top: '5%', right: '-60px', animationDelay: '-5s' }} />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="seb-particle" style={{ left: `${12 + i * 17}%`, bottom: 0, width: `${4+(i%3)*2}px`, height: `${4+(i%3)*2}px`, animationDuration: `${8+i*2}s`, animationDelay: `${i*1.4}s` }} />
                    ))}

                    <div className="relative z-10 text-center flex flex-col items-center gap-5 px-6 mb-25 w-full" style={{ maxWidth: 780 }}>
                        
                        <div className={`seb-fade-up ${mounted ? 'visible' : ''}`} style={{ transitionDelay: '180ms' }}>
                            <h1 className="font-extrabold tracking-tight text-slate-900" style={{ fontSize: 'clamp(2rem,5vw,3.25rem)', lineHeight: 1.1 }}>
                            <span className="seb-grad-text">CBT </span><span className="text-red-900">TAPAMAJUMA</span>
                            </h1>
                        </div>
                        <div className={`seb-fade-up ${mounted ? 'visible' : ''}`} style={{ transitionDelay: '260ms' }}>
                            <p className="text-slate-500 leading-relaxed" style={{ fontSize: '1.05rem', maxWidth: 560 }}>
                                Pastikan perangkat Anda siap sebelum waktu ujian dimulai.{' '}
                                
                            </p>
                        </div>
                        <div className={`seb-fade-up ${mounted ? 'visible' : ''}`} style={{ transitionDelay: '340ms', width: '100%', maxWidth: 520 }}>
                            <Alert className="border-red-200 bg-red-50 text-left">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800 text-sm font-medium">
                                    Baca seluruh panduan sebelum mengunduh. Kesalahan instalasi dapat mengakibatkan gagal masuk ujian.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </div>
                </section>

                {/* ── DOWNLOAD ── */}
                <section className="seb-section-alt py-20 px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-10">
                            <span className="seb-badge-pill">Link Download Resmi</span>
                            <h2 className="font-extrabold text-slate-900 tracking-tight mt-3 mb-2" style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)' }}>Unduh Aplikasi SEB</h2>
                            <p className="text-slate-500 text-sm leading-relaxed">Pilih versi sesuai sistem operasi. Gunakan versi yang tertera.</p>
                        </div>

                        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
                            {downloads.map((d) => {
                                const Icon = d.icon;
                                return (
                                    <Card key={d.os} className="shadow-sm hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0" style={{ background: 'linear-gradient(135deg,#0891b2,#6366f1)' }}>
                                                    <Icon size={24} color="white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">{d.os}</CardTitle>
                                                    <p className="text-xs text-slate-500 mt-0.5">{d.version}</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <a href={d.url} target="_blank" rel="noopener noreferrer" className="seb-dl-btn">
                                                <Download size={14} /> Download for {d.os}
                                            </a>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── STEPS ── */}
                <section className="seb-hero-bg py-20 px-6">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-10">
                            <span className="seb-badge-pill">Panduan Instalasi</span>
                            <h2 className="font-extrabold text-slate-900 tracking-tight mt-3 mb-2" style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)' }}>Langkah-Langkah Instalasi</h2>
                            <p className="text-slate-500 text-sm leading-relaxed">Ikuti tiga langkah berikut secara berurutan sebelum hari ujian.</p>
                        </div>
                        <div className="flex flex-col gap-4">
                            {steps.map((step, i) => (
                                <Card key={step.n} className={`shadow-sm seb-fade-up ${mounted ? 'visible' : ''}`} style={{ transitionDelay: `${i * 100}ms` }}>
                                    <CardContent className="pt-5 pb-5">
                                        <div className="flex items-start gap-4">
                                            <div className="seb-step-num">{step.n}</div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900 text-sm mb-3">Langkah {step.n}: {step.title}</p>
                                                <ul className="flex flex-col gap-2">
                                                    {step.points.map((pt, pi) => (
                                                        <li key={pi} className="flex items-start gap-2 text-slate-500 text-sm leading-relaxed">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 flex-shrink-0 mt-2" />
                                                            {pt}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── RULES ── */}
                <section className="seb-section-alt py-20 px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-10">
                            <span className="seb-badge-pill">Aturan & Prosedur</span>
                            <h2 className="font-extrabold text-slate-900 tracking-tight mt-3 mb-2" style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)' }}>Sebelum Masuk SEB</h2>
                            <p className="text-slate-500 text-sm leading-relaxed">Pelanggaran terhadap aturan berikut akan menyebabkan sistem mengunci perangkat Anda.</p>
                        </div>
                        <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
                            <Card className="shadow-sm border-red-200 bg-red-50/60">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-100">
                                            <XCircle size={18} className="text-red-600" />
                                        </div>
                                        <CardTitle className="text-red-800 text-sm">🚫 Larangan Keras</CardTitle>
                                        <Badge variant="destructive" className="ml-auto text-xs">Sistem Terkunci</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-3">
                                    <Separator className="bg-red-200" />
                                    {prohibitions.map((r, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 flex-shrink-0 mt-0.5">
                                                <XCircle size={13} className="text-red-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{r.label}</p>
                                                <p className="text-slate-500 text-xs leading-relaxed mt-0.5">{r.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-cyan-200 bg-cyan-50/60">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-100">
                                            <CheckCircle2 size={18} className="text-cyan-700" />
                                        </div>
                                        <CardTitle className="text-cyan-800 text-sm">✅ Kesiapan Teknis</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-3">
                                    <Separator className="bg-cyan-200" />
                                    {readiness.map((r, i) => {
                                        const Icon = r.icon;
                                        return (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100 flex-shrink-0 mt-0.5">
                                                    <Icon size={13} className="text-cyan-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{r.label}</p>
                                                    <p className="text-slate-500 text-xs leading-relaxed mt-0.5">{r.desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
                
 
                {/* ── CTA ── */}
                <section className="relative overflow-hidden flex items-center justify-center py-24 px-6" style={{
                    background: 'linear-gradient(135deg, #0c4a6e 0%, #1e1b4b 60%, #0f172a 100%)',
                }}>
                    {/* Decorative orbs */}
                    <div className="seb-orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle,rgba(8,145,178,0.2) 0%,transparent 65%)', top: '-120px', left: '-120px', animationDuration: '14s' }} />
                    <div className="seb-orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 65%)', bottom: '-100px', right: '-80px', animationDelay: '-6s' }} />
                    {/* Particles */}
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="seb-particle" style={{ left: `${8+i*13}%`, bottom: 0, width: `${3+(i%3)*2}px`, height: `${3+(i%3)*2}px`, animationDuration: `${7+i*1.8}s`, animationDelay: `${i*1.2}s`, background: 'rgba(99,202,235,0.45)' }} />
                    ))}
                    {/* Grid pattern overlay */}
                    <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
                        backgroundSize: '40px 40px',
                    }} />
 
                    <div className="relative z-10 text-center flex flex-col items-center gap-6" style={{ maxWidth: 620 }}>
                        {/* Badge */}
                        
 
                        {/* Heading */}
                        <div>
                            <h2 className="font-extrabold tracking-tight" style={{
                                fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.1, color: '#f1f5f9',
                            }}>
                                Sudah Siap{' '}
                                <span style={{
                                    background: 'linear-gradient(135deg,#22d3ee,#818cf8)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                }}>
                                    Ujian?
                                </span>
                            </h2>
                            <p className="text-slate-400 mt-3 leading-relaxed" style={{ fontSize: '0.95rem' }}>
                                Klik tombol di bawah untuk membuka Ruang Ujian melalui Safe Exam Browser.
                            </p>
                        </div>
 
                        {/* Checklist mini */}
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                            {['SEB Terinstal', 'Akun Siap', 'Password Manual Siap'].map((item) => (
                                <span key={item} className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold">
                                    <CheckCircle2 size={13} className="text-emerald-400" /> {item}
                                </span>
                            ))}
                        </div>
 
                        {/* CTA Button */}
                        <button
                            onClick={() => {
                                const frontendHost = window.location.host;
                                const alamatBersih = `${frontendHost}/configs/EXAMSMP1SBB_V1.seb`;
                                const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                                const protocol = isLocal ? 'seb://' : 'sebs://';
                                window.location.href = `${protocol}${alamatBersih}`;
                            }}
                            aria-label="Buka Ujian dengan SEB"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                                background: 'linear-gradient(135deg,#059669,#0891b2)',
                                color: '#fff', fontWeight: 800, fontSize: '1rem',
                                padding: '0.9rem 2.2rem', borderRadius: '1rem', border: 'none',
                                cursor: 'pointer', letterSpacing: '0.01em',
                                boxShadow: '0 0 0 0 rgba(5,150,105,0.5)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                animation: 'ctaPulseGlow 2.5s ease-in-out infinite',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(5,150,105,0.5)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                        >
                            <Shield size={18} />
                            Buka Ruang Ujian
                            <span style={{ fontSize: '1.1rem' }}>→</span>
                        </button>
 
                        <p className="text-slate-600 text-xs">
                            Browser biasa tidak akan bisa mengakses soal ujian.
                        </p>
                    </div>
 
                    <style>{`
                        @keyframes ctaPulseGlow {
                            0%,100% { box-shadow: 0 0 0 0 rgba(5,150,105,0.0), 0 8px 32px rgba(5,150,105,0.3); }
                            50%     { box-shadow: 0 0 0 10px rgba(5,150,105,0.0), 0 8px 48px rgba(5,150,105,0.55); }
                        }
                    `}</style>
                </section>

                {/* ── FAQ ── */}
                <section className="seb-hero-bg py-20 px-6">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-10">
                            <span className="seb-badge-pill">Tanya Jawab</span>
                            <h2 className="font-extrabold text-slate-900 tracking-tight mt-3 mb-2" style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)' }}>Pertanyaan Umum (FAQ)</h2>
                            <p className="text-slate-500 text-sm leading-relaxed">Jawaban atas pertanyaan yang paling sering diajukan siswa.</p>
                        </div>
                        <Accordion type="single" collapsible className="flex flex-col gap-3">
                            {faqs.map((faq, i) => (
                                <AccordionItem key={i} value={`faq-${i}`} className="border border-slate-200 rounded-xl bg-white shadow-sm px-1 overflow-hidden">
                                    <AccordionTrigger className="px-4 py-3 text-sm font-bold text-slate-800 hover:no-underline text-left">
                                        <span className="flex items-start gap-2">
                                            <HelpCircle size={16} className="text-cyan-600 flex-shrink-0 mt-0.5" />
                                            {faq.q}
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 text-sm text-slate-500 leading-relaxed" style={{ paddingLeft: '2.5rem' }}>
                                        {faq.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="bg-slate-900 py-10 px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: 'linear-gradient(135deg,#0891b2,#6366f1)' }}>
                            <Shield size={14} color="white" />
                        </div>
                        <span className="font-extrabold text-slate-100 text-sm">TAPAMAJUMA</span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">Platform Monitoring Belajar Terintegrasi · SMPN 1 Siborongborong</p>
                    <p className="text-slate-600 text-xs mt-1">Halaman ini hanya untuk keperluan persiapan ujian berbasis Safe Exam Browser.</p>
                </footer>

            </div>
        </>
    );
}