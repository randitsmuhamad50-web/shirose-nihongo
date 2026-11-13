# -*- coding: utf-8 -*-
S = [
 ("両者の主張は対立している。（　）、妥協点を探る必要がある。","とはいえ",["したがって","なぜなら","すなわち"],"Pendapat kedua pihak berbenturan. Namun, perlu mencari titik kompromi.","とはいえ = namun begitu."),
 ("この商品は品質がいい。（　）、値段も手ごろだ。","しかも",["ところが","ただし","むしろ"],"Produk ini berkualitas. Lagipula harganya terjangkau.","しかも."),
 ("明日は大事な試験がある。（　）、今夜は早く寝るつもりだ。","したがって",["ところが","ただし","もっとも"],"Besok ada ujian penting. Karena itu malam ini saya berencana tidur cepat.","したがって = karena itu."),
 ("この薬はよく効く。（　）、飲みすぎると副作用が出る。","ただし",["したがって","しかも","なぜなら"],"Obat ini manjur. Hanya saja, jika berlebihan timbul efek samping.","ただし = hanya saja."),
 ("彼は日本の首都、（　）東京に住んでいる。","すなわち",["ところで","ただし","ところが"],"Dia tinggal di ibu kota Jepang, yaitu Tokyo.","すなわち = yaitu."),
 ("遅刻した。（　）、電車が止まっていたからだ。","なぜなら",["したがって","しかも","そのうえ"],"Saya terlambat. Sebabnya, kereta berhenti.","なぜなら = sebabnya."),
 ("天気予報では雨だった。（　）、実際は一日中晴れた。","ところが",["したがって","すなわち","なぜなら"],"Menurut ramalan akan hujan. Tetapi nyatanya cerah seharian.","ところが."),
 ("今日の会議はこれで終わります。（　）、来週の予定をお知らせします。","なお",["すなわち","したがって","つまり"],"Rapat hari ini selesai. Selain itu, saya informasikan jadwal pekan depan.","なお = selain itu / sebagai tambahan."),
 ("彼は子どもに甘い。（　）、妻はとてもきびしい。","一方",["したがって","つまり","すなわち"],"Dia lembut pada anak-anak. Sebaliknya istrinya sangat tegas.","一方 = sebaliknya."),
 ("A社は新製品を発表した。（　）、B社は価格を下げた。","これに対して",["したがって","なぜなら","すなわち"],"Perusahaan A merilis produk baru. Sebagai tanggapan, B menurunkan harga.","これに対して."),
 ("遅れて申し訳ありません。（　）、交通事故があったのです。","実は",["したがって","つまり","ただし"],"Maaf terlambat. Sebenarnya ada kecelakaan lalu lintas.","実は."),
 ("結婚するかどうか、（　）、まだ決めていない。","つまり",["したがって","ところが","しかも"],"Mau menikah atau tidak, singkatnya, belum saya putuskan.","つまり."),
 ("彼は一生懸命働いた。（　）、成功できなかった。","それでも",["したがって","なぜなら","すなわち"],"Dia bekerja keras. Meski begitu tidak berhasil.","それでも."),
 ("体の調子が悪い。（　）、今日は休むことにした。","そこで",["ところが","ただし","しかも"],"Badan kurang sehat. Maka dari itu saya memutuskan libur hari ini.","そこで."),
 ("この店は安い。（　）、おいしい。（　）、店員も親切だ。","そのうえ",["ところが","したがって","つまり"],"Toko ini murah. Selain itu enak. Pelayannya pun ramah.","そのうえ."),
 ("日本語の勉強は大変だ。（　）、続けていれば必ず上達する。","しかし",["したがって","なぜなら","すなわち"],"Belajar bahasa Jepang berat. Tetapi jika terus dilakukan pasti maju.","しかし."),
 ("彼は医者だ。（　）、薬のことはよく知っている。","だから",["ところが","しかし","ただし"],"Dia dokter. Jadi tahu banyak soal obat.","だから."),
 ("機械が故障した。（　）、作業は中止になった。","そのため",["ところが","しかし","ただし"],"Mesin rusak. Karena itu pekerjaan dihentikan.","そのため."),
 ("ご飯を食べますか。（　）、パンにしますか。","それとも",["それに","しかも","なお"],"Mau nasi? Atau roti?","それとも."),
 ("この計画は費用がかかりすぎる。（　）、実行するのは難しい。","したがって",["ところが","ただし","しかし"],"Rencana ini terlalu mahal. Karena itu sulit dilaksanakan.","したがって."),
]
S = [r for r in S if len(r[2])==3 and r[1] not in r[2]]
S = [r for r in S if "そのうえ" not in r[1]]
_x=[r for r in S if "結婚するかどうか" not in r[0]]
S=_x
