# -*- coding: utf-8 -*-
"""Bidang SSW "kaigo-jp" (介護の日本語) — fokus kosakata + soal bahasa Jepang.
Sumber: Buku Teks Keterampilan Perawatan Lansia dan Bahasa Jepang untuk Perawatan Lansia (versi Indonesia),
        Japan Association of Certified Care Workers, Okt 2019 — bagian "Bahasa Jepang untuk Perawatan Lansia" hal. 204–267.
Kosakata & soal diambil dari modul (src/kaigo/jp_vocab_raw.json, jp_soal_raw.json; kunci jawaban hal. 267).
Terjemahan pertanyaan & pembahasan (bahasa Indonesia) ditulis untuk Shirose Nihongo.
Gambar halaman memakai folder assets/ssw/kaigo (buku yang sama)."""
import json, os
from bidang_lib import vocab_item, vocab_quiz, write_pack
H = os.path.dirname(__file__)
RAW_V = json.load(open(os.path.join(H, "src", "kaigo", "jp_vocab_raw.json"), encoding="utf-8"))
RAW_Q = json.load(open(os.path.join(H, "src", "kaigo", "jp_soal_raw.json"), encoding="utf-8"))
SOURCE = "Buku Teks Keterampilan Perawatan Lansia & Bahasa Jepang untuk Perawatan Lansia (versi Indonesia) — Japan Association of Certified Care Workers, Oktober 2019"

# bab → subbab: (id, judul ID, judul JP, halaman [awal, akhir], bagian kosakata modul, halaman soal)
BABS = [
 ("bab1", "Ayo Menghafal Kosakata", "ことばを{覚|おぼ}えよう", "Kosakata dasar yang selalu muncul di tempat kerja kaigo: bagian tubuh, posisi tubuh, serta penyakit dan gejalanya.", [
   ("j1s1", "Tubuh", "からだのことば", [204, 205], "tubuh", []),
   ("j1s2", "Posisi Tubuh", "{体位|たいい}のことば", [206, 206], "posisi", []),
   ("j1s3", "Penyakit dan Gejala", "{病気|びょうき}・{症状|しょうじょう}のことば", [207, 207], "penyakit", []),
 ]),
 ("bab2", "Kosakata & Dialog per Jenis Perawatan", "{介護|かいご}の{場面|ばめん}のことばと{会話|かいわ}", "Enam jenis perawatan. Tiap bagian: daftar kosakata dari modul lalu soal Dialog dan Sapaan (会話・声かけ) seperti di ujian.", [
   ("j2s1", "Perawatan untuk Berpindah", "{移動|いどう}の{介護|かいご}", [208, 211], "berpindah", [209, 210, 211]),
   ("j2s2", "Perawatan untuk Makan", "{食事|しょくじ}の{介護|かいご}", [212, 216], "makan", [214, 215, 216]),
   ("j2s3", "Perawatan untuk Ekskresi", "{排泄|はいせつ}の{介護|かいご}", [217, 220], "ekskresi", [218, 219, 220]),
   ("j2s4", "Perawatan untuk Merapikan Diri", "みじたくの{介護|かいご}", [221, 225], "merapikan", [222, 223, 224, 225]),
   ("j2s5", "Perawatan untuk Mandi & Kebersihan Tubuh", "{入浴|にゅうよく}・{清潔保持|せいけつほじ}の{介護|かいご}", [226, 232], "mandi", [227, 228, 229, 230, 231, 232]),
   ("j2s6", "Perawatan untuk Pekerjaan Rumah Tangga", "{家事|かじ}の{介護|かいご}", [233, 238], "rumah", [234, 235, 236, 237, 238]),
 ]),
 ("bab3", "Kalimat (Bacaan Kerja)", "{文章|ぶんしょう}", "Membaca teks pendek di tempat kerja: kondisi pengguna, catatan, cara kerja, pengumuman, menu, rencana acara, jadwal kerja, laporan kecelakaan, dan serah terima.", [
   ("j3s1", "Kosakata untuk Kalimat", "{文章|ぶんしょう}のことば", [240, 241], "kalimat", []),
   ("j3s2", "Kondisi & Catatan Pengguna", "{利用者|りようしゃ}の{状況|じょうきょう}・{記録|きろく}", [242, 247], None, [242, 243, 244, 245, 246, 247]),
   ("j3s3", "Cara Kerja", "{仕事|しごと}のやり{方|かた}", [248, 253], None, [248, 249, 250, 251, 252, 253]),
   ("j3s4", "Pengumuman, Menu & Rencana Acara", "{掲示|けいじ}・{献立|こんだて}・{行事|ぎょうじ}の{計画|けいかく}", [254, 260], None, [254, 255, 256, 257, 258, 259, 260]),
   ("j3s5", "Jadwal Kerja, Laporan Kecelakaan & Serah Terima", "{仕事|しごと}のスケジュール・{事故|じこ}の{報告|ほうこく}・{申|もう}し{送|おく}り", [261, 265], None, [261, 262, 263, 264, 265]),
 ]),
]
CAT = {"tubuh": "Tubuh", "posisi": "Posisi tubuh", "penyakit": "Penyakit & gejala", "berpindah": "Berpindah", "makan": "Makan", "ekskresi": "Ekskresi",
       "merapikan": "Merapikan diri", "mandi": "Mandi & kebersihan", "rumah": "Pekerjaan rumah", "kalimat": "Kalimat"}

