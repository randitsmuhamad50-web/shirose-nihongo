#!/usr/bin/env python3
"""Ringkas `arti` kosakata (hasil generator bertele-tele): buang kalimat contoh/penjelasan, sisakan padanan pendek.
Pakai: python3 tools/kosakata_arti_clean.py n5 [--write]  (override manual: tools/kosakata_arti_override.json)"""
import json, re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JP = re.compile(r'[぀-ヿ㐀-鿿]')
def clean(a):
    a = re.sub(r'\s*(Contoh|Dalam konteks|Dalam kalimat|Muncul dalam|Ini menunjukkan)[^\n]*$', '', a).strip()
    a = re.sub(r"\(\s*[぀-ヿ㐀-鿿]+[^)]*\)", '', a)          # (さんじ, sanji) (12月)
    a = re.sub(r"^\s*\d+\.\s*[぀-ヿ㐀-鿿]+\s*[:：-]\s*", '1. ', a)  # 風邪 (かぜ) : ...
    senses = [s.strip(' .;') for s in re.split(r'(?:^|\s)\d+\.\s*|;', a) if s.strip(' .;')]
    keep = []
    for s in senses:
        s = re.sub(r'^\((?:n|v|adj|kata kerja|kata benda|adjektiva|kata seru|kata ganti pribadi|kata sifat|kata keterangan)\)\s*', '', s, flags=re.I).strip()
        if JP.search(s) and len(JP.findall(s)) > 2: continue
        if len(s.split()) > 6 or re.search(r'\b(yang|untuk|digunakan|merujuk|biasanya|adalah|berarti|ungkapan|bentuk sopan|menyatakan)\b', s) and len(s.split()) > 3: continue
        if s and s.lower() not in [k.lower() for k in keep]: keep.append(s)
    if not keep and senses:
        s = senses[0]; s = re.split(r'\b(?:yang|untuk|digunakan|merujuk|biasanya|adalah)\b|[:,(]', s)[0].strip(' ;.')
        keep = [s or senses[0][:40]]
    return '; '.join(keep[:4])
if __name__ == '__main__':
    lv = sys.argv[1]; p = f'{ROOT}/data/kosakata-{lv}.json'
    d = json.load(open(p, encoding='utf8'))
    ov = json.load(open(f'{ROOT}/tools/kosakata_arti_override.json', encoding='utf8')).get(lv, {}) if os.path.exists(f'{ROOT}/tools/kosakata_arti_override.json') else {}
    n = 0
    for i, w in enumerate(d):
        key = f"{w.get('no', i + 1)}"
        r = ov.get(key) or clean(w['arti'])
        if r != w['arti']: n += 1; w['arti'] = r
    print(lv, 'arti diringkas', n)
    if '--write' in sys.argv: json.dump(d, open(p, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
