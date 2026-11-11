# -*- coding: utf-8 -*-
"""Bidang SSW "construction" (建設) — tiga kategori ujian, masing-masing dari buku modul bahasa Indonesia:
   construction            = Sipil (Doboku)                  ← sipil_indo.pdf (151 hal.)
   construction-bangunan   = Bangunan (Kenchiku)             ← building_indo.pdf (152 hal.)
   construction-lifeline   = Lifeline & Peralatan (Setsubi) ← Textbook THEORY_ID (117 hal.) + PRACTICE_ID hal. 5–98 (94 hal.)
Bab 1, 2, 3, 4, 6.1, 7 sama di ketiganya (isi hand-written di src/construction/cn_data.py); Bab 5 dan 6.2 khusus kategori:
daftar topik diambil dari judul asli buku (src/construction/heads.json). Kosakata = glosarium Bab 4.2 (istilah lokasi).
Halaman: app hal. N = halaman asli N (sampul disalin di depan). Lifeline: hal. 1–117 = buku teori, hal. 118–211 = buku praktik (hal. praktik + 113)."""
import os, re, sys, json
sys.path.insert(0, os.path.dirname(__file__)); sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "construction"))
from bidang_lib import vocab_item, vocab_quiz, write_pack
import cn_data as D
HEADS = json.load(open(os.path.join(os.path.dirname(__file__), "src", "construction", "heads.json"), encoding="utf-8"))

def sub(id, key, pages, ti=None, tj=None, **kw): return dict(id=id, key=key, pages=pages, ti=ti, tj=tj, **kw)
def auto(id, pre, pages, ti, tj, intro, extra=None, soal=None): return dict(id=id, key=None, pages=pages, ti=ti, tj=tj, pre=pre, intro=intro, extra=extra or [], soal=soal or [])

CRANE = ([{"h": "Contoh mesin konstruksi (dari buku)"}, {"ul": ["**Crane**: mengangkat dan memindahkan beban; jenis tower crane, rough terrain crane, crawler crane.", "**Tower crane**: untuk gedung tinggi; bagian crane naik bersama tiang (mast climbing) atau bersama bangunan (floor climbing).", "**Ekskavator hidrolik (backhoe)**: menggali dan memuat dengan boom, arm, dan bucket; attachment bisa diganti (breaker, ripper, crusher).", "**Perancah jenis pengikat baji**: dirakit dan dibongkar dengan satu palu; material galvanis tahan karat."]}],
         [("Crane yang bagian cranenya memanjat tiang atau bangunan adalah…", ["Tower crane", "Crawler crane", "Rough terrain crane", "Truck pengaduk"], "Tower crane naik dengan mast climbing atau floor climbing.", 0),
          ("Ekskavator hidrolik (backhoe) menggerakkan…", ["Boom, arm, dan bucket dengan silinder hidrolik", "Hanya roda", "Pipa propulsi", "Cetakan beton"], "Attachment dapat diganti sesuai keperluan.", 0),
          ("Perancah jenis pengikat baji dapat dirakit dan dibongkar dengan…", ["Satu palu", "Mesin las", "Crane saja", "Bahan peledak"], "Dirancang agar mudah dipasang dengan palu tunggal.", 0)])
GX = ([{"h": "Pipa besi cor ulet jenis GX"}, {"ul": ["Jepang sering gempa, sehingga dipakai **pipa besi cor ulet** untuk suplai air agar pipa tahan kerusakan gempa.", "Sambungan jenis **GX** mengembang, menyusut, atau menekuk mengikuti gerakan tanah dan memiliki fungsi pencegah pipa lepas.", "Pipa digantung hati-hati dengan **tanda pabrikan menghadap ke atas** saat disambung."]}],
      [("Pipa suplai air yang tahan gempa dan umum dipakai di Jepang adalah pipa…", ["Besi cor ulet jenis GX", "Kaca", "Kertas", "Kayu"], "Sambungan GX memiliki fungsi tahan gempa.", 0),
       ("Fungsi penting sambungan GX saat gempa adalah…", ["Mengembang, menyusut, menekuk, dan mencegah pipa lepas", "Mematikan listrik", "Menahan banjir", "Mengubah warna pipa"], "Pipa tidak lepas walau diregangkan hingga batasnya.", 0)])

