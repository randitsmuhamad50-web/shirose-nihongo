# -*- coding: utf-8 -*-
"""
Bangun bank soal JLPT Shirose Nihongo → folder ./jlpt/

  python3 tools/jlpt_build.py

Hasil:
  jlpt/index.json                 daftar paket per level & kategori
  jlpt/n5/full-01.json … full-10  Full Exam (Kanji, Kotoba, Bunpou, Dokkai, Choukai)
  jlpt/n5/kanji-01.json … -20     Latihan Kanji
  jlpt/n5/kotoba-01.json … -20    Latihan Kotoba
  jlpt/n5/bunpou-01.json … -20    Latihan Bunpou
(sama untuk n4, n3, n2, n1)

Deterministik (seed tetap) supaya hasil bisa direproduksi.
"""
import json, os, random, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from jlpt_core import Bank, LEVELS, LV_IDX, ROOT, load, parse_annot, plain_of
from jlpt_gen import (Targets, GramPool, make_yomi, make_hyouki, make_bunmyaku, make_imi, make_iikae, make_youhou,
                      make_bunpou_form, make_bunpou_star, ABCD)
import jlpt_content as JC

OUT = os.path.join(ROOT, "jlpt")

INSTR = {
    "yomi":     ("漢字読み", "kanji", "＿＿＿の ことばは ひらがなで どう 書きますか。1・2・3・4から いちばん いい ものを 一つ えらんで ください。"),
    "hyouki":   ("表記", "kanji", "＿＿＿の ことばは どう 書きますか。いちばん いい ものを 一つ えらんで ください。"),
    "bunmyaku": ("文脈規定", "kotoba", "（　　　）に なにを 入れますか。いちばん いい ものを 一つ えらんで ください。"),
    "imi":      ("語彙の意味", "kotoba", "＿＿＿の ことばの いみとして いちばん 近い ものを 一つ えらんで ください。"),
    "iikae":    ("言い換え類義", "kotoba", "＿＿＿の ことばに いみが いちばん 近い ものを 一つ えらんで ください。"),
    "settou":   ("接頭辞・接尾辞", "kotoba", "（　）に 入れるのに いちばん いい ものを 一つ えらんで ください。"),
    "youhou":   ("用法", "kotoba", "つぎの ことばの つかいかたとして いちばん いい ものを 一つ えらんで ください。"),
    "keishiki": ("文法形式の判断", "bunpou", "つぎの 文の（　　　）に 入れるのに いちばん いい ものを 一つ えらんで ください。"),
    "kumitate": ("文の組み立て", "bunpou", "つぎの 文の ★ に 入る いちばん いい ものを 一つ えらんで ください。"),
    "bunshou":  ("文章の文法", "bunpou", "つぎの 文章を 読んで、（　）に 入れるのに いちばん いい ものを 一つ えらんで ください。"),
    "dokkai":   ("読解", "dokkai", "つぎの 文章を 読んで、しつもんに こたえて ください。答えは 1・2・3・4から いちばん いい ものを 一つ えらんで ください。"),
    "choukai":  ("聴解", "choukai", "▶ を押して音声を聞いてから、いちばんいいものを一つえらんでください。音声はテキスト読み上げ（TTS）または録音です。"),
}
JUDUL = {"yomi": "Cara baca kanji", "hyouki": "Penulisan kanji", "bunmyaku": "Kosakata sesuai konteks",
         "imi": "Makna kosakata", "iikae": "Sinonim / parafrasa", "settou": "Imbuhan (awalan/akhiran)", "youhou": "Penggunaan kosakata",
         "keishiki": "Bentuk tata bahasa", "kumitate": "Menyusun kalimat (★)", "bunshou": "Tata bahasa dalam teks",
         "dokkai": "Pemahaman bacaan", "choukai": "Pemahaman mendengar"}

