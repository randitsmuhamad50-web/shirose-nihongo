# -*- coding: utf-8 -*-
"""Parse Bunpou_N3 docx teks (/tmp/bunpou_docx.txt) -> /tmp/bunpou_raw.json"""
import re, json
L = [l for l in open('/tmp/bunpou_docx.txt', encoding='utf8').read().split('\n')]
items = []; cur = None; mode = None
for l in L:
    m = re.match(r'^(\d+)\.\s+(.*)$', l)
    if m and not l.startswith('Arti') and (cur is None or mode in (None, 'contoh', 'arti_contoh', 'rumus', 'simple', 'arti')):
        if cur is None or True:
            # heading only if next structured, else treat as normal text
            pass
    h = re.match(r'^(\d+)\.\s+(.+)$', l)
    if h and (mode in ('arti_contoh', 'contoh') or cur is None) and not re.match(r'^\d+\.\s*(KK|KB)', l):
        cur = {'no': int(h.group(1)), 'nama': h.group(2).strip(), 'arti': '', 'simple': '', 'rumus': [], 'contoh': '', 'arti_contoh': ''}
        items.append(cur); mode = 'head'; continue
    if cur is None: continue
    if l.startswith('Arti simple:'): cur['arti'] = l.split(':', 1)[1].strip(); mode = 'arti'
    elif l.startswith('Simple Bunpou:'): cur['simple'] = l.split(':', 1)[1].strip(); mode = 'simple'
    elif l.startswith('Rumus Bunpou:'): mode = 'rumus'
    elif l.startswith('Contoh:'): cur['contoh'] = l.split(':', 1)[1].strip(); mode = 'contoh'
    elif l.startswith('Arti contoh:'): cur['arti_contoh'] = l.split(':', 1)[1].strip(); mode = 'arti_contoh'
    elif mode == 'rumus': cur['rumus'].append(l)
    elif mode == 'simple': cur['simple'] += ' ' + l
    elif mode == 'contoh': cur['contoh'] += ' ' + l
    elif mode == 'arti_contoh': cur['arti_contoh'] += ' ' + l
json.dump(items, open('/tmp/bunpou_raw.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(len(items), [i['no'] for i in items][:5], items[-1]['no'])
