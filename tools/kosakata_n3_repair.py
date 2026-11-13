#!/usr/bin/env python3
"""Perbaiki baris n3 yang kolomnya bergeser (kana berisi bahasa Indonesia). Kata JP utuh → arti disusun ulang dari
potongan Indonesia; kata sudah Indonesia (JP hilang di sumber) → baris dibuang (nomor `no` baris lain tetap)."""
import json, re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = f'{ROOT}/data/kosakata-n3.json'
d = json.load(open(P, encoding='utf8'))
JP = re.compile(r'[぀-ヿ㐀-鿿]')
out = []; fixed = dropped = 0
for w in d:
    kana = w.get('kana', ''); kata = w['kata']
    kana_bad = bool(re.search(r'[A-Za-z]{3}', kana)) and not JP.search(kana.replace('<b>', ''))
    if re.search(r'[A-Za-z]{3}', kata) and not JP.search(kata):
        dropped += 1; continue
    if kana_bad or re.search(r'<[^>]+>', kana):
        k = re.sub(r'<[^>]+>', '', kana)
        if kana_bad:
            ind = re.sub(r'[぀-ヿ㐀-鿿　]+', ' ', (kana + ' ' + w['arti'])).strip()
            ind = re.sub(r'\s+', ' ', ind)
            w['arti'] = ind
            w['kana'] = ''           # diisi resolver
        else:
            w['kana'] = k
        fixed += 1
    w['arti'] = re.sub(r'<[^>]+>', '', w['arti']).strip()
    out.append(w)
json.dump(out, open(P, 'w', encoding='utf8'), ensure_ascii=False, separators=(',',':'))
print('n3 diperbaiki', fixed, 'dibuang', dropped, 'sisa', len(out))
