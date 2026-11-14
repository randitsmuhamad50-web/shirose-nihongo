/* Konfigurasi landing page Shirose Nihongo (landing.html).
 * Edit file ini saja — tidak perlu menyentuh landing.html.
 */
window.LANDING_CONFIG = {
  /* Isi URL asli akun kamu. Kosong ("") = tombol tampil nonaktif "Segera hadir".
     Contoh: instagram: "https://instagram.com/akunkamu" */
  social: [
    { id: "instagram", label: "Instagram", url: "https://www.instagram.com/shirose.nihongo" },
    { id: "tiktok",    label: "TikTok",    url: "https://www.tiktok.com/@shirose.nihongo" },
    { id: "youtube",   label: "YouTube",   url: "" }   // opsional; hapus baris jika tidak dipakai
  ],

  /* Pembaruan platform. Array kosong = section "What's New" disembunyikan.
     Tambah entri baru DI ATAS. kategori: "Fitur baru" | "Materi baru" |
     "Pembaruan sistem" | "Perbaikan" | "Program baru".
     tanggal diisi hanya jika benar (format "2026-11-14"), boleh dikosongkan. */
  updates: [
    { kategori: "Fitur baru", judul: "Halaman pengenalan Shirose Nihongo", isi: "Halaman depan baru yang memperkenalkan program JLPT, JFT-Basic, Hiragana & Katakana, SSW, dan MENSETSU.", tanggal: "2026-11-14" },
    { kategori: "Fitur baru", judul: "Tema tampilan", isi: "Pilih tema Ungu (bawaan), Cerah, Hujan, Salju, Gugur, Panas, Semi, atau Badai lewat tombol Ganti tema di aplikasi.", tanggal: "2026-11-14" }
  ]
};