# Ringkasan tiap subbab (ditulis untuk Shirose; isi mengikuti modul)
RINGKAS = {
 "j1s1": ("34 kata bagian tubuh. Kata ini dipakai setiap kali melapor kondisi pengguna (misalnya 腰が痛い = pinggang sakit).", ["頭・額・目・耳・鼻・口: bagian kepala.", "患側 (かんそく) = sisi yang sakit/lumpuh; 健側 (けんそく) = sisi yang sehat.", "バイタルサイン = tanda-tanda vital."]),
 "j1s2": ("9 kata posisi tubuh (体位). Wajib hafal untuk perawatan berpindah dan mengganti posisi.", ["仰臥位 = telentang, 側臥位 = miring, 腹臥位 = tengkurap.", "座位 = duduk, 端座位 = duduk di tepi tempat tidur, 立位 = berdiri."]),
 "j1s3": ("25 kata penyakit dan gejala yang sering muncul pada lansia.", ["認知症 = demensia, 誤嚥 = tersedak/salah telan, 褥瘡 = luka tekan (dekubitus).", "Gejala: 熱・咳・吐き気・かゆみ・痛み.", "Laporkan gejala ke perawat (看護職)."]),
 "j2s1": ("Kosakata berpindah (移動) + 3 soal dialog.", ["移乗 = beralih (mis. tempat tidur → kursi roda); 移動 = berpindah.", "杖 = tongkat, 歩行器 = walker, 車いす = kursi roda, 手すり = pegangan.", "Urutan berjalan dengan tongkat: tongkat → kaki yang sakit → kaki yang sehat."]),
 "j2s2": ("Kosakata makan (食事) + 3 soal dialog.", ["誤嚥 (ごえん) = makanan/minuman masuk ke saluran napas; むせる = tersedak.", "Jumlah yang dimakan harus dicatat (記録).", "Tawarkan bantuan dulu; hormati pilihan pengguna."]),
 "j2s3": ("Kosakata ekskresi (排泄) + 3 soal dialog.", ["便座 = dudukan toilet, 呼び出しボタン = tombol panggil.", "Selesai → tekan tombol untuk memberi tahu staf.", "Kulit merah/sakit → laporkan ke perawat."]),
 "j2s4": ("Kosakata merapikan diri (みじたく) + 4 soal dialog.", ["着替える = ganti baju, 歯磨き = gosok gigi, うがい = berkumur.", "Pengguna sendiri yang memilih pakaian.", "Gigi sakit → janji dengan dokter gigi, hubungi perawat."]),
 "j2s5": ("Kosakata mandi & kebersihan (入浴・清潔保持) + 6 soal dialog.", ["Sebelum mandi: tanyakan kondisi badan (体調).", "ぬるい = suam/kurang panas, 熱い = panas.", "Tidak bisa mandi → badan dilap (からだを拭く)."]),
 "j2s6": ("Kosakata pekerjaan rumah (家事) + 5 soal dialog.", ["洗濯物を干す = menjemur, たたむ = melipat.", "換気 = ventilasi/ganti udara.", "Ajak pengguna melakukan hal yang ia bisa."]),
 "j3s1": ("31 kata yang sering muncul di teks kerja (pengumuman, catatan, jadwal).", ["出勤 = masuk kerja, 退勤 = pulang kerja, 巡視 = patroli.", "禁煙 = dilarang merokok, 使用禁止 = dilarang dipakai.", "申し送り = serah terima informasi antarshift."]),
 "j3s2": ("6 teks pendek tentang kondisi pengguna dan catatan (記録).", ["Perhatikan kata waktu: 夜は / いつも / ときどき.", "自立 = mandiri; 介護が必要 = perlu bantuan; 見守り = pengawasan.", "Catatan memakai jam; cocokkan jam dengan kejadiannya."]),
 "j3s3": ("6 teks tentang cara kerja yang benar.", ["Sebelum merawat, selalu 声かけ (menyapa/memberi tahu).", "Kursi roda berhenti → selalu rem.", "Kebakaran: beri tahu sekitar → bel darurat → telepon 119 → evakuasi."]),
 "j3s4": ("7 teks: pengumuman (掲示), menu (献立), dan rencana acara (行事の計画).", ["Baca siapa yang dituju: 面会のみなさまへ / ご家族のみなさまへ.", "Perhatikan tanggal, tempat, dan penanggung jawab (担当者).", "主食 = makanan pokok, 副食 = lauk."]),
 "j3s5": ("5 teks: jadwal kerja (日勤・夜勤), laporan kecelakaan, dan serah terima.", ["日勤 = shift siang, 夜勤 = shift malam.", "Laporan kecelakaan: 日時・場所・内容・原因・対応.", "申し送り: perhatikan jam dan siapa yang menjemput/mengantar."]),
}

