#!/usr/bin/env python3
"""Tulis ulang soal bahasa N5 di jlpt/n5/full-01..10.json dari bank manual tools/n5_rewrite/*.py
(yomi, hyouki, bunmyaku, iikae, keishiki, bunshou). Kumitate & dokkai & choukai tidak disentuh."""
import json, os, re, random, hashlib, sys, importlib.util
H = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(H, '..')
L = 'ABCD'
LV = sys.argv[1]
VAR = {'yomi': 'Y', 'hyouki': 'H', 'bunmyaku': 'M', 'iikae': 'I', 'keishiki': 'K', 'bunshou': 'S', 'youhou': 'U', 'settou': 'T', 'imi': 'G'}
def load(n, var):
    f = os.path.join(H, 'rw', LV, n + '.py')
    if not os.path.exists(f): return None
    sp = importlib.util.spec_from_file_location(n, f); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m)
    return getattr(m, var)
def load_all(n, var):
    out = list(load(n, var) or [])
    for i in range(2, 6):
        x = load(n + str(i), var + str(i)) if os.path.exists(os.path.join(H, 'rw', LV, n + str(i) + '.py')) else None
        if x: out += x
    seen = set(); res = []
    for r in out:
        if r[0] in seen: continue
        seen.add(r[0]); res.append(r)
    return res
BANK = {k: v for k, v in ((k, load_all(k, VAR[k])) for k in VAR) if v}
NEX = int(os.environ.get('NEX', '10'))
if os.environ.get('AUTO', '1') == '1':
    sys.path.insert(0, H)
    import jlpt_vocab_gen as _g
    _Y, _H = _g.build(LV)
    _hy = {r[1] for r in BANK.get('yomi', [])}; _hh = {r[1] for r in BANK.get('hyouki', [])}
    BANK['yomi'] = list(BANK.get('yomi', [])) + [r for r in _Y if r[1] not in _hy]
    BANK['hyouki'] = list(BANK.get('hyouki', [])) + [r for r in _H if r[1] not in _hh]
def u(s): return re.sub(r'\[(.+?)\]', r'<u>\1</u>', s)
def plain(s): return re.sub(r'\[(.+?)\]', r'\1', s)
SMALL = {'iikae': '<br><small>Pilih kalimat yang maknanya paling dekat dengan kalimat bergaris bawah.</small>'}
VOI = {'か':'が','き':'ぎ','く':'ぐ','け':'げ','こ':'ご','さ':'ざ','し':'じ','す':'ず','せ':'ぜ','そ':'ぞ','た':'だ','ち':'ぢ','て':'で','と':'ど','は':'ば','ひ':'び','ふ':'ぶ','へ':'べ','ほ':'ぼ',
       'が':'か','ぎ':'き','ぐ':'く','げ':'け','ご':'こ','ざ':'さ','じ':'し','ず':'す','ぜ':'せ','ぞ':'そ','だ':'た','で':'て','ど':'と','ば':'は','び':'ひ','ぶ':'ふ','べ':'へ','ぼ':'ほ'}
