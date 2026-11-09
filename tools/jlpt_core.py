# -*- coding: utf-8 -*-
"""
Inti generator bank soal JLPT Shirose Nihongo.

Semua soal dibuat ORISINAL dari materi yang sudah ada di repo ini:
  data/kosakata-n*.json, data/kanji-n*.json, data/bunpou-n*.json
Tidak ada konten pihak ketiga yang disalin.

Dipanggil oleh tools/jlpt_build.py.
"""
import json, re, random, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEVELS = ["n5", "n4", "n3", "n2", "n1"]           # urutan dari mudah ke sulit
LV_IDX = {l: i for i, l in enumerate(LEVELS)}

def load(p):
    with open(os.path.join(ROOT, p), encoding="utf-8") as f:
        return json.load(f)

# ---------------------------------------------------------------- kana utils
def kata2hira(s):
    return "".join(chr(ord(c) - 0x60) if "ァ" <= c <= "ヶ" else c for c in s)

HIRA_RE = re.compile(r"^[ぁ-ゖー]+$")
KANJI_RE = re.compile(r"[一-龯々〆ヶ]")
def is_hira(s): return bool(HIRA_RE.match(s or ""))
def has_kanji(s): return bool(KANJI_RE.search(s or ""))
def kanji_chars(s): return [c for c in s if re.match(r"[一-龯]", c)]

DAKU = {}
for a, b in zip("かきくけこさしすせそたちつてとはひふへほ", "がぎぐげござじずぜぞだぢづでどばびぶべぼ"):
    DAKU[a] = b; DAKU[b] = a
HANDAKU = dict(zip("はひふへほ", "ぱぴぷぺぽ")); HANDAKU.update({v: k for k, v in HANDAKU.items()})
O_ROW = set("おこそとのほもよろごぞどぼぽょ")
E_ROW = set("えけせてねへめれげぜでべぺ")
U_ROW = set("うくすつぬふむゆるぐずづぶぷゅ")
SOKU_NEXT = set("かきくけこさしすせそたちつてとぱぴぷぺぽ")
SMALL = dict(zip("ゃゅょ", "やゆよ")); SMALL.update({v: k for k, v in SMALL.items()})

def perturb(r):
    """Distraktor bacaan bergaya JLPT. Return list (bacaan, alasan)."""
    out = []
    n = len(r)
    for i, c in enumerate(r):
        if c in DAKU:
            out.append((r[:i] + DAKU[c] + r[i+1:], "daku" if c not in "がぎぐげござじずぜぞだぢづでどばびぶべぼ" else "undaku"))
        if c in HANDAKU and c in "ぱぴぷぺぽ":
            out.append((r[:i] + HANDAKU[c] + r[i+1:], "handaku"))
        if c in SMALL and c in "ゃゅょ":
            out.append((r[:i] + SMALL[c] + r[i+1:], "youon"))
    for i in range(n - 1):
        c, d = r[i], r[i+1]
        if c in O_ROW and d == "う":
            out.append((r[:i+1] + r[i+2:], "pendek"))
        if c in E_ROW and d == "い":
            out.append((r[:i+1] + r[i+2:], "pendek"))
        if c in U_ROW and d == "う":
            out.append((r[:i+1] + r[i+2:], "pendek"))
        if c == "っ":
            out.append((r[:i] + r[i+1:], "tanpa_tsu"))
    for i in range(n):
        c = r[i]
        nxt = r[i+1] if i + 1 < n else ""
        if c in O_ROW and nxt != "う" and i < n - 1 and nxt not in "ゃゅょんっー":
            out.append((r[:i+1] + "う" + r[i+1:], "panjang"))
        if c == "ゅ" and nxt != "う" and i < n - 1 and nxt not in "んっー":
            out.append((r[:i+1] + "う" + r[i+1:], "panjang"))
        if 0 < i < n and c in SOKU_NEXT and r[i-1] not in "っんー" and r[i-1] not in "ゃゅょ":
            out.append((r[:i] + "っ" + r[i:], "tsu"))
    seen, res = set(), []
    for x, why in out:
        if x != r and x not in seen and is_hira(x) and not x.startswith("っ"):
            seen.add(x); res.append((x, why))
    return res

WHY_TEXT = {
    "daku": "menambahkan tenten (゛) yang tidak ada — bunyi ini tidak berubah menjadi bersuara",
    "undaku": "menghilangkan tenten (゛) — padahal bunyi di kata ini memang bersuara (rendaku/dakuon)",
    "handaku": "menukar bunyi ぱ-gyō dengan は-gyō (atau sebaliknya)",
    "youon": "menukar huruf kecil ゃ/ゅ/ょ dengan huruf besar や/ゆ/よ — bunyi gabungan (yōon) menjadi rusak",
    "pendek": "memendekkan vokal panjang (chōon) — padahal vokalnya panjang",
    "panjang": "memanjangkan vokal yang seharusnya pendek",
    "tanpa_tsu": "menghilangkan っ kecil (sokuon) — padahal ada jeda/konsonan rangkap",
    "tsu": "menambahkan っ kecil (sokuon) yang tidak ada",
    "on_lain": "memakai bacaan lain dari kanji yang sama, tetapi bukan bacaan yang dipakai di kata ini",
}

