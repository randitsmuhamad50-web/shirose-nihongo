# -*- coding: utf-8 -*-
"""Kosakata latihan baca Kana: 200 kata hiragana penuh + 200 kata katakana. Format 'kana|arti'. Romaji dibuat otomatis (hepburn)."""
HIRA = """
あい|cinta|あおい|biru|あか|merah|あかい|merah (sifat)|あき|musim gugur|あさ|pagi|あし|kaki|あした|besok|あめ|hujan|あり|semut
いえ|rumah|いぬ|anjing|いす|kursi|いち|satu|いま|sekarang|いし|batu|うみ|laut|うし|sapi|うた|lagu|うで|lengan|うま|kuda
えき|stasiun|えび|udang|えほん|buku bergambar|おか|bukit|おかし|kue/camilan|おとこ|laki-laki|おんな|perempuan|おおきい|besar|おいしい|enak|おもい|berat
おちゃ|teh|かお|wajah|かぎ|kunci|かさ|payung|かぜ|angin; flu|かめ|kura-kura|かみ|kertas; rambut|かばん|tas|かわ|sungai|からだ|tubuh
き|pohon|きく|mendengar|きって|perangko|きのう|kemarin|きもの|kimono|きれい|cantik; bersih|くち|mulut|くつ|sepatu|くも|awan|くるま|mobil
くだもの|buah|くすり|obat|くび|leher|けさ|pagi ini|けむり|asap|こえ|suara|こども|anak|ここ|di sini|こたえ|jawaban|ごはん|nasi; makan
こおり|es|さかな|ikan|さくら|sakura|さけ|sake|さる|monyet|さむい|dingin (cuaca)|さんぽ|jalan-jalan|しお|garam|しか|rusa|しごと|pekerjaan
した|bawah|しろい|putih|しんぶん|koran|すし|sushi|すいか|semangka|すき|suka|すくない|sedikit|せんせい|guru|せかい|dunia|せなか|punggung
そら|langit|そと|luar|そば|soba|たべる|makan|たまご|telur|たいせつ|penting|たかい|tinggi; mahal|たのしい|menyenangkan|ちかい|dekat|ちず|peta
ちいさい|kecil|つき|bulan|つくえ|meja|つめたい|dingin (benda)|て|tangan|てがみ|surat|てんき|cuaca|とけい|jam|とり|burung|ともだち|teman
とまる|berhenti|とお|sepuluh|なつ|musim panas|なまえ|nama|なみ|ombak|なに|apa|ならう|belajar|にく|daging|にほん|Jepang|にわ|taman
にじ|pelangi|ぬの|kain|ねこ|kucing|ねる|tidur|ねぎ|daun bawang|のり|rumput laut|のむ|minum|のみもの|minuman|はし|sumpit; jembatan|はな|bunga; hidung
はは|ibu (saya)|はる|musim semi|はれ|cerah|ひ|api; hari|ひと|orang|ひだり|kiri|ひるごはん|makan siang|ふゆ|musim dingin|ふね|kapal|ふとん|kasur lipat
へや|kamar|へび|ular|ほし|bintang|ほん|buku|ほね|tulang|まど|jendela|まち|kota|まえ|depan|みず|air|みみ|telinga
みち|jalan|みどり|hijau|みせ|toko|むし|serangga|むずかしい|sulit|め|mata|めがね|kacamata|もも|persik|もり|hutan|もの|benda
やま|gunung|やさい|sayur|やすみ|libur|やさしい|baik hati; mudah|ゆき|salju|ゆび|jari|ゆめ|mimpi|よる|malam|よむ|membaca|よこ|samping
りす|tupai|りんご|apel|るす|tidak di rumah|れい|nol; contoh|ろく|enam|わたし|saya|わに|buaya|わらう|tertawa
ぶた|babi|ばら|mawar|だいがく|universitas|でんしゃ|kereta listrik|ごみ|sampah|げんき|sehat|ぞう|gajah|じかん|waktu|ぎんこう|bank|どうぶつ|hewan
べんきょう|belajar|びょういん|rumah sakit|ぼうし|topi|ぱん|roti|ぺん|pena|えんぴつ|pensil|てんぷら|tempura|ぽかぽか|hangat nyaman|ぴったり|pas|ぺらぺら|fasih
ざっし|majalah|ずっと|terus; selama|いっしょ|bersama|がっこう|sekolah|ちょっと|sebentar|もっと|lebih|きっぷ|tiket|にっき|buku harian|さっき|tadi|いっぱい|penuh
みっつ|tiga buah|やっつ|delapan buah|むっつ|enam buah|よっつ|empat buah|けっこん|pernikahan|ひっこし|pindahan|まっすぐ|lurus|ゆっくり|pelan-pelan|はっぱ|daun|あっち|sana
しゃしん|foto|きょう|hari ini|じゅう|sepuluh|びょうき|sakit|りょうり|masakan|しゅくだい|PR|きゃく|tamu|ひゃく|seratus|りゅう|naga|しょくじ|makan
ぎゅうにゅう|susu|じゃがいも|kentang|きょうしつ|ruang kelas|ちゅうごく|Cina|おもちゃ|mainan|おかあさん|ibu|おとうさん|ayah|おにいさん|kakak laki-laki|おねえさん|kakak perempuan|おじいさん|kakek
おばあさん|nenek|ありがとう|terima kasih|おはよう|selamat pagi|こんにちは|selamat siang|こんばんは|selamat malam|さようなら|sampai jumpa|おやすみ|selamat tidur|すみません|permisi; maaf|ごめんなさい|maaf|いただきます|selamat makan
とうきょう|Tokyo|ゆうめい|terkenal|とおい|jauh|おおい|banyak|えいが|film|こうえん|taman|ひこうき|pesawat|とうふ|tahu|おおさか|Osaka|ふじさん|Gunung Fuji
に|dua|さん|tiga|よん|empat|ご|lima|なな|tujuh|はち|delapan|きゅう|sembilan
"""