SIPIL = dict(slug="construction", nama="Construction — Sipil (Doboku)", jp="建設（土木）", label="🏗️ Sipil (Doboku) ›", kat="sipil", total=152, books="sipil_indo (151 hal.)", babs=[
  ("bab1", "Hal yang Dijaga di Tempat Kerja Jepang", "{日本|にほん}の{職場|しょくば}で{大切|たいせつ}なこと", "Kerja sama tim, sistem pelaksanaan konstruksi, Career Up, salam dan apel pagi.",
   [sub("b1s1", "b1_a", [1, 2]), sub("b1s2", "b1_b", [2, 3]), sub("b1s3", "b1_c", [3, 7])]),
  ("bab2", "Hukum dan Peraturan yang Harus Dipatuhi", "{守|まも}るべき{法律|ほうりつ}", "UU Ketenagakerjaan, Industri Konstruksi, Standar Bangunan, lingkungan, dan UU terkait lainnya.",
   [sub("b2s1", "b2_a", [8, 15]), sub("b2s2", "b2_b", [16, 16]), sub("b2s3", "b2_c", [17, 18]), sub("b2s4", "b2_d", [18, 21])]),
  ("bab3", "Jenis dan Tugas Pekerjaan Konstruksi", "{工事|こうじ}の{種類|しゅるい}と{仕事|しごと}", "Jenis pekerjaan, 37 pekerjaan khusus utama, dan kualifikasi.",
   [sub("b3s1", "b3_a", [22, 32]), sub("b3s2", "b3_g1", [33, 39], pre=["3.2."]), sub("b3s3", "b3_g2", [40, 47], pre=["3.2."]), sub("b3s4", "b3_g3", [48, 58], pre=["3.2."]), sub("b3s5", "b3_q", [59, 59])]),
  ("bab4", "Salam, Istilah, dan Kehidupan Bersama", "あいさつ・{用語|ようご}・{共同生活|きょうどうせいかつ}", "Salam dan panggilan darurat, istilah lokasi konstruksi, 5S dan aturan pos pekerja.",
   [sub("b4s1", "b4_a", [60, 61]), sub("b4s2", "b4_b", [62, 73]), sub("b4s3", "b4_c", [74, 77])]),
  ("bab5", "Alat, Mesin, Material, dan Alat Ukur", "{道具|どうぐ}・{機械|きかい}・{材料|ざいりょう}", "Alat, mesin, material dan alat ukur khusus tiap pekerjaan serta yang umum.",
   [auto("b5s1", ["5.1."], [78, 94], "Alat dan Material Khusus per Pekerjaan", "{専門|せんもん}{工事|こうじ}の{道具|どうぐ}", "Alat, mesin, material, dan alat ukur khusus tiap pekerjaan khusus.", *CRANE),
    auto("b5s2", ["5.2."], [95, 105], "Alat, Mesin, dan Material Umum", "{共通|きょうつう}の{道具|どうぐ}", "Alat umum: alat listrik, penggali, penanda, pengukur, pemotong, pengencang, pengangkut, tangga.")]),
  ("bab6", "Pengetahuan Pelaksanaan Lokasi Konstruksi", "{施工|せこう}の{知識|ちしき}", "Hal umum di lokasi dan pengetahuan pelaksanaan tiap pekerjaan khusus.",
   [sub("b6s1", "b6_a", [106, 108]), auto("b6s2", ["6.2."], [109, 120], "Pelaksanaan: Tanah sampai Tiang Pancang", "{土木工事|どぼくこうじ}の{知識|ちしき}", "Pelaksanaan pekerjaan tanah, terowongan propulsi, teknik sipil kelautan, sumur, perkerasan, dan tiang pancang."),
    auto("b6s3", ["6.2."], [121, 134], "Pelaksanaan: Perancah sampai Pembongkaran", "{仮設|かせつ}から{解体|かいたい}まで", "Pelaksanaan perancah, rangka baja, rebar, las, bekisting, beton, pengecatan, lanskap, dan pembongkaran.")]),
  ("bab7", "Keselamatan Pekerjaan Konstruksi", "{建設|けんせつ}{工事|こうじ}の{安全|あんぜん}", "Kecelakaan fatal dan kegiatan keselamatan di lokasi.",
   [sub("b7s1", "b7_a", [135, 140]), sub("b7s2", "b7_b", [141, 151])]),
])

