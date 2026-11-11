# -*- coding: utf-8 -*-
from draw import *
def g(x, y, body, sc=1): return f'<g transform="translate({x},{y}) scale({sc})">{body}</g>'
# ikon digambar di kotak 100x100
def apron(): return poly([(30, 14), (70, 14), (66, 34), (76, 90), (24, 90), (34, 34)], "#f0a64c", "#c77c1f", 3) + path("M34,34 Q50,46 66,34", "none", "#c77c1f", 3) + rect(40, 58, 20, 16, "#fbd08a", 3)
def sankakin(): return poly([(14, 30), (86, 30), (50, 80)], "#6fb7e0", "#3f86b0", 3) + line(14, 30, 4, 22, "#3f86b0", 3) + line(86, 30, 96, 22, "#3f86b0", 3)
def yoki(): return rect(20, 36, 60, 44, "#dff0fa", 7, "#7fb2cf", 3) + rect(16, 30, 68, 12, "#9ccbe6", 5, "#7fb2cf", 3) + line(30, 52, 70, 52, "#b8d9ea", 3)
def houchou(): return poly([(12, 56), (64, 38), (86, 40), (86, 52), (28, 66)], "#d7dde3", "#8794a0", 3) + rect(62, 40, 30, 14, "#7b4f2e", 4)
def uwagi(): return poly([(28, 16), (72, 16), (92, 34), (82, 44), (72, 36), (72, 88), (28, 88), (28, 36), (18, 44), (8, 34)], "#58b08a", "#2f7d5a", 3) + line(50, 16, 50, 88, "#2f7d5a", 3)
def amagu(): return path("M10,50 Q50,2 90,50 Z", "#e8738f", "#b24a68", 3) + line(50, 50, 50, 84, INK, 4) + path("M50,84 q0,10 -10,8", "none", INK, 4)
def mizu(): return rect(36, 22, 28, 12, "#4f86d6", 3) + rect(30, 34, 40, 56, "#bfe3f7", 10, "#6aa9cf", 3) + rect(30, 56, 40, 34, "#7cc2ea", 10)
def bento(): return rect(14, 30, 72, 46, "#8a5a2b", 8, "#5d3a17", 3) + rect(20, 36, 28, 34, "#fffbe8", 4) + rect(52, 36, 28, 16, "#e8738f", 4) + rect(52, 56, 28, 14, "#58b08a", 4)
def toiletpaper(): return rect(22, 28, 56, 50, "#ffffff", 8, "#9aa6b2", 3) + circ(50, 53, 12, "#f2e9d8", "#9aa6b2", 3) + circ(50, 53, 4, "#9aa6b2")
def senzai(): return rect(32, 40, 36, 50, "#4aa7b8", 6, "#2f7d8c", 3) + rect(40, 26, 18, 16, "#ffffff", 3, "#9aa6b2", 3) + rect(42, 54, 16, 22, "#ffffff", 3)
def gomibukuro(): return path("M26,36 Q50,18 74,36 L84,86 Q50,98 16,86 Z", "#3a3f4a", "#1f232b", 3) + path("M34,30 q16,-14 32,0", "none", "#1f232b", 4)
def nomimono(): return rect(30, 28, 40, 60, "#ffffff", 6, "#9aa6b2", 3) + rect(34, 42, 32, 42, "#e8873f", 4) + line(54, 12, 54, 30, "#e0245e", 4)
def okashi(): return circ(50, 52, 26, "#e8c07a", "#b88a3c", 3) + circ(42, 46, 3, "#7b4f2e") + circ(58, 44, 3, "#7b4f2e") + circ(52, 60, 3, "#7b4f2e") + circ(40, 62, 3, "#7b4f2e")
def game(): return rect(10, 34, 80, 38, "#4f4f66", 16, "#2b2b33", 3) + rect(24, 46, 6, 14, "#ffffff", 2) + rect(20, 50, 14, 6, "#ffffff", 2) + circ(68, 48, 4, "#e0245e") + circ(76, 58, 4, "#58b08a")
def card(label=None): return rect(12, 28, 76, 50, "#ffffff", 6, "#6b7480", 3) + rect(20, 38, 22, 22, "#bfe3f7", 3) + line(50, 42, 80, 42, "#9aa6b2", 3) + line(50, 52, 74, 52, "#9aa6b2", 3) + line(50, 62, 70, 62, "#9aa6b2", 3)
def menkyo(): return rect(12, 28, 76, 50, "#e9f6e4", 6, "#4a9a62", 3) + rect(20, 38, 22, 22, "#bfe3f7", 3) + line(50, 42, 80, 42, "#4a9a62", 3) + rect(50, 52, 30, 10, "#b9e0b0", 2) + text(50, 74, "免許", 9)
def hokenshou(): return rect(12, 28, 76, 50, "#fdeef2", 6, "#c9657f", 3) + circ(32, 50, 11, "#f7c6d3") + line(50, 42, 80, 42, "#c9657f", 3) + line(50, 54, 76, 54, "#c9657f", 3) + text(50, 74, "保険", 9)
def passport(): return rect(26, 14, 48, 72, "#27407a", 5, "#16264d", 3) + circ(50, 42, 12, "none", "#f2c94c", 3) + line(38, 42, 62, 42, "#f2c94c", 2) + text(50, 74, "PASSPORT", 7, "#f2c94c")
def inkan(): return rect(38, 14, 24, 40, "#c0392b", 5, "#8e2418", 3) + rect(26, 54, 48, 28, "#fff3e0", 4, "#c0392b", 3) + circ(50, 68, 9, "none", "#c0392b", 3) + text(50, 72, "印", 10, "#c0392b")
def gyuniku(): return path("M16,52 Q16,24 48,26 Q82,24 84,50 Q82,78 48,76 Q16,80 16,52 Z", "#d9506a", "#a02e44", 3) + path("M30,46 q16,-10 38,0 M32,60 q16,8 36,-2", "none", "#f6c9d2", 3)
def tamago(): return path("M50,14 Q74,14 74,50 Q74,86 50,86 Q26,86 26,50 Q26,14 50,14 Z", "#fff5e0", "#d9b77c", 3)
def negi(): return rect(44, 14, 12, 60, "#ffffff", 5, "#9bb58a", 3) + path("M44,14 Q40,0 30,4 M56,14 Q64,0 74,6 M50,14 Q50,-2 50,0", "none", "#3f9a4e", 6) + path("M44,40 L56,40", "none", "#9bb58a", 2)
def tofu(): return poly([(18, 44), (64, 44), (84, 58), (38, 58)], "#fffdf2", "#cfc9a8", 3) + poly([(18, 44), (38, 58), (38, 82), (18, 68)], "#f2ecd0", "#cfc9a8", 3) + poly([(38, 58), (84, 58), (84, 82), (38, 82)], "#fffbe8", "#cfc9a8", 3)
def book(c="#4f86d6", t=None): return rect(22, 16, 56, 72, c, 5, "#2b2b33", 3) + rect(22, 16, 10, 72, "#ffffff22", 0) + (rect(34, 30, 34, 16, "#ffffff", 3) + text(51, 43, t, 11) if t else rect(34, 30, 34, 16, "#ffffff", 3))
def zasshi(): return rect(24, 12, 52, 76, "#e8738f", 3, "#b24a68", 3) + rect(30, 18, 40, 14, "#ffffff", 2) + rect(30, 38, 40, 40, "#ffe0ea", 3)
def sumaho(): return rect(32, 10, 36, 80, "#2f3a4a", 8) + rect(36, 20, 28, 54, "#8ad0f0", 3) + circ(50, 82, 3, "#8aa0b8")
def genkin(): return rect(10, 30, 80, 42, "#f3e3a6", 5, "#b79b3b", 3) + circ(50, 51, 12, "none", "#b79b3b", 3) + text(50, 56, "円", 14, "#8a6f1c")
def shohinken(): return rect(10, 28, 80, 46, "#d9efd0", 5, "#4a9a62", 3) + rect(16, 34, 68, 8, "#ffffff", 2) + text(50, 62, "商品券", 15, "#2f6b44")
def teishoku(kind): 
    main = {"肉": ("#c0623a", "#7e3b1c"), "魚": ("#f0a64c", "#b87420")}[kind]
    return rect(8, 30, 84, 50, "#8a5a2b", 8, "#5d3a17", 3) + path("M18,56 q14,-24 32,-16 q16,8 14,24 q-14,6 -30,4 Z", main[0], main[1], 3) + circ(72, 46, 10, "#fffbe8", "#d9c9a0", 3) + rect(62, 60, 22, 10, "#58b08a", 3)
