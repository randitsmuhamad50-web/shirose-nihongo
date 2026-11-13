# -*- coding: utf-8 -*-
M2 = [
 ("この 町は 昔から 農業が（　　　）です。","盛ん",["豊か","重要","大切な"],"Kota ini sejak dulu pertaniannya maju.","盛ん = maju/pesat."),
 ("彼女は 人前で 話すのが（　　　）で、いつも 緊張して います。","苦手",["上手","得意","得"],"Dia tidak pandai bicara di depan orang, selalu tegang.","苦手."),
 ("先生の（　　　）を 聞いて、みんな 驚きました。","発表",["発見","発明","発達"],"Mendengar pengumuman guru, semua terkejut.","発表."),
 ("日本は 地震が 多いので、（　　　）の 準備が 大切です。","防災",["防犯","予防","防止者"],"Karena gempa banyak, persiapan penanggulangan bencana penting.","防災."),
 ("この 仕事は 一人では 無理なので、（　　　）を お願いします。","協力",["協会","協定","協議"],"Pekerjaan ini mustahil sendirian, mohon kerja samanya.","協力."),
 ("暑い 日は 水分を（　　　）とる ことが 大切です。","こまめに",["さっさと","ぐんぐん","ばったり"],"Saat panas, penting minum cairan sedikit-sedikit tapi sering.","こまめに."),
 ("彼は 一度 決めたら、（　　　）自分の 意見を 変えません。","決して",["たいてい","おそらく","いっそ"],"Begitu memutuskan, dia tak pernah mengubah pendapat.","決して〜ない."),
 ("彼女は 仕事も 家事も（　　　）こなしている。","てきぱきと",["のろのろと","うろうろと","ぶらぶらと"],"Dia menyelesaikan pekerjaan dan urusan rumah dengan cekatan.","てきぱき."),
 ("新しい 仕事に（　　　）まで、少し 時間が かかりました。","慣れる",["飽きる","疲れる","治る"],"Butuh waktu sampai terbiasa dengan pekerjaan baru.","慣れる."),
 ("この 荷物を 明日までに 届けて いただけると（　　　）ます。","助かり",["喜び","助け","楽しみ"],"Kalau barang ini bisa diantar besok, sangat membantu.","助かる."),
 ("あの 店は 人気が あって、いつも 客で（　　　）います。","にぎわって",["さびれて","はなれて","うすれて"],"Toko itu populer, selalu ramai pelanggan.","にぎわう."),
 ("母は 私の 将来を とても（　　　）して います。","心配",["注意","用心","心得"],"Ibu sangat mengkhawatirkan masa depan saya.","心配."),
 ("駅前で（　　　）を もらいました。","チラシ",["ポスター","カタログ者","レシート者"],"Di depan stasiun saya diberi selebaran.","チラシ."),
 ("彼の 説明は 長すぎて、（　　　）が よく 分からない。","要点",["要求","重要","必要"],"Penjelasannya terlalu panjang sehingga intinya tidak jelas.","要点."),
 ("雨が 続いて、野菜の 値段が（　　　）しました。","上昇",["上達","上演","上映"],"Hujan berlanjut dan harga sayur naik.","上昇する."),
 ("この 道は 夜は（　　　）、一人で 歩かない ほうが いいです。","物騒で",["優雅で","正直で","安全で"],"Jalan ini berbahaya di malam hari, sebaiknya jangan jalan sendiri.","物騒."),
 ("彼は 大事な 約束を（　　　）して、先生に しかられた。","うっかり忘れ",["こっそり忘れ","のんびり忘れ","じっくり忘れ"],"(abaikan)","(abaikan)"),
 ("会議の 日程を（　　　）してから、みんなに 連絡します。","調整",["調査","調理","調味"],"Setelah mengatur jadwal rapat, saya hubungi semua orang.","調整."),
 ("ストレスが（　　　）と、体の 調子が 悪く なります。","たまる",["ふえる","のこる","もてる"],"Kalau stres menumpuk, kondisi tubuh memburuk.","ストレスがたまる."),
]
def _ok(r):
    if r[3]=="(abaikan)": return False
    if any(w.endswith(("者","人")) for w in r[2]): return False
    return len(r[2])==3 and r[1] not in r[2]
M2 = [r for r in M2 if _ok(r)]
