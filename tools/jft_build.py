#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Shirose Nihongo — pembuat soal Choukai JFT-Basic (Irodori).

Naskah : tools/jft-src/{ir0,ir1,ir2}.txt (== 1..3 = blok bab 1-6, 7-12, 13-18; 9 soal/blok → 3 paket × 3 soal)
         tools/jft-src/sim_old.txt + sim_new.txt (kolam 24 soal simulasi JFT penuh)
Hasil  : choukai/paket/n5-p901..904.json  → format sama dengan paket Choukai JLPT, sehingga workflow
         "Voice pack VOICEVOX (otomatis)" membuat MP3 (audio/choukai/jft/...) tanpa perubahan workflow.
         901=ir0, 902=ir1, 903=ir2, 904=simulasi. (Nomor paket ≥ 900 tidak muncul di daftar JLPT.)
Pakai  : python3 tools/jft_build.py
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import choukai_build as cb
ROOT = cb.ROOT
SRC = os.path.join(ROOT, "tools", "jft-src")
OUT = os.path.join(ROOT, "choukai", "paket")
FILES = {901: ("ir0", ["ir0.txt", "ir0_more.txt"]), 902: ("ir1", ["ir1.txt", "ir1_more.txt"]), 903: ("ir2", ["ir2.txt", "ir2_more.txt"]), 904: ("sim", ["sim_new.txt", "sim_old.txt"])}
INSTR = "これから 会話を 聞きます。質問を よく 聞いて、いちばん いい ものを 選んで ください。"

def build(pk):
    lv, files = FILES[pk]
    items = []; errs = []
    for fn in files:
        for sec in cb.parse(os.path.join(SRC, fn)):
            for no, it in enumerate(sec["items"], 1):
                blok = sec["mondai"] - 1
                if lv == "sim": blok = 0
                items.append((fn, blok, no, it))
    secs = []; counts = {}
    out_items = []
    for idx, (fn, blok, no, it) in enumerate(items):
        opts = [o.strip() for o in it.get("O", "").split(" / ") if o.strip()]
        try: ans = int(it.get("A", "0")) - 1
        except ValueError: ans = -1
        where = f"{fn} blok{blok + 1} #{no}"
        if len(opts) != 4: errs.append(f"{where}: pilihan {len(opts)}")
        if not 0 <= ans < len(opts): errs.append(f"{where}: kunci salah")
        if not it.get("E"): errs.append(f"{where}: pembahasan kosong")
        q = it["Q"][-1] if it.get("Q") else ""
        ck_ = blok if lv != "sim" else fn
        k = counts.setdefault(ck_, 0); counts[ck_] += 1
        iid = f"jft-{lv}-b{blok + 1}-{k + 1:02d}" if lv != "sim" else f"jft-sim-{idx + 1:02d}"
        voices = cb.assign_voices(iid, it)
        dialog = it["lines"]
        N = lambda t: {"s": "N", "t": t}
        script = [N(it.get("S", "") + q)] + dialog + [N(q)]
        used = sorted({l["s"] for l in script})
        for s in used:
            if s not in voices: errs.append(f"{where}: suara {s}")
        item = {"id": iid, "no": idx + 1, "set": it.get("S", ""), "scene": "", "dialog": dialog, "opts": opts,
                "qs": [{"q": q, "ans": ans}], "printed": True,
                "audio": f"audio/choukai/jft/{lv}/{iid}.mp3", "script": script,
                "voices": {s: voices[s] for s in used if s in voices}, "exp": it.get("E", ""),
                "lv": lv, "blok": blok, "p": k % 3}
        out_items.append(item)
    secs.append({"mondai": 1, "type": "kadai", "jp": "課題理解", "romaji": "JFT Listening", "desc": "JFT-Basic Listening",
                 "instr": INSTR, "instrVoice": "aoyama", "instrAudio": "audio/choukai/jft/instr.mp3", "items": out_items})
    data = {"level": "n5", "paket": pk, "jft": lv, "title": f"JFT {lv} (Irodori) · Choukai", "karakter": "JFT-Basic Listening", "sections": secs}
    return data, errs

def main():
    allerr = []
    for pk in FILES:
        d, errs = build(pk); allerr += errs
        json.dump(d, open(os.path.join(OUT, f"n5-p{pk}.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
        print("OK", pk, FILES[pk][0], len(d["sections"][0]["items"]), "soal")
    if allerr: print("\n".join("⚠ " + e for e in allerr)); sys.exit(1)

if __name__ == "__main__": main()
