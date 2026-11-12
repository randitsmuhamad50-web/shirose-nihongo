#!/usr/bin/env python3
"""Ekstrak gambar deck Anki ke img/kosakata/<lv>/<no>.webp dan set field `img` (path relatif) di data/kosakata-<lv>.json.
Pakai: python3 tools/anki_images.py APKG [n5 n4 n2 n1] [--write]"""
import json, re, sys, os, zipfile, io
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
apkg = sys.argv[1]; lvls = [a for a in sys.argv[2:] if a.startswith('n')] or ['n5','n4','n2','n1']
deck = json.load(open(f'{ROOT}/tools/anki_deck_extract.json', encoding='utf8'))
z = zipfile.ZipFile(apkg); media = json.loads(z.read('media')); rev = {v: k for k, v in media.items()}
from PIL import Image
for lv in lvls:
    p = f'{ROOT}/data/kosakata-{lv}.json'; d = json.load(open(p, encoding='utf8')); n = 0
    os.makedirs(f'{ROOT}/img/kosakata/{lv}', exist_ok=True)
    for i, (a, w) in enumerate(zip(deck[lv.upper()], d), 1):
        w.pop('img', None)
        fns = [f for f in re.findall(r'src="([^"]+)"', a.get('Image', '')) if f != '_ajatt-tools.webp' and f in rev]
        if not fns: continue
        im = Image.open(io.BytesIO(z.read(rev[fns[0]])))
        if im.width > 480: im = im.resize((480, round(im.height * 480 / im.width)))
        out = f'img/kosakata/{lv}/{i}.webp'
        if '--write' in sys.argv: im.save(f'{ROOT}/{out}', 'WEBP', quality=80)
        w['img'] = out; n += 1
    print(lv, 'gambar', n)
    if '--write' in sys.argv: json.dump(d, open(p, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
