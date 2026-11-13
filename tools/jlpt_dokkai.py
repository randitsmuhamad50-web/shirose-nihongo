#!/usr/bin/env python3
"""Bangun paket latihan Dokkai (10 soal/level) -> jlpt/{lv}/dokkai-01.json + daftarkan ke jlpt/index.json (idempotent).
Sumber soal: tools/dokkai_src/{n5..n1}.py  (PASSAGES, QS)."""
import json, os, sys, importlib.util
H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(H, '..')
L = 'ABCD'
INSTR = "つぎの 文章を 読んで、しつもんに こたえて ください。答えは 1・2・3・4から いちばん いい ものを 一つ えらんで ください。"
DUR = {'n5': 15, 'n4': 20, 'n3': 25, 'n2': 30, 'n1': 35}
idx_path = os.path.join(ROOT, 'jlpt', 'index.json')
idx = json.load(open(idx_path, encoding='utf8'))
for lv in ['n5', 'n4', 'n3', 'n2', 'n1']:
    spec = importlib.util.spec_from_file_location('src_' + lv, os.path.join(H, 'dokkai_src', lv + '.py'))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    pid_id = f'{lv}-dokkai-01'
    passages = {pid: {'jenis': j, 'jp': jp, 'id': tr, 'info': False} for pid, (j, jp, tr) in m.PASSAGES.items()}
    items = []
    for n, (pid, q, opts, ans, alasan, bukti, wrong, poin) in enumerate(m.QS, 1):
        assert len(opts) == 4 and 0 <= ans < 4 and len(wrong) == 3 and pid in passages, (lv, n)
        assert len(set(opts)) == 4, (lv, n)
        wi = iter(wrong); lines = []
        for i, o in enumerate(opts):
            lines.append(f'{L[i]}. {o} — BENAR. {alasan}' if i == ans else f'{L[i]}. {o} — Salah. {next(wi)}')
        items.append({
            'cat': 'dokkai', 'tipe': 'dokkai', 'tipe_jp': '読解', 'pid': pid, 'q': q, 'opts': opts, 'ans': ans,
            'ex': {'jawaban': f'{L[ans]}. {opts[ans]}', 'terjemahan': passages[pid]['id'], 'alasan': alasan,
                   'bukti': bukti, 'opsi': lines, 'kosakata': None, 'poin': poin},
            'no': n, 'id': f'{pid_id}-q{n:02d}'})
    assert len(items) == 10, (lv, len(items))
    # urutkan agar soal satu bacaan berurutan
    jenis_set = []
    for pid in m.PASSAGES:
        if pid in {i['pid'] for i in items}: jenis_set.append(m.PASSAGES[pid][0])
    pkg = {'id': pid_id, 'lv': lv, 'jenis': 'dokkai', 'judul': 'Dokkai Practice 01', 'durasi': DUR[lv],
           'sections': [{'mondai': 1, 'tipe': 'dokkai', 'cat': 'dokkai', 'tipe_jp': '読解',
                         'judul': 'Pemahaman bacaan', 'instr': INSTR, 'items': items}],
           'passages': passages, 'jumlah': len(items)}
    json.dump(pkg, open(os.path.join(ROOT, 'jlpt', lv, 'dokkai-01.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    meta = {'id': pid_id, 'file': f'{lv}/dokkai-01.json', 'judul': 'Dokkai Practice 01', 'jumlah': len(items),
            'durasi': DUR[lv], 'mondai': [f'読解 ({len(items)})'] + sorted(set(jenis_set))}
    idx['level'][lv]['dokkai'] = [meta]
tot = 0
for lv in idx['level']:
    for j, lst in idx['level'][lv].items(): tot += sum(p['jumlah'] for p in lst)
idx['total_soal'] = tot if not isinstance(idx.get('total_soal'), dict) else idx['total_soal']
json.dump(idx, open(idx_path, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('ok', tot)
