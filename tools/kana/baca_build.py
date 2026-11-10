# -*- coding: utf-8 -*-
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from baca_words import HIRA, KATA
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
B = {"あ":"a","い":"i","う":"u","え":"e","お":"o","か":"ka","き":"ki","く":"ku","け":"ke","こ":"ko","さ":"sa","し":"shi","す":"su","せ":"se","そ":"so","た":"ta","ち":"chi","つ":"tsu","て":"te","と":"to","な":"na","に":"ni","ぬ":"nu","ね":"ne","の":"no","は":"ha","ひ":"hi","ふ":"fu","へ":"he","ほ":"ho","ま":"ma","み":"mi","む":"mu","め":"me","も":"mo","や":"ya","ゆ":"yu","よ":"yo","ら":"ra","り":"ri","る":"ru","れ":"re","ろ":"ro","わ":"wa","を":"o","ん":"n",
"が":"ga","ぎ":"gi","ぐ":"gu","げ":"ge","ご":"go","ざ":"za","じ":"ji","ず":"zu","ぜ":"ze","ぞ":"zo","だ":"da","ぢ":"ji","づ":"zu","で":"de","ど":"do","ば":"ba","び":"bi","ぶ":"bu","べ":"be","ぼ":"bo","ぱ":"pa","ぴ":"pi","ぷ":"pu","ぺ":"pe","ぽ":"po"}
SM = {"ゃ":"ya","ゅ":"yu","ょ":"yo"}
def kata2hira(s): return "".join(chr(ord(c) - 0x60) if "ァ" <= c <= "ヶ" else c for c in s)
YOON_I = {"き":"ky","ぎ":"gy","し":"sh","じ":"j","ち":"ch","に":"ny","ひ":"hy","び":"by","ぴ":"py","み":"my","り":"ry"}
def romaji(w):
    h = kata2hira(w); out = []; i = 0; sok = False
    vow = lambda r: r[-1] if r and r[-1] in "aiueo" else ""
    while i < len(h):
        c = h[i]
        if c == "っ": sok = True; i += 1; continue
        if c == "ー":
            if out and out[-1] and out[-1][-1] in "aiueo": out[-1] = out[-1][:-1] + {"a":"ā","i":"ī","u":"ū","e":"ē","o":"ō"}[out[-1][-1]]
            i += 1; continue
        if i + 1 < len(h) and h[i+1] in SM and c in YOON_I:
            base = YOON_I[c]; y = SM[h[i+1]]
            r = base + y[1:] if base in ("sh", "ch", "j") else base + y[1:]   # しゃ→sha, きゃ→kya, じゅ→ju
            i += 2
        elif c in B and i + 1 < len(h) and h[i+1] in "ぁぃぅぇぉ":
            cons = {"ふ": "f", "て": "t", "で": "d", "う": "w", "し": "sh", "ち": "ch", "じ": "j"}.get(c, B[c][:-1]); r = cons + "aiueo"["ぁぃぅぇぉ".index(h[i+1])]; i += 2
        elif c in B: r = B[c]; i += 1
        else: r = c; i += 1
        if sok and r and r[0] not in "aiueon": r = (("t" if r.startswith("ch") else r[0]) + r); sok = False
        sok = False
        out.append(r)
    s = "".join(out)
    # vokal panjang hiragana → tanda makron
    for a, b in (("ou", "ō"), ("oo", "ō"), ("uu", "ū"), ("ei", "ei")):
        pass
    return s
def macron(s, w):
    # Hanya katakana dengan tanda ー yang memakai makron (ā ī ū ē ō). Hiragana ditulis apa adanya (kyou, okaasan, ookii).
    if "ー" not in w: return s
    return s
def parse(txt, pred):
    t = [x.strip() for x in txt.replace("\n", "|").split("|") if x.strip()]
    assert len(t) % 2 == 0, (len(t), t[-3:])
    seen = set(); out = []
    for k, a in zip(t[::2], t[1::2]):
        if k in seen: continue
        seen.add(k)
        assert pred(k), k
        out.append({"k": k, "r": macron(romaji(k), k), "a": a})
    return out
hira = parse(HIRA, lambda k: re.fullmatch(r"[ぁ-ゖ]+", k))
import random
special = lambda k: bool(re.search(r"[がぎぐげござじずぜぞだでどばびぶべぼぱぴぷぺぽっゃゅょー]|[おうえ][うおい]", k))
rm = [x for x in hira if not special(x["k"])]; random.Random(7).shuffle(rm)
drop = {x["k"] for x in rm[:max(0, len(hira) - 200)]}; hira = [x for x in hira if x["k"] not in drop]
kata = [x for x in parse(KATA, lambda k: re.fullmatch(r"[ァ-ヺー]+", k)) if x["k"] != "サル"][:200]
print(len(hira), len(kata))
json.dump({"schema": "kana.baca/1", "hira": hira, "kata": kata}, open(os.path.join(ROOT, "data", "kana-baca.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
