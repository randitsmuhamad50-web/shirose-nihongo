# -*- coding: utf-8 -*-
"""Bidang SSW accommodation (宿泊): 特定技能1号評価試験 宿泊分野 学習用テキスト (全旅連, 2024) — buku hanya bahasa Jepang.
Halaman buku = terjemahan resmi Indonesia (hotel_bahasa_indonesia.pdf, 52 hal., halaman sama dengan buku Jepang) → assets/ssw/accommodation/id/p01..p53 (p01 = salinan sampul). Teks JP dari buku Jepang; ringkasan ID oleh Shirose."""
import os, sys, random
sys.path.insert(0, os.path.dirname(__file__)); sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "accommodation"))
from bidang_lib import vocab_item, vocab_quiz, write_pack
from data import BABS
from quiz import Q, VOCAB

def mk_sub(s):
    sid, no, ti, tj, pg, idb, jpb, summ = s
    core, pts, avoid, exam = summ
    return {"id": sid, "no": no, "title": {"id": ti, "jp": tj}, "pages": pg,
            "full": {"id": idb, "jp": jpb},
            "summary": {"id": {"core": core, "points": pts, "avoid": avoid, "exam": exam}}}
babs = []; quiz = {"bab": {}, "tema": []}; words = []
rnd = random.Random(11)
for (bid, no, ti, tj, intro, pg, subs) in BABS:
    babs.append({"schema": 1, "bidang": "accommodation", "source": "全旅連『特定技能1号評価試験（宿泊分野）学習用テキスト』(2024)",
                 "markup": "Teks memakai {kanji|furigana} untuk ruby dan **tebal**.",
                 "bab": {"id": bid, "no": no, "title": {"id": ti, "jp": tj}, "intro": {"id": intro, "jp": tj}, "pages": pg, "subs": [mk_sub(s) for s in subs]}})
    qs = []; pool = []
    for s in subs:
        sid = s[0]; items = []
        for (q, ok, wr, exp) in Q[sid]:
            opts = [ok] + wr; rnd.shuffle(opts)
            it = {"q": {"id": q}, "opts": [{"id": o} for o in opts], "a": opts.index(ok), "exp": {"id": exp + " (Teks hal. %d–%d.)" % tuple(s[4])}, "ref": {"p": s[4][0]}}
            items.append(it)
        qs.append({"id": sid + "-q", "sub": sid, "title": {"id": "Subbab %d.%d · %s" % (no, s[1], s[2]), "jp": "%d.%d %s" % (no, s[1], s[3])}, "items": items})
        pool += items
    rnd.shuffle(pool)
    for i in range(0, min(len(pool), 16), 8):
        qs.append({"id": "%s-q%d" % (bid, i // 8 + 1), "title": {"id": "Latihan Bab %d (%s)" % (no, "AB"[i // 8]), "jp": "まとめテスト"}, "items": pool[i:i + 8]})
    quiz["bab"][bid] = qs
for i, (k, kana, arti, cat, bab, src) in enumerate(VOCAB, 1):
    w = vocab_item("ac", i, k, kana, arti, cat, bab, [src]); words.append(w)
quiz["tema"].append(vocab_quiz("tema-kosakata1", {"id": "Kosakata penginapan (A)", "jp": "{語彙|ごい}"}, words, 3, 10))
quiz["tema"].append(vocab_quiz("tema-kosakata2", {"id": "Kosakata penginapan (B)", "jp": "{語彙|ごい}"}, words, 4, 10))
index = {"slug": "accommodation", "nama": "Accommodation (Penginapan)", "jp": "宿泊", "pages": {"id": 53}, "book": "id"}
write_pack("accommodation", index, babs, words, quiz)
