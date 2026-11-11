# -*- coding: utf-8 -*-
"""Kuis peralatan Building Cleaning: (a) Nama → pilih GAMBAR (A–D berupa foto), (b) Gambar → pilih nama.
Pengecoh diambil dari kelompok alat yang mirip (pel dengan pel, penyedot debu dengan penyedot debu, dst.)."""
import json, random, re
P = "data/ssw/building-cleaning/quiz.json"
q = json.load(open(P, encoding="utf-8")); A = json.load(open("data/ssw/building-cleaning/alat.json"))["items"]
by = {int(x["id"][-2:]): x for x in A}
# jp berfurigana + label id dari kuis lama (tiap alat benar tepat 1x)
JP = {}; ID = {}
for z in q["tema"]:
    if z["id"] in ("tema-alat1", "tema-alat2", "tema-alat3", "tema-alat4"):
        for it in z["items"]:
            n = int(it["img"]["src"][-7:-5]); o = it["opts"][it["a"]]; JP[n] = o["jp"]; ID[n] = o["id"]
        z["_n"] = [int(it["img"]["src"][-7:-5]) for it in z["items"]]
assert len(JP) == 40
G = {  # kelompok kemiripan
 "pel": [6, 7, 8, 9, 10, 5, 20], "sapu": [2, 3, 4, 13, 11, 37], "kain": [5, 16, 17, 32, 33, 26, 18], "vac": [22, 23, 24, 25, 31],
 "mesin": [27, 28, 29, 30, 31, 25], "kaca": [12, 14, 15, 35, 13], "wadah": [19, 20, 38, 39, 40, 36], "lain": [1, 21, 34, 36, 37, 35]}
def distract(n, rnd, k=3):
    near = []
    for g in G.values():
        if n in g: near += [x for x in g if x != n and x not in near]
    rnd.shuffle(near); pick = near[:k]
    rest = [x for x in range(1, 41) if x != n and x not in pick]; rnd.shuffle(rest)
    return (pick + rest)[:k]
def img(n): return "assets/ssw/building-cleaning/alat/%02d.webp" % n
def jpname(n): return JP[n]
def explain(n):
    x = by[n]; return {"id": "%s (%s) — %s" % (x["arti"].split(" (di buku")[0], x["jp"], x["fungsi"]), "jp": jpname(n)}
def name2img(n, rnd):
    ds = distract(n, rnd); ids = [n] + ds
    return {"q": {"id": "Manakah gambar “%s” (%s)?" % (by[n]["jp"], by[n]["romaji"]), "jp": "「%s」はどれですか。" % jpname(n)},
            "opts": [{"id": ID[i], "jp": jpname(i), "img": img(i)} for i in ids], "a": 0, "exp": explain(n), "ref": {"p": by[n]["p"]}}
def img2name(n, rnd):
    ds = distract(n, rnd); ids = [n] + ds
    return {"q": {"id": "Gambar alat apa ini?", "jp": "これは{何|なん}の{道具|どうぐ}ですか。"}, "opts": [{"id": ID[i], "jp": jpname(i)} for i in ids], "a": 0, "exp": explain(n), "img": {"src": img(n)}}
rnd = random.Random(20261111)
new = []; old = []
for k in range(1, 5):
    z = [t for t in q["tema"] if t["id"] == "tema-alat%d" % k][0]; ns = z.pop("_n")
    z["title"] = {"id": "Peralatan: Gambar → Pilih Nama %d" % k, "jp": "{用具|ようぐ}：{絵|え}から{名前|なまえ}を{選|えら}ぶ %d" % k}
    z["items"] = [img2name(n, rnd) for n in ns]; old.append(z)
    new.append({"id": "tema-alatg%d" % k, "title": {"id": "Peralatan: Nama → Pilih Gambar %d" % k, "jp": "{用具|ようぐ}：{名前|なまえ}から{絵|え}を{選|えら}ぶ %d" % k}, "items": [name2img(n, rnd) for n in ns]})
q["tema"] = [t for t in q["tema"] if not t["id"].startswith("tema-alat")] + new + old
json.dump(q, open(P, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("alat:", len(new) * 10, "+", len(old) * 10)
