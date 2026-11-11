# SSW — Pola Building Cleaning & Peta Modul (audit 11 Nov 2026)

Dokumen kerja untuk siapa pun (Sonnet / Opus / Fable / manusia) yang melanjutkan bidang SSW. **Jangan membuat sistem baru; ikuti pola ini.**

## 1. Pola Building Cleaning (master reference)

| Hal | Lokasi | Catatan |
|---|---|---|
| Manifest bidang | `data/ssw/<slug>/index.json` | `bab[]`, `pages`, opsional `assets` (pakai folder gambar bidang lain), `book` (buku hanya 1 bahasa), `alat` (panel flashcard peralatan) |
| Materi | `data/ssw/<slug>/babN.json` | `bab.subs[]`: `id`, `no`, `title{id,jp}`, `pages[awal,akhir]`, `full{id,jp}` (blok `h/p/ul/ol/note`), `summary{core,points,avoid,exam}` |
| Kosakata | `data/ssw/<slug>/vocab.json` | `{id, kata, kana, romaji, arti, cat, bab, src[subId]}` — `src` menghubungkan kata ke subbab |
| Soal | `data/ssw/<slug>/quiz.json` | `bab[babId][]`: `<bab>-q1..q3` (wajib 3, dipakai hitung progres) + `<subId>-q` (latihan di bawah materi). `rev:true` = kuis ulangan (tidak masuk bank Ujian Penuh) |
| Gambar halaman modul | `assets/ssw/<slug>/<lang>/pNN.webp` | file `p(N+1)` = halaman bernomor N; `p01` = sampul. Dibuat dengan `tools/ssw/render_pages.py` |
| Mesin | `js/ssw-core.js` (data, progres, akses), `js/ssw.js` (UI), `js/ssw-teacher.js` (guru) | Hafalan memakai mesin hafalan JLPT (`sswHafalStart` di index.html) |
| Progres | Firestore `siswa/{uid}/ssw_progres/{slug}` + SRS `ssw-bc` (BC) / `ssw-<slug>` (bidang lain) | XP/koin lewat `awardXP` yang sama |
| Konfigurasi guru | Firestore `ssw_bidang/{slug}` (aktif, status bab) | |
| Akses | `siswa.aksesSsw` (blokir total) → `siswa.aksesSswBidang[slug]` → `kelas.aksesSswBidang[slug]` → bawaan (hanya Building Cleaning terbuka) | Diatur di dashboard guru tab SSW dan kolom Excel `SSW …` |

Alur siswa: Hub (pulau) → Peta bab → Bab → Baca subbab (Lengkap/Ringkas, ID/JP) → halaman buku → kosakata subbab → hafalan → latihan soal → kuis bab → ujian penuh → progres/leaderboard.

## 2. Cara menambah bidang

1. `python3 tools/ssw/render_pages.py <pdf> <slug> <lang> [offset]`
2. Tulis sumber isi di `tools/ssw/src/<slug>/…` (lihat `src/kaigo/id_b1.py`): tiap subbab = judul, halaman, `full`, `summary`, `kata`, `soal` (jawaban benar ditulis pertama, tiap soal menyebut halaman modul).
3. Buat pembangun seperti `tools/ssw/kaigo_id.py` (memakai `bidang_lib.py`) → menghasilkan `data/ssw/<slug>/`.
4. Tambahkan `hasContent: true` di `DEFAULT_BIDANG` (`js/ssw-core.js`).

## 3. Peta modul yang diterima (11 Nov 2026)

| Bidang | File | Hal. | Status |
|---|---|---:|---|
| Kaigo (Indonesia) | Materi_Kaigo.pdf hal. 10–201 | 192 | **Masuk** (`kaigo`): 4 bagian, 14 bab |
| Kaigo (Bahasa Jepang) | Materi_Kaigo.pdf hal. 204–267 | 64 | **Masuk** (`kaigo-jp`): 222 kosakata + 48 soal modul |
| Food Service | Pengawasan Kebersihan / Persiapan Makanan & Minuman / Layanan Pelanggan | 127 (ID) + 144 (JP) | **Masuk ID** (`food-service`): 3 bab, 24 subbab, buku gabungan 127 hal. **Masuk JP** (`food-service-jp`, anak dari food-service): 3 bab, 20 subbab, 144 hal. buku Jepang, 634 kosakata dari indeks resmi modul + soal arti & cara baca |
| Food Manufacturing | SSW_PM.pdf (JP, 第4版 2024) | 82 | Belum |
| Agriculture | pertanian.pdf (Pertanaman Umum, ID) | 102 | Belum |
| Construction | 3 kategori: Sipil (`ctextd` JP / `sipil_indo`), Bangunan (`bangunan` JP / `building_indo`), Lifeline & Peralatan (`INFRASTRUCTURE_TEXTBOOK_JP` / `THEORY_ID` + `PRACTICE_ID`, Tutorial 5–7 JP) | ±1.000 | Belum — bab 1–4 sama di ketiga kategori, bab 5–7 berbeda per kategori |
| Accommodation | `4a7d082a` (PDF gambar, 52 hal., tanpa teks) | 52 | Belum — perlu dibaca visual/OCR |
| Livestock | — | — | Modul belum diberikan |

## 4. Batasan yang perlu diketahui

- Materi SSW adalah file statis di GitHub Pages (repo publik). Gerbang akses ada di aplikasi + data Firestore; file JSON/gambar tetap bisa dibuka lewat URL langsung oleh orang yang tahu alamatnya. Pembatasan sisi server hanya mungkin bila materi dipindah ke penyimpanan ber-autentikasi.
- `full.jp` Kaigo (Indonesia) belum ada (modulnya berbahasa Indonesia); tampilan 日本語 memakai teks Indonesia.
