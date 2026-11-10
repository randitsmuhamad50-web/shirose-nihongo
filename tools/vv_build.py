#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Shirose Nihongo — pembuat voice pack VOICEVOX.

Butuh: VOICEVOX (app atau engine) berjalan di http://127.0.0.1:50021, Python 3, dan ffmpeg.
Pemakaian (jalankan dari folder root repo):
    python tools/vv_build.py test                       # 10 contoh suara -> audio/vv/test/
    python tools/vv_build.py choukai n5 n4 n3 n2 n1     # audio Choukai (semua paket)
    python tools/vv_build.py choukai n5 --paket 2 3     # paket tertentu saja
    python tools/vv_build.py materi n5                  # kosakata, kanji, bunpou N5
    python tools/vv_build.py materi n5 --only kosakata kanji kanji-contoh bunpou-contoh kosakata-contoh

File yang sudah ada dilewati, jadi aman dijalankan ulang kalau terhenti.
"""
import json, os, sys, io, wave, struct, subprocess, urllib.request, urllib.parse, hashlib, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENGINE = os.environ.get("VOICEVOX_URL", "http://127.0.0.1:50021")
CFG = json.load(open(os.path.join(ROOT, "audio", "vv", "voices.json"), encoding="utf-8"))
VOICES = CFG["voices"]
RATE = 24000
LEVEL_SPEED = {"n5": .88, "n4": .93, "n3": .98, "n2": 1.0, "n1": 1.04}

def _req(path, data=None, ctype=None):
    for attempt in range(30):
        try:
            req = urllib.request.Request(ENGINE + path, data=data, method="POST")
            if ctype: req.add_header("Content-Type", ctype)
            return urllib.request.urlopen(req, timeout=120).read()
        except Exception as e:
            if attempt == 29: raise
            print("  engine belum siap, coba lagi…", type(e).__name__, flush=True); time.sleep(5)

_speakers = None
def style_id(vkey):
    """Cari ID gaya dari nama karakter (aman bila ID berubah antar versi engine)."""
    global _speakers
    if _speakers is None:
        _speakers = json.loads(urllib.request.urlopen(ENGINE + "/speakers", timeout=30).read())
    v = VOICES[vkey]
    for sp in _speakers:
        if sp["name"] == v["name"]:
            for st in sp["styles"]:
                if st["name"] == v["style"]: return st["id"]
            return sp["styles"][0]["id"]
    raise SystemExit(f"Karakter {v['name']} tidak ditemukan di VOICEVOX. Pastikan sudah terpasang.")

def synth(text, vkey, speed=1.0):
    """Kembalikan sampel int16 mono 24 kHz (bytes)."""
    v = VOICES[vkey]; sid = style_id(vkey)
    q = json.loads(_req(f"/audio_query?speaker={sid}&text=" + urllib.parse.quote(text)))
    q["speedScale"] = round(v.get("speed", 1.0) * speed, 3)
    q["pitchScale"] = v.get("pitch", 0.0)
    q["intonationScale"] = v.get("intonation", 1.0)
    q["volumeScale"] = v.get("volume", 1.0)
    q["prePhonemeLength"] = 0.05; q["postPhonemeLength"] = 0.08
    q["outputSamplingRate"] = RATE; q["outputStereo"] = False
    wav = _req(f"/synthesis?speaker={sid}", json.dumps(q).encode(), "application/json")
    with wave.open(io.BytesIO(wav)) as w:
        return w.readframes(w.getnframes())

def silence(sec): return b"\x00\x00" * int(RATE * sec)

def to_mp3(pcm, out):
    os.makedirs(os.path.dirname(out), exist_ok=True)
    p = subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "s16le", "-ar", str(RATE), "-ac", "1", "-i", "-",
                        "-c:a", "libmp3lame", "-b:a", "48k", out], input=pcm)
    if p.returncode: raise SystemExit("ffmpeg gagal. Pastikan ffmpeg terpasang (winget install ffmpeg).")

def log(*a): print(time.strftime("%H:%M:%S"), *a, flush=True)

# ---------------- TEST 10 VOICES ----------------
SAMPLE = "こんにちは。シロセ日本語へようこそ。一緒に日本語を勉強しましょう。"
def cmd_test(_):
    for k, v in VOICES.items():
        out = os.path.join(ROOT, "audio", "vv", "test", f"{k}.mp3")
        to_mp3(silence(.1) + synth(SAMPLE, k) + silence(.2), out)
        log("OK", k, v["name"], "→", os.path.relpath(out, ROOT))

# ---------------- CHOUKAI ----------------
def cmd_choukai(levels):
    """Paket 1 (choukai/jlpt-{lvl}.json) + semua paket di choukai/paket/{lvl}-p*.json.
    Tambah --paket 2 3 untuk membuat paket tertentu saja (1 = paket asli)."""
    import glob
    only = None
    if "--paket" in levels:
        i = levels.index("--paket"); only = {int(x) for x in levels[i + 1:]}; levels = levels[:i]
    for lvl in levels:
        files = [(1, os.path.join(ROOT, "choukai", f"jlpt-{lvl}.json"))]
        for f in sorted(glob.glob(os.path.join(ROOT, "choukai", "paket", f"{lvl}-p*.json")),
                        key=lambda x: int(x.rsplit("-p", 1)[1].split(".")[0])):
            files.append((int(f.rsplit("-p", 1)[1].split(".")[0]), f))
        for pk, f in files:
            if only and pk not in only: continue
            print(f"== {lvl.upper()} paket {pk}", flush=True)
            _choukai_file(lvl, json.load(open(f, encoding="utf-8")))

def _choukai_file(lvl, d):
        sp = LEVEL_SPEED[lvl]
        for sec in d["sections"]:
            out = os.path.join(ROOT, sec["instrAudio"])
            if not os.path.exists(out):
                to_mp3(silence(.2) + synth(sec["instr"], sec.get("instrVoice", "aoyama"), sp) + silence(.4), out)
            for it in sec["items"]:
                out = os.path.join(ROOT, it["audio"])
                if os.path.exists(out): continue
                pcm = silence(.3)
                for i, l in enumerate(it["script"]):
                    pcm += synth(l["t"], it["voices"][l["s"]], sp)
                    nxt = it["script"][i + 1]["s"] if i + 1 < len(it["script"]) else None
                    pcm += silence(1.0 if l["s"] == "N" or nxt == "N" else 0.45)
                to_mp3(pcm, out)
                log("choukai", it["id"])

# ---------------- MATERI (sprite per 50 klip) ----------------
import re
_RUBY = re.compile(r"[\u3005\u4e00-\u9fff\u30f6]+\[([^\]]+)\]")
def clean_say(t):
    """'私[わたし]は 学生[がくせい]だ。' -> 'わたしは学生だ。' (bacaan dalam kurung dipakai, tidak dibaca dua kali)."""
    t = _RUBY.sub(lambda m: m.group(1), t or "")
    t = re.sub(r"\[[^\]]*\]", "", t)
    return re.sub(r"\s+", "", t)

def materi_jobs(lvl):
    """(kategori, kunci teks yang dipakai situs, teks yang dibacakan, voice)."""
    R = CFG["roles"]; jobs = {}
    def add(cat, key, say):
        key = (key or "").strip(); say = clean_say(say or key)
        if key and key not in jobs.setdefault(cat, {}): jobs[cat][key] = say
    import re as _re
    def _plain_ruby(t): return _re.sub(r"\{([^|{}]+)\|([^{}]+)\}", r"\2", t or "").replace("**", "")
    if lvl == "kana":
        kd = json.load(open(os.path.join(ROOT, "data", "kana.json"), encoding="utf-8"))
        for ck, c in kd["chars"].items():
            add("kosakata", ck.split(":", 1)[1], None)
            if c.get("w"): add("kosakata", c["w"], None)
        kb = json.load(open(os.path.join(ROOT, "data", "kana-baca.json"), encoding="utf-8"))
        for grp in ("hira", "kata"):
            for w in kb[grp]: add("kosakata", w["k"], None)
        src = open(os.path.join(ROOT, "js", "kana-center.js"), encoding="utf-8").read()
        for m in _re.findall(r'eg\("([^"]+)"', src): add("kosakata", m, None)
        return {cat: (R[cat], items) for cat, items in jobs.items()}
    def _load(name):
        # level pseudo (mis. "ssw-bc") hanya punya kosakata; file kanji/bunpou boleh tidak ada.
        pth = os.path.join(ROOT, "data", f"{name}-{lvl}.json")
        if not os.path.exists(pth) and lvl.startswith("ssw-"): return []
        return json.load(open(pth, encoding="utf-8"))
    for it in _load("kosakata"):
        kata = it.get("kata") or it.get("k") or ""; kana = it.get("kana") or it.get("f") or ""
        add("kosakata", kata, kana or kata)
        add("kosakata-contoh", it.get("contoh") or it.get("ej") or "", None)
    for it in _load("kanji"):
        add("kanji", it.get("kanji") or it.get("k"), None)
        for c in it.get("c") or []: add("kanji-contoh", c.get("k"), c.get("r") or c.get("k"))
    for it in _load("bunpou"):
        add("bunpou-contoh", it.get("contoh") or "", None)
    if lvl.startswith("ssw-"):
        # judul bab/subbab yang bisa diputar (kunci = teks JP dengan furigana → bacaan, sama dengan yang dikirim situs)
        import glob
        for f in sorted(glob.glob(os.path.join(ROOT, "data", "ssw", "building-cleaning", "bab*.json"))):
            b = json.load(open(f, encoding="utf-8"))["bab"]
            add("kosakata-contoh", _plain_ruby(b["title"]["jp"]), None)
            for sb in b["subs"]: add("kosakata-contoh", _plain_ruby(sb["title"]["jp"]), None)
    return {cat: (R[cat], items) for cat, items in jobs.items()}

def cmd_materi(args):
    only = []
    if "--only" in args:
        i = args.index("--only"); only = args[i + 1:]; args = args[:i]
    PER, GAP = 50, 0.5
    for lvl in args:
        jobs = materi_jobs(lvl)
        order = [c for c in (only or ["kosakata", "kanji", "kanji-contoh", "bunpou-contoh", "kosakata-contoh"]) if c in jobs]
        for cat in order:
            vkey, items = jobs[cat]
            base = os.path.join(ROOT, "audio", "vv", lvl, cat)
            idx_path = base + ".json"
            index = json.load(open(idx_path, encoding="utf-8")) if os.path.exists(idx_path) else {"voice": vkey, "clips": {}}
            keys = list(items.keys())
            for s in range(0, len(keys), PER):
                n = s // PER; out = os.path.join(base, f"{n:03d}.mp3")
                chunk = keys[s:s + PER]
                if os.path.exists(out) and all(k in index["clips"] for k in chunk): continue
                pcm = silence(GAP); pos = GAP
                for k in chunk:
                    a = synth(items[k], vkey, CFG.get("materiSpeed", {}).get(cat, 1.0))
                    dur = len(a) / 2 / RATE
                    index["clips"][k] = [n, round(pos, 3), round(dur, 3)]
                    pcm += a + silence(GAP); pos += dur + GAP
                to_mp3(pcm, out)
                json.dump(index, open(idx_path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
                log(lvl, cat, f"{min(s + PER, len(keys))}/{len(keys)}")

if __name__ == "__main__":
    if len(sys.argv) < 2: print(__doc__); sys.exit(0)
    try: urllib.request.urlopen(ENGINE + "/version", timeout=5)
    except Exception: raise SystemExit(f"VOICEVOX belum jalan di {ENGINE}. Buka aplikasi VOICEVOX dulu.")
    {"test": cmd_test, "choukai": cmd_choukai, "materi": cmd_materi}[sys.argv[1]](sys.argv[2:])
