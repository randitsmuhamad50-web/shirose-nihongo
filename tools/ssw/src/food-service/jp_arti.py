# -*- coding: utf-8 -*-
# Arti Indonesia untuk indeks kosakata (さくいん) tiga modul Jasa Boga versi Jepang. Daftar kata = indeks resmi modul; arti ditulis oleh Shirose.
ARTI = {}
def _a(s):
    for line in s.strip().splitlines():
        for part in line.split(";"):
            part = part.strip()
            if not part: continue
            k, v = part.split("=", 1); ARTI[k.strip()] = v.strip()
# ---- Pengawasan Kebersihan ----
_a("""赤身魚=ikan merah; アニサキス=Anisakis (parasit); アルコール（消毒）=alkohol (disinfeksi); 一般的衛生管理=pengawasan kebersihan umum; 異物=benda asing; 飲食店=restoran/kedai makan
E型肝炎ウイルス=virus Hepatitis E; ウイルス=virus; ウイルス性食中毒=keracunan makanan akibat virus; ウェルシュ菌=Clostridium perfringens; 塩素系殺菌剤=disinfektan berklorin; 黄色ブドウ球菌=Staphylococcus aureus; おう吐=muntah
親指=ibu jari; 温度=suhu; 温度管理=pengawasan suhu; 温度計=termometer; 温度帯=rentang suhu; 回虫=cacing gelang; 化学性食中毒=keracunan makanan akibat bahan kimia; 加工品=produk olahan; 加熱=pemanasan; 加熱不足=pemanasan kurang
からあげ=ayam/ikan goreng tepung (karaage); カレー=kari; 乾燥=pengeringan/kering; カンピロバクター=Campylobacter; 管理基準=standar pengawasan; 芽胞=spora; 危害要因分析=analisis bahaya; 危険温度帯=zona suhu berbahaya; 寄生虫=parasit; 寄生虫食中毒=keracunan makanan akibat parasit
記録=catatan; 業者=pemasok/vendor; グリストラップ=perangkap lemak; 健康管理=pengelolaan kesehatan; 健康被害=gangguan kesehatan; 下痢=diare; 原因物質=zat penyebab; 交差汚染=kontaminasi silang; 硬質異物=benda asing keras
５S=5S (seiri, seiton, seisou, seiketsu, shitsuke); ごはん=nasi; 細菌=bakteri; 細菌性食中毒=keracunan makanan akibat bakteri; 作業工程=proses kerja; 作業台=meja kerja; 刺身=sashimi; 殺菌=sterilisasi bakteri; 殺虫剤=insektisida
サルモネラ菌=Salmonella; 雑菌=bakteri campuran/liar; 室温=suhu ruang; 湿度=kelembapan; 習慣=kebiasaan; 装飾品=perhiasan; 消毒=disinfeksi; 消費期限=tanggal kedaluwarsa; 賞味期限=tanggal sebaiknya dikonsumsi; 照明=pencahayaan
食中毒=keracunan makanan; 食中毒予防３原則=3 prinsip pencegahan keracunan makanan; 食品残さ=sisa makanan; シンク=bak cuci; 重要管理点=titik pengawasan penting; 重要管理ポイント=poin pengawasan penting; 水洗レバー=tuas penyiram toilet; 水道水=air keran
ステーキ=steak; スープ=sup; 清潔=bersih/sanitasi; 清掃=membersihkan; 製造=produksi; 整頓=menata rapi; 整理=mengorganisir; 赤外線放射温度計=termometer inframerah; セレウス菌=Bacillus cereus; 洗剤=detergen; 洗浄剤=bahan pembersih; 鮮度=kesegaran
ソース=saus; 体調不良=kondisi tubuh tidak sehat; たれ=saus tare (kecap/mirin); ダクト=saluran udara/cerobong; 中心温度=suhu inti; 腸炎ビブリオ=Vibrio parahaemolyticus; 腸管出血性大腸菌=E. coli enterohemoragik; 手洗い場=tempat cuci tangan
定期清掃=pembersihan berkala; 手首=pergelangan tangan; 手の甲=punggung tangan; 手のひら=telapak tangan; 手袋=sarung tangan; てんぷら=tempura; トイレ=toilet; ドアノブ=gagang pintu; 生ごみ=sampah basah; 生野菜サラダ=salad sayuran segar
軟質異物=benda asing lunak; 二次汚染=pencemaran sekunder; 日常清掃=pembersihan harian; 日誌=diari/catatan harian; 二枚貝=kerang-kerangan; 入荷=barang masuk; 熱湯=air mendidih; 納品=pengantaran barang; 農薬=pestisida pertanian; ノロウイルス=Norovirus
廃棄=pembuangan; 廃棄物=limbah; 排水溝=saluran pembuangan; 廃油=minyak bekas; HACCP=HACCP; 発生要因=faktor penyebab; ハンバーグ=hamburger; バンソウコウ=plester; ヒスタミン=histamin; 冷奴=tahu dingin (hiyayakko)
不快異物=benda asing yang tidak menyenangkan; フライドチキン=ayam goreng; ブドウ球菌=Staphylococcus; 便器=bowl toilet; 便座=dudukan toilet; 包丁=pisau dapur; 保存=penyimpanan; 保存方法=cara penyimpanan; 母指球=pangkal ibu jari; ポテトサラダ=salad kentang
まな板=talenan; 焼き魚=ikan bakar; 焼き鳥=yakitori (ayam tusuk bakar); 薬剤=bahan kimia/obat; 指=jari; 指先=ujung jari; 流水=air mengalir; 冷却=pendinginan; 冷却機器=alat pendingin; 冷蔵庫=kulkas; 冷凍庫=freezer; レンジ=kompor""")
# ---- Persiapan Makanan dan Minuman ----
_a("""IHレンジ=kompor induksi (IH); 和える=memberi saus/mengaduk (aeru); 赤身肉=daging merah; 揚げ鍋（てんぷら鍋）=wajan penggorengan (tempura); 揚げる=menggoreng; アサリ=kerang asari; アスパラガス=asparagus; 油=minyak; アユ=ikan ayu; あられ切り=potongan dadu kecil (araregiri); 泡だて=pengocok/mengocok busa
安全装置=pengaman; 炒め物=hidangan tumis; 炒める=menumis; いちご=stroberi; いちょう切り=potong seperempat (daun ginkgo); うぐいす骨=tulang bagian belakang ikan; うちもも（牛肉）=gandik dalam (sapi); えだまめ=edamame; えらふた=tutup insang; おたま=centong sup; おにぎり=nasi kepal (onigiri); おひれ=sirip
温度計=termometer; 温度計（冷蔵・冷凍庫用）=termometer kulkas/freezer; 回転釜=kuali putar (tilting kettle); 回転動力機=mesin berputar bertenaga; 解凍=defrost/mencairkan; 解凍方法=cara defrost; かき=kesemek; カキ=tiram; 火災=kebakaran; 火事=kebakaran; 片手鍋=panci lengan satu
かたばら（牛肉）=sandung lamur (sapi); 肩ロース（牛肉）=punuk-panggang (sapi); 肩ロース（豚肉）=punuk-panggang (babi); かた（牛肉）=sampil (sapi); かた（豚肉）=sampil (babi); カッターミキサー=pemotong-pengaduk (cutter mixer); かっぺん=perubahan warna; カツオ=cakalang; かつらむき=mengupas tipis memanjang (katsuramuki); かぶ=lobak kabu
かぼちゃ=labu kabocha; かま=kuali; からあげ=ayam goreng tepung (karaage); カルビ焼き=daging panggang gaya Korea (karubi-yaki); 皮むき器=pengupas kulit; ガスレンジ=kompor gas; ガラス=kaca; キッチンタイマー=timer dapur; キッチンポット=panci dapur; 喫煙=merokok
キャベツ=kubis; きゅうり=timun Jepang; きんぴら=kinpira (gobou tumis); 牛肉=daging sapi; ギンナン=kacang ginkgo; くり=kastanye; 車えび=udang kuruma; グリドル=papan pemanggang (griddle); 計量カップ=gelas takar; 計量スプーン=sendok takar
ケーキバット（角盆）=baki persegi (cake vat); 小型洗浄機=pencuci piring kecil; 小型調理器=alat masak kecil; 小口切り=potong bulat tipis (koguchigiri); コロッケ=kroket; コンセント=stop kontak; コンベアタイプ洗浄機=pencuci piring ban berjalan; ごはん=nasi; ごぼう=ketela Jepang (gobou); 五目煮=rebusan campuran (gomoku ni)
ゴーヤー=paria (goya); 西京焼き=ikan panggang gaya Kyoto (saikyoyaki); サイの目切り=potong dadu 1 cm (sainomekiri); さいばし=sumpit panjang; サケ=salmon; ささがき=serut tipis seperti bambu (sasagaki); ささみ（鶏肉）=dada bagian bawah (ayam); 刺身=sashimi; 刺身包丁=pisau sashimi
殺菌庫=pensteril; さつまいも=ubi jalar; さといも=talas; さやいんげん=kacang panjang; サワラ=makerel pasifik (sawara); サンマ=sauri pasifik; 三枚おろし=filet tiga bagian; サーロイン=has luar (sirloin); サーロイン（牛肉）=has luar (sapi); 色紙切り=potong kotak ± 3 cm (shikishigiri)
下味=bumbu awal/marinasi; 下処理=persiapan dasar; シチュー=semur; 湿度計=higrometer; 脂肪=lemak; シメジ=jamur shimeji; しゃぶしゃぶ=shabu-shabu; しゃもじ（宮島）=sendok nasi Miyajima; シャーレン鍋=wok/kuali Tiongkok; しゅうまい=shumai
旬=sedang musim; しゅんぎく=daun seruni (shungiku); 消火活動=kegiatan pemadaman; 消火器=alat pemadam kebakaran; しょうがやき=babi bakar jahe (shogayaki); 食塩水=air garam; 食感=tekstur di mulut; 食器=peralatan makan; しらが=potong korek amat tipis (shiraga); しりひれ=sirip anus
真空包装機=pengemas vakum; 真空冷却機=pendingin vakum; ジェットオーブン=jet oven; 自動手指消毒器=pembersih tangan otomatis; じゃがいも=kentang; すいか=semangka; スキヤキ=sukiyaki; すくい網=sendok jaring; スクランブルエッグ=telur orak-arik; すし=sushi
スチームコンベクションオーブン=oven konveksi uap; ステンレスざる=saringan besi tahan karat; すね（牛肉）=sengkel (sapi); スパテラ=spatula; 酢水=air cuka; スルメイカ=cumi-cumi surume; ズワイガニ=kepiting salju; 寸胴=panci silindris; 成形=membentuk; 製氷機=pembuat es
赤外線放射温度計=termometer inframerah; 赤飯=nasi ketan merah (sekihan); せびれ=sirip punggung; セミドレス=semi-dressed (hanya organ dibuang); 千切り=potong korek api (sengiri); そくせん=tulang samping (sokusen); そともも（牛肉）=gandik luar (sapi); そともも（豚肉）=kaki luar (babi); そらまめ=kacang bakla/sora-mame; 炊く=menanak
卓上炊飯器=penanak nasi meja; たけのこ=rebung; たまねぎ=bawang bombay; タラ=ikan kod; 短冊切り=potong persegi panjang tipis (tanzakugiri); だいこん=lobak putih; 台車=troli; チキンカツ=cutlet ayam; 茶碗蒸し=puding telur gurih (chawanmushi); 中華炒め=tumisan Tiongkok
中華鍋（広東鍋）=wok Guangdong; 中華鍋（北京鍋）=wok Beijing; 中華包丁=golok dapur Tiongkok; 中華用おたま=centong sup Tiongkok; 中華レンジ=kompor gas masakan Tiongkok; 中心温度計=termometer suhu inti; 調理機器=perlengkapan masak; てば（鶏肉）=sayap (ayam); てぼ（和麺、中華麺）=saringan mi; 照り焼き=teriyaki
てんぷら=tempura; テーブル型冷蔵冷凍庫=kulkas freezer meja kerja; デジタルはかり=timbangan digital; デジタル中心温度計=termometer jarum digital; 電源=sumber listrik; 電源プラグ=steker listrik; とうがらし=cabai rawit; 陶器=tembikar; 整え=merapikan; トマト=tomat
鶏肉=daging ayam; とんかつ=cutlet babi (tonkatsu); トンポーロー=babi Dongpo; ドアタイプ洗浄機=pencuci piring berpintu; ドライキッチン=dapur tidak basah; ドレス=dressed (kepala, insang, organ dibuang); 菜切包丁=pisau sayur; なし=pir; なす=terong; 斜め切り=potong diagonal (nanamegiri); 菜の花=bunga nanohana
肉じゃが=daging dan kentang rebus (nikujaga); 肉類=jenis daging; 煮込み料理=hidangan rebus lama; 煮る=merebus perlahan; にんじん=wortel; ねぎ=bawang daun; 濃度=konsentrasi; 刃=mata pisau; はかり=timbangan; はくさい=sawi putih; ハタハタ=ikan pasir (hatahata); 刃物=benda tajam
腹ひれ=sirip perut; 半月切り=potong setengah lingkaran (hangetsugiri); ばら（豚肉）=samcan (babi); パン切りナイフ=pisau roti; 非加熱調理=memasak tanpa panas; 拍子切り=potong balok (hyoshigikiri); ヒレ（牛肉）=filet has dalam (sapi); ヒレ（豚肉）=filet (babi); ビーフカツ=cutlet sapi; ピーマン=paprika
フィーレ=filet (tanpa tulang utama, sirip, ekor); ふき=daun fuki; フグ=ikan buntal (fugu); フナ=karper krusia; フライ=gorengan bertepung; フライパン=wajan penggorengan; フライヤー=penggorengan (fryer); フリッター=goreng adonan (fritter); フードスライサー=pengiris makanan; 部位=bagian/potongan
豚しゃぶ=babi shabu-shabu; 豚肉=daging babi; 豚の角煮=babi rebus potong dadu (kakuni); ブラストチラー=blast chiller; ブリ=ikan amberjack (buri); ブレージングパン=braising pan; ブロッコリー=brokoli; プラスチックざる=saringan plastik; プレハブ冷蔵冷凍庫=kulkas/freezer prefabrik; へら=spatula
包丁（三徳包丁）=pisau Santoku; ほうれんそう=bayam Jepang; ホタテ=skalop; ホッケ=makerel hokke; ホテルパン（フードパン）=loyang hotel; ほほ骨=tulang pipi; ボンレスハム=ham bebas tulang; ボール=mangkuk; ポテトサラダ=salad kentang; ポークビーンズ=kacang dengan babi
マアジ=makerel jack Jepang (maaji); マイワシ=sarden Jepang; 巻き物=nasi gulung (makimono); マグロ=tuna; マサバ=ikan saba; マダイ=seabream merah; まな板=talenan; マリネ=marinasi; みじん切り=cincang halus (mijingiri); 水菜=sayur mizuna
蒸し器=pengukus; 蒸し器（鍋）=kukusan (panci); 蒸し鶏=ayam kukus; 蒸す=mengukus; 胸ひれ=sirip dada; むね（鶏肉）=dada (ayam); メロン=melon; もも=persik/paha; もも（鶏肉）=paha (ayam); もも（豚肉）=kapsim (babi)
盛り付け=penataan hidangan; やかん（ケトル）=ceret; 焼き鳥=yakitori; 焼肉=yakiniku (daging bakar); 焼豚=babi panggang (yakibuta); 焼物器=panggangan; 焼く=memanggang; 野菜炒め=tumis sayuran; 野菜サラダ=salad sayur; 野菜・果実類=sayuran dan buah
雪平鍋=panci aluminium lengan satu (yukihira); 茹で枝豆=edamame rebus; 茹でじゃがいも=kentang rebus; ゆで麺器=perebus mi; 茹でる=merebus; ライスウォーマー=penghangat nasi; ラウンド=bagian bundar (round); 乱切り=potong acak (rangiri); ランプ（牛肉）=tanjung (sapi); 立体式炊飯器=kabinet nasi bertingkat
リブリース（牛肉）=iga-panggang (sapi); 流水解凍=defrost dengan air mengalir; 料理鍋=panci masak; 冷蔵解凍=defrost di kulkas; 冷蔵ショーケース=kulkas etalase; 冷蔵冷凍庫=kulkas freezer; レタス=selada; れんこん=akar teratai; レードル=centong/sendok sup; ローストビーフ=daging sapi panggang
ロースハム=ham loin; ロース（豚肉）=has dalam (babi); ワカメ=rumput laut wakame; 輪切り=potong bundar (wagiri); ステーキ=steak""")
ARTI.update({"そくせん": "garis rusuk/linea lateral ikan (sokusen)", "うぐいす骨": "tulang ikan (bagian uguisu-bone)", "かま": "bagian kolar ikan (kama)", "ほほ骨": "tulang pipi ikan", "ラウンド": "ikan utuh/round (belum diproses)", "ともばら（牛肉）": "perut & samcan (sapi, tomobara)", "ガラス": "kaca/serpihan kaca"})
# ---- Layanan Pelanggan ----
_a("""あいさつ=sapaan; 赤ワイン=anggur merah; 揚げ物=gorengan; アナフィラキシーショック=syok anafilaksis; 甘味=rasa manis; アレルギー表示=pelabelan alergen; アレルギー物質=zat alergen; イスラム教=agama Islam; イスラム法=hukum Islam; 一汁三菜=satu sup tiga lauk; 異物混入=pencemaran benda asing
芋焼酎=shochu ubi; ウイスキー=wiski; うま味=umami; ヴィーガン=vegan; 笑顔=senyum; 会釈=membungkuk ringan (eshaku); えび=udang; 円卓=meja bundar; おう吐=muntah; お客様=pelanggan (hormat); お酒=minuman beralkohol; お辞儀=membungkuk; お造り=sashimi (hidangan)
おもてなし=keramahtamahan (omotenashi); オードブル=hidangan pembuka (hors d'oeuvre); 会計=pembayaran/tagihan; 介助犬=anjing bantu fisik; 介助用車椅子=kursi roda yang didorong pendamping; 会席料理=hidangan perjamuan kaiseki; 快適性=kenyamanan; 開店準備=persiapan buka; 回転卓=meja putar
果実酒=minuman beralkohol buah; カスターセット=set bumbu di meja; 価値=nilai; かに=kepiting; 上座=tempat kehormatan (kamiza); 完全菜食主義者=vegan (vegetarian murni); 期待感=harapan; 基本動作=gerakan dasar; キャッシュレス決済=pembayaran cashless
救急車=ambulans; QRコード決済=pembayaran kode QR; QSCA=QSCA (kualitas, layanan, kebersihan, suasana); 記録用紙=lembar catatan; 金銭=uang; 苦情=keluhan; 口もと=area mulut; 車椅子=kursi roda; クレジットカード=kartu kredit; クレーム=klaim/keluhan
グラス=gelas; 経験=pengalaman; 敬礼（普通礼）=membungkuk sopan (keirei, 30°); ゲリラ豪雨=hujan lebat mendadak; 現金=uang tunai; 硬貨=koin; 硬質異物=benda asing keras; 香の物=acar Jepang (tsukemono); 高齢者=lansia; 顧客満足=kepuasan pelanggan
呼吸困難=sesak napas; 心=hati/perasaan; コニャック=cognac; コミュニケーション=komunikasi; 小麦=gandum; コールバック=menelepon balik; ５大栄養素=5 gizi utama; ゴブレットグラス=gelas bertangkai (goblet); 災害=bencana; 最敬礼=membungkuk hormat (saikeirei, 45°)
魚料理=hidangan ikan; サジェスチョンサービス=layanan rekomendasi; 作法=tata cara/etiket; 酸味=rasa asam; 塩味=rasa asin; 脂質=lemak; 自然災害=bencana alam; 紙幣=uang kertas; 下座=tempat biasa (shimoza); 車両=kendaraan
主菜=lauk utama; 消火器=alat pemadam; 紹興酒=anggur shaoxing; 焼酎=shochu; 食品ロス=makanan terbuang; 食物アレルギー=alergi makanan; 汁=sup; シルバー=perangkat makan perak (pisau-garpu); 白ワイン=anggur putih; シードル=cider
ジェネヴァ=jenever (gin); 地震=gempa bumi; 自走式車椅子=kursi roda yang dikayuh sendiri; 醸造酒=minuman hasil fermentasi; 蒸留酒=minuman hasil distilasi; ジン=gin; 吸い物=sup bening (suimono); 酢の物=hidangan bercuka (sunomono); スパークリングワイン=anggur bersoda
スプーン=sendok; スマイル＆アイコンタクト=senyum dan kontak mata; スープ=sup; 清潔感（Cleanliness）=kebersihan (Cleanliness); 精算=perhitungan/pelunasan; 清酒=sake murni; 接客=melayani pelanggan; 接客サービス（Service）=layanan pelanggan (Service); 前菜=hidangan pembuka
そば=soba; 体調不良=kondisi tubuh tidak sehat; 台風=topan; 卵=telur; 炭水化物=karbohidrat; たんぱく質=protein; 中国料理=masakan Tiongkok; 聴導犬=anjing pemandu tunarungu; 津波=tsunami; 提供禁止=dilarang menyajikan
テイクアウト=bungkus (take-out); テーブルセッティング=penataan meja; デザート=hidangan penutup; デビットカード=kartu debit; デミコーヒー=demi-coffee (kopi kecil); 電子マネー=uang elektronik; 伝票=bon/nota; トレイ=baki; 特定原材料=bahan alergen yang ditetapkan; 床の間=tokonoma (ruang hiasan)
動物性食品=makanan hewani; ナイフ=pisau makan; 軟質異物=benda asing lunak; 苦味=rasa pahit; 肉料理（アントレー）=hidangan daging (entrée); にごり酒=sake berawan; 日本酒=sake Jepang; 日本料理=masakan Jepang; 煮物=hidangan rebus; 乳=susu
乳幼児=bayi dan balita; 年齢確認=pemeriksaan usia; 配膳=menata dan menyajikan hidangan; 配膳（サービング）=penyajian (serving); 配慮=perhatian/pertimbangan; 箸=sumpit; ハラーム=haram; ハラール=halal; ハンドルキーパー=designated driver; ハーネス（胴輪）=harness (sabuk badan anjing)
麦酒=bir; 避難=evakuasi; 避難場所=tempat evakuasi; ビタミン=vitamin; ビール=bir; ピークタイム=jam ramai; 風習=kebiasaan/adat; フォーク=garpu; 副菜=lauk pelengkap; 不満=ketidakpuasan
フランス料理=masakan Prancis; 雰囲気（Atmosphere）=suasana (Atmosphere); フードサービス業=industri jasa boga; ブランデー=brandy; ブレンデッドウイスキー=wiski campuran; 文化=budaya; 閉店作業=tugas tutup restoran; ベジタリアン=vegetarian; 法律=hukum; 補助犬=anjing asisten
ホスピタリティ=keramahtamahan (hospitality); マナー=tata krama; 満足=kepuasan; 味覚=indra perasa/rasa; 水菓子=buah (hidangan penutup); 未成年=di bawah umur; 身だしなみ=penampilan rapi; ミネラル=mineral; 身分証明証=kartu identitas; 麦焼酎=shochu gandum
目もと=area mata; 盲導犬=anjing penuntun tunanetra; モルトウイスキー=wiski malt; 焼き物=hidangan bakar; 洋食=masakan Barat; 老酒=laojiu (arak beras Tiongkok); 落花生=kacang tanah; リピーター=pelanggan yang kembali; 料理の品質（Quality）=kualitas hidangan (Quality); 礼儀=sopan santun
レジ=mesin kas; レジ締め=menutup kas/menghitung kas; レディーファースト=utamakan perempuan (ladies first); ロンドンジン=London gin; ワイン=anggur; 和食=masakan Jepang""")
