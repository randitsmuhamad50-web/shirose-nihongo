# -*- coding: utf-8 -*-
"""Pembantu umum untuk bidang SSW selain Building Cleaning (format data SAMA dengan Building Cleaning):
   data/ssw/<slug>/index.json, babN.json, vocab.json, quiz.json."""
import json, os, random, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

_H = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽぁぃぅぇぉゃゅょっー"
_R = ("a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa o n "
      "ga gi gu ge go za ji zu ze zo da ji zu de do ba bi bu be bo pa pi pu pe po a i u e o ya yu yo * -").split()
_MAP = dict(zip(_H, _R))
def romaji(kana):
    k = "".join(chr(ord(c) - 0x60) if "ァ" <= c <= "ヶ" else c for c in kana)
    out = []; i = 0
    while i < len(k):
        c = k[i]; n = k[i + 1] if i + 1 < len(k) else ""
        if c == "っ": out.append("*"); i += 1; continue
        if n and n in "ゃゅょ" and c in _MAP:
            b = _MAP[c]; y = _MAP[n]
            out.append((b[:-1] + y[1:]) if b in ("shi", "chi", "ji") else (b[:-1] + y)); i += 2; continue
        if c == "ー": out.append(out[-1][-1] if out else ""); i += 1; continue
        out.append(_MAP.get(c, c)); i += 1
    s = ""
    for j, t in enumerate(out):
        if t == "*": nxt = out[j + 1] if j + 1 < len(out) else ""; s += nxt[:1] if nxt[:1].isalpha() else ""
        else: s += t
    return s

def vocab_item(pre, n, kata, kana, arti, cat, bab, src):
    e = {"id": "%s-%03d" % (pre, n), "kata": kata, "kana": kana, "romaji": romaji(kana), "arti": arti, "cat": cat, "bab": bab, "src": list(src)}
    if re.search(r"[一-鿿]", kata) and not re.search(r"[（(]", kata): e["rb"] = ["%s|%s" % (kata, kana)]
    return e

def vocab_quiz(qid, title, words, seed, n=8, pool=None):
    """Soal arti kosakata (kata Jepang → arti Indonesia). Pengecoh = arti kata lain dari daftar modul yang sama."""
    rnd = random.Random(seed); pool = pool or words
    pick = words[:] if len(words) <= n else rnd.sample(words, n)
    items = []
    for w in pick:
        others = [o for o in pool if o["arti"] != w["arti"]]
        opts = [w] + rnd.sample(others, min(3, len(others)))
        rnd.shuffle(opts)
        yomi = "" if w["kana"] == w["kata"] else "（%s）" % w["kana"]
        items.append({"q": {"id": "Apa arti 「%s」%s?" % (w["kata"], yomi), "jp": "「%s」%sの{意味|いみ}は？" % (w["kata"], yomi)},
                      "opts": [{"id": o["arti"], "jp": o["arti"]} for o in opts], "a": opts.index(w),
                      "exp": {"id": "%s (%s) = %s. Sumber: daftar kosakata modul hal. %s." % (w["kata"], w["kana"], w["arti"], w.get("_p", "-")),
                              "jp": "%s（%s）＝ %s" % (w["kata"], w["kana"], w["arti"])}})
    return {"id": qid, "title": title, "items": items}

def write_pack(slug, index, babs, vocab, quiz):
    out = os.path.join(ROOT, "data", "ssw", slug); os.makedirs(out, exist_ok=True)
    index = dict(index); index["bab"] = [{"id": b["bab"]["id"], "file": b["bab"]["id"] + ".json"} for b in babs]
    index.setdefault("vocab", "vocab.json"); index.setdefault("quiz", "quiz.json")
    json.dump(index, open(os.path.join(out, "index.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for b in babs: json.dump(b, open(os.path.join(out, b["bab"]["id"] + ".json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    for v in vocab: v.pop("_p", None)
    json.dump({"items": vocab}, open(os.path.join(out, "vocab.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump(quiz, open(os.path.join(out, "quiz.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    nq = sum(len(q["items"]) for qs in quiz["bab"].values() for q in qs)
    print("%s: %d bab, %d subbab, %d kosakata, %d soal" % (slug, len(babs), sum(len(b["bab"]["subs"]) for b in babs), len(vocab), nq))
