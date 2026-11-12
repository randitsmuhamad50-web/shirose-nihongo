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
