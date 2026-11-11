#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ganti bagian Choukai di full exam N1 08–10 dengan paket baru (p8–p10) — tanpa menyentuh soal lain.
Setelah jlpt_build menambah paket, exam e memakai paket ke-(e % jumlah paket); skrip ini hanya memperbarui bagian choukai."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import jlpt_build as B
ROOT = B.ROOT; lv = "n1"
for e in (7, 8, 9):
    f = os.path.join(ROOT, "jlpt", lv, "full-%02d.json" % (e + 1))
    d = json.load(open(f, encoding="utf-8"))
    d["sections"] = [s for s in d["sections"] if s["cat"] != "choukai"]
    m = max(s["mondai"] for s in d["sections"])
    for s in B.choukai_clone_sections(lv, e, m): d["sections"].append(s)
    B.number(d)
    json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f, d["jumlah"], len({it["ck"]["audio"] for s in d["sections"] if s["cat"] == "choukai" for it in s["items"]}))
idx = os.path.join(ROOT, "jlpt", "index.json"); I = json.load(open(idx, encoding="utf-8"))
for e in (7, 8, 9):
    d = json.load(open(os.path.join(ROOT, "jlpt", lv, "full-%02d.json" % (e + 1)), encoding="utf-8"))
    for x in I["level"][lv]["full"]:
        if x["id"] == d["id"]: x["jumlah"] = d["jumlah"]; x["mondai"] = ["%s (%d)" % (s["tipe_jp"], len(s["items"])) for s in d["sections"]]
json.dump(I, open(idx, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
