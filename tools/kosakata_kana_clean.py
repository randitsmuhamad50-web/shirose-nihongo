#!/usr/bin/env python3
"""Bersihkan kolom `kana` kosakata JLPT jadi hiragana/katakana murni (tanpa kanji/spasi/tanda).
Sumber bacaan kanji: bracket [×yomi] di `kata`, ruby `漢字[よみ]` di contoh (milik entri sendiri dulu, lalu global),
majemuk di data/kanji-*.json. Pakai:  python3 tools/kosakata_kana_clean.py n5 [--write]"""
import json, re, sys, collections, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KJ = r'㐀-鿿々〆'
KJRE = re.compile(f'[{KJ}]')
KANA = re.compile(r'^[\u3041-\u3096\u30a1-\u30fa\u30fc、／]+$')
RUBY = re.compile(f'([{KJ}]+)\\[([^\\]]+)\\]')

def ruby_pairs(s):
    s = (s or '').replace(' ', '').replace('　', '')
    return [(a, b) for a, b in RUBY.findall(s) if KANA.match(b)]

def load(lv): return json.load(open(f'{ROOT}/data/kosakata-{lv}.json', encoding='utf8'))

def build_global():
    g = collections.defaultdict(collections.Counter)
    for lv in ['n5', 'n4', 'n3', 'n2', 'n1']:
        try: d = load(lv)
        except Exception: continue
        for w in d:
            for a, b in ruby_pairs(w.get('contoh', '')): g[a][b] += 1
        try: kj = json.load(open(f'{ROOT}/data/kanji-{lv}.json', encoding='utf8'))
        except Exception: kj = []
        for k in kj:
            for c in k.get('c', []):
                r = (c.get('r') or '').replace(' ', '')
                if KANA.match(r) and c.get('k') and not re.search(r'[^' + KJ + ']', c['k']): g[c['k']][r] += 2
    return g

def clean_kata(kata):
    """-> (bentuk bersih untuk dibaca, bacaan paksa dari [×yomi] atau None)"""
    k = kata
    def _f(m):
        ok, r = m.group(2), m.group(3)
        if ok and r.endswith(ok): return '\x01' + r + '\x02'
        return '\x01' + r + '\x02' + ok
    k = re.sub(f'([{KJ}]+)([\u3041-\u3096]*)\\[×([^\\]]+)\\]', _f, k)
    forced = '\x01' in k
    k = re.sub(r'\[\d+\]', '', k)
    return k, forced

def first_variant(s):
    return re.split(r'[・,，/／]| または ', s)[0].strip()

def strip_marks(s):
    s = re.sub(r'<[^>]+>', '', s)
    s = re.sub(r'[（(][^）)]*[）)]', '', s)
    s = re.sub(r'[＜<][^＞>]*[＞>]', '', s)
    s = re.sub(r'[〜～~。！？!?]', '', s)
    return s

def keep_lead(kana, kata):
    """（…）di depan kana: dipertahankan bila isinya bagian dari kata (お腹が空く), dibuang bila hanya opsional."""
    kn = re.sub(r'[（() ）\s]', '', kata)
    def f(m):
        c = m.group(1).replace(' ', '').replace('\u3000', '')
        return c if c and c in kn else ''
    return re.sub(r'^\s*[（(]([^）)]*)[）)]', f, kana)

def resolve1(w, g):
    kata, kana = w['kata'], keep_lead(w.get('kana', ''), w['kata'])
    k, forced = clean_kata(kata)
    if forced:
        r = re.sub('[\x01\x02]', '', re.sub(f'[{KJ}]+\x01', '', k).replace('\x01', '').replace('\x02', ''))
        # bentuk: kanji hilang, diganti yomi (sisanya okurigana)
        return strip_marks(re.sub(r'\x01([^\x02]+)\x02', r'\1', re.sub(f'[{KJ}]+(?=\x01)', '', k))).replace(' ', ''), True
    base = first_variant(strip_marks(kana)).replace(' ', '').replace('　', '')
    # buang sisa bracket/angka asing
    if KANA.match(base): return base, True
    own = {}
    for a, b in ruby_pairs(w.get('contoh', '')): own.setdefault(a, b)
    # token: runs kanji atau lainnya
    src = first_variant(strip_marks(k)).replace(' ', '')
    # pakai kana-field jika masih mengandung kanji; selain itu kata
    for cand in (base, src):
        if not KJRE.search(cand): 
            if cand and KANA.match(cand): return cand, True
            continue
        out = []; ok = True
        for part in re.findall(f'[{KJ}]+|[^{KJ}]+', cand):
            if KJRE.search(part[0]):
                rd = look(part, own, g)
                if rd is None: ok = False; break
                out.append(rd)
            else: out.append(part)
        res = ''.join(out)
        if ok and KANA.match(res): return res, True
    return None, False

def resolve(w, g):
    kata, kana = w['kata'], w.get('kana', '')
    SEP = r'[／/・,，]'
    kv = [x for x in re.split(SEP, re.sub(r'\[[^\]]*\]', '', kata)) if x.strip()]
    nv = [x for x in re.split(SEP, re.sub(r'<[^>]+>', '', kana)) if x.strip()]
    if len(kv) > 1 and len(kv) == len(nv):
        outs = []
        for a, b in zip(kv, nv):
            r, ok = resolve1({**w, 'kata': a, 'kana': b}, G_)
            if r is None: return None, False
            outs.append(r)
        outs = [o for i, o in enumerate(outs) if o not in outs[:i]]
        return '／'.join(outs), True
    return resolve1(w, G_)

G_ = None

def look(run, own, g):
    """segmentasi DP: potongan dari ruby milik entri (murah) atau global (mahal)."""
    n = len(run); INF = 1e9
    best = [(INF, None)] * (n + 1); best[0] = (0, [])
    for i in range(n):
        if best[i][0] >= INF: continue
        for j in range(i + 1, n + 1):
            seg = run[i:j]
            if seg in own: c, r = 0.1, own[seg]
            elif seg in g: c, r = 1.0 + (0.5 if j - i == 1 and False else 0), g[seg].most_common(1)[0][0]
            else: continue
            if best[i][0] + c < best[j][0]: best[j] = (best[i][0] + c, best[i][1] + [r])
    return ''.join(best[n][1]) if best[n][0] < INF else None

if __name__ == '__main__':
    lv = sys.argv[1]; write = '--write' in sys.argv
    OV = json.load(open(f'{ROOT}/tools/kosakata_kana_override.json', encoding='utf8')).get(lv, {}) if os.path.exists(f'{ROOT}/tools/kosakata_kana_override.json') else {}
    g = build_global(); globals()['G_'] = g; d = load(lv)
    changed = fail = 0; bad = []
    for w in d:
        if lv == 'n3' and re.search(r'[A-Za-z]{3}', w.get('kana', '')): continue
        r, ok = (OV[w['kata']], True) if w['kata'] in OV else resolve(w, g)
        if r is None: fail += 1; bad.append(w); continue
        if r != w.get('kana'): changed += 1; w['kana'] = r
    print(lv, 'total', len(d), 'berubah', changed, 'gagal', fail)
    for w in bad[:60]: print('  GAGAL', w['kata'], '|', w['kana'])
    if write:
        json.dump(d, open(f'{ROOT}/data/kosakata-{lv}.json', 'w', encoding='utf8'), ensure_ascii=False, separators=(',',':'))
