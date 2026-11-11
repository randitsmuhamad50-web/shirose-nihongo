# -*- coding: utf-8 -*-
M = [
 ("新薬の開発には（　　　）な費用がかかる。","莫大",["膨大さ","豊富","盛大"],"Pengembangan obat baru memakan biaya sangat besar.","莫大な費用."),
 ("彼は与えられた仕事を（　　　）にこなした。","手際よく",["手広く","手短に","手がるに人"],"Dia mengerjakan tugas dengan cekatan.","手際よく."),
 ("政府は（　　　）な対策を講じるべきだ。","抜本的",["根本人","原則人","基盤的人"],"Pemerintah harus menempuh langkah mendasar.","抜本的."),
 ("彼の発言は事実と（　　　）している。","相違",["相談","相当","相互"],"Ucapannya berbeda dengan fakta.","相違する."),
 ("長年の（　　　）がようやく実を結んだ。","苦労",["苦情","苦戦","苦笑"],"Jerih payah bertahun-tahun akhirnya membuahkan hasil.","苦労が実を結ぶ."),
 ("両国の関係は（　　　）な状態にある。","緊迫",["緊急さ","緊密さ人","緊張者"],"Hubungan kedua negara dalam keadaan tegang.","緊迫."),
 ("彼女は周囲の反対を（　　　）して、留学を決めた。","押し切って",["押し込んで","押し出して","押し付けて"],"Dia menerobos penolakan sekitar dan memutuskan studi ke luar negeri.","反対を押し切る."),
 ("不況の影響で、会社は人員を（　　　）した。","削減",["削除","削岩","削り取"],"Akibat resesi, perusahaan mengurangi tenaga kerja.","人員削減."),
 ("彼は責任を（　　　）しようとした。","回避",["回収","回復","回転"],"Dia berusaha menghindari tanggung jawab.","責任を回避する."),
 ("事故の（　　　）を徹底的に調べる。","原因",["原則","原作","原型"],"Menyelidiki penyebab kecelakaan secara tuntas.","原因を調べる."),
 ("その発表は、業界に大きな（　　　）を与えた。","衝撃",["衝突","衝動","衝撃波"],"Pengumuman itu memberi guncangan besar bagi industri.","衝撃を与える."),
 ("彼は（　　　）の厚い人で、みんなに信頼されている。","人望",["人気","人脈","人柄"],"Dia dihormati banyak orang dan dipercaya semua.","人望が厚い."),
 ("契約書の内容に（　　　）がないか確認する。","不備",["不満","不足","不安"],"Memastikan tidak ada kekurangan pada isi kontrak.","不備."),
 ("試合は両チームとも一歩も（　　　）ず、引き分けた。","譲ら",["退か","引か","退け"],"Kedua tim tidak mau mengalah, hasilnya seri.","一歩も譲らず."),
 ("彼の主張には（　　　）が欠けている。","説得力",["迫力","能力","努力"],"Pendapatnya kurang daya bujuk.","説得力に欠ける."),
 ("この制度を（　　　）すれば、混乱は避けられない。","廃止",["廃棄","廃業","廃品"],"Jika sistem ini dihapus, kekacauan tak terelakkan.","制度を廃止する."),
 ("彼女は人前で（　　　）ほど堂々としている。","驚く",["悩む","迷う","疑う"],"Dia percaya diri hingga mengagumkan di depan orang.","(abaikan)"),
 ("長引く不況で、中小企業の経営は（　　　）している。","圧迫",["圧勝","圧力","圧縮"],"Akibat resesi panjang, manajemen UKM tertekan.","経営を圧迫する."),
 ("彼の態度に、私は（　　　）がわいた。","疑念",["疑問符","疑似","疑惑者"],"Keraguan muncul pada sikapnya.","疑念がわく."),
 ("その問題は、早急に（　　　）しなければならない。","対処",["対応者","対立","対抗"],"Masalah itu harus segera ditangani.","対処."),
 ("会社の（　　　）を守るために、情報の管理を徹底する。","信用",["信念","信仰","信号"],"Memperketat pengelolaan informasi demi menjaga reputasi perusahaan.","信用を守る."),
 ("彼は借金を（　　　）にしたまま姿を消した。","棒引き",["帳消し人","水増し","据え置き"],"(abaikan)","(abaikan)"),
 ("景気が（　　　）して、企業の業績も改善した。","回復",["回収","回避","回想"],"Ekonomi pulih, kinerja perusahaan pun membaik.","景気が回復する."),
 ("彼女は仕事と家庭を（　　　）させている。","両立",["両替","両極","両端"],"Dia menyeimbangkan pekerjaan dan rumah tangga.","両立."),
 ("その決定は（　　　）に欠けるという批判を受けた。","公平さ",["公平者","公平性","公平式"],"(abaikan)","(abaikan)"),
 ("彼の発言は物議を（　　　）ことになった。","醸す",["起こす","催す","興す"],"Ucapannya memicu kontroversi.","物議を醸す."),
 ("彼は職場で孤立し、（　　　）を失った。","居場所",["住まい","行き場者","立場者"],"Dia terisolasi di tempat kerja dan kehilangan tempatnya.","居場所を失う."),
 ("今回の失敗を（　　　）に、次は成功させたい。","教訓",["教養","教科","教材"],"Dengan pelajaran dari kegagalan ini, saya ingin sukses lain kali.","教訓."),
 ("彼は（　　　）と涙を流した。","ぽろぽろ",["ぺらぺら","ざあざあ","ぐらぐら"],"Dia meneteskan air mata.","ぽろぽろ."),
 ("予算を（　　　）して、計画を見直す。","圧縮",["圧迫","圧倒","圧勝"],"Menekan anggaran dan mengkaji ulang rencana.","予算を圧縮."),
]
_bad = ("人","者","(abaikan)")
def _ok(r):
    if r[4]=="(abaikan)" or r[3]=="(abaikan)": return False
    if any(w.endswith("人") or w.endswith("者") for w in r[2]): return False
    return len(r[2])==3 and r[1] not in r[2]
M = [r for r in M if _ok(r)]
M = [r for r in M if not any(x in r[0] for x in ("長年の（　　　）","契約書の内容","一歩も","彼の主張には","会社の（　　　）を守る","予算を（　　　）"))]
