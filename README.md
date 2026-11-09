# Shirose Nihongo RPG

Platform RPG belajar bahasa Jepang JLPT N5–N1. Dulunya website materi biasa, sekarang jadi game edukasi dengan karakter, EXP, koin, shop, dan quest.

🌐 Live: https://shirose-nihongo.netlify.app  
📱 Bisa dipasang sebagai app di HP (PWA)

## Fitur utama

### Untuk siswa
- **RPG Dashboard** dengan karakter botak default + orbital navigation (9 menu mengorbit).
- **Karakter layered**: beli rambut, pakaian, sepatu, aksesori di Shop pakai koin. Default botak — rambut HARUS dibeli & dipakai lewat Wardrobe.
- **5 Level JLPT** (N5, N4, N3, N2, N1) — akses dikontrol per-murid oleh guru lewat server-side rules Firestore (bukan cuma frontend lock).
- **Materi**: Kosakata, Kanji, Bunpou per level. Data semuanya sudah dalam Bahasa Indonesia (2.787 kanji N5–N1 bebas Vietnamese).
- **Hafalan SRS** dengan FSRS-lite + progres per level tersync ke Firestore.
- **Quest / Ujian** dengan kategori dinamis (guru bisa buat kategori baru tanpa edit code).
- **Shop + Wardrobe + Inventory** dengan preview karakter langsung.
- **Misi Harian** (3 misi, reset UTC+7 00:00) + **Achievement** + **Leaderboard** per kelas.
- **Choukai (Listening)** dengan TTS browser sebagai audio default, guru bisa override pakai MP3.

### Untuk guru
- **Teacher Dashboard** (`/teacher.html`) — email `randitsmuhamad50@gmail.com` saja yang boleh masuk.
- **Siswa**: toggle akses N5/N4/N3/N2/N1 per-murid (field `aksesLevel`), assign ke kelas.
- **Kategori Ujian**: buat, edit, hapus kategori sendiri lewat UI (tanpa edit source code).
- **Bank Soal**: tambah manual + CRUD + export CSV/Excel.
- **Import Excel** 100% client-side (SheetJS CDN) — tidak butuh AI/cloud. Template Excel bisa didownload.
- **Choukai**: tambah soal listening + import starter bank 10 soal/level.
- **Laporan Kelas**: export XP/koin/level/streak/akses semua murid ke Excel.

## JLPT Center (Full Exam & Individual Practice)

Menu baru `#jlpt` (kartu **JLPT Center** di Home dan di halaman Ujian).

- **Full Exam**: 10 paket per level (N5–N1) — Kanji, Kotoba, Bunpou, Dokkai, Choukai. Default 70 menit; siswa bisa pilih 30/45/60/70/custom.
- **Individual Practice**: Kanji, Kotoba, Bunpou — 20 paket per level, maks. 20 soal per paket. Default 20 menit; pilihan 5/10/15/20/custom.
- **Timer** memakai waktu selesai absolut + progres disimpan di `localStorage` → refresh/tutup tab tidak mereset timer & jawaban. Waktu habis = dikumpulkan otomatis.
- **Ujian**: navigasi nomor, penanda dijawab/belum, 🚩 tandai untuk ditinjau, konfirmasi sebelum kumpulkan. Kunci tidak ditampilkan selama ujian.
- **Hasil**: benar/salah/kosong, %, waktu dipilih vs terpakai, rata-rata per soal, mulai/selesai, status selesai/timeout, analisis per kategori + rekomendasi (label "estimasi hasil latihan").
- **Pembahasan** 10 bagian (正解, 問題の意味, 正解の理由, 選択肢の解説, 文法解説, 語彙解説, 漢字解説, 文構造, 例文, 学習ポイント) + filter Semua/Benar/Salah/Kosong/Ditandai. Choukai: transkrip di pembahasan.
- **Penyimpanan**: Firestore `siswa/{uid}/jlpt_hasil` (sudah tercakup rules yang ada — siswa hanya melihat miliknya, guru melihat semua). Cadangan lokal bila offline, disinkron saat buka Riwayat.
- **Riwayat** `#jlpt-riwayat`: nilai terakhir, grafik, progress per level, rekomendasi.
- **Dashboard guru** → tab **Hasil JLPT**: filter level/nama/tanggal, detail per kategori & jawaban per nomor, export Excel.

### Bank soal
Soal **orisinal**, dibangun otomatis dari materi di `data/` (kosakata, kanji, bunpou) + teks Dokkai/Choukai yang ditulis khusus (`tools/jlpt_content.py`) + soal Choukai rekaman yang sudah ada (`choukai/jlpt-n*.json`).

```bash
python3 tools/jlpt_build.py     # tulis ulang folder jlpt/
python3 tools/jlpt_validate.py  # QC: ID unik, kunci valid, opsi lengkap, pembahasan ada
```
Catatan: file `jlpt/*.json` bersifat publik (situs statis), jadi kunci jawaban secara teknis bisa dibuka lewat DevTools.

## Arsitektur

