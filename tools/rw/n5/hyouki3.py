# -*- coding: utf-8 -*-
# N5 表記 tambahan 2 (H3): kanji salah = bentuk mirip yang bukan kata nyata
H3 = [
 ("[ごご]に あいましょう。","午後",["牛後","午従","干後"],"Mari bertemu sore hari.","午 + 後."),
 ("[まいあさ] ジョギングを します。","毎朝",["母朝","毎期","每朝"],"Tiap pagi jogging.","毎 + 朝."),
 ("[ひがし]に あります。","東",["車","東東","束"],"Ada di timur.","東 (timur)."),
 ("[にし]に ある まちです。","西",["酉","面","要"],"Kota di barat.","西 (barat)."),
 ("[みなみ]の しまです。","南",["雨","両","市"],"Pulau di selatan.","南 (selatan)."),
 ("[きた]に むかいます。","北",["比","兆","化"],"Menuju utara.","北 (utara)."),
 ("[でんわ]を かけます。","電話",["雷話","電語","電舌"],"Menelepon.","電 + 話."),
 ("[えいが]を みます。","映画",["英画","映両","央画"],"Menonton film.","映 + 画."),
 ("[ともだち]の いえ","友達",["友違","反達","支達"],"Rumah teman.","友 + 達."),
 ("[ごはん]を たべます。","御飯",["御飲","卸飯","御飢"],"Makan nasi.","御 + 飯 (juga ご飯)."),
 ("[おかね]が ありません。","お金",["お全","お企","お命"],"Tidak ada uang.","金 (uang/emas)."),
 ("[じかん]が ありません。","時間",["持間","時問","特間"],"Tidak ada waktu.","時 + 間."),
 ("[まいとし]、うみへ いきます。","毎年",["母年","毎午","每年"],"Tiap tahun pergi ke laut.","毎 + 年."),
 ("[ひと]が おおいです。","人",["入","八","仁"],"Banyak orang.","人 (orang)."),
 ("[ふゆ]は さむいです。","冬",["各","条","処"],"Musim dingin dingin.","冬 (musim dingin)."),
 ("[なつ]は あついです。","夏",["憂","変","復"],"Musim panas panas.","夏 (musim panas)."),
]
_d = ("[えいが]","[ごはん]","[ふゆ]","[なつ]")
H3 = [r for r in H3 if not any(r[0].startswith(x) for x in _d)]
H3 = [(r[0], r[1], ["車","束","来"], r[3], r[4]) if r[1] == "東" else r for r in H3]