# Full Exam baru (mengikuti pola Mondai JLPT247): tepat 60 soal Moji-Goi + Bunpou + Dokkai,
# lalu Choukai di-CLONE penuh dari paket choukai level itu (bagian tersendiri).
#   mojigoi/bunpou: daftar (tipe, jumlah) · dokkai: jumlah soal · (total mojigoi+bunpou+dokkai = 60)
FULL_PLAN = {
    "n5": {"mojigoi": [("yomi", 8), ("hyouki", 7), ("bunmyaku", 8), ("iikae", 6)],
           "bunpou": [("keishiki", 16), ("kumitate", 5), ("bunshou", 3)], "dokkai": 7},
    "n4": {"mojigoi": [("yomi", 7), ("hyouki", 6), ("bunmyaku", 6), ("iikae", 5), ("youhou", 5)],
           "bunpou": [("keishiki", 14), ("kumitate", 5), ("bunshou", 3)], "dokkai": 9},
    "n3": {"mojigoi": [("yomi", 7), ("hyouki", 6), ("bunmyaku", 6), ("iikae", 5), ("youhou", 5)],
           "bunpou": [("keishiki", 12), ("kumitate", 4), ("bunshou", 2)], "dokkai": 13},
    "n2": {"mojigoi": [("yomi", 5), ("hyouki", 5), ("settou", 4), ("bunmyaku", 4), ("iikae", 4), ("youhou", 3)],
           "bunpou": [("keishiki", 12), ("kumitate", 4), ("bunshou", 2)], "dokkai": 17},
    "n1": {"mojigoi": [("yomi", 5), ("hyouki", 4), ("settou", 4), ("bunmyaku", 4), ("iikae", 4), ("youhou", 4)],
           "bunpou": [("keishiki", 12), ("kumitate", 4), ("bunshou", 2)], "dokkai": 17},
}
DOKKAI_TARGET = {"n5": 7, "n4": 9, "n3": 13, "n2": 17, "n1": 17}
PRACTICE = {"kanji": ["yomi", "hyouki"], "kotoba": ["bunmyaku", "imi", "iikae", "youhou"], "bunpou": ["keishiki", "kumitate"]}
CAT_NAME = {"kanji": "Kanji", "kotoba": "Kotoba", "bunpou": "Bunpou"}

def key_of(q):
    r = q.get("ref", {})
    return r.get("kata") or r.get("pola") or q["q"]

def build_pools(bank, lv, rnd):
    TK = Targets(bank, lv, "kanji")
    TV = Targets(bank, lv, "kotoba")
    G = GramPool(bank, lv)
    pools = {k: [] for k in ["yomi", "hyouki", "bunmyaku", "imi", "iikae", "youhou", "keishiki", "kumitate"]}
    def run(name, items, fn):
        items = items[:]; rnd.shuffle(items)
        seen = set()
        for t in items:
            q = fn(t)
            if q and q["q"] not in seen:
                seen.add(q["q"]); pools[name].append(q)
    run("yomi", TK.items, lambda t: make_yomi(bank, t, lv, rnd, ""))
    run("hyouki", TK.items, lambda t: make_hyouki(bank, t, lv, rnd, ""))
    run("bunmyaku", TV.items, lambda t: make_bunmyaku(bank, t, lv, rnd, "", TV.items))
    run("imi", TV.items, lambda t: make_imi(bank, t, lv, rnd, "", TV.items))
    run("iikae", TV.items, lambda t: make_iikae(bank, t, lv, rnd, "", TV.items))
    run("youhou", TV.items, lambda t: make_youhou(bank, t, lv, rnd, "", TV.items))
    seen = set()
    for it in G.items:
        for hi in range(len(it["hits"])):
            q = make_bunpou_form(bank, G, it, hi, lv, rnd, "")
            if q and q["q"] not in seen:
                seen.add(q["q"]); pools["keishiki"].append(q)
    seen = set()
    for it in G.items:
        for hi in range(len(it["hits"])):
            q = make_bunpou_star(bank, G, it, hi, lv, rnd, "")
            if q and q["_src"] not in seen:
                seen.add(q["_src"]); pools["kumitate"].append(q)
    for c in bank.corpus:
        if abs(LV_IDX[c["lv"]] - LV_IDX[lv]) > 1: continue
        q = make_bunpou_star(bank, G, None, 0, lv, rnd, "", sent=c)
        if q and q["_src"] not in seen:
            seen.add(q["_src"]); pools["kumitate"].append(q)
    stem_seen = set()
    for k in pools:
        uniq = []
        for q in pools[k]:
            if q["q"] in stem_seen and k != "kumitate": continue
            stem_seen.add(q["q"]); q.pop("_src", None); uniq.append(q)
        pools[k] = uniq
        rnd.shuffle(pools[k])
    # variasi pola: keishiki diurutkan supaya pola yang sama tidak menumpuk
    for k in ("keishiki", "kumitate"):
        by = {}
        for q in pools[k]: by.setdefault(key_of(q), []).append(q)
        order, keys = [], list(by)
        rnd.shuffle(keys)
        while any(by.values()):
            for kk in keys:
                if by[kk]: order.append(by[kk].pop())
        pools[k] = order
    return pools

