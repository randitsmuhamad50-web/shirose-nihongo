# -*- coding: utf-8 -*-
K3 = [
 ("この 本は 子どもに（　　　）読めます。","も",["だけ","しか","ばかり"],"Buku ini bahkan anak-anak pun bisa membacanya.","〜にも."),
 ("日本語の 勉強は 大変です。（　　　）、おもしろいです。","でも",["だから","それで","ですから"],"Belajar bahasa Jepang berat. Tapi menarik.","でも."),
 ("今日は 雨です。（　　　）、出かけません。","ですから",["しかし","けれども","でも"],"Hari ini hujan. Karena itu saya tidak keluar.","ですから."),
 ("私は まだ 朝ごはんを 食べて（　　　）。","いません",["います","ありません","しまいます"],"Saya belum sarapan.","まだ〜ていません."),
 ("もう 宿題を（　　　）か。","しました",["しません","しています","します"],"Sudah mengerjakan PR belum?","もう〜ましたか."),
 ("先週の 土曜日は（　　　）でした。","ひま",["ひまな","ひまく","ひまに"],"Sabtu lalu saya senggang.","な-adj + でした."),
 ("この 町は 静か（　　　）、住みやすいです。","で",["に","く","な"],"Kota ini tenang dan nyaman ditinggali.","な-adj + で."),
 ("駅は 学校の 近く（　　　）あります。","に",["を","で","が"],"Stasiun ada di dekat sekolah.","に ある."),
 ("日本語が 話せる（　　　）なりたいです。","ように",["ことに","ために","ものに"],"Saya ingin bisa berbahasa Jepang.","〜ようになりたい."),
 ("田中さん（　　　）、あした 来ますか。","は",["を","に","で"],"Apakah Tanaka datang besok?","Topik: は."),
 ("私は 兄（　　　）、背が 高く ありません。","ほど",["より","から","まで"],"Saya tidak setinggi kakak.","〜ほど〜ない."),
 ("兄は 私（　　　）、背が 高いです。","より",["ほど","から","まで"],"Kakak lebih tinggi daripada saya.","〜より."),
 ("この 中で いちばん 高い（　　　）は どれですか。","もの",["こと","とき","ところ"],"Di antara ini mana yang paling mahal?","のもの = yang."),
 ("母は 私に 野菜を 食べる（　　　）言いました。","ように",["ために","ことに","はずに"],"Ibu menyuruh saya makan sayur.","〜ように言う."),
 ("先生は「ここで 写真を 撮っては いけません」（　　　）言いました。","と",["を","に","が"],"Guru berkata 'Tidak boleh memotret di sini'.","〜と言う."),
 ("日本語で「ありがとう」は 英語で（　　　）いいますか。","なんと",["なにを","どこで","いつ"],"'Arigatou' dalam bahasa Inggris disebut apa?","なんと言いますか."),
 ("駅へ 行く 道を 教え（　　　）ください。","て",["る","た","ない"],"Tolong beritahu jalan ke stasiun.","〜てください."),
 ("ここで 写真を 撮っても（　　　）ですか。","いい",["だめ","わるい","いけません"],"Bolehkah memotret di sini?","〜てもいいですか."),
 ("明日 早く 起きなければ（　　　）。","なりません",["いいです","ありません","できません"],"Besok harus bangun pagi.","〜なければなりません."),
 ("病気の とき、無理して 学校へ 行か（　　　）いいです。","なくても",["なければ","なくては","ないでも"],"Kalau sakit, tidak perlu memaksakan diri ke sekolah.","〜なくてもいい."),
 ("電話番号を 忘れない（　　　）、メモして おきます。","ように",["ために","ことに","ところ"],"Supaya tidak lupa nomor telepon, saya catat.","〜ないように."),
 ("A:「いっしょに 行きませんか。」 B:「ええ、（　　　）。」","行きましょう",["行きません","行きたいです か","行って ください"],"A: Mau pergi bersama? B: Ya, ayo pergi.","〜ましょう."),
 ("駅まで 歩いて 十分（　　　）です。","ぐらい",["ごろ","ずつ","ばかり ない"],"Jalan ke stasiun sekitar sepuluh menit.","〜ぐらい = kira-kira (durasi)."),
 ("毎日 十時（　　　）寝ます。","ごろ",["ぐらい","ずつ","ばかり"],"Tiap hari saya tidur sekitar jam sepuluh.","〜ごろ = sekitar (waktu)."),
 ("この 薬を 一日に 三回（　　　）飲んで ください。","ずつ",["ごろ","ぐらい","だけ"],"Minum obat ini tiga kali sehari.","〜ずつ = masing-masing."),
]
K3 = [r for r in K3 if len(r[2])==3 and r[1] not in r[2] and '（　　　）' in r[0] and not any(' ' in w for w in r[2])]
K3 += [
 ("この 町は 昔（　　　）にぎやかに なりました。","より",["ほど","から","まで"],"Kota ini jadi lebih ramai daripada dulu.","〜より."),
 ("あの 人は 去年 日本に 来た（　　　）、もう 上手に 話せます。","ばかりなのに",["ばかりなので","ばかりでも","ばかりから"],"Orang itu baru datang ke Jepang tahun lalu, tapi sudah pandai bicara.","〜たばかりなのに."),
]
