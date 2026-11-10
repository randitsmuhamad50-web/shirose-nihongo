# -*- coding: utf-8 -*-
"""Bangun data/ssw/building-cleaning/vocab.json (bank kosakata terintegrasi) dan
data/kosakata-ssw-bc.json (format kosakata lama, supaya pipeline audio VOICEVOX membuat suara otomatis).
Duplikat (kata sama) digabung: satu kata, banyak sumber subbab."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from vocab_bc import BABS
from vocab_bc2 import BAB2, BAB3
BABS["bab2"] = BAB2; BABS["bab3"] = BAB3
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
items, seen = [], {}
for bab, lst in BABS.items():
    for (kata, kana, romaji, arti, cat, src, contoh, arti_c) in lst:
        if kata in seen:
            e = seen[kata]
            for s in src:
                if s not in e["src"]: e["src"].append(s)
            continue
        e = {"id": f"bc-{len(items)+1:03d}", "kata": kata, "kana": kana, "romaji": romaji, "arti": arti, "cat": cat, "bab": bab, "src": list(src)}
        if contoh: e["contoh"] = contoh; e["arti_contoh"] = arti_c
        seen[kata] = e; items.append(e)
out = os.path.join(ROOT, "data", "ssw", "building-cleaning")
from vocab_auto import extend
print("kata otomatis:", extend(items, ROOT))
json.dump({"items": items}, open(os.path.join(out, "vocab.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
br = lambda t: re.sub(r"\{([^|{}]+)\|([^{}]+)\}", r"\1[\2]", t)
old = [{"kata": e["kata"], "kana": e["kana"], "arti": e["arti"], **({"contoh": br(e["contoh"]), "arti_contoh": e["arti_contoh"]} if e.get("contoh") else {})} for e in items]
json.dump(old, open(os.path.join(ROOT, "data", "kosakata-ssw-bc.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(items), "kata")

# ---------------- kuis ----------------
from quiz_bc import CHAPTERS
from quiz_bc2 import BAB2 as QB2, BAB3 as QB3
CHAPTERS["bab2"] = QB2; CHAPTERS["bab3"] = QB3
# furigana otomatis untuk kata yang dikenal
def rb(kata, kana):
    k, r = kata, kana
    while k and r and k[-1] == r[-1] and not ("一" <= k[-1] <= "鿿"): k, r = k[:-1], r[:-1]
    return (k, r) if k and r and any("一" <= c <= "鿿" for c in k) else None
EXTRA = {"次": "つぎ", "仕事": "しごと", "流": "なが", "病気": "びょうき", "出勤": "しゅっきん", "友達": "ともだち", "机": "つくえ", "自分": "じぶん", "片付": "かたづ", "誰": "だれ", "報告": "ほうこく", "不要": "ふよう", "意味": "いみ", "最": "さい", "角度": "かくど", "毎日": "まいにち", "毎朝": "まいあさ", "落": "お", "取": "と", "守": "まも", "月": "つき", "一度": "いちど", "掃除": "そうじ", "知識": "ちしき", "原則": "げんそく", "番目": "ばんめ", "正": "ただ", "姿勢": "しせい", "態度": "たいど", "相手": "あいて", "目": "め", "見": "み", "話": "はな", "丁寧": "ていねい", "言葉": "ことば", "作業": "さぎょう", "指示": "しじ", "情報": "じょうほう", "問題": "もんだい", "責任": "せきにん", "改善": "かいぜん", "点": "てん", "具体的": "ぐたいてき", "判断": "はんだん", "勝手": "かって", "困": "こま", "会議": "かいぎ", "大切": "たいせつ", "遅": "おく", "少": "すこ", "携帯": "けいたい", "使": "つか", "競争": "きょうそう", "基本的": "きほんてき", "上司": "じょうし", "同僚": "どうりょう", "決": "き", "任": "まか", "気": "き", "家": "いえ", "帰": "かえ", "終": "お", "来": "く", "休": "やす", "私用": "しよう", "会社": "かいしゃ", "電話": "でんわ", "機": "き", "必": "かなら", "要": "よう", "届出": "とどけで", "連絡": "れんらく", "確認": "かくにん", "完了": "かんりょう", "反省": "はんせい", "後": "あと", "茶器": "ちゃき", "使用": "しよう", "共有": "きょうゆう", "明確": "めいかく", "内容": "ないよう", "言": "い", "訳": "わけ", "伝": "つた", "受": "う", "聞": "き", "考": "かんが", "待": "ま", "書": "か", "深": "ふか", "高": "たか", "色": "いろ", "洗": "あら", "掃除": "そうじ", "汚": "よご", "除去": "じょきょ", "建材": "けんざい", "維持": "いじ", "床": "ゆか", "空": "あ", "箱": "ばこ", "毎": "まい", "朝": "あさ", "客": "きゃく", "様": "さま", "笑顔": "えがお", "熱心": "ねっしん", "尊敬": "そんけい", "清潔": "せいけつ", "整頓": "せいとん", "出席": "しゅっせき", "終了": "しゅうりょう", "良": "よ", "同": "おな", "接": "せっ", "競": "きょう", "争": "そう", "日": "ひ", "月": "つき", "一": "いち", "二": "に", "三": "さん", "四": "よん", "五": "ご", "七": "なな", "十": "じゅう", "以上": "いじょう", "場所": "ばしょ", "時間": "じかん", "社": "しゃ", "近": "ちか", "正しい": "ただしい"}
DICT = {}
for e in items:
    w = rb(e["kata"], e["kana"])
    if w and len(w[0]) > 1: DICT[w[0]] = w[1]
DICT.update({k: v for k, v in EXTRA.items() if k not in DICT})
# kata bertanda okurigana: kunci -> (dasar, bacaan, ekor)
TAIL = {"何の": ("何", "なん", "の"), "何も": ("何", "なに", "も"), "食べ": ("食", "た", "べ"), "保つ": ("保", "たも", "つ"), "働き": ("働", "はたら", "き"),
        "補い": ("補", "おぎな", "い"), "覚える": ("覚", "おぼ", "える"), "曲げ": ("曲", "ま", "げ"), "忙し": ("忙", "いそが", "し"), "お詫び": ("詫", "わ", "び"),
        "人通り": ("通", "とお", "り"), "危な": ("危", "あぶ", "な"), "固い": ("固", "かた", "い"), "治って": ("治", "なお", "って"), "先に": ("先", "さき", "に"),
        "外して": ("外", "はず", "して"), "増や": ("増", "ふ", "や"), "消す": ("消", "け", "す"), "放って": ("放", "ほう", "って"), "変わ": ("変", "か", "わ"),
        "節約": ("節約", "せつやく", ""), "小さ": ("小", "ちい", "さ"), "簡単": ("簡単", "かんたん", "")}
for _ln in open(os.path.join(ROOT, "tools", "ssw", "src", "ruby_pairs.txt"), encoding="utf-8"):
    _p = _ln.strip().split("|")
    if len(_p) < 2 or not _p[0] or not _p[1]: continue
    _ok = [x for x in (_p[2].split(",") if len(_p) > 2 else []) if x]
    if _ok:
        for x in _ok: TAIL.setdefault(_p[0] + x, (_p[0], _p[1], x))
    elif len(_p[0]) > 1 and _p[0] not in DICT: DICT[_p[0]] = _p[1]
for _k, _v in {"制服": "せいふく", "苦情": "くじょう", "優先": "ゆうせん", "金属": "きんぞく", "天井": "てんじょう", "屋根": "やね", "略": "りゃく", "約": "やく",
               "絵": "え", "初": "しょ", "栓": "せん", "布": "ぬの", "感染": "かんせん", "有毒": "ゆうどく", "塩素": "えんそ", "酸": "さん", "衝突": "しょうとつ",
               "火事": "かじ", "材質": "ざいしつ", "大理石": "だいりせき", "特有": "とくゆう", "油性": "ゆせい", "予防": "よぼう", "準備": "じゅんび", "操作": "そうさ",
               "作業": "さぎょう", "後片付け": "あとかたづけ", "仕上げ": "しあげ", "部屋": "へや", "出口": "でぐち", "自動": "じどう", "全部": "ぜんぶ", "列": "れつ",
               "砂": "すな", "木": "き", "車": "くるま", "説明": "せつめい", "回収": "かいしゅう", "年": "ねん", "回": "かい", "水栓": "すいせん", "拭": "ふ", "辞儀": "じぎ", "何": "なん", "先": "さき", "通": "とお", "放": "ほう", "補助具": "ほじょぐ", "低": "ひく", "建": "けん", "材": "ざい"}.items():
    DICT[_k] = _v
KEYS = sorted(set(DICT) | set(TAIL), key=len, reverse=True)
def auto(t):
    if not t: return t
    parts = re.split(r"(\{[^|{}]+\|[^{}]+\})", t)      # bagian yang sudah diberi ruby manual dibiarkan
    res = []
    for seg in parts:
        if seg.startswith("{") and "|" in seg: res.append(seg); continue
        out, i = "", 0
        while i < len(seg):
            for k in KEYS:
                if seg.startswith(k, i):
                    if k in TAIL: b, r, tl = TAIL[k]; out += "{%s|%s}%s" % (b, r, tl)
                    else: out += "{%s|%s}" % (k, DICT[k])
                    i += len(k); break
            else: out += seg[i]; i += 1
        res.append(out)
    return "".join(res)
def fix(d):
    d["q"]["jp"] = auto(d["q"]["jp"]); d["exp"]["jp"] = auto(d["exp"]["jp"])
    for o in d["opts"]: o["jp"] = auto(o["jp"])
    return d
quiz = {"bab": {}}
for bab, sets in CHAPTERS.items():
    quiz["bab"][bab] = [{"id": f"{bab}-q{i+1}", "title": t, "items": [fix(x) for x in its]} for i, (qid, t, its) in enumerate(sets)]
from quiz_sub import SUB
for subid, bab, no, tid, tjp, its in SUB:
    quiz["bab"][bab].append({"id": f"{subid}-q", "sub": subid, "title": {"id": f"Subbab {no} · {tid}", "jp": f"{no} {tjp}"}, "items": [fix(x) for x in its]})
from quiz_tema import TEMA
quiz["tema"] = [{"id": tid, "tema": True, "title": t, "items": [fix(x) for x in its]} for tid, t, its in TEMA]
# ---- Peralatan bergambar: data kartu + kuis gambar (gambar = potongan hal. 81-82 buku) ----
import random
from alat import build as build_alat
ALAT = build_alat(ROOT)
_vk = {}
for _e in items:
    _vk.setdefault(_e["kata"], _e["id"])
for _a in ALAT:
    _b = re.sub(r"[（(].*?[）)]", "", _a["jp"]).strip()
    if _b in _vk: _a["vid"] = _vk[_b]
json.dump({"schema": "ssw.alat/1", "items": ALAT}, open(os.path.join(out, "alat.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
_short = lambda t: re.sub(r"\s*[（(].*?[）)]", "", t).strip()
for _g in range(4):
    _items = []
    for _a in ALAT[_g * 10:(_g + 1) * 10]:
        _rnd = random.Random(_a["id"])
        _others = [o for o in ALAT if o["id"] != _a["id"] and _short(o["arti"]) != _short(_a["arti"])]
        _opts = _rnd.sample(_others, 3) + [_a]; _rnd.shuffle(_opts)
        _items.append(fix({"q": {"id": "Gambar alat apa ini?", "jp": "これは何の道具ですか。"},
            "opts": [{"id": _short(o["arti"]), "jp": o["jp"]} for o in _opts], "a": _opts.index(_a),
            "exp": {"id": "%s (%s) — %s" % (_short(_a["arti"]), _a["jp"], _a["fungsi"]), "jp": _a["jp"]},
            "img": {"src": _a["img"]}}))
    quiz["tema"].append({"id": "tema-alat%d" % (_g + 1), "tema": True, "title": {"id": "Kuis Gambar Peralatan %d" % (_g + 1), "jp": "用具のクイズ %d" % (_g + 1)}, "items": _items})
json.dump(quiz, open(os.path.join(out, "quiz.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(sum(len(q["items"]) for v in quiz["bab"].values() for q in v), "soal")

# ---------------- rakit bab dari tools/ssw/src/babN/*.json ----------------
BAB_META = {
    "bab2": {"no": 2, "title": {"id": "Pembersihan Harian", "jp": "日常清掃"}, "pages": [15, 60],
             "intro": {"id": "Teknik pembersihan harian: peralatan, keamanan, sapu, dust cloth, mop, penyedot debu, lap meja dan kaca, toilet, pengolahan limbah, kebersihan diri, dan keselamatan kerja.",
                       "jp": "日常清掃の基本：持ち物、安全、ほうき、ダストクロス、モップ、掃除機、拭き清掃、トイレ、廃棄物、衛生管理、安全。"}},
    "bab3": {"no": 3, "title": {"id": "Pembersihan Berkala", "jp": "定期清掃"}, "pages": [61, 82],
             "intro": {"id": "Pembersihan berkala: lantai, polisher, kaca, dan daftar perlengkapan.",
                       "jp": "定期清掃の基本：床、ポリッシャー、ガラス、資器材一覧。"}},
}
SRC = os.path.join(os.path.dirname(__file__), "src")
SOURCE = "JBMA（一般社団法人 全国ビルメンテナンス協会）「Buku Panduan Pelajar Ujian TOKUTEI GINOU Building Cleaning」"
for bid, meta in BAB_META.items():
    d = os.path.join(SRC, bid)
    if not os.path.isdir(d): continue
    subs = [json.load(open(os.path.join(d, f), encoding="utf-8")) for f in sorted(os.listdir(d)) if f.endswith(".json")]
    ids = [s["id"] for s in subs]
    assert len(ids) == len(set(ids)), "id subbab dobel"
    for i, s in enumerate(subs): s["no"] = i + 1
    bab = {"id": bid, **meta, "subs": subs}
    json.dump({"schema": 1, "bidang": "building-cleaning", "source": SOURCE, "bab": bab},
              open(os.path.join(out, bid + ".json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(bid, len(subs), "subbab")