def take(pool, n, used_keys):
    out = []
    i = 0
    while i < len(pool) and len(out) < n:
        q = pool[i]
        if key_of(q) not in used_keys:
            out.append(pool.pop(i)); used_keys.add(key_of(q))
        else:
            i += 1
    return out

def section(tipe, mondai, items, extra=None):
    jp, cat, instr = INSTR[tipe]
    s = {"mondai": mondai, "tipe": tipe, "cat": cat, "tipe_jp": jp, "judul": JUDUL[tipe], "instr": instr, "items": items}
    if extra: s.update(extra)
    return s

def number(pkg):
    n = 0
    for s in pkg["sections"]:
        for q in s["items"]:
            n += 1
            q["no"] = n
            q["id"] = f"{pkg['id']}-q{n:02d}"
            q.setdefault("cat", s["cat"])
            q.setdefault("tipe_jp", s["tipe_jp"])
    pkg["jumlah"] = n
    return pkg

# ------------------------------------------------------------------ dokkai & choukai
def dokkai_items(rnd, lv, exam_no, pkg_id):
    target = DOKKAI_TARGET[lv]
    passages, seen_jp, seen_q, cnt, k = [], set(), set(), 0, 0
    # kumpulkan bacaan sampai target soal UNIK (dedup teks bacaan & teks pertanyaan)
    while cnt < target and k < 60:
        for p in JC.dokkai_set(rnd, lv, exam_no + k):
            if cnt >= target: break
            if p["jp"] in seen_jp: continue
            qs = [q for q in p["qs"] if q["q"] not in seen_q]
            if not qs: continue
            qs = qs[: target - cnt]
            for q in qs: seen_q.add(q["q"])
            seen_jp.add(p["jp"]); passages.append({**p, "qs": qs}); cnt += len(qs)
        k += 1
    items, store = [], {}
    for pi, p in enumerate(passages):
        pid = f"p{pi+1}"
        store[pid] = {"jenis": p["jenis"], "jp": p["jp"], "id": p["id"], "info": bool(p.get("info"))}
        for qq in p["qs"]:
            items.append({
                "cat": "dokkai", "tipe": "dokkai", "tipe_jp": "読解", "pid": pid,
                "q": qq["q"], "opts": qq["opts"], "ans": qq["ans"],
                "ex": {
                    "jawaban": f"{ABCD[qq['ans']]}. {qq['opts'][qq['ans']]}",
                    "terjemahan": p["id"],
                    "alasan": qq["alasan"],
                    "bukti": qq["bukti"],
                    "opsi": qq["opsi"],
                    "kosakata": qq.get("kosakata") or None,
                    "poin": ("Untuk soal 情報検索, baca syarat di pertanyaan dulu, lalu coret pilihan di tabel satu per satu."
                             if p.get("info") else
                             "Cari kalimat kunci (biasanya di akhir paragraf atau setelah しかし/つまり/～のだ). Pilihan yang benar adalah parafrase dari kalimat itu."),
                },
            })
    return items, store

def real_choukai(lv):
    try:
        d = load(f"choukai/jlpt-{lv}.json")
    except Exception:
        return []
    out = []
    for s in d.get("sections", []):
        for it in s.get("items", []):
            for qi, qq in enumerate(it.get("qs", [])):
                out.append({"sec": s, "it": it, "qi": qi, "q": qq})
    return out

