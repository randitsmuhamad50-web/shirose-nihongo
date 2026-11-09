#!/usr/bin/env python3
"""
Bangun data Hiragana & Katakana untuk Shirose Nihongo.

  python3 tools/kana_build.py /path/ke/kanjivg

Menulis:
  data/kana.json          tabel, romaji, cara baca, contoh kata, pengecoh tes
  data/kana-strokes.json  urutan goresan (path SVG + posisi nomor) untuk SEMUA kana

Sumber stroke order: KanjiVG (https://kanjivg.tagaini.net) oleh Ulrich Apel,
lisensi CC BY-SA 3.0. Data goresan TIDAK dibuat/diperkirakan di sini — hanya
diekstrak apa adanya dari file KanjiVG. Skrip berhenti dengan error bila ada
karakter yang tidak punya data goresan.
"""
import json, os, re, random, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KVG = sys.argv[1] if len(sys.argv) > 1 else "kanjivg"
KVG_DIR = os.path.join(KVG, "kanji")

# ----------------------------------------------------------------- tabel dasar
H_GOJUON = [
    ("あ行", "あいうえお", "a i u e o"),
    ("か行", "かきくけこ", "ka ki ku ke ko"),
    ("さ行", "さしすせそ", "sa shi su se so"),
    ("た行", "たちつてと", "ta chi tsu te to"),
    ("な行", "なにぬねの", "na ni nu ne no"),
    ("は行", "はひふへほ", "ha hi fu he ho"),
    ("ま行", "まみむめも", "ma mi mu me mo"),
    ("や行", "や.ゆ.よ", "ya . yu . yo"),
    ("ら行", "らりるれろ", "ra ri ru re ro"),
    ("わ行", "わ...を", "wa . . . wo"),
    ("ん", "ん....", "n . . . ."),
]
H_DAKUTEN = [
    ("が行", "がぎぐげご", "ga gi gu ge go"),
    ("ざ行", "ざじずぜぞ", "za ji zu ze zo"),
    ("だ行", "だぢづでど", "da ji zu de do"),
    ("ば行", "ばびぶべぼ", "ba bi bu be bo"),
]
H_HANDAKUTEN = [("ぱ行", "ぱぴぷぺぽ", "pa pi pu pe po")]
H_YOUON = [
    ("き", ["きゃ", "きゅ", "きょ"], "kya kyu kyo"),
    ("し", ["しゃ", "しゅ", "しょ"], "sha shu sho"),
    ("ち", ["ちゃ", "ちゅ", "ちょ"], "cha chu cho"),
    ("に", ["にゃ", "にゅ", "にょ"], "nya nyu nyo"),
    ("ひ", ["ひゃ", "ひゅ", "ひょ"], "hya hyu hyo"),
    ("み", ["みゃ", "みゅ", "みょ"], "mya myu myo"),
    ("り", ["りゃ", "りゅ", "りょ"], "rya ryu ryo"),
    ("ぎ", ["ぎゃ", "ぎゅ", "ぎょ"], "gya gyu gyo"),
    ("じ", ["じゃ", "じゅ", "じょ"], "ja ju jo"),
    ("ぢ", ["ぢゃ", "ぢゅ", "ぢょ"], "ja ju jo"),
    ("び", ["びゃ", "びゅ", "びょ"], "bya byu byo"),
    ("ぴ", ["ぴゃ", "ぴゅ", "ぴょ"], "pya pyu pyo"),
]
H_KECIL = [("っ", "tsu-kecil"), ("ゃ", "ya-kecil"), ("ゅ", "yu-kecil"), ("ょ", "yo-kecil")]

