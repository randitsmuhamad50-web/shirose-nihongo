# -*- coding: utf-8 -*-
# N1 内容理解(中文) ~550字 · 3問 / 各
P1 = "Cari kalimat pendapat penulis (biasanya setelah しかし/だが/つまり) lalu cocokkan dengan parafrasenya."
P2 = "Soal 下線部: baca kalimat sebelum dan sesudahnya; jawaban hampir selalu ada di sana."
P3 = "Pilihan yang terlalu ekstrem (すべて・必ず・全く) atau memuat hal yang tidak ada di teks hampir pasti salah."
J = 'chu'; JN = 'Teks menengah (内容理解・中文)'
B = [
 dict(slot=J, jenis=JN,
  jp='「ものを大切にする」ということを、私たちは長い間、「新しいものを買わずに古いものを使い続けること」と同じ意味で捉えてきたように思う。確かに、壊れたら直し、使えなくなるまで使うという態度は美徳である。だが、最近になって、それだけでは不十分ではないかと考えるようになった。\n　先日、祖父の形見の腕時計を修理に出した。店の職人は、部品が手に入らないので元通りにはならないと言いながらも、一週間かけて動くようにしてくれた。受け取ったとき、職人が「大切にするとは、使うことです。しまっておいたら時計は死んでしまう」と言った。その言葉が、ずっと心に残っている。\n　私は、祖父の腕時計を「壊してはいけないもの」として引き出しにしまい込んでいた。しかし、それは大切にしているつもりで、実は遠ざけていただけだったのかもしれない。ものは、使われてこそ価値が生まれる。傷がつくことを恐れて使わないのは、ものにとっても持ち主にとっても幸せなことではないだろう。\n　今、私はその腕時計を毎日つけている。少し重くて、時々遅れるが、それも含めて祖父との対話のように感じられる。',
  id='Kita selama ini tampaknya memaknai "menghargai barang" sama dengan "terus memakai barang lama tanpa membeli yang baru". Memang, sikap memperbaiki bila rusak dan memakai sampai tak bisa dipakai adalah kebajikan. Namun akhir-akhir ini saya mulai berpikir bahwa itu saja tidak cukup.\nBeberapa hari lalu, saya membawa jam tangan peninggalan kakek untuk diperbaiki. Pengrajin toko berkata suku cadangnya tidak bisa didapat sehingga tidak bisa kembali seperti semula, namun ia menghabiskan satu pekan hingga jam itu berjalan. Saat menerimanya, pengrajin berkata, "Menghargai itu memakai. Kalau disimpan saja, jam akan mati." Kata-kata itu terus membekas di hati.\nSaya telah menyimpan jam tangan kakek di laci sebagai "barang yang tidak boleh rusak". Tetapi itu mungkin sebenarnya bukan menghargai, melainkan menjauhkannya. Barang baru bernilai ketika dipakai. Tidak memakai karena takut tergores bukanlah kebahagiaan bagi barang maupun pemiliknya.\nSekarang saya memakai jam itu setiap hari. Agak berat dan kadang terlambat, tetapi termasuk itu pun terasa seperti dialog dengan kakek.',
  qs=[('「それだけでは 不十分ではないか」と ありますが、「それ」は 何を 指すか。',
   ['壊れた ものを 直して 使う こと', '新しい ものを 買わずに 古い ものを 使い続ける こと', '祖父の 形見を 大切に しまって おく こと', '職人の 言葉を 心に 留めて おく こと'],
   1, '「それ」= 新しいものを買わずに古いものを使い続けること (kalimat sebelumnya: 美徳).', '「新しいものを買わずに古いものを使い続けること」と同じ意味で…それだけでは不十分',
   ['Memperbaiki adalah bagian dari sikap yang sama, bukan inti yang dimaksud.', 'Itu terjadi setelah paragraf kedua.', 'Itu muncul belakangan sebagai refleksi.'], P2),
   ('筆者は、腕時計を 引き出しに しまって いた ことを どう 考えて いるか。',
   ['腕時計を 守る ために 必要な 行動だった', '大切に して いた つもりだったが、実際は 遠ざけて いただけかも しれない', '職人に 頼まなかった ことが 間違いだった', '祖父の 気持ちを 考えて いなかった 行動だった'],
   1, 'Penulis: "merasa menghargai, tapi sebenarnya hanya menjauhkan".', '大切にしているつもりで、実は遠ざけていただけだったのかもしれない',
   ['Penulis justru meragukan hal itu.', 'Perbaikan tidak dinilai salah.', 'Tidak ada pembahasan soal perasaan kakek.'], P1),
   ('この 文章で 筆者が 最も 言いたい ことは 何か。',
   ['古い ものは 修理せずに 新しい ものに 買い換えるべきだ', '大切な ものは 使う ことで はじめて 価値が 生きる', '職人の 技術は 機械に 負けない', '形見は 持ち主が 変わっても 使うべきでは ない'],
   1, 'Inti: barang bernilai ketika dipakai.', 'ものは、使われてこそ価値が生まれる',
   ['Penulis tidak menganjurkan mengganti dengan yang baru.', 'Bukan tentang perbandingan dengan mesin.', 'Bertentangan dengan sikap penulis yang memakai jam kakek.'], P1)]),
 dict(slot=J, jenis=JN,
  jp='近年、企業の間で「リモートワーク」を導入する動きが広がっている。通勤時間がなくなり、育児や介護と仕事を両立しやすくなるなど、利点は多い。一方で、課題も指摘されている。最も多く聞かれるのは、同僚との雑談が減ることで、新しいアイデアが生まれにくくなるという声である。\n　実は、雑談の価値は、効率の観点からは見えにくい。何気ない会話の中で、担当外の人から思わぬ助言を得たり、他部署の動きを知ったりする機会は少なくない。会議のように目的が決まった場では、こうした「ついで」の情報はなかなか出てこないのである。\n　では、リモートワークは避けるべきなのか。私はそうは思わない。むしろ、出社の意味を見直す好機だと考える。毎日出社することが当たり前だった時代には、オフィスにいること自体が目的化していた面がある。しかし、自宅で集中して進められる作業は自宅で行い、顔を合わせて議論したいときに出社するという使い分けができれば、双方の利点を生かせるはずだ。\n　大切なのは、制度そのものではなく、それをどう設計するかである。',
  id='Belakangan ini, perusahaan-perusahaan makin banyak menerapkan "kerja jarak jauh". Banyak keuntungannya, seperti tidak ada waktu perjalanan dan lebih mudah memadukan pekerjaan dengan pengasuhan atau perawatan keluarga. Di sisi lain, tantangan juga ditunjukkan. Yang paling sering terdengar ialah berkurangnya obrolan ringan dengan rekan sehingga ide baru sulit lahir.\nSebenarnya, nilai obrolan ringan sulit terlihat dari sudut pandang efisiensi. Dalam percakapan sambil lalu tidak jarang kita mendapat saran tak terduga dari orang di luar tugas atau mengetahui gerak departemen lain. Di forum seperti rapat yang tujuannya sudah ditentukan, informasi "sampingan" seperti ini sulit muncul.\nLalu, apakah kerja jarak jauh harus dihindari? Saya tidak berpikir begitu. Justru saya anggap ini kesempatan baik meninjau ulang makna datang ke kantor. Pada zaman ketika datang setiap hari adalah hal biasa, ada sisi di mana berada di kantor menjadi tujuan itu sendiri. Namun bila pekerjaan yang bisa fokus dikerjakan di rumah dikerjakan di rumah, dan datang ke kantor saat ingin berdiskusi tatap muka, kelebihan keduanya bisa dimanfaatkan.\nYang penting bukan sistemnya, melainkan bagaimana merancangnya.',
  qs=[('筆者は、雑談に ついて どう 考えて いるか。',
   ['仕事の 効率を 下げる ので、減らした ほうが いい', '予定外の 助言や 情報を 得る 機会に なる ので、価値が ある', '会議より 目的が はっきり して いる 場である', '担当の 人と だけ 行う べきだ'],
   1, 'Obrolan ringan memberi saran/informasi tak terduga.', '担当外の人から思わぬ助言を得たり、他部署の動きを知ったりする機会は少なくない',
   ['Penulis justru melihat nilainya.', 'Rapat-lah yang punya tujuan jelas, bukan obrolan.', 'Justru orang di luar tugas yang memberi manfaat.'], P1),
   ('「出社の 意味を 見直す 好機」と ありますが、筆者は どう 見直す べきだと 考えて いるか。',
   ['出社する 日数を ゼロに して、すべて 在宅に する', '毎日 出社する 制度に 戻す', '一人で 集中できる 作業は 自宅で、議論したい ときは 出社する', '雑談の ための 時間を 会社が 毎日 設ける'],
   2, 'Penulis menyarankan pembagian peran rumah dan kantor.', '自宅で集中して進められる作業は自宅で行い、顔を合わせて議論したいときに出社する',
   ['Penulis tidak mengusulkan nol hari.', 'Penulis tidak ingin kembali ke sistem lama.', 'Tidak ada usulan jadwal obrolan.'], P2),
   ('この 文章の 内容と 合って いるのは どれか。',
   ['リモートワークは 利点が 少なく、導入する 企業は 減って いる', '筆者は 制度の 内容より、設計の 仕方が 大切だと 考えて いる', '会議では 思わぬ 情報が 多く 得られる', 'リモートワークでは 新しい アイデアは 生まれない'],
   1, 'Kalimat penutup: yang penting adalah cara merancang.', '大切なのは、制度そのものではなく、それをどう設計するかである',
   ['Teks: perusahaan yang menerapkan bertambah.', 'Justru di rapat informasi sampingan sulit muncul.', 'Teks hanya mengatakan "sulit lahir", bukan "tidak lahir".'], P3)]),
]
