# -*- coding: utf-8 -*-
# N5 文章の文法 tambahan (S3): kata sambung. Tiap soal hanya satu penghubung yang logis.
def B(t, ok, w, tr, rule): return (t, ok, w, tr, rule)
ALL = ["だから","でも","それから","そして"]
W = {"だから": ["でも","しかし","ところで"], "でも": ["だから","そして","ところで"], "それから": ["でも","だから","ところで"], "そして": ["でも","だから","ところで"]}
def mk(t, ok, tr, rule):
    return B(t, ok, list(W[ok]), tr, rule)
S3 = [
 mk("あめが ふって いました。（　）、わたしは うちに いました。","だから","Hujan turun. Karena itu saya di rumah.","Sebab → akibat = だから."),
 mk("きのうは さむかったです。（　）、きょうは あたたかいです。","でも","Kemarin dingin. Tetapi hari ini hangat.","Kontras = でも."),
 mk("あさ、シャワーを あびました。（　）、あさごはんを たべました。","それから","Pagi mandi. Lalu sarapan.","Urutan = それから."),
 mk("この みせは やすいです。（　）、おいしいです。","そして","Toko ini murah. Dan juga enak.","Penambahan = そして."),
 mk("あしたは テストです。（　）、きょう べんきょうします。","だから","Besok ujian. Karena itu hari ini saya belajar.","Sebab → akibat = だから."),
 mk("にほんごは むずかしいです。（　）、おもしろいです。","でも","Bahasa Jepang sulit. Tetapi menarik.","Kontras = でも."),
 mk("えきで きっぷを かいました。（　）、でんしゃに のりました。","それから","Beli tiket di stasiun. Lalu naik kereta.","Urutan = それから."),
 mk("わたしの へやは ひろいです。（　）、あかるいです。","そして","Kamar saya luas. Dan juga terang.","Penambahan = そして."),
 mk("おなかが いたいです。（　）、びょういんへ いきます。","だから","Perut saya sakit. Karena itu saya pergi ke rumah sakit.","Sebab → akibat = だから."),
 mk("ともだちに でんわを しました。（　）、でませんでした。","でも","Saya menelepon teman. Tetapi tidak diangkat.","Kontras = でも."),
 mk("こうえんを さんぽしました。（　）、うちへ かえりました。","それから","Jalan-jalan di taman. Lalu pulang ke rumah.","Urutan = それから."),
 mk("かれは やさしいです。（　）、あたまも いいです。","そして","Dia baik hati. Dan juga pintar.","Penambahan = そして."),
 mk("ねつが あります。（　）、きょうは がっこうを やすみます。","だから","Saya demam. Karena itu hari ini bolos sekolah.","Sebab → akibat = だから."),
 mk("まいにち れんしゅうしました。（　）、じょうずに なりませんでした。","でも","Saya berlatih tiap hari. Tetapi tidak jadi mahir.","Kontras = でも."),
 mk("ごはんを たべました。（　）、はを みがきました。","それから","Makan nasi. Lalu menggosok gigi.","Urutan = それから."),
 mk("この かばんは かるいです。（　）、じょうぶです。","そして","Tas ini ringan. Dan juga kuat.","Penambahan = そして."),
 mk("おかねが ありません。（　）、なにも かえません。","だから","Tidak punya uang. Karena itu tak bisa membeli apa pun.","Sebab → akibat = だから."),
 mk("よく ねました。（　）、まだ ねむいです。","でも","Saya tidur nyenyak. Tetapi masih mengantuk.","Kontras = でも."),
 mk("うちに かえりました。（　）、シャワーを あびました。","それから","Pulang ke rumah. Lalu mandi.","Urutan = それから."),
 mk("わたしは ねこが すきです。（　）、いぬも すきです。","そして","Saya suka kucing. Dan juga suka anjing.","Penambahan = そして."),
 mk("きょうは やすみです。（　）、ゆっくり ねます。","だから","Hari ini libur. Karena itu saya tidur santai.","Sebab → akibat = だから."),
 mk("さむいです。（　）、まどを あけました。","でも","Dingin. Tetapi saya membuka jendela.","Kontras = でも."),
 mk("コーヒーを のみました。（　）、しごとを はじめました。","それから","Minum kopi. Lalu mulai bekerja.","Urutan = それから."),
 mk("この へやは しずかです。（　）、きれいです。","そして","Kamar ini tenang. Dan juga bersih.","Penambahan = そして."),
 mk("バスが きませんでした。（　）、あるいて いきました。","だから","Bus tidak datang. Karena itu saya jalan kaki.","Sebab → akibat = だから."),
 mk("ちいさい くるまです。（　）、はやいです。","でも","Mobil kecil. Tetapi cepat.","Kontras = でも."),
 mk("しゅくだいを しました。（　）、テレビを みました。","それから","Mengerjakan PR. Lalu menonton TV.","Urutan = それから."),
 mk("あの ひとは せんせいです。（　）、かしゅです。","そして","Orang itu guru. Dan juga penyanyi.","Penambahan = そして."),
 mk("あした あめが ふります。（　）、でかけません。","だから","Besok hujan. Karena itu tak pergi.","Sebab → akibat = だから."),
 mk("おいしい ですが、たかいです。（　）、また かいます。","でも","Enak tapi mahal. Tetapi saya akan beli lagi.","Kontras = でも."),
]
