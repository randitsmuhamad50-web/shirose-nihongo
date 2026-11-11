# -*- coding: utf-8 -*-
"""Render halaman PDF modul → assets/ssw/<slug>/<lang>/pNN.webp (lebar 1000px), pola sama dengan Building Cleaning.
Pemakaian: python3 render_pages.py <pdf> <slug> <lang> [offset]
  offset = (nomor halaman PDF) - (nomor file). Bawaan 0 → file pNN = halaman PDF NN.
  File p01 selalu sampul (halaman PDF 1) agar "halaman 0" = sampul; nomor tampil = nomor file - 1."""
import sys, os
import pypdfium2 as pdfium
pdf, slug, lang = sys.argv[1:4]; off = int(sys.argv[4]) if len(sys.argv) > 4 else 0
out = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "ssw", slug, lang); os.makedirs(out, exist_ok=True)
doc = pdfium.PdfDocument(pdf); n = len(doc)
for i in range(n):
    f = 1 if i == 0 else (i + 1) - off
    if f < 1 or (i > 0 and f == 1): continue
    pg = doc[i]; w = pg.get_width()
    im = pg.render(scale=1000 / w).to_pil().convert("RGB")
    im.save(os.path.join(out, "p%02d.webp" % f), "WEBP", quality=62, method=4)
print("halaman:", n, "→", out)
