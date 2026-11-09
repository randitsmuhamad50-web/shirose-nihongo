# Shirose Nihongo RPG

Platform RPG belajar bahasa Jepang JLPT N5–N1. Dulunya website materi biasa, sekarang jadi game edukasi dengan karakter, EXP, koin, shop, dan quest.

🌐 Live: https://shirose-nihongo.netlify.app  
📱 Bisa dipasang sebagai app di HP (PWA)

## Fitur utama

### Untuk siswa
- **RPG Dashboard** dengan karakter botak default + orbital navigation (10 menu mengorbit, termasuk **KANA**).
- **Karakter layered**: beli rambut, pakaian, sepatu, aksesori di Shop pakai koin. Default botak — rambut HARUS dibeli & dipakai lewat Wardrobe.
- **5 Level JLPT** (N5, N4, N3, N2, N1) — akses dikontrol per-murid oleh guru lewat server-side rules Firestore (bukan cuma frontend lock).
- **Materi**: Kosakata, Kanji, Bunpou per level. Data semuanya sudah dalam Bahasa Indonesia (2.787 kanji N5–N1 bebas Vietnamese).
- **Hafalan SRS** dengan FSRS-lite + progres per level tersync ke Firestore.
- **Quest / Ujian** dengan kategori dinamis (guru bisa buat kategori baru tanpa edit code).
- **Shop + Wardrobe + Inventory** dengan preview karakter langsung.
- **Misi Harian** (3 misi, reset UTC+7 00:00) + **Achievement** + **Leaderboard** per kelas.
- **Choukai (Listening)** dengan TTS browser sebagai audio default, guru bisa override pakai MP3.

### Untuk guru
- **Teacher Dashboard** (`/teacher.html`) — bisa dibuka oleh email pemilik **dan** semua akun terdaftar dengan `role` = `guru`, `admin`, atau `developer` (field `role` di dokumen `siswa/{uid}`; atur lewat Firestore/Console). Akun guru melihat kartu **Dashboard Guru** di halaman pilih level, di Aktivitas cepat, dan di Profil, serta pil melayang di pojok. Siswa biasa tidak melihat pintu ini dan jika membuka `/teacher.html` langsung akan mendapat "Akses Ditolak".
- **Siswa**: toggle akses N5/N4/N3/N2/N1 per-murid (field `aksesLevel`), assign ke kelas.
- **Kategori Ujian**: buat, edit, hapus kategori sendiri lewat UI (tanpa edit source code).
- **Bank Soal**: tambah manual + CRUD + export CSV/Excel.
- **Import Excel** 100% client-side (SheetJS CDN) — tidak butuh AI/cloud. Template Excel bisa didownload.
- **Choukai**: tambah soal listening + import starter bank 10 soal/level.
- **Laporan Kelas**: export XP/koin/level/streak/akses semua murid ke Excel.

## Hiragana & Katakana + Menulis Kanji (sesi mandiri)

Sesi baru `#kana` (kartu **Hiragana & Katakana** di halaman pilih level, Aktivitas cepat, dan menu orbit **KANA**). Tidak bergantung pada pilihan level JLPT, jadi bisa dibuka kapan saja oleh siswa.

- **Tabel** Hiragana & Katakana lengkap (gojuon, dakuten, handakuten, youon; katakana tambahan ファ ティ チェ ヴァ dll.). Klik huruf → panel: huruf besar, romaji, cara baca, animasi urutan goresan bernomor (putar ulang, jeda, lambat, hasil akhir), tombol latihan.
- **Latihan menulis** di kanvas (mouse / sentuh / stylus) dengan kotak panduan dan 3 mode: **Trace**, **Copy**, **Memory**. Tombol Hapus, Ulangi, Tampilkan contoh, Cek hasil.
- **Penilaian jujur**: nilai adalah *perkiraan geometris* (bentuk, arah, urutan, posisi, kemiripan) terhadap data goresan, **bukan** pengenalan tulisan tangan. Hasil selalu disertai perbandingan visual tulisan vs contoh. Batas yang diketahui: dua huruf yang bentuknya hampir identik bisa mendapat nilai tinggi untuk satu sama lain.
- **文字を覚えよう** (kartu hafalan) dengan sistem ulang berjarak (kotak Leitner 0–5; interval 0/1/2/4/8/16 hari): Sudah hafal / Belum hafal / Ulangi / Berikutnya.
- **読み方テスト**: Karakter→Romaji, Romaji→Karakter, Membaca Kata, Campuran; tingkat Dasar/Menengah/Lanjutan/Campuran; 4 pilihan, dinilai otomatis, pembahasan, riwayat.
- **Menulis semua Kanji N5–N1** dari bank Kanji yang sudah ada (2.787 entri; tanpa daftar kanji baru). Di detail kanji ada **書き順を見る** dan **書いてみよう ✍️**; daftar kanji punya filter level N5–N1 dan lencana progres. Kata majemuk (mis. 駐車) dilatih per karakter.
- **Progres per akun**: Firestore `siswa/{uid}/kana_progres/data` + cadangan `localStorage` (`shirose-kana:{uid}`; yang lebih baru menang). Sub-koleksi `siswa/{uid}/*` sudah tercakup Firestore Rules yang ada, **tidak perlu mengubah rules**.

### Data goresan & atribusi
Urutan goresan berasal dari **[KanjiVG](https://kanjivg.tagaini.net/)** © Ulrich Apel, lisensi **CC BY-SA 3.0**. Data kana dipaketkan lokal (`data/kana-strokes.json`, turunan KanjiVG, tetap CC BY-SA 3.0); data kanji dimuat dari CDN pada commit yang dikunci (`610091ce…`) dan di-cache offline oleh service worker setelah dibuka sekali.

```bash
git clone https://github.com/KanjiVG/kanjivg /tmp/kvg
python3 -I tools/kana_build.py /tmp/kvg/kanjivg   # tulis ulang data/kana.json & data/kana-strokes.json
```

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
