# -*- coding: utf-8 -*-
"""Bidang SSW "food-manufacturing" (飲食料品製造業) — 3 bab dari modul resmi 『飲食料品製造業技能測定試験 学習用テキスト』第4版 (2024-02, OTAFF, bahasa Jepang).
Buku = 82 halaman PDF asli (halaman cetak = PDF − 5), gambar di assets/ssw/food-manufacturing/jp/. Ringkasan/soal Indonesia ditulis Shirose (src/food-manufacturing/fm_data.py);
kosakata = indeks resmi di akhir modul (141 kata, hal. 71–80) dengan arti Indonesia (fm_arti.py)."""
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__)); sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "food-manufacturing"))
from bidang_lib import vocab_item, vocab_quiz, write_pack
import fm_data
from fm_arti import ARTI
IDX = json.load(open(os.path.join(os.path.dirname(__file__), "src", "food-manufacturing", "jp_index.json"), encoding="utf-8"))
BABS = [fm_data.B1, fm_data.B2, fm_data.B3]
SOURCE = "飲食料品製造業技能測定試験 学習用テキスト 第4版 (2024年2月) — 一般社団法人 外国人食品産業技能評価機構 (OTAFF), bahasa Jepang; indeks kosakata hal. 66–75 (cetak)"
OFF = 5

def soal_item(t):
    q, opts, exp, hal = t
    assert len(opts) == 4 and len(set(opts)) == 4, q
    return {"q": {"id": q}, "opts": [{"id": o} for o in opts], "a": 0, "exp": {"id": "%s (Modul hal. %d.)" % (exp, hal)}, "ref": {"p": hal}}

def sub_for(pdf_page):
    subs = [(b["id"], s) for b in BABS for s in b["subs"]]
    for bid, s in subs:
        if s["pages"][0] <= pdf_page <= s["pages"][1]: return bid, s["id"]
    best = min(subs, key=lambda x: min(abs(pdf_page - x[1]["pages"][0]), abs(pdf_page - x[1]["pages"][1])))
    return best[0], best[1]["id"]

def build():
    vocab, seen = [], {}
    for rd, w, pgs in IDX:
        word = w.rstrip("…")
        bid, sid = sub_for(pgs[0] + OFF)
        # kata yang punya halaman di beberapa bab: bab = bab halaman pertama; src = semua subbab pada bab itu
        if word in seen: continue
        e = vocab_item("fm", len(vocab) + 1, word, rd, ARTI[word], dict((b["id"], b["title"][0]) for b in BABS)[bid], bid, [])
        srcs = []
        for p in pgs:
            b2, s2 = sub_for(p + OFF)
            if b2 == bid and s2 not in srcs: srcs.append(s2)
        e["src"] = srcs or [sid]; e["_p"] = ",".join(map(str, pgs))
        seen[word] = e; vocab.append(e)
    babs, quiz, nsoal = [], {"bab": {}, "tema": []}, 0
    for bi, B in enumerate(BABS, 1):
        bid = B["id"]; subs_out, qs_sub, semua = [], [], []
        words = [w for w in vocab if w["bab"] == bid]
        for si, S in enumerate(B["subs"], 1):
            p1, p2 = S["pages"]
            full = list(S["full"])
            subs_out.append({"id": S["id"], "no": si, "title": {"id": S["title"][0], "jp": S["title"][1]}, "pages": [p1, p2],
                             "full": {"id": full}, "summary": {"id": dict(S["summary"])}})
            items = [soal_item(t) for t in S["soal"]]; nsoal += len(items); semua += items
            qs_sub.append({"id": S["id"] + "-q", "title": {"id": "Latihan: " + S["title"][0], "jp": "{練習問題|れんしゅうもんだい}"}, "items": items})
        rev = lambda k, it: {"id": "%s-q%d" % (bid, k), "rev": True, "title": {"id": "Ulangan Bab %d (%s)" % (bi, "AB"[k - 1]), "jp": "まとめテスト"}, "items": it}
        pool = vocab
        q3 = vocab_quiz("%s-q3" % bid, {"id": "Arti kosakata Bab %d" % bi, "jp": "ことばの{意味|いみ}"}, words, "fm-" + bid, n=12, pool=pool) if len(words) >= 4 else {"id": "%s-q3" % bid, "title": {"id": "Arti kosakata Bab %d" % bi, "jp": "ことばの{意味|いみ}"}, "items": vocab_quiz("x", {"id": "x"}, vocab, "fm-x", n=12, pool=vocab)["items"]}
        quiz["bab"][bid] = [rev(1, semua[0::2]), rev(2, semua[1::2]), q3] + qs_sub
        babs.append({"schema": 1, "bidang": "food-manufacturing", "source": SOURCE, "markup": "Teks memakai {kanji|furigana} untuk ruby dan **tebal**.",
                     "bab": {"id": bid, "no": bi, "title": {"id": B["title"][0], "jp": B["title"][1]}, "intro": {"id": B["intro"], "jp": B["title"][1]},
                             "pages": [B["subs"][0]["pages"][0], B["subs"][-1]["pages"][1]], "subs": subs_out}})
    index = {"slug": "food-manufacturing", "nama": "Food Manufacturing", "jp": "飲食料品製造業", "book": "jp", "pages": {"jp": 82}}
    write_pack("food-manufacturing", index, babs, vocab, quiz)
    print("soal tulis-tangan:", nsoal, "| kosakata per bab:", {b["id"]: sum(1 for w in vocab if w["bab"] == b["id"]) for b in BABS})

if __name__ == "__main__":
    build()
