#!/usr/bin/env python3
"""Bangun paket ★ (文の組み立て): jlpt/<lv>/star-01..02.json, 20 soal/paket dari tools/jlpt_kumitate/star_<lv>.py, lalu daftarkan di jlpt/index.json."""
import json, os, sys, importlib.util
H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(H)
KD = os.path.join(H, 'jlpt_kumitate'); sys.path.insert(0, KD)
src = open(os.path.join(KD, 'build.py'), encoding='utf8').read().split('for lv in ("n5"')[0]
g = {'__file__': os.path.join(KD, 'build.py'), '__name__': 'b'}
exec(compile(src, 'b', 'exec'), g)
make = g['make']
def mod(n, p):
    sp = importlib.util.spec_from_file_location(n, p); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m
ix = json.load(open(os.path.join(ROOT, 'jlpt', 'index.json'), encoding='utf8'))
INSTR = 'つぎの 文の ★ に 入る いちばん いい ものを 一つ えらんで ください。'
for lv in ('n5', 'n4', 'n3', 'n2', 'n1'):
    base = mod('b' + lv, os.path.join(KD, lv + '.py')); st = mod('s' + lv, os.path.join(KD, 'star_' + lv + '.py'))
    assert len(st.S) >= 40
    metas = []
    for p in (1, 2):
        rows = st.S[(p - 1) * 20: p * 20]; items = []
        for i, row in enumerate(rows):
            old = {'cat': 'bunpou', 'tipe': 'kumitate', 'tipe_jp': '文の組み立て'}
            it = make(old, 1000 + (p - 1) * 20 + i, row, base.POLA, True)
            it['no'] = i + 1; it['id'] = f'{lv}-star-{p:02d}-q{i+1:02d}'; items.append(it)
        d = {'id': f'{lv}-star-{p:02d}', 'lv': lv, 'jenis': 'star', 'judul': f'Bintang ★ Practice {p:02d}', 'durasi': 20,
             'sections': [{'mondai': 1, 'tipe': 'kumitate', 'cat': 'bunpou', 'tipe_jp': '文の組み立て', 'judul': 'Menyusun kalimat (★)', 'instr': INSTR, 'items': items}],
             'passages': {}, 'jumlah': len(items)}
        json.dump(d, open(os.path.join(ROOT, 'jlpt', lv, f'star-{p:02d}.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
        metas.append({'id': d['id'], 'file': f'{lv}/star-{p:02d}.json', 'judul': d['judul'], 'jumlah': len(items), 'durasi': 20, 'mondai': ['文の組み立て (%d)' % len(items)]})
    old = ix['level'][lv].get('star')
    if old is None: ix['total_soal'] += 40
    ix['level'][lv]['star'] = metas
    print(lv, 'star ok', len(metas))
json.dump(ix, open(os.path.join(ROOT, 'jlpt', 'index.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