def ck_from_real(r):
    s, it, qq = r["sec"], r["it"], r["q"]
    opts = it["opts"] if len(it.get("qs", [])) <= 1 or not isinstance(it["opts"][0], list) else it["opts"][r["qi"]]
    ans = qq["ans"]
    dialog = [{"s": x["s"], "t": x["t"]} for x in it.get("dialog", [])]
    return {
        "cat": "choukai", "tipe": "choukai", "tipe_jp": s.get("jp", "聴解"),
        "q": qq.get("q") or "（Dengarkan, lalu pilih tanggapan yang paling tepat.）",
        "opts": opts, "ans": ans,
        "ck": {"set": it.get("set", ""), "audio": it.get("audio"), "script": it.get("script"), "voices": it.get("voices"),
               "printed": it.get("printed", True), "dialog": dialog, "jenis": s.get("jp")},
        "ex": {
            "jawaban": f"{ABCD[ans] if ans < 4 else ans+1}. {opts[ans]}",
            "terjemahan": "Ringkasan: " + (it.get("exp") or ""),
            "alasan": it.get("exp") or "",
            "transkrip": [f"{x['s']}: {x['t']}" for x in (it.get("script") or dialog)],
            "opsi": [f"{ABCD[i]}. {o}{' — BENAR' if i == ans else ''}" for i, o in enumerate(opts)],
            "poin": {"kadai": "課題理解: fokus pada apa yang dilakukan PERTAMA/SELANJUTNYA; tugas yang dibatalkan atau sudah selesai adalah pengecoh.",
                     "point": "ポイント理解: dengar pertanyaannya dulu (alasan? waktu?), lalu cari jawaban yang dikonfirmasi, bukan yang dibantah.",
                     "gaiyou": "概要理解: tangkap topik & maksud utama pembicara, bukan detail.",
                     "hatsuwa": "発話表現: pilih ungkapan yang pantas untuk situasi pada gambar/keterangan.",
                     "sokuji": "即時応答: tanggapi ucapan secara langsung — perhatikan nada (meminta, menawarkan, mengeluh).",
                     "togo": "統合理解: bandingkan beberapa informasi lalu cocokkan dengan syarat tiap pembicara."}.get(s.get("type"), ""),
        },
    }

def ck_from_template(t, no):
    script = [{"s": "N", "t": f"{no}番"}, {"s": "N", "t": t["set"] + t["q"]}] + [{"s": s, "t": x} for s, x in t["dialog"]] + [{"s": "N", "t": t["q"]}]
    voices = {"N": "aoyama", "F": "mochiko", "M": "kurita"}
    return {
        "cat": "choukai", "tipe": "choukai", "tipe_jp": t["jp"],
        "q": t["q"], "opts": t["opts"], "ans": t["ans"],
        "ck": {"set": t["set"], "audio": None, "script": script, "voices": voices, "printed": True,
               "dialog": [{"s": s, "t": x} for s, x in t["dialog"]], "jenis": t["jp"]},
        "ex": {
            "jawaban": f"{ABCD[t['ans']]}. {t['opts'][t['ans']]}",
            "terjemahan": " / ".join(t["tr"]),
            "alasan": t["alasan"],
            "bukti": t["bukti"],
            "transkrip": [f"{s}: {x}" for s, x in t["dialog"]],
            "opsi": [f"{ABCD[i]}. {o}{' — BENAR' if i == t['ans'] else ' — Salah'}" for i, o in enumerate(t["opts"])],
            "poin": "Dengarkan sampai akhir: dalam percakapan JLPT, rencana awal sering diubah di tengah (でも／じゃあ／あ、それから)."
                    if t["tipe"] == "kadai" else
                    "Bedakan informasi yang DITOLAK (ちょっと…／違うよ) dan yang DISEPAKATI (じゃあ／～にしましょう).",
        },
    }

def ck_from_sokuji(x, no):
    line, opts, ans, alasan, tr = x
    script = [{"s": "N", "t": f"{no}番"}, {"s": "F", "t": line}] + [{"s": "M", "t": f"{i+1}、{o}"} for i, o in enumerate(opts)]
    return {
        "cat": "choukai", "tipe": "choukai", "tipe_jp": "即時応答",
        "q": "（Dengarkan ucapannya, lalu pilih tanggapan yang paling tepat.）", "opts": opts, "ans": ans,
        "ck": {"set": "", "audio": None, "script": script, "voices": {"N": "aoyama", "F": "mochiko", "M": "kurita"},
               "printed": False, "dialog": [{"s": "F", "t": line}], "jenis": "即時応答"},
        "ex": {
            "jawaban": f"{ans+1}. {opts[ans]}",
            "terjemahan": f"Ucapan: \"{tr}\"",
            "alasan": alasan,
            "transkrip": [f"F: {line}"] + [f"{i+1}. {o}" for i, o in enumerate(opts)],
            "opsi": [f"{i+1}. {o}{' — BENAR' if i == ans else ' — Salah: tidak nyambung dengan ucapan / bentuk tanggapan keliru.'}" for i, o in enumerate(opts)],
            "poin": "即時応答 menguji refleks: kenali fungsi ucapan (meminta, menawarkan, memuji, mengeluh) lalu pilih tanggapan yang pas secara sosial.",
        },
    }

def paket_choukai(lv, exam_no):
    """Paket Choukai guru: paket 1 = choukai/jlpt-{lv}.json, paket 2–10 = choukai/paket/{lv}-p{n}.json."""
    f = f"choukai/jlpt-{lv}.json" if exam_no == 0 else f"choukai/paket/{lv}-p{exam_no+1}.json"
    try:
        d = load(f)
    except Exception:
        return None
    return d

