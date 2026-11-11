# -*- coding: utf-8 -*-
"""Bidang SSW "food-service-jp" (外食業 — Bahasa Jepang): versi Jepang dari 3 modul Asosiasi Jasa Boga Jepang
(衛生管理 / 飲食物調理 / 接客全般, 令和3年4月15日改訂版), dipilih dari pulau Food Service ("Bahasa Jepang").
Halaman buku = 3 PDF Jepang digabung berurutan (hal. 1–45, 46–94, 95–144), gambar di assets/ssw/food-service-jp/jp/.
Kosakata = indeks kosakata resmi di akhir tiap modul (hiragana + kanji); arti Indonesia ditulis untuk Shirose (src/food-service/jp_arti.py).
Teks modul tidak dialihketikkan; isi dibaca langsung dari halaman buku. Soal = arti kata & cara baca dari indeks resmi."""
import os, sys, json, random
sys.path.insert(0, os.path.dirname(__file__)); sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "food-service"))
from bidang_lib import vocab_item, vocab_quiz, write_pack
from jp_arti import ARTI
IDX = json.load(open(os.path.join(os.path.dirname(__file__), "src", "food-service", "jp_index.json"), encoding="utf-8"))
SOURCE = "外食業技能測定試験 学習用テキスト【衛生管理】【飲食物調理】【接客全般】令和3年4月15日改訂版 — 一般社団法人 日本フードサービス協会 (versi Jepang); indeks kosakata di akhir tiap modul"
OFF = {"P": 0, "M": 45, "L": 94}
# bab: (id, kunci indeks, judul ID, judul JP, intro, subbab[(id, judul ID, judul JP, [hal awal, hal akhir PDF modul], isi)])
BABS = [
 ("bab1", "P", "Pengawasan Kebersihan", "{衛生管理|えいせいかんり}", "Modul 衛生管理: dasar keracunan makanan, kebersihan umum, dan HACCP. Baca halaman buku berbahasa Jepang, lalu latih kosakata.", [
  ("j1s1", "Dasar Keracunan Makanan", "{食中毒|しょくちゅうどく}の{基礎|きそ}", [4, 9], "Pengetahuan dasar keracunan makanan, 3 prinsip pencegahan, serta bakteri dan virus penyebab utama."),
  ("j1s2", "Penerimaan Bahan, Suhu, Kontaminasi Silang, Pencucian Alat", "{原材料|げんざいりょう}・{温度|おんど}・{交差汚染|こうさおせん}・{洗浄|せんじょう}", [10, 13], "Pemeriksaan bahan masuk, suhu kulkas/freezer, pencegahan kontaminasi silang, pencucian-disinfeksi-sterilisasi alat masak."),
  ("j1s3", "Toilet, Kesehatan Karyawan, Cuci Tangan, Kebersihan Dapur", "トイレ・{健康管理|けんこうかんり}・{手洗|てあら}い・{清掃|せいそう}", [14, 18], "Pembersihan toilet, kesehatan dan pakaian kerja, cuci tangan, kebersihan dapur dan pengelolaan sampah."),
  ("j1s4", "Konsep HACCP", "HACCPの{考|かんが}え{方|かた}", [19, 21], "Pengawasan kebersihan dengan konsep HACCP dan titik pengendalian penting."),
  ("j1s5", "Pengelolaan Tiap Kelompok", "グループ{別|べつ}の{管理|かんり}", [22, 26], "Kelompok 1 (tanpa pemanasan), kelompok 2 (dipanaskan), kelompok 3 (pemanasan-pendinginan berulang), dan titik penting lain."),
  ("j1s6", "Catatan dan Bahan Acuan", "{記録|きろく}・{参考資料|さんこうしりょう}", [27, 43], "Pencatatan pengawasan kebersihan, contoh formulir, dan daftar kosakata."),
 ]),
 ("bab2", "M", "Persiapan Makanan dan Minuman", "{飲食物調理|いんしょくぶつちょうり}", "Modul 飲食物調理: bahan makanan, penanganan awal, cara memasak, mesin dan alat, serta keselamatan kerja di dapur.", [
  ("j2s1", "Bahan Makanan", "{食材|しょくざい}", [5, 12], "Daging, ikan dan hasil laut, serta sayur dan buah."),
  ("j2s2", "Penanganan Awal", "{下処理|したしょり}", [13, 17], "Tujuan penanganan awal, sayuran, serta ikan dan hasil laut."),
  ("j2s3", "Cara Memasak", "{調理方法|ちょうりほうほう}", [18, 22], "Memasak dengan pemanasan dan tanpa pemanasan."),
  ("j2s4", "Mesin, Alat, dan Alat Ukur", "{調理機器|ちょうりきき}・{器具|きぐ}・{計測機器|けいそくきき}", [23, 32], "Mesin masak, alat dan perlengkapan, serta alat ukur."),
  ("j2s5", "Keselamatan Kerja dan Pencegahan Kebakaran", "{労働安全衛生|ろうどうあんぜんえいせい}・{火災防止|かさいぼうし}", [33, 40], "Keselamatan dan kesehatan kerja di dapur, penggunaan mesin dan alat, pencegahan kebakaran."),
  ("j2s6", "Bahan Acuan", "{参考資料|さんこうしりょう}", [41, 49], "Lampiran dan daftar kosakata modul."),
 ]),
 ("bab3", "L", "Layanan Pelanggan", "{接客全般|せっきゃくぜんぱん}", "Modul 接客全般: layanan pelanggan, pengetahuan makanan, pengelolaan toko, keluhan, dan keadaan darurat.", [
  ("j3s1", "Layanan dan Gerakan Dasar", "{接客|せっきゃく}サービス・{基本動作|きほんどうさ}", [5, 12], "Dasar layanan pelanggan dan gerakan dasar (sapaan, membungkuk, sikap)."),
  ("j3s2", "Etiket Makan, Pelanggan Khusus, Penyajian", "マナー・{配慮|はいりょ}・{配膳|はいぜん}", [13, 19], "Etiket makan, pelayanan pelanggan yang perlu perhatian khusus, dan penyajian hidangan."),
  ("j3s3", "Istilah Dasar Layanan", "{接客基本用語|せっきゃくきほんようご}", [20, 23], "Istilah dasar layanan pelanggan dan cara memakainya."),
  ("j3s4", "Pengetahuan tentang Makanan", "{食|しょく}に{関|かん}する{知識|ちしき}", [24, 28], "Alergi makanan, minuman beralkohol, gizi, indra perasa, dan keberagaman makanan."),
  ("j3s5", "Pengelolaan Toko", "{店舗管理|てんぽかんり}", [29, 35], "Persiapan buka dan tutup, pembersihan, serta uang tunai dan pembayaran cashless."),
  ("j3s6", "Keluhan dan Benda Asing", "クレーム・{異物混入|いぶつこんにゅう}", [36, 38], "Menangani keluhan pelanggan dan kejadian benda asing."),
  ("j3s7", "Keadaan Darurat", "{緊急時|きんきゅうじ}の{対応|たいおう}", [39, 42], "Pelanggan/karyawan sakit dan bencana."),
  ("j3s8", "Bahan Acuan", "{参考資料|さんこうしりょう}", [43, 50], "Lampiran dan daftar kosakata modul."),
 ]),
]

