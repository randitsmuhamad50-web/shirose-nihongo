# Backup Folder

## kanji-lama-vietnamese.json
Backup data kanji sebelum terjemahan Vietnamese → Indonesian (7 Nov 2026).
Berisi versi lama dari file `/data/kanji-*.json` dengan sebagian arti dalam bahasa Vietnam.
Dapat digunakan untuk referensi atau diff bila ada kesalahan terjemahan.

## Bank soal simulasi N3 lama
Bank soal simulasi N3 (290 soal + choukai + narabe + bunshou) yang sebelumnya
inline di file index.html versi lama TIDAK diimpor otomatis ke platform RPG baru,
karena arsitekturnya kini menggunakan **Firestore + kategori ujian dinamis**.

Alur migrasi yang disarankan:
1. Guru membuat kategori ujian baru di Teacher Dashboard (misal "N3 Paket Ujian 01")
2. Buka file index.html lama, export array soalnya ke format template Excel
3. Import ke kategori yang sudah dibuat

Hal ini sesuai aturan master prompt section 7: "Hapus hanya konten soal simulasi lama setelah membuat backup. Jangan menghapus struktur sistem ujian."
Struktur sistem ujian dipertahankan utuh (engine timer, navigasi nomor, penilaian otomatis, pembahasan, reward XP+koin).