# Katakana tambahan (bunyi asing)
K_ASING = [
    ("ウ", ["ウィ", "ウェ", "ウォ"], "wi we wo"),
    ("ヴ", ["ヴァ", "ヴィ", "ヴ", "ヴェ", "ヴォ"], "va vi vu ve vo"),
    ("フ", ["ファ", "フィ", "フェ", "フォ"], "fa fi fe fo"),
    ("テ・ド", ["ティ", "ディ", "トゥ", "ドゥ", "デュ"], "ti di tu du dyu"),
    ("チ・シ・ジ", ["チェ", "シェ", "ジェ"], "che she je"),
    ("ツ", ["ツァ", "ツィ", "ツェ", "ツォ"], "tsa tsi tse tso"),
    ("イ", ["イェ"], "ye"),
]
K_KECIL = [("ッ", "tsu-kecil"), ("ャ", "ya-kecil"), ("ュ", "yu-kecil"), ("ョ", "yo-kecil"),
           ("ァ", "a-kecil"), ("ィ", "i-kecil"), ("ゥ", "u-kecil"), ("ェ", "e-kecil"), ("ォ", "o-kecil"),
           ("ー", "chouon")]

# ------------------------------------------------------------- contoh kata
EX_H = {
 "あ":("あめ","hujan"),"い":("いぬ","anjing"),"う":("うみ","laut"),"え":("えき","stasiun"),"お":("おちゃ","teh"),
 "か":("かさ","payung"),"き":("きって","perangko"),"く":("くるま","mobil"),"け":("けさ","pagi ini"),"こ":("こども","anak"),
 "さ":("さかな","ikan"),"し":("しお","garam"),"す":("すし","sushi"),"せ":("せかい","dunia"),"そ":("そら","langit"),
 "た":("たまご","telur"),"ち":("ちず","peta"),"つ":("つくえ","meja"),"て":("てがみ","surat"),"と":("とり","burung"),
 "な":("なつ","musim panas"),"に":("にく","daging"),"ぬ":("ぬの","kain"),"ね":("ねこ","kucing"),"の":("のり","rumput laut"),
 "は":("はな","bunga"),"ひ":("ひと","orang"),"ふ":("ふね","kapal"),"へ":("へや","kamar"),"ほ":("ほし","bintang"),
 "ま":("まど","jendela"),"み":("みず","air"),"む":("むし","serangga"),"め":("めがね","kacamata"),"も":("もり","hutan"),
 "や":("やま","gunung"),"ゆ":("ゆき","salju"),"よ":("よる","malam"),
 "ら":("らいねん","tahun depan"),"り":("りんご","apel"),"る":("るす","sedang tidak di rumah"),"れ":("れいぞうこ","kulkas"),"ろ":("ろうそく","lilin"),
 "わ":("わたし","saya"),"を":("ほんをよむ","membaca buku"),"ん":("ほん","buku"),
 "が":("がっこう","sekolah"),"ぎ":("ぎんこう","bank"),"ぐ":("ぐあい","kondisi"),"げ":("げんき","sehat"),"ご":("ごはん","nasi; makan"),
 "ざ":("ざっし","majalah"),"じ":("じかん","waktu"),"ず":("ずっと","terus-menerus"),"ぜ":("ぜんぶ","semuanya"),"ぞ":("ぞう","gajah"),
 "だ":("だいがく","universitas"),"ぢ":("はなぢ","mimisan"),"づ":("つづく","berlanjut"),"で":("でんしゃ","kereta listrik"),"ど":("どうぶつ","hewan"),
 "ば":("ばんごう","nomor"),"び":("びょういん","rumah sakit"),"ぶ":("ぶた","babi"),"べ":("べんきょう","belajar"),"ぼ":("ぼうし","topi"),
 "ぱ":("いっぱい","banyak; penuh"),"ぴ":("えんぴつ","pensil"),"ぷ":("てんぷら","tempura"),"ぺ":("ぺらぺら","fasih"),"ぽ":("さんぽ","jalan-jalan santai"),
 "きゃ":("きゃく","tamu"),"きゅ":("きゅうり","mentimun"),"きょ":("きょう","hari ini"),
 "しゃ":("しゃしん","foto"),"しゅ":("しゅくだい","pekerjaan rumah"),"しょ":("しょくじ","makan; hidangan"),
 "ちゃ":("おちゃ","teh"),"ちゅ":("ちゅうごく","Tiongkok"),"ちょ":("ちょうちょ","kupu-kupu"),
 "にゃ":("こんにゃく","konnyaku"),"にゅ":("ぎゅうにゅう","susu sapi"),"にょ":("にょうぼう","istri"),
 "ひゃ":("ひゃく","seratus"),"ひょ":("ひょう","tabel; daftar"),
 "みゃ":("みゃく","denyut nadi"),"みょ":("みょうじ","nama keluarga"),
 "りゃ":("りゃく","singkatan"),"りゅ":("りゅうがく","belajar di luar negeri"),"りょ":("りょこう","perjalanan"),
 "ぎゃ":("ぎゃく","kebalikan"),"ぎゅ":("ぎゅうにく","daging sapi"),"ぎょ":("ぎょうざ","gyoza"),
 "じゃ":("じゃがいも","kentang"),"じゅ":("じゅぎょう","pelajaran"),"じょ":("じょせい","wanita"),
 "びゃ":("さんびゃく","tiga ratus"),"びょ":("びょうき","penyakit"),
 "ぴゃ":("ろっぴゃく","enam ratus"),"ぴょ":("はっぴょう","pengumuman"),
 "っ":("きっぷ","tiket"),"ゃ":("しゃしん","foto"),"ゅ":("しゅくだい","pekerjaan rumah"),"ょ":("しょくじ","makan; hidangan"),
}
EX_K = {
 "ア":("アイス","es krim"),"イ":("インク","tinta"),"ウ":("ウール","wol"),"エ":("エアコン","AC"),"オ":("オレンジ","jeruk"),
 "カ":("カメラ","kamera"),"キ":("キロ","kilo"),"ク":("クラス","kelas"),"ケ":("ケーキ","kue"),"コ":("コーヒー","kopi"),
 "サ":("サラダ","salad"),"シ":("シャツ","kemeja"),"ス":("スープ","sup"),"セ":("セーター","sweter"),"ソ":("ソファ","sofa"),
 "タ":("タクシー","taksi"),"チ":("チーズ","keju"),"ツ":("ツアー","tur wisata"),"テ":("テレビ","televisi"),"ト":("トマト","tomat"),
 "ナ":("ナイフ","pisau"),"ニ":("ニュース","berita"),"ヌ":("ヌードル","mi"),"ネ":("ネクタイ","dasi"),"ノ":("ノート","buku catatan"),
 "ハ":("ハム","ham"),"ヒ":("ヒーター","pemanas"),"フ":("フォーク","garpu"),"ヘ":("ヘリコプター","helikopter"),"ホ":("ホテル","hotel"),
 "マ":("マスク","masker"),"ミ":("ミルク","susu"),"ム":("ムービー","film"),"メ":("メール","surel"),"モ":("モデル","model"),
 "ヤ":("タイヤ","ban"),"ユ":("ユーモア","humor"),"ヨ":("ヨット","kapal layar"),
 "ラ":("ラジオ","radio"),"リ":("リモコン","remote"),"ル":("ルール","aturan"),"レ":("レストラン","restoran"),"ロ":("ロボット","robot"),
 "ワ":("ワイン","anggur"),"ン":("ペン","pena"),
 "ガ":("ガス","gas"),"ギ":("ギター","gitar"),"グ":("グラス","gelas"),"ゲ":("ゲーム","permainan"),"ゴ":("ゴルフ","golf"),
 "ザ":("ピザ","pizza"),"ジ":("ジュース","jus"),"ズ":("ズボン","celana"),"ゼ":("ゼロ","nol"),"ゾ":("ゾーン","zona"),
 "ダ":("ダンス","dansa"),"デ":("デパート","pusat perbelanjaan"),"ド":("ドア","pintu"),
 "バ":("バス","bus"),"ビ":("ビール","bir"),"ブ":("ブーツ","sepatu bot"),"ベ":("ベッド","tempat tidur"),"ボ":("ボール","bola"),
 "パ":("パン","roti"),"ピ":("ピアノ","piano"),"プ":("プール","kolam renang"),"ペ":("ページ","halaman"),"ポ":("ポスト","kotak pos"),
 "キャ":("キャベツ","kubis"),"キュ":("キューブ","kubus"),
 "シャ":("シャワー","pancuran mandi"),"シュ":("シュークリーム","kue sus"),"ショ":("ショッピング","belanja"),
 "チャ":("チャンス","kesempatan"),"チュ":("チューリップ","tulip"),"チョ":("チョコレート","cokelat"),
 "ニュ":("ニュース","berita"),"ヒュ":("ヒューズ","sekering"),
 "ミャ":("ミャンマー","Myanmar"),"ミュ":("ミュージカル","musikal"),
 "リュ":("リュック","ransel"),"ギャ":("ギャラリー","galeri"),"ギョ":("ギョーザ","gyoza"),
 "ジャ":("ジャム","selai"),"ジュ":("ジュース","jus"),"ジョ":("ジョギング","jogging"),
 "ビュ":("ビュッフェ","prasmanan"),"ピュ":("コンピューター","komputer"),
 "ウィ":("ウィンドウ","jendela"),"ウェ":("ウェブ","web"),"ウォ":("ウォッチ","jam tangan"),
 "ヴァ":("ヴァイオリン","biola"),"ヴィ":("ヴィーナス","Venus"),"ヴェ":("ヴェール","kerudung"),"ヴォ":("ヴォーカル","vokal"),
 "ファ":("ファン","penggemar"),"フィ":("フィルム","film (rol)"),"フェ":("カフェ","kafe"),"フォ":("フォーク","garpu"),
 "ティ":("パーティー","pesta"),"ディ":("ディスク","cakram; disk"),"デュ":("デュエット","duet"),
 "チェ":("チェック","pemeriksaan"),"シェ":("シェア","berbagi"),"ジェ":("ジェット","jet"),
 "ッ":("コップ","gelas"),"ャ":("シャツ","kemeja"),"ュ":("ジュース","jus"),"ョ":("ショッピング","belanja"),
 "ァ":("ファン","penggemar"),"ィ":("パーティー","pesta"),"ェ":("チェック","pemeriksaan"),"ォ":("フォーク","garpu"),
 "ー":("コーヒー","kopi"),
}