BANGUNAN = dict(slug="construction-bangunan", nama="Construction — Bangunan (Kenchiku)", jp="建設（建築）", label="🏢 Bangunan (Kenchiku) ›", kat="bangunan", total=153, books="building_indo (152 hal.)", babs=[
  SIPIL["babs"][0], SIPIL["babs"][1], SIPIL["babs"][2], SIPIL["babs"][3],
  ("bab5", "Alat, Mesin, Material, dan Alat Ukur", "{道具|どうぐ}・{機械|きかい}・{材料|ざいりょう}", "Pekerjaan kerangka, interior dan eksterior, serta alat dan material umum.",
   [auto("b5s1", ["5.1."], [78, 88], "Pekerjaan Kerangka", "{躯体|くたい}{工事|こうじ}", "Alat dan material pekerjaan kerangka: mesin konstruksi, perancah, rangka baja, rebar, las, bekisting, beton.", *CRANE),
    auto("b5s2", ["5.2."], [89, 96], "Pekerjaan Interior dan Eksterior", "{内装|ないそう}・{外装|がいそう}{工事|こうじ}", "Alat dan material plesteran, pengecatan, atap, ubin, finishing interior, fitting, sash, anti air."),
    auto("b5s3", ["5.3."], [97, 107], "Alat, Mesin, dan Material Umum", "{共通|きょうつう}の{道具|どうぐ}", "Alat umum untuk semua pekerjaan bangunan.")]),
  ("bab6", "Pengetahuan Pelaksanaan Lokasi Konstruksi", "{施工|せこう}の{知識|ちしき}", "Hal umum di lokasi dan pelaksanaan tiap pekerjaan khusus bangunan.",
   [sub("b6s1", "b6_a", [108, 110]), auto("b6s2", ["6.2."], [111, 125], "Pelaksanaan: Perancah sampai Pertukangan", "{躯体|くたい}{工事|こうじ}の{知識|ちしき}", "Pelaksanaan perancah, rangka baja, rebar, sambungan, las, bekisting, beton, pengecatan, plesteran, pertukangan."),
    auto("b6s3", ["6.2."], [126, 136], "Pelaksanaan: Atap sampai Pembongkaran", "{仕上|しあ}げから{解体|かいたい}まで", "Pelaksanaan atap, pelat logam, ubin, interior, fitting, sash, uretan, anti air, pemasangan batu, pembongkaran.")]),
  ("bab7", "Keselamatan Pekerjaan Konstruksi", "{建設|けんせつ}{工事|こうじ}の{安全|あんぜん}", "Kecelakaan fatal dan kegiatan keselamatan di lokasi.",
   [sub("b7s1", "b7_a", [137, 142]), sub("b7s2", "b7_b", [143, 152])]),
])