def distract(r, seed):
    rr = random.Random(seed); c = []
    for i, ch in enumerate(r):
        if ch in VOI: c.append(r[:i] + VOI[ch] + r[i+1:])
        if ch == 'っ': c.append(r[:i] + r[i+1:])
        if ch in 'ょゅゃ': c.append(r[:i] + {'ょ':'よ','ゅ':'ゆ','ゃ':'や'}[ch] + r[i+1:])
        if ch == 'う' and i > 0: c.append(r[:i] + r[i+1:])
        if ch in 'おこそとのほもよろごぞどぼぽょ' and i < len(r) - 1 and r[i+1:i+2] not in ('う', 'ゃ', 'ゅ', 'ょ', 'い'): c.append(r[:i+1] + 'う' + r[i+1:])
        if ch in 'いきしちにひみりぎじ' and r[i+1:i+2] not in ('い', 'ゃ', 'ゅ', 'ょ', 'う', 'え') and i < len(r) - 1: c.append(r[:i+1] + 'い' + r[i+1:])
        if ch in 'かさたはまやらわ' and i < len(r) - 1 and r[i+1:i+2] not in 'ゃゅょ': c.append(r[:i+1] + 'っ' + r[i+1:] if r[i+1] in 'かきくけこさしすせそたちつてとぱぴぷぺぽ' else r)
    c = [x for x in dict.fromkeys(c) if x != r and len(x) >= 2]
    rr.shuffle(c)
    if len(c) < 3:  # cadangan: ganti vokal pada satu mora / tukar dua mora
        ROWS = ['あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの', 'はひふへほ', 'まみむめも', 'らりるれろ', 'がぎぐげご', 'ざじずぜぞ', 'だぢづでど', 'ばびぶべぼ', 'ぱぴぷぺぽ', 'やゆよ']
        for i, ch in enumerate(r):
            for row in ROWS:
                if ch in row:
                    for v in row:
                        if v != ch: c.append(r[:i] + v + r[i+1:])
        rr.shuffle(c); c = [x for x in dict.fromkeys(c) if x != r]
    return c[:3]
def build(tipe, e, i, row):
    if tipe == 'yomi' and len(row) == 3:
        q, rd, tr = row; row = (q, rd, distract(rd, int(hashlib.md5(q.encode()).hexdigest()[:8], 16)), tr, '')
    if len(row) == 4: row = tuple(row) + ('',)
    q, ans, wrong, tr, note = row
    assert len(wrong) == 3 and ans not in wrong, (tipe, q)
    key = hashlib.md5((LV + tipe + q).encode()).hexdigest()
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
    elif tipe == 'youhou':
        al = f'Kata 「{q}」 dipakai dengan benar pada kalimat: {ans} ({tr}). {note}'
        why = lambda o: f'Pemakaian 「{q}」 di sini tidak wajar/keliru.'
        poin = 'Soal 用法: cek apakah kata cocok dengan kata lain dalam kalimat (kolokasi) dan maknanya wajar.'
        qq = f'<u>{q}</u><br><small>Pilih kalimat yang memakai kata bergaris bawah dengan paling tepat.</small>'
    elif tipe == 'settou':
        al = f'Imbuhan yang tepat adalah 「{ans}」. {note}'
        why = lambda o: 'Imbuhan ini tidak membentuk kata yang wajar di sini.'
        poin = 'Hafalkan imbuhan (非・不・無・未, 〜的, 〜化, 〜性) bersama kata yang lazim dipasangi.'
        qq = q
    else:  # keishiki, bunshou
        al = f'Jawaban benar 「{ans}」. {note}'
        why = lambda o: 'Tidak sesuai dengan tata bahasa/konteks kalimat ini.'
        poin = 'Perhatikan hubungan antar bagian kalimat: partikel, bentuk kata kerja, atau kata penghubung.'
        qq = q
    opsi = [f'{L[k]}. {o} — BENAR. {al.split(". ")[0]}.' if k == a else f'{L[k]}. {o} — Salah. {why(o)}' for k, o in enumerate(opts)]
    return {'q': qq, 'opts': opts, 'ans': a, 'ex': {'jawaban': f'{L[a]}. {opts[a]}', 'terjemahan': tr, 'alasan': al, 'opsi': opsi, 'kosakata': None, 'poin': poin}}
def main():
    for e in range(NEX):
        fp = os.path.join(ROOT, 'jlpt', LV, f'full-{e+1:02d}.json')
        if os.path.exists(fp): d = json.load(open(fp, encoding='utf8'))
        else:
            d = json.load(open(os.path.join(ROOT, 'jlpt', LV, 'full-01.json'), encoding='utf8'))
            d['id'] = f'{LV}-full-{e+1:02d}'; d['judul'] = f'JLPT {LV.upper()} Full Exam {e+1:02d}'
            d['sections'] = [s for s in d['sections'] if s['tipe'] in BANK or s['tipe'] == 'kumitate']; d['passages'] = {}; d['staging'] = True
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
    print(LV,'ok', {k: len(v) for k, v in BANK.items()})
main()
