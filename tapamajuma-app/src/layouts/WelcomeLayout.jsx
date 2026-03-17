import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { IconBrandFacebook, IconLink } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { getStorageUrl } from '@/lib/utils';

export default function WelcomeLayout({ title, children, auth }) {
    const defaultTitle = 'TAPAMAJUMA - Monitoring Siswa SMP Negeri 1 Siborongborong';
    const pageTitle = title ? `${title} | TAPAMAJUMA` : defaultTitle;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        document.title = pageTitle;
    }, [pageTitle]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <Toaster position="top-center" richColors />

            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

                {/* ── HEADER ── */}
                <header className={`wl-header ${scrolled ? 'scrolled' : 'top'}`}>
                    <div className="wl-header-inner">

                        {/* Logo */}
                        <a href="#beranda" className="wl-logo-wrap">
                            <img
                                src={getStorageUrl("images/iconappp.webp")}
                                alt="Logo TAPAMAJUMA"
                                className="wl-logo-img"
                                loading="eager"
                            />
                            <span className="wl-logo-text">TAPAMAJUMA</span>
                        </a>

                        {/* Nav */}
                        <nav className="wl-nav">
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
                        <div>
                            {auth ? (
                                <Link to="/teacher" className="wl-btn-cta">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link to="/login" className="wl-btn-cta">
                                    Masuk
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                                    />
                                    <span className="wl-footer-logo-text">TAPAMAJUMA</span>
                                </div>
                                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', color: '#475569', lineHeight: 1.7, maxWidth: 300 }}>
                                    Sistem Pemantauan Aktivitas dan Perkembangan Belajar —{' '}
                                    Dibuat untuk SMP Negeri 1 Siborongborong.
                                </p>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginTop: '1.25rem' }}>
                                    <svg style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2, color: '#0891b2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.899a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6 }}>
                                        <div>Jl. Siliwangi No.2, Siborongborong</div>
                                        <div>Kab. Tapanuli Utara, Sumatera Utara</div>
                                    </div>
                                </div>
                            </div>

                            {/* Navigasi */}
                            <div>
                                <div className="wl-footer-heading">Navigasi</div>
                                {[
                                    { label: 'Beranda', href: '#beranda' },
                                    { label: 'Fitur',   href: '#fitur'   },
                                    { label: 'Tentang', href: '#tentang' },
                                    { label: 'Masuk',   href: '/login'   },
                                ].map((item) => (
                                    <a key={item.label} href={item.href} className="wl-footer-link">{item.label}</a>
                                ))}
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
                                    <a href="https://www.facebook.com/rujukan.rujukan.54" aria-label="Facebook Sekolah" className="wl-social-btn">
                                        <IconBrandFacebook size={18} />
                                    </a>
                                    <a href="https://smpn1siborongborong.sch.id" aria-label="Website Sekolah" className="wl-social-btn">
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