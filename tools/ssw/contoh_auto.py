# -*- coding: utf-8 -*-
"""Isi contoh kalimat otomatis untuk kata yang belum punya: ambil kalimat ASLI dari materi JBMA (JP) + terjemahan ID sejajar."""
import json, os, re
RB = re.compile(r"\{([^|{}]+)\|[^{}]+\}")
def plain(t): return RB.sub(r"\1", t)
def pairs(root):
    out = []; d = os.path.join(root, "data", "ssw", "building-cleaning")
    for b in ("bab1", "bab2", "bab3"):
        for s in json.load(open(os.path.join(d, b + ".json"), encoding="utf-8"))["bab"]["subs"]:
            I, J = s["full"]["id"], s["full"]["jp"]
            if len(I) != len(J): continue
            for a, c in zip(I, J):
                if list(a) != list(c): continue
                k = list(a)[0]; va, vc = a[k], c[k]
                if isinstance(va, str) and isinstance(vc, str): out.append((s["id"], vc, va))
                elif isinstance(va, list) and isinstance(vc, list) and len(va) == len(vc):
                    out += [(s["id"], y, x) for x, y in zip(va, vc)]
    return out
def keys(e):
    k = e["kata"].replace("〜", ""); ks = [k]
    if len(k) > 1 and re.match(r"[ぁ-ん]", k[-1]) and re.search(r"[一-鿿]", k): ks.append(k[:-1])
    if e["kana"] != k and len(e["kana"]) >= 3: ks.append(e["kana"])
    return [x for x in ks if x]
def fill(items, root):
    P = [(sid, jp, idt, plain(jp)) for sid, jp, idt in pairs(root)]
    n = 0
    for e in items:
        if e.get("contoh"): continue
        ks = keys(e); best = None
        for sid, jp, idt, pl in P:
            if not (6 <= len(pl) <= 60): continue
            if not any(k in pl for k in ks): continue
            if pl.strip("。") in ks or pl.rstrip("。").count("。") or len(pl) > 52: continue
            sc = (0 if sid in e["src"] else 1, len(pl))
            if best is None or sc < best[0]: best = (sc, jp, idt)
        if best:
            e["contoh"] = best[1]; e["arti_contoh"] = re.sub(r"\*\*", "", best[2]); n += 1
    return n

def rubify(text, items):
    """Tambah {kanji|furigana} ke kalimat tanpa ruby memakai kata di bank kosakata (terpanjang dulu)."""
    ent = []
    for e in items:
        k, r = e["kata"], e["kana"]
        if not re.search(r"[一-鿿]", k) or "〜" in k: continue
        while k and r and k[-1] == r[-1] and not ("一" <= k[-1] <= "鿿"): k, r = k[:-1], r[:-1]
        if k and r and re.search(r"[一-鿿]", k) and "{" not in k: ent.append((k, r))
    ent.sort(key=lambda x: -len(x[0]))
    out, i = "", 0
    while i < len(text):
        for k, r in ent:
            isk = lambda ch: "一" <= ch <= "鿿"
            if text.startswith(k, i) and (len(k) >= 2 or (not (i and isk(text[i-1])) and not (i+len(k) < len(text) and isk(text[i+len(k)])))):
                out += "{%s|%s}" % (k, r); i += len(k); break
        else:
            out += text[i]; i += 1
    return out
def fill_manual(items, manual):
    n = 0
    for e in items:
        if not e.get("contoh") and e["kata"] in manual:
            jp, idt = manual[e["kata"]]; e["contoh"] = rubify(jp, items); e["arti_contoh"] = idt; n += 1
    return n

def fill_rb(items, root):
    """Pastikan tiap kata berkanji punya 'rb' (pasangan {kanji|furigana} dari materi) supaya bisa dipencet di teks."""
    import collections
    P = collections.defaultdict(set); d = os.path.join(root, "data", "ssw", "building-cleaning")
    def strs(o, a):
        if isinstance(o, str): a.append(o)
        elif isinstance(o, dict): [strs(x, a) for x in o.values()]
        elif isinstance(o, list): [strs(x, a) for x in o]
    for b in ("bab1", "bab2", "bab3"):
        for s in json.load(open(os.path.join(d, b + ".json"), encoding="utf-8"))["bab"]["subs"]:
            a = []; strs(s["full"]["jp"], a); strs(s["summary"]["jp"], a)
            for t in a:
                for k, r in re.findall(r"\{([^|{}]+)\|([^{}]+)\}", t): P[k].add(r)
    n = 0
    for e in items:
        if e.get("rb") or not re.search(r"[一-鿿]", e["kata"]): continue
        k, r = e["kata"], e["kana"]
        while k and r and k[-1] == r[-1] and not ("一" <= k[-1] <= "鿿"): k, r = k[:-1], r[:-1]
        if k in P and r in P[k]: e["rb"] = [k + "|" + r]; n += 1
    return n

def rubify_all(items):
    n = 0
    for e in items:
        c = e.get("contoh")
        if not c: continue
        parts = re.split(r"(\{[^{}]*\})", c)
        new = "".join(p if p.startswith("{") else rubify(p, items) for p in parts)
        if new != c: e["contoh"] = new; n += 1
    return n