# --------------------------------------------------------------- romaji kata
BASE = {}
for rows in (H_GOJUON, H_DAKUTEN, H_HANDAKUTEN):
    for _, chars, rom in rows:
        for c, r in zip(chars, rom.split()):
            if c != "." and r != ".":
                BASE[c] = r
BASE.update({"ぁ": "a", "ぃ": "i", "ぅ": "u", "ぇ": "e", "ぉ": "o", "ゔ": "vu"})
YOUON = {}
for _, combos, rom in H_YOUON:
    for c, r in zip(combos, rom.split()):
        YOUON[c] = r
FOREIGN = {}
for _, combos, rom in K_ASING:
    for c, r in zip(combos, rom.split()):
        FOREIGN[c] = r

def kata2hira(s):
    out = []
    for ch in s:
        o = ord(ch)
        out.append(chr(o - 0x60) if 0x30A1 <= o <= 0x30F6 else ch)
    return "".join(out)

def hira2kata(s):
    return "".join(chr(ord(ch) + 0x60) if 0x3041 <= ord(ch) <= 0x3096 else ch for ch in s)

def to_romaji(word):
    """Konversi kana → romaji (Hepburn sederhana, tanpa makron: ou/oo ditulis apa adanya)."""
    out, i, geminate = [], 0, False
    while i < len(word):
        ch = word[i]
        nxt = word[i + 1] if i + 1 < len(word) else ""
        if ch in "っッ":
            geminate = True; i += 1; continue
        if ch == "ー":
            vowels = [c for c in "".join(out) if c in "aiueo"]
            out.append(vowels[-1] if vowels else ""); i += 1; continue
        pair = ch + nxt
        h = kata2hira(ch)
        hp = kata2hira(ch) + kata2hira(nxt) if nxt else h
        if pair in FOREIGN: r = FOREIGN[pair]; step = 2
        elif hp in YOUON and nxt in "ゃゅょャュョ" and nxt: r = YOUON[hp]; step = 2
        elif ch == "ヴ" and nxt and nxt in "ァィェォ": r = FOREIGN[pair]; step = 2
        elif ch == "ヴ": r = "vu"; step = 1
        elif h in BASE: r = BASE[h]; step = 1
        else: raise ValueError(f"tidak bisa mengonversi {ch!r} dalam {word!r}")
        if geminate:
            r = ("t" if r.startswith("ch") else r[0]) + r; geminate = False
        out.append(r); i += step
    return "".join(out)

