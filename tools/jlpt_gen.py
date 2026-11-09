# -*- coding: utf-8 -*-
"""
Pembuat soal Kanji / Kotoba / Bunpou (orisinal) dari materi Shirose Nihongo.
Setiap fungsi make_* mengembalikan dict soal lengkap dengan pembahasan detail
berbahasa Indonesia, atau None bila materi tidak cukup untuk soal yang layak.
"""
import re, random
from jlpt_core import (Bank, LEVELS, LV_IDX, kata2hira, is_hira, has_kanji, kanji_chars,
                       parse_annot, plain_of, ruby_of, short, first_meaning, struktur, chunk,
                       shuffle_opts, segment_reading, perturb, WHY_TEXT, DAKU, HANDAKU)

ABCD = "ABCD"

def ex_base(**kw):
    """Pembahasan terstruktur — urutan bagian mengikuti permintaan guru."""
    keys = ["jawaban", "terjemahan", "alasan", "opsi", "grammar", "kosakata",
            "kanji", "struktur", "contoh", "poin"]
    return {k: kw.get(k) for k in keys if kw.get(k)}

# ============================================================== sumber target
class Targets:
    """Daftar kata (kosakata) yang punya kalimat contoh beranotasi furigana.
    mode="kotoba": kosakata level ini saja.
    mode="kanji" : kata dari semua level yang SEMUA kanjinya ≤ level ini dan
                   minimal satu kanjinya memang kanji level ini (atau N5)."""
    def __init__(self, bank: Bank, lv, mode="kotoba"):
        self.bank, self.lv = bank, lv
        self.items = []
        seen = set()
        if mode == "kotoba":
            vocab = bank.vocab[lv]
        else:
            vocab = []
            for l2 in LEVELS[:LV_IDX[lv] + 2]:      # kosakata level ini & satu level di atasnya
                for e in bank.vocab[l2]:
                    ks = kanji_chars(re.sub(r"\[\d+\]$", "", e.get("kata", "")))
                    if ks and all(c in bank.kset[lv] for c in ks) and any(bank.kinfo.get(c, {}).get("lvl") == lv for c in ks):
                        vocab.append(e)
        for e in vocab:
            kata = re.sub(r"\[\d+\]$", "", e.get("kata", "")).strip()
            if not kata or kata in seen: continue
            if re.match(r"^[ヶヵ0-9０-９〇]", kata) or len(kata) > 8: continue
            found = self.find_sentence(e, kata)
            if not found: continue
            seen.add(kata)
            self.items.append(found)

    def find_sentence(self, e, kata):
        b, lv = self.bank, self.lv
        lead = re.match(r"^([一-龯々]+)(.*)$", kata)
        cands = []
        if e.get("contoh") and e.get("arti_contoh"):
            toks = parse_annot(e["contoh"])
            cands.append({"lv": lv, "toks": toks, "plain": plain_of(toks), "id": e["arti_contoh"].strip(), "own": True})
        if not cands or not self._locate(cands[0], kata, lead):
            # cari di korpus lain (level ≤ level ini lebih dulu)
            pool = [c for c in b.corpus if kata[:max(1, len(lead.group(1)) if lead else len(kata))] in c["plain"]]
            pool.sort(key=lambda c: (abs(LV_IDX[c["lv"]] - LV_IDX[lv]), len(c["plain"])))
            cands = pool[:6] + cands
        for c in cands:
            loc = self._locate(c, kata, lead)
            if loc:
                if len(c["plain"]) > 70 or len(c["plain"]) < 4: continue
                return dict(loc, kata=kata, arti=e.get("arti", ""), sent=c, entry=e)
        return None

    def _locate(self, c, kata, lead):
        toks = c["toks"]
        if lead:   # kata berkanji: cari token beranotasi yang base-nya = bagian kanji
            kpart, okuri = lead.group(1), lead.group(2)
            for i, t in enumerate(toks):
                if t[0] == "r" and t[1] == kpart:
                    after = toks[i+1][1] if i + 1 < len(toks) and toks[i+1][0] == "t" else ""
                    stem = okuri if (okuri and after.startswith(okuri)) else (okuri[:-1] if okuri and okuri[-1] in "るうくすつぬぶむぐい" else okuri)
                    if okuri and not after.startswith(stem): continue
                    if not okuri and after[:1] and re.match(r"[ぁ-ゖ]", after[:1]) is None and after[:1] not in "。、！？「」 ":
                        pass
                    surf = kpart + stem
                    read = t[2] + stem
                    if not is_hira(read): continue
                    return {"i": i, "base": kpart, "surf": surf, "read": read, "okuri": okuri, "stem": stem,
                            "pos": "verb" if okuri[-1:] in "うくすつぬぶむぐる" and okuri else ("adj" if okuri.endswith("い") else "noun")}
            return None
        # kata tanpa kanji (katakana/hiragana): cari teks literal
        if kata in c["plain"] and len(kata) >= 2:
            return {"i": -1, "base": kata, "surf": kata, "read": kata2hira(kata), "okuri": "", "stem": "",
                    "pos": "kana"}
        return None

