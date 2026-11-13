# -*- coding: utf-8 -*-
import json,sys,os
sys.path.insert(0,os.path.join(os.path.dirname(__file__),'src','bc_quiz'))
from jpfill import F
P='data/ssw/building-cleaning/quiz.json'
def sp(s):
    if '||' in s: a,b=s.split('||',1); return a,b
    return s,F[s]
H={
('tema-rute',0):["Masuk → rapat/persiapan → pembersihan → laporan & beres-beres → selesai||{出勤|しゅっきん}→ミーティング→{清掃|せいそう}→{報告|ほうこく}→{退勤|たいきん}","Masuk → pembersihan → rapat/persiapan → laporan → selesai||{出勤|しゅっきん}→{清掃|せいそう}→ミーティング→{報告|ほうこく}→{退勤|たいきん}","Rapat/persiapan → masuk → pembersihan → selesai → laporan||ミーティング→{出勤|しゅっきん}→{清掃|せいそう}→{退勤|たいきん}→{報告|ほうこく}","Masuk → rapat → laporan → pembersihan → selesai||{出勤|しゅっきん}→ミーティング→{報告|ほうこく}→{清掃|せいそう}→{退勤|たいきん}"],
('tema-rute',1):["Dari atas ke bawah||{上|うえ}から{下|した}へ","Dari bawah ke atas||{下|した}から{上|うえ}へ","Dari kiri ke kanan tanpa memandang tinggi||{左|ひだり}から{右|みぎ}へ","Dari tengah ke atas||{中央|ちゅうおう}から{上|うえ}へ"],
('tema-rute',2):["Dari tempat luas ke tempat sempit||{広|ひろ}い{所|ところ}から{狭|せま}い{所|ところ}へ","Dari ujung ke depan||{奥|おく}から{手前|てまえ}へ","Dari tempat sempit ke tempat luas||{狭|せま}い{所|ところ}から{広|ひろ}い{所|ところ}へ","Dari sedikit kotor ke banyak kotor||{汚|よご}れの{少|すく}ない{所|ところ}から{多|おお}い{所|ところ}へ"],
('tema-rute',3):["Supaya kotoran tidak menyebar ke tempat bersih||{汚|よご}れが{綺麗|きれい}な{所|ところ}に{広|ひろ}がらないように","Supaya alat pembersih tidak cepat habis||{洗剤|せんざい}を{節約|せつやく}するため","Supaya tempat kotor ditangani paling awal oleh tenaga penuh||{一番|いちばん}{汚|よご}れた{所|ところ}を{先|さき}に{力|ちから}いっぱい{掃除|そうじ}するため","Supaya tamu tidak melihat pekerja||お{客様|きゃくさま}に{見|み}られないため"],
('tema-rute',9):["Tempat penggunanya (siapa/kapan dipakai)||{使|つか}う{人|ひと}の{場所|ばしょ}（{誰|だれ}が・いつ{使|つか}うか）","Jenis karbol yang tersisa||{残|のこ}っている{洗剤|せんざい}の{種類|しゅるい}","Jumlah lampu di ruangan||{部屋|へや}の{電気|でんき}の{数|かず}","Jam kerja rekan lain||{同僚|どうりょう}の{勤務|きんむ}{時間|じかん}"],
('tema-lantai',0):["5 jenis||5{種類|しゅるい}","4 jenis||4{種類|しゅるい}","6 jenis||6{種類|しゅるい}","3 jenis||3{種類|しゅるい}"],
('tema-lantai',1):["Keras (marmer)||{石|いし}・{硬|かた}い{床|ゆか}","Vinil||ビニール{床|ゆか}","Kayu||{木|き}の{床|ゆか}","Lainnya||その{他|ほか}"],
('tema-lantai',2):["Kayu||{木|き}の{床|ゆか}","Vinil||ビニール{床|ゆか}","Keras (marmer)||{石|いし}・{硬|かた}い{床|ゆか}","Lainnya||その{他|ほか}"],
('tema-lantai',3):["Vinil||ビニール{床|ゆか}","Kayu||{木|き}の{床|ゆか}","Keras (marmer)||{石|いし}・{硬|かた}い{床|ゆか}","Lainnya||その{他|ほか}"],
('tema-lantai',4):["Lainnya||その{他|ほか}","Vinil||ビニール{床|ゆか}","Kayu||{木|き}の{床|ゆか}","Karpet||カーペット"],
('tema-lantai',9):["Wax resin, wax cair, wax emulsi||{樹脂|じゅし}ワックス・{液体|えきたい}ワックス・エマルジョンワックス","Wax resin, wax padat, wax emulsi||{樹脂|じゅし}ワックス・{固形|こけい}ワックス・エマルジョンワックス","Wax akrilik, wax kayu, wax cair||アクリルワックス・{木|き}ワックス・{液体|えきたい}ワックス","Wax cair, wax gel, wax uretan||{液体|えきたい}ワックス・ジェルワックス・ウレタンワックス"],
('tema-karpet',0):["Upright||アップライト","Pod (kering)||ポッド{型|がた}（{乾式|かんしき}）","Wet (basah)||ウェット{型|がた}（{湿式|しっしき}）","Handy||ハンディ"],
('tema-karpet',1):["Sikat memukul pile sehingga kotoran terangkat, lalu disedot||ブラシがパイルをたたいて{汚|よご}れを{浮|う}かせ{吸|す}う","Kipas menyedot kotoran tanpa sikat||ブラシなしでファンが{吸|す}う","Sikat menyapu permukaan lalu dibuang ke pengki||ブラシで{掃|は}いてちりとりに{入|い}れる","Air panas menyemprot lalu disedot||{温水|おんすい}を{噴射|ふんしゃ}して{吸|す}う"],
('tema-karpet',2):["Jalur lalu lalang||{通|とお}り{道|みち}","Di bawah furnitur||{家具|かぐ}の{下|した}","Sudut ruangan||{隅|すみ}","Tepi dinding||{壁際|かべぎわ}"],
('tema-karpet',3):["Karpet vinil dan loop pile (tidak berbulu)||ビニールカーペット・ループパイル","Flooring dan cork||フローリング・コルク","Lantai cat dan tatami||{塗|ぬ}り{床|ゆか}・{畳|たたみ}","Tipe plastik dan linoleum||プラスチック・リノリウム"],
('tema-karpet',4):["Noda dan debu di celah karpet||シミ・{目|め}の{間|あいだ}のほこり","Kerak air dan bekas heal sepatu||{水垢|みずあか}・ヒールマーク","Isi staples dan clip||ホッチキスの{芯|しん}・クリップ","Bekas matahari dan jejak perabotan||{日焼|ひや}け・{家具|かぐ}の{跡|あと}"],
('tema-ph',0):["Asam||{酸性|さんせい}","Netral||{中性|ちゅうせい}","Alkali||アルカリ{性|せい}","Alkali rendah||{弱|じゃく}アルカリ{性|せい}"],
('tema-ph',1):["pH 0 (asam)||pH0（{酸性|さんせい}）","pH 3 (keasaman rendah)||pH3（{弱酸性|じゃくさんせい}）","pH 6 (menengah)||pH6（{中性|ちゅうせい}）","pH 8 (alkali rendah)||pH8（{弱|じゃく}アルカリ）"],
('tema-ph',2):["pH 6 (menengah)||pH6（{中性|ちゅうせい}）","pH 3 (keasaman rendah)||pH3（{弱酸性|じゃくさんせい}）","pH 8 (alkali rendah)||pH8（{弱|じゃく}アルカリ）","pH 11–14 (alkali)||pH11〜14（アルカリ）"],
('tema-ph',3):["pH 11–14 (alkali)||pH11〜14（アルカリ）","pH 8 (alkali rendah)||pH8（{弱|じゃく}アルカリ）","pH 6 (menengah)||pH6（{中性|ちゅうせい}）","pH 0 (asam)||pH0（{酸性|さんせい}）"],
('tema-ph',4):["pH 3||pH3","pH 0||pH0","pH 6||pH6","pH 8||pH8"],
('tema-ph',5):["pH 8 (alkali rendah)||pH8（{弱|じゃく}アルカリ）","pH 6 (menengah)||pH6（{中性|ちゅうせい}）","pH 11 (alkali)||pH11（アルカリ）","pH 3 (keasaman rendah)||pH3（{弱酸性|じゃくさんせい}）"],
('tema-ph',9):["Segera ke rumah sakit||すぐ{病院|びょういん}へ{行|い}く","Berkumur dan menunggu apakah gejala muncul||うがいして{様子|ようす}を{見|み}る","Minum susu lalu lanjut bekerja||{牛乳|ぎゅうにゅう}を{飲|の}んで{仕事|しごと}を{続|つづ}ける","Menetralkan dengan karbol asam||{酸性|さんせい}{洗剤|せんざい}で{中和|ちゅうわ}する"],
}
d=json.load(open(P))
for q in d['tema']:
    for i,it in enumerate(q['items']):
        k=(q['id'],i)
        if k in H:
            o=[sp(x) for x in H[k]]; assert len({x[0] for x in o})==4,k
            it['opts']=[{'id':a,'jp':b} for a,b in o]; it['a']=0
json.dump(d,open(P,'w'),ensure_ascii=False,indent=1)
print('ok')
