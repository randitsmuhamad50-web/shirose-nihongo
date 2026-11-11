# -*- coding: utf-8 -*-
M2 = [
 ("この問題は、一刻の（　　　）も許されない状況だ。","猶予",["余裕","余韻","余地"],"Masalah ini tak mengizinkan penundaan sedetik pun.","猶予も許されない."),
 ("彼の（　　　）な発言が、会議の雰囲気を悪くした。","軽率",["軽快","軽妙","軽装"],"Ucapannya yang gegabah memperburuk suasana rapat.","軽率な発言."),
 ("政府は景気の（　　　）を図るため、新しい対策を発表した。","回復",["回収","回転","回覧"],"Pemerintah umumkan kebijakan baru demi pemulihan ekonomi.","景気の回復."),
 ("彼は問題の本質を（　　　）、的確に指摘した。","見抜き",["見逃し","見落とし","見送り"],"Dia menembus esensi masalah dan menunjuknya dengan tepat.","本質を見抜く."),
 ("両国は、長年の対立に終止符を（　　　）。","打った",["置いた","付けた","結んだ"],"Kedua negara mengakhiri pertikaian panjang.","終止符を打つ."),
 ("彼の演説は、聴衆の心を強く（　　　）。","とらえた",["取り上げた","とどめた","押さえた"],"Pidatonya menangkap hati para pendengar.","心をとらえる."),
 ("新製品の開発に、会社は多額の資金を（　　　）。","投じた",["投げた","捨てた","流した"],"Perusahaan menanam dana besar untuk produk baru.","資金を投じる."),
 ("彼は組織の（　　　）に位置する人物だ。","中枢",["中毒","中継","中傷"],"Dia sosok yang berada di pusat organisasi.","組織の中枢."),
 ("事件の（　　　）が明らかになるにつれ、世間の関心は高まった。","全貌",["全員","全額","全般"],"Seiring terungkapnya keseluruhan kasus, perhatian publik naik.","全貌が明らかになる."),
 ("会社は経営の立て直しを（　　　）、新社長を迎えた。","図り",["謀り","測り","量り"],"Perusahaan menyambut direktur baru demi membenahi manajemen.","立て直しを図る."),
 ("彼の主張は、論理が（　　　）している。","破綻",["破裂","破産","破壊"],"Argumennya logikanya runtuh.","論理が破綻する."),
 ("両者の意見は真っ向から（　　　）した。","対立",["対応","対策","対抗"],"Pendapat kedua pihak bertentangan frontal.","意見が対立する."),
 ("社会の（　　　）が、少しずつ変化している。","風潮",["風力","風景","風船"],"Tren di masyarakat berubah sedikit demi sedikit.","社会の風潮."),
 ("事故の責任の（　　　）を明らかにすべきだ。","所在",["所持","所有","所属"],"Letak tanggung jawab kecelakaan harus diungkap.","責任の所在."),
 ("その決定は、市民の（　　　）を無視したものだ。","意向",["意地","意気","意欲"],"Keputusan itu mengabaikan kehendak warga.","市民の意向."),
 ("彼は長年の経験を（　　　）、新しい事業を成功させた。","生かして",["動かして","流して","回して"],"Dia memanfaatkan pengalaman panjang dan sukses dengan usaha baru.","経験を生かす."),
 ("彼は不正を（　　　）罪で逮捕された。","働いた",["作った","出した","流した"],"Dia ditangkap karena melakukan kecurangan.","不正を働く."),
 ("事故により、電車に大幅な遅れが（　　　）。","生じた",["生えた","生きた","生かした"],"Akibat kecelakaan, kereta mengalami keterlambatan besar.","遅れが生じる."),
 ("景気の先行きは、依然として（　　　）だ。","不透明",["不均衡","不規則","不自由"],"Prospek ekonomi masih tidak jelas.","先行きが不透明."),
 ("彼女は（　　　）な性格で、誰とでもすぐ打ち解ける。","気さく",["気まぐれ","気丈","気弱"],"Dia berwatak ramah dan cepat akrab dengan siapa pun.","気さくな性格."),
 ("彼は周囲の評価を（　　　）せず、黙々と研究を続けた。","意に介さ",["気に病み","念頭に置か","目に留め"],"Dia tak peduli penilaian sekitar dan terus meneliti diam-diam.","意に介さない."),
 ("長引く不況で、老舗の店も（　　　）に追い込まれた。","廃業",["開業","創業","就業"],"Akibat resesi panjang, toko lama pun terpaksa gulung tikar.","廃業に追い込まれる."),
 ("市は、災害に備えた（　　　）の整備を急いでいる。","防災",["防犯","防止","防衛"],"Kota bergegas menyiapkan prasarana kesiapsiagaan bencana.","防災."),
 ("彼の功績は、後世に（　　　）語り継がれるだろう。","永く",["遠く","厚く","広く"],"Jasanya akan dikisahkan turun-temurun.","永く語り継ぐ."),
 ("この小説は、人間の（　　　）を鋭く描いている。","内面",["内側","内容","内部"],"Novel ini menggambarkan sisi batin manusia dengan tajam.","人間の内面."),
 ("事故の原因を（　　　）するため、専門の調査団が派遣された。","究明",["探求","追及","解明"],"Tim ahli dikirim untuk mengusut penyebab kecelakaan.","原因を究明."),
]
def _ok(r): return len(r[2])==3 and r[1] not in r[2]
_drop=("この小説","事故の原因を","彼の功績","市は、災害","彼は周囲の評価")
M2=[r for r in M2 if _ok(r) and not any(x in r[0] for x in _drop)]