def sub_of(key, hal, subs):
    p = hal + 4  # nomor halaman cetak indeks -> halaman PDF
    for s in subs:
        if s[3][0] <= p <= s[3][1]: return s[0]
    return subs[0][0] if p < subs[0][3][0] else subs[-1][0]

def build():
    vocab, seen, babs, quiz = [], {}, [], {"bab": {}, "tema": []}
    for bi, (bid, key, ti, tj, intro, subs) in enumerate(BABS, 1):
        for hira, word, bikou, pg in IDX[key]:
            hal = int(pg.split("P")[0]) if pg[:1].isdigit() else 1
            sid = sub_of(key, hal, subs)
            k = (bid, word)
            if k in seen:
                if sid not in seen[k]["src"]: seen[k]["src"].append(sid)
                continue
            e = vocab_item("fj", len(vocab) + 1, word, hira, ARTI[word], ti, bid, [sid]); e["_p"] = pg.rstrip("～")
            seen[k] = e; vocab.append(e)
    for bi, (bid, key, ti, tj, intro, subs) in enumerate(BABS, 1):
        words = [w for w in vocab if w["bab"] == bid]
        subs_out, qs_sub = [], []
        for si, (sid, sti, stj, (p1, p2), isi) in enumerate(subs, 1):
            off = OFF[key]; a, b = p1 + off, p2 + off
            sw = [w for w in words if sid in w["src"]]
            full = [{"p": isi + " Teks asli modul berbahasa Jepang ada pada halaman buku di bawah; baca langsung dari halaman, lalu latih kosakatanya."},
                    {"note": "Sumber: modul bahasa Jepang hal. %d–%d (buku gabungan). Daftar kosakata resmi modul ada di bagian belakang tiap modul; di sini kosakata dikelompokkan per subbab." % (a, b)}]
            subs_out.append({"id": sid, "no": si, "title": {"id": sti, "jp": stj}, "pages": [a, b], "full": {"id": full},
                             "summary": {"id": {"core": isi, "points": ["Baca halaman buku berbahasa Jepang (hiragana ditulis di atas kanji).", "Hafalkan kosakata subbab ini, lalu kerjakan latihan arti kata."], "avoid": "Menghafal arti saja tanpa membaca kalimat di halaman buku.", "exam": "Ujian memakai istilah Jepang seperti pada modul; kenali kanji dan cara bacanya."}}})
            if len(sw) >= 2:
                qs_sub.append(vocab_quiz(sid + "-q", {"id": "Latihan: " + sti, "jp": "{練習問題|れんしゅうもんだい}"}, sw, "fj-" + sid, n=8, pool=words))
        rnd = random.Random("fj-baca-" + bid)
        baca = []
        for w in rnd.sample([x for x in words if x["kata"] != x["kana"] and "（" not in x["kata"]], 12):
            others = [o for o in words if o["kana"] != w["kana"] and o["kata"] != o["kana"] and "（" not in o["kata"]]
            opts = [w] + rnd.sample(others, 3); rnd.shuffle(opts)
            baca.append({"q": {"id": "Bagaimana cara baca 「%s」?" % w["kata"], "jp": "「%s」の{読|よ}み{方|かた}は？" % w["kata"]},
                         "opts": [{"id": o["kana"], "jp": o["kana"]} for o in opts], "a": opts.index(w),
                         "exp": {"id": "%s dibaca %s (%s)." % (w["kata"], w["kana"], w["arti"]), "jp": "%s＝%s" % (w["kata"], w["kana"])}})
        q1 = vocab_quiz("%s-q1" % bid, {"id": "Arti kosakata Bab %d (A)" % bi, "jp": "ことばの{意味|いみ}"}, words, "fj1-" + bid, n=12, pool=words); q1["rev"] = True
        q2 = vocab_quiz("%s-q2" % bid, {"id": "Arti kosakata Bab %d (B)" % bi, "jp": "ことばの{意味|いみ}"}, words, "fj2-" + bid, n=12, pool=words); q2["rev"] = True
        q3 = {"id": "%s-q3" % bid, "title": {"id": "Cara baca kanji Bab %d" % bi, "jp": "{読|よ}み{方|かた}"}, "items": baca}
        quiz["bab"][bid] = [q1, q2, q3] + qs_sub
        babs.append({"schema": 1, "bidang": "food-service-jp", "source": SOURCE, "markup": "Teks memakai {kanji|furigana} untuk ruby dan **tebal**.",
                     "bab": {"id": bid, "no": bi, "title": {"id": ti, "jp": tj}, "intro": {"id": intro, "jp": tj},
                             "pages": [subs[0][3][0] + OFF[key], subs[-1][3][1] + OFF[key]], "subs": subs_out}})
    index = {"slug": "food-service-jp", "nama": "Food Service (Bahasa Jepang)", "jp": "外食業（日本語）", "book": "jp", "pages": {"jp": 144}}
    write_pack("food-service-jp", index, babs, vocab, quiz)

if __name__ == "__main__":
    build()