def disp_word(bank, tg, lv):
    if tg["i"] < 0: return tg["surf"]
    r = tg["read"][:len(tg["read"]) - len(tg["stem"])] if tg["stem"] else tg["read"]
    return bank.render([("r", tg["base"], r)], lv) + tg["stem"]

def sentence_with(bank, tg, lv, mark):
    """Render kalimat level-aware; target diganti dengan `mark(surface)`."""
    toks = tg["sent"]["toks"]
    out = []
    i = tg["i"]
    skip_chars = len(tg["stem"])
    for j, t in enumerate(toks):
        if j == i:
            out.append("\u0000")
            continue
        if j == i + 1 and skip_chars and t[0] == "t":
            out.append(t[1][skip_chars:]); continue
        out.append(t[1] if t[0] == "t" else bank.render([t], lv))
    s = "".join(out)
    if i == -1:
        s = bank.render(toks, lv).replace(tg["surf"], "\u0000", 1)
    return s.replace("\u0000", mark(tg["surf"]))

def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def kosakata_line(tg):
    return f"{tg['kata']}（{tg['read'] if not tg['okuri'] else tg['read'][:len(tg['read'])-len(tg['stem'])] + tg['okuri']}）— {short(tg['arti'], 90)}"

def kanji_notes(bank, word):
    lines = [bank.kanji_line(c) for c in kanji_chars(word)]
    return [l for l in lines if l]

def extra_examples(bank, word, exclude_plain, n=2, lv="n1"):
    res = []
    for c in bank.corpus:
        if word in c["plain"] and c["plain"] != exclude_plain and len(c["plain"]) <= 60:
            res.append(f"{ruby_of(c['toks'])} — {c['id']}")
            if len(res) >= n: break
    return res

