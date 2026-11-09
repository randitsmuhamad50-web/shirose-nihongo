# Voice pack VOICEVOX — Shirose Nihongo

Semua suara di website memakai **7 karakter VOICEVOX** (daftar dan pengaturannya ada di `voices.json`):

| Kunci | Karakter | Dipakai untuk |
|---|---|---|
| aoyama | 青山龍星 | narator & instruksi Choukai, guru, contoh kalimat |
| mochiko | もち子さん | perempuan umum, kosakata |
| goki | 後鬼 | ibu / perempuan dewasa |
| no7 | No.7 | perempuan tegas (guru, atasan), kanji |
| sourin | 麒ヶ島宗麟 | bapak tua / tokoh senior |
| nana | 春歌ナナ | siswi |
| kurita | 栗田まろん | cowok / siswa laki-laki |

## Cara kerja di website
1. Website mencari file voice pack (`audio/choukai/...` dan `audio/vv/{level}/...`).
2. Kalau belum ada dan guru menyalakan VOICEVOX di komputernya, suara dibuat langsung oleh VOICEVOX lokal.
3. Kalau dua-duanya tidak ada, website memakai suara browser sebagai cadangan.

## Membuat voice pack sendiri (Windows)
1. Buka aplikasi **VOICEVOX** (biarkan tetap terbuka).
2. Pasang Python 3 dan ffmpeg: `winget install Python.Python.3.12` lalu `winget install Gyan.FFmpeg`.
3. Dari folder repo ini jalankan:
   - `python tools/vv_build.py test` — contoh suara tiap karakter
   - `python tools/vv_build.py choukai n5 n4 n3 n2 n1`
   - `python tools/vv_build.py materi n4` (ganti levelnya; bisa `--only kosakata kanji`)
4. Upload folder `audio/` yang baru ke GitHub (GitHub Desktop, atau seret folder ke halaman *Add file → Upload files*, maks. 100 file sekali upload).

File yang sudah ada dilewati, jadi aman dijalankan ulang.

Kredit wajib: `VOICEVOX:青山龍星`, `VOICEVOX:もち子さん`, `VOICEVOX:後鬼`, `VOICEVOX:No.7`, `VOICEVOX:麒ヶ島宗麟`, `VOICEVOX:春歌ナナ`, `VOICEVOX:栗田まろん` (sudah ditampilkan di halaman Choukai).

## ⚡ Otomatis lewat GitHub (tanpa install apa pun)
Workflow `.github/workflows/voice-pack.yml` menjalankan VOICEVOX ENGINE (Docker, karakter yang sama)
di GitHub Actions setiap ada konten baru yang masuk ke `main`:

| Kamu memasukkan… | Yang dibuat otomatis |
|---|---|
| `tools/choukai-src/n5-p11.txt` (naskah, format lihat `tools/choukai_build.py`) | `choukai/paket/n5-p11.json` + MP3 di `audio/choukai/n5/p11/` |
| `choukai/jlpt-*.json` / `choukai/paket/*.json` | MP3 yang belum ada |
| `data/kosakata-*.json`, `data/kanji-*.json`, `data/bunpou-*.json` | audio materi `audio/vv/{level}/…` |

Aturan suara Choukai: **青山龍星 (aoyama) = narator**; dialog & pilihan dibacakan acak oleh
もち子さん/後鬼/No.7/春歌ナナ (perempuan) dan 栗田まろん/麒ヶ島宗麟 (laki-laki).
Hasil 5–60 menit kemudian sudah ter-commit dan tampil di website. Bisa juga dijalankan manual:
tab **Actions → Voice pack VOICEVOX (otomatis) → Run workflow**.

## 📴 Offline
Setiap MP3 yang pernah diputar disimpan di perangkat (Cache Storage `shirose-audio-v1`) dan
diputar dari sana tanpa internet. Di halaman paket Choukai ada tombol **💾 Simpan offline**
untuk mengunduh semua audio paket sekaligus.
