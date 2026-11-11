#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tambah gambar ke choukai N3: full exam (jlpt/n3/full-*.json), paket choukai (choukai/jlpt-n3.json, choukai/paket/n3-p*.json). Idempoten."""
import sys, os, json, glob
sys.path.insert(0, os.path.dirname(__file__))
from attach import attach, ROOT
nf = nd = 0
for f in sorted(glob.glob(ROOT + "/jlpt/n3/full-*.json")):
    d = json.load(open(f, encoding="utf-8")); dirty = False
    for s in d["sections"]:
        for it in s["items"]:
            if it.get("cat") == "choukai" and attach(it, it["tipe_jp"], it["id"], it["ck"]["set"], it["opts"]): dirty = True; nf += 1
    if dirty: json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
for f in sorted(glob.glob(ROOT + "/choukai/paket/n3-p*.json")) + [ROOT + "/choukai/jlpt-n3.json"]:
    d = json.load(open(f, encoding="utf-8")); dirty = False
    for s in d["sections"]:
        for it in s["items"]:
            if attach(it, s["type"], it["id"], it["set"], it["opts"]): dirty = True; nd += 1
    if dirty: json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("full exam:", nf, "| divisi choukai:", nd)
