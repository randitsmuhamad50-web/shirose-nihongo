# -*- coding: utf-8 -*-
"""Data flashcard peralatan (ビルクリーニング用具). Gambar = potongan halaman 81-82 buku JBMA (assets/ssw/building-cleaning/alat/NN.webp).
(jp, kana/bacaan, romaji, arti_id (sesuai buku), fungsi ringkas)"""
import json, os
A = [
("作業標示板（フロアサイン）","さぎょうひょうじばん","sagyō hyōji-ban (floa sain)","Papan Tanda (Floor Sign)","Dipasang di lokasi kerja untuk memperingatkan orang sekitar (mis. lantai basah/sedang dibersihkan)."),
("自在ぼうき","じざいぼうき","jizai bōki","Sapu Ruangan","Sapu bergagang panjang untuk menyapu lantai dalam ruangan."),
("シダぼうき","シダぼうき","shida bōki","Sapu Ijuk","Sapu dari serat alami untuk menyapu debu dan sampah."),
("文化ちり取り","ぶんかちりとり","bunka chiritori","Pengki (Serokan)","Pengki bergagang untuk menampung sampah hasil sapuan tanpa membungkuk."),
("ダストクロス","ダストクロス","dasuto kurosu","Dust Cloth","Kain khusus penangkap debu."),
("ダストクロス型モップ","ダストクロスがたモップ","dasuto kurosu-gata moppu","Dust Cloth Tipe Pel","Pel yang memakai dust cloth untuk menyapu debu di lantai."),
("湿式モップ（ワンタッチモップ）","しっしきモップ","shisshiki moppu (wantatchi moppu)","Pel Basah (Sekali Pakai)","Pel basah untuk mengepel lantai."),
("T字型モップ","ティーじがたモップ","tī-ji-gata moppu","Pel Bentuk T","Pel berbentuk T untuk mengepel lantai."),
("乾式モップ","かんしきモップ","kanshiki moppu","Pel Kering","Pel kering untuk menyapu debu dan kotoran ringan di lantai."),
("フラット型モップ","フラットがたモップ","furatto-gata moppu","Pel Bentuk Datar","Pel berbentuk datar (flat) untuk mengepel/menyapu lantai dengan rata."),
("デッキブラシ","デッキブラシ","dekki burashi","Sikat Dek","Sikat bergagang panjang untuk menggosok lantai."),
("フロアスクイジー","フロアスクイジー","furoa sukuijī","Squeegee Lantai (di buku ID tertulis: Penanda “Lantai Licin”)","Karet pendorong untuk mengumpulkan dan membuang air dari lantai."),
("汚水取り","おすいとり","osui-tori","Pengki untuk Air","Wadah penampung untuk mengambil air kotor."),
("シャンバー","シャンバー","shanbā","Window Washer","Alat berbulu/busa untuk membasahi dan menggosok kaca."),
("ウインドスクイジー","ウインドスクイジー","uindo sukuijī","Window Cleaner","Karet pembersih kaca untuk menyapu air dari permukaan kaca."),
("タオル","タオル","taoru","Lap","Kain lap untuk mengelap permukaan."),
("超極細繊維クロス","ちょうごくさいせんいクロス","chōgokusai sen'i kurosu","Lap Serat Ultrafine","Kain serat sangat halus untuk membersihkan kotoran dengan baik."),
("毛かき","けかき","kekaki","Sikat Rambut","Alat untuk mengambil rambut/kotoran yang tersangkut di sikat atau mesin."),
("バケツ","バケツ","baketsu","Ember","Wadah air atau larutan pembersih."),
("モップ絞り器","モップしぼりき","moppu shibori-ki","Alat Pemeras Kain Pel","Alat untuk memeras kain pel."),
("漏電・過電流防止装置","ろうでん・かでんりゅうぼうしそうち","rōden/kadenryū bōshi sōchi","Perangkat Pencegah Listrik Bocor atau Arus Pendek","Alat pengaman yang memutus listrik bila terjadi kebocoran arus atau arus berlebih."),
("真空掃除機（ポッド型）","しんくうそうじき（ポッドがた）","shinkū sōjiki (poddo-gata)","Penyedot Debu (Tipe Pod)","Penyedot debu bentuk tabung untuk menyedot debu di lantai."),
("真空掃除機（アップライト型）","しんくうそうじき（アップライトがた）","shinkū sōjiki (appuraito-gata)","Penyedot Debu (Tipe Upright)","Penyedot debu tegak, cocok untuk karpet."),
("ハンディバキューム","ハンディバキューム","handi bakyūmu","Penyedot Debu Tipe Handheld","Penyedot debu genggam untuk tempat sempit dan sudut."),
("ウェットバキューム","ウェットバキューム","wetto bakyūmu","Penyedot Debu Tipe Wet","Penyedot yang dapat menyedot air dan kotoran basah."),
("フロアパッド","フロアパッド","furoa paddo","Floor Pad","Bantalan yang dipasang pada polisher untuk menggosok atau memoles lantai."),
("ポリッシャー","ポリッシャー","porisshā","Polisher","Mesin putar untuk menggosok dan memoles lantai."),
("自動床洗浄機","じどうゆかせんじょうき","jidō yuka senjōki","Pembersih Lantai Otomatis","Mesin yang menyikat dan menyedot air kotor lantai secara otomatis."),
("エクストラクター","エクストラクター","ekusutorakutā","Extractor","Mesin pencuci karpet yang menyemprot cairan dan menyedot kembali."),
("高圧洗浄機","こうあつせんじょうき","kōatsu senjōki","Mesin Pembersih Bertekanan Tinggi","Mesin penyemprot air bertekanan tinggi untuk kotoran membandel."),
("送風機","そうふうき","sōfūki","Kipas Pengering","Kipas untuk mengeringkan lantai atau karpet yang basah."),
("ハンドパッド","ハンドパッド","hando paddo","Hand Pad","Bantalan gosok yang dipegang tangan untuk menggosok kotoran."),
("静電気ほこり取り","せいでんきほこりとり","seidenki hokori-tori","Pembersih Debu Elektrik","Alat penarik debu dengan listrik statis untuk tempat tinggi/sempit."),
("保護手袋","ほごてぶくろ","hogo tebukuro","Sarung Tangan Pelindung","Melindungi tangan dari pembersih dan kotoran."),
("スクレーパー","スクレーパー","sukurēpā","Scraper","Alat pengerok untuk mengangkat kotoran yang menempel."),
("計量カップ","けいりょうカップ","keiryō kappu","Gelas Pengukur","Untuk menakar jumlah cairan pembersih."),
("プランジャー","プランジャー","puranjā","Alat Sedot WC","Alat pelontak untuk melancarkan saluran yang tersumbat."),
("作業カート","さぎょうカート","sagyō kāto","Keranjang Peralatan","Troli untuk membawa peralatan dan bahan pembersih."),
("廃棄物コレクター","はいきぶつコレクター","haikibutsu korekutā","Keranjang Limbah","Wadah/troli untuk mengumpulkan sampah."),
("手押し台車","ておしだいしゃ","teoshi daisha","Troli Dorong","Troli dorong untuk mengangkut barang."),
]
def build(root):
    v = {x["kata"]: x["id"] for x in json.load(open(os.path.join(root, "data/ssw/building-cleaning/vocab.json"), encoding="utf-8"))["items"]} if False else {}
    out = []
    for i, (jp, kana, ro, ar, fn) in enumerate(A, 1):
        pg = 81 if i <= 20 else 82
        out.append({"id": "alat-%02d" % i, "no": 1000 + i, "jp": jp, "kana": kana, "romaji": ro, "arti": ar, "fungsi": fn,
                    "img": "assets/ssw/building-cleaning/alat/%02d.webp" % i, "p": pg})
    return out
