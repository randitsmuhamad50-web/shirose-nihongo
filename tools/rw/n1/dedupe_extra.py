# -*- coding: utf-8 -*-
K = [
 ("彼の話は、聞け（）聞くほど不思議だ。","ば",["と","たら","ても"],"Makin didengar, makin aneh ceritanya.","V-ば V-るほど."),
 ("約束した（）、守らなければならない。","以上は",["ものの","ところで","ばかりに"],"Karena sudah berjanji, harus ditepati.","V-た+以上は: karena sudah."),
 ("彼は医者で（）ながら、患者の気持ちがわからない。","あり",["いる","なる","する"],"Meski seorang dokter, ia tak memahami perasaan pasien.","〜でありながら: padahal/meski."),
 ("雨が降ろう（）、試合は行われる。","と",["ので","から","ば"],"Meski hujan, pertandingan tetap dilaksanakan.","V-よう+と: biar pun."),
 ("成功する（）しないは、本人の努力次第だ。","か",["が","を","と"],"Berhasil atau tidak tergantung usaha orangnya.","V-る+か+V-ない+は: ...atau tidak."),
 ("この仕事は彼（）できない。","にしか",["としか","はしか","がしか"],"Pekerjaan ini hanya dia yang bisa.","〜にしかV-ない: hanya."),
 ("彼は謝る（）、逆に怒り出した。","どころか",["ばかりか","とすれば","にあたり"],"Bukannya minta maaf, ia malah marah.","〜どころか: bukannya... malah."),
 ("病気（）、仕事を休むわけにはいかない。","だからといって",["だからこそ","というと","としたら"],"Sekalipun sakit, tak bisa begitu saja libur kerja.","〜だからといって〜ない: bukan berarti."),
 ("彼の行為は許す（）ものではない。","べき",["ため","はず","ところ"],"Tindakannya bukan sesuatu yang patut dimaafkan.","V-べき: seharusnya."),
 ("一度失敗した（）で、あきらめるな。","くらい",["ところ","ばかり","まま"],"Jangan menyerah hanya karena sekali gagal.","〜くらいで: hanya karena hal sepele."),
 ("彼女は笑った（）と思えば、すぐに泣き出した。","か",["を","に","で"],"Baru saja tertawa, langsung menangis.","〜かと思えば: baru saja... sudah."),
 ("彼は日本語（）、英語も堪能だ。","はもとより",["だけあって","ことから","のもとに"],"Bahasa Jepang apalagi, bahasa Inggris pun ia kuasai.","〜はもとより: apalagi/ tentu saja."),
 ("先生のご指導（）、論文を完成させることができた。","のおかげで",["のせいで","のくせに","ともなく"],"Berkat bimbingan guru, saya bisa menyelesaikan skripsi.","〜のおかげで: berkat."),
 ("大雨（）、電車が止まった。","により",["にわたって","に応じて","にとって"],"Karena hujan lebat, kereta berhenti.","〜により: disebabkan oleh."),
 ("経験（）、人は成長する。","を通して",["をめぐって","に際して","に先立って"],"Melalui pengalaman, manusia bertumbuh.","〜を通して: melalui."),
 ("結果（）、計画を変更するかもしれない。","次第では",["をよそに","にひきかえ","ならでは"],"Tergantung hasilnya, rencana mungkin diubah.","〜次第では: tergantung."),
 ("台風の影響（）、新幹線が運休した。","を受けて",["をよそに","にもまして","をかわきりに"],"Akibat pengaruh topan, shinkansen dibatalkan.","〜を受けて: menyusul/akibat."),
 ("大学教授（）人が、論文を盗用するとは。","ともあろう",["にしては","ならでは","にひきかえ"],"Orang yang berstatus profesor kok menjiplak makalah.","〜ともあろう+人: orang sekelas."),
 ("優勝は無理（）、せめて決勝には進みたい。","にしても",["ともなると","にあって","をもって"],"Kalau juara mustahil pun, setidaknya ingin masuk final.","〜にしても: sekalipun."),
 ("彼は怒る（）なく、黙って部屋を出ていった。","でも",["より","ほど","しか"],"Ia keluar kamar diam-diam tanpa marah.","〜でもなく: tanpa/ tidak juga."),
 ("彼は約束を破った（）、謝りもしない。","うえに",["ものの","ところで","からには"],"Ia mengingkari janji, dan tak minta maaf pula.","〜うえに: tambahan lagi."),
 ("彼女は美人である（）、頭もいい。","うえに",["ものの","たびに","ところを"],"Ia cantik, dan pintar pula.","〜うえに: tambahan lagi."),
 ("事故（）、道路は渋滞している。","のせいで",["のおかげで","にもかかわらず","をよそに"],"Karena kecelakaan, jalan macet.","〜のせいで: gara-gara."),
 ("彼の言うことは一理ある（）、全面的には賛成できない。","にしても",["ゆえに","ならでは","からして"],"Ucapannya ada benarnya, tapi tak bisa kusetujui sepenuhnya.","〜にしても: sekalipun."),
 ("部長（）、責任は重い。","ともなれば",["にひきかえ","をよそに","にかかわらず"],"Kalau sudah level manajer, tanggung jawabnya berat.","〜ともなれば: kalau sudah."),
 ("失敗を恐れる（）、挑戦できない人がいる。","あまり",["かわりに","ついでに","くせに"],"Ada orang yang karena terlalu takut gagal, tak bisa menantang.","〜あまり: terlalu... sampai."),
 ("引っ越し（）、荷物を整理した。","に際して",["に沿って","に反して","に応じて"],"Saat pindah rumah, saya merapikan barang.","〜に際して: pada saat."),
 ("失敗（）して、成功はない。","なく",["ある","せず","まで"],"Tanpa kegagalan, tak ada keberhasilan.","〜なくして〜ない: tanpa."),
 ("彼の努力（）、並大抵のものではない。","たるや",["ならでは","ともなく","ながらも"],"Usahanya itu luar biasa.","〜たるや: soal... itu."),
]
S = [
 ("彼は優秀だ。（）、人望もある。","しかも",["ところが","だが","さて"],"Ia cakap. Lagi pula, juga dihormati.","しかも: lagi pula."),
 ("計画は完璧だった。（）、当日の天候だけは誰にも予測できなかった。","ただし",["すなわち","したがって","むしろ"],"Rencananya sempurna. Hanya saja cuaca hari-H tak bisa diprediksi siapa pun.","ただし: hanya saja (pengecualian)."),
 ("雨が降り続いた。（）、川が氾濫した。","その結果",["ところが","ちなみに","もっとも"],"Hujan terus turun. Akibatnya sungai meluap.","その結果: akibatnya."),
]
M = [
 ("事態は一刻を（）状況になった。","争う",["急ぐ","競う","戦う"],"Situasinya menjadi genting, setiap saat berharga.","一刻を争う: tiap detik berharga."),
 ("彼の言葉が、私の心に深く（）。","響いた",["鳴いた","叩いた","揺れた"],"Ucapannya bergema dalam hati saya.","心に響く: menyentuh hati."),
]
I = [
 ("この事業は<u>前途多難</u>だ。","これから多くの困難が予想される",["すぐに成功することが確実だ","すでに終わってしまっている","誰にでも簡単にできる"],"Usaha ini ke depan penuh kesulitan.","前途多難: banyak rintangan di depan."),
 ("彼の主張は<u>もっともらしい</u>が、根拠がない。","道理にかなっているように聞こえる",["とても重要であるように思える","非常に複雑で理解しにくい","ほとんど誰も賛成していない"],"Klaimnya tampak masuk akal, tapi tak berdasar.","もっともらしい: tampak masuk akal."),
]
U = [
 ("あいにく","あいにく、その日は先約があって参加できません。",["あいにく、彼は合格して、みんなが喜んだ。","あいにく、昨日は友達に会えて楽しかった。","あいにく、このケーキは本当においしい。"],"Sayang sekali, hari itu saya sudah ada janji dan tak bisa ikut.","あいにく: sayangnya/ kebetulan tak cocok."),
 ("かろうじて","かろうじて終電に間に合った。",["かろうじて、時間はたっぷりあったので、ゆっくり出かけた。","かろうじて優勝して、誰もが予想していた通りだった。","かろうじて毎日、ぐっすり眠れている。"],"Dengan susah payah, saya sempat naik kereta terakhir.","かろうじて: nyaris/ dengan susah payah."),
]
