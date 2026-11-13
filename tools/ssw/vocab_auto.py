# -*- coding: utf-8 -*-
"""Tambah SEMUA kosakata berkanji (yang diberi furigana di materi JBMA) ke bank kosakata.
Sumber: tools/ssw/src/ruby_pairs.txt (pasangan {kanji|bacaan} unik dari materi) + kamus_ruby.txt (arti, bentuk kamus).
Format kamus: N|kata|kana|arti  (N = baris ke-N di ruby_pairs; kata/kana kosong = pakai kanji/bacaan di materi)."""
import json, os, re

_H = {"あ":"a","い":"i","う":"u","え":"e","お":"o","か":"ka","き":"ki","く":"ku","け":"ke","こ":"ko","さ":"sa","し":"shi","す":"su","せ":"se","そ":"so","た":"ta","ち":"chi","つ":"tsu","て":"te","と":"to","な":"na","に":"ni","ぬ":"nu","ね":"ne","の":"no","は":"ha","ひ":"hi","ふ":"fu","へ":"he","ほ":"ho","ま":"ma","み":"mi","む":"mu","め":"me","も":"mo","や":"ya","ゆ":"yu","よ":"yo","ら":"ra","り":"ri","る":"ru","れ":"re","ろ":"ro","わ":"wa","を":"o","ん":"n","が":"ga","ぎ":"gi","ぐ":"gu","げ":"ge","ご":"go","ざ":"za","じ":"ji","ず":"zu","ぜ":"ze","ぞ":"zo","だ":"da","ぢ":"ji","づ":"zu","で":"de","ど":"do","ば":"ba","び":"bi","ぶ":"bu","べ":"be","ぼ":"bo","ぱ":"pa","ぴ":"pi","ぷ":"pu","ぺ":"pe","ぽ":"po"}
_Y = {"ゃ":"a","ゅ":"u","ょ":"o"}
def romaji(k):
    k = "".join(chr(ord(c) - 0x60) if "ァ" <= c <= "ヶ" else c for c in k)
    out, i = "", 0
    while i < len(k):
        c = k[i]
        if c == "っ":
            nx = _H.get(k[i + 1], "") if i + 1 < len(k) else ""
            out += nx[0] if nx else ""; i += 1; continue
        if c == "ー": out += out[-1:] ; i += 1; continue
        if i + 1 < len(k) and k[i + 1] in _Y and c in _H:
            b = _H[c]; y = _Y[k[i + 1]]
            out += ("j" if b == "ji" else "sh" if b == "shi" else "ch" if b == "chi" else b[:-1] + "y") + y if b in ("ji", "shi", "chi") else b[:-1] + "y" + y
            i += 2; continue
        out += _H.get(c, c); i += 1
    return out

def extend(items, root):
    d = os.path.join(root, "data", "ssw", "building-cleaning")
    src = os.path.join(root, "tools", "ssw", "src")
    pairs = [l.split("|")[:2] for l in open(os.path.join(src, "ruby_pairs.txt"), encoding="utf-8").read().split("\n") if l]
    kam = {}
    for l in open(os.path.join(src, "kamus_ruby.txt"), encoding="utf-8").read().split("\n"):
        if not l.strip(): continue
        n, kata, kana, arti = l.split("|", 3); kam[int(n)] = (kata, kana, arti)
    idx = json.load(open(os.path.join(d, "index.json"), encoding="utf-8"))
    subs = []  # (bab, subId, [strings])
    def strs(o, acc):
        if isinstance(o, str): acc.append(o)
        elif isinstance(o, dict): [strs(v, acc) for v in o.values()]
        elif isinstance(o, list): [strs(v, acc) for v in o]
    for b in idx["bab"]:
        for s in json.load(open(os.path.join(d, b["file"]), encoding="utf-8"))["bab"]["subs"]:
            acc = []; strs(s["full"].get("jp"), acc); strs(s["summary"].get("jp"), acc); strs(s["title"].get("jp"), acc)
            subs.append((b["id"], s["id"], acc))
    # pasangan ruby milik kata lama (supaya bisa diketuk di materi)
    for e in items:
        if re.search(r"[一-鿿]", e["kata"]): e.setdefault("rb", [f"{e['kata']}|{e['kana']}"])
    seen = {(e["kata"], e["kana"]): e for e in items}
    known = {e["kata"] for e in items}
    new = {}
    for n, (base, rd) in enumerate(pairs, 1):
        if base in known or n not in kam: continue
        kata, kana, arti = kam[n]; kata = kata or base; kana = kana or rd
        key = (kata, kana)
        if key in seen:
            e = seen[key]; e.setdefault("rb", [])
            if f"{base}|{rd}" not in e["rb"]: e["rb"].append(f"{base}|{rd}")
            continue
        e = {"id": "", "kata": kata, "kana": kana, "romaji": romaji(kana), "arti": arti, "cat": "Istilah materi", "bab": "", "src": [], "rb": [f"{base}|{rd}"]}
        seen[key] = e; new[key] = e
    # sumber subbab + contoh
    tag = lambda rb: "{%s}" % rb
    for e in list(new.values()) + [x for x in items if x.get("rb")]:
        for bab, sid, acc in subs:
            hit = [t for rb in e["rb"] for t in acc if tag(rb) in t]
            if hit:
                if sid not in e["src"]: e["src"].append(sid)
                if not e["bab"]: e["bab"] = bab
                if "contoh" not in e and e in new.values():
                    c = sorted((t for t in hit if 8 <= len(re.sub(r"\{([^|{}]+)\|[^{}]+\}", r"\1", t)) <= 50), key=len)
                    if c: e["contoh"] = c[0]; e["arti_contoh"] = ""
    add = [e for e in new.values() if e["src"]]
    order = {sid: i for i, (_, sid, _) in enumerate(subs)}
    add.sort(key=lambda e: (order[e["src"][0]], e["kata"]))
    for e in add:
        e["src"].sort(key=lambda s: order[s])
        e["id"] = f"bc-{len(items) + 1:03d}"; items.append(e)
    # kata lama: pastikan src memuat subbab tempat pasangan ruby-nya muncul
    for e in items:
        if e["id"] in [a["id"] for a in add]: continue
        for bab, sid, acc in subs:
            if e.get("rb") and any(tag(rb) in t for rb in e["rb"] for t in acc) and sid not in e["src"]: e["src"].append(sid)
    return len(add)
