# -*- coding: utf-8 -*-
S2 = [
 ("きのうは 一日じゅう 雨でした。（　　　）、どこへも 行きませんでした。","それで",["しかし","でも","ところが"],"Kemarin hujan seharian. Karena itu saya tidak ke mana-mana.","それで."),
 ("私は 野菜が すきです。（　　　）、肉も 好きです。","また",["しかし","ですから","けれども"],"Saya suka sayur. Juga suka daging.","また."),
 ("この 店は 安いです。（　　　）、料理も おいしいです。","それに",["しかし","でも","ところが"],"Toko ini murah. Selain itu masakannya enak.","それに."),
 ("駅まで 走りました。（　　　）、電車に 間に 合いませんでした。","でも",["それで","だから","それに"],"Saya lari ke stasiun. Tapi tidak sempat naik kereta.","でも."),
 ("テストは 来週です。（　　　）、毎日 勉強して います。","ですから",["しかし","けれども","ところが"],"Ujian minggu depan. Karena itu saya belajar tiap hari.","ですから."),
 ("私は 毎朝 走ります。（　　　）、体の 調子が いいです。","そのため",["しかし","ところが","それとも"],"Saya lari tiap pagi. Karena itu kondisi tubuh baik.","そのため."),
 ("コーヒーに しますか。（　　　）、お茶に しますか。","それとも",["それで","ですから","また"],"Mau kopi? Atau teh?","それとも."),
 ("今日は 休みです。（　　　）、天気が 悪いので、家に います。","でも",["それに","だから","また"],"Hari ini libur. Tapi cuaca buruk jadi di rumah.","でも."),
 ("朝 ごはんを 食べました。（　　　）、歯を 磨きました。","それから",["しかし","でも","ところが"],"Saya sarapan. Lalu menyikat gigi.","それから."),
 ("日本語は 難しいです。（　　　）、とても おもしろいです。","けれども",["それで","ですから","だから"],"Bahasa Jepang sulit. Tetapi sangat menarik.","けれども."),
]
S2 = [r for r in S2 if len(r[2])==3 and r[1] not in r[2]]
