#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Soal 文の組み立て (★): letak ★ divariasikan di kotak 1–4 (bukan selalu ke-3), sesuai urutan benar di pembahasan.
Idempoten & deterministik (berdasarkan id soal). Jalankan ulang setelah tools/jlpt_build.py membuat paket baru:
    python3 tools/jlpt_star_pos.py"""
import glob, json, os, re, zlib
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
L = "ABCD"
n_changed = n_total = 0
for f in sorted(glob.glob(ROOT + "/jlpt/*/*.json")):
    try: d = json.load(open(f, encoding="utf-8"))
    except Exception: continue
    if not isinstance(d, dict) or "sections" not in d: continue
    dirty = False
    for s in d["sections"]:
        for it in s["items"]:
            if it.get("tipe") != "kumitate": continue
            n_total += 1
            ex = it.get("ex") or {}; opsi = ex.get("opsi") or []
            pos = []
            for o in opsi:
                m = re.search(r"posisi ke-(\d)", o); pos.append(int(m.group(1)) if m else 0)
            if sorted(pos) != [1, 2, 3, 4]: continue
            k = zlib.crc32(it["id"].encode()) % 4 + 1
            parts = re.split(r"(★?＿＿＿)", it["q"])
            blanks = [i for i, p in enumerate(parts) if p.endswith("＿＿＿")]
            if len(blanks) != 4: continue
            cur = [j for j, i in enumerate(blanks, 1) if parts[i].startswith("★")]
            if cur == [k]: continue
            for j, i in enumerate(blanks, 1): parts[i] = ("★" if j == k else "") + "＿＿＿"
            it["q"] = "".join(parts)
            new = pos.index(k)                       # indeks opsi yang berada di posisi k
            it["ans"] = new
            txt = [re.sub(r"^[A-D]\.\s*", "", re.sub(r"\s*—.*$", "", o)) for o in opsi]
            ex["jawaban"] = f"{L[new]}. {txt[new]}"
            ex["opsi"] = [re.sub(r"\s*\(★ jawaban\)", "", o) + (" (★ jawaban)" if i == new else "") for i, o in enumerate(opsi)]
            if ex.get("alasan"):
                ex["alasan"] = re.sub(r"Kotak ★ ada di posisi ke-\d, yaitu 「[^」]*」", f"Kotak ★ ada di posisi ke-{k}, yaitu 「{txt[new]}」", ex["alasan"])
            n_changed += 1; dirty = True
    if dirty: json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=None, separators=(",", ":"))
print("kumitate:", n_total, "diubah:", n_changed)
