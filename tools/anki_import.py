#!/usr/bin/env python3
"""Sinkronkan data/kosakata-{n5,n4,n2,n1}.json dengan deck Anki sumber (Ankidrone Essentials V8 ID):
 - kana  = bacaan LENGKAP dari VocabFurigana (tanda [×x] di kata = "bukan bacaan x")
 - fr    = furigana per-kanji (ruby hanya di atas kanji, mis. 明[あか]るい)
 - kata benda-する ((する) / ＜する＞) → kata ditambah する, pos jadi kata kerja
Pakai: python3 tools/anki_import.py [n5 n4 n2 n1] [--write]   (butuh tools/anki_deck_extract.json)"""
import json, re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KANA = re.compile(r'^[ぁ-ゖァ-ヺー、／・]+$')
def txt(s): return re.sub(r'<[^>]+>', '', s or '').replace('&nbsp;', ' ').replace(' ', ' ').replace('　', ' ').strip()
SURU = re.compile(r'[（(＜<]\s*する\s*[）)＞>]')
NASURU = re.compile(r'[（(＜<]\s*な?\s*[／/]\s*する\s*[）)＞>]')
def norm_fr(fr, kata):
    """-> (fr bersih, suru?)"""
    fr = txt(fr); suru = False
    if NASURU.search(fr): fr = NASURU.sub('', fr)
    elif SURU.search(fr): suru = True; fr = SURU.sub('', fr)
    fr = re.sub(r'[（(＜<]\s*[なとに]?\s*[）)＞>]', '', fr)                 # (な) (と) (に)
    fr = re.sub(r'[（(＜<]\s*[^）)＞>]*さん\s*[）)＞>]', '', fr)               # (さん)
    fr = re.sub(r'^\s*[（(]\s*[おご]\s*[）)]\s*', '', fr)                       # (お) opsional
    kk = re.sub(r'\[[^\]]*\]', '', kata)
    keep = bool(re.search(r'[\u3400-\u9fff][にをがでと]', kk)) or bool(re.fullmatch(r'[\u3040-\u30ff]+', kk))
    fr = re.sub(r'[（(]([^）)]*)[）)]', (r'\1' if keep else ''), fr)                  # konteks (いすに) hanya bila kata memuatnya
    fr = re.sub(r'[＜＞<>]', '', fr)
    return fr.strip(), suru
def plain(fr): return re.sub(r'\s+', '', re.sub(r'\[[^\]]*\]', '', fr))
def reading(fr):
    r = re.sub(r'([^\s\[\]]+?)\[([^\]]+)\]', r'\2', fr)
    return re.sub(r'\s+', '', r)
KJ = r'\u3400-\u9fff々〆'
def okuri_ok(kata, rd):
    k = re.sub(r'\[[^\]]*\]', '', kata)
    k = re.split(r'[・/／]', k)[0]
    k = re.sub(r'[（(＜<][^）)＞>]*[）)＞>]', '', k).replace('〜', '').replace('～', '').strip()
    r = rd.split('・')[0]
    if not re.search(f'[{KJ}]', k): return True
    m = re.search(f'[{KJ}]([^{KJ}]*)$', k); suf = (m.group(1) if m else '').rstrip('。！？')
    m2 = re.match(f'^([^{KJ}]*)[{KJ}]', k); pre = m2.group(1) if m2 else ''
    if re.match(r'^[A-Za-z0-9０-９]', pre): pre = ''
    if suf and not r.endswith(suf): return False
    if pre and not r.startswith(pre) and not re.match(r'^[\u30a0-\u30ff]', pre): return False
    # setiap huruf kana pada kata harus muncul berurutan di bacaan (洗い物 → 'い' wajib ada)
    pos = 0; rr = hira(r)
    for ch in hira(re.sub(f'[{KJ}A-Za-z0-9０-９]', '', k)):
        j = rr.find(ch, pos)
        if j < 0: return False
        pos = j + 1
    return len(r) >= max(1, len(re.findall(f'[{KJ}]', k)))
def ruby_ok(fr, kata):
    k = re.sub(r'\[[^\]]*\]', '', kata).replace(' ', '')
    p = plain(fr)
    return p == k.split('・')[0] if '・' in k else p == k
def hira(s):
    return ''.join(chr(ord(c) - 0x60) if '\u30a1' <= c <= '\u30f6' else c for c in s)
def _h(s):
    return ''.join(chr(ord(c) - 0x60) if '\u30a1' <= c <= '\u30f6' else c for c in s)
def dedupe(rd):
    parts = rd.split('・'); out = []
    for x in parts:
        if x not in out: out.append(x)
    return '・'.join(out)
def main():
    deck = json.load(open(f'{ROOT}/tools/anki_deck_extract.json', encoding='utf8'))
    lvls = [a for a in sys.argv[1:] if a.startswith('n')] or ['n5', 'n4', 'n2', 'n1']
    for lv in lvls:
        L = deck[lv.upper()]; p = f'{ROOT}/data/kosakata-{lv}.json'
        d = json.load(open(p, encoding='utf8'))
        nk = ns = nf = 0; diffs = []; rej = []
        for a, w in zip(L, d):
            fr, suru = norm_fr(a['VocabFurigana'], w['kata'])
            rd = reading(fr) if fr else ''
            rd = rd.replace('・', '・')
            if rd and KANA.match(rd.replace('、', '')) and not re.search(r'[㐀-鿿]', rd):
                if not okuri_ok(w['kata'], rd):
                    rej.append((w['kata'], w['kana'], rd)); fr = ''
                else:
                    if rd != w['kana']: diffs.append((w['kata'], w['kana'], rd)); nk += 1
                    w['kana'] = rd
            else:
                fr = ''
            if fr and ruby_ok(fr, w['kata']) and re.search(r'\[', fr): w['fr'] = fr
            elif 'fr' in w: del w['fr']
            if suru and not w['kata'].endswith('する'):
                w['kata'] += 'する'; w['kana'] += 'する'
                if w.get('fr'): w['fr'] += 'する'
                w['pos'] = ['KK']; ns += 1
        OVP = f'{ROOT}/tools/kosakata_kana_override.json'
        OV = json.load(open(OVP, encoding='utf8')).get(lv, {}) if os.path.exists(OVP) else {}
        for w in d:
            if w['kata'] in OV: w['kana'] = OV[w['kata']]; w.pop('fr', None)
        bad = [(w['kata'], w['kana']) for w in d if not okuri_ok(w['kata'], w['kana']) and w['kata'] not in OV]
        print('   okurigana masih janggal:', len(bad), bad[:12])
        print(lv, 'kana disinkronkan', nk, '| kata+する', ns, '| ruby', sum(1 for w in d if w.get('fr')))
        print('   ditolak (cek okurigana):', len(rej)); [print('     REJ', x) for x in rej]
        if '-v' in sys.argv: [print('   ', x) for x in diffs]
        if '--write' in sys.argv: json.dump(d, open(p, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
main()
