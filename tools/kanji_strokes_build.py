#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Bundel data goresan KanjiVG (CC BY-SA 3.0, Ulrich Apel) untuk semua kanji yang dipakai situs → data/kanji-strokes/<kode>.json
Pakai:  git clone --depth 1 https://github.com/KanjiVG/kanjivg /tmp/kvg ;  python3 tools/kanji_strokes_build.py /tmp/kvg
Format shard (kode = codepoint>>8 hex): {"<kanji>": {"s":[d,...], "n":[[x,y],...]}}  (sama dengan writer.js parseKvgSvg)"""
import glob, json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
kvg = sys.argv[1] if len(sys.argv) > 1 else "/tmp/kvg"
isk = lambda c: 0x4E00 <= ord(c) <= 0x9FFF or 0x3400 <= ord(c) <= 0x4DBF or 0xF900 <= ord(c) <= 0xFAFF
chars = set()
for f in glob.glob(ROOT + "/data/**/*.json", recursive=True) + glob.glob(ROOT + "/jlpt/**/*.json", recursive=True) + glob.glob(ROOT + "/choukai/**/*.json", recursive=True):
    t = open(f, encoding="utf-8").read()
    t = re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), t)
    chars |= {c for c in t if isk(c)}
out = {}; miss = []
for c in sorted(chars):
    p = f"{kvg}/kanji/{ord(c):05x}.svg"
    if not os.path.exists(p): miss.append(c); continue
    body = open(p, encoding="utf-8").read(); body = body[body.index("<svg"):]
    s = re.findall(r'<path id="kvg:[0-9a-f]+-s\d+"[^>]*? d="([^"]+)"', body)
    nums = sorted(re.findall(r'transform="matrix\(1 0 0 1 ([\d.\-]+) ([\d.\-]+)\)">(\d+)</text>', body), key=lambda m: int(m[2]))
    if not s: miss.append(c); continue
    g = {"s": s}
    if len(nums) == len(s): g["n"] = [[float(m[0]), float(m[1])] for m in nums]
    out.setdefault(f"{ord(c) >> 8:03x}", {})[c] = g
d = ROOT + "/data/kanji-strokes"; os.makedirs(d, exist_ok=True)
for f in glob.glob(d + "/*.json"): os.remove(f)
for k, v in out.items(): json.dump(v, open(f"{d}/{k}.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
json.dump({"credit": "Stroke order: KanjiVG (c) Ulrich Apel, CC BY-SA 3.0 — https://kanjivg.tagaini.net", "chars": sum(len(v) for v in out.values())}, open(d + "/_info.json", "w"), ensure_ascii=False)
print("kanji:", sum(len(v) for v in out.values()), "shard:", len(out), "tanpa data:", "".join(miss))