# ============================================================== KANJI: 漢字読み
def make_yomi(bank, tg, lv, rnd, qid):
    read = tg["read"]
    if not has_kanji(tg["surf"]) or len(read) < 2: return None
    if not all(c in bank.kset[lv] for c in kanji_chars(tg["base"])): return None
    seg = segment_reading(bank, tg["base"], read[:len(read)-len(tg["stem"])] if tg["stem"] else read)
    cands = []
    # 1) bacaan lain dari kanji yang sama (paling "JLPT")
    if seg:
        for si, (ch, r) in enumerate(seg):
            for _, alt in bank.kread.get(ch, []):
                if alt != r and 1 <= len(alt) <= 4:
                    new = "".join(a if k != si else alt for k, (_, a) in enumerate(seg)) + tg["stem"]
                    if new != read and is_hira(new):
                        cands.append((new, "on_lain", ch, alt))
    # 2) perubahan bunyi kecil (dakuten, vokal panjang, っ)
    for new, why in perturb(read):
        if "ぢ" in new or "づ" in new and "づ" not in read: continue
        if why == "panjang" and "うう" in new: continue
        cands.append((new, why, None, None))
    rnd.shuffle(cands)
    cands.sort(key=lambda x: {"on_lain": 0, "pendek": 1, "panjang": 1, "tsu": 2, "tanpa_tsu": 1, "undaku": 2, "daku": 2, "youon": 1, "handaku": 2}.get(x[1], 3))
    picked, seen, whys = [], {read}, set()
    for c in cands:
        if c[0] in seen: continue
        if c[1] in whys and len([x for x in cands if x[1] not in whys and x[0] not in seen]) > 0 and len(picked) < 2:
            continue
        seen.add(c[0]); whys.add(c[1]); picked.append(c)
        if len(picked) == 3: break
    if len(picked) < 3:
        for c in cands:
            if c[0] not in seen:
                seen.add(c[0]); picked.append(c)
                if len(picked) == 3: break
    if len(picked) < 3: return None
    opts, ans, src = shuffle_opts(read, [p[0] for p in picked], rnd)
    q = sentence_with(bank, tg, lv, lambda s: f"<u>{esc(s)}</u>")
    opsi_ex = []
    for i, o in enumerate(opts):
        if src[i] == 0:
            opsi_ex.append(f"{ABCD[i]}. {o} — BENAR. Ini bacaan 「{tg['surf']}」 dalam kalimat ini.")
        else:
            p = picked[src[i]-1]
            if p[1] == "on_lain":
                opsi_ex.append(f"{ABCD[i]}. {o} — Salah. Memakai bacaan 「{p[3]}」 untuk kanji {p[2]}; bacaan itu ada, tetapi tidak dipakai di kata 「{tg['kata']}」.")
            else:
                opsi_ex.append(f"{ABCD[i]}. {o} — Salah. Jebakan bunyi: {WHY_TEXT.get(p[1], 'bunyi dibuat mirip')}.")
    segtxt = " + ".join(f"{c}（{r}）" for c, r in seg) if seg else f"{tg['base']}（{read}）"
    return {
        "id": qid, "cat": "kanji", "tipe": "yomi", "tipe_jp": "漢字読み",
        "q": q, "opts": opts, "ans": ans,
        "ref": {"tipe": "kosakata", "kata": tg["kata"]},
        "ex": ex_base(
            jawaban=f"{ABCD[ans]}. {read}",
            terjemahan=tg["sent"]["id"],
            alasan=f"Kata bergaris bawah 「{tg['surf']}」 dibaca 「{read}」: {segtxt}. Artinya: {short(tg['arti'], 80)}.",
            opsi=opsi_ex,
            kosakata=[kosakata_line(tg)],
            kanji=kanji_notes(bank, tg["base"]),
            struktur=struktur(bank.render(tg["sent"]["toks"], lv)),
            contoh=extra_examples(bank, tg["kata"], tg["sent"]["plain"]),
            poin=f"Hafalkan bacaan 「{tg['kata']}」 sebagai satu kata utuh. Perhatikan detail bunyi: tenten (゛), vokal panjang, dan っ kecil — JLPT sering menjebak di sana.",
        ),
    }

# ============================================================== KANJI: 表記
def make_hyouki(bank, tg, lv, rnd, qid):
    base = tg["base"]
    ks = kanji_chars(base)
    if not ks or tg["pos"] == "kana": return None
    if not all(c in bank.kset[lv] for c in ks): return None
    pool_lv = bank.kset[lv] | bank.kset[LEVELS[min(4, LV_IDX[lv] + 1)]]
    cands = []
    for pi, ch in enumerate(base):
        if not re.match(r"[一-龯]", ch): continue
        for t, r in bank.kread.get(ch, []):
            for other in bank.on_index.get(r, []):
                if other != ch and other in pool_lv:
                    cands.append((base[:pi] + other + base[pi+1:], ch, other, r))
        # kanji dengan bentuk/arti berdekatan: berbagi komponen kun
        for t, r in bank.kread.get(ch, []):
            if t == "kun":
                for o2, rs in bank.kread.items():
                    if o2 != ch and o2 in pool_lv and ("kun", r) in rs:
                        cands.append((base[:pi] + o2 + base[pi+1:], ch, o2, r))
    rnd.shuffle(cands)
    picked, seen = [], {base}
    for c in cands:
        if c[0] in seen: continue
        seen.add(c[0]); picked.append(c)
        if len(picked) == 3: break
    if len(picked) < 3: return None
    disp = lambda w: w + tg["stem"]
    opts, ans, src = shuffle_opts(disp(base), [disp(p[0]) for p in picked], rnd)
    q = sentence_with(bank, tg, lv, lambda s: f"<u>{esc(tg['read'])}</u>")
    opsi_ex = []
    for i, o in enumerate(opts):
        if src[i] == 0:
            opsi_ex.append(f"{ABCD[i]}. {o} — BENAR. Penulisan baku untuk 「{tg['read']}」 = {short(tg['arti'], 50)}.")
        else:
            p = picked[src[i]-1]
            info = bank.kinfo.get(p[2], {})
            opsi_ex.append(f"{ABCD[i]}. {o} — Salah. Kanji {p[2]} ({short(info.get('a',''), 40)}) memang bisa dibaca 「{p[3]}」, tetapi kata ini memakai {p[1]} ({short(bank.kinfo.get(p[1],{}).get('a',''), 40)}).")
    return {
        "id": qid, "cat": "kanji", "tipe": "hyouki", "tipe_jp": "表記",
        "q": q, "opts": opts, "ans": ans,
        "ref": {"tipe": "kosakata", "kata": tg["kata"]},
        "ex": ex_base(
            jawaban=f"{ABCD[ans]}. {disp(base)}",
            terjemahan=tg["sent"]["id"],
            alasan=f"「{tg['read']}」 ditulis 「{disp(base)}」. Pilihan lain memakai kanji yang bunyinya sama/mirip tetapi maknanya berbeda.",
            opsi=opsi_ex,
            kosakata=[kosakata_line(tg)],
            kanji=kanji_notes(bank, base),
            struktur=struktur(bank.render(tg["sent"]["toks"], lv)),
            contoh=extra_examples(bank, tg["kata"], tg["sent"]["plain"]),
            poin="Soal 表記 menguji kanji yang bunyinya sama (同音異字). Ingat makna tiap kanji, bukan hanya bunyinya.",
        ),
    }