- **Frontend**: Static HTML + JS modular (ES modules via CDN import maps). Tidak ada bundler.
- **Hosting**: Netlify (production di `shirose-nihongo.netlify.app`). Source di GitHub.
- **Auto deploy**: Push ke `main` → GitHub Actions trigger Netlify deploy (`.github/workflows/deploy.yml`).
- **Backend**: Firebase Spark plan (gratis).
  - **Auth**: Email/Password.
  - **Firestore (Jakarta)**: struktur schema di komentar `js/firebase-sync.js`.
  - **Rules**: server-side cek `aksesLevel[level] === true` sebelum read koleksi soal.
- **PWA**: service worker network-first + manifest. Installable di HP Android/iOS.
- **Excel parsing**: SheetJS 0.20.3 via CDN (lazy-load di teacher.html saja).

## Struktur file

```
/
├── index.html                   # RPG Dashboard siswa
├── teacher.html                 # Teacher Dashboard
├── manifest.webmanifest
├── sw.js                        # Service worker
├── _headers                     # Netlify MIME overrides
├── netlify.toml                 # Netlify config
├── js/
│   ├── character.js             # Layered SVG character system (bald base + slots)
│   ├── firebase-sync.js         # Firebase integration (Auth + Firestore)
│   ├── shop-seed.js             # Shop items derived from character.js CATALOG
│   └── achievements.js          # 20 default achievements
├── data/
│   ├── kosakata-n{5..1}.json
│   ├── kanji-n{5..1}.json       # 100% Indonesia (2787 kanji total)
│   └── bunpou-n{5..1}.json
├── choukai/
│   └── n{5..1}.json             # Starter 10 soal choukai/level
├── backup/
│   ├── README.md
│   └── kanji-lama-vietnamese.json
└── .github/workflows/deploy.yml
```

## Setup pertama kali (lokal → GitHub → Netlify)

1. **Clone repo**:
   ```bash
   git clone https://github.com/<username>/shirose-nihongo.git
   cd shirose-nihongo
   ```

2. **Preview lokal** (opsional): buka `index.html` di browser lewat live server (service worker butuh HTTPS atau localhost).

3. **Firebase**: project `shirose-nihongo` sudah live. Config di `js/firebase-sync.js` (apiKey publik Firebase memang aman untuk dipaparkan).

4. **Netlify setup** (sekali saja):
   - Login https://app.netlify.com
   - Klik **Add new site → Import an existing project**
   - Connect ke GitHub → pilih repo `shirose-nihongo`
   - Build settings:
     - Build command: (kosong)
     - Publish directory: `.`
   - Site name: `shirose-nihongo` (biar URL tetap `shirose-nihongo.netlify.app`)
   - Deploy!

5. **GitHub Actions secrets** (untuk auto-deploy dari push):
   - Di GitHub repo → **Settings → Secrets and variables → Actions**
   - Add:
     - `NETLIFY_AUTH_TOKEN`: dari https://app.netlify.com/user/applications#personal-access-tokens
     - `NETLIFY_SITE_ID`: ada di Netlify site → **Settings → Site information → Site ID**

   Setelah itu, setiap `git push origin main` akan auto-deploy ke Netlify.

## Update konten tanpa coding

1. **Tambah soal**: Login sebagai guru → Dashboard Guru → Kategori Ujian (buat kategori) → Bank Soal / Import Excel.
2. **Download template Excel**: di tab Import Excel → tombol "Download Template Excel".
3. **Update akses JLPT murid**: tab Siswa → klik chip N5/N4/N3/N2/N1 per murid.
4. **Export laporan**: tab Laporan → tombol Export CSV.

## Keamanan

- Password tidak pernah disimpan di frontend — Firebase Auth meng-hash.
- API secret tidak ada di frontend (Firebase config publik memang aman).
- Server-side rules Firestore enforce akses JLPT, kategori-ownership, dan per-user data isolation.
- Reward XP/koin disimpan di Firestore (bukan localStorage) untuk anti-cheat.
- localStorage hanya dipakai untuk mode guest (progres tidak disinkron).

## Keterbatasan yang diakui secara terbuka

Sesuai aturan master prompt section 17: "Jika terdapat keterbatasan teknis, jelaskan secara terbuka."

1. **Audio Choukai pakai TTS browser** — kualitas suara beda antar OS (iOS "Kyoko" vs Android Google TTS JP). Guru bisa upload MP3 override tapi fitur upload MP3 butuh Firebase Storage (belum aktif di Spark plan; akan diaktifkan kalau user berlangganan Blaze).
2. **Mode guest** (tanpa login) pakai localStorage — tidak ada sync lintas device, dan reward bisa dimanipulasi dari devtools. Login untuk pengalaman penuh + anti-cheat.
3. **Leaderboard** fetch semua `siswa` docs saat ini untuk sort — oke untuk <100 murid, perlu optimasi query dengan aggregation query kalau >500 murid.
4. **Bank soal lama N3** (290 soal inline di index.html versi sebelumnya) tidak dimigrasi otomatis — struktur engine dipertahankan utuh, guru perlu re-import lewat Excel ke kategori baru.

## Lisensi

Proprietary — Shirose Nihongo. Dibuat oleh pemilik kelas.

## Kontak

- Guru: randitsmuhamad50@gmail.com
- Instagram: [@shirose.nihongo](https://instagram.com/shirose.nihongo)
- TikTok: [@shirose.nihongo](https://tiktok.com/@shirose.nihongo)
