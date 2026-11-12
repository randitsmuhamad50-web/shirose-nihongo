# -*- coding: utf-8 -*-
T4 = [
 ("工事が中断されていたが、来週から（　）開される。","再",["復","重","後"],"Pekerjaan konstruksi yang terhenti akan dibuka kembali minggu depan.","再開."),
 ("この会社は（　）先端の技術を持っている。","最",["大","超","高"],"Perusahaan ini memiliki teknologi paling mutakhir.","最先端."),
 ("今日のコンサートは（　）満員で、立ち見も出た。","超",["大","高","総"],"Konser hari ini penuh sesak sampai ada yang berdiri.","超満員."),
 ("（　）首相は、引退後に本を出版した。","前",["旧","先","元"],"Mantan perdana menteri menerbitkan buku setelah pensiun.","前首相."),
 ("この政策は、かえって（　）効果を生んでしまった。","逆",["反","裏","対"],"Kebijakan ini justru menghasilkan efek sebaliknya.","逆効果."),
 ("この薬は、副作用に（　）注意だ。","要",["必","重","大"],"Obat ini perlu diwaspadai efek sampingnya.","要注意."),
 ("新人ながら、彼は（　）戦力として期待されている。","即",["早","急","直"],"Meski karyawan baru, ia diharapkan jadi tenaga siap pakai.","即戦力."),
 ("親が（　）保護だと、子どもの自立が遅れる。","過",["超","大","多"],"Jika orang tua terlalu protektif, kemandirian anak terlambat.","過保護."),
 ("この携帯電話は（　）機能で、使いこなせない。","多",["諸","各","総"],"Ponsel ini multifungsi sampai tak bisa dikuasai.","多機能."),
 ("来年度の（　）算を、今月中に決める。","予",["前","先","事"],"Anggaran tahun depan diputuskan bulan ini.","予算."),
 ("大型の台風が（　）日本に上陸した。","全",["総","諸","各"],"Topan besar mendarat di seluruh Jepang.","全日本."),
 ("彼は人を（　）力で判断しない人だ。","外見",["見かけ","顔つき","形"],"Dia tak menilai orang dari penampilan.","(dihapus)"),
 ("この問題は、解決する（　）がまだ見えない。","めど",["みち","てん","すえ"],"Belum terlihat harapan untuk menyelesaikan masalah ini.","dihapus"),
]
T4 = [r for r in T4 if r[4] not in ("(dihapus)","dihapus")]
T4 += [
 ("彼は問題解決に向けた（　）力がある。","実行",["実現","実感","実情"],"Dia punya kemampuan melaksanakan penyelesaian masalah.","(dihapus)"),
]
T4 = [r for r in T4 if r[4] != "(dihapus)"]
T4 += [
 ("この仕事を続けるには、強い体（　）が必要だ。","力",["感","度","性"],"Untuk melanjutkan pekerjaan ini perlu stamina yang kuat.","体力."),
 ("新しい職場では、大きな不安（　）を覚えた。","感",["力","性","策"],"Di tempat kerja baru saya merasakan kecemasan besar.","不安感."),
 ("政府は少子化対策の新しい（　）を発表した。","策",["案","法","式"],"Pemerintah mengumumkan langkah baru melawan penurunan kelahiran.","〜策."),
 ("彼女はO（　）の血液を持っている。","型",["式","種","形"],"Dia bergolongan darah O.","〜型."),
 ("この会社は、年功序列の（　）をやめた。","制",["式","型","風"],"Perusahaan ini menghapus sistem senioritas.","〜制."),
 ("最近、疲れ（　）で、集中できない。","気味",["がち","っぽい","げ"],"Belakangan agak kelelahan sehingga sulit fokus.","〜気味."),
 ("この製品は、日本（　）で、品質が高い。","製",["産","作","造"],"Produk ini buatan Jepang dengan kualitas tinggi.","日本製."),
 ("この野菜は、北海道（　）の新鮮なものだ。","産",["製","作","生"],"Sayur ini segar dari Hokkaido.","北海道産."),
 ("来月から電気（　）が値上がりする。","料金",["金額","価格","費用"],"Mulai bulan depan tarif listrik naik.","dihapus"),
 ("この国では、消費（　）が10%に上がった。","税",["料","費","代"],"Di negara ini pajak konsumsi naik jadi 10%.","消費税."),
 ("駐車場の（　）が高くて困る。","料",["費","代","金"],"Tarif parkir mahal dan merepotkan.","駐車料."),
 ("あの店は、サービスの質が高く、客の満足（　）が高い。","度",["率","感","力"],"Toko itu kualitas layanannya tinggi dan kepuasan pelanggan tinggi.","満足度."),
 ("景気の回復で、失業（　）が下がった。","率",["度","割","比"],"Karena ekonomi pulih, tingkat pengangguran turun.","失業率."),
 ("彼は優れた経営（　）として知られている。","者",["師","員","屋"],"Dia dikenal sebagai pengelola yang andal.","経営者."),
 ("母は教育（　）として長年働いてきた。","者",["家","員","職"],"Ibu bertahun-tahun bekerja sebagai pendidik.","dihapus"),
 ("彼は有名な小説（　）だ。","家",["者","師","員"],"Dia novelis terkenal.","小説家."),
 ("あの人は医（　）として病院で働いている。","師",["者","員","家"],"Orang itu bekerja di rumah sakit sebagai dokter.","医師."),
 ("彼女は大学の教（　）になった。","員",["者","師","家"],"Dia menjadi staf pengajar universitas.","教員."),
 ("このあたりは、関東（　）で最も人口が多い。","圏",["域","帯","地"],"Daerah ini paling padat penduduknya di wilayah Kanto.","関東圏."),
 ("この辺りは、交通（　）が整っている。","網",["路","線","道"],"Di sekitar sini jaringan transportasinya lengkap.","交通網."),
 ("若者の活字（　）が進んでいる。","離れ",["外れ","別れ","去り"],"Anak muda makin menjauh dari bacaan cetak.","〜離れ."),
 ("この果物は皮（　）食べられる。","ごと",["だけ","まで","なし"],"Buah ini dimakan beserta kulitnya.","〜ごと."),
 ("久しぶり（　）に、昔の友人に会った。","ぶり",["っぱなし","がち","がかり"],"Setelah sekian lama saya bertemu teman lama.","〜ぶり."),
 ("このレポートは、三日（　）で仕上げた。","がかり",["ごと","ぶり","づくめ"],"Laporan ini diselesaikan dalam tiga hari kerja.","〜がかり."),
 ("今日は、いいこと（　）の一日だった。","ずくめ",["だらけ","まみれ","ばかり"],"Hari ini penuh hal baik.","〜ずくめ."),
 ("子どもたちは、泥（　）になって遊んでいた。","だらけ",["ずくめ","がち","ぎみ"],"Anak-anak bermain sampai penuh lumpur.","〜だらけ."),
 ("焼き（　）のパンは、香りがいい。","たて",["ごと","がかり","ぶり"],"Roti yang baru dipanggang harum.","〜たて."),
 ("この件は、（　）専門の弁護士に相談すべきだ。","その",["この","あの","どの"],"x","dihapus"),
]
T4 = [r for r in T4 if not r[4].startswith("dihapus") and r[4] != "(dihapus)"]
T4 = [r for r in T4 if len(r[2])==3 and r[1] not in r[2] and '（　）' in r[0]]
T4 = [r for r in T4 if r[0] not in ("彼は人を（　）力で判断しない人だ。",)]
_fix = {
 "（　）首相は、引退後に本を出版した。": ["先","後","古"],
 "この政策は、かえって（　）効果を生んでしまった。": ["裏","対","返"],
 "今日のコンサートは（　）満員で、立ち見も出た。": ["無","全","半"],
 "親が（　）保護だと、子どもの自立が遅れる。": ["非","大","多"],
 "この携帯電話は（　）機能で、使いこなせない。": ["諸","無","総"],
 "新しい職場では、大きな不安（　）を覚えた。": ["力","度","策"],
 "政府は少子化対策の新しい（　）を発表した。": ["力","法","式"],
 "この会社は、年功序列の（　）をやめた。": ["力","型","風"],
 "この製品は、日本（　）で、品質が高い。": ["式","作","造"],
 "あの店は、サービスの質が高く、客の満足（　）が高い。": ["性","策","力"],
 "あの人は医（　）として病院で働いている。": ["家","手","匠"],
 "この果物は皮（　）食べられる。": ["おき","ずつ","ぎみ"],
 "今日は、いいこと（　）の一日だった。": ["ぎみ","がち","ごと"],
 "最近、疲れ（　）で、集中できない。": ["ずくめ","だらけ","ごと"],
}
T4 = [(a,b,_fix.get(a,c),d,e) for a,b,c,d,e in T4]
T4 = [(a,b,c,d,e) for a,b,c,d,e in T4 if not a.startswith(("彼女は大学の教","駐車場の（　）"))]
T4 += [("駐車（　）が高くて困る。","料",["度","性","率"],"Tarif parkir mahal dan merepotkan.","駐車料.")]
T4 += [
 ("この国の人口は、（　　　）年々増加している。","総",["全","大","諸"],"x","dihapus"),
 ("今回の事故は、（　　　）責任が問われる大事件だ。","重",["高","大","多"],"x","dihapus"),
 ("彼は、会社の（　　　）社長として、組織を支えてきた。","副",["準","次","半"],"Dia menopang organisasi sebagai wakil direktur perusahaan.","副社長."),
 ("会議は、（　　　）二時間にわたって行われた。","約",["概","大","総"],"Rapat berlangsung kurang lebih dua jam.","約二時間."),
 ("（　　　）日本人の学生が、そのプログラムに参加した。","在",["現","当","本"],"Mahasiswa Jepang yang tinggal di luar negeri ikut dalam program.","dihapus"),
 ("この地域は、（　　　）人口地域として知られている。","過",["大","高","多"],"Daerah ini dikenal sebagai daerah kepadatan penduduk berlebih.","過密."),
 ("彼女は、（　　　）月から新しい部署で働く。","来",["次","後","翌"],"Mulai bulan depan dia bekerja di bagian baru.","来月."),
 ("（　　　）関係者以外は、立ち入り禁止です。","部",["外","無","非"],"Selain pihak terkait, dilarang masuk.","dihapus"),
]
T4 = [r for r in T4 if not r[4]=="dihapus" and len(r[2])==3 and r[1] not in r[2]]
T4 = [r for r in T4 if not r[0].startswith(("この地域は、（　　　）人口","彼女は、（　　　）月から"))]
