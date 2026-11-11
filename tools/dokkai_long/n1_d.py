# -*- coding: utf-8 -*-
# N1 短文 (lanjutan)
P1 = "Cari kalimat pendapat penulis (biasanya setelah しかし/だが/つまり) lalu cocokkan dengan parafrasenya."
P2 = "Pilihan yang terlalu ekstrem (すべて・必ず・全く) atau memuat hal yang tidak ada di teks hampir pasti salah."
J = 'tan'; JN = 'Teks pendek (内容理解・短文)'
B = [
 dict(slot=J, jenis=JN,
  jp='「失敗は成功のもと」と言うが、失敗から学べる人とそうでない人がいる。その違いは、失敗の原因を自分の外に求めるか、内に求めるかにあるのではないか。「運が悪かった」「上司の指示が悪かった」と考えているうちは、同じ失敗を繰り返しやすい。もちろん、すべてを自分の責任にして落ち込む必要はない。だが、「自分にできることは何だったか」と問い直す習慣を持つ人は、一つの失敗から多くのものを得て成長していくように思われる。',
  id='Ada pepatah "kegagalan adalah awal kesuksesan", tetapi ada orang yang bisa belajar dari kegagalan dan ada yang tidak. Perbedaannya mungkin terletak pada apakah mencari penyebab kegagalan di luar atau di dalam diri. Selama berpikir "sedang sial" atau "instruksi atasan yang salah", kegagalan yang sama mudah terulang. Tentu tidak perlu menimpakan semuanya pada diri sendiri lalu murung. Tetapi orang yang punya kebiasaan bertanya ulang "apa yang bisa saya lakukan" tampaknya memperoleh banyak hal dari satu kegagalan dan tumbuh.',
  qs=[('筆者に よると、失敗から 学べる 人の 特徴は どれか。',
   ['失敗の 原因を すべて 自分の 責任だと 考える', '失敗しても 落ち込まない', '失敗に ついて「自分に できた ことは 何か」と 考え直す', '運や 他人の せいに して 気持ちを 切り替える'],
   2, 'Ciri: bertanya ulang apa yang bisa dilakukan diri sendiri.', '「自分にできることは何だったか」と問い直す習慣を持つ人',
   ['Penulis menyatakan tidak perlu menimpakan semuanya.', 'Tidak disebut soal tidak murung.', 'Itu ciri orang yang mengulang kegagalan.'], P1)]),
 dict(slot=J, jenis=JN,
  jp='観光客の増加は、地域に経済的な恩恵をもたらす。しかし、人気の観光地では、混雑やごみ、騒音など、住民の生活に影響が出る例が相次いでいる。そこで、一部の地域では、入場者数に上限を設けたり、観光客から入域料を徴収したりする取り組みが始まった。賛否はあるが、観光客に自由に楽しんでもらうことと、住民の暮らしを守ることは、どちらかを選ぶ問題ではない。両方を成り立たせるための仕組みを、地域全体で考える段階に来ているのだろう。',
  id='Bertambahnya wisatawan membawa manfaat ekonomi bagi daerah. Namun di tempat wisata populer, berturut-turut terjadi dampak pada kehidupan warga, seperti kepadatan, sampah, dan kebisingan. Karena itu di sebagian daerah dimulai upaya membatasi jumlah pengunjung dan memungut biaya masuk dari wisatawan. Ada pro dan kontra, tetapi membiarkan wisatawan menikmati dengan bebas dan melindungi kehidupan warga bukanlah masalah memilih salah satu. Kini sudah tiba tahap untuk memikirkan, bersama seluruh daerah, sistem yang memungkinkan keduanya terwujud.',
  qs=[('筆者の 考えと して 合って いるのは どれか。',
   ['観光客を 減らして、住民の 生活を 守る ことを 優先するべきだ', '観光客の 自由を 尊重して、規制は 避けるべきだ', '観光客の 楽しみと 住民の 暮らしの 両方を 成り立たせる 仕組みを 考えるべきだ', '入域料を 取る 取り組みは すべての 地域で 義務づけるべきだ'],
   2, 'Penulis: bukan memilih salah satu, perlu sistem yang menjamin keduanya.', '両方を成り立たせるための仕組みを、地域全体で考える段階に来ている',
   ['Penulis menolak pilihan salah satu.', 'Penulis tidak menolak pembatasan.', 'Tidak ada usulan mewajibkan.'], P1)]),
 dict(slot=J, jenis=JN,
  jp='文化祭実行委員の皆さんへ\n\n当日の運営について、以下のとおり変更がありますのでお知らせします。まず、体育館の使用時間が午前十時から午後三時までに短縮されました。これは、午後三時半から市の防災訓練が行われるためです。そのため、午後三時以降に予定していた合唱の発表は、午前の部の最後に移します。また、模擬店の火の使用については、消防署の許可が下りたものに限ります。許可証のコピーを、今週金曜日までに実行委員長の高橋までご提出ください。\n\n顧問　佐々木',
  id='Kepada panitia pelaksana festival budaya\n\nKami umumkan perubahan pelaksanaan hari-H sebagai berikut. Pertama, waktu pemakaian gimnasium dipersingkat menjadi pukul 10.00 sampai 15.00. Ini karena latihan penanggulangan bencana kota akan diadakan mulai pukul 15.30. Karena itu, penampilan paduan suara yang dijadwalkan setelah pukul 15.00 dipindah ke akhir sesi pagi. Selain itu, pemakaian api di stan hanya terbatas yang sudah mendapat izin dari pemadam kebakaran. Mohon kirimkan salinan surat izin kepada ketua panitia Takahashi paling lambat Jumat pekan ini.\n\nPembina Sasaki',
  qs=[('このお知らせの 内容と 合って いるのは どれか。',
   ['体育館は 午後三時半まで 使える', '合唱の 発表は 午前の 部の 最後に 行う', '模擬店では 火を 使う ことが すべて 禁止された', '許可証の コピーは 顧問の 佐々木に 提出する'],
   1, 'Paduan suara dipindah ke akhir sesi pagi.', '午後三時以降に予定していた合唱の発表は、午前の部の最後に移します',
   ['Gimnasium hanya sampai pukul 15.00.', 'Yang dilarang hanya yang tidak berizin.', 'Salinan diserahkan ke ketua panitia Takahashi.'], 'Dokumen bisnis: cocokkan setiap pilihan dengan angka/nama yang disebut.')]),
 dict(slot=J, jenis=JN,
  jp='「話し上手は聞き上手」とよく言われる。しかし、実際に会話の場面を観察してみると、聞き上手と言われる人は、必ずしも相づちが多いわけではない。むしろ、相手が話し終えるまで余計な口を挟まず、話の中で相手が最も力を込めた部分を見つけて、そこについて質問する人が多い。つまり、聞くという行為は、ただ黙って耳を傾けることではなく、相手の言いたいことの中心を捉えようとする能動的な作業なのである。',
  id='Sering dikatakan "pandai bicara berarti pandai mendengar". Namun ketika benar-benar mengamati situasi percakapan, orang yang disebut pendengar baik belum tentu banyak memberi respons. Justru banyak yang tidak menyela sampai lawan bicara selesai, menemukan bagian yang paling ditekankan lawan bicara dalam ceritanya, dan bertanya tentang itu. Artinya, mendengar bukan sekadar diam menyimak, melainkan pekerjaan aktif untuk menangkap inti yang ingin disampaikan lawan bicara.',
  qs=[('筆者が 考える「聞く」という 行為は どれか。',
   ['相手に 合わせて 相づちを たくさん 打つ こと', '黙って 相手の 話を 最後まで 聞く こと', '相手の 言いたい ことの 中心を 捉えようと 努める こと', '相手が 話した ことに 対して 自分の 意見を 述べる こと'],
   2, 'Kalimat つまり: mendengar = pekerjaan aktif menangkap inti.', '相手の言いたいことの中心を捉えようとする能動的な作業',
   ['Teks menyangkal bahwa banyak respons itu wajib.', 'Penulis menyebut bukan sekadar diam.', 'Tidak disebut menyampaikan pendapat sendiri.'], P1)]),
]