# ============================================================== KOTOBA: 文脈規定
def word_class(tg):
    return tg["pos"]

def make_bunmyaku(bank, tg, lv, rnd, qid, pool):
    if tg["pos"] not in ("noun", "kana"): return None
    surf = tg["surf"]
    if len(surf) < 2: return None
    sims = [p for p in pool if p is not tg and p["pos"] in ("noun", "kana") and p["kata"] != tg["kata"]
            and abs(len(p["surf"]) - len(surf)) <= 2 and p["surf"] not in tg["sent"]["plain"]
            and first_meaning(p["arti"]) != first_meaning(tg["arti"])]
    if len(sims) < 3: return None
    picked = rnd.sample(sims, 3)
    render = lambda p: disp_word(bank, p, lv)
    correct = render(tg)
    dist = [render(p) for p in picked]
    if len(set(dist + [correct])) < 4: return None
    opts, ans, src = shuffle_opts(correct, dist, rnd)
    q = sentence_with(bank, tg, lv, lambda s: "（　　　）")
    opsi_ex = []
    for i, o in enumerate(opts):
        p = tg if src[i] == 0 else picked[src[i]-1]
        mean = short(p["arti"], 60)
        if src[i] == 0:
            opsi_ex.append(f"{ABCD[i]}. {o}（{p['read']}）= {mean} — BENAR, cocok dengan konteks kalimat.")
        else:
            opsi_ex.append(f"{ABCD[i]}. {o}（{p['read']}）= {mean} — Salah. Kalau dimasukkan, maknanya tidak nyambung dengan kalimat \"{short(tg['sent']['id'], 70)}\".")
    return {
        "id": qid, "cat": "kotoba", "tipe": "bunmyaku", "tipe_jp": "文脈規定",
        "q": q, "opts": opts, "ans": ans,
        "ref": {"tipe": "kosakata", "kata": tg["kata"]},
        "ex": ex_base(
            jawaban=f"{ABCD[ans]}. {correct}",
            terjemahan=tg["sent"]["id"],
            alasan=f"Kalimat ini bermakna \"{short(tg['sent']['id'], 90)}\". Kata yang pas adalah 「{correct}」 ({short(tg['arti'], 60)}).",
            opsi=opsi_ex,
            kosakata=[kosakata_line(tg)] + [kosakata_line(p) for p in picked],
            kanji=kanji_notes(bank, tg["base"]),
            struktur=struktur(bank.render(tg["sent"]["toks"], lv)),
            contoh=extra_examples(bank, tg["kata"], tg["sent"]["plain"]),
            poin="Baca seluruh kalimat dulu, tebak maknanya, baru pilih kata. Petunjuk biasanya ada pada kata kerja dan partikel di sekitar kurung.",
        ),
    }

