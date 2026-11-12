# -*- coding: utf-8 -*-
H3 = [
 ('この [しゅうかん] は 雨が 多いです。', '週間', ['周間', '週関', '週簡'], 'Minggu ini banyak hujan.'),
 ('[かんけい] の ある 人に 聞きます。', '関係', ['関系', '開係', '閑係'], 'Saya tanya orang yang berkaitan.'),
 ('新しい [せいど] が できました。', '制度', ['製度', '制席', '制渡'], 'Sistem baru telah dibuat.'),
 ('[けいけん] を 生かして 働きます。', '経験', ['径験', '経検', '軽験'], 'Bekerja memanfaatkan pengalaman.'),
 ('彼の [せつめい] は わかりやすい。', '説明', ['読明', '説朋', '脱明'], 'Penjelasannya mudah dipahami.'),
 ('[かくにん] を して ください。', '確認', ['確忍', '確訳', '確諾'], 'Tolong konfirmasi.'),
 ('[ぎもん] に 思った ことを 質問する。', '疑問', ['凝問', '疑門', '疑間'], 'Menanyakan hal yang diragukan.'),
 ('[けっか] を 発表します。', '結果', ['給果', '結菓', '給課'], 'Hasil diumumkan.'),
 ('[ちゅうい] して 歩いて ください。', '注意', ['駐意', '注音', '往意'], 'Berjalanlah dengan hati-hati.'),
 ('[しょうかい] します。こちらは 田中さんです。', '紹介', ['招介', '紹分', '照介'], 'Saya perkenalkan. Ini Tanaka.'),
 ('この [ほうほう] が 一番 いい。', '方法', ['方去', '方法', '万法'], 'Cara ini yang terbaik.'),
 ('会議の [じゅんび] を する。', '準備', ['準偹', '準婿', '淮備'], 'Menyiapkan rapat.'),
 ('[かんじ] を 練習する。', '漢字', ['漢字', '難字', '漠字'], 'Berlatih kanji.'),
 ('[しゅうり] に 出す。', '修理', ['終理', '修里', '修埋'], 'Dikirim untuk diperbaiki.'),
 ('[げんいん] を 調べる。', '原因', ['原困', '源因', '元因'], 'Menyelidiki penyebab.'),
 ('[かんそう] を 書く。', '感想', ['感相', '感思', '憾想'], 'Menulis kesan.'),
 ('[かいぎ] は 三時に はじまります。', '会議', ['会義', '合議', '会儀'], 'Rapat dimulai jam tiga.'),
 ('[ようい] を して おく。', '用意', ['用音', '要意', '用憶'], 'Menyiapkan sebelumnya.'),
]
H3 = [r for r in H3 if r[1] not in r[2] and len(set(r[2]))==3]
