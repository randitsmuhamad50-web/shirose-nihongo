#!/usr/bin/env python3
"""Tulis ulang soal bahasa N5 di jlpt/n5/full-01..10.json dari bank manual tools/n5_rewrite/*.py
(yomi, hyouki, bunmyaku, iikae, keishiki, bunshou). Kumitate & dokkai & choukai tidak disentuh."""
import json, os, re, random, hashlib, importlib.util
H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(H, '..')
L = 'ABCD'
def load(n, var):
    sp = importlib.util.spec_from_file_location(n, os.path.join(H, 'n5_rewrite', n + '.py')); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m)
    return getattr(m, var)
BANK = {'yomi': load('yomi', 'Y'), 'hyouki': load('hyouki', 'H'), 'bunmyaku': load('bunmyaku', 'M'),
        'iikae': load('iikae', 'I'), 'keishiki': load('keishiki', 'K'), 'bunshou': load('bunshou', 'S')}
def u(s): return re.sub(r'\[(.+?)\]', r'<u>\1</u>', s)
def plain(s): return re.sub(r'\[(.+?)\]', r'\1', s)
SMALL = {'iikae': '<br><small>Pilih kalimat yang maknanya paling dekat dengan kalimat bergaris bawah.</small>'}
def build(tipe, e, i, row):
    q, ans, wrong, tr, note = row
    key = hashlib.md5((tipe + q).encode()).hexdigest()
    rr = random.Random(int(key[:8], 16))
    tag = [(ans, True)] + [(w, False) for w in wrong]; rr.shuffle(tag)
    opts = [t[0] for t in tag]; a = next(i for i, t in enumerate(tag) if t[1])
    if tipe == 'yomi':
        target = re.search(r'\[(.+?)\]', q).group(1)
        al = f'「{target}」 dibaca 「{ans}」. {note}'
        why = lambda o: f'Bukan bacaan yang benar untuk 「{target}」. Bacaan yang benar: 「{ans}」.'
        poin = 'Hafalkan bacaan kanji sebagai bagian kata utuh, perhatikan bunyi panjang, dakuten, dan っ kecil.'
        qq = u(q)
    elif tipe == 'hyouki':
        target = re.search(r'\[(.+?)\]', q).group(1)
        al = f'「{target}」 ditulis 「{ans}」. {note}'
        why = lambda o: f'Penulisan keliru: kanji yang mirip/berbeda makna. Yang benar: 「{ans}」.'
        poin = 'Perhatikan bentuk kanji yang mirip (mis. 大/犬/太, 白/百/自) dan pastikan artinya cocok dengan kata.'
        qq = u(q)
    elif tipe == 'iikae':
        al = f'Kalimat bergaris bawah bermakna: {tr} Pilihan yang benar mengungkapkan makna yang sama. {note}'
        why = lambda o: 'Maknanya berbeda dari kalimat bergaris bawah.'
        poin = 'Pahami arti kalimat asli, lalu cari pilihan yang artinya sama (bukan yang hanya mirip kata-katanya).'
        qq = u(q) + SMALL['iikae']
    elif tipe == 'bunmyaku':
        al = f'Kalimat ini bermakna: {tr} Kata yang paling pas adalah 「{ans}」. {note}'
        why = lambda o: f'Tidak cocok dengan makna kalimat: {tr}'
        poin = 'Baca seluruh kalimat dulu, lalu pilih kata yang paling wajar secara makna dan kolokasi.'
        qq = q
    else:  # keishiki, bunshou
        al = f'Jawaban benar 「{ans}」. {note}'
        why = lambda o: 'Tidak sesuai dengan tata bahasa/konteks kalimat ini.'
        poin = 'Perhatikan hubungan antar bagian kalimat: partikel, bentuk kata kerja, atau kata penghubung.'
        qq = q
    opsi = [f'{L[k]}. {o} — BENAR. {al.split(". ")[0]}.' if k == a else f'{L[k]}. {o} — Salah. {why(o)}' for k, o in enumerate(opts)]
    return {'q': qq, 'opts': opts, 'ans': a, 'ex': {'jawaban': f'{L[a]}. {opts[a]}', 'terjemahan': tr, 'alasan': al, 'opsi': opsi, 'kosakata': None, 'poin': poin}}
def main():
    for e in range(10):
        fp = os.path.join(ROOT, 'jlpt', 'n5', f'full-{e+1:02d}.json')
        d = json.load(open(fp, encoding='utf8'))
        for s in d['sections']:
            t = s['tipe']
            if t not in BANK: continue
            pool = BANK[t]; n = len(s['items']); items = []
            for i, old in enumerate(s['items']):
                row = pool[(e * n + i) % len(pool)]
                new = build(t, e, i, row)
                it = {k: old[k] for k in ('cat', 'tipe', 'tipe_jp') if k in old}; it.update(new); items.append(it)
            s['items'] = items
        k = 0
        for s in d['sections']:
            for q in s['items']:
                k += 1; q['no'] = k; q['id'] = f"{d['id']}-q{k:02d}"
        json.dump(d, open(fp, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    print('ok', {k: len(v) for k, v in BANK.items()})
main()
