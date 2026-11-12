# Progres Full Exam 11–20 (belum tampil di aplikasi; jangan daftarkan ke jlpt/index.json sebelum satu level lengkap)

Cara kerja per level `LV`:
1. `NEX=20 python3 tools/jlpt_rewrite.py LV`  → bagian bahasa (yomi/hyouki/bunmyaku/iikae/keishiki/bunshou/youhou/settou) + kerangka kumitate untuk full-11..20 (staging).
2. `python3 tools/jlpt_kumitate/build.py` (N5/N4: mengisi ★ untuk 100 baris; baris ke-51+ memakai posisi ★ di kolom ke-4).
3. `NEX=20 python3 tools/jlpt_dokkai_long.py LV` → dokkai dari bank `tools/dokkai_long/{lv}_*.py` (butuh tan 40, chu 20, tou 10 untuk N2/N1; N5/N4/N3 lihat PLAN).
4. Choukai: tulis `tools/choukai-src/{lv}-p11..p20.txt`; workflow voice-pack membuat JSON + MP3 setelah push ke main.
5. Audit: hitung unik (q, opsi, teks bacaan) per jenis; semua harus = jumlah slot; lalu daftarkan di jlpt/index.json + bump cache.

## N5 (status)
- bahasa: yomi 159/160, hyouki 129/140, bunmyaku 160/160, iikae 86/120, keishiki 307/320, bunshou 60/60, kumitate 100/100
- bank: tools/rw/n5/{keishiki3,bunmyaku2,bunmyaku3,yomi2,hyouki2,iikae3,bunshou3}.py + jlpt_kumitate/n5.py (100 baris)
- sisa bahasa: iikae +34, hyouki +11, keishiki +13, yomi +1
- dokkai: tan 22/40, chu 10/20 di bank; 情報検索/memo/pengumuman dibuat oleh generator jlpt_content.py (perlu seed baru untuk 11–20)
- choukai: belum (24 soal x 10 paket, audio via workflow)
## N4–N1: belum dimulai untuk 11–20.


## Status terbaru
- N5 Full Exam 11–20: SELESAI & LIVE (84 soal/exam, semua unik: yomi 160, hyouki 140, bunmyaku 160, iikae 120, keishiki 320, bunshou 60, kumitate 100, dokkai 140, choukai 480). Cache v111 / token 20261113a.
- Urutan kerja per level: (1) bank bahasa `tools/rw/<lv>/` → `NEX=20 python3 tools/jlpt_rewrite.py <lv>`; (2) `python3 tools/jlpt_kumitate/build.py` (N4: tambah baris di n4.py); (3) bank dokkai `tools/dokkai_long/<lv>_*.py` → `NEX=20 python3 tools/jlpt_dokkai_long.py <lv>` (info/お知らせ otomatis seed baru); (4) choukai `tools/choukai-src/<lv>-p11..p20.txt` → `python3 tools/choukai_build.py <lv>`; (5) `python3 tools/jlpt_choukai_swap.py <lv> 11 20`; (6) hapus staging dari commit, PR + merge paket → tunggu workflow Voice pack → daftarkan full-11..20 di `jlpt/index.json` (hapus key `staging`) + bump cache.
- Berikutnya: N4 (bank belum ada), lalu N3, N2, N1. Fase ★ (20 soal) belum dikerjakan.

- N4 & N3: Full Exam 11-20 terdaftar (MP3 ada). N2: bank + dokkai + choukai p11-20 sudah di main (PR #69); menunggu MP3 voice pack, lalu daftarkan (regenerasi staging seperti N3). N1 belum.

## Audit duplikat & paket ★ (terbaru)
- `tools/jlpt_dedupe.py <lv>`: cari duplikat (q+opsi+bacaan; kalimat+jawaban; kalimat sama pada bunmyaku/keishiki/bunshou/settou/iikae) di semua file jlpt/<lv>/*.json, pertahankan kemunculan pertama, ganti sisanya dari `tools/rw/<lv>/dedupe_extra.py` + bank. Hasil: 0 duplikat N5–N1. JANGAN menjalankan ulang `jlpt_rewrite.py` setelah ini (akan mengisi ulang siklus bank dan memunculkan duplikat lagi); kalau perlu, jalankan `jlpt_dedupe.py` lagi.
- Paket ★: `tools/jlpt_kumitate/star_<lv>.py` (40 baris/level) → `python3 tools/jlpt_star_pack.py` membuat `jlpt/<lv>/star-01..02.json` (20 soal) + mendaftarkan `level.<lv>.star` di jlpt/index.json. Jenis `star` ada di JENIS pada js/jlpt-center.js.
- ★ diperbanyak: N5-N2 4 paket, N1 3 paket (total_soal 13163), sw v126.