# Terjemahan pertanyaan + pembahasan tiap soal modul (kunci halaman → (pertanyaan ID, pembahasan ID))
T_BENAR = "Pilih pernyataan yang benar sesuai isi percakapan."
T_ISI = "Pilih kalimat yang tepat untuk mengisi bagian kosong （　　）."
T_TEKS = "Pilih pernyataan yang benar sesuai isi teks."
BAHAS = {
 209: (T_BENAR, "Sato-san menjawab 杖の方がいいです (lebih baik tongkat), jadi ia berlatih berjalan dengan tongkat. Kondisinya 悪くない (tidak buruk), bukan sangat baik; pegangan hanya dipakai saat menunggu."),
 210: (T_BENAR, "Suzuki-san mencoba bangun pelan-pelan dan staf berkata あ、できましたね (sudah bisa), jadi ia bangun sendiri. Sepatu dibantu staf, dan naik kursi roda sambil berpegangan pada staf."),
 211: (T_ISI, "Staf sudah menjelaskan urutannya: 杖 (tongkat) → 右足 (kaki kanan yang sakit) → 左足. Suzuki-san salah mengulang, jadi staf mengoreksi dengan urutan yang sama."),
 214: (T_BENAR, "Sato-san menolak dibantu (大丈夫です) dan minta sendok: スプーンで食べます. Jadi ia makan sendiri. Ia belum menghabiskan makanan dan tidak menyebut tangan kiri."),
 215: (T_BENAR, "むせることがあります = kadang-kadang tersedak, saat minum teh atau sup miso. Makanan habis semua; yang mencatat jumlah makan adalah staf, bukan Suzuki-san."),
 216: (T_ISI, "Sato-san berkata 温かい紅茶が飲みたいです (ingin teh hitam hangat), jadi staf membawakan teh hitam hangat."),
 218: (T_BENAR, "Ditanya 痛くないですか, Sato-san menjawab 少し痛いです: bokongnya sakit. Ia belum berganti piyama, dan celana diturunkan oleh staf."),
 219: ("Apa yang dilakukan Suzuki-san segera setelah ini?", "Awalnya ia belum mau, tetapi setelah dibujuk ia berkata じゃ、行っておこう (kalau begitu saya pergi dulu) → ke toilet sebelum makan siang."),
 220: (T_ISI, "呼び出しボタン adalah tombol untuk memanggil staf. Staf menunggu di luar, jadi setelah selesai pengguna menekan tombol untuk memberi tahu (知らせてください)."),
 222: (T_BENAR, "Suzuki-san sendiri memilih: その黒いセーターがいいね → hari ini ia memakai sweter hitam. Sweter itu hadiah dari putrinya dan dibawa istrinya kemarin."),
 223: (T_BENAR, "Sato-san meminta 取ってください dan staf menjawab じゃ、取りますね: staf yang mengambil sisa makanan di mulut."),
 224: ("Mengapa Sato-san tidak menggosok gigi?", "Ia berkata 歯が痛いんです (gigi saya sakit). Dokter gigi dan janji temu adalah tindak lanjutnya, bukan alasannya."),
 225: (T_ISI, "Pengguna meminta tolong (取ってください), jadi jawaban yang wajar adalah menerima permintaan: はい、わかりました."),
 227: (T_BENAR, "Setelah staf menawarkan bantuan ganti baju, Sato-san berkata じゃ、入ります → ia akan mandi. Ia tidak merasa tidak enak badan; rumah sakit baru dipesan bila besok masih sakit."),
 228: (T_BENAR, "Staf berkata きのうより赤いですね: punggung lebih merah daripada kemarin. Keluhannya gatal (かゆい), bukan sakit; mandi atau tidak masih ditanyakan ke perawat."),
 229: (T_BENAR, "Staf berkata きょうは、髪をしっかり洗いましょう: hari ini keramas. Batuk terjadi kemarin; hari ini kondisinya baik."),
 230: (T_ISI, "Suzuki-san berkata ぬるい (kurang panas) dan ingin lebih panas, jadi staf menjawab 少し熱くしますね. Setelah itu suhunya pas."),
 231: (T_ISI, "Suzuki-san berkata ちょっと寒いよ (agak dingin), jadi staf menaikkan suhu AC. Menyalakan pendingin atau membuka jendela membuat makin dingin."),
 232: (T_ISI, "Leader meminta: 鈴木さんに体調を聞いてください (tanyakan kondisi ke Suzuki-san). Jadi jawabannya 鈴木さんに確認します."),
 234: (T_BENAR, "Staf mengajak いっしょにおしぼりをたたみませんか dan Sato-san setuju: ia melipat oshibori (handuk kecil). Yang menjemur adalah staf."),
 235: (T_BENAR, "Mereka akan memasak bersama. Sato-san menyebut 野菜の煮物 (sayur rebus berbumbu) dan 焼き魚 (ikan bakar), bukan 魚の煮付け."),
 236: (T_ISI, "Sato-san merasa agak dingin sekarang, jadi ventilasi dilakukan saat ia berada di ruang makan."),
 237: (T_ISI, "Suzuki-san berkata pandai melipat cucian. Staf memanfaatkan kemampuannya: たたみ方を教えてもらえませんか (bisakah ajari cara melipat)."),
 238: (T_ISI, "Meja sudah dilap dan Sato-san senang karena bersih. Staf menyetujui: テーブルがきれいになりましたね."),
 242: ("Pilih yang benar tentang ekskresi Sato-san.", "Teks: 夜はポータブルトイレを使っています (malam memakai toilet portabel). Ia perlu bantuan (tidak mandiri) dan tidak ada inkontinensia."),
 243: (T_TEKS, "入浴は、介護と見守りが必要です: mandi perlu bantuan dan pengawasan → ia mandi dengan dibantu. Ia sudah keluar dari rumah sakit; dada sesak hanya kadang saat mandi."),
 244: ("Pilih yang benar.", "Baris 聞く: 左耳が少し聞こえにくい (telinga kiri agak sulit mendengar). Mata kanan terlihat jelas; yang perlu bersuara keras adalah lawan bicaranya."),
 245: ("Pilih yang benar.", "食事: 自立しています → makan sendiri. Berpindah pakai kursi roda; ekskresi dan mandi perlu sedikit bantuan."),
 246: ("Pilih yang benar.", "Putranya 仕事が忙しい (sibuk bekerja) → ia bekerja. Rumah putri dekat fasilitas dan putri hanya bisa berkunjung Sabtu–Minggu; putra jarang berkunjung."),
 247: (T_TEKS, "Catatan 02:45: 少し嘔吐しました → muntah tengah malam. Makan malam habis; teh 200cc diminum saat makan malam; tanda vital seperti biasa (tidak demam)."),
 248: ("Apa yang paling tepat diucapkan sebelum mendorong kursi roda?", "Teks: sebelum mendorong, sampaikan kepada pengguna bahwa kursi akan didorong → 「車いすを押しますよ」."),
 249: ("Mana yang sama dengan isi teks?", "Teks: saat pengguna naik kursi roda, rem harus dikunci. Rem dan ban diperiksa SEBELUM dipakai; pikirkan keselamatan DAN rasa tenang."),
 250: ("Pilih yang benar.", "Langkah ① saat kebakaran: beri tahu orang sekitar dengan suara keras. Bel darurat ②, telepon 119 ③, evakuasi ④."),
 251: ("Pilih urutan bantuan ekskresi yang sama dengan teks.", "Urutan teks: periksa yang bisa dilakukan pengguna → ke toilet bersama → pastikan duduk aman → jelaskan tombol → keluar dari toilet."),
 252: ("Mana yang sama dengan isi teks?", "Teks: 脱衣室や浴室の温度にも注意 (perhatikan suhu ruang ganti dan kamar mandi). Toilet dilakukan sebelum mandi; jangan mandi langsung setelah makan."),
 253: ("Mana yang sama dengan isi teks?", "食後に口腔ケアをします: setelah makan dilakukan perawatan mulut (berkumur, gosok gigi). Bantu makan sambil duduk; menu dijelaskan sebelum makan; setelah makan duduk ±30 menit."),
 254: ("Pilih yang benar.", "Seluruh fasilitas bebas rokok (termasuk halaman). Ponsel dilarang di dalam gedung dan dipakai di luar gedung → boleh di halaman."),
 255: ("Pilih yang benar.", "Larangan membawa makanan berlaku 1 Juni–31 Agustus, jadi mulai September boleh. Disinfeksi tangan tidak menghapus larangan itu."),
 256: ("Pilih yang benar tentang cara mencuci tangan.", "Langkah ③: 指先をしっかり洗って、きれいにします. Awalnya dibilas air dulu; setelah sabun masih ada langkah mencuci dan membilas sebelum dikeringkan."),
 257: (T_TEKS, "Yang tidak boleh berkunjung adalah orang dengan gejala demam, batuk, atau mual. Musim flu/norovirus sendiri bukan larangan berkunjung."),
 258: ("Lihat tabel menu, lalu pilih yang benar.", "Sup miso (みそ汁) ada setiap hari: 1 Mei malam, 2 Mei pagi, 3 Mei malam. Makanan pokok pagi kadang roti; salad tidak ada setiap hari; buah/yogurt adalah デザート."),
 259: ("Pilih yang benar tentang pesta ulang tahun.", "Persiapan: 歌の練習をします（利用者・職員）→ pengguna dan staf berlatih menyanyi. Acara 13.00–15.30 (bukan makan siang); hadiah hanya untuk yang berulang tahun Desember; meja disusun staf."),
 260: ("Pilih yang benar.", "介護職：家族をホールに案内します → staf kaigo mengantar keluarga ke aula. Acara pukul 13.00 (siang); keluarga juga ikut; pengguna juga diantar staf kaigo."),
 261: (T_TEKS, "17:30 記録 lalu 18:00 退勤: menulis catatan dulu baru pulang. Bantuan makan 11:30; istirahat 13:00 selama 60 menit; bantuan minum dua kali (10:00 dan 16:00)."),
 262: ("Pilih satu nomor yang benar.", "06:00 起床介護（洗面・口腔ケア・着替え）: membantu cuci muka dan gosok gigi. Setelah masuk kerja yang pertama adalah bantuan makan; patroli tiap 2 jam; rapat pagi setelah makan pagi."),
 263: ("Pilih satu nomor yang benar.", "Isi laporan: gigi palsu jatuh ke lantai dan pecah. Saat kejadian Suzuki-san mencuci sendiri; ke depannya staf yang mencuci dan menyimpannya."),
 264: ("Pilih satu nomor yang benar.", "Pengguna yang pulang naik mobil antar-jemput pukul 15.00. Sato-san dijemput keluarga pukul 14.00, jadi Suzuki-san yang pulang dengan mobil pukul 15.00. Yang masuk total 4 orang."),
 265: ("Pilih satu nomor yang benar.", "看護職がいっしょに病院へ行きます: Suzuki-san ke rumah sakit bersama perawat, naik mobil fasilitas pukul 10.30; harus sudah di pintu masuk 10 menit sebelumnya (10.20)."),
}

