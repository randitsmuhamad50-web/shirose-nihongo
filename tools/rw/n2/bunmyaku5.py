# -*- coding: utf-8 -*-
M5 = [
 ("彼女は、約束の時間に遅れたことを（　　　）謝った。","深く",["強く","大きく","高く"],"Dia meminta maaf dengan dalam karena terlambat.","深く謝る."),
 ("この資料は、会議の前に全員に（　　　）しておいてください。","配布",["配達","配置","配慮"],"Mohon bagikan dokumen ini ke semua orang sebelum rapat.","資料を配布."),
 ("大雨で川の水位が（　　　）して、避難指示が出た。","上昇",["上達","向上","進行"],"Karena hujan lebat, permukaan sungai naik dan perintah evakuasi keluar.","水位が上昇."),
 ("彼の発言は、あまりにも（　　　）で、誰も信じなかった。","非現実的",["非公式","非常識","非協力"],"Ucapannya terlalu tak realistis sehingga tak ada yang percaya.","非現実的."),
 ("今回の事故の（　　　）は、まだわかっていない。","原因",["理由","要因","事情"],"Penyebab kecelakaan kali ini belum diketahui.","事故の原因."),
 ("新製品の売り上げが、予想を大きく（　　　）。","上回った",["上がった","超えた","越えた"],"Penjualan produk baru jauh melampaui perkiraan.","予想を上回る."),
 ("先生の（　　　）を受けて、私は進路を決めた。","助言",["助力","助成","助手"],"Setelah mendapat saran dari guru, saya menentukan jalur saya.","助言を受ける."),
 ("彼は、周りの反対を（　　　）、留学を決めた。","押し切って",["押しのけて","押し付けて","押し込んで"],"Dia memutuskan studi ke luar negeri dengan menembus penolakan sekitar.","反対を押し切る."),
 ("この地域は、観光地として（　　　）されている。","開発",["開店","開会","開設"],"Daerah ini dikembangkan sebagai tempat wisata.","開発される."),
 ("私は、母の病気を知って、居ても立っても（　　　）なくなった。","いられ",["居られ","おられ","立て"],"Mengetahui ibu sakit, saya tak bisa tinggal diam.","居ても立ってもいられない."),
 ("彼女は、緊張のあまり、頭が（　　　）になった。","真っ白",["真っ青","真っ赤","真っ黒"],"Karena sangat gugup, kepalanya kosong.","頭が真っ白."),
 ("彼は、会社の方針に（　　　）を唱えた。","異議",["異常","異国","異例"],"Dia mengajukan keberatan terhadap kebijakan perusahaan.","異議を唱える."),
 ("この計画を成功させるには、全員の（　　　）が欠かせない。","協力",["協議","協会","協定"],"Untuk menyukseskan rencana ini kerja sama semua orang tak bisa diabaikan.","協力が欠かせない."),
 ("彼は、病気で入院している友人を（　　　）に行った。","見舞い",["見送り","見学","見守り"],"Dia menjenguk teman yang dirawat di rumah sakit.","見舞いに行く."),
 ("最近、パソコンの調子が悪くて、（　　　）しているところだ。","困って",["悩んで","迷って","焦って"],"Belakangan komputer bermasalah dan saya sedang kesulitan.","(drop)"),
 ("この大会は、毎年、全国から多くの選手が（　　　）する。","参加",["参照","参考","参拝"],"Turnamen ini tiap tahun diikuti banyak atlet dari seluruh negeri.","大会に参加."),
]
M5 = [r for r in M5 if r[4] != "(drop)"]
M5 = [r for r in M5 if not r[0].startswith(("大雨で川の","新製品の売り","この計画を成功","彼は、周りの反対"))]
M5 = [r for r in M5 if not r[0].startswith("私は、母の病気")]
M5 += [
 ("彼は、会議で自分の意見を（　　　）述べた。","堂々と",["こっそり","うっかり","ぐっすり"],"Dia menyatakan pendapatnya di rapat dengan lantang.","堂々と."),
 ("彼女は、失敗しても（　　　）しない性格だ。","くよくよ",["いらいら","のろのろ","ぺらぺら"],"Dia berwatak tak murung meski gagal.","くよくよ."),
 ("海外旅行のために、パスポートを（　　　）した。","取得",["取材","取締","取扱"],"Saya memperoleh paspor untuk perjalanan ke luar negeri.","取得."),
 ("日本の夏は、（　　　）暑い。","蒸し",["蒸れ","蒸す","蒸して"],"Musim panas Jepang lembap dan panas.","蒸し暑い."),
]
