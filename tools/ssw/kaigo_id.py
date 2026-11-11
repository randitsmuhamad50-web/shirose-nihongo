# -*- coding: utf-8 -*-
"""Bidang SSW "kaigo" (Kaigo — Indonesia): materi 4 Bagian / 14 Bab dari modul (hal. 10–201), pola sama dengan Building Cleaning.
Sumber isi : src/kaigo/id_b1.py … id_b4b.py (diringkas dari modul; tiap subbab menyebut halaman modul).
Kosakata   : daftar kosakata resmi modul (hal. 204–241, src/kaigo/jp_vocab_raw.json) dipetakan ke bab terkait
             + "Istilah kunci" (padanan istilah Jepang baku, tambahan Shirose — ditandai kategorinya).
Soal       : ditulis dari isi modul, tiap soal menyebut halaman sumber."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__)); sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "kaigo"))
from bidang_lib import vocab_item, vocab_quiz, write_pack
import id_b1, id_b2, id_b3, id_b4a, id_b4b
H = os.path.dirname(__file__)
RAW_V = json.load(open(os.path.join(H, "src", "kaigo", "jp_vocab_raw.json"), encoding="utf-8"))
SOURCE = "Buku Teks Keterampilan Perawatan Lansia & Bahasa Jepang untuk Perawatan Lansia (versi Indonesia) — Japan Association of Certified Care Workers, Oktober 2019"
B4 = dict(id="bab4", title=("Keterampilan Dukungan Kehidupan", "{生活支援技術|せいかつしえんぎじゅつ}"),
          intro="Bagian 4 modul: praktik perawatan sehari-hari — berpindah, makan, ekskresi, merapikan diri, mandi, dan pekerjaan rumah tangga.",
          subs=id_b4a.SUBS + id_b4b.SUBS)
BABS = [id_b1.BAB, id_b2.BAB, id_b3.BAB, B4]
CAT = {"tubuh": "Tubuh", "posisi": "Posisi tubuh", "penyakit": "Penyakit & gejala", "berpindah": "Berpindah", "makan": "Makan", "ekskresi": "Ekskresi",
       "merapikan": "Merapikan diri", "mandi": "Mandi & kebersihan", "rumah": "Pekerjaan rumah", "kalimat": "Catatan & tempat kerja"}

def soal_item(t):
    q, opts, exp, hal = t
    assert len(opts) == 4 and len(set(opts)) == 4, q
    return {"q": {"id": q}, "opts": [{"id": o} for o in opts], "a": 0, "exp": {"id": "%s (Modul hal. %d.)" % (exp, hal)}, "ref": {"p": hal}}

def build():
    by_sec = {}
    for (pg, sec, kata, kana, arti) in RAW_V: by_sec.setdefault(sec, []).append((pg, kata, kana, arti))
    vocab, seen, babs, quiz = [], {}, [], {"bab": {}, "tema": []}
    def add(kata, kana, arti, cat, bid, sid, pg=None):
        if kata in seen:
            if sid not in seen[kata]["src"]: seen[kata]["src"].append(sid)
            return seen[kata]
        e = vocab_item("kg", len(vocab) + 1, kata, kana, arti, cat, bid, [sid]); e["_p"] = pg or "-"
        seen[kata] = e; vocab.append(e); return e
    nsoal = 0
    for bi, B in enumerate(BABS, 1):
        bid = B["id"]; subs_out, qs_sub, semua = [], [], []
        for si, S in enumerate(B["subs"], 1):
            sid = S["id"]
            for sec in S.get("vsec", []):
                for (pg, kata, kana, arti) in by_sec[sec]: add(kata, kana, arti, CAT[sec], bid, sid, pg)
            for (kata, kana, arti) in S.get("kata", []): add(kata, kana, arti, "Istilah kunci", bid, sid)
            p1, p2 = S["pages"]
            full = list(S["full"]) + [{"note": "Sumber: modul hal. %d–%d. Gambar, tabel, dan ilustrasi asli ada pada halaman buku di bawah." % (p1, p2)}]
            summ = dict(S["summary"])
            subs_out.append({"id": sid, "no": si, "title": {"id": S["title"][0], "jp": S["title"][1]}, "pages": [p1, p2],
                             "full": {"id": full}, "summary": {"id": summ}})
            items = [soal_item(t) for t in S["soal"]]; nsoal += len(items); semua += items
            qs_sub.append({"id": sid + "-q", "title": {"id": "Latihan: " + S["title"][0], "jp": "{練習問題|れんしゅうもんだい}"}, "items": items})
        words = [w for w in vocab if w["bab"] == bid]
        rev = lambda k, items: {"id": "%s-q%d" % (bid, k), "rev": True, "title": {"id": "Ulangan Bagian %d (%s)" % (bi, "AB"[k - 1]), "jp": "まとめテスト"}, "items": items}
        qs = [rev(1, semua[0::2]), rev(2, semua[1::2]),
              vocab_quiz("%s-q3" % bid, {"id": "Arti kosakata Bagian %d" % bi, "jp": "ことばの{意味|いみ}"}, words, "kg-" + bid, n=12, pool=words)]
        quiz["bab"][bid] = qs + qs_sub
        babs.append({"schema": 1, "bidang": "kaigo", "source": SOURCE, "markup": "Teks memakai {kanji|furigana} untuk ruby dan **tebal**.",
                     "bab": {"id": bid, "no": bi, "title": {"id": B["title"][0], "jp": B["title"][1]}, "intro": {"id": B["intro"], "jp": B["title"][1]},
                             "pages": [B["subs"][0]["pages"][0], B["subs"][-1]["pages"][1]], "subs": subs_out}})
    index = {"slug": "kaigo", "nama": "Kaigo (Indonesia)", "jp": "介護", "book": "id", "pages": {"id": 271}}
    write_pack("kaigo", index, babs, vocab, quiz)
    print("soal tulis-tangan (unik):", nsoal)

if __name__ == "__main__":
    build()
