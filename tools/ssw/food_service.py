# -*- coding: utf-8 -*-
"""Bidang SSW "food-service" (Jasa Boga / Restoran) — 3 bab dari 3 modul Asosiasi Jasa Boga Jepang (versi Indonesia):
 Bab 1 Pengawasan Kebersihan · Bab 2 Persiapan Makanan dan Minuman · Bab 3 Layanan Pelanggan.
Halaman buku = ketiga PDF digabung berurutan (hal. 1–41, 42–81, 82–127), gambar di assets/ssw/food-service/id/.
Sumber isi: src/food-service/fs_b1..b3.py. Istilah Jepang dalam kosakata = padanan baku (tambahan Shirose, kategori = nama bab)."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__)); sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "food-service"))
from bidang_lib import vocab_item, vocab_quiz, write_pack
import fs_b1, fs_b2, fs_b3
BABS = [fs_b1.BAB, fs_b2.BAB, fs_b3.BAB]
SOURCE = "Materi Pembelajaran untuk Penilaian Keterampilan dalam Industri Jasa Boga (Pengawasan Kebersihan / Persiapan Makanan dan Minuman / Layanan Pelanggan), versi 1 revisi 15 April 2021, terjemahan sementara Indonesia — Asosiasi Jasa Boga Jepang"

def soal_item(t):
    q, opts, exp, hal = t
    assert len(opts) == 4 and len(set(opts)) == 4, q
    return {"q": {"id": q}, "opts": [{"id": o} for o in opts], "a": 0, "exp": {"id": "%s (Modul hal. %d.)" % (exp, hal)}, "ref": {"p": hal}}

def build():
    vocab, seen, babs, quiz = [], {}, [], {"bab": {}, "tema": []}
    def add(kata, kana, arti, cat, bid, sid):
        if kata in seen:
            if sid not in seen[kata]["src"]: seen[kata]["src"].append(sid)
            return
        e = vocab_item("fs", len(vocab) + 1, kata, kana, arti, cat, bid, [sid]); e["_p"] = "-"
        seen[kata] = e; vocab.append(e)
    nsoal = 0
    for bi, B in enumerate(BABS, 1):
        bid = B["id"]; subs_out, qs_sub, semua = [], [], []
        for si, S in enumerate(B["subs"], 1):
            sid = S["id"]
            for (kata, kana, arti) in S.get("kata", []): add(kata, kana, arti, B["title"][0], bid, sid)
            p1, p2 = S["pages"]
            full = list(S["full"]) + [{"note": "Sumber: modul hal. %d–%d (buku gabungan). Gambar, tabel, dan ilustrasi asli ada pada halaman buku di bawah." % (p1, p2)}]
            subs_out.append({"id": sid, "no": si, "title": {"id": S["title"][0], "jp": S["title"][1]}, "pages": [p1, p2],
                             "full": {"id": full}, "summary": {"id": dict(S["summary"])}})
            items = [soal_item(t) for t in S["soal"]]; nsoal += len(items); semua += items
            qs_sub.append({"id": sid + "-q", "title": {"id": "Latihan: " + S["title"][0], "jp": "{練習問題|れんしゅうもんだい}"}, "items": items})
        words = [w for w in vocab if w["bab"] == bid]
        rev = lambda k, it: {"id": "%s-q%d" % (bid, k), "rev": True, "title": {"id": "Ulangan Bab %d (%s)" % (bi, "AB"[k - 1]), "jp": "まとめテスト"}, "items": it}
        qs = [rev(1, semua[0::2]), rev(2, semua[1::2]),
              vocab_quiz("%s-q3" % bid, {"id": "Arti kosakata Bab %d" % bi, "jp": "ことばの{意味|いみ}"}, words, "fs-" + bid, n=12, pool=words)]
        quiz["bab"][bid] = qs + qs_sub
        babs.append({"schema": 1, "bidang": "food-service", "source": SOURCE, "markup": "Teks memakai {kanji|furigana} untuk ruby dan **tebal**.",
                     "bab": {"id": bid, "no": bi, "title": {"id": B["title"][0], "jp": B["title"][1]}, "intro": {"id": B["intro"], "jp": B["title"][1]},
                             "pages": [B["subs"][0]["pages"][0], B["subs"][-1]["pages"][1]], "subs": subs_out}})
    index = {"slug": "food-service", "nama": "Food Service (Jasa Boga)", "jp": "外食業", "book": "id", "pages": {"id": 128}}
    write_pack("food-service", index, babs, vocab, quiz)
    print("soal tulis-tangan (unik):", nsoal)

if __name__ == "__main__":
    build()