def curry(): return path("M10,56 h80 q-4,28 -40,28 q-36,0 -40,-28 Z", "#ffffff", "#9aa6b2", 3) + path("M16,56 q16,-24 40,-14 q24,-8 28,14 Z", "#b9772a", "#7e4d14", 3) + circ(66, 40, 5, "#fbd08a")
def udon(): return path("M10,50 h80 q-4,34 -40,34 q-36,0 -40,-34 Z", "#c0392b", "#8e2418", 3) + path("M18,48 q10,-12 20,0 q10,-12 20,0 q10,-12 20,0", "none", "#fff3d6", 5) + circ(50, 42, 8, "#fff5e0") + line(66, 20, 80, 52, "#7b4f2e", 3) + line(74, 18, 88, 50, "#7b4f2e", 3)
def zoo(): return path("M20,76 q-8,-40 24,-46 q30,0 34,34 l0,12 Z", "#f0a64c", "#b87420", 3) + circ(40, 50, 3, INK) + circ(60, 50, 3, INK) + circ(50, 62, 8, "#fbd08a") + circ(26, 34, 9, "#f0a64c", "#b87420", 3) + circ(74, 34, 9, "#f0a64c", "#b87420", 3)
def kagaku(): return circ(50, 50, 8, "#e0245e") + path("M10,50 q40,-40 80,0 q-40,40 -80,0", "none", "#4f86d6", 3) + path("M30,14 q40,36 40,72 M70,14 q-40,36 -40,72", "none", "#4f86d6", 3)
def suizokukan(): return path("M14,52 q28,-26 56,0 q-28,26 -56,0 Z", "#4f86d6", "#2f5ea8", 3) + poly([(70, 52), (90, 36), (90, 68)], "#4f86d6", "#2f5ea8", 3) + circ(30, 48, 3, "#ffffff") + path("M20,82 q10,-8 20,0 t20,0 t20,0", "none", "#7cc2ea", 4)
def bijutsu(): return rect(16, 18, 68, 56, "#c19a6b", 4, "#8a6338", 4) + rect(24, 26, 52, 40, "#bfe3f7", 2) + poly([(24, 66), (42, 44), (54, 58), (62, 50), (76, 66)], "#58b08a") + circ(64, 36, 6, "#f7b500") + rect(34, 80, 32, 6, "#8a6338", 2)
ICONS = {"エプロン": apron, "三角巾": sankakin, "容器": yoki, "包丁": houchou, "上着": uwagi, "雨具": amagu, "水": mizu, "弁当": bento, "トイレットペーパー": toiletpaper, "洗剤": senzai, "ごみ袋": gomibukuro,
 "飲み物": nomimono, "お菓子": okashi, "ゲーム": game, "カード": card, "自己紹介のカード": card, "運転免許証": menkyo, "保険証": hokenshou, "パスポート": passport, "印鑑": inkan, "牛肉": gyuniku, "卵": tamago, "ねぎ": negi, "豆腐": tofu,
 "教科書": lambda: book("#4f86d6", "教"), "辞書": lambda: book("#27407a", "辞"), "参考書": lambda: book("#58b08a", "参"), "雑誌": zasshi, "スマホ": sumaho, "現金": genkin, "商品券": shohinken,
 "肉の定食": lambda: teishoku("肉"), "魚の定食": lambda: teishoku("魚"), "カレー": curry, "うどん": udon, "動物園": zoo, "科学館": kagaku, "水族館": suizokukan, "美術館": bijutsu}
