# -*- coding: utf-8 -*-
import re
K4 = [
 ("先生に（　　　）、論文を 書き直しました。","言われて",["言って","言わせて","言うと"],"Setelah disuruh guru, saya menulis ulang makalah.","受身: 〜に言われる."),
 ("母は 私に 毎日 野菜を（　　　）。","食べさせます",["食べられます","食べさせられます","食べて あげます"],"Ibu membuat saya makan sayur tiap hari.","使役."),
 ("子どもの とき、母に 野菜を 無理やり（　　　）。","食べさせられた",["食べさせた","食べられた","食べて くれた"],"Waktu kecil, saya dipaksa ibu makan sayur.","使役受身."),
 ("先生に ほめ（　　　）、うれしかった。","られて",["させて","て くれて","させられて"],"Dipuji guru, saya senang.","受身."),
 ("大切な 時計を 弟に（　　　）。","壊された",["壊させた","壊した","壊して あげた"],"Jam penting saya dirusak adik.","受身 (迷惑)."),
 ("社長は 来週 海外へ（　　　）。","いらっしゃいます",["参ります","伺います","申します"],"Direktur utama pergi ke luar negeri minggu depan.","尊敬語."),
 ("私が 先生の かばんを（　　　）。","お持ちします",["お持ちに なります","持って いらっしゃいます","お持ちに なって います"],"Saya yang membawakan tas guru.","謙譲語: お〜する."),
 ("お客様、こちらを（　　　）ください。","ご覧",["見て ください ない","見られ","みせ"],"Tuan/Nyonya, silakan lihat ini.","ご覧ください."),
 ("先生の お宅へ（　　　）。","伺います",["いらっしゃいます","お行きに なります","おいでに なります"],"Saya berkunjung ke rumah guru.","謙譲語: 伺う."),
 ("私は 田中と（　　　）。","申します",["おっしゃいます","言われます","お言いに なります"],"Nama saya Tanaka.","謙譲語: 申す."),
 ("お茶を（　　　）。","いただきます",["くださいます","召し上がります","お飲みに なります"],"Saya minum tehnya. (rendah hati)","謙譲語: いただく."),
 ("先生は お茶を（　　　）。","召し上がりました",["いただきました","お飲みしました","頂戴しました"],"Guru minum teh.","尊敬語: 召し上がる."),
 ("部長は もう お帰りに（　　　）。","なりました",["しました","されました ない","いたしました"],"Kepala bagian sudah pulang.","お〜になる."),
 ("ご注文は 以上で（　　　）か。","よろしい",["いい でしょう","いい です","よい ます"],"Apakah pesanannya sudah cukup?","よろしいですか."),
 ("この 部屋は 暑い（　　　）、窓を 開けましょう。","から",["ので ない","のに","ばかり"],"Kamar ini panas, jadi ayo buka jendela.","〜から."),
 ("新しい 携帯を 買う（　　　）、よく 調べて ください。","前に",["後に","間に","中に"],"Sebelum membeli ponsel baru, periksa baik-baik.","〜前に."),
 ("駅に 着いた（　　　）、電話して ください。","ら",["と","ば ない","ので ない"],"Kalau sudah sampai stasiun, telepon ya.","〜たら."),
 ("明日 雨が 降れ（　　　）、試合は 中止です。","ば",["と ない","ても","のに"],"Kalau besok hujan, pertandingan dibatalkan.","〜ば."),
 ("ボタンを 押す（　　　）、ドアが 開きます。","と",["のに","ても","ばかり"],"Kalau menekan tombol, pintu terbuka.","〜と."),
 ("この 薬を 飲め（　　　）、治るでしょう。","ば",["と ない","ても","のに"],"Kalau minum obat ini, mungkin sembuh.","〜ば."),
 ("雨が 降っ（　　　）、行きます。","ても",["たら","ば","と"],"Meski hujan, saya tetap pergi.","〜ても."),
 ("いくら 頑張っ（　　　）、彼には 勝てない。","ても",["たら","ば","と"],"Sekeras apa pun berusaha, tak bisa mengalahkannya.","いくら〜ても."),
 ("どんなに 忙しく（　　　）、毎日 日記を 書きます。","ても",["たら","ば","と"],"Sesibuk apa pun, saya menulis buku harian tiap hari.","どんなに〜ても."),
 ("彼の 話は 本当（　　　）しれない。","かも",["はず","つもり","よう"],"Ceritanya mungkin benar.","〜かもしれない."),
 ("この 荷物は 重くて、一人で は 持てそう（　　　）。","にない",["だ ない","に ある","でも ある"],"Barang ini berat, sepertinya tidak bisa kubawa sendirian.","〜そうにない."),
 ("あの 人は 今にも 泣き出し（　　　）。","そうだ",["ようだ ない","はずだ","かも だ"],"Orang itu sepertinya hampir menangis.","〜そうだ (tampak)."),
 ("彼は 来年 結婚する（　　　）です。","そう",["よう","らしい","みたい"],"Katanya dia menikah tahun depan.","〜そうです (kabar)."),
 ("部屋の 電気が ついて いる。彼は まだ 起きて いる（　　　）。","ようだ",["そうだ ない","はずだ ない","つもりだ ない"],"Lampu kamar menyala. Tampaknya dia masih bangun.","〜ようだ."),
 ("この 問題は 子ども（　　　）できる ほど 簡単です。","でも",["しか","ばかり","だけ"],"Soal ini semudah itu hingga anak-anak pun bisa.","〜でも."),
 ("私は 一度（　　　）、京都に 行った ことが ありません。","も",["だけ","しか","ばかり"],"Saya belum pernah sekali pun ke Kyoto.","一度も〜ない."),
]
_ok = lambda r: len(r[2])==3 and r[1] not in r[2] and '（　　　）' in r[0] and not any(re.search(r' (ない|ある|ます|ほしい|ない です|でした|ない ます)$', w) or w in ('ならば ない','ほど ない') for w in r[2])
K4 = [r for r in K4 if _ok(r)]
_dr = ("ご注文","お客様","この 部屋は 暑い","駅に 着いた","明日 雨が","この 薬を 飲め","この 荷物は","彼は 来年","部屋の 電気","あの 人は 今にも","ボタン")
K4 = [r for r in K4 if not any(x in r[0] for x in _dr)]
K4 = [r for r in K4 if not r[0].startswith("お茶を（")]
K4 += [
 ("彼は 毎日 一時間（　　　）走って います。","も",["だけ","しか","ばかり"],"Dia lari sampai satu jam tiap hari.","〜も = sebanyak."),
 ("この 仕事は 経験が なければ（　　　）。","できません",["できます","できません でした","できて います"],"Pekerjaan ini tidak bisa dilakukan tanpa pengalaman.","〜なければ〜ない."),
 ("彼女は 笑って いる（　　　）、目には 涙が ありました。","けれど",["ので","から","ために"],"Dia tersenyum, tetapi di matanya ada air mata.","〜けれど."),
 ("今日は 暑い（　　　）、エアコンを つけて ください。","ので",["のに","ても","くせに"],"Karena hari ini panas, tolong nyalakan AC.","〜ので."),
 ("朝 起き（　　　）、まず 顔を 洗います。","たら",["ても","のに","ように"],"Setelah bangun pagi, pertama saya cuci muka.","〜たら."),
 ("彼は 眼鏡を かけた（　　　）、本を 読んで います。","まま",["うち","あいだ","ところ"],"Dia membaca buku dengan tetap memakai kacamata.","〜たまま."),
 ("日本語が 話せる（　　　）、日本で 働きたいです。","ように なって",["ことに して","ために なって","ところに して"],"Setelah bisa bahasa Jepang, saya ingin bekerja di Jepang.","〜ようになって."),
]