def build():
    vocab, n = [], 0
    by_sec = {}
    for (pg, sec, kata, kana, arti) in RAW_V:
        by_sec.setdefault(sec, []).append((pg, kata, kana, arti))
    soal = {q["p"]: q for q in RAW_Q}
    assert set(soal) == set(BAHAS), sorted(set(soal) ^ set(BAHAS))
    babs, quiz = [], {"bab": {}, "tema": []}

    def item_soal(q):
        tanya_id, bahas = BAHAS[q["p"]]
        kosong = "の中に" in q["tanya"][:5]
        teks = "\n".join(t.replace(" 。", "（　　　）。").replace("たら 。", "たら（　　　）。") for t in q["teks"])
        tanya = ("（　　）" if kosong else "") + q["tanya"]
        benar = q["opts"][q["a"]]
        gambar = q["p"] >= 242   # bagian Kalimat: teks berupa tabel/pengumuman → tampilkan halaman asli modul (lengkap dengan furigana)
        if gambar: teks = "（{上|うえ}の{文章|ぶんしょう}を{読|よ}んでください）"
        return {"q": {"jp": teks + "\n\n［問題］" + tanya, "id": (teks if not gambar else "(Baca teks pada gambar halaman modul di atas.)") + "\n\n［Soal］" + tanya_id},
                **({"img": {"p": q["p"], "id": [7, 5, 86, 74]}} if gambar else {}),   # potongan halaman modul (tanpa margin), bisa diperbesar
                "opts": [{"jp": o, "id": o} for o in q["opts"]], "a": q["a"],
                "exp": {"id": "Jawaban: %s — %s (Buku hal. %d; kunci jawaban hal. 267.)" % (benar, bahas, q["p"]), "jp": "{正解|せいかい}：%s（テキスト %dページ、{解答|かいとう} 267ページ）" % (benar, q["p"])},
                "ref": {"p": q["p"]}}

    for bi, (bid, tid, tjp, intro, subs) in enumerate(BABS, 1):
        out_subs, bab_words, bab_soal = [], [], []
        for si, (sid, sid_t, sjp_t, pages, sec, halsoal) in enumerate(subs, 1):
            words = []
            for (pg, kata, kana, arti) in by_sec.get(sec, []):
                n += 1; e = vocab_item("kj", n, kata, kana, arti, CAT[sec], bid, [sid]); e["_p"] = pg; vocab.append(e); words.append(e)
            core, points = RINGKAS[sid]
            full_id, full_jp = [], []
            if words:
                full_id += [{"h": "Daftar kosakata (hal. %s)" % ("–".join(str(p) for p in sorted({w["_p"] for w in words})))},
                            {"ul": ["**%s** (%s) = %s" % (w["kata"], w["kana"], w["arti"]) for w in words]}]
                full_jp += [{"h": "ことば"}, {"ul": ["**%s**（%s）＝ %s" % (w["kata"], w["kana"], w["arti"]) for w in words]}]
            if halsoal:
                jenis = "Dialog dan Sapaan (会話・声かけ)" if bid == "bab2" else "Kalimat (文章)"
                full_id += [{"h": "Soal %s" % jenis},
                            {"p": "Modul memuat **%d soal** untuk bagian ini (hal. %d–%d). Soal asli lengkap dengan furigana ada pada gambar halaman di bawah; kerjakan di tombol **Kuis** bab ini. Kunci jawaban resmi ada di hal. 267." % (len(halsoal), halsoal[0], halsoal[-1])},
                            {"note": "Ujian Evaluasi Bahasa Jepang untuk Perawatan Lansia memakai bahasa Jepang. Biasakan membaca teks aslinya, lalu cek pembahasan bahasa Indonesia."}]
                full_jp += [{"h": "もんだい"}, {"p": "この{部分|ぶぶん}の{問題|もんだい}は%d{問|もん}です（%d〜%dページ）。{答|こた}えは267ページ。" % (len(halsoal), halsoal[0], halsoal[-1])}]
            out_subs.append({"id": sid, "no": si, "title": {"id": sid_t, "jp": sjp_t}, "pages": pages,
                             "full": {"id": full_id, "jp": full_jp},
                             "summary": {"id": {"core": core, "points": points, "exam": ["Sumber: modul hal. %d–%d." % (pages[0], pages[1])]}}})
            bab_words += words; bab_soal += [(sid, soal[p]) for p in halsoal]
        qs = []
        if bab_soal:   # bab 2 & 3: tiga kuis bab = soal asli modul dibagi tiga berurutan
            k = -(-len(bab_soal) // 3)
            for i in range(3):
                part = bab_soal[i * k:(i + 1) * k]
                qs.append({"id": "%s-q%d" % (bid, i + 1), "title": {"id": "Soal modul hal. %d–%d" % (part[0][1]["p"], part[-1][1]["p"]), "jp": "テキストの{問題|もんだい}"}, "items": [item_soal(q) for _, q in part]})
        else:          # bab 1: tiga kuis arti kosakata
            for i, (sid, sid_t, *_r) in enumerate(subs):
                ws = [w for w in bab_words if sid in w["src"]]
                qs.append(vocab_quiz("%s-q%d" % (bid, i + 1), {"id": "Arti kosakata: " + sid_t, "jp": "ことばの{意味|いみ}"}, ws, "kj-%s" % sid, n=10, pool=bab_words))
        # kuis per subbab (arti kosakata) untuk subbab yang punya daftar kata, selain bab 1 (sudah jadi kuis bab)
        if bab_soal:
            for (sid, sid_t, *_r) in subs:
                ws = [w for w in bab_words if sid in w["src"]]
                if ws: qs.append(vocab_quiz("%s-q" % sid, {"id": "Arti kosakata: " + sid_t, "jp": "ことばの{意味|いみ}"}, ws, "kj-%s" % sid, n=8, pool=bab_words))
        quiz["bab"][bid] = qs
        babs.append({"schema": 1, "bidang": "kaigo-jp", "source": SOURCE,
                     "markup": "Teks JP memakai {kanji|furigana} untuk ruby. **tebal**.",
                     "bab": {"id": bid, "no": bi, "title": {"id": tid, "jp": tjp}, "intro": {"id": intro, "jp": tjp}, "pages": [subs[0][3][0], subs[-1][3][1]], "subs": out_subs}})
    index = {"slug": "kaigo-jp", "nama": "Kaigo (Bahasa Jepang)", "jp": "介護の日本語", "assets": "kaigo", "book": "id", "pages": {"id": 271}}
    write_pack("kaigo-jp", index, babs, vocab, quiz)
    return vocab

if __name__ == "__main__":
    build()