O = 113  # lifeline: hal. praktik + 113
LIFELINE = dict(slug="construction-lifeline", nama="Construction — Lifeline & Peralatan (Setsubi)", jp="建設（ライフライン・設備）", label="🔧 Lifeline & Peralatan ›", kat="lifeline", total=212, books="Textbook THEORY_ID (hal. 1–117) + PRACTICE_ID hal. 5–98 (hal. 118–211)", babs=[
  ("bab1", *SIPIL["babs"][0][1:4], [sub("b1s1", "b1_a", [1, 3]), sub("b1s2", "b1_b", [3, 4]), sub("b1s3", "b1_c", [4, 12])]),
  ("bab2", *SIPIL["babs"][1][1:4], [sub("b2s1", "b2_a", [13, 23]), sub("b2s2", "b2_b", [24, 26]), sub("b2s3", "b2_c", [26, 28]), sub("b2s4", "b2_d", [28, 33])]),
  ("bab3", *SIPIL["babs"][2][1:4], [sub("b3s1", "b3_a", [34, 47]), sub("b3s2", "b3_g1", [48, 56], pre=["3.2."]), sub("b3s3", "b3_g2", [57, 67], pre=["3.2."]), sub("b3s4", "b3_g3", [68, 81], pre=["3.2."]), sub("b3s5", "b3_q", [82, 94])]),
  ("bab4", *SIPIL["babs"][3][1:4], [sub("b4s1", "b4_a", [95, 96]), sub("b4s2", "b4_b", [97, 113]), sub("b4s3", "b4_c", [114, 117])]),
  ("bab5", "Alat, Mesin, Material, dan Alat Ukur", "{道具|どうぐ}・{機械|きかい}・{材料|ざいりょう}", "Alat dan material pekerjaan lifeline dan peralatan, serta alat umum (buku praktik).",
   [auto("b5s1", ["5.1."], [5 + O, 13 + O], "Mesin Konstruksi dan Peralatan Listrik", "{建設機械|けんせつきかい}と{電気設備|でんきせつび}", "Mesin konstruksi serta alat dan material pekerjaan peralatan listrik.", *CRANE),
    auto("b5s2", ["5.1."], [14 + O, 20 + O], "Telekomunikasi", "{通信|つうしん}{工事|こうじ}", "Alat dan material pekerjaan telekomunikasi."),
    auto("b5s3", ["5.1."], [21 + O, 23 + O], "Pendingin, Air-Drainase, Isolasi, Pemadam", "{空調|くうちょう}・{給排水|きゅうはいすい}・{消防|しょうぼう}", "Alat dan material AC, suplai air-drainase-sanitasi, isolasi panas, dan fasilitas pemadam."),
    auto("b5s4", ["5.2."], [24 + O, 42 + O], "Alat dan Material Umum", "{共通|きょうつう}の{道具|どうぐ}", "Alat listrik, penggali, penanda, pengukur, pemotong, pemukul, pengencang, pengangkut, tangga, pembersih.")]),
  ("bab6", "Pengetahuan Pelaksanaan Lokasi Konstruksi", "{施工|せこう}の{知識|ちしき}", "Hal umum di lokasi dan pelaksanaan pemipaan, AC, isolasi, lifeline, pelat logam, listrik, telekomunikasi, tungku, pemadam.",
   [sub("b6s1", "b6_a", [43 + O, 47 + O]),
    auto("b6s2", ["6.2."], [48 + O, 55 + O], "Pengolahan Pipa", "{配管|はいかん}{工事|こうじ}", "Pengolahan pipa baja karbon, PVC keras, dan pipa baja berlapis PVC untuk suplai air."),
    auto("b6s3", ["6.3.", "6.4."], [56 + O, 59 + O], "Pendingin Udara dan Isolasi Panas", "{空調|くうちょう}と{保温|ほおん}", "Pipa tembaga refrigeran dan sambungannya; bahan isolasi panas dan dingin."),
    auto("b6s4", ["6.5."], [60 + O, 67 + O], "Pipa Lifeline", "ライフライン{配管|はいかん}", "Konstruksi pipa besi cor ulet, sambungan EF, dan hal penting pembenaman pipa.", *GX),
    auto("b6s5", ["6.6."], [68 + O, 71 + O], "Pelat Logam Arsitektur", "{板金|ばんきん}{工事|こうじ}", "Pengolahan pelat logam dan metode sambungan saluran."),
    auto("b6s6", ["6.7.", "6.8."], [72 + O, 78 + O], "Peralatan Listrik dan Telekomunikasi", "{電気|でんき}・{通信|つうしん}{設備|せつび}", "Peralatan listrik: korsleting, ground fault, kebocoran listrik; peralatan telekomunikasi dan conduit."),
    auto("b6s7", ["6.9.", "6.10."], [79 + O, 80 + O], "Tungku dan Peralatan Pemadam", "{炉|ろ}と{消防設備|しょうぼうせつび}", "Pekerjaan pembuatan tungku dan peralatan pemadam kebakaran.")]),
  ("bab7", *SIPIL["babs"][6][1:4], [sub("b7s1", "b7_a", [81 + O, 86 + O]), sub("b7s2", "b7_b", [87 + O, 98 + O])]),
])
PACKS = [SIPIL, BANGUNAN, LIFELINE]
SOURCE = "Buku modul 建設分野 (Construction) bahasa Indonesia — kategori %s: %s"