def choukai_items(rnd, lv, exam_no, real):
    items = []
    pk = paket_choukai(lv, exam_no)
    if pk:
        # Pakai paket Choukai Shirose milik guru (satu paket per Full Exam → tidak ada yang sama).
        ambil = {"kadai": 2, "point": 2, "gaiyou": 1, "hatsuwa": 1, "sokuji": 3, "togo": 1}
        for sec in pk.get("sections", []):
            its = sec.get("items", [])[: ambil.get(sec.get("type"), 1)]
            for it in its:
                for qi, qq in enumerate(it.get("qs", [])[:1]):
                    items.append(ck_from_real({"sec": sec, "it": it, "qi": qi, "q": qq}))
        if len(items) >= 6:
            return items
    # Level tanpa paket tambahan: soal rekaman yang ada (bergantian) + template + 即時応答.
    per = max(2, min(3, len(real) // 10))
    for k in range(per):
        idx = exam_no * per + k
        if idx < len(real):
            items.append(ck_from_real(real[idx]))
    fns, band = JC.choukai_templates(lv)
    for f in fns:
        items.append(ck_from_template(f(rnd, lv), len(items) + 1))
    sok = JC.SOKUJI[band]
    for k in range(3):
        x = sok[(exam_no * 3 + k) % len(sok)]
        opts = x[1][:]
        correct = opts[x[2]]
        rnd.shuffle(opts)
        items.append(ck_from_sokuji((x[0], opts, opts.index(correct), x[3], x[4]), len(items) + 1))
    return items

def choukai_packages(lv):
    """Semua paket Choukai level ini, berurutan: jlpt-{lv}.json, lalu paket/{lv}-p2..p20."""
    pkgs = []
    try:
        pkgs.append(load(f"choukai/jlpt-{lv}.json"))
    except Exception:
        pass
    for n in range(2, 21):
        try:
            pkgs.append(load(f"choukai/paket/{lv}-p{n}.json"))
        except Exception:
            pass
    return pkgs

CK_JUDUL = {"課題理解": "Pemahaman tugas", "ポイント理解": "Pemahaman poin", "概要理解": "Pemahaman garis besar",
            "発話表現": "Ungkapan lisan", "即時応答": "Respons langsung", "統合理解": "Pemahaman terpadu"}

def choukai_clone_sections(lv, exam_no, mondai_start):
    """CLONE penuh satu paket Choukai level ini (bagian tersendiri di Full Test).
    Satu Mondai per section sumber; semua soal ikut. ID baru diberikan oleh number()."""
    pkgs = choukai_packages(lv)
    if not pkgs:
        return []
    pk = pkgs[exam_no % len(pkgs)]
    secs, m = [], mondai_start
    for s in pk.get("sections", []):
        items = []
        for it in s.get("items", []):
            for qi, qq in enumerate(it.get("qs", [])):
                items.append(ck_from_real({"sec": s, "it": it, "qi": qi, "q": qq}))
        if not items:
            continue
        m += 1
        jp = s.get("jp", "聴解")
        secs.append({"mondai": m, "tipe": "choukai", "cat": "choukai", "tipe_jp": jp,
                     "judul": CK_JUDUL.get(jp, "Pemahaman mendengar"), "instr": INSTR["choukai"][2],
                     "items": items, "choukai": True, "src": pk.get("title", "")})
    return secs

# ------------------------------------------------------------------ main
def main():
    bank = Bank()
    os.makedirs(OUT, exist_ok=True)
    index = {"versi": 1, "dibuat": "otomatis oleh tools/jlpt_build.py", "level": {}}
    total_q = 0
    for lv in LEVELS:
        rnd = random.Random(f"shirose-{lv}-2026")
        pools = build_pools(bank, lv, rnd)
        print(lv, {k: len(v) for k, v in pools.items()})
        os.makedirs(os.path.join(OUT, lv), exist_ok=True)
        real = real_choukai(lv)
        lvl_index = {"full": [], "kanji": [], "kotoba": [], "bunpou": []}
        # ---------- FULL EXAM
        POOL = {"yomi", "hyouki", "bunmyaku", "imi", "iikae", "youhou", "keishiki", "kumitate"}
        masters = {k: pools[k][:] for k in pools}  # cadangan: isi ulang bila pool kecil habis
        def build_sec(tipe, n, used, m):
            if tipe in POOL:
                its = take(pools[tipe], n, used)
                if len(its) < n:  # pool habis (mis. kumitate kecil) → ambil dari master, unik per-paket
                    for q in masters.get(tipe, []):
                        if len(its) >= n: break
                        if key_of(q) not in used:
                            used.add(key_of(q)); its.append(q)
            elif tipe == "bunshou":
                its = JC.bunshou_items(rnd, lv, n)
            elif tipe == "settou":
                its = JC.settou_items(rnd, lv, n)
            else:
                its = []
            return section(tipe, m, its) if its else None
        plan = FULL_PLAN[lv]
        for e in range(10):
            pid = f"{lv}-full-{e+1:02d}"
            used = set()
            secs, m = [], 0
            for tipe, n in plan["mojigoi"] + plan["bunpou"]:
                s = build_sec(tipe, n, used, m + 1)
                if s: m += 1; secs.append(s)
            d_items, passages = dokkai_items(rnd, lv, e, pid)
            m += 1; secs.append(section("dokkai", m, d_items))
            # jamin tepat 60 soal utama: bila dokkai kurang dari target (variasi bacaan terbatas),
            # tambal ke 60 dari pool 文脈規定 (unik dalam paket)
            nmain = sum(len(s["items"]) for s in secs if s["cat"] != "choukai")
            if nmain < 60:
                extra = build_sec("bunmyaku", 60 - nmain, used, 0)
                tgt = next((s for s in secs if s["tipe"] == "bunmyaku"), None)
                if extra and tgt:
                    tgt["items"].extend(extra["items"])
            for s in choukai_clone_sections(lv, e, m):
                m = s["mondai"]; secs.append(s)
            pkg = number({"id": pid, "lv": lv, "jenis": "full", "judul": f"JLPT {lv.upper()} Full Exam {e+1:02d}",
                          "durasi": 70, "sections": secs, "passages": passages})
            json.dump(pkg, open(os.path.join(OUT, lv, f"full-{e+1:02d}.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
            lvl_index["full"].append({"id": pid, "file": f"{lv}/full-{e+1:02d}.json", "judul": pkg["judul"], "jumlah": pkg["jumlah"],
                                      "durasi": 70, "mondai": [f"{s['tipe_jp']} ({len(s['items'])})" for s in secs]})
            total_q += pkg["jumlah"]
        # ---------- PRACTICE
        for cat, tipes in PRACTICE.items():
            rest = {t: pools[t] for t in tipes}
            total = sum(len(v) for v in rest.values())
            per_pkg = max(1, min(20, total // 20))
            for p in range(20):
                pid = f"{lv}-{cat}-{p+1:02d}"
                used = set()
                secs = []
                # bagi kuota per tipe proporsional sisa
                rem_total = sum(len(rest[t]) for t in tipes)
                if rem_total == 0: break
                quota = {}
                for t in tipes:
                    quota[t] = round(per_pkg * len(rest[t]) / rem_total) if rem_total else 0
                diff = per_pkg - sum(quota.values())
                for t in sorted(tipes, key=lambda t: -len(rest[t])):
                    if diff == 0: break
                    step = 1 if diff > 0 else -1
                    if quota[t] + step >= 0:
                        quota[t] += step; diff -= step
                for mi, t in enumerate(tipes):
                    its = take(rest[t], quota[t], used)
                    if its: secs.append(section(t, len(secs) + 1, its))
                if not secs: break
                pkg = number({"id": pid, "lv": lv, "jenis": cat, "judul": f"{CAT_NAME[cat]} Practice {p+1:02d}",
                              "durasi": 20, "sections": secs, "passages": {}})
                json.dump(pkg, open(os.path.join(OUT, lv, f"{cat}-{p+1:02d}.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
                lvl_index[cat].append({"id": pid, "file": f"{lv}/{cat}-{p+1:02d}.json", "judul": pkg["judul"], "jumlah": pkg["jumlah"],
                                       "durasi": 20, "mondai": [f"{s['tipe_jp']} ({len(s['items'])})" for s in secs]})
                total_q += pkg["jumlah"]
        index["level"][lv] = lvl_index
        print("  ", lv, {k: (len(v), sum(x["jumlah"] for x in v)) for k, v in lvl_index.items()})
    index["total_soal"] = total_q
    json.dump(index, open(os.path.join(OUT, "index.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("TOTAL soal:", total_q)

if __name__ == "__main__":
    main()
