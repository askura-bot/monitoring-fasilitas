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
| **OpenStreetMap OAuth 2.0** | Autentikasi untuk edit & tambah data |
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
- Marker lokasi pengguna ditandai dengan ikon khusus
- Setiap marker memiliki ikon SVG unik sesuai kategori fasilitasnya

### 🔍 Pencarian Fasilitas
- Tidak ada kategori terpilih saat pertama buka — user memilih sendiri kategori yang diinginkan
- Pencarian fasilitas berdasarkan kategori yang dipilih
- Radius pencarian dapat disesuaikan (1–20 km)
- Data diambil real-time dari Overpass API
- Mendukung pencarian `node` dan `way` (area/polygon) dari OSM
- Fallback otomatis ke 3 server Overpass jika salah satu gagal

### 📂 Kategori Fasilitas
| Kategori | Tag OSM | Icon |
|---|---|---|
| Police Stations | `amenity=police` | 🛡️ Shield |
| Hospitals | `amenity=hospital`, `amenity=clinic` | ✚ Cross |
| Stations | `railway=station`, `railway=halt` | 🚂 Train |
| Bus Terminals | `amenity=bus_station`, `highway=bus_stop` | 🚌 Bus |
| Airports | `aeroway=aerodrome` | ✈️ Plane |
| Gas Stations | `amenity=fuel` | ⛽ Fuel |
| Tourist Attractions | `tourism=attraction/museum/viewpoint` | 📷 Camera |
| Workshops | `shop=car_repair`, `amenity=vehicle_inspection` | ⚙️ Wrench |
| Worship Places | `amenity=place_of_worship` | ⛪ Landmark |
| Pos Pengamanan | `amenity=police` | 🚨 Siren |

> **Pos Pengamanan** adalah posko sementara kepolisian (Operasi Ketupat, dll) untuk menjaga keamanan dan kelancaran lalu lintas saat arus mudik/balik. Karena sifatnya sementara, banyak yang belum ada di OSM sehingga data utamanya ditambahkan melalui fitur Data Lokal.

### 📍 Popup Informasi Fasilitas
Setiap marker menampilkan informasi lengkap:
- Nama dan kategori fasilitas
- Badge "Data Lokal" untuk fasilitas dari Supabase
- Badge "Belum di OSM" untuk fasilitas yang belum terdaftar di OSM
- Alamat
- Nomor telepon (klik untuk langsung menelepon)
- Jam operasional
- Website
- Operator/pengelola
- Koordinat
- Tombol "Lihat di Maps" dan "Rute ke Sini" via Google Maps

### ✏️ Edit Data OSM
- Login dengan akun OpenStreetMap melalui OAuth 2.0
- Melengkapi data fasilitas OSM yang belum lengkap langsung dari aplikasi
- Field yang bisa dilengkapi: telepon, jam buka, website, operator, alamat, email, Facebook, Instagram
- Perubahan langsung dikirim ke database OpenStreetMap global
- Tombol edit hanya muncul untuk data dari OSM saat sudah login

### 📌 Tambah Lokasi Baru (Admin)
- Hanya muncul saat sudah login OSM
- Klik tombol **"Tambah Lokasi Baru"** di sidebar
- Klik titik di peta → koordinat otomatis terisi
- Isi detail fasilitas (nama, kategori, alamat, telepon, dll)
- Data tersimpan ke Supabase dan langsung tampil di peta
- Marker data lokal tampil dengan pin outline (berbeda dari data OSM)

### 🗑️ Edit & Hapus Data Lokal (Admin)
- Hanya muncul di popup marker Data Lokal saat sudah login OSM
- Tombol **✏️ Edit** — buka modal edit dengan data terisi, simpan perubahan
- Tombol **🗑️ Hapus** — konfirmasi hapus, marker langsung hilang dari peta

### 📱 Responsive Design
- Tampilan desktop: sidebar selalu terlihat di kanan
- Tampilan mobile: tombol hamburger di kanan atas, sidebar muncul dari kanan
- Banner prompt muncul di tengah peta saat belum ada kategori dipilih

---

## Struktur Project

