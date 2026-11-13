# -*- coding: utf-8 -*-
P1 = "Cari kalimat yang menyatakan pendapat/alasan penulis (〜からだ、〜と思う、しかし〜)."
P2 = "Cocokkan setiap pilihan dengan teks; pilihan yang menambahkan hal yang tidak ada di teks adalah salah."
JN = 'Teks pendek (内容理解・短文)'
JC = 'Teks panjang (内容理解・長文)'
W = ['Tidak disebut dalam teks.', 'Tidak sesuai dengan isi teks.', 'Bertentangan dengan isi teks.']
def T(jp, idt, q, opts, ans, alasan, bukti, poin=P1):
    return dict(slot='tan', jenis=JN, jp=jp, id=idt, qs=[(q, opts, ans, alasan, bukti, W, poin)])
B = [
 T('私は毎月、給料の一部を貯金している。以前は使いすぎて、月末にお金が足りなくなることが多かった。そこで、給料が入ったらすぐに一部を別の口座に移すことにした。使えるお金が最初から決まっているので、無駄遣いが減った。',
   'Tiap bulan saya menabung sebagian gaji. Dulu sering kebanyakan belanja sehingga akhir bulan uang kurang. Maka begitu gaji masuk, saya langsung memindahkan sebagian ke rekening lain. Karena uang yang bisa dipakai sudah ditentukan dari awal, pemborosan berkurang.',
   '「私」の無駄遣いが減ったのはなぜか。',['給料が入ったらすぐ一部を別の口座に移すから','給料が上がったから','買い物に行かなくなったから','家族に管理してもらっているから'],0,'Memindahkan sebagian gaji dulu.','給料が入ったらすぐに一部を別の口座に移すことにした'),
 T('駅前に新しくできたパン屋は、午後四時になると、売れ残りのパンを半額にして売る。最初は、ただ安く買えるのがうれしかった。しかし今は、パンを捨てずに済むという点が、この店のいちばんいいところだと思う。',
   'Toko roti baru di depan stasiun, pada pukul empat sore menjual roti sisa dengan setengah harga. Awalnya saya hanya senang bisa beli murah. Namun kini saya rasa nilai terbaik toko ini adalah roti tidak perlu dibuang.',
   '「私」は、この店のいちばんいいところは何だと思っているか。',['パンを捨てずに済むこと','パンが安いこと','店が駅に近いこと','パンの種類が多いこと'],0,'Roti tidak dibuang.','パンを捨てずに済むという点が、この店のいちばんいいところだ'),
 T('日本には、「いただきます」と「ごちそうさま」という食事の挨拶がある。これは、食べ物や作ってくれた人、育ててくれた人への感謝の気持ちを表す言葉だ。外国人の友達に説明すると、「素敵な習慣だね」と言ってくれた。',
   'Di Jepang ada salam makan "itadakimasu" dan "gochisousama". Ucapan itu menyatakan rasa terima kasih kepada makanan, orang yang memasak, dan orang yang menanam. Saat saya jelaskan ke teman asing, ia berkata "kebiasaan yang indah".',
   '「いただきます」は、何を表す言葉か。',['食べ物や作ってくれた人への感謝','食事を始める時間','料理の味の感想','食事のお金の払い方'],0,'Rasa terima kasih.','感謝の気持ちを表す言葉だ',P2),
 T('私の弟は、ゲームばかりして、ほとんど勉強しなかった。しかし、先月、好きなゲームを作る仕事に興味を持ち、プログラミングの勉強を始めた。今では、毎日、自分から机に向かっている。',
   'Adik saya hanya bermain game dan hampir tak belajar. Namun bulan lalu ia tertarik pada pekerjaan membuat game favoritnya dan mulai belajar pemrograman. Kini tiap hari ia duduk di meja atas kemauan sendiri.',
   '弟が自分から勉強するようになったのはなぜか。',['ゲームを作る仕事に興味を持ったから','親に叱られたから','学校が始まったから','友達に誘われたから'],0,'Tertarik membuat game.','好きなゲームを作る仕事に興味を持ち'),
 T('この町の川には、毎年春になると、たくさんのこいのぼりが飾られる。川の上を泳ぐように見える姿は美しく、遠くからも見に来る人がいる。こいのぼりは、子どもが元気に育つようにという願いを込めたものだ。',
   'Di sungai kota ini tiap musim semi dipasang banyak koinobori. Penampakannya seperti berenang di atas sungai, indah, dan ada orang yang datang dari jauh. Koinobori mengandung harapan agar anak tumbuh sehat.',
   'こいのぼりには、どんな願いが込められているか。',['子どもが元気に育つこと','川がきれいになること','雨が降ること','町に人が来ること'],0,'Anak tumbuh sehat.','子どもが元気に育つようにという願いを込めた'),
 T('先週、近所の小学校の運動会を見に行った。かけっこで転んだ男の子が、泣きながらも最後まで走り切ると、会場から大きな拍手が起こった。私も思わず手をたたき、胸が熱くなった。',
   'Minggu lalu saya menonton lomba olahraga SD dekat rumah. Anak laki-laki yang jatuh saat lari tetap berlari sampai akhir sambil menangis, lalu tepuk tangan besar terdengar. Saya pun spontan bertepuk tangan dan dada terasa hangat.',
   '会場で大きな拍手が起こったのはなぜか。',['転んだ男の子が最後まで走り切ったから','男の子が一番になったから','先生が来たから','運動会が終わったから'],0,'Anak itu tetap berlari sampai akhir.','最後まで走り切ると、会場から大きな拍手が起こった'),
 T('日本の電車は、時間が正確なことで有名だ。数分の遅れでも、車内で「遅れて申し訳ありません」と放送が流れる。外国から来た人は、その丁寧さに驚くことが多い。',
   'Kereta Jepang terkenal tepat waktu. Meski terlambat beberapa menit, diumumkan di dalam kereta "mohon maaf atas keterlambatan". Orang yang datang dari luar negeri sering heran dengan kesantunan itu.',
   '外国から来た人が驚くのはなぜか。',['数分の遅れでも丁寧に謝る放送が流れるから','電車がとても遅いから','電車が汚いから','運賃が安いから'],0,'Permintaan maaf santun.','数分の遅れでも…丁寧さに驚く'),
 T('最近、自分の家でお茶をいれる人が減っている。ペットボトルのお茶が便利だからだ。しかし、急須でいれたお茶は、香りも味も違う。私は休みの日に、ゆっくりお茶をいれて飲む時間を大切にしている。',
   'Belakangan orang yang menyeduh teh di rumah berkurang karena teh botol praktis. Namun teh yang diseduh dengan teko berbeda aroma dan rasanya. Saya menghargai waktu menyeduh dan meminum teh pelan-pelan di hari libur.',
   '「私」は休みの日に何を大切にしているか。',['ゆっくりお茶をいれて飲む時間','ペットボトルのお茶を買うこと','急須を洗うこと','お茶を人にあげること'],0,'Waktu menyeduh teh.','ゆっくりお茶をいれて飲む時間を大切にしている'),
 T('母は、毎日、新聞のコラムを切り抜いて、ノートに貼っている。「心に残った言葉を、あとでまた読みたいから」と言う。先日、そのノートを見せてもらったが、すでに五冊にもなっていた。',
   'Ibu tiap hari menggunting kolom koran dan menempelnya di buku. Katanya, "karena ingin membaca lagi kata-kata yang membekas." Beberapa hari lalu saya diperlihatkan bukunya, ternyata sudah lima buah.',
   '母がコラムを切り抜くのはなぜか。',['心に残った言葉をあとでまた読みたいから','新聞を捨てたいから','友達にあげたいから','仕事で必要だから'],0,'Agar bisa dibaca lagi.','心に残った言葉を、あとでまた読みたいから'),
 T('先月から、会社の近くの公園で、昼休みに十分だけ散歩することにした。短い時間だが、外の空気を吸うと、午後の仕事の眠気がなくなる。同じ部署の人も、いつの間にか一緒に歩くようになった。',
   'Sejak bulan lalu saya memutuskan jalan-jalan sepuluh menit di taman dekat kantor saat istirahat siang. Meski singkat, menghirup udara luar menghilangkan kantuk di pekerjaan sore. Rekan satu bagian pun tanpa terasa ikut berjalan bersama.',
   '昼休みの散歩の効果は何か。',['午後の仕事の眠気がなくなること','仕事が減ること','給料が上がること','早く帰れること'],0,'Kantuk hilang.','午後の仕事の眠気がなくなる'),
 dict(slot='cho', jenis=JC, jp='私の町には、「子ども食堂」という場所がある。地域のボランティアが運営し、子どもたちが無料、または安い値段で食事ができる。\n最初は、家で十分に食事ができない子どものための場所として始まった。しかし、今では、親が忙しくて一人で食べる子どもや、ただ友達と一緒に食べたい子どもも、気軽に来るようになった。\n私は、先月からボランティアとして、野菜を切る手伝いをしている。子どもたちが「おいしい」と言って食べてくれる姿を見ると、とてもうれしい。食事だけでなく、誰かと一緒に過ごす時間も、子どもにとって大切なのだと感じた。',
      id='Di kota saya ada tempat bernama "kedai anak". Sukarelawan setempat mengelolanya, anak-anak bisa makan gratis atau murah. Awalnya dimulai sebagai tempat bagi anak yang tak cukup makan di rumah. Namun kini anak yang makan sendirian karena orang tua sibuk, atau anak yang sekadar ingin makan bersama teman pun datang dengan santai. Sejak bulan lalu saya jadi sukarelawan membantu memotong sayur. Melihat anak-anak makan sambil berkata "enak" membuat saya senang. Saya merasa bagi anak, bukan hanya makan tetapi juga waktu bersama seseorang itu penting.',
      qs=[('「子ども食堂」について、正しいものはどれか。',['地域のボランティアが運営し、無料または安く食事ができる','お金持ちの子どもだけが使える','大人だけが利用する','学校の中にある'],0,'Dikelola sukarelawan.','地域のボランティアが運営し…無料、または安い値段で食事ができる',W,P2),
          ('最近、子ども食堂に来るようになったのは、どんな子どもか。',['親が忙しくて一人で食べる子どもや、友達と食べたい子ども','食事ができない子どもだけ','大人の友達がいる子ども','外国から来た子どもだけ'],0,'Anak makan sendiri atau ingin bersama teman.','親が忙しくて一人で食べる子どもや、ただ友達と一緒に食べたい子ども',W,P2),
          ('「私」は、ボランティアをして何を感じたか。',['食事だけでなく、誰かと過ごす時間も子どもに大切だ','ボランティアは大変だ','食事は無料にするべきだ','野菜は切らなくていい'],0,'Waktu bersama itu penting.','誰かと一緒に過ごす時間も、子どもにとって大切なのだと感じた',W,P1)]),
]
