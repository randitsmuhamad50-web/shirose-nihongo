# -*- coding: utf-8 -*-
"""Pasang gambar ke item choukai: attach(item, tipe_jp, iid, set, opts) → item.img / item.oimg. Dipakai tools/choukai_build.py dan tools/jlpt_img/build_n3.py."""
import sys, os, re, json, zlib, hashlib
sys.path.insert(0, os.path.dirname(__file__))
from draw import *
from icons import compose
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = ROOT + "/assets/jlpt/img"; os.makedirs(OUT, exist_ok=True)
W, H, FY = 480, 290, 250
RULES = [  # (regex, jenis)
 (r"電話で|電話がかかって|電話を借り", "phone"), (r"病気|入院|お見舞い", "bed"), (r"携帯電話|会議|紹介|部長|課長|上司|先輩|取引先|仕事|会社|飲み会", "office"),
 (r"試着|レジ|店員|お店|店で|店です", "shop"), (r"コーヒー", "coffee"), (r"ケーキ", "cake"), (r"お土産|玄関|プレゼント", "gift"), (r"引っ越し", "move"), (r"たばこ", "smoke"),
 (r"図書館", "library"), (r"電車|気分", "train"), (r"先生|研究室|授業|学校", "school"), (r"道で", "street"), (r"髪型", "hair"), (r"ペン|レポート|メール|旅行|写真", "desk"), (r"家", "home")]
def scene_kind(t):
    for r, k in RULES:
        if re.search(r, t): return k
    return "home"
def scene(iid, t):
    k = scene_kind(t); h = zlib.crc32(iid.encode())
    fem = h % 2 == 0; suit = k in ("office",)
    sc = 1.0; sp_x, ls_x = 150, 335
    b = [rect(0, 0, W, H, "#eef3f8"), floor(W, H, FY, "#e6d9c4")]
    listener = True; hold = None; ls_fem = not fem; props = ""
    if k == "phone": listener = False; hold = "phone"; props = window(300, 60) + clockwall(400, 80); sp_x = 190
    elif k == "bed": props = bed(250, 170) + window(330, 50); ls_lie = True; listener = False
    elif k == "office": props = board(250, 60) + table(250, 200, 170) + papers(300, 180) + clockwall(440, 50); ls_x = 360
    elif k == "shop": props = rack(250, 90) + rack(250, 160)
    elif k == "coffee": props = table(230, 200, 150) + cup(300, 170)
    elif k == "cake": props = table(230, 200, 150) + cake(290, 164)
    elif k == "gift": props = door(360, 110) + gift(200, 214)
    elif k == "move": props = boxes(280, 190) + window(60, 50)
    elif k == "smoke": props = smoke(250, 150) + window(60, 50)
    elif k == "library": props = shelf(280, 130)
    elif k == "train": props = seatrow(240, 170) + window(70, 60, 100, 60)
    elif k == "school": props = board(260, 70) + door(40, 110)
    elif k == "street": props = street(W)
    elif k == "hair": props = window(60, 50)
    elif k == "desk": props = table(250, 200, 170) + pen(280, 188) + laptop(340, 150)
    else: props = window(60, 50) + table(250, 200, 160)
    b.append(props)
    if k == "street": b.insert(2, rect(0, 0, W, FY, "#cfe9f7"))
    if k == "bed": b.append(circ(290, 200, 18, SKIN[0]) + path("M270,198 q20,-26 42,-2", HAIR[1]))
    if listener: b.append(person(ls_x, FY, ls_fem if k != "office" else (h % 3 == 0), shirt=(h >> 3) + 2, hair=(h >> 5), skin=(h >> 2), s=sc, face=-1, suit=suit))
    b.append(person(sp_x, FY, fem, shirt=(h >> 1), hair=(h >> 4), skin=(h >> 6), s=sc, face=1, suit=suit, arrow=True, hold=hold))
    return svg(W, H, "".join(b))
def write(name, content):
    p = OUT + "/" + name
    open(p, "w", encoding="utf-8").write(content); return "assets/jlpt/img/" + name

def attach(item, kind, iid, set_, opts):
    """kind: 発話表現/hatsuwa → adegan; 課題理解/kadai → pilihan bergambar bila semua pilihan punya ikon. True bila ada perubahan."""
    if kind in ("発話表現", "hatsuwa"):
        item["img"] = write("n3-%s.svg" % iid.replace("n3-", ""), scene(iid, set_)); return True
    if kind in ("課題理解", "kadai"):
        ims = [compose(o) for o in opts]
        if all(ims):
            item["oimg"] = [write("o-" + hashlib.md5(o.replace(" ", "").encode()).hexdigest()[:10] + ".svg", im) for o, im in zip(opts, ims)]; return True
    return False
