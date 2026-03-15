# Facility Monitor

Aplikasi web untuk mencari dan menampilkan fasilitas umum di sekitar lokasi pengguna secara real-time menggunakan data OpenStreetMap. Dibangun dengan Next.js dan React Leaflet.

---

## Teknologi yang Digunakan

| Teknologi | Kegunaan |
|---|---|
| **Next.js 13** | Framework React dengan App Router |
| **React Leaflet** | Komponen peta interaktif |
| **Leaflet.js** | Library peta dasar |
| **Overpass API** | Query data fasilitas dari OpenStreetMap |
| **OpenStreetMap OAuth 2.0** | Autentikasi untuk edit data OSM |
| **Supabase** | Database PostgreSQL untuk data fasilitas custom |
| **Tailwind CSS** | Styling utility-first |
| **shadcn/ui** | Komponen UI (Button, Slider, Badge, dll) |
| **TypeScript** | Type safety |
| **ngrok** | Tunnel HTTPS untuk development OAuth |

---

## Fitur

### 🗺️ Peta Interaktif
- Menampilkan peta berbasis OpenStreetMap
- Mendeteksi lokasi pengguna secara otomatis (Geolocation API)
- Lingkaran radius pencarian divisualisasikan di peta
- Marker lokasi pengguna ditandai dengan warna biru

### 🔍 Pencarian Fasilitas
- Pencarian fasilitas berdasarkan kategori yang dipilih
- Radius pencarian dapat disesuaikan (1–20 km)
- Data diambil real-time dari Overpass API
- Mendukung pencarian `node` dan `way` (area/polygon) dari OSM
- Fallback otomatis ke 3 server Overpass jika salah satu gagal

### 📂 Kategori Fasilitas
| Kategori | Tag OSM |
|---|---|
| Police Stations | `amenity=police` |
| Hospitals | `amenity=hospital`, `amenity=clinic` |
| Stations | `railway=station`, `railway=halt` |
| Bus Terminals | `amenity=bus_station`, `highway=bus_stop` |
| Airports | `aeroway=aerodrome` |
| Gas Stations | `amenity=fuel` |
| Tourist Attractions | `tourism=attraction/museum/viewpoint` |
| Workshops | `shop=car_repair`, `amenity=vehicle_inspection` |
| Worship Places | `amenity=place_of_worship` |

### 📍 Popup Informasi Fasilitas
Setiap marker menampilkan informasi lengkap:
- Nama dan kategori fasilitas
- Alamat
- Nomor telepon (klik untuk langsung menelepon)
- Jam operasional
- Website
- Operator/pengelola
- Koordinat
- Tombol "Lihat di Maps" dan "Rute ke Sini" via Google Maps

### ✏️ Edit Data OSM
- Login dengan akun OpenStreetMap melalui OAuth 2.0
- Melengkapi data fasilitas yang belum lengkap di OSM langsung dari aplikasi
- Field yang bisa dilengkapi: telepon, jam buka, website, operator, alamat, email, Facebook, Instagram
- Perubahan langsung dikirim ke database OpenStreetMap global
- Tombol edit hanya muncul untuk data dari OSM (bukan data lokal)

### 📱 Responsive Design
- Tampilan desktop: sidebar selalu terlihat di kiri
- Tampilan mobile: sidebar dapat dibuka/tutup dengan tombol menu

---

## Struktur Project

```
├── app/
│   ├── page.tsx                    # Halaman utama
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   └── api/
│       ├── auth/osm/
│       │   ├── login/route.ts      # Redirect ke halaman login OSM
│       │   ├── callback/route.ts   # Handle OAuth callback dari OSM
│       │   └── logout/route.ts     # Hapus session login
│       └── osm/
│           └── edit/route.ts       # Proxy edit data ke OSM API
├── components/
│   ├── FacilityMap.tsx             # Komponen peta utama
│   ├── Sidebar.tsx                 # Panel kategori & radius
│   ├── EditOsmForm.tsx             # Form edit data OSM
│   ├── OsmLoginButton.tsx          # Tombol login/logout OSM
│   └── MapSkeleton.tsx             # Loading skeleton peta
├── lib/
│   ├── constants.ts                # Definisi kategori & default values
│   ├── overpass.ts                 # Fungsi query Overpass API
│   ├── supabase.ts                 # Supabase client
│   ├── types.ts                    # TypeScript interfaces
│   └── utils.ts                    # Helper functions
└── .env.local                      # Environment variables
```

---

## Setup & Instalasi

