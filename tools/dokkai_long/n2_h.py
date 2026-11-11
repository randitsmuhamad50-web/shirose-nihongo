# -*- coding: utf-8 -*-
# N2 統合理解 tambahan 2 (2問) + 1 tan
PT = "Soal 統合: tandai pendapat A dan B secara terpisah, lalu cari titik temu/perbedaannya."
JT = 'Bacaan gabungan (統合理解)'
R = ['Tidak disebut dalam teks.', 'Berlawanan dengan isi teks.', 'Berlebihan / bukan pendapat penulis.']
def X(jp, id, qs):
    return dict(slot='tou', jenis=JT, jp=jp, id=id, qs=[(q, [ok] + w, 0, al, bu, R, PT) for (q, ok, w, al, bu) in qs])
B = [
 X('<b>【A】</b><br>買い物は、実際に店に行って、商品を手に取って選ぶのがよい。色や大きさ、手触りは、画面では分からない。店員に相談できる安心感もある。<br><br><b>【B】</b><br>インターネットでの買い物は、時間も交通費もかからず、価格の比較も簡単だ。口コミを参考にできる点も便利だ。ただし、サイズが合わず返品することもあるので、衣類のように実物を確認したいものは、店で買うこともある。',
   '[A] Berbelanja sebaiknya datang langsung ke toko dan memilih sambil memegang barang. Warna, ukuran, dan tekstur tak terlihat di layar. Ada pula rasa aman bisa berkonsultasi dengan pegawai.\n[B] Belanja lewat internet tak memakan waktu dan ongkos, dan membandingkan harga mudah. Bisa merujuk ulasan juga praktis. Namun ukuran bisa tak cocok dan dikembalikan, sehingga barang yang ingin dilihat langsung seperti pakaian kadang dibeli di toko.',
   [('Aと Bの 違いは どれか。', 'Aは 実店舗の 良さを 重視し、Bは ネットの 便利さを 認めつつ 場合に よって 店も 使う', ['Aは ネットを 勧め、Bは 店だけを 勧める', 'AもBも ネットでの 買い物に 反対して いる', 'AもBも 店員に 相談する ことを 勧めて いる'], 'A toko fisik; B internet dengan pengecualian.', 'A：店に行って / B：ネット…衣類は店で'),
    ('Bが 店で 買う ことも あると 述べて いる ものは どれか。', '衣類のように 実物を 確認したい もの', ['価格が 高い もの', '口コミが 多い もの', '食べ物'], 'B: pakaian.', '衣類のように実物を確認したいものは、店で買う')]),
 X('<b>【A】</b><br>町の図書館は、そろそろ必要がなくなるかもしれない。電子書籍が普及し、多くの本をスマートフォンで読める時代になったからだ。維持費を考えれば、予算は他のことに使ったほうがよい。<br><br><b>【B】</b><br>図書館は、単に本を借りる場所ではない。静かに勉強できる空間であり、子どもが本と出会う場でもある。電子書籍があっても、紙の本に触れる機会や、地域の人が集まる場所としての役割は、なくならないと思う。',
   '[A] Perpustakaan kota mungkin sebentar lagi tak diperlukan. Karena buku elektronik meluas dan banyak buku bisa dibaca di ponsel. Mengingat biaya pemeliharaan, anggaran lebih baik dipakai untuk hal lain.\n[B] Perpustakaan bukan sekadar tempat meminjam buku. Ia ruang belajar tenang dan tempat anak bertemu buku. Walau ada buku elektronik, kesempatan menyentuh buku kertas dan peran sebagai tempat warga berkumpul takkan hilang.',
   [('図書館の 必要性に ついて、AとBは どう 考えて いるか。', 'Aは 必要が なくなると 考え、Bは 役割が 残ると 考える', ['AもBも 必要だと 考える', 'Aは 必要だと 考え、Bは なくす べきだと 考える', 'AもBも 電子書籍を 否定して いる'], 'A tidak perlu; B perannya tetap.', 'A：必要がなくなるかも / B：役割は、なくならない'),
    ('Aが 図書館に ついて 理由と して 挙げて いる ことは 何か。', '電子書籍が 普及して いる こと', ['利用者が 多すぎる こと', '本が 古い こと', '静かすぎる こと'], 'Alasan A.', '電子書籍が普及し')]),
 X('<b>【A】</b><br>外国語は、できるだけ早く、幼いうちから学び始めるのがよい。子どもは耳がよく、発音も自然に身につきやすい。<br><br><b>【B】</b><br>早く始めれば有利なのは確かだが、母語がしっかりしていないうちに外国語を学ぶと、どちらも中途半端になる恐れがある。まず母語で考える力を育てることが、外国語の上達にもつながると思う。',
   '[A] Bahasa asing sebaiknya dipelajari sedini mungkin sejak kecil. Anak punya telinga bagus dan pelafalan mudah terbentuk alami.\n[B] Memang memulai lebih awal menguntungkan, tetapi bila belajar bahasa asing sebelum bahasa ibu mantap, ada kekhawatiran keduanya jadi setengah-setengah. Menurut saya membangun dulu kemampuan berpikir dalam bahasa ibu juga menyumbang kemajuan bahasa asing.',
   [('Bの 考えと して 正しい ものは どれか。', 'まず 母語の 力を 育てる ことが 大切だ', ['外国語は 学ぶ 必要が ない', '大人に なって から 始める べきだ', '発音は 重要では ない'], 'B: bahasa ibu dulu.', 'まず母語で考える力を育てる'),
    ('AとBに 共通して いる 点は どれか。', '早く 始める ことの 利点を 認めて いる', ['母語の 重要性を 認めて いる', '大人の 学習に 反対して いる', '発音を 重視して いない'], 'Keduanya mengakui keuntungan memulai awal.', 'A：幼いうちから / B：早く始めれば有利なのは確か')]),
 X('<b>【A】</b><br>現金を使う機会は、これからもっと減っていくだろう。電子マネーのほうが、支払いが速く、お金の管理も簡単だ。お釣りを探す手間もなく、衛生的でもある。<br><br><b>【B】</b><br>電子マネーは便利だが、災害で停電したときには使えなくなる。また、使いすぎに気づきにくい面もある。現金は、目に見える分、お金の価値を実感しやすい。当面は、両方を使い分けるのが現実的だと思う。',
   '[A] Kesempatan memakai uang tunai ke depan akan makin berkurang. Uang elektronik pembayarannya lebih cepat dan mengelola uang lebih mudah. Tak perlu repot mencari kembalian dan juga higienis.\n[B] Uang elektronik praktis, tetapi tak bisa dipakai saat listrik padam karena bencana. Juga ada sisi sulit menyadari pemakaian berlebih. Uang tunai terlihat sehingga lebih mudah merasakan nilai uang. Untuk sementara, menurut saya realistis memakai keduanya.',
   [('Bが 電子マネーの 弱点と して 挙げて いる ものは どれか。', '停電の とき 使えない こと', ['支払いが 遅い こと', '衛生的で ない こと', 'お釣りが 出る こと'], 'Kelemahan menurut B.', '停電したときには使えなくなる'),
    ('AとBの 違いは どれか。', 'Aは 電子マネーが 中心に なると 考え、Bは 両方を 使い分ける べきだと 考える', ['Aは 現金を 勧め、Bは 電子マネーだけを 勧める', 'AもBも 現金は 不要だと 考える', 'AもBも 電子マネーは 危険だと 考える'], 'A elektronik; B keduanya.', 'A：現金を使う機会は減る / B：両方を使い分ける')]),
 X('<b>【A】</b><br>会社は、社員が副業をすることを認めるべきだ。本業以外の経験が、新しい発想や人脈につながり、結果的に会社にも利益をもたらす。収入が増えれば、生活の安定にもなる。<br><br><b>【B】</b><br>副業を認めると、本業がおろそかになったり、会社の情報が外に漏れたりする恐れがある。働く時間が長くなり、健康を害する社員も出るかもしれない。会社としては、慎重に判断する必要がある。',
   '[A] Perusahaan sebaiknya mengizinkan karyawan punya pekerjaan sampingan. Pengalaman di luar pekerjaan utama berhubungan dengan gagasan dan jejaring baru, dan akhirnya menguntungkan perusahaan juga. Bila penghasilan naik, hidup juga stabil.\n[B] Bila mengizinkan pekerjaan sampingan, ada kekhawatiran pekerjaan utama terabaikan atau informasi perusahaan bocor. Jam kerja memanjang dan mungkin ada karyawan yang sakit. Perusahaan perlu menilai dengan hati-hati.',
   [('副業に ついて、Bが 懸念して いる ことは どれか。', '本業が おろそかに なる こと', ['収入が 減る こと', '人脈が 増える こと', '生活が 安定する こと'], 'Kekhawatiran B.', '本業がおろそかになったり、情報が漏れたり'),
    ('AとBの 態度の 違いは どれか。', 'Aは 認める べきだと 考え、Bは 慎重に 判断すべきだと 考える', ['Aは 禁止すべきだと 考え、Bは 認めるべきだと 考える', 'AもBも すぐに 認める べきだと 考える', 'AもBも 副業に 無関心だ'], 'A setuju; B hati-hati.', 'A：認めるべき / B：慎重に判断する必要')]),
 X('<b>【A】</b><br>ごみ袋を有料にしたことで、家庭から出るごみは明らかに減った。環境を守るためには、多少の費用負担は仕方がない。むしろ、ごみを減らす意識を高めるきっかけになる。<br><br><b>【B】</b><br>ごみの有料化は、ごみを減らす効果がある一方で、不法投棄が増えるという問題も生んだ。また、収入の少ない家庭にとっては負担が重い。費用を取るだけでなく、リサイクルの仕組みを整えることも同時に必要だ。',
   '[A] Dengan mengenakan biaya kantong sampah, sampah dari rumah tangga jelas berkurang. Demi menjaga lingkungan, sedikit beban biaya tak terhindarkan. Justru jadi kesempatan menaikkan kesadaran mengurangi sampah.\n[B] Pemberlakuan biaya sampah punya efek mengurangi sampah, tetapi juga menimbulkan masalah pembuangan ilegal meningkat. Beban pun berat bagi keluarga berpenghasilan rendah. Selain memungut biaya, perlu pula menata sistem daur ulang sekaligus.',
   [('Bが 指摘する 有料化の 問題点は どれか。', '不法投棄が 増える こと', ['ごみが 増える こと', 'リサイクルが 不要に なる こと', '環境が 悪化する こと'], 'Masalah menurut B.', '不法投棄が増えるという問題'),
    ('AとBの 共通点は どれか。', '有料化に ごみを 減らす 効果が あると 認めて いる', ['有料化に 反対して いる', 'リサイクルを 不要だと 考えて いる', '低所得の 家庭を 無視して いる'], 'Keduanya mengakui efek pengurangan sampah.', 'A：ごみは減った / B：ごみを減らす効果がある')]),
 dict(slot='tan', jenis='Teks pendek (内容理解・短文)',
  jp='電車の中で、座席を譲ろうとして断られたことがある。そのとき、少し傷ついた気持ちになったが、後で考えると、相手にも事情があったのかもしれない。善意は、相手に受け入れられて初めて意味を持つとは限らない。それでも、行動しなければ何も始まらないのも確かだ。断られても、次の機会にまた声をかけようと思う。',
  id='Di kereta saya pernah ditolak ketika hendak memberikan tempat duduk. Saat itu agak terluka, tetapi setelah dipikir, mungkin lawan bicara punya alasan. Niat baik belum tentu bermakna hanya bila diterima. Namun tak ada yang dimulai bila tak bertindak. Meski ditolak, saya ingin menyapa lagi pada kesempatan berikutnya.',
  qs=[('筆者は 席を 断られた あと、どう 考えて いるか。', ['断られても、次の 機会に また 声を かけようと 考えて いる'] + ['二度と 席を 譲らないと 考えて いる', '相手が 失礼だったと 考えて いる', '席を 譲る のは 無意味だと 考えて いる'], 0, 'Penulis tetap ingin mencoba lagi.', '断られても、次の機会にまた声をかけよう',
       ['Penulis tidak berhenti.', 'Penulis tidak menyalahkan lawan.', 'Penulis tidak menganggap sia-sia.'], "Cari kalimat pendapat penulis (setelah それでも/だが) lalu cocokkan dengan parafrasenya.")]),
]
