# Panduan MENSETSU 面接

## Ringkas: apa yang jalan tanpa setup apa pun?
Setelah `git push`, **tanpa API key sekalipun** siswa sudah bisa:
- membuka 8 pulau, membaca **bank soal** (40 soal/bidang) dan mendengarkan pertanyaan,
- menjalankan simulasi dalam **Mode Skrip** (tanpa AI): pertanyaan diucapkan, jawaban lewat mikrofon/ketik, tanya-balik terbatas, bantuan contoh jawaban dari bank, penilaian sederhana, riwayat, dashboard guru.

**AI pewawancara sungguhan** (tanya-balik sesuai isi jawaban, bantuan Indonesia→Jepang yang menerjemahkan jawaban siswa sendiri, penilaian tata bahasa) butuh langkah di bawah.

## 1. Aktifkan AI gratis (Netlify)
Netlify → Site → **Site configuration → Environment variables**. Isi **minimal satu**:

| Variabel | Dari mana | Catatan |
|---|---|---|
| `GEMINI_API_KEY` | Google AI Studio (aistudio.google.com) | tier gratis; bahasa Jepang cukup baik |
| `GROQ_API_KEY` | console.groq.com | tier gratis; cepat |
| `OPENROUTER_API_KEY` | openrouter.ai | pakai model berakhiran `:free` |
| `CF_ACCOUNT_ID` + `CF_API_TOKEN` | Cloudflare Workers AI | ada jatah gratis |

Nama model bisa diganti tanpa edit kode: `GEMINI_MODEL`, `GROQ_MODEL`, `OPENROUTER_MODEL`, `CF_MODEL`. **Nama model & batas gratis sering berubah — cek dokumen masing-masing provider.** Jika satu provider kena limit, fungsi otomatis mencoba provider berikutnya. Setelah mengisi variabel: **Deploys → Trigger deploy**.

Keamanan: key hanya ada di server; fungsi menolak permintaan tanpa login Firebase; prompt dibangun di server (tidak bisa dipakai jadi chatbot umum); ada batas 80 permintaan/10 menit per akun (best-effort).

Deploy: `deploy.yml` sudah diberi `functions-dir: netlify/functions`. Bila deploy kamu lewat Netlify Git (bukan Actions), `netlify.toml` sudah memuat `[functions] directory`.

## 2. VOICEVOX (opsional, gratis)
- **Di komputer yang menjalankan VOICEVOX Engine**: centang "Pakai VOICEVOX di komputer ini" di pengaturan → semua ucapan pewawancara (termasuk balasan AI) memakai VOICEVOX.
- **Untuk HP siswa** (tanpa VOICEVOX): buat voice pack sekali saja:
  `python3 -I tools/mensetsu_voicepack.py` (VOICEVOX Engine harus berjalan; ffmpeg opsional agar file kecil), lalu commit `audio/vv/mensetsu/`. Pertanyaan bank & kalimat tetap Mode Skrip akan berbunyi VOICEVOX. Balasan AI yang dibuat dinamis tetap memakai suara browser (VOICEVOX tidak bisa dipanggil dari HP tanpa server).

## 3. Yang BELUM/TIDAK bisa — jujur
- **Penilaian pelafalan sungguhan** (vokal panjang, っ, ん, intonasi) tidak mungkin dari teks hasil STT. Kolom "artikulasi" hanyalah **estimasi dari keyakinan STT** dan hanya muncul bila siswa memakai mikrofon.
- **STT browser** (Web Speech API): terbaik di Chrome (Android/desktop); iOS/Firefox lemah atau tidak ada → ada kotak ketik sebagai cadangan. Aksen bisa salah dengar.
- **Tier gratis**: bisa kena batas pemakaian saat banyak siswa bersamaan → otomatis pindah provider / Mode Skrip. Kualitas model gratis bisa di bawah model berbayar.
- **Mode Skrip** tidak memahami isi jawaban; hanya tanya-balik berbasis kata kunci, dan penilaiannya perkiraan sederhana (diberi label jelas).
- AI **tidak mengarang info perusahaan**; jika ditanya, ia menjawab informasi belum tersedia.
- Contoh jawaban di bank adalah referensi (bukan untuk dihafal).

## 4. Status pengujian (jujur)
Sudah diuji di browser headless dengan **STT dan AI yang disimulasikan (mock)**: peta 8 pulau, bank soal, sesi Mode Skrip & AI, mode Practice/Real, bantuan Indonesia→Jepang, tanya-balik, penutup, penilaian, penyimpanan (Firebase di-stub), riwayat, hapus, tampilan mobile, fallback saat AI gagal. Fungsi Netlify diuji dengan fetch ter-mock (urutan fallback provider, auth, JSON).
**Belum diuji** (butuh kamu): mikrofon & STT asli di HP, panggilan nyata ke Gemini/Groq/dll., VOICEVOX asli, Firestore asli, deploy Netlify, dashboard guru di data nyata.

Checklist uji di HP Android (Chrome): (1) buka MENSETSU, (2) Practice + Mode Skrip → izinkan mic → jawab, (3) isi key lalu pilih "Otomatis" → cek balasan AI, (4) selesaikan sesi → hasil tersimpan, (5) login guru → tab Hasil Mensetsu.

## 5. File
Baru: `js/mensetsu.js`, `js/mensetsu-engine.js`, `css/mensetsu.css`, `data/mensetsu/*.json`, `netlify/functions/mensetsu-ai.js`, `tools/mensetsu_build.py`, `tools/mensetsu_src/*`, `tools/mensetsu_voicepack.py`, file ini.
Diubah: `index.html` (kartu + route), `teacher.html` (tab guru), `js/firebase-sync.js` (fungsi simpan/baca/hapus), `sw.js` (cache v26), `netlify.toml`, `.github/workflows/deploy.yml`, `README.md`.
