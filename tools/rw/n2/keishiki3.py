# -*- coding: utf-8 -*-
import re
K3 = [
 ("最近 忙しくて、休日（　　　）休めない。","すら",["さえ ない","しか","まで ない"],"Belakangan sibuk sehingga bahkan hari libur pun tak bisa istirahat.","〜すら = bahkan."),
 ("彼は 自分の 名前（　　　）書けない。","すら",["しか","ばかり","ほど"],"Dia bahkan tak bisa menulis namanya sendiri.","〜すら〜ない."),
 ("専門家（　　　）、この 問題は 解けない。","でさえ",["にして","ならでは","ともなると"],"Bahkan pakar pun tak bisa memecahkan soal ini.","〜でさえ."),
 ("この 仕事は 経験者（　　　）できない。","でなければ",["ならでは","だけあって","ばかりか"],"Pekerjaan ini tak bisa dilakukan kecuali oleh yang berpengalaman.","〜でなければ."),
 ("彼女は 歌が うまい（　　　）、ダンスも プロ並みだ。","ばかりか",["くせに","ものの","わりに"],"Dia bukan hanya pandai menyanyi, tapi dansanya pun setingkat profesional.","〜ばかりか."),
 ("先生は 厳しい（　　　）、優しい 面も ある。","反面",["以上","あげく","うえで"],"Guru itu keras tapi di sisi lain ada sisi lembutnya.","〜反面."),
 ("駅に 近い（　　　）、家賃が 高い。","だけに",["からには","わりに","のに ない"],"Karena dekat stasiun, sewanya mahal.","〜だけに = karena, sesuai."),
 ("スポーツが 好き（　　　）、毎日 ジムに 通って いる。","なだけに",["なくせに","だけあって ない","ばかりに"],"Karena suka olahraga, dia ke gym tiap hari.","〜だけに."),
 ("勉強した（　　　）、成績は 上がらない。","ところで",["からには","ものだから","あげくに"],"Sekalipun belajar, nilai tak naik.","〜たところで."),
 ("今から 走った（　　　）、電車には 間に合わない。","ところで",["からには","ものだから","うえに"],"Sekalipun berlari sekarang, tak akan sempat naik kereta.","〜たところで."),
 ("家を 出ようと した（　　　）、電話が 鳴った。","ところ",["あげく","うえで","ところで"],"Baru hendak keluar rumah, telepon berbunyi.","〜ところ."),
 ("彼に 聞いた（　　　）、知らないと 言われた。","ところ",["ところで","うえで","からには"],"Ketika saya tanya padanya, katanya tidak tahu.","〜たところ = ketika."),
 ("彼は 何を 聞かれても、答え（　　　）。","ようとしない",["ようがない","かねない","がたい"],"Apa pun yang ditanya, dia tidak mau menjawab.","〜ようとしない."),
 ("彼の 気持ちは 分から（　　　）でもない。","ない",["なく","なかった","なくて"],"Bukan berarti aku tak paham perasaannya.","〜ないでもない."),
 ("予約が ない（　　　）、入れない。","と",["ので","のに","ても"],"Kalau tidak ada reservasi, tidak bisa masuk.","〜ないと."),
 ("この 薬は 医者の 指示（　　　）、飲んで ください。","に従って",["に反して","に先立って","をよそに"],"Minum obat ini sesuai instruksi dokter.","〜に従って."),
 ("仕事を 辞める（　　　）、よく 考えて ください。","にあたって",["にしては","にもかかわらず","をめぐって"],"Dalam hal berhenti kerja, pikirkan baik-baik.","〜にあたって."),
 ("留学する（　　　）、ビザを 取らなければ ならない。","にあたって",["にしては","ものの","わりに"],"Dalam rangka studi di luar negeri, harus mengurus visa.","〜にあたって."),
 ("この 薬は 子ども（　　　）飲めない。","には",["にして","にとって ない","でも ない"],"Obat ini tak bisa diminum anak-anak.","〜には."),
 ("彼女の 話は 事実（　　　）しれない。","かも",["どころか","にしては","ならでは"],"Ceritanya mungkin fakta.","〜かもしれない."),
 ("風邪（　　　）、今日は 休みます。","のため",["のせいで ない","のくせに","のわりに"],"Karena masuk angin, hari ini libur.","〜のため."),
 ("先生の ご指導（　　　）、合格できました。","のおかげで",["のせいで","のくせに","のわりに"],"Berkat bimbingan guru, saya lulus.","〜おかげで."),
 ("毎朝 走る（　　　）して いる。","ように",["ことに ない","ものに","ところに"],"Saya berusaha lari tiap pagi.","〜ようにしている."),
 ("来週から 新しい 部署で 働く（　　　）なりました。","ことに",["ように","ために","ものに"],"Mulai minggu depan saya ditempatkan di departemen baru.","〜ことになる."),
 ("日本語が 上手に なる（　　　）、毎日 練習します。","ように",["ことに","ものに","ところに"],"Supaya bahasa Jepang mahir, saya berlatih tiap hari.","〜ように."),
 ("彼は 買い物（　　　）、友達に 会った。","のついでに",["のくせに","のおかげで","のわりに"],"Sambil belanja, dia bertemu teman.","〜ついでに."),
 ("駅へ 行く（　　　）、この 手紙を 出して ください。","ついでに",["くせに","わりに","うえに"],"Sekalian pergi ke stasiun, tolong kirimkan surat ini.","〜ついでに."),
 ("私は 彼女の 気持ちを 考える（　　　）、何も 言えなかった。","と",["のに","ほど","うえ"],"Memikirkan perasaannya, saya tak bisa berkata apa-apa.","〜と."),
 ("今年は 去年（　　　）暑い。","より",["ほど ない","から","まで ない"],"Tahun ini lebih panas dari tahun lalu.","〜より."),
 ("日本語は 難しいと 言われて（　　　）、やって みたい。","いても",["いたら","いるのに","いたので"],"Meski dibilang bahasa Jepang sulit, saya ingin mencoba.","〜ても."),
 ("彼女は 結婚して（　　　）、仕事を 続けて いる。","からも",["ながら ない","ので ない","のに ない"],"Setelah menikah pun dia tetap bekerja.","〜からも."),
 ("彼は 約束を 守らない（　　　）、嘘まで つく。","ばかりか",["くせに","ものの","わりに"],"Dia bukan hanya tidak menepati janji, tapi bahkan berbohong.","〜ばかりか."),
 ("子どもたちは 疲れて いる（　　　）、まだ 遊び続けて いる。","にもかかわらず",["からこそ","ものだから","ばかりに"],"Anak-anak masih terus bermain walau lelah.","〜にもかかわらず."),
 ("あの 人は 外国人（　　　）、日本語が 上手だ。","にしては",["だけあって ない","ばかりに","どころか"],"Untuk orang asing, bahasa Jepangnya bagus.","〜にしては."),
 ("母は 私の 将来（　　　）、いつも 心配している。","について",["にとって","によって","に対して ない"],"Ibu selalu mengkhawatirkan masa depan saya.","〜について."),
 ("給料が 安い（　　　）、仕事は きつい。","うえに",["くせに","ものの","わりに ない"],"Gajinya murah, lagipula pekerjaannya berat.","〜うえに."),
 ("今日は 雨（　　　）、風も 強い。","のうえ",["のくせに","のわりに","のあげく"],"Hari ini hujan, ditambah angin kencang.","〜のうえ."),
]
def _ok(r):
    if len(r[2])!=3 or r[1] in r[2] or '（　　　）' not in r[0]: return False
    return not any(re.search(r' (ない|ます|ある|ところ|ようだ)$', w) for w in r[2])
K3 = [r for r in K3 if _ok(r)]
_dr = ("予約が ない","勉強した（","彼は 何を","彼の 気持ちは 分から","彼女の 話は","風邪（","日本語は 難しい","彼女は 結婚","給料が","今年は 去年","駅へ 行く","私は 彼女の","今日は 雨","子どもたちは","母は 私の","スポーツが","家を 出よう","彼に 聞いた")
K3 = [r for r in K3 if not any(x in r[0] for x in _dr)]