# ---------------------------------------------------------------- furigana parsing
TOK_RE = re.compile(r"([一-龯々〆ヶ0-9０-９]+)\[([^\]]+)\]")

def parse_annot(s):
    """'私[わたし]は 学生[がくせい]です' → [('r','私','わたし'),('t','は'),...]"""
    s = (s or "").replace("　", " ")
    toks, pos = [], 0
    for m in TOK_RE.finditer(s):
        if m.start() > pos:
            toks.append(("t", s[pos:m.start()]))
        toks.append(("r", m.group(1), m.group(2)))
        pos = m.end()
    if pos < len(s):
        toks.append(("t", s[pos:]))
    clean = []
    for t in toks:
        if t[0] == "t":
            txt = re.sub(r"\[[^\]]*\]", "", t[1]).replace(" ", "")
            if txt: clean.append(("t", txt))
        else:
            clean.append(t)
    return clean

def plain_of(toks):
    return "".join(t[1] for t in toks)

def ruby_of(toks):
    return "".join(t[1] if t[0] == "t" else f"<ruby>{t[1]}<rt>{t[2]}</rt></ruby>" for t in toks)

# ---------------------------------------------------------------- data model
class Bank:
    def __init__(self):
        self.kanji = {l: load(f"data/kanji-{l}.json") for l in LEVELS}
        self.vocab = {l: load(f"data/kosakata-{l}.json") for l in LEVELS}
        self.gram = {l: load(f"data/bunpou-{l}.json") for l in LEVELS}
        # Data kanji N3 berbentuk kata (kanji/kana/arti), level lain per huruf.
        # Huruf kanji diambil dari keduanya; level = level pertama kemunculan.
        detail = {}
        for l in LEVELS:
            for k in self.kanji[l]:
                if k.get("k") and k["k"] not in detail:
                    detail[k["k"]] = k
        self.kinfo = {}
        self.kset = {}
        acc = set()
        for l in LEVELS:
            chars = []
            for k in self.kanji[l]:
                if k.get("k"): chars.append(k["k"])
                elif k.get("kanji"): chars += [c for c in k["kanji"] if re.match(r"[一-龯]", c)]
            for ch in chars:
                if ch not in self.kinfo:
                    d = detail.get(ch, {"k": ch, "on": "", "kun": "", "a": ""})
                    self.kinfo[ch] = dict(d, lvl=l)
            acc |= set(chars)
            self.kset[l] = set(acc)
        self.kwords = {l: [k for k in self.kanji[l] if k.get("kanji")] for l in LEVELS}
        # kalimat contoh (korpus) dari kosakata + bunpou semua level
        self.corpus = []
        for l in LEVELS:
            for src in ("vocab", "gram"):
                for e in getattr(self, src)[l]:
                    c, a = e.get("contoh"), e.get("arti_contoh")
                    if c and a and "[" in c or (c and a):
                        toks = parse_annot(c)
                        if not toks: continue
                        self.corpus.append({"lv": l, "toks": toks, "plain": plain_of(toks), "id": a.strip()})
        # bacaan per kanji (on → hiragana, kun → stem)
        self.kread = {}
        for ch, k in self.kinfo.items():
            rs = []
            for part in re.split(r"[、,，\s]+", k.get("on", "") or ""):
                part = part.strip("-").strip()
                if part: rs.append(("on", kata2hira(part)))
            for part in re.split(r"[、,，\s]+", k.get("kun", "") or ""):
                part = part.strip("-").strip()
                if not part: continue
                stem = part.split(".")[0].strip("-")
                if stem: rs.append(("kun", stem))
            uniq, seen = [], set()
            for t, r in rs:
                if r not in seen and is_hira(r):
                    seen.add(r); uniq.append((t, r))
            self.kread[ch] = uniq
        self.on_index = {}
        for ch, rs in self.kread.items():
            for t, r in rs:
                if t == "on":
                    self.on_index.setdefault(r, []).append(ch)

    # -------- tampilkan kalimat sesuai level: kanji di luar level → kana
    def render(self, toks, lv, keep=()):
        out = []
        for t in toks:
            if t[0] == "t":
                out.append(t[1])
            else:
                base = t[1]
                ok = all((c in self.kset[lv]) or not re.match(r"[一-龯]", c) for c in base)
                out.append(base if (ok or base in keep) else kata2hira(t[2]))
        return "".join(out)

    def kanji_line(self, ch):
        k = self.kinfo.get(ch)
        if not k: return None
        on = k.get("on") or "-"; kun = k.get("kun") or "-"
        return f"{ch} — {short(k.get('a',''), 60)} (on: {on}; kun: {kun}; level {k['lvl'].upper()})"

def short(s, n=70):
    s = re.sub(r"\*\*", "", str(s or "")).strip()
    s = re.sub(r"^\s*1\.\s*", "", s)
    s = re.split(r"\s2\.\s", s)[0]
    s = s.strip().rstrip(";,. ")
    return s if len(s) <= n else s[:n].rsplit(" ", 1)[0] + "…"