def soal_item(t, page):
    q, opts, exp, _ = t
    assert len(opts) == 4 and len(set(opts)) == 4, q
    return {"q": {"id": q}, "opts": [{"id": o} for o in opts], "a": 0, "exp": {"id": "%s (Modul hal. %d.)" % (exp, page)}, "ref": {"p": page}}

def parse_glossary():
    raw = open(os.path.join(os.path.dirname(__file__), "src", "construction", "glossary_raw.txt"), encoding="utf-8").read()
    raw = raw[raw.index("4.2 Istilah yang digunakan"):raw.index("4.3 Hal-hal") if "4.3 Hal-hal" in raw else len(raw)]
    out, seen = [], set()
    for blk in re.split(r"\n(?=\[)", raw)[1:]:
        m = re.match(r"^\[([^\]]{2,40})\]\s*(.*)$", blk, re.S)
        if not m: continue
        t = m.group(1).strip(); d = re.split(r"\n\s*\n", m.group(2))[0]; d = re.sub(r"\s+", " ", d).strip()
        d = re.split(r"(?<=[a-z\)])(?<!dll)(?<!dsb)\.\s", d)[0].rstrip(".")
        if len(d) > 140: d = d[:137].rsplit(" ", 1)[0] + "…"
        if len(d) >= 12 and t.lower() not in seen and not re.match(r"^\d", t): seen.add(t.lower()); out.append((t, d))
    return out

def heads_in(kat, pre, p1, p2):
    return [(p, n, t) for p, n, t in HEADS[kat] if p1 <= p <= p2 and any(n.startswith(x) for x in pre)]

