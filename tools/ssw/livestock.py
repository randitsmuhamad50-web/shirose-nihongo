# -*- coding: utf-8 -*-
"""Bidang SSW livestock (畜産業): buku resmi 農業技能測定試験 テキスト 畜産農業全般 (Dewan Pertanian Nasional / NCA, versi Indonesia, 153 hal.).
Materi lengkap = teks buku (diekstrak otomatis, tabel/gambar tetap ada di viewer halaman), soal = soal ○× RESMI buku, kosakata = glosarium resmi buku (hal. 150–152).
Teks Jepang: hanya judul (ditulis Shirose); buku Jepangnya belum ada. Halaman buku: assets/ssw/livestock/id/p01..p154 (p01 = salinan sampul; app hal. N = hal. PDF N)."""
import os, sys, re
sys.path.insert(0, os.path.dirname(__file__)); sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "livestock"))
from bidang_lib import vocab_item, vocab_quiz, write_pack
import ls_text as L

BABS = [
 ("bab1", "Karakteristik Peternakan", "{畜産|ちくさん}の{特徴|とくちょう}", "Ciri tiap jenis peternakan di Jepang: sapi perah, sapi pedaging, babi, ayam, kuda tipe ringan, dan lebah madu.", [
  ("b1s1", "Peternakan Sapi Perah", "{酪農|らくのう}", 9, 13),
  ("b1s2", "Produksi Daging Sapi (Sapi Pedaging)", "{肉用牛|にくようぎゅう}", 14, 17),
  ("b1s3", "Peternakan Babi", "{養豚|ようとん}", 18, 26),
  ("b1s4", "Peternakan Ayam", "{養鶏|ようけい}", 27, 32),
  ("b1s5", "Kuda Tipe Ringan dan Peternakan Lebah", "{軽種馬|けいしゅば}・{養蜂|ようほう}", 33, 38)]),
 ("bab2", "Pengetahuan Dasar mengenai Ternak dan Pakan Ternak", "{家畜|かちく}と{飼料|しりょう}の{基礎知識|きそちしき}", "Sifat ternak, kandang, pakan, reproduksi, kesehatan, dan penyakit tiap jenis ternak.", [
  ("b2s1", "Sapi Perah", "{乳用牛|にゅうようぎゅう}", 42, 56),
  ("b2s2", "Sapi Pedaging", "{肉用牛|にくようぎゅう}", 57, 65),
  ("b2s3", "Babi", "{豚|ぶた}", 66, 71),
  ("b2s4", "Ayam Petelur", "{採卵鶏|さいらんけい}", 72, 93),
  ("b2s5", "Ayam Pedaging", "{肉用鶏|にくようけい}", 94, 102),
  ("b2s6", "Kuda Tipe Ringan dan Peternakan Lebah", "{軽種馬|けいしゅば}・{養蜂|ようほう}", 103, 108)]),
 ("bab3", "Pekerjaan Pengelolaan Ternak Setiap Hari", "{毎日|まいにち}の{飼養管理|しようかんり}の{作業|さぎょう}", "Sanitasi dan keselamatan lahan ternak, pekerjaan harian tiap jenis ternak, dan poin pengamatan ujian praktik.", [
  ("b3s1", "Pengelolaan Sanitasi dan Keselamatan Lahan Ternak", "{衛生管理|えいせいかんり}と{安全管理|あんぜんかんり}", 113, 116),
  ("b3s2", "Pekerjaan Harian Sapi Perah", "{酪農|らくのう}の{作業|さぎょう}", 117, 124),
  ("b3s3", "Pekerjaan Harian Sapi Pedaging", "{肉用牛|にくようぎゅう}の{作業|さぎょう}", 125, 127),
  ("b3s4", "Pekerjaan Harian Babi", "{養豚|ようとん}の{作業|さぎょう}", 128, 131),
  ("b3s5", "Pekerjaan Harian Peternakan Ayam", "{養鶏|ようけい}の{作業|さぎょう}", 132, 138),
  ("b3s6", "Pekerjaan Harian Kuda dan Lebah", "{馬|うま}・{養蜂|ようほう}の{作業|さぎょう}", 139, 144),
  ("b3s7", "Poin Pengamatan Ujian Praktik", "{実技試験|じつぎしけん}の{観察|かんさつ}ポイント", 145, 147)]),
]
QSETS = {"bab1": ([39], [40]), "bab2": ([109, 110], [111]), "bab3": ([148], [149])}
QPAGE = {"bab1": 39, "bab2": 109, "bab3": 148}
HEADCLEAN = lambda h: re.sub(r"^\S+\s+", "", h) if re.match(r"^(\d{1,2}|[１-９])\s", h) else h

