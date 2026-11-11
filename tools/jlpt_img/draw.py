# -*- coding: utf-8 -*-
"""Gambar SVG asli (flat, buatan Shirose) untuk soal choukai JLPT: adegan 発話表現 (orang + yajirushi) dan ikon pilihan 課題理解."""
import math
SKIN = ["#f7d3b5", "#f2c29b", "#e8b48a"]; HAIR = ["#2b2b33", "#4a3426", "#6b4a2f", "#1f1f27"]
SHIRT = ["#4f86d6", "#e8738f", "#58b08a", "#f0a64c", "#8a74d1", "#4aa7b8"]
INK = "#2b2b33"
def svg(w, h, body, bg=None):
    r = f'<rect width="{w}" height="{h}" rx="14" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img">{r}{body}</svg>'
def rect(x, y, w, h, f, r=0, s=None, sw=2): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{f}"' + (f' stroke="{s}" stroke-width="{sw}"' if s else "") + "/>"
def circ(x, y, r, f, s=None, sw=2): return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{f}"' + (f' stroke="{s}" stroke-width="{sw}"' if s else "") + "/>"
def line(x1, y1, x2, y2, c=INK, w=3): return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}" stroke-linecap="round"/>'
def poly(pts, f, s=None, sw=2): return f'<polygon points="{" ".join("%g,%g" % p for p in pts)}" fill="{f}"' + (f' stroke="{s}" stroke-width="{sw}" stroke-linejoin="round"' if s else "") + "/>"
def path(d, f="none", s=None, sw=2): return f'<path d="{d}" fill="{f}"' + (f' stroke="{s}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"' if s else "") + "/>"
def text(x, y, t, sz=14, f=INK, anchor="middle", w=700): return f'<text x="{x}" y="{y}" font-size="{sz}" font-family="Noto Sans JP,Hiragino Sans,sans-serif" font-weight="{w}" fill="{f}" text-anchor="{anchor}">{t}</text>'

# ---------- orang ----------
def person(cx, base, female=False, shirt=0, hair=0, skin=0, s=1.0, face=1, suit=False, arrow=False, hold=None):
    """cx = tengah, base = garis lantai (kaki). face: 1 hadap kanan, -1 kiri."""
    sh = SHIRT[shirt % 6] if not suit else "#3d4660"; hr = HAIR[hair % 4]; sk = SKIN[skin % 3]
    H = 150 * s; top = base - H; hy = top + 22 * s
    b = []
    # kaki
    leg = "#3b3f55" if (suit or not female) else sk
    if female and not suit: b.append(poly([(cx - 20 * s, base - 62 * s), (cx + 20 * s, base - 62 * s), (cx + 26 * s, base - 34 * s), (cx - 26 * s, base - 34 * s)], SHIRT[(shirt + 2) % 6]))
    b.append(rect(cx - 15 * s, base - 40 * s, 12 * s, 40 * s, leg if not (female and not suit) else sk, 3)); b.append(rect(cx + 3 * s, base - 40 * s, 12 * s, 40 * s, leg if not (female and not suit) else sk, 3))
    b.append(rect(cx - 17 * s, base - 5 * s, 16 * s, 6 * s, INK, 3)); b.append(rect(cx + 1 * s, base - 5 * s, 16 * s, 6 * s, INK, 3))
    # badan
    b.append(rect(cx - 22 * s, top + 44 * s, 44 * s, 56 * s, sh, 10))
    if suit: b.append(poly([(cx - 5 * s, top + 44 * s), (cx + 5 * s, top + 44 * s), (cx, top + 62 * s)], "#ffffff")); b.append(line(cx, top + 62 * s, cx, top + 92 * s, "#c0392b", 3))
    # lengan
    ax = cx + face * 24 * s
    if hold == "phone":
        b.append(line(cx + face * 20 * s, top + 54 * s, cx + face * 30 * s, top + 40 * s, sk, 9 * s)); b.append(rect(cx + face * 24 * s - 5 * s, top + 8 * s, 10 * s, 20 * s, "#2f3a4a", 3))
    elif hold == "wave":
        b.append(line(cx + face * 20 * s, top + 54 * s, cx + face * 40 * s, top + 24 * s, sk, 9 * s))
    else:
        b.append(line(cx + face * 22 * s, top + 54 * s, cx + face * 28 * s, top + 92 * s, sk, 9 * s))
    b.append(line(cx - face * 22 * s, top + 54 * s, cx - face * 26 * s, top + 92 * s, sk, 9 * s))
    # kepala
    b.append(circ(cx, hy, 22 * s, sk))
    if female: b.append(path(f"M{cx - 24 * s},{hy + 4 * s} Q{cx - 26 * s},{hy - 26 * s} {cx},{hy - 26 * s} Q{cx + 26 * s},{hy - 26 * s} {cx + 24 * s},{hy + 4 * s} L{cx + 24 * s},{hy + 30 * s} L{cx + 14 * s},{hy + 30 * s} L{cx + 14 * s},{hy - 4 * s} Q{cx},{hy - 12 * s} {cx - 14 * s},{hy - 4 * s} L{cx - 14 * s},{hy + 30 * s} L{cx - 24 * s},{hy + 30 * s} Z", hr))
    else: b.append(path(f"M{cx - 23 * s},{hy - 2 * s} Q{cx - 24 * s},{hy - 26 * s} {cx},{hy - 26 * s} Q{cx + 24 * s},{hy - 26 * s} {cx + 23 * s},{hy - 2 * s} Q{cx},{hy - 14 * s} {cx - 23 * s},{hy - 2 * s} Z", hr))
    ex = face * 7 * s
    b.append(circ(cx + ex - 7 * s, hy + 2 * s, 2.4 * s, INK)); b.append(circ(cx + ex + 7 * s, hy + 2 * s, 2.4 * s, INK))
    b.append(path(f"M{cx + ex - 5 * s},{hy + 11 * s} Q{cx + ex},{hy + 16 * s} {cx + ex + 5 * s},{hy + 11 * s}", "none", INK, 2))
    if arrow:  # yajirushi merah di atas kepala
        ay = top - 6 * s
        b.append(poly([(cx - 11, ay - 36), (cx + 11, ay - 36), (cx + 11, ay - 18), (cx + 20, ay - 18), (cx, ay + 4), (cx - 20, ay - 18), (cx - 11, ay - 18)], "#e0245e", "#ffffff", 2))
    return "".join(b)

