# -*- coding: utf-8 -*-
# N3 内容理解(短文) ~200字 · 1問 / 各
P1 = "Cari kalimat yang menyatakan pendapat/alasan penulis (〜からだ、〜と思う、しかし〜)."
P2 = "Cocokkan setiap pilihan dengan teks; pilihan yang menambahkan hal yang tidak ada di teks adalah salah."
J = 'tan'; JN = 'Teks pendek (内容理解・短文)'
B = [
 dict(slot=J, jenis=JN,
  jp='私は朝ごはんを食べない日が多かったが、最近、毎朝バナナとヨーグルトを食べるようにしている。きっかけは、友達に「朝ごはんを食べると、午前中の仕事がはかどるよ」と言われたことだ。始めてみると、本当に昼前になってもおなかが空かず、集中して勉強できる。準備も簡単なので、続けられそうだ。',
  id='Dulu saya sering tidak sarapan, tetapi akhir-akhir ini saya makan pisang dan yoghurt setiap pagi. Pemicunya adalah teman berkata, "Kalau sarapan, pekerjaan pagi jadi lancar." Setelah mencoba, benar-benar tidak lapar sampai menjelang siang dan bisa belajar dengan fokus. Persiapannya juga mudah sehingga sepertinya bisa berlanjut.',
  qs=[('「私」が 朝ごはんを 食べるように なった きっかけは 何か。',
   ['おなかが 空いて 勉強できなかった こと', '友達に 朝ごはんの 効果を 教えて もらった こと', 'バナナと ヨーグルトが 好きに なった こと', '病院で 朝ごはんを すすめられた こと'],
   1, 'Pemicu: perkataan teman.', '友達に「朝ごはんを食べると、午前中の仕事がはかどるよ」と言われた',
   ['Justru sekarang tidak lapar.', 'Bukan karena suka dulu.', 'Tidak ada dokter.'], P2)]),
 dict(slot=J, jenis=JN,
  jp='図書館の利用者の皆さまへ\n\n来月から、図書館の開館時間が変わります。平日は午前九時から午後八時まで（これまでは午後七時まで）、土曜日・日曜日は午前十時から午後五時までです。なお、毎月第三月曜日は、本の整理のため休館となります。返却ポストは、休館日も二十四時間ご利用いただけます。\n\n市立中央図書館',
  id='Kepada para pengguna perpustakaan\n\nMulai bulan depan, jam buka perpustakaan berubah. Hari kerja pukul 09.00 sampai 20.00 (sebelumnya sampai 19.00), Sabtu dan Minggu pukul 10.00 sampai 17.00. Selain itu, setiap Senin ketiga tiap bulan tutup untuk merapikan buku. Kotak pengembalian dapat dipakai 24 jam meski pada hari tutup.\n\nPerpustakaan Pusat Kota',
  qs=[('このお知らせの 内容と 合って いる ものは どれか。',
   ['平日は 午後七時まで 開いて いる', '土曜日と 日曜日は 午前九時に 開く', '毎月 第三月曜日は 休みだが、本は 返却ポストで 返せる', '返却ポストは 休館日には 使えない'],
   2, 'Hari tutup tetap bisa mengembalikan lewat kotak 24 jam.', '返却ポストは、休館日も二十四時間ご利用いただけます',
   ['Sekarang sampai pukul 20.00.', 'Akhir pekan mulai pukul 10.00.', 'Bisa dipakai pada hari tutup.'], 'Pengumuman: bandingkan angka (jam/hari) di pilihan dengan teks.')]),
 dict(slot=J, jenis=JN,
  jp='先月、初めて一人で海外旅行に行った。出発前は、言葉が通じるか、道に迷わないかと、心配ばかりしていた。ところが、現地では、地図が読めなくて困っていると、必ず誰かが声をかけてくれた。身ぶり手ぶりでも、気持ちは意外と伝わるものだと分かった。この経験で、新しいことに挑戦する前に、あまり心配しすぎなくてもいいのだと思うようになった。',
  id='Bulan lalu saya pertama kali bepergian ke luar negeri seorang diri. Sebelum berangkat, saya hanya mengkhawatirkan apakah bahasanya akan dimengerti dan apakah saya akan tersesat. Namun di sana, ketika bingung karena tak bisa membaca peta, selalu ada orang yang menyapa. Saya tahu bahwa perasaan ternyata tersampaikan walau dengan bahasa tubuh. Dari pengalaman ini, saya jadi berpikir tidak perlu terlalu khawatir sebelum menantang hal baru.',
  qs=[('「私」は この 旅行の 経験から、どう 思うように なったか。',
   ['海外旅行は 一人で 行くのは 危険だ', '言葉が 通じなければ、旅行は 楽しめない', '新しい ことに 挑戦する とき、あまり 心配しすぎなくて いい', '地図が 読めない 人は 旅行に 行かない ほうが いい'],
   2, 'Kesimpulan: tidak perlu terlalu khawatir sebelum mencoba hal baru.', '新しいことに挑戦する前に、あまり心配しすぎなくてもいいのだと思う',
   ['Justru ada orang yang membantu.', 'Perasaan tetap tersampaikan.', 'Bukan itu simpulannya.'], P1)]),
 dict(slot=J, jenis=JN,
  jp='山田さんへ\n\n来週の金曜日に予定していた飲み会ですが、部長が出張で参加できなくなりました。そこで、一週間後の二十五日に変更したいと思っています。場所は同じ駅前のお店で、時間も午後六時半のままです。都合が悪い場合は、今週中に連絡してください。ほかの人にも、私からメールで知らせておきます。\n\n田中',
  id='Kepada Yamada-san\n\nMengenai acara minum bersama yang dijadwalkan Jumat pekan depan, kepala bagian tidak bisa ikut karena dinas luar. Karena itu saya ingin mengubahnya menjadi seminggu kemudian, tanggal 25. Tempatnya sama, toko di depan stasiun, dan waktunya tetap pukul 18.30. Bila tidak cocok, mohon hubungi minggu ini. Pada yang lain juga akan saya beri tahu lewat surel.\n\nTanaka',
  qs=[('田中さんが 山田さんに 頼んで いる ことは 何か。',
   ['新しい お店を 探す こと', '日程の 変更が 都合が 悪ければ、今週中に 連絡する こと', '部長に 出張の 予定を 聞く こと', 'ほかの 人に メールで 知らせる こと'],
   1, 'Diminta menghubungi bila jadwal baru tidak cocok.', '都合が悪い場合は、今週中に連絡してください',
   ['Tempat tidak berubah.', 'Tidak diminta.', 'Itu dilakukan Tanaka sendiri.'], P2)]),
]
