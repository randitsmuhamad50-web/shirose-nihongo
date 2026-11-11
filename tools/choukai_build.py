#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Shirose Nihongo — pembuat paket soal Choukai dari naskah teks.

Naskah : tools/choukai-src/{level}-p{paket}.txt   (mis. n5-p2.txt)
Hasil  : choukai/paket/{level}-p{paket}.json      (format sama dengan choukai/jlpt-{level}.json)
         choukai/paket/index.json                  (daftar paket per level)
Audio  : audio/choukai/{level}/p{paket}/m{mondai}_{no}.mp3  (dibuat oleh tools/vv_build.py)

Pemakaian:  python tools/choukai_build.py            # bangun semua naskah
            python tools/choukai_build.py n5 n4      # level tertentu

FORMAT NASKAH
  == 1                  ← mulai 問題1 (tipe soal diambil dari paket 1 level tsb.)
  S 教室で先生と学生が話しています。   ← situasi (hatsuwa: kalimat situasi + 何と言いますか)
  Q 学生は明日何を持ってきますか。     ← pertanyaan (統合理解 2 soal: "Q 質問1　…=1" dst.)
  V F=no7 M=kurita      ← (opsional) petunjuk suara. Narator N selalu aoyama; pembicara lain
                          diacak dari mochiko/goki/no7/nana (F) dan kurita/sourin (M)
  C Kamu ingin …         ← (hatsuwa) keterangan gambar dalam bahasa Indonesia
  R M                   ← (opsional) siapa yang membacakan pilihan (hatsuwa / sokuji)
  F: …  M: …  F2: …  M2: …  N: …       ← baris percakapan
  O pilihan1 / pilihan2 / pilihan3 / pilihan4
  A 2                   ← kunci jawaban (1-based). 発話表現/即時応答: posisi jawaban
                          diacak otomatis supaya merata (tulis X FIX untuk mematikan)
  E Pembahasan dalam bahasa Indonesia.
  (baris kosong = soal berikutnya; baris diawali ; = komentar)