# ------------------------------------------------------------ cara membaca (bc)
BC_SPECIAL = {
 "あ": "Seperti «a» pada «apa».", "い": "Seperti «i» pada «ibu».",
 "う": "Seperti «u» pada «udang», tetapi bibir tidak dibulatkan.", "え": "Seperti «e» pada «enak».",
 "お": "Seperti «o» pada «obat».",
 "し": "Dibaca «shi» — mirip «si» dengan desis «sy».", "ち": "Dibaca «chi» — mirip «ci» pada «cicak».",
 "つ": "Dibaca «tsu» — «ts» dan «u» dalam satu napas.",
 "ふ": "Dibaca «fu» — antara «hu» dan «fu»; bibir hanya mengerucut tipis.",
 "じ": "Dibaca «ji» — mirip «ji» pada «jiwa».",
 "ぢ": "Dibaca «ji» — sama dengan じ; jarang dipakai (misalnya はなぢ).",
 "づ": "Dibaca «zu» — sama dengan ず; jarang dipakai (misalnya つづく).",
 "を": "Dibaca «o» (ditulis wo) — hanya dipakai sebagai partikel objek, misalnya ほんを よむ.",
 "ん": "Bunyi «n» satu ketukan penuh; terdengar «m» atau «ng» tergantung bunyi sesudahnya.",
 "は": "Dibaca «ha». Sebagai partikel (わたしは) dibaca «wa».",
 "へ": "Dibaca «he». Sebagai partikel arah (がっこうへ) dibaca «e».",
 "っ": "Huruf kecil penanda jeda: tahan konsonan berikutnya (きっぷ → kippu).",
 "ゃ": "Huruf kecil yang menempel pada kana sebelumnya (きゃ → kya).",
 "ゅ": "Huruf kecil yang menempel pada kana sebelumnya (きゅ → kyu).",
 "ょ": "Huruf kecil yang menempel pada kana sebelumnya (きょ → kyo).",
 "ー": "Tanda panjang katakana: perpanjang vokal sebelumnya satu ketukan (コーヒー → koohii).",
}
R_ROW = "Dibaca «{r}» — «r» Jepang: ujung lidah menyentuh langit-langit mulut sekali (antara r dan l)."

