#!/usr/bin/env python3
"""Tambah bentuk ます & golongan ke kata kerja (pos KK) kosakata JLPT.
Field baru: g (1=godan, 2=ichidan, 3=tak beraturan), km (kata ます), ms (bacaan ます), fm (furigana ます).
Pakai: python3 tools/kosakata_masu.py n5 n4 [--write] [-v]"""
import json, re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
U = 'うくぐすつぬぶむる'
I_ROW = {'う': 'い', 'く': 'き', 'ぐ': 'ぎ', 'す': 'し', 'つ': 'ち', 'ぬ': 'に', 'ぶ': 'び', 'む': 'み', 'る': 'り'}
EI = set('いきしちにひみりぎじびぴえけせてねへめれげぜでべぺ')
# る-akhiran golongan 1 meski sebelum る = bunyi i/e (berdasar kanji kata)
GODAN_RU = ['帰る', '入る', '切る', '知る', '走る', '要る', '参る', '減る', '滑る', '握る', '限る', '蹴る', '喋る', '散る', '照る', '焦る', '捻る', '練る', '返る', '遮る', '陥る', '蘇る', '茂る', '罵る', '混じる', '交じる', '翻る', '覆る', '弄る', '煎る', '炒る', '嘲る', '湿る', '捩る', '抉る', '詰る', '千切る', '蔑る']
GODAN_RU_KANA = ['しゃべる', 'いじる', 'ける', 'へる']      # kata tanpa kanji
# pos KK salah tag (bukan kata kerja) → dilewati
BUKAN_VERBA = {'お早う', '有り難う', '宜しく', '良く[1]', '良く[2]', '幾つ[1]', '幾つ[2]', '御目出度う', '真っ直ぐ', 'もう直ぐ[1]', 'もう直ぐ[2]', '直ぐ', '何時も', '早く', '近く', '遠く', '暫く', '向こう'}
HONOR = ['いらっしゃる', 'おっしゃる', 'くださる', 'なさる', 'ござる']  # → ～います
def split_tail(s):
    m = re.match(r'^(.*?)((?:\[\d+\])?)$', s); return m.group(1), m.group(2)
def grup(kata, kana):
    k, _ = split_tail(kata); k = k.split('・')[0]; r = kana.split('・')[0]
    if r.endswith('する') and (k.endswith('する') or k.endswith('為る')): return 3
    if r.endswith('くる') and (k.endswith('来る') or k == 'くる' or k.endswith('て来る') or k.endswith('てくる')): return 3
    if any(r.endswith(h) for h in HONOR): return 1
    if r[-1] != 'る': return 1
    if any(k.endswith(x) for x in GODAN_RU): return 1
    if k == r and any(r.endswith(x) for x in GODAN_RU_KANA): return 1
    return 2 if len(r) >= 2 and r[-2] in EI else 1
def conj1(s, g, r_hint):
    """s: kata/kana/fr berakhir bentuk kamus → ます"""
    if not s: return s
    if g == 3:
        if s.endswith('する'): return s[:-2] + 'します'
        if s.endswith(']る') or s.endswith('来る') or s.endswith('為る'): return s[:-1] + 'ます'
        if s.endswith('くる'): return s[:-2] + 'きます'
        return None
    if s[-1] not in U: return None
    if g == 2: return s[:-1] + 'ます'
    if r_hint == 'honor': return s[:-1] + 'います'
    return s[:-1] + I_ROW[s[-1]] + 'ます'
def masu(w):
    kata, tail = split_tail(w['kata']); g = grup(kata, w['kana'])
    kv = kata.split('・'); rv = w['kana'].split('・'); fv = (w.get('fr') or '').split('・')
    hon = 'honor' if any(w['kana'].split('・')[0].endswith(h) for h in HONOR) else ''
    def T(s):
        c = conj1(s, g, hon)
        return c
    km = [T(x) for x in kv]; ms = [T(x) for x in rv]
    if None in km or None in ms: return None
    # 来る: bacaan fr 来[く]る → 来[き]ます, kana くる → きます
    fm = None
    if w.get('fr'):
        fm = [T(x) for x in fv]
        fm = [re.sub(r'来\[く\]ます$', '来[き]ます', x) if x else x for x in fm]
        if None in fm: fm = None
    out = {'g': g, 'km': '・'.join(km) + tail, 'ms': '・'.join(ms)}
    if fm: out['fm'] = '・'.join(fm)
    return out
if __name__ == '__main__':
    lvls = [a for a in sys.argv[1:] if a.startswith('n')]
    for lv in lvls:
        p = f'{ROOT}/data/kosakata-{lv}.json'; d = json.load(open(p, encoding='utf8')); n = 0; skip = []
        for w in d:
            for k in ('g', 'km', 'ms', 'fm'): w.pop(k, None)
            if 'KK' not in w.get('pos', []): continue
            if w['kata'] in BUKAN_VERBA: continue
            r = w['kana'].split('・')[0]
            if not (r[-1] in U or r.endswith('する')): continue
            m = masu(w)
            if m: w.update(m); n += 1
            else: skip.append((w['kata'], w['kana']))
        print(lv, 'kata kerja', n, 'dilewati', skip)
        if '-v' in sys.argv:
            for w in d:
                if w.get('ms'): print(f"  g{w['g']} {w['kata']} {w['kana']} → {w['km']} {w['ms']}")
        if '--write' in sys.argv: json.dump(d, open(p, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
