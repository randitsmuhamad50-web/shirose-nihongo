#!/usr/bin/env python3
"""Sumber data memotong bacaan jadi batang saja (行く→い, 食べる→た). Lengkapi dengan okurigana dari `kata`.
Pakai: python3 tools/kosakata_okuri_fix.py n5 [--write]"""
import json, re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KJ = r'㐀-鿿々〆'
def clean(k):
    k = re.sub(r'\[[^\]]*\]', '', k)
    k = re.sub(r'[（(][^）)]*[）)]', '', k)
    return k.replace('〜', '').replace('～', '').strip()
def fix_one(kata, kana):
    parts = [p for p in re.split(r'[・/／]', clean(kata)) if p]
    rds = kana.split('／')
    out = []
    for j, rd in enumerate(rds):
        k = parts[j] if j < len(parts) and len(parts) == len(rds) else (parts[0] if parts else '')
        m = re.search(f'[{KJ}]([^{KJ}]*)$', k)
        suf = m.group(1) if m else ''
        suf = suf.rstrip('。！？')
        if suf and re.fullmatch(r'[ぁ-ゖー]+', suf) and not rd.endswith(suf):
            # kana hanya batang: bila akhiran rd ≠ okurigana, tambahkan
            rd = rd + suf
        out.append(rd)
    return '／'.join(out)
if __name__ == '__main__':
    lv = sys.argv[1]; p = f'{ROOT}/data/kosakata-{lv}.json'
    d = json.load(open(p, encoding='utf8')); n = 0
    for w in d:
        r = fix_one(w['kata'], w['kana'])
        if r != w['kana']:
            n += 1
            if '-v' in sys.argv: print(w['kata'], w['kana'], '->', r)
            w['kana'] = r
    print(lv, 'okurigana dilengkapi', n)
    if '--write' in sys.argv: json.dump(d, open(p, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
