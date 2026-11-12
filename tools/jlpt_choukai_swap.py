#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Pasang bagian Choukai ke full exam tanpa menyentuh soal lain.
Pemakaian: python3 tools/jlpt_choukai_swap.py <lv> <dari> <sampai>   (nomor file full, mis. n5 11 20)
Exam NN memakai paket ke-((NN-1) % jumlah paket): p11..p20 untuk full-11..20 bila ke-20 paket ada.
Untuk file yang sudah diregister di index.json, jumlah/mondai ikut diperbarui."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import jlpt_build as B
ROOT = B.ROOT; lv = sys.argv[1]; a, b = int(sys.argv[2]), int(sys.argv[3])
idx = os.path.join(ROOT, "jlpt", "index.json"); I = json.load(open(idx, encoding="utf-8")); chg = False
for n in range(a, b + 1):
    f = os.path.join(ROOT, "jlpt", lv, "full-%02d.json" % n)
    d = json.load(open(f, encoding="utf-8"))
    d["sections"] = [s for s in d["sections"] if s["cat"] != "choukai"]
    m = max(s["mondai"] for s in d["sections"])
    for s in B.choukai_clone_sections(lv, n - 1, m): d["sections"].append(s)
    B.number(d)
    json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f, d["jumlah"], len({it["ck"]["audio"] for s in d["sections"] if s["cat"] == "choukai" for it in s["items"]}))
    for x in I["level"][lv]["full"]:
        if x["id"] == d["id"]:
            x["jumlah"] = d["jumlah"]; x["mondai"] = ["%s (%d)" % (s["tipe_jp"], len(s["items"])) for s in d["sections"]]; chg = True
if chg: json.dump(I, open(idx, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
