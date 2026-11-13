#!/usr/bin/env python3
"""Ubah pilihan soal 言い換え類義 dari bahasa Indonesia ke bahasa Jepang (idempotent).
Distraktor = kata Jepang dari ex.opsi ("makna kata lain: 「X」"), jawaban benar = sinonim/parafrasa di tools/iikae_syn.txt."""
import json, glob, re, sys, os
H = os.path.dirname(os.path.abspath(__file__))
syn = {}
for l in open(os.path.join(H, 'iikae_syn.txt'), encoding='utf8'):
    l = l.rstrip('\n')
    if '|' in l:
        k, v = l.split('|', 1); syn[k] = v
L = 'ABCD'
pat = re.compile(r'「([^」]+)」（([^）]*)）')
bad = 0; n = 0
for f in sorted(glob.glob(os.path.join(H, '..', 'jlpt', '*', '*.json'))):
    d = json.load(open(f, encoding='utf8'))
    if not (isinstance(d, dict) and 'sections' in d): continue
    ch = False
    for s in d['sections']:
        for it in s['items']:
            if it.get('tipe') != 'iikae' or it.get('jp'): continue
            k = it['ref']['kata']; a = it['ans']
            if k not in syn: bad += 1; print('NOSYN', it['id'], k); continue
            indo = list(it['opts']); ex = it['ex']
            new = []; okx = True
            for i, line in enumerate(ex['opsi']):
                if i == a:
                    new.append(syn[k]); continue
                m = pat.search(line)
                if not m: okx = False; break
                new.append(m.group(1))
            if not okx or len(new) != 4 or len(set(new)) != 4:
                bad += 1; print('SKIP', it['id'], k, new); continue
            rd = re.search(r'（([^）]*)）', ex['opsi'][a])
            tr = pat.findall(ex['opsi'][a])
            rd_t = ''
            m2 = re.search(r'sama dengan 「([^」]+)」（([^）]*)）', ex['opsi'][a])
            tgt = f'「{m2.group(1)}」（{m2.group(2)}）' if m2 else f'「{k}」'
            it['opts'] = new
            ex['jawaban'] = f'{L[a]}. {syn[k]}'
            lines = []
            for i, line in enumerate(ex['opsi']):
                if i == a:
                    lines.append(f'{L[i]}. 「{new[i]}」 — BENAR. Maknanya sama dengan {tgt} (arti: "{indo[i]}").')
                else:
                    m = pat.search(line)
                    lines.append(f'{L[i]}. 「{new[i]}」 — Salah. Ini kata lain: {m.group(0)}; artinya "{indo[i]}".')
            ex['opsi'] = lines
            al = ex['alasan']
            al = re.sub(r'Ungkapan yang paling dekat maknanya adalah ".*"\.?$', f'Ungkapan Jepang yang paling dekat maknanya adalah 「{syn[k]}」 (arti: "{indo[a]}").', al)
            ex['alasan'] = al
            it['jp'] = True; ch = True; n += 1
    if ch: json.dump(d, open(f, 'w', encoding='utf8'), ensure_ascii=False, separators=(',',':'))
print('converted', n, 'bad', bad)
