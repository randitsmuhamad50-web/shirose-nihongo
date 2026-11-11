# -*- coding: utf-8 -*-
# N5: 短文 ~100字 · 1問 ;  中文 ~180字 · 2問
P1 = "Baca pertanyaan dulu, lalu cari kalimat yang menjawabnya di teks."
P2 = "Perhatikan kata waktu (いつ・何時・何曜日) dan angka; cocokkan dengan teks."
J = 'tan'; JN = 'Teks pendek (短文)'
C = 'chu'; CN = 'Teks menengah (中文)'
B = [
 dict(slot=J, jenis=JN,
  jp='きのうは 日曜日でした。わたしは 友だちと デパートへ いきました。そこで あたらしい くつを かいました。くつは 五千円でした。それから、ひるごはんに ラーメンを たべました。とても おいしかったです。',
  id='Kemarin hari Minggu. Saya pergi ke department store bersama teman. Di sana saya membeli sepatu baru. Sepatunya 5.000 yen. Setelah itu, saya makan ramen untuk makan siang. Sangat enak.',
  qs=[('「わたし」は デパートで なにを かいましたか。',
   ['ラーメン', 'くつ', 'ふく', 'かばん'], 1, 'Membeli sepatu.', 'あたらしい くつを かいました', ['Ramen dimakan, bukan dibeli di sana.', 'Tidak disebut.', 'Tidak disebut.'], P1)]),
 dict(slot=J, jenis=JN,
  jp='あしたは 学校が やすみです。あさ、わたしは 十時に おきます。それから、へやを そうじします。ごごは 友だちと こうえんで テニスを します。よる、いえで 日本語を べんきょうします。',
  id='Besok sekolah libur. Pagi, saya bangun pukul 10. Lalu saya membersihkan kamar. Sore, saya bermain tenis dengan teman di taman. Malam, saya belajar bahasa Jepang di rumah.',
  qs=[('ごごは なにを しますか。',
   ['へやを そうじします', '日本語を べんきょうします', 'こうえんで テニスを します', 'がっこうへ いきます'],
   2, 'Siang/sore bermain tenis di taman.', 'ごごは 友だちと こうえんで テニスを します', ['Itu pagi.', 'Itu malam.', 'Besok libur.'], P2)]),
 dict(slot=J, jenis=JN,
  jp='すずきさんへ\n\nあしたの かいぎは 二時から 三時までです。場所は 三かいの へやです。しりょうを 十まい コピーして、もって きて ください。\n\nたなか',
  id='Kepada Suzuki-san\n\nRapat besok pukul 2 sampai 3. Tempatnya ruang di lantai 3. Tolong fotokopi 10 lembar materi dan bawa.\n\nTanaka',
  qs=[('すずきさんは なにを しなければ なりませんか。',
   ['かいぎしつを そうじする', 'しりょうを コピーして もって いく', '三時に 田中さんに でんわする', 'おべんとうを かう'],
   1, 'Fotokopi dan membawa materi.', 'しりょうを 十まい コピーして、もって きて ください', ['Tidak diminta.', 'Tidak diminta.', 'Tidak diminta.'], P1)]),
 dict(slot=C, jenis=CN,
  jp='わたしの いえには ねこが います。なまえは「ミケ」です。ミケは 三さいです。あさと よる、ごはんを あげます。ミケは さかなが すきです。でも、いぬは きらいです。\n　わたしは 毎日 学校から かえると、ミケと いっしょに あそびます。ミケは ボールが すきで、よく 走ります。ミケは わたしの 大切な 友だちです。',
  id='Di rumah saya ada kucing. Namanya "Mike". Mike berumur tiga tahun. Pagi dan malam saya memberinya makan. Mike suka ikan. Tetapi ia tidak suka anjing.\nSetiap hari sepulang sekolah, saya bermain dengan Mike. Mike suka bola dan sering berlari. Mike adalah teman penting saya.',
  qs=[('ミケは なにが すきですか。',
   ['いぬ', 'さかなと ボール', 'ごはんだけ', '学校'],
   1, 'Mike suka ikan dan bola.', 'ミケは さかなが すきです…ミケは ボールが すきで', ['Tidak suka anjing.', 'Tidak benar.', 'Tidak disebut.'], P1),
   ('「わたし」は 学校から かえって、なにを しますか。',
   ['ミケと あそびます', 'ミケを さんぽに つれて いきます', 'ごはんを つくります', 'ねます'],
   0, 'Bermain dengan Mike.', '学校から かえると、ミケと いっしょに あそびます', ['Tidak disebut.', 'Tidak disebut.', 'Tidak disebut.'], P1)]),
 dict(slot=C, jenis=CN,
  jp='やまださんの いえの ちかくに、あたらしい スーパーが できました。ぎゅうにゅうは 百五十円、たまごは 二百円、パンは 百円です。ほかの みせより、すこし やすいです。\n　スーパーは 朝 九時から よる 九時までです。日曜日も あいて います。水曜日は、くだものが 二十パーセント やすく なります。やまださんは、水曜日に かいものに いきます。',
  id='Dekat rumah Yamada-san, ada supermarket baru. Susu 150 yen, telur 200 yen, roti 100 yen. Sedikit lebih murah daripada toko lain.\nSupermarket buka pukul 9 pagi sampai 9 malam. Hari Minggu juga buka. Pada hari Rabu, buah-buahan jadi lebih murah 20 persen. Yamada-san berbelanja pada hari Rabu.',
  qs=[('パンは いくらですか。',
   ['百円', '百五十円', '二百円', '二十円'],
   0, 'Roti 100 yen.', 'パンは 百円です', ['150 yen adalah susu.', '200 yen adalah telur.', 'Bukan harga.'], P2),
   ('やまださんは どうして 水曜日に かいものに いきますか。',
   ['スーパーが 水曜日しか あいて いないから', 'くだものが やすく なるから', '学校が やすみだから', '友だちと いくから'],
   1, 'Rabu buah lebih murah.', '水曜日は、くだものが 二十パーセント やすく なります', ['Buka setiap hari.', 'Tidak disebut.', 'Tidak disebut.'], P2)]),
]