# ============================================================== KOTOBA: 語彙の意味 (pengganti 言い換え)
def make_imi(bank, tg, lv, rnd, qid, pool):
    m = first_meaning(tg["arti"])
    if not m or len(m) < 2: return None
    sims = [p for p in pool if p is not tg and p["pos"] == tg["pos"] and first_meaning(p["arti"]) and
            first_meaning(p["arti"]).lower() != m.lower() and p["kata"] != tg["kata"]]
    if len(sims) < 3: return None
    picked = rnd.sample(sims, 3)
    dist = [first_meaning(p["arti"]) for p in picked]
    if len(set(x.lower() for x in dist + [m])) < 4: return None
    opts, ans, src = shuffle_opts(m, dist, rnd)
    q = sentence_with(bank, tg, lv, lambda s: f"<u>{esc(disp_word(bank, tg, lv))}</u>")
    q += "<br><small>Pilih arti kata yang bergaris bawah.</small>"
    opsi_ex = []
    for i, o in enumerate(opts):
        p = tg if src[i] == 0 else picked[src[i]-1]
        if src[i] == 0:
            opsi_ex.append(f"{ABCD[i]}. \"{o}\" — BENAR. Ini arti 「{tg['kata']}」.")
        else:
            opsi_ex.append(f"{ABCD[i]}. \"{o}\" — Salah. Ini arti kata lain: 「{p['kata']}」（{p['read']}）.")
    return {
        "id": qid, "cat": "kotoba", "tipe": "imi", "tipe_jp": "語彙の意味",
        "q": q, "opts": opts, "ans": ans,
        "ref": {"tipe": "kosakata", "kata": tg["kata"]},
        "ex": ex_base(
            jawaban=f"{ABCD[ans]}. {m}",
            terjemahan=tg["sent"]["id"],
            alasan=f"「{tg['kata']}」（{tg['read']}） berarti \"{short(tg['arti'], 100)}\". Dalam kalimat: \"{short(tg['sent']['id'], 80)}\".",
            opsi=opsi_ex,
            kosakata=[kosakata_line(tg)] + [kosakata_line(p) for p in picked],
            kanji=kanji_notes(bank, tg["base"]),
            struktur=struktur(bank.render(tg["sent"]["toks"], lv)),
            contoh=extra_examples(bank, tg["kata"], tg["sent"]["plain"]),
            poin="Gunakan konteks kalimat untuk mengecek arti. Kata yang bentuknya mirip belum tentu artinya mirip.",
        ),
    }

# ============================================================== KOTOBA: 用法
def make_youhou(bank, tg, lv, rnd, qid, pool):
    if tg["pos"] not in ("noun", "kana") or len(tg["surf"]) < 2: return None
    others = [p for p in pool if p is not tg and p["pos"] in ("noun", "kana") and p["kata"] != tg["kata"]
              and len(p["sent"]["plain"]) <= 45 and tg["surf"] not in p["sent"]["plain"]]
    if len(others) < 3: return None
    picked = rnd.sample(others, 3)
    word = disp_word(bank, tg, lv)
    right = sentence_with(bank, tg, lv, lambda s: f"<u>{esc(word)}</u>")
    wrong = [sentence_with(bank, p, lv, lambda s: f"<u>{esc(word)}</u>") for p in picked]
    if len(set(wrong + [right])) < 4: return None
    opts, ans, src = shuffle_opts(right, wrong, rnd)
    opsi_ex = []
    for i, o in enumerate(opts):
        if src[i] == 0:
            opsi_ex.append(f"{ABCD[i]}. BENAR — \"{short(tg['sent']['id'], 80)}\". 「{tg['kata']}」 dipakai sesuai maknanya ({short(tg['arti'], 50)}).")
        else:
            p = picked[src[i]-1]
            opsi_ex.append(f"{ABCD[i]}. Salah — kalimat ini seharusnya memakai 「{p['kata']}」（{p['read']}, {short(p['arti'], 40)}）: \"{short(p['sent']['id'], 70)}\".")
    return {
        "id": qid, "cat": "kotoba", "tipe": "youhou", "tipe_jp": "用法",
        "q": f"「{esc(word)}」 dipakai dengan benar pada kalimat mana?", "opts": opts, "ans": ans, "html_opts": True,
        "ref": {"tipe": "kosakata", "kata": tg["kata"]},
        "ex": ex_base(
            jawaban=f"{ABCD[ans]}",
            terjemahan=f"Pertanyaan: Kalimat mana yang memakai 「{word}」 secara tepat? Kalimat benar: \"{tg['sent']['id']}\"",
            alasan=f"「{tg['kata']}」 berarti {short(tg['arti'], 80)}. Hanya opsi {ABCD[ans]} yang konteksnya sesuai makna itu.",
            opsi=opsi_ex,
            kosakata=[kosakata_line(tg)] + [kosakata_line(p) for p in picked],
            kanji=kanji_notes(bank, tg["base"]),
            struktur=struktur(bank.render(tg["sent"]["toks"], lv)),
            contoh=extra_examples(bank, tg["kata"], tg["sent"]["plain"]),
            poin="Soal 用法 menguji makna DAN kolokasi. Coba ganti kata bergaris bawah dengan arti Indonesianya — kalimat yang terasa janggal pasti salah.",
        ),
    }