KANJI_NUM = {"一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10}
def kn(s):
    if s == "十": return 10
    if s.startswith("十"): return 10 + KANJI_NUM[s[1]]
    if s.endswith("十"): return KANJI_NUM[s[0]] * 10
    if "十" in s: a, b = s.split("十"); return KANJI_NUM[a] * 10 + KANJI_NUM[b]
    return KANJI_NUM[s]
def clock(h, m):
    b = circ(50, 50, 40, "#ffffff", INK, 4)
    for i in range(12):
        a = i * math.pi / 6; b += line(50 + 33 * math.sin(a), 50 - 33 * math.cos(a), 50 + 38 * math.sin(a), 50 - 38 * math.cos(a), INK, 3)
    ha = ((h % 12) + m / 60) * math.pi / 6; ma = m * math.pi / 30
    b += line(50, 50, 50 + 22 * math.sin(ha), 50 - 22 * math.cos(ha), INK, 5) + line(50, 50, 50 + 33 * math.sin(ma), 50 - 33 * math.cos(ma), "#e0245e", 3) + circ(50, 50, 3, INK)
    return b
DAYS = "月火水木金土日"
def week(d):
    b = ""
    for i, c in enumerate(DAYS):
        on = (c == d)
        b += rect(2 + i * 13.6, 30, 12.6, 40, "#e0245e" if on else "#ffffff", 3, "#9aa6b2", 1.5) + text(8.3 + i * 13.6, 55, c, 9 if not on else 10, "#ffffff" if on else ("#c0392b" if c == "日" else INK))
    return b
def compose(opt):
    """Kembalikan svg ikon untuk teks pilihan, atau None bila ada kata yang belum punya ikon."""
    o = opt.replace(" ", "").replace("　", "")
    import re
    m = re.fullmatch(r"([月火水木金土日])曜日", o)
    if m: return svg(100 * 1.0 * 1.4, 100, g(0, 8, week(m.group(1)), 1.4) , "#f4f7fa")
    m = re.fullmatch(r"([一二三四五六七八九十]+)時((?:[一二三四五六七八九十]+)分|半)?", o)
    if m:
        h = kn(m.group(1)); mi = 30 if m.group(2) == "半" else (kn(m.group(2)[:-1]) if m.group(2) else 0)
        return svg(100, 100, clock(h, mi), "#f4f7fa")
    parts = o.split("と")
    if all(p in ICONS for p in parts):
        n = len(parts); sc = 1.0 if n <= 2 else (0.8 if n == 3 else 0.62); w = max(112, n * 100 * sc + 12)
        body = "".join(g(6 + i * 100 * sc, (100 - 100 * sc) / 2, ICONS[p](), sc) for i, p in enumerate(parts))
        if n == 1: body = g((w - 100) / 2, 0, ICONS[parts[0]](), 1)
        return svg(int(w), 100, body, "#f4f7fa")
    return None