def first_meaning(s):
    s = short(s, 200)
    s = re.split(r"[;；(（]", s)[0].strip()
    return s[:60]

# ---------------------------------------------------------------- penjelas struktur kalimat
PART_ROLE = {
    "は": "penanda topik (yang dibicarakan)",
    "が": "penanda subjek / objek perasaan-kemampuan",
    "を": "penanda objek langsung",
    "に": "penanda tujuan, waktu, atau sasaran",
    "で": "penanda tempat kegiatan atau alat/cara",
    "へ": "penanda arah",
    "と": "\"dan\" / \"bersama\" / kutipan",
    "も": "\"juga\"",
    "の": "penghubung kepemilikan / keterangan kata benda",
    "から": "\"dari\" / \"karena\"",
    "まで": "\"sampai\"",
    "より": "\"daripada\"",
    "には": "に + penekanan topik",
    "では": "で + penekanan topik",
    "とは": "\"yang disebut …\" / definisi",
}
SPLIT_AFTER = ["から", "まで", "より", "には", "では", "とは", "ので", "のに", "けど", "は", "が", "を", "に", "で", "へ", "と", "も", "の", "、"]

def chunk(s):
    """Potong kalimat menjadi frasa (bunsetsu kasar) berdasarkan partikel."""
    chunks, cur, i = [], "", 0
    while i < len(s):
        hit = None
        for p in SPLIT_AFTER:
            if s.startswith(p, i):
                prev = s[i-1] if i > 0 else ""
                okprev = bool(prev) and re.match(r"[一-龯々ァ-ヶー0-9０-９）」』]", prev)
                if p == "、" or (okprev and (len(p) == 1 or p in ("には", "では", "とは", "から", "まで", "より"))) \
                   or (p in ("ので", "のに", "けど", "から") and prev and re.match(r"[ぁ-ゖ]", prev) and i > 1):
                    hit = p; break
        if hit:
            cur += hit; i += len(hit)
            nxt = s[i] if i < len(s) else ""
            if nxt and nxt in "、。":
                continue
            nxt2 = s[i:i+2]
            if (hit == "で" and nxt2[:1] in "すし") or (hit == "が" and nxt2[:1] in "るりっれろら") \
               or (hit == "に" and nxt2[:1] in "くけ"):
                continue
            chunks.append(cur); cur = ""
        else:
            cur += s[i]; i += 1
    if cur: chunks.append(cur)
    merged = []
    for c in chunks:
        if merged and re.match(r"^[ぁ-ゖ]{1,2}[。！？!?]*$", c):
            merged[-1] += c
        else:
            merged.append(c)
    return [c for c in merged if c]

def struktur(plain):
    ch = chunk(plain)
    if len(ch) < 2:
        return f"Kalimat pendek: 「{plain}」 — satu kesatuan frasa."
    parts = []
    for c in ch:
        role = None
        for p in sorted(PART_ROLE, key=len, reverse=True):
            if c.endswith(p) and len(c) > len(p):
                role = f"{c[:-len(p)]} ＋ {p} ({PART_ROLE[p]})"; break
        parts.append(role or c)
    return " ｜ ".join(parts)

# ---------------------------------------------------------------- helper opsi
def shuffle_opts(correct, distractors, rnd, extra=None):
    """Return (opts, ans, mapping) — mapping[i] = index sumber (0 = benar)."""
    items = [(correct, 0)] + [(d, i + 1) for i, d in enumerate(distractors)]
    rnd.shuffle(items)
    opts = [x[0] for x in items]
    src = [x[1] for x in items]
    return opts, src.index(0), src

def segment_reading(bank, base, reading):
    """Coba bagi bacaan per kanji: 学生/がくせい → [('学','がく'),('生','せい')]."""
    chars = list(base)
    res = []
    def rec(ci, ri, acc):
        if ci == len(chars):
            if ri == len(reading): res.append(list(acc))
            return
        ch = chars[ci]
        cands = [r for _, r in bank.kread.get(ch, [])]
        ext = set()
        for r in cands:
            ext.add(r)
            if r and r[-1] in "つちくき" and len(r) > 1:
                ext.add(r[:-1] + "っ")
            if r and r[0] in DAKU and r[0] not in "がぎぐげござじずぜぞだぢづでどばびぶべぼ":
                ext.add(DAKU[r[0]] + r[1:])
            if r and r[0] in "はひふへほ":
                ext.add(HANDAKU[r[0]] + r[1:])
        if ch == "々" and acc:
            ext.add(acc[-1][1])
            if acc[-1][1][0] in DAKU: ext.add(DAKU[acc[-1][1][0]] + acc[-1][1][1:])
        for r in sorted(ext, key=len, reverse=True):
            if r and reading.startswith(r, ri):
                acc.append((ch, r)); rec(ci + 1, ri + len(r), acc); acc.pop()
                if res: return
    rec(0, 0, [])
    return res[0] if res else None
