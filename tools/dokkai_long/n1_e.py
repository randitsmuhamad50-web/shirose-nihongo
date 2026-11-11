# -*- coding: utf-8 -*-
# N1 中文 (lanjutan) · 3問 / 各
P1 = "Cari kalimat pendapat penulis (biasanya setelah しかし/だが/つまり) lalu cocokkan dengan parafrasenya."
P2 = "Soal 下線部: baca kalimat sebelum dan sesudahnya; jawaban hampir selalu ada di sana."
P3 = "Pilihan yang terlalu ekstrem (すべて・必ず・全く) atau memuat hal yang tidak ada di teks hampir pasti salah."
J = 'chu'; JN = 'Teks menengah (内容理解・中文)'
B = [
 dict(slot=J, jenis=JN,
  jp='人工知能が人間の仕事を奪うのではないかという不安が、あちこちで語られている。確かに、定型的な作業や大量のデータの処理は、すでに機械のほうが得意になりつつある。だが、仕事がなくなるかどうかという問いの立て方そのものに、私は疑問を感じている。\n　歴史を振り返れば、新しい技術が登場するたびに、特定の職業が姿を消してきた。しかし、同時に、それまで存在しなかった仕事が生まれ、人々はそちらへと移っていった。問題は、仕事の総量が減るかどうかよりも、移り変わりの過程で取り残される人が出ることではないだろうか。\n　技術の変化は、個人の努力だけで乗り越えられるものではない。新しい技能を学び直す機会や、その間の生活を支える仕組みを社会がどれだけ用意できるかが問われている。「機械に負けないように努力せよ」という言葉は、一見前向きに聞こえるが、構造的な課題を個人の責任にすり替えてしまう危うさをはらんでいる。\n　私たちが考えるべきは、機械と競争することではなく、機械と共存する社会を誰がどう設計するかなのである。',
  id='Kecemasan bahwa kecerdasan buatan akan merebut pekerjaan manusia dibicarakan di mana-mana. Memang, pekerjaan rutin dan pemrosesan data besar sudah mulai lebih dikuasai mesin. Namun saya meragukan cara mengajukan pertanyaannya, yaitu "apakah pekerjaan akan hilang".\nJika menengok sejarah, setiap kali teknologi baru muncul, pekerjaan tertentu menghilang. Tetapi pada saat yang sama lahir pekerjaan yang sebelumnya tidak ada, dan orang berpindah ke sana. Masalahnya bukan apakah jumlah total pekerjaan berkurang, melainkan adanya orang yang tertinggal dalam proses peralihan.\nPerubahan teknologi tidak bisa diatasi dengan usaha individu saja. Yang dipertanyakan ialah seberapa besar masyarakat menyediakan kesempatan belajar ulang keterampilan baru dan sistem yang menopang hidup selama itu. Ungkapan "berusahalah agar tidak kalah dari mesin" terdengar positif, tetapi mengandung bahaya mengalihkan masalah struktural menjadi tanggung jawab individu.\nYang perlu kita pikirkan bukan bersaing dengan mesin, melainkan siapa dan bagaimana merancang masyarakat yang hidup berdampingan dengan mesin.',
  qs=[('筆者が 「仕事が なくなるかどうかという 問いの 立て方そのものに 疑問を 感じて いる」のは なぜか。',
   ['実際に 仕事が なくなる ことは ありえないから', '本当の 問題は 仕事の 量より、変化の 過程で 取り残される 人が 出る ことだから', '新しい 仕事は 古い 仕事より 必ず 賃金が 高いから', '人工知能の 技術は まだ 発展して いないから'],
   1, 'Alasan: masalah sebenarnya = orang yang tertinggal dalam peralihan.', '問題は、仕事の総量が減るかどうかよりも、移り変わりの過程で取り残される人が出ること',
   ['Teks mengakui sebagian pekerjaan menghilang.', 'Upah tidak dibahas.', 'Teks mengakui AI sudah kuat.'], P2),
   ('筆者は 「機械に 負けないように 努力せよ」という 言葉を どう 見て いるか。',
   ['前向きで、すべての 人に 勧められる 言葉だ', '個人の 責任に すり替えて しまう 危うさが ある', '機械に 勝つ ためには 当然 必要な 言葉だ', '社会の 支えが ある ときだけ 意味を 持つ 言葉だ'],
   1, 'Penulis: mengalihkan masalah struktural jadi tanggung jawab individu.', '構造的な課題を個人の責任にすり替えてしまう危うさをはらんでいる',
   ['Penulis mengkritik, tidak merekomendasikan.', 'Penulis tidak menganggap itu perlu.', 'Penulis tidak membatasi maknanya seperti itu.'], P1),
   ('この 文章の 内容と 合って いるのは どれか。',
   ['新しい 技術が 登場すると、人間の 仕事は 必ず 減り続ける', '学び直しの 機会や 生活を 支える 仕組みを 社会が 用意する ことが 重要だ', '人工知能が 得意な 作業は、これから 人間が 行う べきだ', '筆者は 機械と 競争して 勝つ 方法を 考える べきだと 述べて いる'],
   1, 'Peran masyarakat: kesempatan belajar ulang dan penopang hidup.', '学び直す機会や、その間の生活を支える仕組みを社会がどれだけ用意できるか',
   ['Teks: pekerjaan baru muncul.', 'Tidak ada anjuran seperti itu.', 'Penulis menolak bersaing dengan mesin.'], P3)]),
 dict(slot=J, jenis=JN,
  jp='「伝統を守る」という言葉は、変わらないことを意味すると思われがちだ。しかし、長く続いてきた伝統ほど、実際には時代に合わせて少しずつ姿を変えてきたものが多い。\n　例えば、ある地方の祭りは、江戸時代から続くとされている。だが、当時の記録を調べてみると、現在の行列の順序や衣装は、明治以降に整えられたものだと分かった。祭りの担い手たちは、人手が足りなくなれば日程を変え、道が舗装されれば山車の車輪を改良するなど、その時々の事情に応じて工夫を重ねてきたのである。\n　もし、彼らが「昔のままでなければならない」と頑なに考えていたら、祭りはとうの昔に途絶えていたかもしれない。変えてよい部分と、守るべき核心とを見分けながら、時代に合わせて続けてきたからこそ、今日まで残ったのだと言える。\n　伝統とは、形を保存することではなく、その精神を次の世代へ手渡す営みである。そのためには、何を変えずに残すかを、担い手自身が考え続けなければならない。',
  id='Ungkapan "menjaga tradisi" sering dipahami berarti tidak berubah. Namun semakin lama tradisi berlangsung, kenyataannya banyak yang sedikit demi sedikit mengubah wujud mengikuti zaman.\nMisalnya, festival di suatu daerah dikatakan berlangsung sejak zaman Edo. Tetapi ketika catatan masa itu diteliti, urutan arak-arakan dan kostum sekarang ternyata ditata sejak era Meiji. Para pelaksana festival terus berinovasi sesuai keadaan, seperti mengubah jadwal bila kekurangan tenaga atau memperbaiki roda kereta festival ketika jalan diaspal.\nJika mereka berpikir keras kepala bahwa "harus tetap seperti dulu", festival mungkin sudah lama terputus. Karena sambil membedakan bagian yang boleh diubah dan inti yang harus dijaga mereka terus menyesuaikan dengan zaman, festival itu bertahan sampai hari ini.\nTradisi bukan mengawetkan bentuk, melainkan upaya menyerahkan semangatnya kepada generasi berikutnya. Untuk itu, para pelaksana sendiri harus terus memikirkan apa yang dipertahankan tanpa diubah.',
  qs=[('筆者が 祭りの 例を あげた 目的は 何か。',
   ['江戸時代の 祭りが どれほど 立派だったかを 示す ため', '伝統が 実際には 時代に 合わせて 変化して きた ことを 示す ため', '明治以降の 祭りが 衰えた 理由を 説明する ため', '祭りの 担い手が 少なく なった 原因を 述べる ため'],
   1, 'Contoh festival menunjukkan tradisi berubah mengikuti zaman.', '長く続いてきた伝統ほど、実際には時代に合わせて少しずつ姿を変えてきたものが多い',
   ['Bukan soal kemegahan.', 'Tidak dibahas kemunduran.', 'Kekurangan tenaga hanya contoh perubahan, bukan tujuan.'], P2),
   ('「彼らが「昔のままでなければならない」と 頑なに 考えて いたら」と ありますが、その 場合、どう なって いたと 筆者は 考えて いるか。',
   ['祭りは 今よりも 盛大に なって いた', '祭りは すでに なくなって いたかも しれない', '祭りの 衣装は 変わらなかった', '祭りは 江戸時代の 姿に 戻って いた'],
   1, 'Penulis: festival mungkin sudah lama terputus.', '祭りはとうの昔に途絶えていたかもしれない',
   ['Tidak ada klaim lebih meriah.', 'Teks justru mengatakan kostum berubah.', 'Tidak ada klaim kembali ke zaman Edo.'], P1),
   ('筆者の 考える 「伝統」と は どのような ものか。',
   ['昔の 形を そのまま 保存する こと', '精神を 次の 世代に 手渡す 営み', '地域の 人が 変えては いけない 決まり', '記録に 残された 行事を 再現する こと'],
   1, 'Definisi: bukan melestarikan bentuk, melainkan menyerahkan semangat.', '伝統とは、形を保存することではなく、その精神を次の世代へ手渡す営みである',
   ['Itu yang dibantah penulis.', 'Bukan aturan mutlak.', 'Bukan sekadar reproduksi catatan.'], P1)]),
]
