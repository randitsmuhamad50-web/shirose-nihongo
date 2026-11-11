# -*- coding: utf-8 -*-
T2 = [
 ("この問題は、（　）常に重要だ。","非",["不","無","未"],"Masalah ini luar biasa penting.","非常."),
 ("私は彼の（　）正な行いが許せない。","不",["非","無","未"],"Saya tak bisa memaafkan perbuatannya yang tidak jujur.","不正."),
 ("（　）関心な態度が、周りを怒らせた。","無",["不","非","未"],"Sikap acuh tak acuh membuat sekitar marah.","無関心."),
 ("まだ（　）確認の情報なので、公表できない。","未",["不","非","無"],"Karena informasinya belum dikonfirmasi, belum bisa diumumkan.","未確認."),
 ("彼女の発言は（　）論理的だった。","非",["不","無","未"],"Ucapannya tidak logis.","非論理的."),
 ("この商品は（　）人気で、すぐ売り切れた。","大",["高","重","強"],"Produk ini sangat populer dan segera habis.","大人気."),
 ("電車が（　）時停止している。","臨",["仮","一","暫"],"(abaikan)","(abaikan)"),
 ("彼は（　）名人で、誰でも知っている。","有",["高","大","重"],"Dia orang terkenal yang semua orang tahu.","有名人."),
 ("この制度は、国民の（　）意を得ていない。","同",["総","合","共"],"Sistem ini belum mendapat persetujuan rakyat.","同意."),
 ("彼女は会社の（　）社長になった。","新",["再","元","旧"],"Dia menjadi direktur utama baru perusahaan.","新社長."),
 ("私の仕事は、（　）定期的な点検だ。","不",["非","無","未"],"(abaikan)","(abaikan)"),
 ("彼は（　）責任者として、会議を取り仕切った。","総",["全","諸","各"],"Dia memimpin rapat sebagai penanggung jawab umum.","総責任者."),
 ("このレストランは（　）高級な雰囲気だ。","超",["最","真","大"],"Restoran ini suasananya super mewah.","超高級."),
 ("彼は（　）期的な発明をした。","画",["回","開","改"],"Dia membuat penemuan yang bersifat revolusioner.","画期的."),
 ("私は毎日（　）規則な生活を送っている。","不",["非","無","未"],"Saya menjalani hidup tak teratur tiap hari.","不規則."),
 ("彼女は（　）意識に涙を流していた。","無",["不","非","未"],"Dia tanpa sadar meneteskan air mata.","無意識."),
 ("この結果は（　）常識的で、とても信じられない。","非",["不","無","未"],"Hasil ini tak masuk akal dan sulit dipercaya.","非常識."),
 ("彼は（　）成年なので、お酒は飲めない。","未",["不","非","無"],"Dia di bawah umur sehingga tak boleh minum alkohol.","未成年."),
 ("この計画は（　）可欠な要素を欠いている。","不",["非","無","未"],"Rencana ini kekurangan unsur yang tak boleh tiada.","不可欠."),
 ("彼の行動は（　）理だと言われている。","無",["不","非","未"],"Perbuatannya dibilang tak masuk akal/mustahil.","無理."),
]
def _ok(r): return r[4]!="(abaikan)" and len(r[2])==3 and r[1] not in r[2]
T2 = [r for r in T2 if _ok(r)]
_drop = ("この商品は（　）人気","彼は（　）名人","この制度は、国民","彼女は会社の（　）社長","このレストラン","彼は（　）期的","彼の行動は","彼は（　）責任者","この結果は","彼女の発言は")
T2 = [r for r in T2 if not any(x in r[0] for x in _drop)]
