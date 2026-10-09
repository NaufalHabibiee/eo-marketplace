# EO Marketplace

Direktori event organizer Jabodetabek: klien mencari EO, membuka profil, lalu mengirim permintaan penawaran yang otomatis menjadi lead untuk EO tersebut. Dibangun dari `EO_Marketplace_MVP_PRD.pdf`.

## Stack

- Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind CSS v4
- Supabase (Postgres + Auth), project `eo-marketplace` (`kigmtgnfzlqcipolytzv`, region Singapore)
- Komponen UI ditulis sendiri (bukan shadcn) agar visual khas: kartu EO bergaya "lanyard pass", warna strap = jenis acara

## Menjalankan

```bash
cp .env.example .env.local   # isi URL + publishable key Supabase
npm install
npm run dev                  # http://localhost:3000
```

Perintah lain: `npm run build`, `npm run lint`, `npx tsc --noEmit`.

## Halaman

| Route | Isi |
| --- | --- |
| `/` | Hero + pencarian, kategori acara, EO paling banyak diulas, cara kerja |
| `/explore` | Direktori + filter (jenis acara, provinsi, kota, anggaran, kapasitas, terverifikasi) + urutan + paginasi |
| `/eo/[slug]` | Profil EO, kontak (WhatsApp/telepon/website), lokasi, EO serupa, tombol minta penawaran |
| `/request?eo=slug` | Formulir 3 tahap; EO terpilih otomatis terlampir |
| `/success` | Konfirmasi + nomor referensi + chat EO via WhatsApp |
| `/admin` | KPI + daftar permintaan terbaru, ubah status lead, teruskan ke EO via WhatsApp |
| `/admin/eo` | CRUD EO, verifikasi, aktif/nonaktif, import CSV |

## Database

Tabel `eo`, `event_requests`, `leads`, `admin_users`. Semua memakai Row Level Security:

- Publik hanya bisa membaca EO berstatus `active`.
- Permintaan acara masuk lewat fungsi `submit_event_request` (validasi di database, membuat request + lead sekaligus). Publik tidak bisa membaca data permintaan.
- Hanya email yang terdaftar di `admin_users` yang bisa mengelola EO dan melihat lead.

## Data awal

100 EO diambil dari `eo_jakarta_eo_only.csv` (1.394 baris) dengan `scripts/prepare_seed.py`:

- Hanya kategori EO murni (Event Organizer, Perancang Acara, Perencana Pernikahan, Jasa Pernikahan) dan baris yang punya alamat + rating.
- Diurutkan dengan rata-rata Bayesian (rating × jumlah ulasan) supaya rating 5,0 dari 1 ulasan tidak mengalahkan 4,8 dari 300 ulasan.
- Kota/provinsi diurai dari alamat, jenis acara ditebak dari nama + kategori, deskripsi dibuat dari template dan diberi catatan bahwa profil belum diklaim.
- Kapasitas, anggaran minimum, tahun berdiri, total acara, logo, dan portofolio dikosongkan; isi lewat admin.

Hasilnya `data/eo_seed_100.csv` (format sama dengan template import CSV).

## Membuat akun admin

1. Supabase Dashboard → **Authentication → Users → Add user**, isi email + kata sandi, centang **Auto Confirm User**.
2. Supabase Dashboard → **SQL Editor**:
   ```sql
   insert into public.admin_users (email) values ('email-admin@domain.com');
   ```
3. Masuk di `http://localhost:3000/admin/login`.

## Mengaktifkan login Google

1. Google Cloud Console → APIs & Services → Credentials → **OAuth client ID** (Web application).
   Authorized redirect URI: `https://kigmtgnfzlqcipolytzv.supabase.co/auth/v1/callback`
2. Supabase → **Authentication → Sign In / Providers → Google**: aktifkan, tempel Client ID + Secret.
3. Supabase → **Authentication → URL Configuration**: Site URL `http://localhost:3000`, tambahkan redirect URL `http://localhost:3000/auth/callback` (dan domain produksi nanti).
4. Pastikan email Google tersebut ada di `admin_users`.

Sebelum Google aktif, tombol "Masuk dengan Google" menampilkan pesan bahwa provider belum diaktifkan.

## Import CSV

Kolom (header wajib minimal `company_name`): `company_name, slug, logo, description, city, province, phone, email, website, year_established, event_types, services, capacity, portfolio_images, rating, total_events, verified, status` + opsional `address, review_count, instagram, google_maps_url, min_budget`. Nilai ganda dipisah `|`. Slug yang sudah ada diperbarui, hanya kolom yang ada di file yang ditimpa. Template: `/eo-import-template.csv`.