def build_pack(P, glossary):
    kat = P["kat"]; vocab = []; babs_out = []; quiz = {"bab": {}, "tema": []}; nsoal = 0; allsubs = []
    for bi, (bid, ti, tj, intro, subs) in enumerate(P["babs"], 1):
        for s in subs: allsubs.append((bid, s))
    p42 = [s["pages"] for b, s in allsubs if s["id"] == "b4s2"][0]
    for n, (t, d) in enumerate(glossary, 1):
        e = vocab_item("cn", n, t, t, d, "Istilah lokasi", "bab4", ["b4s2"]); e["romaji"] = ""; e["_p"] = "%d–%d" % tuple(p42); vocab.append(e)
    for bi, (bid, ti, tj, intro, subs) in enumerate(P["babs"], 1):
        subs_out, semua = [], []; qs_sub = []
        for si, s in enumerate(subs, 1):
            p1, p2 = s["pages"]
            if s["key"]:
                c = D.COMMON.get(s["key"], dict(full=[], summary={}, soal=[]))
                if s["key"] in D.GROUPS: ti_s, tj_s, rng = D.GROUPS[s["key"]]
                else: ti_s, tj_s = c["ti"], c["tj"]
                full = list(c["full"]); summ = c["summary"]; hs = heads_in(kat, s.get("pre", []), p1, p2) if s.get("pre") else []
                if s["key"] in D.GROUPS:
                    full = [{"h": "Pekerjaan pada subbab ini (%s)" % rng}, {"ul": ["%s (hal. %d)" % (t, p) for p, n, t in hs] or ["Lihat halaman buku."]},
                            {"p": "Tiap pekerjaan dijelaskan dengan gambar dan contoh di halaman buku; baca terutama pekerjaan yang akan kamu kerjakan."}, {"note": D.NOTE}]
                    summ = dict(core="Daftar pekerjaan khusus utama (%s): %s, dan lainnya." % (rng, ", ".join(t.replace("Pekerjaan ", "").lower() for p, n, t in hs[:4])),
                                points=["Tiap pekerjaan punya alat, bahan, dan bahaya sendiri.", "Rujuk halaman buku untuk gambar dan contohnya."], avoid=["Mengerjakan pekerjaan tanpa mengetahui bahayanya."], exam=["Nama dan ruang lingkup tiap pekerjaan."])
                    items = []
                    if hs:
                        names = [t for p, n, t in hs]
                else: items = [soal_item(t, p1) for t in c["soal"]]
                if s["key"] in D.GROUPS: items = None
            else:
                ti_s, tj_s = s["ti"], s["tj"]; hs = heads_in(kat, s["pre"], p1, p2)
                full = [{"p": s["intro"]}, {"h": "Topik pada subbab ini (judul asli buku)"}, {"ul": ["%s (hal. %d)" % (t, p) for p, n, t in hs] or ["Lihat halaman buku."]}] + list(s["extra"]) + [{"note": D.NOTE}]
                summ = dict(core=s["intro"], points=["Baca topik sesuai pekerjaan yang akan kamu kerjakan.", "Perhatikan gambar alat dan urutan kerja di halaman buku."], avoid=["Memakai alat atau material tanpa mengetahui fungsi dan bahayanya."], exam=["Nama alat/material dan fungsinya."])
                items = [soal_item(t, p1) for t in s["soal"]]
            subs_out.append(dict(id=s["id"], no=si, title={"id": ti_s, "jp": tj_s}, pages=[p1, p2], full={"id": full}, summary={"id": summ}, _items=items, _hs=hs))
        # soal navigasi untuk subbab tanpa soal tulis-tangan
        for so in subs_out:
            if so["_items"]: continue
            hs = so["_hs"]; others = [x["title"]["id"] for x in subs_out if x["id"] != so["id"]]
            pool = others + [x["title"]["id"] for b2, x in [(b, s2) for b, s2 in []]]
            allt = [ (bb, ss) for bb, ss in allsubs ]
            extra_titles = [s2["ti"] for b, s2 in allsubs if s2.get("ti") and s2["ti"] != so["title"]["id"] and s2["id"] != so["id"]]
            pool = list(dict.fromkeys(others + extra_titles + ["Pekerjaan perancah", "Keselamatan kerja"]))
            its = []
            for p, n, t in hs[:4]:
                opts = [so["title"]["id"]] + [x for x in pool if x != so["title"]["id"]][:3]
                its.append(soal_item(("Topik “%s” dibahas pada subbab…" % t, opts, "Topik ini ada di subbab “%s”, hal. %d" % (so["title"]["id"], p), 0), so["pages"][0]))
            so["_items"] = its
        for so in subs_out:
            its = so.pop("_items"); so.pop("_hs"); nsoal += len(its); semua += its
            qs_sub.append({"id": so["id"] + "-q", "title": {"id": "Latihan: " + so["title"]["id"], "jp": "{練習問題|れんしゅうもんだい}"}, "items": its})
        assert len(semua) >= 4, (P["slug"], bid, len(semua))
        rev = lambda k, it: {"id": "%s-q%d" % (bid, k), "rev": True, "title": {"id": "Ulangan Bab %d (%s)" % (bi, "AB"[k - 1]), "jp": "まとめテスト"}, "items": it}
        q3 = vocab_quiz("%s-q3" % bid, {"id": "Arti istilah lokasi (Bab %d)" % bi, "jp": "{現場用語|げんばようご}の{意味|いみ}"}, vocab, "cn-" + bid, n=8, pool=vocab)
        quiz["bab"][bid] = [rev(1, semua[0::2]), rev(2, semua[1::2]), q3] + qs_sub
        babs_out.append({"schema": 1, "bidang": P["slug"], "source": SOURCE % (P["kat"], P["books"]), "markup": "Teks memakai {kanji|furigana} untuk ruby dan **tebal**.",
                         "bab": {"id": bid, "no": bi, "title": {"id": ti, "jp": tj}, "intro": {"id": intro, "jp": tj}, "pages": [subs[0]["pages"][0], subs[-1]["pages"][1]], "subs": subs_out}})
    index = {"slug": P["slug"], "nama": P["nama"], "jp": P["jp"], "book": "id", "pages": {"id": P["total"]}}
    write_pack(P["slug"], index, babs_out, vocab, quiz)
    print("  soal total:", nsoal)

if __name__ == "__main__":
    g = parse_glossary(); print("glosarium:", len(g)); print(g[:3])
    for P in PACKS: build_pack(P, g)
