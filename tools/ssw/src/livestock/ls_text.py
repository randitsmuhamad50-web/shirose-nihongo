# -*- coding: utf-8 -*-
"""Ekstraksi teks buku resmi 農業技能測定試験 テキスト 畜産農業全般 (NCA, versi Indonesia) → blok materi + soal ○× resmi + glosarium."""
import os, re
HERE = os.path.dirname(__file__)
PAGES = open(os.path.join(HERE, "perternakan.txt"), encoding="utf-8").read().replace("\x07", "").split("\f")
def page(n): return PAGES[n - 1]
HEAD = re.compile(r"^(\d{1,2}|[１-９])\s+(?=[A-Z])[^.。:：]{2,70}$|^[（(][1-9１-９][）)]\s*[A-Z][^.。]{2,60}$|^[①-⑩]\s*[A-Z][^.。]{2,60}$")
def clean_lines(p1, p2):
    out = []
    for n in range(p1, p2 + 1):
        for l in page(n).split("\n"):
            l = l.replace("　", " ").strip(); l = re.sub(r"\s{2,}", " ", l)
            if not l or re.fullmatch(r"[\d\s]{1,4}", l) or l in ("（ ）", "( )", "Pendahulua"): continue
            if re.fullmatch(r"[（(]\s*[）)]", l): continue
            out.append(l)
    return out
def blocks(p1, p2):
    out = []; cur = None; lis = None
    def fp():
        nonlocal cur
        if cur and len(cur) > 25: out.append({"p": cur.strip()})
        cur = None
    def fl():
        nonlocal lis
        if lis: out.append({"ul": lis}); lis = None
    for l in clean_lines(p1, p2):
        if HEAD.match(l): fp(); fl(); out.append({"h": l}); continue
        if l.startswith(("・", "◦", "•")):
            fp(); lis = lis or []; lis.append(l.lstrip("・◦• ").strip()); continue
        if lis is not None and not re.match(r"^[（(①-⑩]", l) and len(lis[-1]) < 400 and not lis[-1].endswith((".", "。")):
            lis[-1] += " " + l; continue
        fl()
        if len(l) < 14 and not l.endswith("."):  # label gambar/tabel
            continue
        if cur is None or re.match(r"^[（(①-⑩]", l): fp(); cur = l
        else: cur += " " + l
        if cur.endswith(".") and len(cur) > 200: fp()
    fp(); fl()
    return out
# ---- soal ○× resmi
NUM = "１２３４５６７８９"
def parse_qa(qpages, apage_range):
    q = "\n".join(page(n) for n in qpages); a = "\n".join(page(n) for n in apage_range)
    def sections(txt):
        res = {}; sec = None
        for part in re.split(r"[＜<]\s*(Sapi|Babi|Ayam)\s*[＞>]", txt)[1:]:
            if part in ("Sapi", "Babi", "Ayam"): sec = part; res[sec] = ""
            elif sec: res[sec] += part + "\n"
        return res
    qs, as_ = sections(q), sections(a); items = []
    for sec in qs:
        stm = {}
        for m in re.finditer(r"([１-９])[．.]\s*(.*?)(?=\n\s*[１-９][．.]|\Z)", qs[sec], re.S):
            t = re.sub(r"[（(]\s*[）)]", "", m.group(2)); t = re.sub(r"\s+", " ", t).strip()
            t = re.sub(r"\d{2,3}$", "", t).strip()
            stm[NUM.index(m.group(1)) + 1] = t
        ans = {}
        for m in re.finditer(r"([１-９])[．.]\s*([○×])\s*(?:[（(]\s*Alasan\s*[:：]\s*(.*?)[）)])?(?=\s*\n\s*[１-９][．.]|\s*\Z|\s*\n\s*\d{2,3}\s*\Z)", as_.get(sec, ""), re.S):
            ans[NUM.index(m.group(1)) + 1] = (m.group(2), re.sub(r"\s+", " ", m.group(3) or "").strip())
        for k in sorted(stm):
            if k in ans: items.append((sec, k, stm[k], ans[k][0], ans[k][1]))
    return items
def glossary():
    txt = "\n".join(page(n) for n in (150, 151, 152)); out = []; cur = None
    for l in txt.split("\n"):
        l = l.strip()
        if not l or l.startswith(("<Referensi", "＜")): continue
        m = re.match(r"^(.{2,45}?)\s*[.…]{3,}\s*(.*)$", l)
        if m: cur = [m.group(1).strip(), m.group(2).strip()]; out.append(cur)
        elif cur and not re.fullmatch(r"\d{1,3}", l): cur[1] += " " + l
    return [(t, re.sub(r"\s+", " ", d).strip()) for t, d in out if len(d) > 5]
