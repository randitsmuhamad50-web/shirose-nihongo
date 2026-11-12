#!/usr/bin/env python3
"""Buat data/jft/slide/{ir0,ir1,ir2}.pptx dari data/bunpou-ir*.json + data/kosakata-ir*.json (python-pptx)."""
import json, re, os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAMA = {'ir0': 'いろどり 入門 · A1', 'ir1': 'いろどり 初級1 · A2', 'ir2': 'いろどり 初級2 · A2'}
FONT = 'Meiryo'
def plain(s): return re.sub(r'\[[^\]]*\]', '', s or '')
def reading(s): return re.sub(r'([^\s\[\]]+?)\[([^\]]+)\]', r'\2', s or '')
BG = RGBColor(0x16, 0x14, 0x2b); FG = RGBColor(0xff, 0xff, 0xff); PK = RGBColor(0xff, 0x9f, 0xc8); GR = RGBColor(0xb9, 0xb6, 0xd6)
def slide(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6]); f = s.background.fill; f.solid(); f.fore_color.rgb = BG; return s
def tb(s, x, y, w, h, text, size, color=FG, bold=False, align=PP_ALIGN.LEFT):
    t = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h)); tf = t.text_frame; tf.word_wrap = True
    for i, line in enumerate(str(text).split('\n')):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph(); p.alignment = align
        r = p.add_run(); r.text = line; r.font.size = Pt(size); r.font.bold = bold; r.font.color.rgb = color; r.font.name = FONT
    return t
for lv in ('ir0', 'ir1', 'ir2'):
    bun = json.load(open(f'{ROOT}/data/bunpou-{lv}.json', encoding='utf8')); kos = json.load(open(f'{ROOT}/data/kosakata-{lv}.json', encoding='utf8'))
    prs = Presentation(); prs.slide_width = Inches(13.33); prs.slide_height = Inches(7.5)
    s = slide(prs); tb(s, 0.8, 2.6, 11.7, 1.5, NAMA[lv], 48, FG, True, PP_ALIGN.CENTER); tb(s, 0.8, 4.2, 11.7, 1, 'Slide bunpou & kosakata — Shirose Nihongo', 20, GR, False, PP_ALIGN.CENTER)
    for bab in sorted({x['bab'] for x in bun}):
        pols = [x for x in bun if x['bab'] == bab]; words = [x for x in kos if x.get('bab') == bab and x.get('kata') and x.get('kana') and x.get('arti')]
        s = slide(prs); tb(s, 0.8, 2.8, 11.7, 1.4, f'第{bab}課  Bab {bab}', 54, FG, True, PP_ALIGN.CENTER); tb(s, 0.8, 4.4, 11.7, 1, f'{len(pols)} pola · {len(words)} kata', 20, GR, False, PP_ALIGN.CENTER)
        for i in range(0, len(words), 8):
            s = slide(prs); tb(s, 0.6, 0.35, 12, 0.6, f'語彙 Kosakata — Bab {bab}', 22, PK, True)
            for k, w in enumerate(words[i:i + 8]):
                col, row = k % 2, k // 2
                x, y = 0.6 + col * 6.25, 1.3 + row * 1.5
                tb(s, x, y, 6, 0.6, plain(w['kata']), 28, FG, True); tb(s, x, y + 0.55, 6, 0.9, f"{w['kana']}\n{w['arti']}", 15, GR)
        for p in pols:
            s = slide(prs); tb(s, 0.6, 0.35, 12, 0.6, f'文型 Pola — Bab {bab}', 22, PK, True)
            tb(s, 0.8, 1.6, 11.7, 1.6, plain(p['pola']), 40, FG, True, PP_ALIGN.CENTER); tb(s, 1.2, 3.6, 10.9, 2.5, p.get('penjelasan') or p['arti'], 22, FG, False, PP_ALIGN.CENTER)
            if p.get('note'): tb(s, 1.2, 6.2, 10.9, 0.8, '💡 ' + p['note'], 16, GR, False, PP_ALIGN.CENTER)
            if p.get('contoh'):
                s = slide(prs); tb(s, 0.6, 0.35, 12, 0.6, f'例文 Contoh — Bab {bab}', 22, PK, True)
                tb(s, 0.8, 1.6, 11.7, 0.6, plain(p['pola']), 18, GR, False, PP_ALIGN.CENTER)
                tb(s, 0.8, 2.5, 11.7, 1.5, plain(p['contoh']), 38, FG, True, PP_ALIGN.CENTER)
                tb(s, 0.8, 3.9, 11.7, 0.8, reading(p['contoh']), 20, PK, False, PP_ALIGN.CENTER)
                tb(s, 0.8, 4.9, 11.7, 1, p.get('arti_contoh', ''), 22, GR, False, PP_ALIGN.CENTER)
    os.makedirs(f'{ROOT}/data/jft/slide', exist_ok=True); prs.save(f'{ROOT}/data/jft/slide/{lv}.pptx'); print(lv, len(prs.slides), 'slide')