# ============================================================== BUNPOU
PARTICLES = ["は", "が", "を", "に", "で", "へ", "と", "も", "の", "か", "や", "から", "まで", "より"]

def pattern_variants(pola):
    p = re.sub(r"\*\*", "", pola)
    p = p.split("+")[0].split("＋")[0]
    p = re.sub(r"[（(][^）)]*[）)]", "", p)
    p = re.sub(r"\[([ぁ-ゖ]+)\]", r"\1", p)          # V[て]もいい → Vてもいい
    p = re.sub(r"[①-⑳]", "", p)
    vs = []
    for v in re.split(r"[・／/、,，|｜]", p):
        v = re.sub(r"[A-Za-z\s\[\]]", "", v).replace("…", "～")
        parts = [x for x in re.split(r"[～〜~]", v) if x]
        if not parts: continue
        v = max(parts, key=len) if len(parts) > 1 else parts[0]
        if v and re.match(r"^[ぁ-ゖァ-ヶー一-龯々]+$", v): vs.append(v)
    return vs

def find_variant(plain, v):
    """Cari v di kalimat; izinkan bentuk lampau/negatif dengan memotong akhiran."""
    if len(v) == 1 or v in PARTICLES:
        # partikel: harus setelah kanji/katakana/angka supaya tidak memotong kata
        for m in re.finditer(re.escape(v), plain):
            i = m.start()
            if i > 0 and re.match(r"[一-龯々ァ-ヶー0-9０-９]", plain[i-1]) and (i + len(v) < len(plain)):
                nxt = plain[i+len(v)]
                if not re.match(r"[ぁ-ゖ]", nxt) or v in ("から", "まで", "より"):
                    return i, v
        return None
    if v in plain and plain.index(v) > 0:
        return plain.index(v), v
    if len(v) >= 4 and v[-1] in "いる" and v[:-1] in plain and plain.index(v[:-1]) > 0:
        return plain.index(v[:-1]), v[:-1]
    if v in plain and plain.index(v) == 0 and len(plain) >= len(v) + 6:
        return 0, v
    return None

class GramPool:
    def __init__(self, bank, lv):
        self.bank, self.lv = bank, lv
        self.items = []
        for g in bank.gram[lv]:
            vs = pattern_variants(g.get("pola", ""))
            vs = [v for v in vs if len(v) >= 2 or v in PARTICLES]
            if not vs: continue
            sents = []
            if g.get("contoh") and g.get("arti_contoh"):
                toks = parse_annot(g["contoh"])
                sents.append({"lv": lv, "toks": toks, "plain": plain_of(toks), "id": g["arti_contoh"].strip()})
            long_v = [v for v in vs if len(v) >= 2 and v not in PARTICLES]
            cap = 14
            if long_v:
                for c in bank.corpus:
                    if c["lv"] in LEVELS[:LV_IDX[lv]+1] and any(v in c["plain"] for v in long_v) and len(c["plain"]) <= 55:
                        sents.append(c)
                    if len(sents) >= cap: break
            else:
                for c in bank.corpus:
                    if c["lv"] == lv and len(c["plain"]) <= 40 and any(v in c["plain"] for v in vs):
                        sents.append(c)
                    if len(sents) >= cap: break
            hits = []
            for s in sents:
                rendered = bank.render(s["toks"], lv)
                for v in sorted(vs, key=len, reverse=True):
                    f = find_variant(rendered, v)
                    if f:
                        hits.append((s, f[1], f[0], rendered)); break
            if hits:
                self.items.append({"g": g, "vs": vs, "hits": hits, "particle": all(v in PARTICLES for v in vs)})

def blank_at(rendered, pos, v, mark):
    return rendered[:pos] + mark + rendered[pos+len(v):]