"""
import json, os, re, sys, glob, collections, hashlib, random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "choukai-src")
OUT = os.path.join(ROOT, "choukai", "paket")
DEF_V = {"N": "aoyama", "M": "kurita", "F": "mochiko", "M2": "sourin", "F2": "no7"}
SPK = re.compile(r"^(N|M2|F2|M|F)[:：]\s*(.+)$")
ROMAN = {"kadai", "point"}
NUMERIC = re.compile(r"[0-9０-９一二三四五六七八九十百千万]|時|分|円|曜日|階|番|ページ|歳|年|月")


FEMALE = ["mochiko", "goki", "no7", "nana"]
MALE = ["kurita", "sourin"]


def assign_voices(seed, it):
    """Narator (N) SELALU aoyama. Pembicara lain diacak dari 6 karakter lain
    (perempuan: mochiko/goki/no7/nana, laki-laki: kurita/sourin), tidak dobel dalam satu soal.
    Baris V hanya dipakai sebagai petunjuk peran bila suaranya bukan aoyama."""
    rnd = random.Random(seed)
    hint = {}
    for kv in it.get("V", "").split():
        k, _, v = kv.partition("=")
        if v and v != "aoyama": hint[k] = v
    out, used = {"N": "aoyama"}, set()
    for k in ("F", "F2", "M", "M2"):
        pool = FEMALE if k.startswith("F") else MALE
        h = hint.get(k)
        if h in pool and h not in used and rnd.random() < 0.5:
            v = h
        else:
            free = [x for x in pool if x not in used] or pool
            v = rnd.choice(free)
        out[k] = v; used.add(v)
    return out


def parse(path):
    secs, cur, item = [], None, None
    def flush():
        nonlocal item
        if item and cur is not None and (item.get("lines") or item.get("S") or item.get("O")):
            cur["items"].append(item)
        item = None
    for ln, raw in enumerate(open(path, encoding="utf-8"), 1):
        line = raw.rstrip("\n").strip()
        if line.startswith(";"): continue
        if not line: flush(); continue
        if line.startswith("=="):
            flush(); cur = {"mondai": int(line[2:].strip()), "items": []}; secs.append(cur); continue
        if item is None: item = {"lines": [], "Q": [], "_ln": ln}
        m = SPK.match(line)
        if m: item["lines"].append({"s": m.group(1), "t": m.group(2).strip()}); continue
        tag, _, rest = line.partition(" ")
        rest = rest.strip()
        if tag == "Q": item["Q"].append(rest)
        elif tag in ("S", "V", "C", "R", "O", "A", "E"): item[tag] = rest
        elif tag == "X": item["FIX"] = 1
        else: raise SystemExit(f"{path}:{ln}: baris tidak dikenal → {line}")
    flush()
    return secs


def build(lvl, pk):
    path = os.path.join(SRC, f"{lvl}-p{pk}.txt")
    base = json.load(open(os.path.join(ROOT, "choukai", f"jlpt-{lvl}.json"), encoding="utf-8"))
    meta = {s["mondai"]: s for s in base["sections"]}
    parsed = parse(path)
    errs = []
    out_secs = []
    for ps in parsed:
        mn = ps["mondai"]
        if mn not in meta: errs.append(f"問題{mn} tidak ada di {lvl}"); continue
        m = meta[mn]; typ = m["type"]
        sec = {k: v for k, v in m.items() if k != "items"}
        sec["items"] = []
        nopt = 3 if typ in ("hatsuwa", "sokuji") else 4
        for no, it in enumerate(ps["items"], 1):
            where = f"{lvl}-p{pk} 問題{mn} {no}番 (baris {it['_ln']})"
            opts = [o.strip() for o in it.get("O", "").split(" / ") if o.strip()]
            if len(opts) != nopt: errs.append(f"{where}: pilihan {len(opts)} (harus {nopt})")
            qs = []
            if len(it["Q"]) > 1 and not any("=" in q for q in it["Q"]):
                it["Q"] = it["Q"][-1:]          # pertanyaan ganda tanpa kunci → pakai yang terakhir
            if len(it["Q"]) > 1:
                for q in it["Q"]:
                    t, _, a = q.rpartition("=")
                    qs.append({"q": t.strip(), "ans": int(a) - 1})
            else:
                try: a = int(it.get("A", "0")) - 1
                except ValueError: a = -1
                qs.append({"q": it["Q"][0] if it["Q"] else "", "ans": a})
            for q in qs:
                if not (0 <= q["ans"] < len(opts)): errs.append(f"{where}: kunci jawaban salah ({q['ans'] + 1})")
            # 発話表現/即時応答: posisi jawaban benar diratakan (1/2/3) secara deterministik
            if typ in ("hatsuwa", "sokuji") and len(qs) == 1 and 0 <= qs[0]["ans"] < len(opts) and it.get("FIX") is None:
                tgt = ([0, 2, 1, 1, 0, 2, 2, 1, 0][(no - 1 + pk * 2 + mn) % 9]) % len(opts)
                good = opts.pop(qs[0]["ans"]); opts.insert(tgt, good); qs[0]["ans"] = tgt
            # 4 pilihan non-angka: posisi jawaban juga diratakan (pilihan berurutan angka/waktu dibiarkan)
            elif typ in ("kadai", "point", "gaiyou", "togo") and len(qs) == 1 and len(opts) == 4 \
                    and 0 <= qs[0]["ans"] < 4 and it.get("FIX") is None and not any(NUMERIC.search(o) for o in opts):
                tgt = [3, 0, 2, 1, 0, 3, 1, 2][(no - 1 + pk * 3 + mn) % 8]
                good = opts.pop(qs[0]["ans"]); opts.insert(tgt, good); qs[0]["ans"] = tgt
            voices = assign_voices(f"{lvl}-{pk}-{mn}-{no}", it)
            dialog = it["lines"]
            set_ = it.get("S", "")
            q0 = qs[0]["q"]
            multi = len(qs) > 1
            N = lambda t: {"s": "N", "t": t}
            script = [N(f"{no}番")]
            if typ in ROMAN:
                script.append(N(set_ + q0)); script += dialog; script.append(N(q0))
                printed = True
            elif typ in ("gaiyou", "togo"):
                if set_: script.append(N(set_))
                script += dialog
                if multi:
                    script.append(N("質問は二つです。")); script += [N(q["q"]) for q in qs]
                    printed = True
                else:
                    script.append(N(q0)); script += [N(f"{i + 1}、{o}") for i, o in enumerate(opts)]
                    printed = False
            elif typ == "hatsuwa":
                r = it.get("R", "F")
                script.append(N(set_)); script += [{"s": r, "t": f"{i + 1}、{o}"} for i, o in enumerate(opts)]
                printed = False
                if not it.get("C"): errs.append(f"{where}: hatsuwa butuh baris C (keterangan gambar)")
            elif typ == "sokuji":
                if len(dialog) != 1: errs.append(f"{where}: sokuji harus 1 baris ucapan")
                first = dialog[0]["s"] if dialog else "M"
                r = it.get("R") or ("M" if first.startswith("F") else "F")
                script += dialog + [{"s": r, "t": f"{i + 1}、{o}"} for i, o in enumerate(opts)]
                printed = False
            used = sorted({l["s"] for l in script})
            for s in used:
                if s not in voices: errs.append(f"{where}: suara untuk {s} belum diatur")
            iid = f"{lvl}-p{pk}-m{mn}-{no:02d}"
            sec["items"].append({
                "id": iid, "no": no, "set": set_, "scene": it.get("C", ""),
                "dialog": dialog, "opts": opts, "qs": qs, "printed": printed,
                "audio": f"audio/choukai/{lvl}/p{pk}/m{mn}_{no:02d}.mp3",
                "script": script, "voices": {s: voices[s] for s in used if s in voices},
                "exp": it.get("E", ""),
            })
            if not it.get("E"): errs.append(f"{where}: pembahasan (E) kosong")
        want = len(m["items"]); got = len(sec["items"])
        if want != got: errs.append(f"{lvl}-p{pk} 問題{mn}: {got} soal (paket 1 punya {want})")
        out_secs.append(sec)
    if [s["mondai"] for s in out_secs] != [s["mondai"] for s in base["sections"]]:
        errs.append(f"{lvl}-p{pk}: susunan 問題 {[s['mondai'] for s in out_secs]} ≠ paket 1")
    data = {"level": lvl, "paket": pk, "title": f"{base['title']} · Paket {pk}",
            "karakter": base["karakter"], "sections": out_secs}
    return data, errs


def main(levels):
    os.makedirs(OUT, exist_ok=True)
    idx_path = os.path.join(OUT, "index.json")
    index = json.load(open(idx_path, encoding="utf-8")) if os.path.exists(idx_path) else {}
    all_errs = []
    for path in sorted(glob.glob(os.path.join(SRC, "*.txt"))):
        m = re.match(r"(n[1-5])-p(\d+)\.txt$", os.path.basename(path))
        if not m or (levels and m.group(1) not in levels): continue
        lvl, pk = m.group(1), int(m.group(2))
        data, errs = build(lvl, pk)
        all_errs += errs
        if lvl == "n3":  # gambar adegan/pilihan (assets/jlpt/img); level lain menyusul
            sys.path.insert(0, os.path.join(ROOT, "tools", "jlpt_img"))
            from attach import attach
            for sec in data["sections"]:
                for it in sec["items"]: attach(it, sec["type"], it["id"], it["set"], it["opts"])
        json.dump(data, open(os.path.join(OUT, f"{lvl}-p{pk}.json"), "w", encoding="utf-8"),
                  ensure_ascii=False, separators=(",", ":"))
        pk_list = sorted(set(index.get(lvl, []) + [pk]))
        index[lvl] = pk_list
        dist = collections.Counter(q["ans"] + 1 for s in data["sections"] for i in s["items"] for q in i["qs"])
        n = sum(len(s["items"]) for s in data["sections"])
        print(f"OK {lvl}-p{pk}: {n} soal · sebaran kunci {dict(sorted(dist.items()))}")
    json.dump(index, open(idx_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    if all_errs:
        print("\n".join("⚠ " + e for e in all_errs)); sys.exit(1)


if __name__ == "__main__":
    main(sys.argv[1:])