def sub_out(bid, no, sid, ti, tj, p1, p2):
    blk = L.blocks(p1, p2)
    hs = [HEADCLEAN(b["h"]) for b in blk if "h" in b]
    hs = [h for h in hs if len(h) >= 9 and not re.match(r"^(Bulan|Tahun|Hari|Minggu)\b", h)]
    first = next((b["p"] for b in blk if "p" in b and len(b["p"]) > 60), "")
    core = re.split(r"(?<=\.)\s", first)[0] if first else ti
    if len(core) > 260: core = core[:257].rsplit(" ", 1)[0] + "…"
    note = {"note": "Teks diambil dari buku resmi (hal. %d–%d). Tabel, gambar, dan diagram lihat di tombol Buku (halaman asli)." % (p1, p2)}
    return {"id": sid, "no": no, "title": {"id": ti, "jp": tj}, "pages": [p1, p2],
            "full": {"id": blk + [note]},
            "summary": {"id": {"core": core, "points": hs[:10] or ["Baca halaman %d–%d." % (p1, p2)], "avoid": ["Menghafal tanpa melihat gambar dan tabel di halaman buku."], "exam": ["Poin-poin pada daftar di atas, dan angka/waktu yang disebut buku (bandingkan dengan hal. %d–%d)." % (p1, p2)]}}}

babs = []; quiz = {"bab": {}, "tema": []}; vocab = []
for bi, (bid, ti, tj, intro, subs) in enumerate(BABS, 1):
    babs.append({"schema": 1, "bidang": "livestock", "source": "農業技能測定試験 テキスト 畜産農業全般 (全国農業会議所 / Dewan Pertanian Nasional), versi Indonesia, ver. 1.0",
                 "markup": "Teks memakai {kanji|furigana} untuk ruby dan **tebal**.",
                 "bab": {"id": bid, "no": bi, "title": {"id": ti, "jp": tj}, "intro": {"id": intro, "jp": tj}, "pages": [subs[0][3], subs[-1][4]],
                         "subs": [sub_out(bid, k, *s) for k, s in enumerate(subs, 1)]}})
    qa = L.parse_qa(*QSETS[bid]); qs = []
    for sec, nm, jp in (("Sapi", "Sapi", "{牛|うし}"), ("Babi", "Babi", "{豚|ぶた}"), ("Ayam", "Ayam", "{鶏|にわとり}")):
        items = []
        for s, k, stm, ans, why in qa:
            if s != sec: continue
            stm = stm.replace("SeluruhsapipedagingyangdipeliharadiJepangadalahvarietassapihitamJepang.", "Seluruh sapi pedaging yang dipelihara di Jepang adalah varietas sapi hitam Jepang.")
            benar = ans == "○"
            items.append({"q": {"id": "Benar atau salah: “%s”" % stm.rstrip(), "jp": "○か×か（%s）" % jp},
                          "opts": [{"id": "Benar (○)", "jp": "○ {正|ただ}しい"}, {"id": "Salah (×)", "jp": "× {間違|まちが}い"}], "a": 0 if benar else 1,
                          "exp": {"id": ("Benar sesuai buku." if benar else "Salah. " + why) + " (Soal resmi buku hal. %d.)" % QPAGE[bid]}, "ref": {"p": QPAGE[bid]}, "mb": True})
        if items: qs.append({"id": "%s-q-%s" % (bid, sec.lower()), "title": {"id": "Soal resmi buku (○×) — %s · Bab %d" % (nm, bi), "jp": "{公式問題|こうしきもんだい}（%s）" % jp}, "items": items})
    quiz["bab"][bid] = qs
for i, (t, d) in enumerate(L.glossary(), 1):
    d = re.sub(r"^[.…\s]+", "", d); t = re.sub(r"[.…\s]+$", "", t)
    if len(d) > 170: d = d[:167].rsplit(" ", 1)[0] + "…"
    e = vocab_item("ls", i, t, t, d, "Istilah peternakan", "bab3", ["b3s1"]); e["romaji"] = ""; vocab.append(e)
quiz["tema"].append(vocab_quiz("tema-istilah1", {"id": "Istilah peternakan (A)", "jp": "{畜産用語|ちくさんようご}"}, vocab, 5, 10))
quiz["tema"].append(vocab_quiz("tema-istilah2", {"id": "Istilah peternakan (B)", "jp": "{畜産用語|ちくさんようご}"}, vocab, 6, 10))
index = {"slug": "livestock", "nama": "Livestock (Peternakan)", "jp": "畜産業", "pages": {"id": 154}, "book": "id"}
write_pack("livestock", index, babs, vocab, quiz)
