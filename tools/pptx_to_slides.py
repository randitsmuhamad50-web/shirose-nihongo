#!/usr/bin/env python3
"""PPTX Irodori → slide gambar + audio MP3 (untuk viewer JFT).
Pakai: python3 tools/pptx_to_slides.py FILE.pptx ID [--out data/jft/ppt]
Hasil: <out>/<ID>/s01.webp ... , a/<n>.mp3 (mono 40k), <ID>/m.json
  m.json = {"w":lebar,"h":tinggi,"slides":[{"img":"s01.webp","au":[{"src":"a/3.mp3","x":%,"y":%,"w":%,"h":%}]}]}"""
import sys, os, re, zipfile, subprocess, tempfile, json, shutil
from PIL import Image
src, ID = sys.argv[1], sys.argv[2]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(ROOT, (sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else 'data/jft/ppt'), ID)
os.makedirs(out + '/a', exist_ok=True)
z = zipfile.ZipFile(src)
W, H = map(int, re.search(r'<p:sldSz cx="(\d+)" cy="(\d+)"', z.read('ppt/presentation.xml').decode()).groups())
# urutan slide
pres = z.read('ppt/presentation.xml').decode(); prels = z.read('ppt/_rels/presentation.xml.rels').decode()
rid2t = dict(re.findall(r'<Relationship [^>]*?Id="([^"]+)"[^>]*?Target="([^"]+)"', prels)); rid2t.update({a: b for b, a in re.findall(r'<Relationship [^>]*?Target="([^"]+)"[^>]*?Id="([^"]+)"', prels)})
order = [rid2t[r] for r in re.findall(r'<p:sldId [^>]*r:id="([^"]+)"', pres)]
# render via LibreOffice
tmp = tempfile.mkdtemp()
subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir', tmp, src], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=900)
pdf = os.path.join(tmp, os.path.splitext(os.path.basename(src))[0] + '.pdf')
subprocess.run(['pdftoppm', '-r', '72', '-png', pdf, tmp + '/p'], check=True)
pngs = sorted(f for f in os.listdir(tmp) if f.startswith('p-') and f.endswith('.png'))
assert len(pngs) == len(order), (len(pngs), len(order))
done = {}
def audio(mpath):
    if mpath in done: return done[mpath]
    n = len(done) + 1; raw = f'{tmp}/m{n}.mp3'; open(raw, 'wb').write(z.read(mpath))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-vn', '-ac', '1', '-ar', '22050', '-b:a', '28k', f'{out}/a/{n}.mp3'], check=True)
    done[mpath] = f'a/{n}.mp3'; return done[mpath]
slides = []
for i, (sl, png) in enumerate(zip(order, pngs), 1):
    sp = 'ppt/' + sl.lstrip('./').replace('../', '') if not sl.startswith('/') else sl[1:]
    xml = z.read(sp).decode(); rels = z.read(sp.replace('slides/', 'slides/_rels/') + '.rels').decode()
    r = {}
    for m in re.finditer(r'<Relationship ([^>]*)/>', rels):
        a = m.group(1); r[re.search(r'Id="([^"]+)"', a).group(1)] = re.search(r'Target="([^"]+)"', a).group(1)
    au = []
    for pic in re.findall(r'<p:pic>.*?</p:pic>', xml, flags=re.S):
        if 'audioFile' not in pic and 'p14:media' not in pic: continue
        e = re.search(r'p14:media[^>]*r:embed="([^"]+)"', pic); l = re.search(r'audioFile r:link="([^"]+)"', pic)
        t = r.get(e.group(1)) if e else (r.get(l.group(1)) if l else None)
        xf = re.search(r'<a:off x="(-?\d+)" y="(-?\d+)"/><a:ext cx="(\d+)" cy="(\d+)"', pic)
        if not t or not xf: continue
        mp = 'ppt/' + t.replace('../', '')
        x, y, w, h = map(int, xf.groups())
        au.append({'src': audio(mp), 'x': round(100 * x / W, 2), 'y': round(100 * y / H, 2), 'w': round(100 * w / W, 2), 'h': round(100 * h / H, 2)})
    name = f's{i:02d}.webp'
    im = Image.open(f'{tmp}/{png}').convert('RGB'); im.save(f'{out}/{name}', 'WEBP', quality=72)
    slides.append({'img': name, 'au': au})
json.dump({'w': W, 'h': H, 'slides': slides}, open(f'{out}/m.json', 'w'), ensure_ascii=False, separators=(',', ':'))
shutil.rmtree(tmp, ignore_errors=True)
print(ID, len(slides), 'slide', len(done), 'audio', sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(out) for f in fs) // 1024, 'KB')
