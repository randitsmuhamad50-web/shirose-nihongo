# -*- coding: utf-8 -*-
M2 = [
 ("この 町は 夜も（　　　）で、安心して 歩けます。","安全",["危険","複雑","有名な"],"Kota ini aman bahkan malam hari, jadi tenang berjalan.","安全 = aman."),
 ("宿題が 多くて、（　　　）が ありません。","時間",["場所","問題","試合"],"PR banyak, saya tidak punya waktu.","時間がない."),
 ("母は 毎朝 新しい（　　　）を 読みます。","新聞",["洗濯","出発","運転"],"Ibu membaca koran tiap pagi.","新聞を読む."),
 ("山田さんは 来月 結婚するそうです。（　　　）ですね。","おめでとう",["残念","大変","けっこう"],"Katanya Yamada menikah bulan depan. Selamat ya.","おめでとう."),
 ("電車が 事故で とまって、会社に（　　　）しました。","遅刻",["出張","留学","運動"],"Kereta berhenti karena kecelakaan, saya terlambat ke kantor.","遅刻する."),
 ("先生に 質問が あるので、（　　　）を 取りました。","予約",["約束するか","予定表","説明会"],"Karena ada pertanyaan untuk guru, saya membuat janji.","予約を取る."),
 ("この 料理は 辛すぎて、（　　　）が 出ました。","汗",["雪","風","煙"],"Masakan ini terlalu pedas, saya berkeringat.","汗が出る."),
 ("日本の 夏は 暑くて（　　　）です。","蒸し暑い",["寒い","涼しい","冷たい"],"Musim panas Jepang panas dan lembap.","蒸し暑い."),
 ("あの 店は 料理が おいしいので、いつも（　　　）です。","こんで いる",["すいて いる","しまって いる","かわいて いる"],"Toko itu masakannya enak, jadi selalu ramai.","こんでいる."),
 ("ここは 禁煙です。たばこは（　　　）ください。","やめて",["かけて","わたして","とって"],"Di sini dilarang merokok. Tolong hentikan merokok.","やめる."),
 ("先生の 説明は とても（　　　）、よく わかりました。","わかりやすくて",["わかりにくくて","わかりたくて","わかって ほしくて"],"Penjelasan guru mudah dimengerti, jadi saya paham.","わかりやすい."),
 ("かぜを ひいたので、今日は 学校を（　　　）。","休みます",["残ります","通います","間に合います"],"Karena masuk angin, hari ini saya tidak masuk sekolah.","休む."),
 ("この かばんは 軽くて、（　　　）にも 便利です。","旅行",["勉強","売り場","事故"],"Tas ini ringan dan praktis untuk bepergian juga.","旅行."),
 ("雨が 降って いたので、かさを（　　　）出かけました。","さして",["かけて","きて","はいて"],"Karena hujan, saya keluar sambil memakai payung.","かさをさす."),
 ("駅で 友だちに（　　　）会いました。","ぐうぜん",["だんだん","ゆっくり","ずっと"],"Di stasiun saya kebetulan bertemu teman.","偶然 = kebetulan."),
 ("パーティーの（　　　）を しなければ なりません。","準備",["経験","相談","返事"],"Harus menyiapkan pesta.","準備をする."),
]
M2 = [r for r in M2 if len(r[2])==3 and r[1] not in r[2]]
