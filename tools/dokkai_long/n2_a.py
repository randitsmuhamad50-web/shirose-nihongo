# -*- coding: utf-8 -*-
# N2 内容理解(短文) ~300字 · 1問 / 各
P1 = "Cari kalimat pendapat penulis (biasanya setelah しかし/だが/つまり) lalu cocokkan dengan parafrasenya."
P2 = "Pilihan yang terlalu ekstrem (すべて・必ず・全く) atau memuat hal yang tidak ada di teks hampir pasti salah."
J = 'tan'; JN = 'Teks pendek (内容理解・短文)'
B = [
 dict(slot=J, jenis=JN,
  jp='最近、駅や空港で、荷物を預かってくれるロッカーの代わりに、スタッフが荷物を預かって目的地まで届けてくれるサービスを見かけるようになった。観光客が身軽に町を歩けるようにするためのもので、利用者は増えているという。確かに便利ではあるが、私は少し複雑な気持ちになる。重い荷物を背負って歩くことも、旅の思い出の一部だと思うからだ。もちろん、体力に自信のない人や小さな子ども連れの人にとっては、ありがたいサービスだろう。要は、使うか使わないかを自分で選べることが大切なのだと思う。',
  id='Belakangan ini di stasiun dan bandara mulai terlihat layanan di mana staf menitipkan bagasi lalu mengantarkannya ke tujuan, sebagai pengganti loker. Layanan ini dimaksudkan agar wisatawan bisa berjalan ringan di kota, dan penggunanya dikatakan bertambah. Memang praktis, tetapi saya agak bercampur perasaan. Sebab menurut saya berjalan memikul bagasi berat juga bagian dari kenangan perjalanan. Tentu bagi orang yang kurang kuat fisik atau yang membawa anak kecil, ini layanan yang disyukuri. Intinya, yang penting adalah bisa memilih sendiri memakai atau tidak.',
  qs=[('このサービスに ついて、筆者は どう 考えて いるか。',
   ['便利だが、荷物を 持って 歩く 経験にも 価値が あると 感じて いる', '体力の ある 人には 必要ない ので、やめるべきだと 考えて いる', '旅の 思い出を 増やす ために、すべての 人が 使うべきだと 考えて いる', '利用者が 増えて いる ことを 心配して いる'],
   0, 'Penulis: praktis, tetapi memikul bagasi pun bagian kenangan; yang penting bebas memilih.', '重い荷物を背負って歩くことも、旅の思い出の一部だと思う',
   ['Penulis tidak menyuruh menghentikan.', 'Penulis tidak mewajibkan semua orang.', 'Tidak ada kekhawatiran soal jumlah pengguna.'], P1)]),
 dict(slot=J, jenis=JN,
  jp='件名：新商品発表会のご案内\n\nお取引先各位\n\n平素より大変お世話になっております。このたび、弊社では春の新商品発表会を下記のとおり開催いたします。\n日時：三月十日（金）午後二時～四時\n場所：弊社本社ビル　三階ホール\n当日は新商品の試食会も予定しております。なお、会場の駐車場には限りがございますので、お越しの際は公共交通機関をご利用ください。ご出席の可否につきましては、三月三日までに、同封のはがきまたはメールにてお知らせください。\n\n株式会社みどり食品　営業部',
  id='Perihal: Undangan peluncuran produk baru\n\nKepada para mitra bisnis\n\nTerima kasih atas kerja sama Anda. Kali ini perusahaan kami akan menyelenggarakan peluncuran produk baru musim semi sebagai berikut.\nWaktu: Jumat 10 Maret pukul 14.00–16.00\nTempat: Aula lantai 3 gedung kantor pusat kami\nPada hari itu direncanakan juga acara mencicipi produk baru. Karena tempat parkir di lokasi terbatas, mohon gunakan transportasi umum. Mengenai kehadiran, mohon beri tahu paling lambat 3 Maret lewat kartu pos terlampir atau surel.\n\nPT Midori Shokuhin, Bagian Penjualan',
  qs=[('この案内を 受け取った 人が しなければ ならない ことは どれか。',
   ['三月十日までに 駐車場を 予約する', '三月三日までに、出席するか どうかを 連絡する', '当日、試食用の 商品を 持参する', '会場に 公共交通機関で 行く 許可を もらう'],
   1, 'Konfirmasi hadir/tidak paling lambat 3 Maret.', '三月三日までに、同封のはがきまたはメールにてお知らせください',
   ['Parkir hanya terbatas, tidak ada reservasi.', 'Produk dicicipi di tempat.', 'Transportasi umum hanya anjuran.'], 'Dokumen bisnis: cari kata "いつまでに / お知らせください" untuk tahu tindakan yang diminta.')]),
 dict(slot=J, jenis=JN,
  jp='日本語には、「ありがとう」の代わりに「すみません」と言う場面が多い。外国人の学習者には不思議に聞こえるようだが、これは、相手に手間をかけさせたことを申し訳なく思う気持ちが、感謝の中に含まれているからだと考えられる。例えば、席を譲ってもらったときに「すみません」と言うのは、謝っているのではなく、「あなたに無理をさせてしまいましたが、ありがとう」という意味合いなのである。このように、一つの言葉が複数の気持ちを表すことが、日本語の表現の特徴の一つだと言えよう。',
  id='Dalam bahasa Jepang, ada banyak situasi di mana orang mengatakan "sumimasen" sebagai pengganti "arigatou". Bagi pelajar asing ini terdengar aneh, tetapi hal ini dianggap karena dalam rasa terima kasih terkandung rasa tidak enak telah merepotkan lawan bicara. Misalnya, mengatakan "sumimasen" saat diberi tempat duduk bukan meminta maaf, tetapi bermakna "maaf telah memaksa Anda, terima kasih". Dengan demikian, satu kata mengungkapkan beberapa perasaan, yang dapat disebut salah satu ciri ungkapan bahasa Jepang.',
  qs=[('席を 譲って もらった ときの「すみません」は、どのような 意味か。',
   ['席を 譲って もらえなくて 残念だと いう 気持ち', '席を 譲った 人を 責める 気持ち', '手間を かけさせた 申し訳なさと 感謝の 両方の 気持ち', '席に 座る ことを ためらう 気持ち'],
   2, 'Mengandung rasa tidak enak sekaligus terima kasih.', '「あなたに無理をさせてしまいましたが、ありがとう」という意味合い',
   ['Bukan kecewa.', 'Bukan menyalahkan.', 'Bukan ragu duduk.'], P1)]),
 dict(slot=J, jenis=JN,
  jp='私の勤める会社では、先月から「会議は三十分以内」というルールを試している。以前は一時間を超える会議も珍しくなく、結論が出ないまま終わることも多かった。ルールを決めてから、参加者が事前に資料を読んでくるようになり、話し合いの焦点も絞られてきた。一方で、時間内に収めようとするあまり、じっくり議論すべき問題まで急いで決めてしまうのではないかという意見も出ている。時間を区切ることは有効だが、議題によっては例外を認める柔軟さも必要だろう。',
  id='Di perusahaan tempat saya bekerja, sejak bulan lalu dicoba aturan "rapat dalam 30 menit". Sebelumnya rapat lebih dari satu jam bukan hal langka dan sering berakhir tanpa kesimpulan. Sejak aturan itu ditetapkan, peserta mulai membaca materi sebelumnya dan fokus diskusi menyempit. Di sisi lain, muncul pendapat bahwa karena berusaha selesai tepat waktu, masalah yang seharusnya dibahas mendalam pun diputuskan terburu-buru. Membatasi waktu efektif, tetapi tergantung agenda, diperlukan juga kelonggaran mengakui pengecualian.',
  qs=[('筆者の 考えに 最も 近い ものは どれか。',
   ['会議の 時間制限は 無意味なので、やめるべきだ', '時間制限は 効果が あるが、議題に よっては 例外も 認めるべきだ', 'すべての 会議を 三十分より 短く するべきだ', '事前に 資料を 読む 必要は ない'],
   1, 'Penulis: efektif, tetapi perlu pengecualian sesuai agenda.', '時間を区切ることは有効だが、議題によっては例外を認める柔軟さも必要',
   ['Penulis mengakui efeknya.', 'Tidak ada saran lebih pendek.', 'Peserta justru membaca materi.'], P1)]),
]