def make_bc(c, r, kind, base=None, small=None):
    h = kata2hira(c)
    if c in BC_SPECIAL: return BC_SPECIAL[c]
    if h in BC_SPECIAL and len(c) == 1: return BC_SPECIAL[h]
    if kind == "youon": return f"Gabungan «{base}» + «{small}» dibaca satu suku kata «{r}», bukan dua."
    if kind == "asing": return f"Bunyi asing: «{base}» + «{small}» dibaca satu suku kata «{r}»."
    if kind == "dakuten": return f"Dibaca «{r}». Tanda ゛ (dakuten) membuat bunyi menjadi bersuara."
    if kind == "handakuten": return f"Dibaca «{r}». Tanda ゜ (handakuten) mengubah bunyi menjadi «p»."
    if len(h) == 1 and h[0] in "らりるれろ": return R_ROW.format(r=r)
    return f"Dibaca «{r}»."

# ------------------------------------------------------------------ pengecoh
CONF_H = ["ぬめね", "ねれわ", "るろ", "はほま", "いり", "こに", "さきち", "らち", "あおめ", "すむ", "まよ", "ゆや",
          "つう", "てを", "くへ", "のめ", "みめ", "しつ", "そんる", "へべぺ", "ぱぽ", "ぎさ"]
CONF_K = ["シツ", "ソンン", "クタケ", "ウワ", "ヌス", "ノメ", "アマ", "チテ", "コユ", "ナメ", "ラヲ", "フワ", "ミニ", "セヤ", "ヘヘ"]
CONF = {}
for g in CONF_H + CONF_K:
    for a in g:
        CONF.setdefault(a, "")
        CONF[a] += "".join(b for b in g if b != a and b not in CONF[a])

