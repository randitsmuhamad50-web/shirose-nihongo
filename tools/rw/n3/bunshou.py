# -*- coding: utf-8 -*-
# N3 文章の文法: (kalimat/kalimat berurutan dgn （　　　）, benar, [3 salah], terjemahan, aturan)
S = [
 ("先週、友だちと 京都へ 行きました。お寺を 見たり、おいしい 物を 食べたり しました。（　　　）、雨が ふって いたので、少し 残念でした。", "でも", ["だから", "それに", "つまり"], "Minggu lalu saya ke Kyoto dengan teman. Kami melihat kuil dan makan enak. Tetapi karena hujan, agak disayangkan.", "でも = tetapi (kontras)."),
 ("わたしは 毎朝 ジョギングを して います。（　　　）、体の 調子が とても いいです。", "そのおかげで", ["それなのに", "ところが", "または"], "Saya jogging tiap pagi. Berkat itu, kondisi badan sangat baik.", "そのおかげで = berkat itu."),
 ("このごろ、スマホを 使って 買い物を する 人が ふえて います。（　　　）、お店に 行く 人は へって います。", "その 一方で", ["そのために ほしい", "たとえば", "ところで"], "Belakangan makin banyak orang belanja lewat ponsel. Di sisi lain, yang datang ke toko berkurang.", "その一方で = di sisi lain."),
 ("日本語を 話す 機会が 少ないです。（　　　）、毎日 ニュースを 聞いて います。", "そこで", ["しかし", "ところが", "または"], "Kesempatan bicara bahasa Jepang sedikit. Maka dari itu saya dengar berita tiap hari.", "そこで = maka dari itu (tindakan)."),
 ("朝ごはんは 大切です。（　　　）、食べない 人も 多いです。", "ところが", ["だから", "そこで", "つまり"], "Sarapan itu penting. Namun banyak juga yang tidak sarapan.", "ところが = namun."),
 ("駅から 家まで 歩いて 三十分 かかります。（　　　）、自転車を 買いました。", "それで", ["ところが", "しかし", "または"], "Dari stasiun ke rumah jalan kaki 30 menit. Karena itu, saya beli sepeda.", "それで = karena itu."),
 ("コーヒーに しますか。（　　　）、紅茶に しますか。", "それとも", ["それに", "だから", "そして"], "Mau kopi? Atau teh?", "それとも = atau (pilihan)."),
 ("この 店は 安いです。（　　　）、おいしいです。", "しかも", ["しかし", "それとも", "ところが"], "Toko ini murah. Lagipula enak.", "しかも = lagipula."),
 ("昨日は 雨でした。（　　　）、今日は いい 天気です。", "でも", ["だから", "それで", "つまり"], "Kemarin hujan. Tapi hari ini cerah.", "でも."),
 ("日本では 春に 桜が さきます。（　　　）、多くの 人が お花見を します。", "そのため", ["ところが", "それとも", "しかし"], "Di Jepang sakura mekar saat musim semi. Karena itu banyak orang hanami.", "そのため = karena itu."),
 ("かれは まじめです。（　　　）、とても 親切です。", "それに", ["しかし", "ところが", "それとも"], "Dia rajin. Selain itu, sangat baik hati.", "それに = selain itu."),
 ("電車が おくれました。（　　　）、会議に まにあいませんでした。", "そのため", ["しかし", "それとも", "ところで"], "Kereta terlambat. Karena itu tidak sempat ikut rapat.", "そのため."),
 ("ご飯を 食べました。（　　　）、すぐに ねて しまいました。", "そして", ["しかし", "それとも", "ところが"], "Makan nasi. Lalu langsung tertidur.", "そして."),
 ("先生に 聞きました。（　　　）、よく わかりませんでした。", "しかし", ["そのため", "それで", "そして"], "Saya bertanya pada guru. Tetapi tetap kurang paham.", "しかし."),
 ("日本語の 勉強は 大変です。（　　　）、やめようと 思った ことは ありません。", "でも", ["だから", "そのため", "それで"], "Belajar bahasa Jepang berat. Tapi saya tak pernah berpikir berhenti.", "でも."),
 ("スポーツは 好きです。（　　　）、サッカーが 一番 好きです。", "特に", ["しかし", "それとも", "ところが"], "Saya suka olahraga. Terutama sepak bola.", "特に = terutama."),
 ("来週 テストが あります。（　　　）、今週は 毎日 勉強する つもりです。", "だから", ["しかし", "ところが", "それとも"], "Minggu depan ada ujian. Karena itu minggu ini saya akan belajar tiap hari.", "だから."),
 ("日本人は よく「すみません」と 言います。（　　　）、「ありがとう」の 意味で 使う ことも あります。", "また", ["しかし", "それとも", "ところが"], "Orang Jepang sering bilang 'sumimasen'. Juga kadang dipakai bermakna terima kasih.", "また = juga."),
 ("ごみの 分け方は 町に よって ちがいます。（　　　）、引っ越したら まず ルールを 確認して ください。", "ですから", ["しかし", "ところが", "それとも"], "Cara memilah sampah berbeda tiap kota. Karena itu, jika pindah, cek aturannya dulu.", "ですから."),
 ("この 本は 長いです。（　　　）、とても おもしろいです。", "けれども", ["だから", "そこで", "ですから"], "Buku ini panjang. Tetapi sangat menarik.", "けれども."),
]
S = [r for r in S if len(r[2]) == 3 and r[1] not in r[2]]
