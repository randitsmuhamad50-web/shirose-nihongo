#!/usr/bin/env python3
"""Ganti bacaan Dokkai di jlpt/{lv}/full-01..10.json dengan bank bacaan panjang (tools/dokkai_long/{lv}_*.py).
Bacaan 情報検索 (info) yang sudah ada dipertahankan; sisanya diganti. Jumlah soal tetap (target level).
Pakai: python3 tools/jlpt_dokkai_long.py n1 [n2 ...]"""
import json, os, sys, glob, random, hashlib, importlib.util
H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(H, '..')
L = 'ABCD'
PLAN = {  # urutan slot per ujian: (slot, jumlah bacaan)
 'n1': [('tan', 4), ('chu', 2), ('tou', 1), ('cho', 1)],
 'n2': [('tan', 4), ('chu', 2), ('tou', 1), ('cho', 1)],
 'n3': [('tan', 3), ('chu', 2), ('cho', 1)],
 'n4': [('tan', 3), ('chu', 2)],
 'n5': [('tan', 2), ('chu', 1)],
}
def bank(lv):
    out = {}
    for f in sorted(glob.glob(os.path.join(H, 'dokkai_long', lv + '_*.py'))):
        sp = importlib.util.spec_from_file_location('b', f); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m)
        for p in m.B: out.setdefault(p['slot'], []).append(p)
    return out
def br(s): return s.replace('\n', '<br>')
def apply(lv):
    bk = bank(lv); idx = json.load(open(os.path.join(ROOT, 'jlpt', 'index.json'), encoding='utf8'))
    for e in range(int(os.environ.get('NEX', '10'))):
        fp = os.path.join(ROOT, 'jlpt', lv, f'full-{e+1:02d}.json')
        d = json.load(open(fp, encoding='utf8'))
        if not any(s['cat'] == 'dokkai' for s in d['sections']):  # staging 11-20: salin kerangka dokkai dari full-01
            d0 = json.load(open(os.path.join(ROOT, 'jlpt', lv, 'full-01.json'), encoding='utf8'))
            d['sections'].append(next(s for s in d0['sections'] if s['cat'] == 'dokkai')); d['passages'] = dict(d0['passages'])
        sec = next(s for s in d['sections'] if s['cat'] == 'dokkai')
        target = len(sec['items'])
        keep = [it for it in sec['items'] if d['passages'][it['pid']].get('info')]
        kp = {it['pid'] for it in keep}
        room = target - len(keep)
        new = []  # (passage dict, [qs])
        for slot, cnt in PLAN[lv]:
            pool = bk.get(slot, [])
            if not pool: continue
            for i in range(cnt):
                new.append(pool[(e * cnt + i) % len(pool)])
        passages, items, n = {}, [], 0
        used = 0
        for p in new:
            qs = p['qs'][:max(0, room - used)]
            if not qs: continue
            n += 1; pid = f'p{n}'
            passages[pid] = {'jenis': p['jenis'], 'jp': br(p['jp']), 'id': p['id'].replace('\n', ' '), 'info': False}
            for (q, opts, ans, alasan, bukti, wrong, poin) in qs:
                assert len(opts) == 4 and len(wrong) == 3 and 0 <= ans < 4 and len(set(opts)) == 4, (lv, e, q)
                wi = iter(wrong)
                tag = [(o, i == ans, alasan if i == ans else next(wi)) for i, o in enumerate(opts)]
                rr = random.Random(int(hashlib.md5((lv + str(e % 3) + q).encode()).hexdigest()[:8], 16))
                rr.shuffle(tag)
                opts = [t[0] for t in tag]; ans = next(i for i, t in enumerate(tag) if t[1])
                lines = [f'{L[i]}. {t[0]} — BENAR. {t[2]}' if t[1] else f'{L[i]}. {t[0]} — Salah. {t[2]}' for i, t in enumerate(tag)]
                items.append({'cat': 'dokkai', 'tipe': 'dokkai', 'tipe_jp': '読解', 'pid': pid, 'q': q, 'opts': opts, 'ans': ans,
                              'ex': {'jawaban': f'{L[ans]}. {opts[ans]}', 'terjemahan': passages[pid]['id'], 'alasan': alasan,
                                     'bukti': bukti, 'opsi': lines, 'kosakata': None, 'poin': poin}})
            used += len(qs)
        # tambahkan 情報検索 yang dipertahankan
        for it in keep:
            old = it['pid']
            if not any(v.get('_o') == old for v in passages.values()):
                n += 1; pid = f'p{n}'; passages[pid] = dict(d['passages'][old]); passages[pid]['_o'] = old
            pid = next(k for k, v in passages.items() if v.get('_o') == old)
            it2 = dict(it); it2['pid'] = pid; items.append(it2)
        for v in passages.values(): v.pop('_o', None)
        if used < room:  # bank kurang: pertahankan sisa soal lama (tidak diganti)
            rest = [it for it in sec['items'] if it['pid'] not in kp][used:]
            for it in rest:
                n += 1; pid = f'p{n}'; passages[pid] = dict(d['passages'][it['pid']]); it2 = dict(it); it2['pid'] = pid; items.append(it2)
        assert len(items) == target, (lv, e, len(items), target)
        sec['items'] = items; d['passages'] = passages
        n = 0
        for s_ in d['sections']:
            for q in s_['items']:
                n += 1; q['no'] = n; q['id'] = f"{d['id']}-q{n:02d}"
        json.dump(d, open(fp, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    print(lv, 'ok', {k: len(v) for k, v in bk.items()})
if __name__ == '__main__':
    for lv in sys.argv[1:]: apply(lv)