```
├── app/
│   ├── page.tsx                        # Halaman utama
│   ├── layout.tsx                      # Root layout
│   ├── globals.css                     # Global styles
│   └── api/
│       ├── auth/osm/
│       │   ├── login/route.ts          # Redirect ke halaman login OSM
│       │   ├── callback/route.ts       # Handle OAuth callback dari OSM
│       │   └── logout/route.ts         # Hapus session login
│       ├── osm/
│       │   └── edit/route.ts           # Proxy edit data ke OSM API
│       └── facilities/
│           └── route.ts                # PUT & DELETE fasilitas custom (Supabase)
├── components/
│   ├── FacilityMap.tsx                 # Komponen peta utama + marker berikon
│   ├── Sidebar.tsx                     # Panel kategori, radius & login OSM
│   ├── EditOsmForm.tsx                 # Form edit data OSM
│   ├── AddFacilityModal.tsx            # Modal tambah/edit fasilitas custom
│   ├── OsmLoginButton.tsx              # Tombol login/logout + tambah lokasi
│   └── MapSkeleton.tsx                 # Loading skeleton peta
├── lib/
│   ├── constants.ts                    # Definisi kategori & default values
│   ├── overpass.ts                     # Fungsi query Overpass API
│   ├── supabase.ts                     # Supabase client
│   ├── types.ts                        # TypeScript interfaces
│   └── utils.ts                        # Helper functions
└── .env.local                          # Environment variables (tidak di-commit)
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
2. Masuk ke **SQL Editor** → **New Query**, jalankan query berikut:

```sql
-- Tabel fasilitas custom (data lokal yang belum ada di OSM)
CREATE TABLE IF NOT EXISTS public.custom_facilities (
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

-- Auto-update kolom updated_at saat data diubah
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.custom_facilities;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.custom_facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

> Tabel ini wajib dibuat agar aplikasi tidak error saat fetch data, meskipun fitur tambah fasilitas tidak digunakan.

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

> ⚠️ URL ngrok berubah setiap kali ngrok di-restart. Update `NEXTAUTH_URL`, `OSM_REDIRECT_URI` di `.env.local`, dan Redirect URI di pengaturan OAuth OSM setiap kali URL berubah.

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
2. Pilih satu atau lebih kategori di panel kanan
3. Atur radius pencarian dengan slider
4. Klik tombol **"Cari Fasilitas"**
5. Marker fasilitas akan muncul di peta dengan ikon sesuai kategori
6. Klik marker untuk melihat detail dan mendapatkan rute

### Melengkapi Data Fasilitas di OSM
1. Klik tombol **"Login OSM"** di panel kanan
2. Login dengan akun OpenStreetMap Anda
3. Klik marker fasilitas OSM yang ingin dilengkapi datanya
4. Di popup, klik tombol **"✏️ Lengkapi data di OSM"**
5. Isi field yang ingin ditambahkan
6. Klik **"💾 Simpan ke OSM"**
7. Data akan langsung masuk ke database OpenStreetMap global

### Menambah Lokasi Baru
1. Login OSM terlebih dahulu
2. Klik tombol **"Tambah Lokasi Baru"** di panel kanan (muncul setelah login)
3. Kursor berubah menjadi crosshair — klik titik lokasi di peta
4. Modal form terbuka dengan koordinat sudah terisi otomatis
5. Isi nama, pilih kategori, lengkapi detail lainnya
6. Klik **"Simpan Lokasi"** — marker langsung muncul di peta

### Edit & Hapus Data Lokal
1. Login OSM terlebih dahulu
2. Klik marker berlabel **"Data Lokal"** di peta
3. Di popup, klik **✏️ Edit** untuk mengubah data atau **🗑️ Hapus** untuk menghapus
4. Konfirmasi hapus jika dipilih — marker langsung hilang dari peta

---

## Deployment ke Production

### 1. Siapkan Environment Variables di VPS

Buat file `.env.production` di root project di VPS:

```bash
# Ganti semua URL ngrok dengan domain production
NEXTAUTH_URL=https://domainanda.com
OSM_REDIRECT_URI=https://domainanda.com/api/auth/osm/callback
OSM_OAUTH_URL=https://www.openstreetmap.org
OSM_API_URL=https://api.openstreetmap.org
OSM_CLIENT_ID=your_client_id
OSM_CLIENT_SECRET=your_client_secret

# Supabase tetap sama seperti development
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

> ⚠️ Jangan commit file `.env.production` ke git.

---

### 2. Update Redirect URI di OpenStreetMap

Buka [openstreetmap.org](https://www.openstreetmap.org) → My Settings → OAuth 2 Applications → edit aplikasi → tambahkan domain production ke **Redirect URIs**:

```
https://domainanda.com/api/auth/osm/callback
```

---

### 3. Build & Jalankan di VPS

```bash
# Clone repository
git clone <repo-url>
cd facility-monitor

# Install dependencies
npm install

# Build untuk production (wajib sebelum menjalankan)
npm run build

# Jalankan server production
npm run start
```

> `npm run build` mengompilasi semua kode TypeScript + React menjadi JavaScript yang dioptimasi untuk production. **Wajib dijalankan setiap kali ada perubahan kode** sebelum `npm run start`.

---

### 4. Menjalankan dengan PM2 (Recommended)

PM2 memastikan aplikasi tetap berjalan meski terminal ditutup atau VPS di-restart.

```bash
# Install PM2 secara global
npm install -g pm2

# Pastikan sudah build terlebih dahulu
npm run build

# Jalankan aplikasi dengan PM2
pm2 start npm --name "facility-monitor" -- start

# Agar otomatis jalan saat VPS restart
pm2 startup
pm2 save
```

**Perintah PM2 yang berguna:**

```bash
pm2 status                        # cek status semua app
pm2 logs facility-monitor         # lihat logs realtime
pm2 restart facility-monitor      # restart app
pm2 stop facility-monitor         # stop app
```

---

### 5. Update Kode di Production

Setiap kali ada perubahan kode, lakukan langkah berikut di VPS:

```bash
git pull                          # ambil kode terbaru
npm install                       # jika ada dependency baru
npm run build                     # build ulang (wajib)
pm2 restart facility-monitor      # restart app
```

---

### Perbedaan Development vs Production

| | `npm run dev` | `npm run build` + `npm run start` |
|---|---|---|
| Tujuan | Development lokal | Production di VPS |
| Kecepatan | Lambat (compile saat request) | Cepat (sudah dikompilasi) |
| Hot reload | Ada (perubahan langsung terlihat) | Tidak ada |
| Optimasi kode | Tidak | Ya (minify, tree-shaking) |
| Tempat dijalankan | Laptop | VPS/server |

---

### Catatan Production

- Supabase yang dipakai saat development **bisa langsung digunakan** untuk production tanpa perlu buat project baru
- Aktifkan Row Level Security (RLS) di Supabase untuk keamanan production
- File `.env.local` tidak perlu dibuat di VPS — gunakan `.env.production` atau environment variables sistem

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
- [PM2 Docs](https://pm2.keymetrics.io/docs) — dokumentasi process manager