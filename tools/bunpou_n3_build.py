#!/usr/bin/env python3
"""Bangun data/bunpou-n3.json dari tools/bunpou_n3_src/*.txt (format Shirose: arti, penjelasan, rumus KK/KB/KSい/KSな, contoh)."""
import json, re, os, glob, sys
H = os.path.dirname(os.path.abspath(__file__))
items = []; cur = None
for f in sorted(glob.glob(os.path.join(H, 'bunpou_n3_src', '*.txt'))):
    for l in open(f, encoding='utf8').read().split('\n'):
        if l.startswith('## '):
            no, pola, kana = [x.strip() for x in l[3:].split('|')]
            cur = {'no_src': int(no), 'pola': pola, 'kata': pola, 'kana': kana, 'arti': '', 'penjelasan': '', 'rumus': [], 'ex': []}
            items.append(cur); continue
        if cur is None or not l.strip(): continue
        if l.startswith('arti:'): cur['arti'] = l[5:].strip()
        elif l.startswith('pen:'): cur['penjelasan'] = l[4:].strip()
        elif l.startswith('- '): cur['rumus'].append(l[2:].strip())
        elif l.startswith('C:'): cur['ex'].append([l[2:].strip(), ''])
        elif l.startswith('T:'): cur['ex'][-1][1] = l[2:].strip()
out = []
bad = 0
for it in items:
    assert it['arti'] and it['penjelasan'] and it['rumus'] and it['ex'], it['pola']
    for jp, tr in it['ex']:
        assert jp and tr, it['pola']
    d = {'pola': it['pola'], 'kata': it['kata'], 'kana': it['kana'], 'arti': it['arti'], 'penjelasan': it['penjelasan'],
         'rumus': it['rumus'], 'contoh': it['ex'][0][0], 'arti_contoh': it['ex'][0][1]}
    if len(it['ex']) > 1: d['contoh_lain'] = [{'jp': a, 'id': b} for a, b in it['ex'][1:]]
    out.append(d)
json.dump(out, open(os.path.join(H, '..', 'data', 'bunpou-n3.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('bunpou n3:', len(out))
