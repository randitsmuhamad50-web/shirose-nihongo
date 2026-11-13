# -*- coding: utf-8 -*-
"""Blok materi Jepang untuk Construction dari buku Jepang resmi (furigana diambil dari teks ruby buku lewat posisi, bukan ditebak).
jp_<kat>.json: halaman → [[teks_dengan_{kanji|kana}, ukuran_font, x]]."""
import json, os, re
HERE = os.path.dirname(__file__)
_C = {}
def _load(kat):
    f = {"sipil": "ctextd", "bangunan": "bangunan", "lifeline": "lifeline"}[kat]
    if kat not in _C: _C[kat] = json.load(open(os.path.join(HERE, "jp_%s.json" % f), encoding="utf-8"))
    return _C[kat]
MARK = re.compile(r"^(【|・|□|●|■|▶|◆|[①-⑳]|\(\d+\)|[0-9０-９]+[\.\)）]?[^\d])")
def plain(s): return re.sub(r"\{([^{}|]*)\|[^{}]*\}", r"\1", s)
def blocks(kat, p1, p2):
    pages = _load(kat); lines = []
    for p in range(p1, p2 + 1):
        for t, sz, x in pages.get(str(p), []):
            if re.fullmatch(r"\s*\d{1,3}\s*", plain(t)): continue
            lines.append((t, sz, x, p))
    out = []; cur = None; lis = None
    def flush():
        nonlocal cur
        if cur: out.append({"p": cur}); cur = None
    def flush_ul():
        nonlocal lis
        if lis: out.append({"ul": lis}); lis = None
    for t, sz, x, p in lines:
        if sz >= 11.5:
            flush(); flush_ul(); out.append({"h": t}); continue
        pl = plain(t)
        if pl.startswith(("・", "□", "●", "■")) :
            flush(); lis = (lis or []); lis.append(t.lstrip("・□●■").strip() if pl[0] != "□" else t); continue
        if lis is not None and not MARK.match(pl) and pl and not pl.endswith("。"):
            lis[-1] += t; continue
        flush_ul()
        if MARK.match(pl) and not pl.startswith(("(", "（")) or cur is None: flush(); cur = t
        else: cur += t
        if cur and plain(cur).endswith("。") and len(plain(cur)) > 150: flush()
    flush(); flush_ul()
    return out
def summary(blks):
    hs = [b["h"] for b in blks if "h" in b]
    firstp = next((b["p"] for b in blks if "p" in b and len(plain(b["p"])) > 20), "")
    core = re.split(r"(?<=。)", firstp)[0] if firstp else (hs[0] if hs else "")
    caps = [re.match(r"^【([^】]+)】", b["p"]).group(1) for b in blks if "p" in b and re.match(r"^【[^】]+】", b["p"])]
    pts = (hs[1:9] if len(hs) > 1 else hs) + [("【%s】" % c) for c in caps[:6]]
    return {"core": core, "points": pts[:10] or ["教科書のページを読んで確認しましょう。"], "exam": ["各見出しの内容を自分の言葉で説明できる。"]}
