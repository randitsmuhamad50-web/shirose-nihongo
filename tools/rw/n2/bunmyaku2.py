# -*- coding: utf-8 -*-
M2 = [
 ("景気が悪化し、多くの企業が経営の（　　　）に追い込まれた。","危機",["危険","危害","危惧"],"Ekonomi memburuk dan banyak perusahaan terdesak ke krisis manajemen.","危機に追い込まれる."),
 ("この計画には、地元の人たちから強い（　　　）の声が上がっている。","反対",["反応","反発点","反省"],"Rencana ini mendapat suara penentangan kuat dari warga setempat.","反対の声."),
 ("新しい制度の導入によって、仕事の（　　　）が大幅に上がった。","効率",["効果音","能率者","有効性者"],"Dengan sistem baru, efisiensi kerja naik besar.","効率が上がる."),
 ("彼の（　　　）な態度が、周囲の信頼を失う原因になった。","無責任",["無関心さ","無神経さ","無理解さ"],"Sikapnya yang tidak bertanggung jawab membuatnya kehilangan kepercayaan sekitar.","無責任な態度."),
 ("技術の（　　　）によって、私たちの生活は大きく変わった。","進歩",["進行","進出","進級"],"Berkat kemajuan teknologi hidup kita berubah besar.","技術の進歩."),
 ("この商品は、若者を（　　　）として開発された。","ターゲット",["テーマ","ルール","サービス"],"Produk ini dikembangkan dengan anak muda sebagai target.","ターゲット."),
 ("専門家の意見を（　　　）に、新しい方針が決まった。","参考",["参加","参照者","参観"],"Dengan merujuk pendapat pakar, kebijakan baru diputuskan.","参考にする."),
 ("災害に備えて、水や食料を（　　　）しておくことが大切だ。","備蓄",["貯金","保存","蓄積し"],"Penting menyimpan persediaan air dan makanan untuk bencana.","備蓄する."),
 ("彼女は仕事で大きな成功を（　　　）、社長に昇進した。","収め",["入れ","取り","得え"],"Dia meraih sukses besar dalam pekerjaan dan dipromosikan menjadi direktur.","成功を収める."),
 ("長年の研究が認められ、彼は学会で（　　　）を受けた。","表彰",["表現","表示","表明"],"Penelitian panjangnya diakui dan ia menerima penghargaan di konferensi.","表彰を受ける."),
 ("事故の原因を（　　　）するために、専門家チームが作られた。","究明",["追求","探求","要求"],"Tim pakar dibentuk untuk mengungkap penyebab kecelakaan.","原因を究明する."),
 ("彼の発言は、状況を（　　　）しているとは言えない。","把握",["所有","把持","保持"],"Ucapannya tak bisa dikatakan memahami situasi.","状況を把握する."),
 ("景気の回復が（　　　）しないため、失業者が増えている。","実感",["実現","実践","実際"],"Pemulihan ekonomi tidak terasa sehingga penganggur bertambah.","実感がわかない."),
 ("この地域は、観光資源に（　　　）、多くの観光客を集めている。","恵まれて",["あふれて","満ちて","富んで人"],"Daerah ini diberkahi sumber daya wisata sehingga menarik banyak wisatawan.","恵まれる."),
 ("政府は、少子化対策として新しい制度を（　　　）した。","導入",["導入して人","指導","誘導"],"Pemerintah memperkenalkan sistem baru sebagai kebijakan menghadapi penurunan kelahiran.","導入する."),
 ("彼は父親の（　　　）を継いで、小さな工場を経営している。","事業",["事故","事件","事態"],"Dia meneruskan usaha ayahnya dan mengelola pabrik kecil.","事業を継ぐ."),
 ("会議では、各部署から（　　　）な意見が出された。","活発",["活動","活用","活躍"],"Dalam rapat, banyak pendapat aktif keluar dari tiap bagian.","活発な意見."),
 ("彼は目立たないが、（　　　）に支える存在だ。","陰で",["裏で人","表で","奥で"],"Dia tak mencolok tapi sosok yang menopang dari balik layar.","陰で支える."),
 ("今回の失敗の（　　　）は、私にあると思います。","責任",["責務者","責め","責任者"],"Saya kira tanggung jawab atas kegagalan kali ini ada pada saya.","責任は私にある."),
 ("この薬は、（　　　）の少ない薬として知られている。","副作用",["副業","副題","副収入"],"Obat ini dikenal sebagai obat dengan sedikit efek samping.","副作用が少ない."),
]
def _ok(r):
    if any(w.endswith(("者","人","し")) for w in r[2]): return False
    return len(r[2])==3 and r[1] not in r[2]
M2 = [r for r in M2 if _ok(r)]
