# -*- coding: utf-8 -*-
S2 = [
 ("昨日は 朝から 熱が ありました。（　　　）、会社を 休んで 病院へ 行きました。","そこで",["ところが","しかし","たとえば"],"Kemarin demam sejak pagi. Karena itu saya libur dan ke rumah sakit.","そこで = maka dari itu."),
 ("この 店の ケーキは とても 有名です。（　　　）、いつも 長い 行列が できて います。","そのため",["ところで","それとも","たとえば"],"Kue toko ini sangat terkenal. Karena itu selalu antre panjang.","そのため = karena itu."),
 ("日本語は むずかしいと 言われて います。（　　　）、毎日 少しずつ 勉強すれば、かならず 上手に なります。","しかし",["だから","つまり","そのうえ"],"Bahasa Jepang dikatakan sulit. Namun jika belajar sedikit tiap hari, pasti mahir.","Kontras → しかし."),
 ("私は 犬が 好きです。（　　　）、動物は ぜんぶ 好きです。","とくに",["つまり","ところが","しかし"],"Saya suka anjing. Terutama...","文脈."),
 ("私の 町には 古い お寺が たくさん あります。（　　　）、京都や 奈良の ような 観光地では ありません。","しかし",["そのため","つまり","そこで"],"Kota saya banyak kuil tua. Tapi bukan tempat wisata seperti Kyoto.","しかし."),
 ("A「明日の 会議は 何時からですか。」B「十時からです。（　　　）、資料は 持って きて ください。」","それから",["ところが","しかし","または"],"Rapat dimulai jam 10. Lalu tolong bawa materi.","それから."),
 ("電車で 行く 方法が あります。（　　　）、バスで 行く 方法も あります。","また",["しかし","だから","つまり"],"Ada cara naik kereta. Juga ada cara naik bus.","また = juga."),
 ("毎日 運動して います。（　　　）、食事にも 気を つけて います。","さらに",["しかし","ところが","それとも"],"Saya olahraga tiap hari. Selain itu saya juga menjaga makan.","さらに."),
 ("買い物に 行きます。（　　　）、いっしょに 行きませんか。","よろしければ",["ところが","だから","しかし"],"Saya mau belanja. Kalau tidak keberatan, ikut?","文脈."),
 ("ご飯に しますか。（　　　）、パンに しますか。","それとも",["そして","それに","だから"],"Mau nasi? Atau roti?","それとも = atau."),
 ("朝 早く 起きました。（　　　）、電車が 遅れて、会社に 遅刻しました。","ところが",["だから","そして","それで"],"Bangun pagi. Namun kereta terlambat dan saya terlambat ke kantor.","ところが = namun."),
 ("雨が 降って いました。（　　　）、かさを 持って 出かけました。","だから",["ところが","しかし","たとえば"],"Hujan. Jadi saya bawa payung.","だから."),
 ("日本には いろいろな 祭りが あります。（　　　）、京都の 祇園祭や 青森の ねぶた祭が 有名です。","たとえば",["しかし","だから","ところで"],"Jepang punya banyak festival. Misalnya Gion di Kyoto.","たとえば."),
 ("今日は 暑かった です ね。（　　　）、明日の 天気は どう でしょう。","ところで",["だから","たとえば","それで"],"Hari ini panas ya. Omong-omong, besok cuacanya bagaimana?","ところで = ganti topik."),
 ("彼は 毎日 夜中まで 勉強して いる。（　　　）、体を こわさないか 心配だ。","それで",["ところが","または","さらに"],"Dia belajar sampai tengah malam tiap hari. Saya khawatir jatuh sakit.","文脈."),
 ("父は 毎晩 お酒を 飲みます。（　　　）、体に よく ないと 医者に 言われました。","しかし",["だから","そして","つまり"],"Ayah minum tiap malam. Tapi dokter bilang tak baik.","しかし."),
 ("友だちが 病気で 入院しました。（　　　）、見舞いに 行って きました。","そこで",["ところが","しかし","または"],"Teman rawat inap. Jadi saya menjenguk.","そこで."),
 ("この 辺りは 駅から 遠い。（　　　）、静かで 住みやすい。","しかし",["だから","そこで","つまり"],"Daerah ini jauh dari stasiun. Tapi tenang dan nyaman.","しかし."),
 ("この 部屋は 広い。（　　　）、日当たりも よくて 家賃も 安い。","そのうえ",["ところが","しかし","または"],"Ruangan ini luas, ditambah cerah dan sewa murah.","そのうえ."),
 ("会議は 午後三時に 始まります。（　　　）、二時五十分までに 集まって ください。","ですから",["ところが","しかし","それとも"],"Rapat mulai jam 3. Jadi kumpul jam 2.50.","ですから."),
 ("入学試験に 合格しました。（　　　）、母は 泣いて 喜んで くれました。","すると",["しかし","それとも","または"],"Lulus ujian masuk. Lalu ibu menangis bahagia.","すると."),
 ("日本語の 勉強は むずかしい。（　　　）、毎日 続ければ できる ように なる。","でも",["だから","つまり","そのうえ"],"Belajar bahasa Jepang sulit. Tapi kalau tiap hari, jadi bisa.","でも."),
]
S2 = [r for r in S2 if r[0] not in ("私は 犬が 好きです。（　　　）、動物は ぜんぶ 好きです。","買い物に 行きます。（　　　）、いっしょに 行きませんか。","彼は 毎日 夜中まで 勉強して いる。（　　　）、体を こわさないか 心配だ。") and r[1] not in r[2]]
S2 += [
 ("今日は とても 暑い 日でした。（　　　）、私は 冷たい ジュースを 飲みました。","そこで",["しかし","ところが","または"],"Hari ini sangat panas. Karena itu saya minum jus dingin.","そこで."),
 ("彼は 毎日 練習して いました。（　　　）、試合に 勝つ ことが できました。","その結果",["ところが","しかし","たとえば"],"Dia berlatih tiap hari. Hasilnya, dia bisa menang.","その結果."),
]
