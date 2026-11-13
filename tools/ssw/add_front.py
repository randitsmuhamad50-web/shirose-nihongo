# -*- coding: utf-8 -*-
"""Tambah subbab pengantar (hal. 1-7) & perluas rentang halaman sampul bab/penutup. Idempoten."""
import json, os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "ssw", "building-cleaning"))
def ld(n): return json.load(open(os.path.join(R, n), encoding="utf-8"))
def sv(n, d): json.dump(d, open(os.path.join(R, n), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

S7 = {"id": "b1s7", "title": {"id": "Kisah Mai: Hari Pertama Bekerja", "jp": "マイさんの{初出社|はつしゅっしゃ}"}, "pages": [0, 4],
 "full": {"id": [
  {"h": "Sampul buku"},
  {"p": "Buku ini adalah **Buku Panduan Pelajar Ujian TOKUTEI GINOU (Keterampilan Khusus) bidang Building Cleaning (ビルクリーニング)**, disusun oleh Japan Building Maintenance Association (JBMA). Dua halaman pertama adalah sampul dan halaman judul."},
  {"h": "Cerita pembuka: hari pertama masuk kerja"},
  {"p": "Buku dibuka dengan komik. **Mai**, pekerja baru dari luar negeri, berangkat di hari pertamanya dengan semangat: \"Hari ini hari pertama masuk kerja! Harus semangat!\" Ia disapa seniornya, **Kak Kei**: \"Selamat siang, Mai. Bagaimana Jepang?\""},
  {"ol": ["Sejak kecil Mai menyukai manga dan anime, jadi ia selalu mengagumi Jepang.", "Mai **lulus ujian penilaian TOKUTEI GINOU**.", "Setelah lulus, Mai **mendapat visa TOKUTEI GINOU** sehingga bisa bekerja di Jepang.", "Mai bersyukur bisa lulus dan sekarang mulai bekerja."]},
  {"note": "Alur ke Jepang: Ujian Penilaian TOKUTEI GINOU → LULUS → dapat Visa TOKUTEI GINOU → mulai bekerja."},
  {"h": "Kesan pertama Mai: gedung di Jepang sangat bersih"},
  {"p": "Mai kaget karena gedung-gedung di Jepang sangat bersih, misalnya di **pintu masuk, fasilitas umum, dan toilet**. Kak Kei menjelaskan bahwa pekerjaan Mai mulai sekarang adalah **menghasilkan kebersihan itu**."},
  {"h": "Tiga makna pekerjaan Cleaning Service"},
  {"ol": ["**Menghilangkan sampah dan kotoran** dengan melakukan pembersihan.", "**Menjaga kebersihan** (キレイの維持): tetap bersih dan nyaman.", "**Pemeliharaan Bangunan**: melakukan tindakan pencegahan, misalnya memakai **WAX**, bisa memperpanjang umur bangunan (menjaga bahan bangunan).", "**Menjaga Keamanan**: dengan Cleaning Service kita melindungi orang-orang dari hama dan penyakit."]},
  {"p": "Mai bertekad: \"Kami akan berjuang membersihkan seperti ini supaya orang-orang bisa hidup nyaman dan bahagia!\" Kak Kei menjawab, \"Benar! Kami akan berjuang untuk membuat semua orang bahagia!\""}],
 "jp": [
  {"h": "{表紙|ひょうし}"},
  {"p": "この{本|ほん}は、{日本|にほん}ビルメンテナンス{協会|きょうかい}（JBMA）が{作|つく}った**{特定技能|とくていぎのう}{評価試験|ひょうかしけん}ビルクリーニング{学習|がくしゅう}テキスト**です。{最初|さいしょ}の２ページは{表紙|ひょうし}とタイトルページです。"},
  {"h": "はじめのマンガ：{初出社|はつしゅっしゃ}の{日|ひ}"},
  {"p": "{新|あたら}しく{働|はたら}く**マイ**さんが「{今日|きょう}から{初出社|はつしゅっしゃ}！お{仕事|しごと}{頑張|がんば}るぞ!!」と{元気|げんき}に{出|で}かけます。{先輩|せんぱい}の**ケイ**さんが「こんにちは、マイさん。{日本|にほん}はどう？」と{声|こえ}をかけます。"},
  {"ol": ["{子供|こども}の{頃|ころ}からマンガやアニメが{好|す}きで、{日本|にほん}に{憧|あこが}れていました。", "**{特定技能|とくていぎのう}{評価試験|ひょうかしけん}に{合格|ごうかく}**しました。", "{合格|ごうかく}して、**{特定技能|とくていぎのう}ビザを{取得|しゅとく}**しました。", "{合格|ごうかく}できて{感謝|かんしゃ}しています。これから{働|はたら}きます。"]},
  {"note": "{流|なが}れ：{特定技能|とくていぎのう}{評価試験|ひょうかしけん} → {合格|ごうかく} → {特定技能|とくていぎのう}ビザ{取得|しゅとく} → {就労|しゅうろう}"},
  {"h": "マイさんの{第一印象|だいいちいんしょう}：{日本|にほん}のビルはとても{綺麗|きれい}"},
  {"p": "マイさんは{日本|にほん}のビルがとても**{綺麗|きれい}**なのに{驚|おどろ}きました。{入口|いりぐち}、{公共施設|こうきょうしせつ}、トイレなどです。ケイさんは「マイさんの{仕事|しごと}は、その{綺麗|きれい}を{作|つく}ることです」と{説明|せつめい}します。"},
  {"h": "ビルクリーニングの{仕事|しごと}の３つの{意味|いみ}"},
  {"ol": ["**ごみや{汚|よご}れを{取|と}り{除|のぞ}く**：{清掃|せいそう}をして{綺麗|きれい}にする。", "**キレイの{維持|いじ}**：きれいな{状態|じょうたい}を{保|たも}つ。", "**{建材|けんざい}の{維持|いじ}**：ワックスなどで{予防|よぼう}して、ビルを{長持|ながも}ちさせる。", "**{安全性|あんぜんせい}の{維持|いじ}**：{害虫|がいちゅう}や{病気|びょうき}から{人々|ひとびと}を{守|まも}る。"]},
  {"p": "マイさん「こうして{掃除|そうじ}をして、みんなが{快適|かいてき}に{暮|く}らせるようにがんばります！」ケイさん「そうだね！みんなを{幸|しあわ}せにしよう！」"}]},
 "summary": {"id": {"core": "Cleaning Service = menghilangkan kotoran, menjaga kebersihan, memelihara bangunan, dan menjaga keamanan orang.", "points": ["Mai lulus ujian TOKUTEI GINOU lalu mendapat visa TOKUTEI GINOU.", "Kerja pembersihan menghasilkan gedung yang bersih dan nyaman.", "WAX melindungi bahan bangunan dan memperpanjang umur gedung.", "Cleaning Service melindungi orang dari hama dan penyakit."], "avoid": ["Menganggap membersihkan hanya soal tampilan."], "exam": ["4 makna: hilangkan kotoran, jaga kebersihan, jaga bahan bangunan, jaga keamanan."]},
  "jp": {"core": "ビルクリーニングは、{汚|よご}れを{取|と}り、{綺麗|きれい}を{保|たも}ち、{建材|けんざい}と{安全|あんぜん}を{守|まも}る{仕事|しごと}。", "points": ["{試験|しけん}に{合格|ごうかく}して{特定技能|とくていぎのう}ビザを{取得|しゅとく}。", "{掃除|そうじ}でビルが{綺麗|きれい}で{快適|かいてき}になる。", "ワックスは{建材|けんざい}を{守|まも}り、ビルを{長持|ながも}ちさせる。", "{害虫|がいちゅう}や{病気|びょうき}から{人|ひと}を{守|まも}る。"], "avoid": ["{見|み}た{目|め}だけの{仕事|しごと}だと{思|おも}うこと"], "exam": ["{意味|いみ}：{汚|よご}れ{除去|じょきょ}・キレイの{維持|いじ}・{建材|けんざい}の{維持|いじ}・{安全性|あんぜんせい}の{維持|いじ}"]}}}

S8 = {"id": "b1s8", "title": {"id": "Perkenalan JBMA, ASCF dan Kualifikasi", "jp": "JBMA・ASCFの{紹介|しょうかい}と{資格|しかく}"}, "pages": [5, 5],
 "full": {"id": [
  {"h": "Ujian Penilaian TOKUTEI GINOU: Japan Building Maintenance Association (JBMA)"},
  {"p": "JBMA adalah organisasi masyarakat yang menjawab harapan masyarakat untuk **menjaga lingkungan gedung yang nyaman**. Didirikan pada tahun **1996**, JBMA terus memenuhi tuntutan zaman terhadap perusahaan **Building Maintenance** dan **Cleaning Service**. JBMA juga **menyelenggarakan ujian TOKUTEI GINOU** untuk sertifikasi keterampilan khusus bidang pembersihan gedung."},
  {"ul": ["Homepage JBMA: https://www.j-bma.or.jp/", "Email: info@j-bma.or.jp"]},
  {"h": "Acceptance Support Center for Foreign talent (ASCF)"},
  {"p": "ASCF adalah organisasi yang menjawab permintaan JBMA untuk **mendukung industri Cleaning Service dalam perekrutan dan pelatihan tenaga kerja asing** agar berjalan baik."},
  {"ul": ["Homepage ASCF: https://ascf.jp/", "Email: support@ascf.jp"]},
  {"h": "Kualifikasi mengenai Cleaning Service"},
  {"p": "Di Jepang diadakan pelatihan dan ujian untuk mendidik Cleaning Service profesional. Untuk mendapat **sertifikasi keterampilan yang diakui negara**, setiap tahun ribuan orang mengikuti ujian tersebut."},
  {"note": "Ujian TOKUTEI GINOU Cleaning Service No. 1 membutuhkan pengetahuan dan keterampilan setara dengan **level 3** pada kualifikasi pembuktian keterampilan (ujian keterampilan nasional)."}],
 "jp": [
  {"h": "{特定技能評価試験|とくていぎのうひょうかしけん}：{日本|にほん}ビルメンテナンス{協会|きょうかい}（JBMA）"},
  {"p": "JBMAは、{快適|かいてき}な**ビルの{環境|かんきょう}を{守|まも}る**という{社会|しゃかい}の{期待|きたい}に{応|こた}える{団体|だんたい}です。**1996{年|ねん}**に{設立|せつりつ}され、ビルメンテナンスやクリーニングの{会社|かいしゃ}に{求|もと}められることに{応|こた}えてきました。ビルクリーニング{分野|ぶんや}の**{特定技能|とくていぎのう}{試験|しけん}を{実施|じっし}**しています。"},
  {"ul": ["ホームページ：https://www.j-bma.or.jp/", "メール：info@j-bma.or.jp"]},
  {"h": "ASCF（{外国人材|がいこくじんざい}{受入|うけい}れサポートセンター）"},
  {"p": "ASCFは、JBMAの{依頼|いらい}に{応|こた}え、クリーニング{業界|ぎょうかい}の**{外国人材|がいこくじんざい}の{採用|さいよう}と{教育|きょういく}を{支援|しえん}**する{団体|だんたい}です。"},
  {"ul": ["ホームページ：https://ascf.jp/", "メール：support@ascf.jp"]},
  {"h": "クリーニングに{関|かん}する{資格|しかく}"},
  {"p": "{日本|にほん}では、プロのクリーニング{技能者|ぎのうしゃ}を{育|そだ}てる{講習|こうしゅう}と{試験|しけん}があります。{国|くに}が{認|みと}める**{技能|ぎのう}{検定|けんてい}**を{受|う}ける{人|ひと}は{毎年|まいとし}{数千人|すうせんにん}います。"},
  {"note": "{特定技能|とくていぎのう}１{号|ごう}ビルクリーニングの{試験|しけん}は、{技能検定|ぎのうけんてい}**３{級|きゅう}**と{同|おな}じレベルの{知識|ちしき}と{技能|ぎのう}が{必要|ひつよう}です。"}]},
 "summary": {"id": {"core": "JBMA menyelenggarakan ujian; ASCF mendukung perekrutan & pelatihan tenaga kerja asing.", "points": ["JBMA didirikan tahun 1996.", "JBMA menyelenggarakan ujian TOKUTEI GINOU Building Cleaning.", "ASCF mendukung perekrutan dan pelatihan tenaga asing.", "Ujian setara level 3 keterampilan nasional."], "avoid": ["Mengira ASCF yang menyelenggarakan ujian."], "exam": ["JBMA = penyelenggara ujian, berdiri 1996."]},
  "jp": {"core": "JBMAは{試験|しけん}を{実施|じっし}、ASCFは{外国人材|がいこくじんざい}の{採用|さいよう}・{教育|きょういく}を{支援|しえん}。", "points": ["JBMAは1996{年|ねん}に{設立|せつりつ}。", "JBMAが{特定技能|とくていぎのう}{試験|しけん}を{実施|じっし}。", "ASCFは{採用|さいよう}と{教育|きょういく}を{支援|しえん}。", "{試験|しけん}は{技能検定|ぎのうけんてい}３{級|きゅう}レベル。"], "avoid": ["ASCFが{試験|しけん}をすると{思|おも}うこと"], "exam": ["JBMA＝{試験|しけん}の{実施団体|じっしだんたい}（1996{年|ねん}）"]}}}

S9 = {"id": "b1s9", "title": {"id": "Daftar Isi dan Cara Memakai Buku", "jp": "{目次|もくじ}"}, "pages": [6, 6],
 "full": {"id": [
  {"h": "Daftar Isi (目次)"},
  {"p": "Buku terdiri dari pengenalan ujian dan **tiga bab**. Gunakan daftar ini untuk menemukan materi."},
  {"h": "BAB 1 Cleaning Service"},
  {"ul": ["Mulai Bekerja, Istirahat, Selesai Bekerja", "Tata Tertib", "Pembersihan Harian dan Pembersihan Berkala", "5 Prinsip Cleaning Service", "Istilah Salam Sapa", "Peraturan di Tempat Kerja"]},
  {"h": "BAB 2 Pembersihan Harian"},
  {"ul": ["Peralatan yang Dibawa, Penjaminan Keamanan", "Jenis dan Ukuran Kotoran (Debu)", "Sapu dan Pengki (Serokan), Dust Cloth (Lap Debu), Lap", "Penyedot Debu, Penyedot Debu Tipe Upright", "Lap Pembersih (Horizontal dan Vertikal)", "Pembersihan Toilet: tempat sampah dan pengisian ulang, wastafel, urinoir, kloset/WC, lantai", "Pengolahan Limbah, Mengenai Kontrol Kebersihan, Prosedur Keamanan dan Kebersihan Bekerja"]},
  {"h": "BAB 3 Pembersihan Berkala"},
  {"ul": ["Pembersihan Lantai (material lantai, kotoran, karbol/deterjen, cara membersihkan)", "Polisher", "Pembersihan Kaca", "Daftar Perlengkapan Cleaning Service"]},
  {"note": "Di aplikasi ini subbab pengantar (1.1–1.3) memuat halaman 1–7, lalu bab 1–3 mengikuti urutan buku."}],
 "jp": [
  {"h": "{目次|もくじ}"},
  {"p": "この{本|ほん}は{試験|しけん}の{説明|せつめい}と**３つの{章|しょう}**でできています。{目次|もくじ}で{内容|ないよう}を{探|さが}しましょう。"},
  {"h": "{第|だい}１{章|しょう} ビルクリーニング"},
  {"ul": ["{出勤|しゅっきん}・{休憩|きゅうけい}・{退勤|たいきん}について", "ルール", "{日常清掃|にちじょうせいそう}と{定期清掃|ていきせいそう}", "ビルクリーニングの５{原則|げんそく}", "あいさつの{言葉|ことば}", "{職場|しょくば}でのルール"]},
  {"h": "{第|だい}２{章|しょう} {日常清掃|にちじょうせいそう}"},
  {"ul": ["{持|も}ち{物|もの}・{安全|あんぜん}の{確保|かくほ}", "{汚|よご}れ（ほこり）の{種類|しゅるい}と{大|おお}きさ", "ほうきとちりとり、ダストクロス、{雑巾|ぞうきん}", "{掃除機|そうじき}、アップライト{型|がた}{掃除機|そうじき}", "{水拭|みずぶ}き（{水平|すいへい}・{垂直|すいちょく}）", "トイレ{清掃|せいそう}：ごみ{箱|ばこ}・{補充|ほじゅう}、{洗面台|せんめんだい}、{小便器|しょうべんき}、{便器|べんき}、{床|ゆか}", "{廃棄物|はいきぶつ}の{処理|しょり}、{衛生管理|えいせいかんり}、{作業|さぎょう}の{安全|あんぜん}と{衛生|えいせい}の{手順|てじゅん}"]},
  {"h": "{第|だい}３{章|しょう} {定期清掃|ていきせいそう}"},
  {"ul": ["{床|ゆか}の{清掃|せいそう}（{床材|ゆかざい}・{汚|よご}れ・{洗剤|せんざい}・{方法|ほうほう}）", "ポリッシャー", "{窓|まど}ガラスの{清掃|せいそう}", "ビルクリーニングで{使|つか}う{機械|きかい}・{道具|どうぐ}の{一覧|いちらん}"]},
  {"note": "このアプリでは、はじめの７ページを１.１〜１.３にまとめ、そのあと{第|だい}１〜３{章|しょう}が{本|ほん}の{順番|じゅんばん}で{続|つづ}きます。"}]},
 "summary": {"id": {"core": "Buku = pengenalan ujian + BAB 1 (dasar), BAB 2 (harian), BAB 3 (berkala).", "points": ["BAB 1: aturan kerja dan sikap.", "BAB 2: pembersihan harian dan toilet.", "BAB 3: pembersihan berkala (lantai, karpet, kaca, mesin)."], "avoid": [], "exam": ["Bedakan pembersihan harian (BAB 2) dan berkala (BAB 3)."]},
  "jp": {"core": "{第|だい}１{章|しょう}＝{基本|きほん}、{第|だい}２{章|しょう}＝{日常|にちじょう}、{第|だい}３{章|しょう}＝{定期|てい}{清掃|せいそう}。", "points": ["１{章|しょう}：ルールと{態度|たいど}", "２{章|しょう}：{日常清掃|にちじょうせいそう}とトイレ", "３{章|しょう}：{床|ゆか}・カーペット・{窓|まど}・{機械|きかい}"], "avoid": [], "exam": ["{日常清掃|にちじょうせいそう}と{定期清掃|ていきせいそう}の{違|ちが}い"]}}}

NOTE = {
 "b1s1": ("Halaman 8: sampul BAB 1 \"Cleaning Service\" (ビルクリーニング) yang membuka bab dasar kerja.", "８ページ：{第|だい}１{章|しょう}「ビルクリーニング」の{扉|とびら}ページ。", [7, 9]),
 "b2s1": ("Halaman 16: sampul BAB 2 \"Pembersihan Harian\" (日常清掃) yang membuka bab pembersihan harian.", "16ページ：{第|だい}２{章|しょう}「{日常清掃|にちじょうせいそう}」の{扉|とびら}ページ。", [15, 17]),
 "b3s1": ("Halaman 62: sampul BAB 3 \"Pembersihan Berkala\" (定期清掃) yang membuka bab pembersihan berkala.", "62ページ：{第|だい}３{章|しょう}「{定期清掃|ていきせいそう}」の{扉|とびら}ページ。", [61, 62]),
 "b3s12": ("Halaman 83–85: halaman penutup buku dan keterangan penerbit (JBMA).", "83〜85ページ：{本|ほん}の{最後|さいご}のページと{発行|はっこう}{情報|じょうほう}（JBMA）。", [81, 84]),
}
def main():
    ix = ld("index.json")
    b1 = ld("bab1.json"); subs = b1["bab"]["subs"]
    if not any(s["id"] == "b1s7" for s in subs):
        subs[0:0] = [S7, S8, S9]
    for i, s in enumerate(subs): s["no"] = i + 1
    b1["bab"]["pages"] = [0, 14]
    b1["bab"]["intro"]["id"] = "Pengenalan buku (kisah Mai, JBMA, daftar isi) lalu dunia kerja Cleaning Service: aturan mulai/istirahat/selesai kerja, tata krama, jenis pembersihan, 5 prinsip, salam, dan peraturan tempat kerja."
    b1["bab"]["intro"]["jp"] = "{本|ほん}の{紹介|しょうかい}（マイさんの{物語|ものがたり}・JBMA・{目次|もくじ}）と、ビルクリーニングの{仕事|しごと}の{基本|きほん}。"
    for fn, bid in (("bab1.json", None), ("bab2.json", "b2s1"), ("bab3.json", "b3s1")): pass
    sv("bab1.json", b1)
    import glob
    SRC = os.path.join(os.path.dirname(__file__), "src")
    targets = [(R + "/bab1.json", None)] + [(f, "src") for f in glob.glob(SRC + "/bab[23]/*.json")]
    for fn, kind in targets:
        d = json.load(open(fn, encoding="utf-8"))
        subs_ = d["bab"]["subs"] if kind is None else [d]
        ch = False
        for s in subs_:
            if s["id"] in NOTE:
                ni, nj, pg = NOTE[s["id"]]
                s["pages"] = pg; ch = True
                for lang, txt in (("id", ni), ("jp", nj)):
                    blk = s["full"][lang]
                    if not any(isinstance(b, dict) and b.get("note") == txt for b in blk): blk.insert(0, {"note": txt})
        if ch: json.dump(d, open(fn, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
main()
print("ok")
