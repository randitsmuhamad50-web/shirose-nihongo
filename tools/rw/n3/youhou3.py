# -*- coding: utf-8 -*-
# N3 用法: pengecoh = kalimat wajar secara tata bahasa tapi pemakaian kata salah (makna/kolokasi)
U3 = [
 ("あきらめる","試験に落ちても、夢をあきらめずに勉強を続けた。",["試験に落ちたので、かばんをあきらめて家に帰った。","もう少しで終わるから、仕事をあきらめて続けよう。","電車が来たので、急いで席をあきらめた。"],"Meski gagal ujian, dia terus belajar tanpa menyerah pada impian.",""),
 ("さそう","友だちを映画にさそったが、用事があると言われた。",["友だちを宿題にさそって、一緒に食べた。","先生が学生を教室にさそって、授業を始めた。","犬を散歩にさそって、買い物をした。"],"Saya mengajak teman menonton film tapi katanya ada urusan.",""),
 ("見つかる","探していた財布が、かばんの底から見つかった。",["探していた財布を、かばんの底から見つかった。","私は財布が見つかって、店で買い物をした。","財布で見つかって、店員に渡した。"],"Dompet yang dicari ditemukan di dasar tas.",""),
 ("引き受ける","友人の頼みを引き受けて、引っ越しを手伝った。",["友人が私を引き受けて、一緒に旅行した。","重い荷物を引き受けて、駅まで歩いて行った。","手紙を引き受けて、ポストに入れた。"],"Saya menerima permintaan teman dan membantu pindahan.",""),
 ("そろえる","会議の前に、資料を人数分そろえておいた。",["会議の前に、時間をそろえて休憩した。","会議の前に、意見が資料をそろえていた。","会議で、全員の顔がそろえられた。"],"Sebelum rapat, saya menyiapkan materi sesuai jumlah peserta.",""),
 ("確かめる","出かける前に、ガスを止めたかどうか確かめた。",["出かける前に、傘を確かめて雨に降られた。","天気が確かめて、傘を持たなかった。","友だちが、私の意見を確かめて怒った。"],"Sebelum keluar, saya memastikan gas sudah dimatikan.",""),
 ("取り消す","病気になったので、旅行の予約を取り消した。",["病気になったので、薬を取り消して寝た。","雨が降ったので、傘を取り消して歩いた。","友だちを取り消して、一人で行った。"],"Karena sakit, saya membatalkan pesanan wisata.",""),
 ("まとめる","先生は、学生の意見を黒板にまとめてくれた。",["先生は、学生の名前をまとめて怒った。","先生は、雨をまとめて授業を休みにした。","学生が、駅に先生をまとめて待った。"],"Guru merangkum pendapat murid di papan tulis.",""),
 ("ふさわしい","結婚式にふさわしい服を選んで着た。",["暑い日にふさわしいセーターを着て出かけた。","とても寒いのでふさわしい水を飲んだ。","彼は仕事にふさわしくない店で働いている。ので、ふさわしく走った。"],"Saya memilih pakaian yang pantas untuk pesta pernikahan.",""),
 ("めずらしい","この地方では雪がめずらしいので、みんな外へ出て喜んだ。",["雪がめずらしいので、毎日たくさん降って困った。","この町はめずらしいのに、いつも人がたくさんいる。","彼は毎日めずらしく遅刻して、先生に注意された。"],"Di daerah ini salju langka sehingga semua keluar dengan gembira.",""),
 ("退院する","手術が成功して、父は来週退院することになった。",["父は来週病院へ退院して、手術を受ける。","手術が成功して、父は昨日退院を始めた。","母は退院して、学校へ入った。"],"Operasi berhasil, ayah akan keluar dari rumah sakit minggu depan.",""),
 ("支払う","来月までに、家賃を銀行で支払う予定だ。",["来月までに、家賃を友だちに支払って遊びに行く。","毎月、時間を店に支払って買い物する。","家賃を先生が支払って教えてくれた。"],"Saya berencana membayar sewa di bank sebelum bulan depan.",""),
 ("見送る","駅で、旅立つ友だちを見送った。",["駅で、帰ってきた友だちを見送った。","駅で、友だちが私を見送って電車に乗った。","駅で、切符を見送って改札を出た。"],"Di stasiun saya mengantar kepergian teman.",""),
 ("積む","新人のうちに、いろいろな経験を積んでおきたい。",["新人のうちに、荷物を積んで経験を終えたい。","重い荷物を肩に積んで、山を登った。","机の上に経験を積んで勉強した。"],"Selagi karyawan baru, saya ingin menimba banyak pengalaman.",""),
 ("うっかり","うっかりして、財布を電車に忘れてしまった。",["うっかり毎日勉強したので、合格できた。","うっかり計画を立てて、旅行に出かけた。","彼はうっかり人のために、いつも親切にしている。"],"Karena ceroboh, saya meninggalkan dompet di kereta.",""),
 ("めったに","私は、めったに外食をしない。",["私は、めったに毎日外食をする。","めったに雨が降っていて、傘が必要だった。","めったに夏休みが長いので、旅行に行った。"],"Saya hampir tidak pernah makan di luar.",""),
 ("相変わらず","久しぶりに会った友だちは、相変わらず元気だった。",["久しぶりに会った友だちは、相変わらず昨日来た。","友だちが、相変わらず今日初めて日本に来た。","相変わらず、私は明日の朝に帰る。"],"Teman yang lama tak bertemu tetap sehat seperti biasa.",""),
 ("さっそく","新しい辞書を買って、さっそく使ってみた。",["去年の夏、さっそく旅行に行って楽しかった。","毎日さっそく学校に通っている。","来年、さっそく卒業する予定だ。"],"Setelah membeli kamus baru saya langsung mencobanya.",""),
 ("おそらく","明日はおそらく雨が降るだろう。",["昨日はおそらく雨が降っていた。","私はおそらく学生で、毎日学校へ行く。","今、おそらくここに母がいる。"],"Besok kemungkinan besar hujan.",""),
 ("見かける","駅で有名な歌手を見かけた。",["先生が学生の作文を見かけて、直した。","友だちに手紙を見かけて、読んだ。","私は毎朝、本を見かけて勉強している。"],"Di stasiun saya sempat melihat penyanyi terkenal.",""),
 ("慣れる","新しい仕事にやっと慣れてきた。",["私は毎日、新しい仕事に慣れて、会社を辞めた。","犬を慣れるのは、とても難しい。","彼は寒さに慣れて、風邪をひいた。"],"Akhirnya saya mulai terbiasa dengan pekerjaan baru.",""),
]
_ok3 = lambda r: len(r[2])==3 and r[1] not in r[2]
U3 = [r for r in U3 if _ok3(r)]
_dr3 = ("ふさわしい","退院","めったに","相変わらず","さっそく","おそらく","慣れる")
U3 = [r for r in U3 if r[0] not in _dr3]
