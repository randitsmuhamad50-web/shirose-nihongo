# -*- coding: utf-8 -*-
# N4 文法形式 (K5): dihasilkan dari kerangka terverifikasi (tiap baris tepat SATU jawaban valid)
B = '（　　　）'
K5 = []
# A. そうです (penampilan) - bentuk batang
ADJ = [("おいしい","おいし","Kue itu tampak enak."),("あつい","あつ","Sup itu tampak panas."),("ねむい","ねむ","Adik tampak mengantuk."),("たのしい","たのし","Pesta tampak menyenangkan."),
 ("むずかしい","むずかし","Soal tampak sulit."),("あぶない","あぶな","Jalan tampak berbahaya."),("おもい","おも","Koper tampak berat."),("かなしい","かなし","Dia tampak sedih."),
 ("いそがしい","いそがし","Kakak tampak sibuk."),("さむい","さむ","Di luar tampak dingin."),("うれしい","うれし","Ibu tampak senang."),("つよい","つよ","Orang itu tampak kuat.")]
for a,st,tr in ADJ:
    K5.append(("この "+{"おいしい":"ケーキ","あつい":"スープ","ねむい":"弟","たのしい":"パーティー","むずかしい":"問題","あぶない":"道","おもい":"かばん","かなしい":"人","いそがしい":"兄","さむい":"外","うれしい":"母","つよい":"人"}[a]+" は "+B+"です。" if a not in("ねむい","かなしい","いそがしい","さむい","うれしい","つよい") else {"ねむい":"弟は "+B+"です。","かなしい":"田中さんは "+B+"です。","いそがしい":"兄は "+B+"です。","さむい":"外は "+B+"です。","うれしい":"母は "+B+"です。","つよい":"あの 人は "+B+"です。"}[a],
        st+"そう",[a+"そう",st+"くそう",st+"かったそう"],tr,"Adj-i: buang い + そう (tampak)."))
# C. humble (わたしが ...) - お〜します
H = [("荷物を","持ち","お持ち"),("先生の かばんを","持ち","お持ち"),("お客さんに 地図を","見せ","お見せ"),("先生に 本を","貸し","お貸し"),("おばあさんの 荷物を","手伝い","お手伝い"),("先生に 手紙を","送り","お送り"),("社長に 駅まで","案内し","ご案内"),("お客さんに 傘を","返し","お返し"),("先生に 日程を","知らせ","お知らせ"),("お客さんに お茶を","入れ","お入れ")]
for obj,v,hv in H:
    K5.append(("わたしが "+obj+" "+B+"。", hv+"します",[hv+"に なります",hv+"ください",hv+"でした ない"],"Saya (merendah) melakukannya untuk lawan bicara.","お〜します = merendah (tindakan sendiri)."))
# D. くれる / もらう
KURERU = [("友だち","かさを かして"),("兄","えいがに つれて いって"),("先生","漢字を おしえて"),("となりの 人","荷物を もって"),("母","ごはんを つくって"),("父","くるまで むかえに 来て")]
for who,act in KURERU:
    K5.append((who+"が わたしに "+act+" "+B+"。","くれました",["あげました","もらいました","やりました"],"Ia melakukan untuk saya.","〜てくれる = orang lain melakukan untuk saya."))
MORAU = [("友だち","しゃしんを とって"),("先生","作文を なおして"),("兄","宿題を 手伝って"),("店の 人","荷物を はこんで"),("母","せんたくを して"),("同じ 会社の 人","駅まで 送って")]
for who,act in MORAU:
    K5.append(("わたしは "+who+"に "+act+" "+B+"。","もらいました",["くれました","くださいました","やりました"],"Saya menerima bantuan.","〜てもらう = menerima tindakan."))
# F. jidoushi / tadoushi
P = [("まど","あいて","あきました","あけて","あけました"),("ドア","しまって","しまりました","しめて","しめました"),("でんき","ついて","つきました","つけて","つけました"),
     ("でんき","きえて","きえました","けして","けしました"),("さいふ","おちて","おちました","おとして","おとしました"),("コップ","われて","われました","わって","わりました"),
     ("パソコン","こわれて","こわれました","こわして","こわしました"),("くるま","とまって","とまりました","とめて","とめました"),("本","ならんで","ならびました","ならべて","ならべました"),
     ("会議","はじまって","はじまりました","はじめて","はじめました")]
