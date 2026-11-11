# -*- coding: utf-8 -*-
S = [
 ("新制度は一見、公平に見える。（　）、実際には一部の人にだけ有利に働いている。","しかし",["したがって","なぜなら","すなわち"],"Sekilas sistem baru tampak adil. Namun kenyataannya hanya menguntungkan sebagian orang.","しかし."),
 ("気候変動の影響は深刻だ。（　）、各国は協力して対策を進める必要がある。","したがって",["ところが","もっとも","ただし"],"Dampak perubahan iklim serius. Karena itu, tiap negara perlu bekerja sama.","したがって."),
 ("この制度は便利だ。（　）、個人情報の管理には十分な注意が必要だ。","ただし",["したがって","なぜなら","すなわち"],"Sistem ini praktis. Hanya saja pengelolaan data pribadi perlu sangat hati-hati.","ただし."),
 ("彼は大学で経済を学んだ。（　）、卒業後は金融業界に入った。","その後",["ところが","つまり","ただし"],"Dia belajar ekonomi di universitas. Setelah itu masuk industri keuangan.","その後."),
 ("事故の原因は不明だ。（　）、調査は続けられている。","それゆえ",["ところが","しかしながら","もっとも"],"Penyebab kecelakaan belum jelas. Karena itu penyelidikan berlanjut.","それゆえ."),
 ("人口が減少している。（　）、地方の経済は縮小している。","その結果",["ところが","ただし","しかも"],"Populasi berkurang. Akibatnya ekonomi daerah menyusut.","その結果."),
 ("彼は優秀な研究者だ。（　）、教育者としても高く評価されている。","のみならず",["したがって","ところが","もっとも"],"Dia peneliti unggul. Bukan hanya itu, dia juga dihargai sebagai pendidik.","のみならず / さらに."),
 ("計画は順調に進んでいる。（　）、油断は禁物だ。","とはいえ",["したがって","なぜなら","すなわち"],"Rencana berjalan lancar. Namun demikian, tak boleh lengah.","とはいえ."),
 ("この方法は効果的だ。（　）、費用が高いという欠点がある。","ただし",["したがって","なぜなら","すなわち"],"Cara ini efektif. Hanya saja ada kekurangan biayanya mahal.","ただし."),
 ("多くの企業が海外に進出している。（　）、国内の雇用は減っている。","その一方で",["したがって","なぜなら","すなわち"],"Banyak perusahaan melebar ke luar negeri. Di sisi lain lapangan kerja dalam negeri berkurang.","その一方で."),
 ("彼女は成功した。（　）、その裏には大変な努力があった。","もっとも",["したがって","なぜなら","すなわち"],"Dia berhasil. Meski demikian di baliknya ada kerja keras luar biasa.","もっとも."),
 ("自然災害は避けられない。（　）、被害を減らす努力はできる。","しかし",["したがって","なぜなら","すなわち"],"Bencana alam tak terhindarkan. Namun upaya mengurangi kerusakan bisa dilakukan.","しかし."),
 ("彼は日本の古典文学、（　）、源氏物語を専門に研究している。","とりわけ",["もっとも","したがって","ところが"],"Dia meneliti sastra klasik Jepang, khususnya Genji Monogatari.","とりわけ."),
 ("消費税が上がった。（　）、買い控えが広がっている。","そのため",["ところが","ただし","しかも"],"Pajak konsumsi naik. Karena itu orang menahan belanja.","そのため."),
 ("法律は守らなければならない。（　）、状況によっては例外もある。","もっとも",["したがって","なぜなら","すなわち"],"Hukum harus dipatuhi. Meski begitu, ada pengecualian tergantung situasi.","もっとも."),
 ("新しい技術が登場した。（　）、従来の産業は大きな変革を迫られている。","これにより",["ところが","ただし","しかも"],"Teknologi baru muncul. Karenanya industri lama terdesak berubah.","これにより."),
 ("交通渋滞は深刻な問題だ。（　）、公共交通の整備が急がれる。","それゆえ",["ところが","もっとも","しかしながら"],"Kemacetan masalah serius. Karena itu pembenahan transportasi umum mendesak.","それゆえ."),
 ("彼の主張は理論上は正しい。（　）、現実には実行が難しい。","しかしながら",["したがって","なぜなら","すなわち"],"Pendapatnya benar secara teori. Namun dalam kenyataan sulit dilaksanakan.","しかしながら."),
]
S = [r for r in S if len(r[2])==3 and r[1] not in r[2]]