# ---------- properti latar ----------
def floor(w, h, y, c="#e9dcc8"): return rect(0, y, w, h - y, c)
def window(x, y, w=70, h=60): return rect(x, y, w, h, "#bfe3f7", 4, "#8fb7cc", 3) + line(x + w / 2, y, x + w / 2, y + h, "#8fb7cc", 3) + line(x, y + h / 2, x + w, y + h / 2, "#8fb7cc", 3)
def table(x, y, w=140, h=14): return rect(x, y, w, h, "#b98a5a", 4) + rect(x + 10, y + h, 10, 46, "#8a6338") + rect(x + w - 20, y + h, 10, 46, "#8a6338")
def papers(x, y): return rect(x, y, 34, 24, "#ffffff", 2, "#9aa6b2", 2) + rect(x + 8, y - 4, 34, 24, "#ffffff", 2, "#9aa6b2", 2) + line(x + 14, y + 4, x + 38, y + 4, "#9aa6b2", 2) + line(x + 14, y + 10, x + 38, y + 10, "#9aa6b2", 2)
def phone(x, y, sc=1): return rect(x, y, 26 * sc, 46 * sc, "#2f3a4a", 6 * sc) + rect(x + 3 * sc, y + 6 * sc, 20 * sc, 30 * sc, "#8ad0f0", 2) + circ(x + 13 * sc, y + 41 * sc, 2 * sc, "#8aa0b8")
def door(x, y, w=64, h=130): return rect(x, y, w, h, "#a9744a", 4, "#7b4f2e", 3) + circ(x + w - 12, y + h / 2, 4, "#f2c94c")
def bed(x, y): return rect(x, y + 26, 150, 22, "#7aa7d9", 4) + rect(x, y + 6, 22, 70, "#8a6338", 3) + rect(x + 150 - 8, y + 20, 14, 56, "#8a6338", 3) + rect(x + 26, y + 14, 40, 16, "#ffffff", 7, "#cfd8e0", 2)
def cake(x, y): return rect(x, y + 14, 60, 30, "#f6c7d6", 6, "#d98aa5", 2) + rect(x + 4, y + 6, 52, 12, "#fff3d6", 5) + rect(x + 28, y - 8, 4, 14, "#e0245e") + path(f"M{x + 30},{y - 12} q-3,5 0,7 q3,-2 0,-7", "#f7b500")
def gift(x, y): return rect(x, y, 48, 38, "#e8738f", 4, "#b24a68", 2) + rect(x + 21, y, 6, 38, "#ffe08a") + rect(x, y + 14, 48, 6, "#ffe08a") + path(f"M{x + 24},{y} q-14,-18 -2,-18 q10,0 2,18 q-10,-18 4,-18 q10,0 -4,18", "none", "#d39a22", 3)
def rack(x, y): return line(x, y, x + 150, y, "#7a7f8a", 4) + "".join(path(f"M{x + 20 + i * 44},{y} l0,8 l-18,12 h36 l-18,-12", "none", "#7a7f8a", 2) + rect(x + 6 + i * 44, y + 14, 34, 40, ["#e8738f", "#4f86d6", "#58b08a"][i], 5) for i in range(3))
def shelf(x, y): return rect(x, y, 140, 100, "#c19a6b", 3, "#8a6338", 3) + "".join(rect(x + 6 + i * 20, y + 8 + (i % 2) * 4, 14, 38 - (i % 2) * 4, ["#e8738f", "#4f86d6", "#58b08a", "#f0a64c", "#8a74d1", "#4aa7b8"][i], 2) + rect(x + 6 + i * 20, y + 56, 14, 36, ["#f0a64c", "#8a74d1", "#4aa7b8", "#e8738f", "#4f86d6", "#58b08a"][i], 2) for i in range(6))
def boxes(x, y): return rect(x, y + 26, 56, 40, "#d9b27c", 3, "#a4793f", 2) + rect(x + 6, y, 44, 28, "#e2c08e", 3, "#a4793f", 2) + rect(x + 64, y + 40, 44, 26, "#d9b27c", 3, "#a4793f", 2)
def board(x, y): return rect(x, y, 130, 76, "#ffffff", 4, "#6b7480", 4) + path(f"M{x + 14},{y + 52} l22,-18 l20,12 l30,-28", "none", "#e0245e", 3) + line(x + 14, y + 62, x + 110, y + 62, "#9aa6b2", 2)
def cup(x, y): return rect(x, y, 30, 26, "#ffffff", 5, "#9aa6b2", 2) + path(f"M{x + 30},{y + 6} q12,2 0,14", "none", "#9aa6b2", 3) + path(f"M{x + 8},{y - 4} q-4,-6 0,-10 M{x + 18},{y - 4} q-4,-6 0,-10", "none", "#b9c2cc", 2) + rect(x - 8, y + 26, 46, 5, "#cfd8e0", 2)
def laptop(x, y): return rect(x, y, 70, 46, "#2f3a4a", 4) + rect(x + 5, y + 5, 60, 36, "#8ad0f0", 2) + rect(x - 8, y + 46, 86, 8, "#9aa6b2", 3)
def clockwall(x, y): return circ(x, y, 22, "#ffffff", INK, 3) + line(x, y, x, y - 14, INK, 3) + line(x, y, x + 10, y + 4, INK, 3)
def smoke(x, y): return rect(x, y, 34, 5, "#f5f0e6", 2, "#c9bfae", 1) + rect(x + 28, y, 6, 5, "#e08a3c") + path(f"M{x + 38},{y - 4} q10,-10 0,-20 q-10,-10 6,-22 M{x + 48},{y - 2} q10,-8 2,-16", "none", "#c8ced6", 4)
def bubble_note(x, y, t="…"): return ""
def street(w): return rect(0, 235, w, 40, "#cfd3da") + "".join(rect(20 + i * 70, 252, 36, 5, "#ffffff", 2) for i in range(7))
def seatrow(x, y): return rect(x, y, 200, 22, "#3f7fb5", 8) + rect(x, y - 36, 200, 36, "#4f93cc", 10) + "".join(circ(x + 20 + i * 40, y + 38, 3, "#9aa6b2") for i in range(5))
def pen(x, y): return rect(x, y, 56, 8, "#4f86d6", 3) + poly([(x + 56, y), (x + 70, y + 4), (x + 56, y + 8)], "#f0d9b5") + rect(x + 2, y, 10, 8, "#e0245e", 2)
def hairstyle(x, y): return circ(x, y, 0.1, "none")
def mug(x, y): return rect(x, y, 26, 30, "#f6d36f", 4, "#c9a227", 2) + path(f"M{x + 26},{y + 6} q12,2 0,16", "none", "#c9a227", 3) + rect(x + 1, y - 8, 24, 10, "#ffffff", 5)
def heart(x, y): return path(f"M{x},{y} c-18,-14 -8,-28 0,-16 c8,-12 18,2 0,16", "#e0245e")
PROPS = dict(phone=phone, door=door, bed=bed, cake=cake, gift=gift, rack=rack, shelf=shelf, boxes=boxes, board=board, cup=cup, laptop=laptop, smoke=smoke, pen=pen, mug=mug, table=table, papers=papers, window=window, seatrow=seatrow)