for k,(n,it,ip,tt,tp) in enumerate(P):
    ot=[x[3] for x in P if x[3]!=tt][k%3::3][:2]; oi=[x[2] for x in P if x[2]!=ip][k%3::3][:2]
    if len(ot)<2: ot=[x[3] for x in P if x[3]!=tt][:2]
    if len(oi)<2: oi=[x[2] for x in P if x[2]!=ip][:2]
    K5.append((n+"が "+B+" います。",it,[tt]+ot,"Sesuatu dalam keadaan (terjadi sendiri).","Jidoushi + ている (が)."))
    K5.append(("わたしが "+n+"を "+B+"。",tp,[ip]+oi,"Saya melakukannya.","Tadoushi + を."))
MAE = [("ねる","はを みがきます","Sebelum tidur saya menggosok gigi."),("出かける","でんきを けします","Sebelum keluar saya mematikan lampu."),("ごはんを 食べる","手を あらいます","Sebelum makan saya cuci tangan."),
 ("でんしゃに のる","きっぷを かいます","Sebelum naik kereta saya beli tiket."),("日本へ 来る","日本語を 勉強しました","Sebelum datang ke Jepang saya belajar bahasa Jepang."),("かいぎが はじまる","しりょうを くばります","Sebelum rapat mulai saya membagikan materi."),
 ("しけんを うける","よく 復習します","Sebelum ujian saya mengulang dengan baik."),("うちへ かえる","スーパーに よります","Sebelum pulang saya mampir ke supermarket."),("りょこうに 行く","ホテルを よやくします","Sebelum wisata saya memesan hotel."),("おふろに はいる","ごはんを たべます","Sebelum mandi saya makan."),
 ("友だちが 来る","へやを そうじします","Sebelum teman datang saya bersih-bersih."),("しごとを はじめる","コーヒーを のみます","Sebelum mulai kerja saya minum kopi.")]
for a,b,tr in MAE: K5.append((a+B+"、"+b+"。","まえに",["あとで","てから","ながら"],tr,"V kamus + まえに = sebelum."))
ATO = [("ごはんを たべた","はを みがきます","Setelah makan saya menggosok gigi."),("しごとが おわった","友だちと のみに 行きます","Setelah kerja selesai saya minum dengan teman."),("おふろに はいった","すぐ ねます","Setelah mandi saya langsung tidur."),
 ("かいぎが おわった","みんなで 食事に 行きました","Setelah rapat selesai kami makan bersama."),("しけんが おわった","旅行に 行きます","Setelah ujian selesai saya pergi wisata."),("そうじを した","おちゃを のみます","Setelah bersih-bersih saya minum teh."),
 ("朝ごはんを 食べた","出かけました","Setelah sarapan saya berangkat."),("じゅぎょうが おわった","としょかんに 行きます","Setelah kelas selesai saya ke perpustakaan.")]
for a,b,tr in ATO: K5.append((a+B+"、"+b+"。","あとで",["まえに","ながら","まで"],tr,"V た + あとで = setelah."))
KOTO = [("日本へ 行った","Saya pernah ke Jepang."),("すしを 食べた","Saya pernah makan sushi."),("ふじさんに のぼった","Saya pernah mendaki Gunung Fuji."),("この 映画を 見た","Saya pernah menonton film ini."),
 ("外国に 住んだ","Saya pernah tinggal di luar negeri."),("馬に のった","Saya pernah naik kuda."),("北海道に 泊まった","Saya pernah menginap di Hokkaido."),("あの 人に 会った","Saya pernah bertemu orang itu.")]
for a,tr in KOTO: K5.append(("わたしは "+a+B+"が あります。","こと",["もの","ほう","よう"],tr,"V た + ことがある = pernah."))
HOU = [("かぜの ときは 早く ねた","Kalau flu lebih baik tidur awal."),("つかれた ときは 休んだ","Kalau lelah lebih baik istirahat."),("あした 早く 起きるなら、今夜は 早く 寝た","Kalau besok bangun pagi, sebaiknya tidur awal malam ini."),
 ("わからない ときは、先生に 聞いた","Kalau tidak paham, sebaiknya tanya guru."),("くもりの 日でも かさを もって 行った","Meski mendung, sebaiknya bawa payung."),("病気の ときは、むりを しない","Saat sakit, sebaiknya jangan memaksakan diri."),
 ("夜 おそく コーヒーを のまない","Sebaiknya jangan minum kopi larut malam."),("ここで 大きい 声で 話さない","Sebaiknya jangan bicara keras di sini.")]
for a,tr in HOU: K5.append((a+B+"が いいです。","ほう",["こと","もの","ところ"],tr,"〜たほうがいい / 〜ないほうがいい."))
