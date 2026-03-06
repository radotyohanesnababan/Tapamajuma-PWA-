/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WelcomeLayout from '@/layouts/WelcomeLayout';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Sparkles, Activity, BookOpen, BrainCircuit, Target, Users, CheckCircle2, Download, ArrowRight } from 'lucide-react';
import { getStorageUrl } from '@/lib/utils';
import { Helmet } from 'react-helmet-async';
import './welcome.css';

export default function Welcome() {
    const [auth, setAuth] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        try {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') setIsInstallable(false);
            setDeferredPrompt(null);
        } catch (error) {
            console.error('Gagal memicu instalasi PWA:', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) setAuth(true);
        setTimeout(() => setIsMounted(true), 100);
    }, []);

    const slides = ['images/hero1.webp', 'images/hero2.webp', 'images/hero3.webp'];

    const features = [
        { id: 1, name: "Literasi Digital",  icon: BookOpen,     desc: "Tingkatkan kemampuan baca & interpretasi teks" },
        { id: 2, name: "Numerasi Aktif",     icon: Activity,     desc: "Latihan soal angka & logika terstruktur" },
        { id: 3, name: "TKA (HOTS)",         icon: BrainCircuit, desc: "Soal berpikir tingkat tinggi & kritis" },
        { id: 4, name: "Sesi Mandiri",       icon: Target,       desc: "Belajar mandiri sesuai kecepatan siswa" },
        { id: 5, name: "Refleksi Jurnal",    icon: Sparkles,     desc: "Catat refleksi & perkembangan harian" },
        { id: 6, name: "Pantau Orang Tua",  icon: Users,        desc: "Orang tua pantau kemajuan anak langsung" },
    ];

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = 'https://placehold.co/800x700/f1f5f9/94a3b8?text=Gambar+Tidak+Tersedia';
    };

    return (
        <>
            <Helmet>
                <title>TAPAMAJUMA | Platform Monitoring Siswa</title>
                <meta name="description" content="Pantau aktivitas belajar, literasi, dan numerasi siswa secara real-time." />
                <meta property="og:type"        content="website" />
                <meta property="og:url"         content="https://tapamajuma.my.id/" />
                <meta property="og:title"       content="TAPAMAJUMA - Monitoring Belajar Terintegrasi" />
                <meta property="og:description" content="Pantau aktivitas belajar, literasi, dan numerasi siswa secara real-time." />
                <meta property="og:image"       content="https://cdn.tapamajuma-api.my.id/images/iconappp.webp" />
            </Helmet>

            <WelcomeLayout title="Beranda" auth={auth}>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh' }}>

                    {/* ════════════════════════════════
                        HERO SECTION
                    ════════════════════════════════ */}
                    <section
                        id="beranda"
                        className="mesh-bg"
                        style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingTop: '7rem',
                            paddingBottom: '8rem',
                            overflow: 'hidden',
                            minHeight: '100vh',
                        }}
                    >
                        <div className="orb orb-1" />
                        <div className="orb orb-2" />
                        <div className="orb orb-3" />
                        <div className="dot-grid" />

                        {[...Array(7)].map((_, i) => (
                            <div key={i} className="particle" style={{
                                left: `${8 + i * 13}%`,
                                bottom: 0,
                                width:  `${4 + (i % 3) * 2}px`,
                                height: `${4 + (i % 3) * 2}px`,
                                animationDuration: `${9 + i * 2}s`,
                                animationDelay:    `${i * 1.8}s`,
                            }} />
                        ))}

                        <div style={{
                            maxWidth: 1200,
                            width: '100%',
                            margin: '0 auto',
                            padding: '0 1.5rem',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '3.5rem',
                            alignItems: 'center',
                            position: 'relative',
                            zIndex: 10,
                        }}>
                            {/* Text */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                                <div className={`fade-up ${isMounted ? 'visible' : ''}`} style={{ transitionDelay: '100ms' }}>
                                    <span className="section-badge">
                                        <span className="badge-dot" />
                                        Platform Monitoring Belajar
                                    </span>
                                </div>

                                <div className={`fade-up ${isMounted ? 'visible' : ''}`} style={{ transitionDelay: '200ms' }}>
                                    <h1 className="font-display" style={{
                                        fontSize: 'clamp(2.2rem, 5vw, 3.75rem)',
                                        fontWeight: 800,
                                        lineHeight: 1.1,
                                        letterSpacing: '-0.03em',
                                        color: '#0f172a',
                                        margin: 0,
                                    }}>
                                        Bersama Membangun{' '}
                                        <span style={{
                                            background: 'linear-gradient(135deg, #0891b2 0%, #6366f1 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}>
                                            Generasi Maju
                                        </span>
                                    </h1>
                                </div>

                                <div className={`fade-up ${isMounted ? 'visible' : ''}`} style={{ transitionDelay: '300ms' }}>
                                    <p className="font-body" style={{
                                        fontSize: '1.05rem',
                                        lineHeight: 1.75,
                                        color: '#475569',
                                        margin: 0,
                                        maxWidth: 480,
                                    }}>
                                        TAPAMAJUMA memantau aktivitas belajar, literasi, numerasi, dan perkembangan siswa secara terintegrasi antara guru, siswa, dan orang tua.
                                    </p>
                                </div>

                                <div className={`fade-up ${isMounted ? 'visible' : ''}`} style={{ transitionDelay: '380ms' }}>
                                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                        <span className="stat-pill">✦ Literasi &amp; Numerasi</span>
                                        <span className="stat-pill">✦ Real-time</span>
                                        <span className="stat-pill">✦ Notif WhatsApp</span>
                                    </div>
                                </div>

                                <div className={`fade-up ${isMounted ? 'visible' : ''}`} style={{ transitionDelay: '480ms' }}>
                                    <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                        <Link to="/login" className="btn-primary">
                                            Mulai Sekarang <ArrowRight size={15} />
                                        </Link>
                                        {isInstallable && (
                                            <button onClick={handleInstallClick} className="btn-ghost">
                                                <Download size={15} /> Install Aplikasi
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Image */}
                            <div
                                className={`fade-scale ${isMounted ? 'visible' : ''}`}
                                style={{ transitionDelay: '300ms', display: 'flex', justifyContent: 'center', position: 'relative', overflow: 'visible' }}
                            >
                                <div className="hero-img-glow" />
                                <div className="hero-img-frame">
                                    <img
                                        src={getStorageUrl("images/iconappp.webp")}
                                        alt="Logo TAPAMAJUMA"
                                        onError={handleImageError}
                                        width="480" height="480"
                                        style={{ width: '100%', maxWidth: 420, borderRadius: '2.2rem', display: 'block' }}
                                    />
                                </div>

                                {/* Floating badge 1 */}
                                <div className="floating-badge glass-white" style={{ top: '8%', left: '-5%', animation: 'floatOrb 5s ease-in-out infinite' }}>
                                    <div className="floating-badge-icon" style={{ background: 'linear-gradient(135deg,#0891b2,#0369a1)' }}>
                                        <BookOpen size={16} color="white" />
                                    </div>
                                    <div>
                                        <div className="floating-badge-title">Literasi Digital</div>
                                        <div className="floating-badge-sub">Aktif hari ini</div>
                                    </div>
                                </div>

                                {/* Floating badge 2 */}
                                <div className="floating-badge glass-white" style={{ bottom: '10%', right: '-5%', animation: 'floatOrb 7s ease-in-out infinite reverse' }}>
                                    <div className="floating-badge-icon" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                                        <Users size={16} color="white" />
                                    </div>
                                    <div>
                                        <div className="floating-badge-title">Orang Tua Terhubung</div>
                                        <div className="floating-badge-sub">Pantau real-time</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scroll indicator */}
                        <div className="scroll-indicator">
                            <span className="scroll-label">SCROLL</span>
                            <div className="scroll-dot" />
                        </div>
                    </section>

                    {/* ════════════════════════════════
                        FITUR SECTION
                    ════════════════════════════════ */}
                    <section id="fitur" className="mesh-bg-2" style={{ padding: '6rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
                        <div className="shimmer-line" style={{ top: 0 }} />

                        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                                <span className="section-badge" style={{ display: 'inline-flex' }}>Fitur Utama</span>
                                <h2 className="font-display" style={{
                                    fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                                    fontWeight: 800,
                                    color: '#0f172a',
                                    letterSpacing: '-0.03em',
                                    margin: '1rem 0 0.75rem',
                                }}>
                                    Fokus Pengembangan Siswa
                                </h2>
                                <p className="font-body" style={{ color: '#64748b', fontSize: '1rem', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
                                    Sistem berfokus pada pilar pendidikan modern untuk evaluasi komprehensif setiap siswa.
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
                                {features.map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.id} className="glass-card" style={{ borderRadius: '1.75rem', padding: '1.75rem 1.4rem', transitionDelay: `${index * 70}ms` }}>
                                            <div className="icon-wrap">
                                                <Icon size={24} style={{ color: '#0369a1' }} />
                                            </div>
                                            <h3 className="font-display" style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.45rem' }}>
                                                {item.name}
                                            </h3>
                                            <p className="font-body" style={{ fontSize: '0.81rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                                                {item.desc}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* ════════════════════════════════
                        TENTANG SECTION
                    ════════════════════════════════ */}
                    <section id="tentang" className="mesh-bg" style={{ padding: '6rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
                        <div className="orb" style={{ width: 380, height: 380, background: 'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)', top: '10%', right: '-80px' }} />

                        <div style={{
                            maxWidth: 1200, margin: '0 auto',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '4rem',
                            alignItems: 'center',
                            position: 'relative',
                            zIndex: 1,
                        }}>
                            {/* Swiper */}
                            <div style={{
                                borderRadius: '2.5rem',
                                overflow: 'hidden',
                                boxShadow: '0 32px 80px rgba(14,165,233,0.16), 0 0 0 8px rgba(255,255,255,0.85)',
                                border: '1px solid rgba(14,165,233,0.15)',
                            }}>
                                <Swiper
                                    modules={[Autoplay, Pagination, Navigation, EffectFade]}
                                    effect="fade"
                                    centeredSlides={true}
                                    autoplay={{ delay: 3500, disableOnInteraction: false }}
                                    pagination={{ clickable: true }}
                                    loop={true}
                                    style={{ height: '420px' }}
                                >
                                    {slides.map((src, index) => (
                                        <SwiperSlide key={index}>
                                            <img
                                                src={getStorageUrl(src)}
                                                alt={`Aktivitas belajar ${index + 1}`}
                                                onError={handleImageError}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                loading={index === 0 ? 'eager' : 'lazy'}
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>

                            {/* Text */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
                                <div>
                                    <span className="section-badge" style={{ display: 'inline-flex' }}>Tentang Kami</span>
                                    <h2 className="font-display" style={{
                                        fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                                        fontWeight: 800,
                                        color: '#0f172a',
                                        letterSpacing: '-0.03em',
                                        marginTop: '1rem',
                                        lineHeight: 1.2,
                                    }}>
                                        Membangun Ekosistem<br />Pendidikan Digital
                                    </h2>
                                </div>

                                <p className="font-body" style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.8, margin: 0 }}>
                                    TAPAMAJUMA dirancang untuk menjembatani komunikasi data antara sekolah dan orang tua. Setiap perkembangan akademik dan karakter siswa terekam secara transparan.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    <div className="about-item">
                                        <div className="about-icon-wrap" style={{ background: 'linear-gradient(135deg,rgba(14,165,233,0.14),rgba(8,145,178,0.08))', border: '1px solid rgba(14,165,233,0.22)' }}>
                                            <CheckCircle2 size={20} style={{ color: '#0369a1' }} />
                                        </div>
                                        <div>
                                            <h4 className="font-display" style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem', margin: '0 0 0.2rem' }}>Pelaporan Real-time</h4>
                                            <p className="font-body" style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                                                Data aktivitas dan nilai langsung dapat diakses kapan saja oleh pihak berkepentingan.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="about-item">
                                        <div className="about-icon-wrap" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.14),rgba(79,70,229,0.08))', border: '1px solid rgba(99,102,241,0.22)' }}>
                                            <CheckCircle2 size={20} style={{ color: '#4f46e5' }} />
                                        </div>
                                        <div>
                                            <h4 className="font-display" style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem', margin: '0 0 0.2rem' }}>Notifikasi WhatsApp</h4>
                                            <p className="font-body" style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                                                Orang tua menerima pembaruan mingguan otomatis terkait rekam jejak anak.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </WelcomeLayout>
        </>
    );
}