# -*- coding: utf-8 -*-
"""QC bank soal: python3 tools/jlpt_validate.py"""
import json, os, glob, re, sys, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = json.load(open(os.path.join(ROOT, "jlpt/index.json"), encoding="utf-8"))
err = collections.Counter(); ids = set(); total = 0; samples = collections.defaultdict(list)
stems = collections.Counter()
for lv, cats in idx["level"].items():
    for cat, lst in cats.items():
        assert (len(lst) == 10 if cat == "full" else len(lst) == 20), (lv, cat, len(lst))
        for m in lst:
            p = json.load(open(os.path.join(ROOT, "jlpt", m["file"]), encoding="utf-8"))
            n = 0
            for s in p["sections"]:
                for q in s["items"]:
                    n += 1; total += 1
                    def bad(k):
                        err[k] += 1
                        if len(samples[k]) < 3: samples[k].append(q["id"])
                    if q["id"] in ids: bad("id_ganda")
                    ids.add(q["id"])
                    o = q["opts"]
                    if len(o) not in (3, 4): bad("jumlah_opsi")
                    if any(not str(x).strip() for x in o): bad("opsi_kosong")
                    if len(set(o)) != len(o): bad("opsi_duplikat")
                    if not (0 <= q["ans"] < len(o)): bad("kunci_invalid")
                    ex = q.get("ex") or {}
                    if not ex.get("jawaban") or not ex.get("opsi") or not ex.get("alasan"): bad("pembahasan_kurang")
                    if len(ex.get("opsi", [])) != len(o): bad("penjelasan_opsi_tidak_lengkap")
                    if "�" in json.dumps(q, ensure_ascii=False): bad("encoding")
                    if not q["q"].strip(): bad("soal_kosong")
                    if q["cat"] == "choukai" and not (q.get("ck", {}).get("script") or q.get("ck", {}).get("dialog")): bad("choukai_tanpa_naskah")
                    if q["cat"] == "dokkai" and q.get("pid") not in p["passages"]: bad("dokkai_tanpa_bacaan")
                    if cat != "full" or q["cat"] not in ("dokkai", "choukai"):
                        stems[(lv, q["q"])] += 1
            if n != m["jumlah"]: err["jumlah_index_beda"] += 1
            if cat != "full" and n > 20: err["lebih_20"] += 1
dup = sum(1 for k, v in stems.items() if v > 1)
print("Total soal:", total, "| ID unik:", len(ids), "| soal kembar (teks sama, level sama):", dup)
print("Masalah:", dict(err) or "TIDAK ADA")
for k, v in samples.items(): print("  contoh", k, v)
sys.exit(1 if err else 0)
