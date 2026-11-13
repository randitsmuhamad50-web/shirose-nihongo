# -*- coding: utf-8 -*-
T2 = [
 ("彼女の（　　　）細な違いに気づく観察力に驚いた。","微",["小","少","細"],"Terkejut oleh daya amatnya menyadari perbedaan halus.","微細."),
 ("彼は（　　　）凡な才能の持ち主だ。","非",["不","無","未"],"Dia pemilik bakat luar biasa.","非凡."),
 ("彼の（　　　）責任な発言が批判された。","無",["不","非","未"],"Ucapannya yang tidak bertanggung jawab dikritik.","無責任."),
 ("人を物のように扱うのは（　　　）人間的だ。","非",["不","無","未"],"Memperlakukan orang seperti barang itu tidak manusiawi.","非人間的."),
 ("彼は何事も（　　　）観的に考える。","悲",["哀","苦","痛"],"Dia selalu berpikir pesimis tentang segalanya.","悲観的."),
 ("彼は業界で（　　　）流の料理人として知られている。","一",["上","高","最"],"Dia dikenal sebagai koki kelas satu di industri.","一流."),
 ("（　　　）所得者への支援が拡充された。","低",["少","小","下"],"Bantuan untuk berpenghasilan rendah diperluas.","低所得者."),
 ("この件は（　　　）公式に発表されたものではない。","非",["不","無","未"],"Hal ini bukan diumumkan secara resmi.","非公式."),
 ("この団体は（　　　）営利で運営されている。","非",["不","無","未"],"Organisasi ini dikelola nirlaba.","非営利."),
 ("（　　　）時間労働が社会問題になっている。","長",["多","大","高"],"Kerja jam panjang menjadi masalah sosial.","長時間労働."),
 ("（　　　）正規雇用の割合が増えている。","非",["不","無","未"],"Proporsi pekerja nonpermanen bertambah.","非正規."),
 ("彼は（　　　）大限の努力を払った。","最",["高","大","上"],"Dia mengerahkan usaha semaksimal mungkin.","最大限."),
 ("この方法は（　　　）効率で、時間がかかりすぎる。","非",["不","無","未"],"Cara ini tidak efisien dan memakan waktu terlalu banyak.","非効率."),
 ("新しい制度には（　　　）数の問題点がある。","無",["不","非","未"],"Sistem baru punya masalah yang tak terhitung banyaknya.","無数."),
 ("彼は（　　　）知の世界に挑戦し続けた。","未",["不","無","非"],"Dia terus menantang dunia yang belum diketahui.","未知."),
 ("事故の（　　　）害者への補償が決まった。","被",["受","負","被害"],"(abaikan)","(abaikan)"),
 ("彼女は（　　　）日本語を話せるようになった。","流",["上","高","超"],"(abaikan)","(abaikan)"),
 ("この地域は（　　　）過疎化が進んでいる。","急",["高","大","重"],"(abaikan)","(abaikan)"),
]
def _ok(r): return r[4]!="(abaikan)" and len(r[2])==3 and r[1] not in r[2]
T2=[r for r in T2 if _ok(r)]
