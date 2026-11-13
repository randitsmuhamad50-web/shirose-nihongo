# -*- coding: utf-8 -*-
# N1 内容理解(短文) ~350字 · 1問 / 各
P1 = "Cari kalimat pendapat penulis (biasanya setelah しかし/だが/つまり) lalu cocokkan dengan parafrasenya."
P2 = "Pilihan yang terlalu ekstrem (すべて・必ず・全く) atau memuat hal yang tidak ada di teks hampir pasti salah."
J = 'tan'; JN = 'Teks pendek (内容理解・短文)'
B = [
 dict(slot=J, jenis=JN,
  jp='「専門家に任せておけば安心だ」という考えは、一見すると合理的である。自分で調べる手間も省けるし、間違いも少ないだろう。しかし、あらゆる判断を専門家に委ねた結果、私たちは自分で考える力を少しずつ手放してしまってはいないだろうか。専門家の意見は、あくまで判断の材料の一つにすぎない。その材料を理解したうえで、最終的に何を選ぶかは、自分の価値観に照らして決めるほかないのである。専門家を頼ることと、思考を放棄することとは、似ているようでまったく別のことだと言えよう。',
  id='Anggapan "serahkan saja pada ahli maka aman" sekilas tampak rasional. Repot mencari tahu sendiri berkurang, dan kesalahan mungkin lebih sedikit. Namun, akibat menyerahkan segala keputusan kepada ahli, bukankah kita sedikit demi sedikit melepaskan kemampuan berpikir sendiri? Pendapat ahli tidak lebih dari satu bahan pertimbangan. Setelah memahami bahan itu, apa yang akhirnya dipilih mau tidak mau harus diputuskan berdasarkan nilai diri sendiri. Mengandalkan ahli dan meninggalkan pemikiran tampak mirip, tetapi sama sekali berbeda.',
  qs=[('筆者の 考えと して 最も 適切な ものは どれか。',
   ['専門家の 意見は 参考に せず、自分で 調べた 情報だけを 信じるべきだ', '専門家の 意見を 材料と して 理解した うえで、最後は 自分で 判断するべきだ', '判断を 誤らない ためには、できるだけ 多くの 専門家に 任せるべきだ', '専門家は 価値観に よって 意見が 変わるので、信用できない'],
   1, 'Penulis: ahli = bahan pertimbangan; keputusan akhir harus sesuai nilai diri sendiri.', 'その材料を理解したうえで、最終的に何を選ぶかは、自分の価値観に照らして決めるほかない',
   ['Penulis tidak menyuruh mengabaikan ahli.', 'Menyerahkan semuanya justru yang dikritik.', 'Penulis tidak menyebut ahli tidak bisa dipercaya.'], P1)]),
 dict(slot=J, jenis=JN,
  jp='先週、社内で行った新人研修のアンケート結果がまとまった。「内容が実務に役立つ」と答えた人は九割を超えたが、「研修の進め方」については意見が分かれた。講義形式を好む人が四割、グループ演習を好む人が四割、残りは「どちらでもよい」という回答だった。自由記述欄には「講義で基礎を固めてから演習に進みたい」という声が目立った。この結果を受け、来年度は前半を講義、後半を演習とする二部構成に改めることにした。ただし、参加者の経験の差が大きいため、演習の班分けには工夫が必要だと考えている。',
  id='Pekan lalu, hasil angket pelatihan karyawan baru di perusahaan telah terkumpul. Yang menjawab "isinya berguna untuk pekerjaan" melebihi 90%, tetapi pendapat terbelah mengenai "cara pelaksanaan". Yang suka kuliah 40%, yang suka latihan kelompok 40%, sisanya menjawab "terserah". Di kolom isian bebas menonjol suara "ingin mematangkan dasar lewat kuliah dahulu baru ke latihan". Berdasarkan hasil ini, tahun depan diputuskan untuk mengubah menjadi dua bagian: kuliah di paruh pertama, latihan di paruh kedua. Namun karena perbedaan pengalaman peserta besar, pembagian kelompok latihan perlu diakali.',
  qs=[('この 文章の 内容と 合って いるのは どれか。',
   ['アンケートでは、研修の 内容に 満足した 人が 半数に 満たなかった', '講義形式を 好む 人と 演習形式を 好む 人は、ほぼ 同じ 割合だった', '来年度は、すべて 演習形式の 研修に 変更する', '参加者の 経験に 差が ない ため、班分けは 問題に ならない'],
   1, 'Teks: kuliah 40% dan latihan 40% → hampir sama.', '講義形式を好む人が四割、グループ演習を好む人が四割',
   ['Yang menjawab berguna melebihi 90%.', 'Yang diputuskan adalah dua bagian, bukan semua latihan.', 'Justru perbedaan pengalaman besar sehingga perlu akal.'], P2)]),
 dict(slot=J, jenis=JN,
  jp='書店が次々と姿を消している。インターネット通販や電子書籍の普及が原因だと言われることが多いが、それだけではないように思う。かつての書店は、目的の本を買う場所であると同時に、思いがけない一冊に出会う場所でもあった。棚の前をぶらぶら歩き、題名に惹かれて手に取る。そうした偶然の出会いこそが、読書の世界を広げてくれた。検索すれば欲しい本はすぐに見つかるが、検索では「自分が知らないこと」には出会えない。便利さと引き換えに失われたものの大きさを、私たちはもう少し真剣に考えるべきだろう。',
  id='Toko buku menghilang satu per satu. Penyebabnya sering dikatakan karena maraknya belanja daring dan buku elektronik, tetapi saya rasa bukan hanya itu. Toko buku dahulu adalah tempat membeli buku yang dituju sekaligus tempat bertemu dengan sebuah buku tak terduga. Berjalan santai di depan rak, tertarik pada judul lalu mengambilnya. Pertemuan kebetulan seperti itulah yang memperluas dunia bacaan. Dengan mencari, buku yang diinginkan cepat ketemu, tetapi lewat pencarian kita tidak bisa bertemu dengan "hal yang tidak kita ketahui". Kita perlu memikirkan lebih serius besarnya hal yang hilang sebagai ganti kepraktisan.',
  qs=[('筆者が 書店の 減少に ついて 最も 問題だと 考えて いるのは どれか。',
   ['欲しい 本が 検索しても 見つからなく なった こと', '偶然の 出会いを 通して 読書の 世界が 広がる 機会が 失われる こと', '電子書籍の 値段が 紙の 本より 高く なった こと', '書店で 働く 人の 仕事が 減って しまう こと'],
   1, 'Inti: pertemuan kebetulan yang memperluas dunia bacaan hilang.', '偶然の出会いこそが、読書の世界を広げてくれた',
   ['Justru dengan pencarian buku mudah ditemukan.', 'Harga tidak dibahas.', 'Pekerjaan karyawan tidak dibahas.'], P1)]),
 dict(slot=J, jenis=JN,
  jp='件名：会議室の予約方法変更のお知らせ\n\n各部署の皆様\n\n来月一日より、会議室の予約方法が変わります。これまでは総務課への電話またはメールで受け付けておりましたが、今後は社内ポータルサイトの予約システムからのみ受け付けます。予約は利用日の二週間前から前日の午後五時まで可能です。なお、前日までに取り消しの手続きがなかった場合は、当日の無断キャンセルとみなし、その部署による翌月の新規予約を一週間停止いたします。システムの操作に不明な点がある方は、総務課の鈴木までご連絡ください。\n\n総務課',
  id='Perihal: Pemberitahuan perubahan cara pemesanan ruang rapat\n\nKepada seluruh departemen\n\nMulai tanggal satu bulan depan, cara pemesanan ruang rapat berubah. Sebelumnya diterima lewat telepon atau surel ke Bagian Umum, tetapi ke depan hanya diterima melalui sistem pemesanan di portal internal. Pemesanan bisa dilakukan dari dua pekan sebelum hari pemakaian hingga pukul 17.00 sehari sebelumnya. Bila tidak ada prosedur pembatalan sampai sehari sebelumnya, dianggap pembatalan tanpa pemberitahuan pada hari H, dan pemesanan baru departemen itu bulan berikutnya dihentikan selama satu minggu. Yang tidak paham cara mengoperasikan sistem silakan hubungi Suzuki dari Bagian Umum.\n\nBagian Umum',
  qs=[('このお知らせの 内容と 合って いるのは どれか。',
   ['来月から、会議室の 予約は 電話でも メールでも できる', '予約は 利用日の 前日の 午後五時までに 取り消さないと、ペナルティが ある', '予約は 利用日の 当日の 朝まで 受け付けて いる', 'システムの 操作に ついて 分からない ときは、各部署の 担当者に 聞く'],
   1, 'Jika tidak dibatalkan sampai sehari sebelumnya → pemesanan baru dihentikan seminggu.', '前日までに取り消しの手続きがなかった場合は…翌月の新規予約を一週間停止',
   ['Mulai bulan depan hanya lewat sistem.', 'Pemesanan sampai pukul 17.00 sehari sebelumnya.', 'Yang ditanya adalah Suzuki di Bagian Umum.'], 'Dokumen bisnis: perhatikan syarat waktu (いつまでに) dan akibatnya.')]),
]
