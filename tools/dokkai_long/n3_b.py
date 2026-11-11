# -*- coding: utf-8 -*-
# N3 中文 ~350字 · 2問 / 各  ;  長文 ~550字 · 3問 / 各
P1 = "Cari kalimat yang menyatakan pendapat/alasan penulis (〜からだ、〜と思う、しかし〜)."
P2 = "Soal 指示語 (それ/これ): lihat kalimat tepat sebelumnya."
P3 = "Cocokkan setiap pilihan dengan teks; pilihan yang menambahkan hal yang tidak ada di teks adalah salah."
JC = 'chu'; JCN = 'Teks menengah (内容理解・中文)'
JL = 'cho'; JLN = 'Teks panjang (内容理解・長文)'
B = [
 dict(slot=JC, jenis=JCN,
  jp='うちの近所に、小さなパン屋がある。朝七時に開店するが、六時ごろからいつも店の前に人が並んでいる。人気の理由は、毎朝店主がその日の天気や気温に合わせて、生地の水分や焼き時間を調整しているからだそうだ。\n　先日、店主に「毎日同じように作ればいいのでは」と聞いてみた。すると、「同じ味を出すために、毎日少しずつ変えているんです」という答えが返ってきた。同じ材料でも、湿気が多い日と乾燥した日では、生地の状態がまったく違うのだという。\n　その話を聞いて、「いつも同じ」を続けることの難しさを知った。お客さんが気づかないところで、店主が毎日努力しているのだと思うと、そのパンが一層おいしく感じられた。',
  id='Di dekat rumah saya ada toko roti kecil. Buka pukul 7 pagi, tetapi sejak sekitar pukul 6 selalu ada orang mengantre di depan toko. Alasan populernya konon karena setiap pagi pemilik menyesuaikan kadar air adonan dan waktu pemanggangan dengan cuaca dan suhu hari itu.\nBeberapa hari lalu saya bertanya kepada pemilik, "Bukankah cukup membuat dengan cara yang sama setiap hari?" Jawabannya, "Agar rasanya sama, saya mengubahnya sedikit setiap hari." Bahkan dengan bahan yang sama, kondisi adonan sama sekali berbeda antara hari lembap dan hari kering.\nMendengar itu, saya tahu sulitnya terus mempertahankan "selalu sama". Memikirkan pemilik berusaha setiap hari di tempat yang tak disadari pelanggan, roti itu terasa makin lezat.',
  qs=[('パン屋の 店主は、なぜ 毎日 少しずつ 作り方を 変えて いるのか。',
   ['お客さんに 飽きられない ように する ため', '天気や 気温が 違っても、同じ 味を 出す ため', '新しい 味の パンを 作る ため', '材料の 値段が 毎日 変わる ため'],
   1, 'Agar rasa tetap sama walau kondisi berbeda.', '同じ味を出すために、毎日少しずつ変えている',
   ['Bukan agar tidak bosan.', 'Bukan rasa baru.', 'Harga tidak dibahas.'], P3),
   ('「私」は、店主の 話を 聞いて どう 感じたか。',
   ['「同じ」を 続ける ことは 簡単だと 感じた', '店主の 努力を 知って、パンが もっと おいしく 感じられた', '店主の 考えは 理解できないと 感じた', 'ほかの パン屋にも 行って みたいと 感じた'],
   1, 'Penulis merasa roti makin lezat setelah tahu usaha pemilik.', 'そのパンが一層おいしく感じられた',
   ['Justru tahu sulitnya.', 'Penulis memahami.', 'Tidak disebut.'], P1)]),
 dict(slot=JC, jenis=JCN,
  jp='日本では、ごみを細かく分別して出すのが普通である。住んでいる町によって決まりは違うが、燃えるごみ、燃えないごみ、プラスチック、びん・缶など、五種類以上に分けるところも多い。\n　外国から来た友人は、初めは「面倒だ」と言っていた。しかし、半年たつと、「分別するようになって、自分がどれだけごみを出しているかが分かった」と話してくれた。ごみを分けるたびに、使い捨ての容器や包装が意外に多いことに気づき、買い物のときにできるだけ減らそうと考えるようになったのだそうだ。\n　分別は、ごみを減らすためだけでなく、自分の生活を見直すきっかけにもなる。面倒に思えることでも、続けてみると新しい発見があるものだ。',
  id='Di Jepang, wajar membuang sampah dengan memilahnya secara rinci. Aturannya berbeda menurut kota, tetapi banyak tempat membaginya menjadi lima jenis atau lebih, seperti sampah terbakar, tak terbakar, plastik, botol dan kaleng.\nTeman saya dari luar negeri awalnya berkata "merepotkan". Namun setelah setengah tahun, ia berkata, "Setelah memilah, saya jadi tahu berapa banyak sampah yang saya keluarkan." Setiap memilah, ia sadar bahwa wadah dan kemasan sekali pakai ternyata banyak, dan mulai berpikir untuk mengurangi sebisa mungkin saat berbelanja.\nMemilah sampah bukan hanya untuk mengurangi sampah, tetapi juga menjadi kesempatan meninjau ulang kehidupan sendiri. Bahkan hal yang tampak merepotkan, bila dilanjutkan, ada penemuan baru.',
  qs=[('外国から 来た 友人は、ごみの 分別を 続けて、どう 変わったか。',
   ['分別が 面倒で、やめて しまった', '買い物の とき、ごみを 減らす ことを 考えるように なった', 'ごみを 出す 回数が 増えた', 'ごみの 種類が 少なく なった'],
   1, 'Mulai memikirkan pengurangan saat berbelanja.', '買い物のときにできるだけ減らそうと考えるようになった',
   ['Ia justru lanjut.', 'Tidak disebut.', 'Tidak disebut.'], P3),
   ('筆者が この 文章で 最も 言いたい ことは 何か。',
   ['ごみの 分別の ルールは 全国で 同じに するべきだ', '面倒に 思える ことでも、続けると 新しい 発見が ある', '外国人には 分別は 難しすぎる', 'ごみは 分別しなくても 問題は ない'],
   1, 'Kalimat penutup: ada penemuan baru bila dilanjutkan.', '面倒に思えることでも、続けてみると新しい発見があるものだ',
   ['Aturan berbeda menurut kota tapi bukan itu tujuannya.', 'Tidak disebut sulit.', 'Berlawanan dengan isi.'], P1)]),
 dict(slot=JL, jenis=JLN,
  jp='私は子どものころ、本を読むのが苦手だった。長い文章を読んでいると、すぐに眠くなってしまったからだ。そんな私が読書を好きになったのは、中学二年生のときの、国語の先生のおかげである。\n　ある日、先生は授業の最後に、一冊の小説の最初の数ページを読んでくれた。物語は、主人公が山の中で道に迷う場面で終わった。「続きが気になる人は、図書室で借りてください」と、先生は言った。私はその日のうちに、図書室へ走った。\n　それまで、本は「読まなければならないもの」だと思っていた。しかし、あの日の私は、続きが知りたくて、自分から本を手に取った。それは初めての経験だった。小説を読み終えたとき、私は、本の中に自分の知らない世界が広がっていることに、初めて気づいた。\n　今、私は小学校で働いている。子どもたちに本を好きになってもらいたいと思い、先生の真似をして、物語の途中まで読み聞かせをしている。「続きは自分で読んでね」と言うと、子どもたちは目を輝かせて、図書室へ向かう。\n　本を読むことを教えるのではなく、読みたいという気持ちを育てること。それが、あの先生から私が受け取った、いちばん大切なものである。',
  id='Saat kecil saya tidak suka membaca buku, karena saat membaca tulisan panjang saya cepat mengantuk. Saya yang seperti itu menyukai membaca berkat guru bahasa Jepang saat kelas dua SMP.\nSuatu hari, di akhir pelajaran, guru membacakan beberapa halaman pertama sebuah novel. Cerita berakhir di adegan tokoh utama tersesat di pegunungan. Guru berkata, "Yang penasaran dengan lanjutannya, pinjamlah di perpustakaan." Hari itu juga saya berlari ke perpustakaan.\nSebelumnya saya mengira buku adalah "sesuatu yang harus dibaca". Namun saat itu, karena ingin tahu lanjutannya, saya mengambil buku atas kemauan sendiri. Itu pengalaman pertama. Ketika selesai membaca novel itu, saya untuk pertama kalinya menyadari bahwa di dalam buku terbentang dunia yang tidak saya ketahui.\nSekarang saya bekerja di SD. Karena ingin anak-anak menyukai buku, saya meniru guru dan membacakan cerita sampai tengah. Bila saya berkata "lanjutannya baca sendiri ya", anak-anak dengan mata berbinar menuju perpustakaan.\nBukan mengajarkan cara membaca, melainkan menumbuhkan keinginan untuk membaca. Itulah hal terpenting yang saya terima dari guru itu.',
  qs=[('「私」が 読書を 好きに なった きっかけは 何か。',
   ['長い 文章を 読むのが 得意に なった こと', '先生が 小説の 途中まで 読んで くれた こと', '図書室で 友達に 本を すすめられた こと', '国語の 試験で 良い 点を 取った こと'],
   1, 'Pemicu: guru membacakan sebagian novel.', '先生は授業の最後に、一冊の小説の最初の数ページを読んでくれた',
   ['Dulu tidak bisa.', 'Tidak disebut teman.', 'Tidak disebut ujian.'], P3),
   ('「それは 初めての 経験だった」と ありますが、何が 初めての 経験だったのか。',
   ['図書室に 行った こと', '続きが 知りたくて、自分から 本を 手に 取った こと', '先生に 本を 借りた こと', '小説を 最後まで 読んだ こと'],
   1, 'Mengambil buku atas kemauan sendiri.', '続きが知りたくて、自分から本を手に取った',
   ['Bukan sekadar pergi ke perpustakaan.', 'Pengalaman itu bukan meminjam dari guru.', 'Membaca sampai akhir terjadi setelahnya.'], P2),
   ('「私」が 先生から 受け取った いちばん 大切な ものは 何か。',
   ['物語の 続きを 読み聞かせる 方法', '読みたいと いう 気持ちを 育てる 考え方', '国語を 教える 技術', '図書室を 利用する 習慣'],
   1, 'Kalimat penutup.', '本を読むことを教えるのではなく、読みたいという気持ちを育てること',
   ['Hanya contoh cara, bukan inti.', 'Bukan teknik mengajar bahasa.', 'Bukan sekadar kebiasaan.'], P1)]),
]
