import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Toaster } from '@/components/ui/sonner';
import { IconBrandFacebook, IconLink } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { getStorageUrl } from '@/lib/utils';

export default function WelcomeLayout({ title, children, auth }) {
    const defaultTitle = 'TAPAMAJUMA - Monitoring Siswa SMP Negeri 1 Siborongborong';
    const pageTitle = title ? `${title} | TAPAMAJUMA` : defaultTitle;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <Helmet>
                {/* Primary Meta Tags */}
                <title>{pageTitle}</title>
                <meta name="title" content="TAPAMAJUMA - Sistem Monitoring Siswa SMP Negeri 1 Siborongborong" />
                <meta name="description" content="Platform digital pemantauan aktivitas dan perkembangan belajar siswa SMP Negeri 1 Siborongborong. Sistem poin XP, monitoring real-time, dan laporan komprehensif untuk orang tua dan guru." />
                <meta name="keywords" content="monitoring siswa, SMP Negeri 1 Siborongborong, sistem sekolah digital, pemantauan siswa, Tapanuli Utara, sistem poin siswa, rapor digital" />
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://tapamajuma.smpn1siborongborong.sch.id/" />
                <meta property="og:title" content="TAPAMAJUMA - Monitoring Siswa SMP Negeri 1 Siborongborong" />
                <meta property="og:description" content="Platform digital pemantauan aktivitas dan perkembangan belajar siswa dengan sistem poin XP dan laporan real-time untuk orang tua dan guru." />
                <meta property="og:image" content=" https://cdn.tapamajuma-api.my.id/images/iconappp.png" />
                <meta property="og:locale" content="id_ID" />
                <meta property="og:site_name" content="TAPAMAJUMA" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content="https://tapamajuma.smpn1siborongborong.sch.id/" />
                <meta name="twitter:title" content="TAPAMAJUMA - Monitoring Siswa SMP Negeri 1 Siborongborong" />
                <meta name="twitter:description" content="Platform digital pemantauan aktivitas dan perkembangan belajar siswa dengan sistem poin XP dan laporan real-time." />
                <meta name="twitter:image" content=" https://cdn.tapamajuma-api.my.id/images/iconappp.png" />

                {/* Canonical */}
                <link rel="canonical" href="https://tapamajuma.smpn1siborongborong.sch.id/" />

                {/* Additional Meta */}
                <meta name="author" content="SMP Negeri 1 Siborongborong" />
                <meta name="robots" content="index, follow" />
                <meta name="googlebot" content="index, follow" />
                <meta name="geo.region" content="ID-SU" />
                <meta name="geo.placename" content="Tapanuli Utara" />

                {/* Schema.org JSON-LD - Organization */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "EducationalOrganization",
                        "name": "SMP Negeri 1 Siborongborong",
                        "alternateName": "SMPN 1 Siborongborong",
                        "url": "https://tapamajuma.smpn1siborongborong.sch.id",
                        "logo": " https://cdn.tapamajuma-api.my.id/images/iconappp.png",
                        "description": "Sistem Pemantauan Aktivitas dan Perkembangan Belajar Siswa SMP Negeri 1 Siborongborong",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "Jl. Siliwangi No.2, Siborongborong",
                            "addressLocality": "Tapanuli Utara",
                            "addressRegion": "Sumatera Utara",
                            "postalCode": "22452",
                            "addressCountry": "ID"
                        },
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "email": "smpn1siborongborong.taput@gmail.com",
                            "contactType": "customer service",
                            "availableLanguage": ["Indonesian"]
                        },
                        "sameAs": [
                            "https://www.facebook.com/rujukan.rujukan.54",
                            "https://smpn1siborongborong.sch.id"
                        ]
                    })}
                </script>

                {/* Schema.org JSON-LD - WebApplication */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "TAPAMAJUMA",
                        "applicationCategory": "EducationalApplication",
                        "operatingSystem": "Web",
                        "description": "Platform digital pemantauan aktivitas dan perkembangan belajar siswa dengan sistem poin XP",
                        "url": "https://tapamajuma.smpn1siborongborong.sch.id",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "IDR"
                        },
                        "featureList": [
                            "Monitoring aktivitas siswa real-time",
                            "Sistem poin XP dan level",
                            "Laporan perkembangan siswa",
                            "Dashboard untuk guru dan orang tua",
                            "Notifikasi aktivitas siswa"
                        ],
                        "browserRequirements": "Requires JavaScript. Requires HTML5.",
                        "softwareVersion": "1.0"
                    })}
                </script>

                {/* Schema.org JSON-LD - BreadcrumbList */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Beranda",
                                "item": "https://tapamajuma.smpn1siborongborong.sch.id/"
                            }
                        ]
                    })}
                </script>
            </Helmet>

            <Toaster position="top-center" richColors />

            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

                {/* ── HEADER ── */}
                <header className={`wl-header ${scrolled ? 'scrolled' : 'top'}`}>
                    <div className="wl-header-inner">

                        {/* Logo */}
                        <a href="#beranda" className="wl-logo-wrap" aria-label="TAPAMAJUMA - Kembali ke Beranda">
                            <img
                                src={getStorageUrl("images/iconappp.webp")}
                                alt="Logo TAPAMAJUMA - Sistem Monitoring Siswa SMP Negeri 1 Siborongborong"
                                className="wl-logo-img"
                                loading="eager"
                                width="40"
                                height="40"
                            />
                            <span className="wl-logo-text">TAPAMAJUMA</span>
                        </a>

                        {/* Nav */}
                        <nav className="wl-nav" aria-label="Navigasi Utama">
                            {[
                                { label: 'Beranda', href: '#beranda' },
                                { label: 'Fitur',   href: '#fitur'   },
                                { label: 'Tentang', href: '#tentang' },
                            ].map((item) => (
                                <a key={item.label} href={item.href} className="wl-nav-link">
                                    {item.label}
                                </a>
                            ))}
                        </nav>

                        {/* Auth Button */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Tombol Khusus Buka SEB (Deep Link) */}
                                                    <button 
                                onClick={() => {
                                    // Ambil domain frontend Vercel (bukan ambil dari .env API)
                                    const frontendHost = window.location.host; 
                                    
                                    // Gabungkan dengan path file .seb
                                    const alamatBersih = `${frontendHost}/configs/EXAMSMP1SBB_V1.seb`;
                                    
                                    // Pengecekan protocol
                                    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                                    const protocol = isLocal ? "seb://" : "sebs://";
                                    
                                    // Eksekusi!
                                    window.location.href = `${protocol}${alamatBersih}`;
                                }}
                                className="wl-btn-cta bg-emerald-700 hover:bg-emerald-800 border-none text-white flex items-center gap-2"
                                aria-label="Buka Ujian dengan SEB"
                            >
                                Buka Ruang Ujian (SEB)
                            </button>

                            {/* Tombol Auth Standar (Login/Dashboard) */}
                            {auth ? (
                                <Link to="/teacher" className="wl-btn-cta" aria-label="Buka Dashboard">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link to="/login" className="wl-btn-cta" aria-label="Masuk ke Akun">
                                    Masuk
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            )}
                        </div>
                        
                    </div>
                </header>

                {/* ── MAIN ── */}
                <main style={{ flex: 1 }}>{children}</main>

                {/* ── FOOTER ── */}
                <footer className="wl-footer">
                    <div className="wl-footer-inner">
                        <div className="wl-footer-grid">

                            {/* Brand */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <img
                                        src={getStorageUrl("images/iconappp.webp")}
                                        alt="Logo TAPAMAJUMA"
                                        style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'contain', border: '1.5px solid rgba(14,165,233,0.22)' }}
                                        loading="lazy"
                                        width="34"
                                        height="34"
                                    />
                                    <span className="wl-footer-logo-text">TAPAMAJUMA</span>
                                </div>
                                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: '#475569', lineHeight: 1.7, maxWidth: 300 }}>
                                    Sistem Pemantauan Aktivitas dan Perkembangan Belajar —{' '}
                                    Dibuat untuk SMP Negeri 1 Siborongborong.
                                </p>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginTop: '1.25rem' }}>
                                    <svg style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2, color: '#0891b2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.899a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <address style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6, fontStyle: 'normal' }}>
                                        <div>Jl. Siliwangi No.2, Siborongborong</div>
                                        <div>Kab. Tapanuli Utara, Sumatera Utara</div>
                                    </address>
                                </div>
                            </div>

                            {/* Navigasi */}
                            <div>
                                <div className="wl-footer-heading">Navigasi</div>
                                <nav aria-label="Navigasi Footer">
                                    {[
                                        { label: 'Beranda', href: '#beranda' },
                                        { label: 'Fitur',   href: '#fitur'   },
                                        { label: 'Tentang', href: '#tentang' },
                                        { label: 'Masuk',   href: '/login'   },
                                    ].map((item) => (
                                        <a key={item.label} href={item.href} className="wl-footer-link">{item.label}</a>
                                    ))}
                                </nav>
                            </div>

                            {/* Kontak & Sosmed */}
                            <div>
                                <div className="wl-footer-heading">Hubungi Kami</div>
                                <a
                                    href="mailto:smpn1siborongborong.taput@gmail.com"
                                    className="wl-footer-email"
                                    aria-label="Kirim Email ke SMPN 1 Siborongborong"
                                >
                                    smpn1siborongborong.taput<br />@gmail.com
                                </a>

                                <div className="wl-footer-heading" style={{ marginTop: '1.75rem' }}>Sosial Media</div>
                                <div style={{ display: 'flex', gap: '0.6rem' }}>
                                    <a 
                                        href="https://www.facebook.com/rujukan.rujukan.54" 
                                        aria-label="Facebook SMP Negeri 1 Siborongborong"
                                        className="wl-social-btn"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <IconBrandFacebook size={18} />
                                    </a>
                                    <a 
                                        href="https://smpn1siborongborong.sch.id" 
                                        aria-label="Website Resmi SMP Negeri 1 Siborongborong"
                                        className="wl-social-btn"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <IconLink size={18} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="wl-footer-bottom">
                        © {new Date().getFullYear()} TAPAMAJUMA — For SMP Negeri 1 Siborongborong. All rights reserved.
                    </div>
                </footer>
            </div>
        </>
    );
}