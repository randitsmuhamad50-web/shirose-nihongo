# Panduan MENSETSU (persiapan wawancara)

## Untuk siswa
1. Buka **MENSETSU**, pilih bidang.
2. **Persiapan jawaban**: centang pertanyaan yang mau dilatih (自己紹介 wajib & selalu pertama). Atur urutan dengan ↑ ↓. Tulis jawaban Jepang, klik **AI添削** untuk melihat bagian salah, penjelasan, versi perbaikan, terjemahan, kosakata, dan tingkat kealamian. Terima atau tolak perbaikan. Jawaban asli selalu tetap tersimpan.
3. Dengarkan jawaban: putar/jeda/ulang, normal atau lambat, pilih suara, furigana.
4. **Mode hafalan**: lihat pertanyaan, coba jawab, buka jawaban, shadowing, tandai hafal/sulit.
5. **Wawancara di Claude / ChatGPT**: pilih pertanyaan (お願いします), pilih Mode Latihan/Nyata, salin prompt, tempel di chat baru.

## Untuk admin
- Worker AI: Cloudflare Worker `mensetsu-ai`. Secret: `GEMINI_API_KEY`, opsional `GROQ_API_KEY`. Kode: `cloudflare/mensetsu-worker.js` (deploy dengan menempel kode ke editor Worker).
- Jika Gemini error 404/400: model dimatikan Google. Tambah variable `GEMINI_MODEL` dengan nama model yang masih aktif.
- Data: `siswa/{uid}/mensetsu_persiapan/{bidang}`. Hasil lama `mensetsu_hasil` (dari versi wawancara AI) tidak dipakai lagi.
- Test lokal: jalankan server statis, buka `#mensetsu`.
