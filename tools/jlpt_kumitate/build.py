#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tulis ulang soal ★ (文の組み立て) di full exam N5/N4 dengan kalimat unik buatan Shirose. Idempoten (urutan opsi deterministik)."""
import json, glob, os, random, sys
sys.path.insert(0, os.path.dirname(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STAR = [1, 2, 3, 0, 2, 1, 3, 2]
def make(old, k, row, POLA):
    pre, order, post, _st, terj, pola = row; star = (_st if k >= 50 else STAR[k % 8])
    rnd = random.Random(1000 + k); perm = list(range(4)); rnd.shuffle(perm)
    opts = [order[i] for i in perm]; ans = opts.index(order[star])
    L = "ABCD"; pos_of = {p: i for i, p in enumerate(order)}
    ord_letters = [L[opts.index(p)] for p in order]
    sentence = pre + "".join(order) + post
    blanks = " ".join(("★＿＿＿" if i == star else "＿＿＿") for i in range(4))
    q = ((pre + " ") if pre else "") + blanks + ((" " + post) if post else "")
    arti, rumus, cj, ci = POLA[pola]
    ex = {"jawaban": "%s. %s" % (L[ans], order[star]), "terjemahan": terj,
          "alasan": "Urutan yang benar: %s, sehingga kalimatnya 「%s」. Kotak ★ ada di posisi ke-%d, yaitu 「%s」. Kuncinya adalah pola 「%s」." % (" → ".join(ord_letters), sentence, star + 1, order[star], pola),
          "opsi": ["%s. %s — posisi ke-%d%s" % (L[i], o, pos_of[o] + 1, " (★ jawaban)" if i == ans else "") for i, o in enumerate(opts)],
          "grammar": {"pola": pola, "arti": arti, "rumus": rumus},
          "struktur": " ＋ ".join(([pre] if pre else []) + order + ([post] if post else [])),
          "contoh": ["%s — %s" % (cj, ci)],
          "poin": "Strategi ★: (1) cari pasangan yang pasti menempel (kata benda + partikel, bentuk て + kata kerja bantu, pola tata bahasa); (2) susun dari kata yang paling dekat dengan bagian setelah kotak; (3) baru tentukan isi kotak ★."}
    new = dict(old); new.update({"q": q, "opts": opts, "ans": ans, "ex": ex}); new.pop("ref", None)
    return new
for lv in ("n5", "n4"):
    mod = __import__(lv); k = 0
    for f in sorted(glob.glob(ROOT + "/jlpt/%s/full-*.json" % lv)):
        d = json.load(open(f, encoding="utf-8"))
        for s in d["sections"]:
            for i, it in enumerate(s["items"]):
                if it.get("tipe") == "kumitate":
                    s["items"][i] = make(it, k, mod.S[k], mod.POLA); k += 1
        json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(lv, "diganti:", k)
