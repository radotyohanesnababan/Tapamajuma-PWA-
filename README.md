# 🏫 Website SMP N 1 Siborongborong

Website resmi SMP N 1 Siborongborong yang dibangun dengan **Next.js** dan **Sanity CMS**.

---

## 🛠 Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| [Next.js 15](https://nextjs.org) | Framework frontend (App Router) |
| [Sanity.io](https://sanity.io) | Headless CMS untuk manajemen konten |
| [Framer Motion](https://framer.motion.com) | Animasi page transition |
| [PortableText](https://portabletext.org) | Render rich text dari Sanity |
| [Tailwind CSS](https://tailwindcss.com) | Utility CSS |
| [Vercel](https://vercel.com) | Hosting & deployment |

---

## ✨ Fitur

- 📰 **Berita** — List & detail berita dengan featured headline
- 📢 **Pengumuman** — Pengumuman resmi dengan badge penting
- 🖼️ **Galeri** — Album foto kegiatan sekolah
- 👨‍🏫 **Data Guru** — Profil tenaga pengajar
- 🏛️ **Tentang Sekolah** — Profil, visi, misi, sejarah & sambutan kepala sekolah
- 🌙 **Dark Mode** — Toggle tema gelap/terang
- 📱 **Responsive** — Mobile-friendly dengan hamburger menu
- 🔍 **SEO** — Metadata & Open Graph per halaman
- 🗺️ **Sitemap** — Auto-generated sitemap
- 📤 **Share** — Bagikan berita ke WhatsApp & Twitter

---

## 🚀 Cara Menjalankan Lokal

### Prerequisites

Pastikan sudah terinstall:
- [Node.js](https://nodejs.org) v18+
- [Git](https://git-scm.com)

### 1. Clone Repository

```bash
git clone https://github.com/USERNAME/NAMA_REPO.git
cd NAMA_REPO
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token
```

Nilai-nilai ini bisa didapat dari [Sanity Manage](https://sanity.io/manage).

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka di browser:
- **Frontend:** http://localhost:3000
- **Sanity Studio (CMS):** http://localhost:3000/studio

---

## 📁 Struktur Project

```
├── app/
│   ├── page.tsx              # Homepage
│   ├── layout.tsx            # Root layout (Navbar, Footer)
│   ├── not-found.tsx         # Halaman 404
│   ├── sitemap.ts            # Sitemap otomatis
│   ├── berita/
│   │   ├── page.tsx          # List berita
│   │   ├── loading.tsx       # Skeleton loader
│   │   └── [slug]/
│   │       └── page.tsx      # Detail berita
│   ├── pengumuman/
│   │   ├── page.tsx          # List pengumuman
│   │   └── loading.tsx
│   ├── galeri/
│   │   └── page.tsx          # Galeri foto
│   ├── guru/
│   │   └── page.tsx          # Data guru
│   ├── tentang/
│   │   └── page.tsx          # Profil sekolah
│   └── studio/
│       └── [[...tool]]/
│           └── page.tsx      # Sanity Studio embed
├── components/
│   ├── Navbar.tsx            # Navigasi + hamburger mobile
│   ├── Footer.tsx            # Footer + Google Maps
│   ├── Breadcrumb.tsx        # Breadcrumb navigasi
│   ├── PageTransition.tsx    # Animasi antar halaman
│   ├── DarkModeToggle.tsx    # Toggle dark mode
│   ├── ShareButton.tsx       # Tombol share berita
│   ├── FeaturedImage.tsx     # Gambar dengan hover effect
│   ├── BeritaCard.tsx        # Card berita
│   ├── SkeletonCard.tsx      # Skeleton loader card
│   ├── SkeletonList.tsx      # Skeleton loader list
│   ├── ImageWithFallback.tsx # Gambar dengan fallback
│   └── ResponsiveStyle.tsx   # Global responsive styles
├── sanity/
│   ├── schemaTypes/
│   │   ├── index.ts          # Registrasi semua schema
│   │   ├── berita.ts         # Schema berita
│   │   ├── pengumuman.ts     # Schema pengumuman
│   │   ├── galeri.ts         # Schema galeri
│   │   ├── guru.ts           # Schema data guru
│   │   └── profilSekolah.ts  # Schema profil sekolah
│   ├── lib/
│   │   ├── client.ts         # Sanity client config
│   │   ├── queries.ts        # GROQ queries
│   │   └── image.ts          # Image URL builder
│   ├── sanity.config.ts      # Konfigurasi Sanity Studio
│   └── env.ts                # Environment variables
└── public/                   # Asset statis
```

---

## 📝 Manajemen Konten

Konten dikelola melalui **Sanity Studio** yang bisa diakses di:

- **Lokal:** http://localhost:3000/studio
- **Production:** https://your-domain.vercel.app/studio

### Schema Konten

| Schema | Keterangan |
|--------|-----------|
| `berita` | Judul, slug, thumbnail, tanggal, ringkasan, konten |
| `pengumuman` | Judul, tanggal, konten, flag penting |
| `galeri` | Judul album, tanggal, array foto + caption |
| `guru` | Nama, foto, jabatan, mata pelajaran, NIP |
| `profilSekolah` | Nama, logo, alamat, visi, misi, sejarah, sambutan kepala sekolah |

---

## 🌐 Deployment

Project ini di-deploy ke **Vercel** dan terhubung dengan **Sanity Cloud**.

### Deploy ke Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Atau connect langsung repo GitHub ke [Vercel Dashboard](https://vercel.com/dashboard).

### Environment Variables di Vercel

Tambahkan di **Settings → Environment Variables**:

```
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
SANITY_API_TOKEN
```

### CORS Sanity

Tambahkan URL production ke CORS Origins di [Sanity Manage](https://sanity.io/manage):

```
https://your-domain.vercel.app
```

---

## 📦 Scripts

```bash
npm run dev      # Jalankan development server
npm run build    # Build untuk production
npm run start    # Jalankan production server
npm run lint     # Jalankan ESLint
```

---

## 👥 Kontributor

Dikembangkan oleh **IT SMP N 1 Siborongborong**.

---

## 📄 Lisensi

© 2026 SMP N 1 Siborongborong. All rights reserved.