KATA = """
アイス|es|アイスクリーム|es krim|アパート|apartemen|アメリカ|Amerika|アジア|Asia|アルバイト|kerja paruh waktu|イギリス|Inggris|インド|India|インドネシア|Indonesia|インターネット|internet
イタリア|Italia|イヤホン|earphone|エアコン|AC|エレベーター|lift|エスカレーター|eskalator|エンジン|mesin|オレンジ|jeruk|オートバイ|sepeda motor|オーストラリア|Australia|オフィス|kantor
オムライス|nasi omelet|カメラ|kamera|カレー|kari|カレンダー|kalender|カーテン|gorden|カップ|cangkir|カード|kartu|ガス|gas|ガラス|kaca|ガソリン|bensin
ギター|gitar|キッチン|dapur|キロ|kilo|キーボード|keyboard|クラス|kelas|クリスマス|Natal|クッキー|kue kering|ケーキ|kue|ゲーム|permainan|コーヒー|kopi
コート|mantel|コップ|gelas|コピー|fotokopi|コンビニ|minimarket|コンピューター|komputer|コンサート|konser|コーラ|cola|ココア|cokelat panas|サッカー|sepak bola|サラダ|salad
サンドイッチ|sandwich|サイズ|ukuran|シャツ|kemeja|シャワー|pancuran|シャンプー|sampo|ジュース|jus|ジャム|selai|ジーンズ|jeans|ジム|gym|スーパー|supermarket
スカート|rok|スプーン|sendok|スポーツ|olahraga|スマホ|ponsel pintar|スキー|ski|ステーキ|steik|ストーブ|pemanas|スーツ|setelan jas|スイッチ|saklar|セーター|sweter
セット|set|ソファ|sofa|ソース|saus|ソーセージ|sosis|タクシー|taksi|タオル|handuk|タイ|Thailand|ダンス|dansa|ダイエット|diet|チーズ|keju
チョコレート|cokelat|チケット|tiket|チーム|tim|テーブル|meja|テレビ|televisi|テニス|tenis|テスト|ujian|ティッシュ|tisu|トイレ|toilet|トマト|tomat
トラック|truk|ドア|pintu|ドライヤー|pengering rambut|ドラマ|drama|ドレス|gaun|ドル|dolar|トースト|roti panggang|ナイフ|pisau|ナプキン|serbet|ニュース|berita
ネクタイ|dasi|ネット|jaring; internet|ノート|buku catatan|ノック|ketukan|バス|bus|バナナ|pisang|バター|mentega|バイク|motor|バスケットボール|bola basket|パン|roti
パソコン|komputer pribadi|パーティー|pesta|パスポート|paspor|パンツ|celana|ビール|bir|ビル|gedung|ビデオ|video|ピアノ|piano|ピザ|pizza|ピンク|merah muda
フォーク|garpu|フランス|Prancis|プール|kolam renang|プレゼント|hadiah|プリン|puding|ブラシ|sikat|ブルー|biru|ベッド|tempat tidur|ペン|pena|ページ|halaman
ベルト|ikat pinggang|ホテル|hotel|ボール|bola|ボールペン|bolpoin|ポスト|kotak pos|ポケット|saku|ポテト|kentang|マンション|apartemen (kondominium)|マスク|masker|マフラー|syal
メール|surel|メニュー|menu|メートル|meter|モデル|model|モノレール|monorel|ヨーロッパ|Eropa|ヨット|kapal layar|ラジオ|radio|ラーメン|ramen|レストラン|restoran
レモン|lemon|レシート|struk|レポート|laporan|レタス|selada|ロボット|robot|ロッカー|loker|ワイン|anggur (wine)|ワンピース|terusan|ウイスキー|wiski|ハンバーガー|hamburger
ハンカチ|saputangan|ハム|ham|ヘルメット|helm|ホットドッグ|hot dog|マラソン|maraton|ミルク|susu|ミシン|mesin jahit|ミーティング|rapat|ミキサー|blender|ドイツ|Jerman
ブラジル|Brasil|ベトナム|Vietnam|フィリピン|Filipina|ネパール|Nepal|カンボジア|Kamboja|ミャンマー|Myanmar|モンゴル|Mongolia|ロシア|Rusia|モップ|pel|バケツ|ember
ワックス|wax|ポリッシャー|polisher|クロス|kain lap|パッド|bantalan|カート|troli|スクレーパー|scraper|ユニフォーム|seragam|マニュアル|panduan|ルール|aturan|フロア|lantai
ロビー|lobi|テント|tenda|ライト|lampu|ライオン|singa|ゴリラ|gorila|パンダ|panda|ペンギン|penguin|カンガルー|kanguru|サル|monyet (katakana)|ホース|selang|テープ|selotip
"""