def kvg_file(ch):
    return os.path.join(KVG_DIR, f"{ord(ch):05x}.svg")

def parse_kvg(ch):
    p = kvg_file(ch)
    if not os.path.exists(p):
        raise SystemExit(f"STOP: {ch!r} (U+{ord(ch):04X}) tidak ada di KanjiVG")
    svg = open(p, encoding="utf-8").read()
    body = svg[svg.index("<svg"):]
    ds = re.findall(r'<path id="kvg:[0-9a-f]+-s\d+"[^>]*? d="([^"]+)"', body)
    nums = re.findall(r'transform="matrix\(1 0 0 1 ([\d.\-]+) ([\d.\-]+)\)">(\d+)</text>', body)
    if not ds: raise SystemExit(f"STOP: tidak ada stroke pada {ch!r}")
    if len(ds) != len(nums): raise SystemExit(f"STOP: jumlah nomor != jumlah stroke pada {ch!r}")
    nums.sort(key=lambda t: int(t[2]))
    return {"s": ds, "n": [[float(x), float(y)] for x, y, _ in nums]}

def main():
    chars = {}          # key -> info
    sections = {"hira": [], "kata": []}

    def add(key, r, t, g, kind="dasar", base=None, small=None, rare=False):
        ex = (EX_H if t == "hira" else EX_K).get(key)
        info = {"r": r, "t": t, "g": g, "bc": make_bc(key, r, kind, base, small)}
        if ex:
            info["w"], info["wa"] = ex
            info["wr"] = to_romaji(ex[0])
        elif t:
            info["rare"] = True
        chars[f"{t}:{key}"] = info

    def build_script(t):
        conv = (lambda s: s) if t == "hira" else hira2kata
        secs = []
        # gojuon
        rows = []
        for lab, cs, rom in H_GOJUON:
            cl = [None if c == "." else conv(c) for c in cs]
            rl = rom.split()
            for c, r in zip(cl, rl):
                if c: add(c, r, t, "gojuon")
            rows.append({"l": conv(lab) if lab != "ん" else conv("ん"), "c": cl})
        secs.append({"id": "gojuon", "nama": "Gojuon", "jp": "清音", "cols": ["あ段", "い段", "う段", "え段", "お段"], "rows": rows})
        # dakuten
        rows = []
        for lab, cs, rom in H_DAKUTEN:
            cl = [conv(c) for c in cs]
            for c, r in zip(cl, rom.split()): add(c, r, t, "dakuten", "dakuten", base=None)
            rows.append({"l": conv(lab), "c": cl})
        secs.append({"id": "dakuten", "nama": "Dakuten", "jp": "濁音", "cols": ["あ段", "い段", "う段", "え段", "お段"], "rows": rows})
        rows = []
        for lab, cs, rom in H_HANDAKUTEN:
            cl = [conv(c) for c in cs]
            for c, r in zip(cl, rom.split()): add(c, r, t, "handakuten", "handakuten")
            rows.append({"l": conv(lab), "c": cl})
        secs.append({"id": "handakuten", "nama": "Handakuten", "jp": "半濁音", "cols": ["あ段", "い段", "う段", "え段", "お段"], "rows": rows})
        # youon
        rows = []
        for lab, combos, rom in H_YOUON:
            cl = [conv(c) for c in combos]
            for c, r in zip(cl, rom.split()):
                add(c, r, t, "youon", "youon", base=c[0], small=c[1])
            rows.append({"l": conv(lab), "c": cl})
        secs.append({"id": "youon", "nama": "Youon", "jp": "拗音", "cols": ["ゃ", "ゅ", "ょ"] if t == "hira" else ["ャ", "ュ", "ョ"], "rows": rows})
        if t == "kata":
            rows = []
            for lab, combos, rom in K_ASING:
                for c, r in zip(combos, rom.split()):
                    add(c, r, t, "asing", "asing" if len(c) == 2 else "dasar", base=c[0], small=c[1] if len(c) == 2 else None)
                rows.append({"l": lab, "c": combos})
            secs.append({"id": "asing", "nama": "Bunyi asing", "jp": "外来音", "cols": None, "rows": rows})
            kecil = K_KECIL
        else:
            kecil = H_KECIL
        cl = [c for c, _ in kecil]
        for c, lbl in kecil:
            add(c, lbl, t, "kecil", "dasar")
        secs.append({"id": "kecil", "nama": "Huruf kecil", "jp": "小書き", "cols": None, "rows": [{"l": "小", "c": cl}]})
        return secs

    for t in ("hira", "kata"):
        sections[t] = build_script(t)

    # ---- romaji kunci khusus
    assert chars["hira:を"]["r"] == "wo" and chars["kata:ヲ"]["r"] == "wo"

    # ---- pengecoh kata (wd) + penjelasan
    rnd = random.Random(20261110)
    pool = {t: [c for c in sections[t][0]["rows"] for c in c["c"] if c] for t in sections}
    for k, v in chars.items():
        if "w" not in v: continue
        t = v["t"]; word = v["w"]
        ans = v["wr"]; dis = []
        tries = 0
        while len(dis) < 3 and tries < 200:
            tries += 1
            idx = [i for i, c in enumerate(word) if c in CONF or (c not in "っッーゃゅょャュョ")]
            i = rnd.choice(idx) if idx else 0
            c = word[i]
            cand = (CONF.get(c) or "") if rnd.random() < 0.75 else ""
            if cand: rep = rnd.choice(cand)
            else: rep = rnd.choice(pool[t])
            if len(rep) != 1 or rep == c: continue
            SMALL = "ゃゅょャュョっッーぁぃぅぇぉァィゥェォ"
            COMBINE = "ゃゅょャュョぁぃぅぇぉァィゥェォ"
            if c in SMALL or (i + 1 < len(word) and word[i + 1] in COMBINE): continue
            mutated = word[:i] + rep + word[i + 1:]
            try: r = to_romaji(mutated)
            except ValueError: continue
            if r != ans and r not in dis: dis.append(r)
        if len(dis) < 3:
            # kata yang hampir semuanya kana gabungan: pakai bacaan kata lain (panjang mirip) sebagai pengecoh
            others = sorted({x["wr"] for kk, x in chars.items() if x["t"] == t and "wr" in x and x["wr"] != ans},
                            key=lambda r: (abs(len(r) - len(ans)), r))
            for r in others:
                if len(dis) >= 3: break
                if r not in dis: dis.append(r)
        if len(dis) < 3: raise SystemExit(f"STOP: pengecoh kurang untuk {word}")
        v["wd"] = dis
        v["wt"] = k != "hira:を"       # frasa を tidak dipakai di tes membaca kata

    # ---- stroke data untuk semua komponen
    comps = []
    for k in chars:
        key = k.split(":", 1)[1]
        for ch in key:
            if ch not in comps: comps.append(ch)
    strokes = {ch: parse_kvg(ch) for ch in comps}

    # ---- QC
    for k, v in chars.items():
        assert v["r"] and v["bc"], k
    for t in sections:
        for s in sections[t]:
            for r in s["rows"]:
                for c in r["c"]:
                    if c: assert f"{t}:{c}" in chars, (t, c)
    tot = {t: sum(1 for k in chars if k.startswith(t + ":")) for t in ("hira", "kata")}
    tot_ex = {t: sum(1 for k, v in chars.items() if k.startswith(t + ":") and "w" in v) for t in ("hira", "kata")}

    out = {"v": 1, "sections": sections, "chars": chars,
           "conf": {c: s for c, s in CONF.items()}}
    with open(os.path.join(ROOT, "data", "kana.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(ROOT, "data", "kana-strokes.json"), "w", encoding="utf-8") as f:
        json.dump({"_credit": "Stroke order: KanjiVG (c) Ulrich Apel, CC BY-SA 3.0 — https://kanjivg.tagaini.net",
                   "strokes": strokes}, f, ensure_ascii=False, separators=(",", ":"))
    print("karakter:", tot, "| dengan contoh kata:", tot_ex, "| komponen stroke:", len(strokes))

if __name__ == "__main__":
    main()
