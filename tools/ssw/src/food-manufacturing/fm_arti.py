# -*- coding: utf-8 -*-
# Arti Indonesia untuk indeks kosakata resmi modul 飲食料品製造業 (OTAFF 2024) — kunci = kata (tanpa …), ditulis untuk Shirose.
def _p(s):
    d = {}
    for part in s.replace("\n", ";").split(";"):
        part = part.strip()
        if part:
            k, v = part.split("=", 1); d[k.strip()] = v.strip()
    return d
ARTI = _p("""アニサキス=anisakis (cacing parasit ikan); アニサキス食中毒=keracunan makanan akibat anisakis; アレルギー反応=reaksi alergi; アレルギー物質=zat alergen; アレルゲン=alergen
安全カバー=penutup pengaman; 安全靴=sepatu pengaman; 安全装置=alat pengaman; 安全標識=tanda keselamatan; 安全保護具=alat pelindung diri (APD); 異物=benda asing; 飲食料品製造業=industri pengolahan makanan dan minuman
ウェルシュ菌=bakteri Clostridium perfringens (Welch); 衛生管理=pengelolaan kebersihan/higiene; Ｘ線異物検出機=detektor benda asing sinar-X; エプロン=celemek; 黄色ブドウ球菌=Staphylococcus aureus; 汚染作業区域=area kerja terkontaminasi
改善措置=tindakan perbaikan; 解凍=pencairan (thawing); 開封=pembukaan kemasan; 加温=pemanasan ringan; 化学的危害要因=bahaya kimia; 加熱殺菌=sterilisasi dengan pemanasan; 加熱調理=memasak dengan pemanasan; カバー付き長靴=sepatu bot bertutup
芽胞=spora bakteri; 芽胞菌=bakteri pembentuk spora; 感染症=penyakit menular; カンピロバクター属菌=bakteri Campylobacter; 管理基準=standar pengendalian; 管理基準からの逸脱=penyimpangan dari standar pengendalian
危害要因=faktor bahaya (hazard); 危害要因分析=analisis bahaya; 危険予知訓練=pelatihan prediksi bahaya (KYT); 寄生虫=parasit; 記録=pencatatan; 緊急停止ボタン=tombol berhenti darurat; 金属探知機=detektor logam
くさり手袋=sarung tangan rantai; 区分衛生管理=pengelolaan higiene per zona; 健康チェック=pemeriksaan kesehatan; 原材料の保管=penyimpanan bahan baku; 交差汚染=kontaminasi silang; 硬質異物=benda asing keras
５Ｓ=5S (seiri, seiton, seisou, seiketsu, shitsuke); ゴム手袋=sarung tangan karet; 細菌=bakteri; 先入れ先出し=masuk pertama keluar pertama (FIFO); 作業服=pakaian kerja; 作業手順書=prosedur/instruksi kerja tertulis (SOP)
殺菌=sterilisasi/pembunuhan kuman; サルモネラ属菌=bakteri Salmonella; 次亜塩素酸ナトリウム=natrium hipoklorit; 始業前点検=pemeriksaan sebelum mulai kerja; 指差呼称=menunjuk dan menyebut; 自然解凍=pencairan pada suhu ruang; 下処理=penanganan awal
しつけ=pembiasaan (shitsuke); 習慣付け=pembiasaan; 充填=pengisian ke wadah; 重要管理点=titik kendali kritis (CCP); 準清潔作業区域=area kerja semi-bersih; 使用期限=batas pemakaian; 消費期限=tanggal kedaluwarsa (konsumsi)
賞味期限=tanggal terbaik dikonsumsi; 食中毒菌=bakteri penyebab keracunan makanan; 食中毒予防の３原則=3 prinsip pencegahan keracunan makanan; 食品衛生=kebersihan/higiene pangan; 水冷=pendinginan dengan air; 成型=pembentukan
清潔=kebersihan (seiketsu); 清潔作業区域=area kerja bersih; 清掃=pembersihan (seisou); 整頓=penataan (seiton); 生物的危害要因=bahaya biologis; 整理=pemilahan (seiri); セレウス菌=bakteri Bacillus cereus; 洗浄=pencucian
惣菜=lauk siap santap (sōzai); 惣菜製造業=industri lauk siap santap; ゾーニング=pembagian zona; ソラニン=solanin; 耐切創手袋=sarung tangan tahan sayatan; 耐熱エプロン=celemek tahan panas; 中心温度=suhu bagian tengah
腸炎ビブリオ=Vibrio parahaemolyticus; 腸管出血性大腸菌=E. coli enterohemoragik (O157); 調理器具=alat masak; 手洗い=cuci tangan; テストピース=benda uji (test piece); 手袋=sarung tangan; 電源=sumber listrik
毒素=toksin; 特定原材料=bahan alergen wajib label; 特定原材料に準ずるもの=bahan alergen yang dianjurkan diberi label; トッピング=topping; ドリップ=cairan yang keluar dari daging/ikan beku; 二次災害=kecelakaan sekunder
熱中症=sengatan panas (heat stroke); ノロウイルス=norovirus; ハインリッヒの法則=hukum Heinrich (1:29:300); ハザード=hazard/bahaya; ハザード分析=analisis hazard; ＨＡＣＣＰによる衛生管理=pengelolaan higiene dengan HACCP
ＨＡＣＣＰの７原則=7 prinsip HACCP; ＨＡＣＣＰプラン=rencana HACCP; 非加熱調理=pengolahan tanpa pemanasan; 非常停止ボタン=tombol berhenti darurat; ヒスタミン=histamin; ヒスタミン食中毒=keracunan histamin; 微生物=mikroorganisme
微生物検査=pemeriksaan mikroorganisme; ヒヤリ・ハット=nyaris celaka (hiyari-hatto); ヒヤリ・ハット活動=kegiatan pelaporan nyaris celaka; 病原性微生物=mikroorganisme patogen; 風冷=pendinginan dengan udara; フールプルーフ=foolproof (anti salah operasi)
フェールセーフ=fail-safe (aman saat rusak); 物理的危害要因=bahaya fisik; ヘルメット=helm; 弁当=bekal/bento; 包装=pengemasan; 保管温度=suhu penyimpanan; 保護メガネ=kacamata pelindung; ボツリヌス菌=bakteri botulinum
混ぜる=mencampur; ミトン手袋=sarung tangan mitten (tahan panas); 耳栓=sumbat telinga; メクセル手袋=sarung tangan Mexel (tahan sayatan); 盛り付け=penataan/penyajian di wadah; 薬剤=bahan kimia (disinfektan dll.)
薬剤の管理=pengelolaan bahan kimia; 薬剤による殺菌=sterilisasi dengan bahan kimia; 流水=air mengalir; 流水解凍=pencairan dengan air mengalir; 冷却=pendinginan; 冷凍=pembekuan; 冷凍庫=freezer; 労働安全=keselamatan kerja; 労働災害=kecelakaan kerja""")