def gram_desc(g):
    return short(g.get("arti") or g.get("penjelasan", ""), 160)

def make_bunpou_form(bank, gp, item, hit_idx, lv, rnd, qid):
    s, v, pos, rendered = item["hits"][hit_idx]
    others = [o for o in gp.items if o is not item and o["particle"] == item["particle"]]
    cands = []
    if item["particle"]:
        for pt in ["を", "に", "で", "へ", "と", "の", "や", "が", "から", "まで"]:
            if pt != v and len(pt) <= 2 and {pt, v} not in ({"に", "へ"}, {"は", "が"}, {"に", "で"}, {"や", "と"}):
                owner = next((o for o in others if pt in o["vs"]), None)
                cands.append((pt, owner or {"g": {"pola": pt, "arti": "partikel " + pt}}))
    else:
        for o in others:
            for ov in o["vs"]:
                if ov != v and ov not in v and v not in ov and abs(len(ov) - len(v)) <= 3 and ov not in s["plain"]:
                    cands.append((ov, o)); break
    if len(cands) < 3: return None
    picked = rnd.sample(cands, 3)
    if len({p[0] for p in picked} | {v}) < 4: return None
    opts, ans, src = shuffle_opts(v, [p[0] for p in picked], rnd)
    q = blank_at(rendered, pos, v, "（　　　）")
    g = item["g"]
    opsi_ex = []
    for i, o in enumerate(opts):
        if src[i] == 0:
            opsi_ex.append(f"{ABCD[i]}. {o} — BENAR. Pola 「{g['pola']}」: {gram_desc(g)}")
        else:
            og = picked[src[i]-1][1]["g"]
            opsi_ex.append(f"{ABCD[i]}. {o} — Salah. Pola 「{og['pola']}」 bermakna: {short(og.get('arti',''), 110)} Makna ini tidak sesuai dengan maksud kalimat.")
    exs = []
    if g.get("contoh"):
        exs.append(f"{ruby_of(parse_annot(g['contoh']))} — {g.get('arti_contoh','')}")
    for h in item["hits"]:
        if h[0]["plain"] != s["plain"] and len(exs) < 3:
            exs.append(f"{ruby_of(h[0]['toks'])} — {h[0]['id']}")
    if len(exs) < 2:
        exs.append(f"{ruby_of(s['toks'])} — {s['id']}")
    pen = short(g.get("penjelasan", ""), 600)
    return {
        "id": qid, "cat": "bunpou", "tipe": "keishiki", "tipe_jp": "文法形式の判断",
        "q": q, "opts": opts, "ans": ans,
        "ref": {"tipe": "bunpou", "pola": g["pola"]},
        "ex": ex_base(
            jawaban=f"{ABCD[ans]}. {v}",
            terjemahan=s["id"],
            alasan=f"Kalimat lengkapnya 「{rendered}」 = \"{short(s['id'], 90)}\". Makna itu dibentuk oleh pola 「{g['pola']}」 (bentuk 「{v}」).",
            opsi=opsi_ex,
            grammar={"pola": g["pola"], "arti": gram_desc(g), "rumus": pen,
                     "situasi": short(g.get("note", "") or pen, 220)},
            struktur=struktur(rendered),
            contoh=exs,
            poin=f"Ingat 「{g['pola']}」 bersama contoh kalimatnya. Bandingkan dengan pola pengecoh: makna dan bentuk sambungnya berbeda.",
        ),
    }

def chunk_tokens(bank, toks, lv):
    """Potong kalimat berdasarkan teks ASLI (berkanji) lalu render tiap frasa sesuai level."""
    plain = plain_of(toks)
    chs = chunk(plain)
    # peta indeks plain → potongan token
    out, cur = [], 0
    bounds = []
    for c in chs:
        bounds.append((cur, cur + len(c))); cur += len(c)
    # render per karakter-run
    pieces = []   # (start,end,rendered) per token
    pos = 0
    for t in toks:
        txt = t[1]
        pieces.append((pos, pos + len(txt), t)); pos += len(txt)
    for a, b in bounds:
        r = []
        for (ps, pe, t) in pieces:
            if pe <= a or ps >= b: continue
            if t[0] == "t":
                r.append(t[1][max(a, ps)-ps:min(b, pe)-ps])
            else:
                if ps >= a and pe <= b: r.append(bank.render([t], lv))
                else: return None          # batas frasa memotong kata berkanji
        out.append("".join(r))
    return out

