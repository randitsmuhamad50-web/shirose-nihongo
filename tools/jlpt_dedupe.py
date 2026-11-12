#!/usr/bin/env python3
"""Hapus duplikat soal JLPT (level LV): pertahankan kemunculan pertama, ganti sisanya dengan baris bank yang belum terpakai.
usage: jlpt_dedupe.py LV [--dry]"""
import sys, re, json, glob, collections, os
LVN = sys.argv[1]; DRY = '--dry' in sys.argv
sys.argv = ['x', LVN]
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'jlpt_rewrite.py'), encoding='utf8').read().rsplit('\nmain()', 1)[0]
g = {'__file__': os.path.join(os.path.dirname(os.path.abspath(__file__)), 'jlpt_rewrite.py'), '__name__': 'rw'}
exec(compile(src, 'rw', 'exec'), g)
BANK, build, plain = g['BANK'], g['build'], g['plain']
def norm(s): return re.sub(r'\s+', '', re.sub(r'<[^>]+>', '', str(s)))
def key(d, sec, it):
    tp = sec['tipe']
    if tp == 'choukai': return None
    if tp == 'dokkai':
        pj = norm(d.get('passages', {}).get(it.get('pid'), {}).get('jp', '')) if it.get('pid') else ''
        return ('dokkai', norm(it['q']), pj, tuple(sorted(norm(x) for x in it['opts'])))
    if tp == 'kumitate': return ('kumitate', tuple(sorted(norm(x) for x in it['opts'])))
    q = re.sub(r'Pilih.*', '', norm(it['q'])); ans = norm(it['opts'][it['ans']])
    if tp in ('bunmyaku', 'keishiki', 'bunshou', 'settou'): return (tp, q)
    if tp == 'iikae': return (tp, re.sub(r'Pilih.*', '', re.sub(r'\s+', '', it['q'])))
    return ('kanji' if tp in ('yomi', 'hyouki') else tp, q, ans)
def order(f):
    b = os.path.basename(f); return (0 if b.startswith('full') else 1, b)
files = sorted(glob.glob(f'jlpt/{LVN}/*.json'), key=order)
files = [f for f in files if os.path.basename(f) != 'index.json']
docs = {f: json.load(open(f, encoding='utf8')) for f in files}
seen = set(); dups = []
for f in files:
    d = docs[f]
    for si, sec in enumerate(d['sections']):
        for ii, it in enumerate(sec['items']):
            k = key(d, sec, it)
            if k is None: continue
            badopt = len(set(norm(x) for x in it['opts'])) != len(it['opts'])
            if k in seen or badopt: dups.append((f, si, ii, sec['tipe']))
            else: seen.add(k)
print(LVN, 'duplikat:', len(dups), dict(collections.Counter(x[3] for x in dups)))
def rowkey(t, row):
    q = row[0]; ans = row[1] if t != 'yomi' else row[1]
    if t in ('yomi', 'hyouki'): return ('kanji', norm(plain(q)), norm(row[1] if t == 'yomi' else row[1]))
    if t == 'iikae': return ('iikae', re.sub(r'\s+', '', re.sub(r'\[(.+?)\]', r'<u>\1</u>', q)))
    if t in ('bunmyaku', 'keishiki', 'bunshou', 'settou'): return (t, norm(plain(q)))
    if t == 'youhou': return ('youhou', norm(q), norm(row[1]))
    return (t, norm(plain(q)), norm(row[1]))
pools = {}
_ex = os.path.join('tools', 'rw', LVN, 'dedupe_extra.py')
EXTRA = {}
if os.path.exists(_ex):
    import importlib.util as _iu
    _sp = _iu.spec_from_file_location('ex', _ex); _m = _iu.module_from_spec(_sp); _sp.loader.exec_module(_m)
    for _t, _v in g['VAR'].items():
        if hasattr(_m, _v): EXTRA[_t] = list(getattr(_m, _v))
fail = []
for f, si, ii, t in dups:
    if t in ('dokkai', 'kumitate'): fail.append((f, si, ii, t)); continue
    pool = pools.setdefault(t, EXTRA.get(t, []) + list(BANK.get(t, [])))
    new = None
    while pool:
        row = pool.pop(0)
        rk = rowkey(t, row)
        if rk in seen: continue
        try: new = build(t, 0, 0, row)
        except AssertionError: continue
        seen.add(rk); break
    if new is None: fail.append((f, si, ii, t)); continue
    sec = docs[f]['sections'][si]; old = sec['items'][ii]
    it = {k: old[k] for k in ('cat', 'tipe', 'tipe_jp', 'no', 'id') if k in old}; it.update(new); sec['items'][ii] = it
print('tidak terganti:', len(fail), dict(collections.Counter(x[3] for x in fail)))
for x in fail[:20]: print('  ', x[0].split('/')[-1], x[3], x[1], x[2])
if not DRY:
    for f in files: json.dump(docs[f], open(f, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
