# -*- coding: utf-8 -*-
import json, glob, importlib.util, sys, os, re
sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))
from shared import SHARED
import pathlib
HERE = pathlib.Path(__file__).resolve().parent
OUT = str(HERE.parent.parent / "data" / "mensetsu")
CATS = [("jiko","自己紹介","Perkenalan diri"),("shibou","志望動機","Alasan melamar"),("shigoto","仕事への理解","Pemahaman pekerjaan"),
        ("seikatsu","日本での生活","Kehidupan di Jepang"),("mokuhyou","将来の目標","Tujuan masa depan"),("taiou","職場での対応","Situasi di tempat kerja"),("saigo","最後の質問","Pertanyaan penutup")]
def load(p):
    s = importlib.util.spec_from_file_location("m", p); m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m
def vocab(s): return [[a.strip(), b.strip()] for a, b in (x.split("=",1) for x in s.split(";") if "=" in x)]
index = []; errs = []
for f in sorted(glob.glob(str(HERE / "f[0-9]_*.py"))):
    m = load(f); F = m.FIELD; fp = F["fp"]; items = []
    for cat,_,_ in CATS:
        src = []
        if cat in SHARED: src += [("S",t) for t in SHARED[cat]]
        if cat in m.SP: src += [("F",t) for t in m.SP[cat]]
        for n,(kind,t) in enumerate(src,1):
            ja,idn,v,intent,aja,aid,note,lv = t
            ja,aja = ja.replace("{fp}",fp), aja.replace("{fp}",fp)
            if kind=="S": aid = aid.replace("pekerjaan di bidang ini","pekerjaan di bidang ini")
            q = dict(i=f"{F['key']}-{cat}-{n:02d}", k=cat, l=lv, ja=ja, id=idn, v=vocab(v), m=intent, aj=aja, ai=aid, c=note)
            for key in ("ja","id","m","aj","ai","c"):
                if not q[key].strip(): errs.append((q["i"],key))
            if not q["v"]: errs.append((q["i"],"v"))
            if not re.search(r"[ぁ-んァ-ン一-龥]", q["ja"]): errs.append((q["i"],"ja-bukan-jepang"))
            items.append(q)
    ids = [q["i"] for q in items]
    assert len(ids)==len(set(ids)), "id dobel"
    out = dict(bidang=F["key"], nama=F["id"], jp=F["jp"], emoji=F["emoji"], kategori=[dict(k=k,jp=j,id=i) for k,j,i in CATS], soal=items)
    json.dump(out, open(f"{OUT}/{F['key']}.json","w",encoding="utf-8"), ensure_ascii=False, separators=(",",":"))
    cnt = {k: sum(1 for q in items if q["k"]==k) for k,_,_ in CATS}
    index.append(dict(bidang=F["key"], nama=F["id"], jp=F["jp"], emoji=F["emoji"], jumlah=len(items), per_kategori=cnt))
    print(F["key"], len(items), cnt)
json.dump(dict(versi=1, bidang=index), open(f"{OUT}/index.json","w",encoding="utf-8"), ensure_ascii=False, separators=(",",":"))
print("ERR", errs)
