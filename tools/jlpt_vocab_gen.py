#!/usr/bin/env python3
"""Bank soal yomi/hyouki otomatis dari contoh kalimat nyata di data/kosakata-<lv>.json (bukan karangan).
yomi : (kalimat dgn [kanji], bacaan, terjemahan)
hyouki: (kalimat dgn [kana], kanji, [3 salah], terjemahan) - salah = kata nyata sejenjang, bacaan beda."""
import json, re, os, random, hashlib
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
KANJI = re.compile(r'^[一-龥々]{2,4}$')
def parse(c):
    toks = []
    for m in re.finditer(r'([一-龥々]+)\[([ぁ-んー]+)\]|([^\[\]]+?)(?=[一-龥々]+\[|$)|([^\[\]]+)', c):
        pass
    pos = 0; out = []
    for m in re.finditer(r'([^\s\[\]、。！？「」・,.!?]*?)([一-龥々]+)\[([ぁ-んー]+)\]', c):
        pass
    # tokenizer sederhana
    i = 0; res = []; buf = ''
    while i < len(c):
        m = re.match(r'([一-龥々]+)\[([ぁ-んー]+)\]', c[i:])
        if m:
            if buf: res.append((buf, None)); buf = ''
            res.append((m.group(1), m.group(2))); i += m.end()
        else:
            buf += c[i]; i += 1
    if buf: res.append((buf, None))
    return res
ORDER = ['n5', 'n4', 'n3', 'n2', 'n1']
def allowed(lv):
    ks = set()
    for l in ORDER[:ORDER.index(lv) + 1]:
        try:
            for x in json.load(open(os.path.join(ROOT, 'data', f'kanji-{l}.json'), encoding='utf8')): ks.add(x['k'])
        except Exception: pass
    return ks
def build(lv, seed=7):
    AL = allowed(lv); ok = lambda t: all((not re.match(r'[一-龥々]', ch)) or ch in AL or ch == '々' for ch in t)
    d = json.load(open(os.path.join(ROOT, 'data', f'kosakata-{lv}.json'), encoding='utf8'))
    rr = random.Random(seed); Y = []; Hh = []; words = {}
    for w in d:
        k = w['kata']; r = w.get('kana', '')
        if KANJI.match(k) and re.match(r'^[ぁ-んー]+$', r) and ok(k): words[k] = r
    seen = set()
    for w in d:
        k = w['kata']; c = w.get('contoh', ''); tr = (w.get('arti_contoh') or '').strip()
        if k not in words or not c or not tr: continue
        toks = parse(c)
        toks = [(('方', r) if (t == '法' and r == 'ほう' and j and toks[j-1][0].rstrip().endswith('の')) else (t, r)) for j, (t, r) in enumerate(toks)]
        toks = [((r, None) if (r and t != k and not ok(t) and lv in ('n5', 'n4')) else (t, r)) for t, r in toks]
        plain = ''.join(t for t, _ in toks)
        if not (10 <= len(plain) <= 45) or plain.count('。') > 2: continue
        # target harus satu token berbacaan = bacaan kamus
        hit = [i for i, (t, r) in enumerate(toks) if t == k and r == words[k]]
        if len(hit) != 1 or k in seen: continue
        if '[' in plain or ']' in plain : continue
        # satu kalimat saja (ambil sampai 。 pertama jika ada dua)
        seen.add(k)
        if lv in ('n3', 'n2', 'n1'): toks = [(t.replace(' ', ''), r) for t, r in toks]
        qy = ''.join(('[' + t + ']') if j == hit[0] else t for j, (t, r) in enumerate(toks))
        qh = ''.join(('[' + words[k] + ']') if j == hit[0] else t for j, (t, r) in enumerate(toks))
        Y.append((qy, words[k], tr))
        same = [x for x in words if x != k and len(x) == len(k) and words[x] != words[k]]
        share = [x for x in same if set(x) & set(k)]
        pool = share[:]; rr.shuffle(pool)
        rest = [x for x in same if x not in share]; rr.shuffle(rest)
        wr = (pool + rest)[:3]
        if len(wr) == 3: Hh.append((qh, k, wr, tr))
    return Y, Hh
if __name__ == '__main__':
    import sys
    for lv in sys.argv[1:]:
        Y, H = build(lv); print(lv, len(Y), len(H)); print(Y[0], H[0])