def make_bunpou_star(bank, gp, item, hit_idx, lv, rnd, qid, sent=None):
    if sent is not None:
        s, v = sent, ""
        rendered = bank.render(s["toks"], lv)
        for it in gp.items:
            if it["particle"]: continue
            for vv in it["vs"]:
                if len(vv) >= 2 and vv in rendered:
                    item, v = it, vv; break
            if v: break
        if not v: return None
    else:
        s, v, pos, rendered = item["hits"][hit_idx]
    if "「" in s["plain"] or re.search(r"[。！？!?].", s["plain"].rstrip("。！？!?」")) or ":" in s["plain"] or "：" in s["plain"]:
        return None
    ch = chunk_tokens(bank, s["toks"], lv)
    if not ch: return None
    plain = "".join(ch)
    m = re.search(r"[。！？!?]+$", ch[-1])
    tail = m.group(0) if m else ""
    if tail:
        ch[-1] = ch[-1][:-len(tail)]
        if not ch[-1]: ch.pop()
    if len(ch) < 5: return None
    # posisi pola di teks render
    vpos = plain.find(v)
    starts = []
    for k in range(0, len(ch) - 3):
        if not all(1 <= len(c) <= 12 for c in ch[k:k+4]): continue
        a = sum(len(c) for c in ch[:k]); b = a + sum(len(c) for c in ch[k:k+4])
        if k == 0 and k + 4 == len(ch): continue
        if vpos >= 0 and not (a <= vpos < b): continue
        starts.append(k)
    FLOAT = {"とても", "よく", "まだ", "もう", "すこし", "少し", "ちょっと", "いつも", "たくさん", "ぜんぶ", "全部",
             "みんな", "すぐ", "また", "かなり", "ずっと", "きっと", "たぶん", "もっと", "時々", "ときどき"}
    starts = [k for k in starts if not any(c.rstrip("、") in FLOAT for c in ch[k:k+4])]
    if not starts: return None
    k = rnd.choice(starts)
    win = ch[k:k+4]
    if len(set(win)) < 4: return None
    star = 2
    pre, post = "".join(ch[:k]), "".join(ch[k+4:]) + tail
    opts, ans_src, src = shuffle_opts(win[star], [w for idx, w in enumerate(win) if idx != star], rnd)
    q = f"{esc(pre)} ＿＿＿ ＿＿＿ ★＿＿＿ ＿＿＿ {esc(post)}".strip()
    order = [opts.index(w) for w in win]
    g = item["g"]
    full = pre + "".join(win) + post
    return {
        "id": qid, "cat": "bunpou", "tipe": "kumitate", "tipe_jp": "文の組み立て",
        "q": q, "opts": opts, "ans": ans_src, "_src": s["plain"],
        "ref": {"tipe": "bunpou", "pola": g["pola"]},
        "ex": ex_base(
            jawaban=f"{ABCD[ans_src]}. {win[star]}",
            terjemahan=s["id"],
            alasan=f"Urutan yang benar: {' → '.join(ABCD[o] for o in order)}, sehingga kalimatnya 「{full}」. Kotak ★ ada di posisi ke-3, yaitu 「{win[star]}」. Kuncinya adalah pola 「{g['pola']}」.",
            opsi=[f"{ABCD[i]}. {o} — posisi ke-{win.index(o)+1}{' (★ jawaban)' if i == ans_src else ''}" for i, o in enumerate(opts)],
            grammar={"pola": g["pola"], "arti": gram_desc(g), "rumus": short(g.get("penjelasan", ""), 400)},
            struktur=struktur(full),
            contoh=[f"{ruby_of(parse_annot(g['contoh']))} — {g.get('arti_contoh','')}"] + [f"{ruby_of(h[0]['toks'])} — {h[0]['id']}" for h in item["hits"] if h[0]["plain"] != s["plain"]][:1] if g.get("contoh") else [f"{ruby_of(s['toks'])} — {s['id']}"],
            poin="Strategi ★: (1) cari pasangan yang pasti menempel (kata benda + partikel, bentuk て + kata kerja bantu, pola tata bahasa); (2) susun dari kata yang paling dekat dengan bagian setelah kotak; (3) baru tentukan isi kotak ★.",
        ),
    }
