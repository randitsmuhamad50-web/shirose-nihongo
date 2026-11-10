# -*- coding: utf-8 -*-
"""Beri tag kelas kata (pos) pada data/kosakata-n*.json: KK, KB, KSい, KSな, atau kosong (lain-lain: adverbia, konjungsi, ungkapan).
Aturan + daftar manual (tools/pos_lists.py) + override guru (tools/pos_override.json: {"n5": {"kata": ["KK"]}})."""
import json, re, os, sys
H = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, H)
import pos_lists as L
HIRA = re.compile(r'^[぀-ゟー]+$'); KATA = re.compile(r'^[゠-ヿー・]+$')
KANJI = re.compile(r'[㐀-鿿]')
def clean(t):
    t = re.sub(r'\[[^\]]*\]|［[^］]*］|[①②③④⑤]', '', t); return t.strip().replace(' ', '').replace('　', '')
def classify(kata):
    t = clean(kata); base = t
    if not t: return []
    if t in L.NOT_VERB: return []
    if t.endswith(('ます', 'ません', 'ください', 'でした', 'ですか', 'です')) or t.endswith(('ないで', 'ましょう')): return []
    if t in L.ADV: return []
    if t.endswith('する') or t.endswith('をする') or t.endswith('にする') or t.endswith('くする'): return ['KK']
    if t.endswith(('を','に','が','は','と','で','へ','も','から','まで')) and not t.endswith(('に','と')) : return []
    if t.endswith('な') and not t.endswith('ない'): return ['KSな']
    if t.endswith('だ') and len(t) > 1: return ['KSな']
    if t in ('一つ','二つ','三つ','四つ','五つ','六つ','七つ','八つ','九つ','十'): return []
    if t.endswith('い'):
        if t in L.NA_I or t[:-1] in L.NA_I: return ['KSな']
        if t in L.NOUN_I: return ['KB']
        if KATA.match(t): return ['KB']
        if t in ('おいしい','いい','よい'): return ['KSい']
        return ['KSい']
    if t[-1] in 'るうくぐすつぬぶむ' and not KATA.match(t):
        if t in L.NA or t[-1] == 'る' and t in L.NOUN_RU: return ['KB']
        return ['KK']
    if t.endswith('的') and len(t) >= 3: return ['KSな']
    if t in L.NA or t.rstrip('な') in L.NA: return ['KSな']
    if t in L.SAHEN: return ['KB', 'KK']
    return ['KB']
def run():
    ov_path = os.path.join(H, 'pos_override.json')
    ov = json.load(open(ov_path, encoding='utf8')) if os.path.exists(ov_path) else {}
    stats = {}
    for n in (5, 4, 3, 2, 1):
        p = os.path.join(H, '..', 'data', f'kosakata-n{n}.json')
        d = json.load(open(p, encoding='utf8'))
        c = {}
        for x in d:
            tags = ov.get(f'n{n}', {}).get(x['kata']) or ov.get('*', {}).get(x['kata']) or classify(x['kata'])
            if tags == ['-']: tags = []
            if tags: x['pos'] = tags
            else: x.pop('pos', None)
            for g in (tags or ['-']): c[g] = c.get(g, 0) + 1
        json.dump(d, open(p, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
        stats[n] = c
    print(stats)
if __name__ == '__main__': run()
