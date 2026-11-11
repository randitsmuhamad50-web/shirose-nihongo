# -*- coding: utf-8 -*-
"""Tulis ulang kuis subbab Building Cleaning (cakupan penuh + pengecoh sulit). Pakai: python3 quiz_sub2.py bab1|bab2|bab3"""
import json, sys, random, importlib
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__file__), 'src', 'bc_quiz'))
P = 'data/ssw/building-cleaning/quiz.json'
from jpfill import F
def split(s):
    if '||' not in s and s in F: return s, F[s]
    if '||' in s: a, b = s.split('||', 1); return a.strip(), b.strip()
    return s, s
def build(qid, qjp, opts, eid, ejp):
    o = [split(x) for x in opts]
    ids = [x[0] for x in o]
    assert len(set(ids)) == len(ids), ('opsi ganda', qid)
    mb = len(o) == 2 and any(('Benar' in x or 'Salah' in x) for x in ids)
    if mb:
        if 'Salah' in ids[0]: o = o[::-1]; a = 1
        else: a = 0
    else:
        assert len(o) == 4, ('harus 4 opsi', qid)
        a = 0
    it = {'q': {'id': qid, 'jp': qjp}, 'opts': [{'id': x[0], 'jp': x[1]} for x in o], 'a': a, 'exp': {'id': eid, 'jp': ejp}}
    if mb: it['mb'] = True
    return it
def main(bab):
    mod = importlib.import_module(bab)
    d = json.load(open(P)); items_all = []
    for q in d['bab'][bab]:
        if q['id'].endswith('-q') and q.get('sub') in mod.D:
            new = [build(*t) for t in mod.D[q['sub']]]
            q['items'] = new; items_all += new
    # kuis bab = campuran dari semua subbab (acak tetap)
    rnd = random.Random(7); pool = items_all[:]; rnd.shuffle(pool)
    n = 8
    for i, q in enumerate([x for x in d['bab'][bab] if x['id'].startswith(bab + '-q')]):
        q['items'] = pool[i * n:(i + 1) * n]
    json.dump(d, open(P, 'w'), ensure_ascii=False, indent=1)
    print(bab, len(items_all), 'soal subbab; bab-quiz', [len(x['items']) for x in d['bab'][bab] if x['id'].startswith(bab + '-q')])
main(sys.argv[1])
