# -*- coding: utf-8 -*-
# N2 統合理解 (A・B) · 2問 / 各
P1 = "Soal 統合: tandai pendapat A dan B secara terpisah, lalu cari titik temu/perbedaannya."
J = 'tou'; JN = 'Bacaan gabungan (統合理解)'
B = [
 dict(slot=J, jenis=JN,
  jp='<b>【A】</b><br>通勤時間が長いと、疲れがたまり、仕事の効率も下がる。会社の近くに住めば、時間にゆとりが生まれ、趣味や家族との時間も増やせる。多少家賃が高くても、会社の近くに住むことには価値があると思う。<br><br><b>【B】</b><br>職場の近くに住むと、仕事とそれ以外の時間の境目があいまいになりがちだ。帰宅した後も、会社のことが頭から離れなくなるかもしれない。通勤時間は、気持ちを切り替えるための大切な時間でもある。私は、少し離れた場所に住むほうが、心のゆとりが保てると考える。',
  id='[A] Jika waktu perjalanan panjang, kelelahan menumpuk dan efisiensi kerja menurun. Jika tinggal dekat kantor, waktu luang muncul dan waktu untuk hobi dan keluarga bisa bertambah. Walau sewa agak mahal, tinggal dekat kantor menurut saya bernilai.\n[B] Jika tinggal dekat tempat kerja, batas antara waktu kerja dan lainnya cenderung kabur. Bahkan setelah pulang, urusan kantor mungkin tidak lepas dari pikiran. Waktu perjalanan juga merupakan waktu penting untuk mengganti suasana hati. Saya berpendapat tinggal agak jauh dapat menjaga ketenangan batin.',
  qs=[('Aと Bの 意見の 違いは どれか。',
   ['Aは 通勤時間を 気分転換の 時間と とらえ、Bは 無駄と とらえて いる', 'Aは 通勤時間を 負担と とらえ、Bは 気持ちを 切り替える 時間と とらえて いる', 'AもBも、家賃の 高さを 最も 重視して いる', 'AもBも、会社の 近くに 住む ことに 賛成して いる'],
   1, 'A: perjalanan = beban; B: perjalanan = waktu mengganti suasana.', 'A：通勤時間が長いと、疲れがたまり / B：気持ちを切り替えるための大切な時間',
   ['Terbalik.', 'Sewa bukan inti B.', 'B tidak setuju.'], P1),
   ('AとBが 共通して 述べて いる ことは 何か。',
   ['住む 場所に よって、生活の 質が 変わる ということ', '家賃は 安い ほうが 良い ということ', '会社の 近くに 住む のは 危険だと いうこと', '仕事より 趣味を 優先するべきだと いうこと'],
   0, 'Keduanya menilai lokasi tinggal memengaruhi kualitas hidup/ketenangan.', 'A：時間にゆとりが生まれ…/ B：心のゆとりが保てる',
   ['Hanya A yang menyebut sewa.', 'Tidak dikatakan berbahaya.', 'Tidak dikatakan.'], P1)]),
 dict(slot=J, jenis=JN,
  jp='<b>【A】</b><br>大学の授業は、できるだけ対面で行うべきだと思う。教室で教員や他の学生と直接顔を合わせることで、質問や議論がしやすくなり、学ぶ意欲も高まる。オンラインでは、どうしても集中が続かず、孤立感を覚える学生も少なくない。<br><br><b>【B】</b><br>授業の形式は、内容によって使い分けるのがよい。知識を伝える講義は、録画を自分のペースで見られるオンラインのほうが、繰り返し学べる分、効果的な場合もある。その代わり、議論や実習のように人との関わりが必要な授業は、対面で行うのが望ましい。',
  id='[A] Menurut saya kuliah sebaiknya dilakukan tatap muka sebisa mungkin. Dengan bertemu langsung dengan dosen dan mahasiswa lain di kelas, bertanya dan berdiskusi jadi lebih mudah dan semangat belajar naik. Secara daring, konsentrasi sulit bertahan dan tidak sedikit mahasiswa yang merasa terisolasi.\n[B] Bentuk kuliah sebaiknya dibedakan menurut isinya. Kuliah penyampaian pengetahuan, bila daring sehingga rekaman bisa ditonton dengan kecepatan sendiri, kadang lebih efektif karena bisa diulang. Sebaliknya, kuliah yang perlu interaksi dengan orang seperti diskusi dan praktik sebaiknya tatap muka.',
  qs=[('Bは、Aの 主張に 対して どのような 立場か。',
   ['対面授業に すべて 反対して いる', '内容に よっては オンラインの ほうが 効果的な 場合も あると いう 立場', 'Aと まったく 同じ 立場', 'オンライン授業は 実習に 最も 向いて いると いう 立場'],
   1, 'B: tergantung isi, kadang daring lebih efektif.', '内容によって使い分けるのがよい…オンラインのほうが…効果的な場合もある',
   ['B tidak menolak semuanya.', 'B tidak sama dengan A.', 'B justru menyarankan tatap muka untuk praktik.'], P1),
   ('AとBの 両方が 対面授業に 向いて いると 考えて いる ものは どれか。',
   ['録画された 講義を 見る 授業', '学生どうしの 議論や 人との 関わりが 必要な 授業', '一人で 資料を 読む 授業', '試験の ための 暗記の 授業'],
   1, 'Keduanya: tatap muka cocok untuk diskusi/interaksi.', 'A：質問や議論がしやすくなり / B：議論や実習のように人との関わりが必要な授業は対面',
   ['Itu daring.', 'Tidak dibahas.', 'Tidak dibahas.'], P1)]),
]