### Prerequisites
- Node.js 18+
- Akun [Supabase](https://supabase.com)
- Akun [OpenStreetMap](https://www.openstreetmap.org)
- [ngrok](https://ngrok.com) (untuk development OAuth)

---

### 1. Clone & Install

```bash
git clone <repo-url>
cd facility-monitor
npm install
```

---

### 2. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Masuk ke **SQL Editor**, jalankan query berikut untuk membuat tabel:

```sql
-- Tabel fasilitas custom
CREATE TABLE public.custom_facilities (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  category      text NOT NULL,
  category_id   text NOT NULL,
  lat           double precision NOT NULL,
  lon           double precision NOT NULL,
  address       text DEFAULT '',
  phone         text DEFAULT '',
  opening_hours text DEFAULT '',
  website       text DEFAULT '',
  operator      text DEFAULT '',
  not_in_osm    boolean DEFAULT true,
  note          text DEFAULT '',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE public.custom_facilities DISABLE ROW LEVEL SECURITY;
```

3. Catat **Project URL** dan **anon public key** dari **Settings → API**

---

### 3. Setup OAuth OpenStreetMap

1. Login ke [openstreetmap.org](https://www.openstreetmap.org)
2. Klik nama profil → **My Settings** → **OAuth 2 Applications** → **Register new application**
3. Isi form registrasi:
   - **Name**: Facility Monitor (atau nama lain)
   - **Redirect URIs**: `https://<ngrok-url>/api/auth/osm/callback`
   - **Permissions**: centang `read_prefs` dan `write_api`
4. Catat **Client ID** dan **Client Secret**

> **Catatan:** Redirect URI harus HTTPS. Gunakan ngrok untuk development lokal.

---

### 4. Setup ngrok (untuk development)

```bash
# Install ngrok dari https://ngrok.com
# Jalankan tunnel ke port 3000
ngrok http 3000
```

Salin URL HTTPS yang diberikan ngrok (contoh: `https://xxxx.ngrok-free.app`).

Update Redirect URI di pengaturan OAuth OSM dengan URL ngrok terbaru setiap kali ngrok di-restart.

---

### 5. Konfigurasi Environment Variables

Buat file `.env.local` di root project:

```bash
# ─── OpenStreetMap OAuth ───
OSM_CLIENT_ID=your_client_id_here
OSM_CLIENT_SECRET=your_client_secret_here
OSM_REDIRECT_URI=https://xxxx.ngrok-free.app/api/auth/osm/callback
OSM_OAUTH_URL=https://www.openstreetmap.org
OSM_API_URL=https://api.openstreetmap.org

# ─── App Base URL ───
NEXTAUTH_URL=https://xxxx.ngrok-free.app

# ─── Supabase ───
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

> ⚠️ Jangan commit file `.env.local` ke git. Pastikan sudah ada di `.gitignore`.

---

### 6. Jalankan Development Server

```bash
npm run dev
```

Buka `https://<ngrok-url>` di browser (bukan `localhost:3000`) agar OAuth berfungsi dengan benar.

---

## Cara Penggunaan

### Mencari Fasilitas
1. Izinkan akses lokasi saat browser meminta
2. Pilih satu atau lebih kategori di panel kiri
3. Atur radius pencarian dengan slider
4. Klik tombol **"Cari Fasilitas"**
5. Marker fasilitas akan muncul di peta
6. Klik marker untuk melihat detail dan mendapatkan rute

### Melengkapi Data Fasilitas di OSM
1. Klik tombol **"Login OSM"** di panel kiri
2. Login dengan akun OpenStreetMap Anda
3. Klik marker fasilitas yang ingin dilengkapi datanya
4. Di popup, klik tombol **"✏️ Lengkapi data di OSM"**
5. Isi field yang ingin ditambahkan
6. Klik **"💾 Simpan ke OSM"**
7. Data akan langsung masuk ke database OpenStreetMap global

---

## Deployment ke Production

### Yang perlu diubah di `.env`:

```bash
# Ganti URL ngrok dengan domain production
NEXTAUTH_URL=https://domainanda.com
OSM_REDIRECT_URI=https://domainanda.com/api/auth/osm/callback
```

### Yang perlu diupdate di OpenStreetMap:
- Tambahkan domain production ke **Redirect URIs** di pengaturan OAuth aplikasi

### Catatan production:
- Supabase yang dipakai saat development bisa langsung digunakan untuk production
- Aktifkan Row Level Security (RLS) di Supabase untuk keamanan production
- File `.env.local` tidak perlu dibuat di VPS — gunakan environment variables sistem atau file `.env.production`

---

## Kontribusi Data OpenStreetMap

Jika menemukan fasilitas yang belum ada atau datanya tidak lengkap di peta, Anda bisa berkontribusi langsung ke OpenStreetMap:

1. Daftar di [openstreetmap.org](https://www.openstreetmap.org)
2. Cari lokasi fasilitas
3. Klik **Edit** → tambahkan atau lengkapi data
4. Simpan dengan keterangan perubahan yang jelas

Kontribusi Anda akan bermanfaat untuk semua pengguna OpenStreetMap di seluruh dunia.

---

## Referensi

- [OpenStreetMap Map Features](https://wiki.openstreetmap.org/wiki/Map_features) — daftar semua tag OSM
- [Overpass API](https://overpass-api.de) — dokumentasi query Overpass
- [Overpass Turbo](https://overpass-turbo.eu) — playground untuk eksplorasi data OSM
- [React Leaflet Docs](https://react-leaflet.js.org) — dokumentasi komponen peta
- [Supabase Docs](https://supabase.com/docs) — dokumentasi database