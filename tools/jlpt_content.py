# -*- coding: utf-8 -*-
"""
Konten ORISINAL untuk Dokkai (読解) dan Choukai (聴解) Full Exam Shirose Nihongo.
Semua teks ditulis khusus untuk Shirose Nihongo (bukan salinan dari sumber lain).

Setiap pembuat bacaan mengembalikan:
  {"jp": teks Jepang (HTML sederhana), "id": terjemahan Indonesia, "jenis": "...",
   "qs": [ {q, opts[4], ans, alasan, bukti, opsi[4], kosakata[]} ]}
"""
import random

ABCD = "ABCD"
DOW = ["月", "火", "水", "木", "金", "土", "日"]
DOW_ID = {"月": "Senin", "火": "Selasa", "水": "Rabu", "木": "Kamis", "金": "Jumat", "土": "Sabtu", "日": "Minggu"}
NAMES = [("田中", "Tanaka"), ("山田", "Yamada"), ("佐藤", "Sato"), ("中村", "Nakamura"), ("木村", "Kimura"),
         ("林", "Hayashi"), ("森", "Mori"), ("石川", "Ishikawa"), ("小川", "Ogawa"), ("高橋", "Takahashi")]
FOREIGN = [("リン", "Lin"), ("アリ", "Ali"), ("マリア", "Maria"), ("トム", "Tom"), ("ワン", "Wang"), ("サラ", "Sara"),
           ("デウィ", "Dewi"), ("ハン", "Han")]

def shuf(rnd, correct, wrong):
    items = [(correct, True)] + [(w, False) for w in wrong]
    rnd.shuffle(items)
    opts = [x[0] for x in items]
    return opts, [x[1] for x in items].index(True)

def mk_q(q, opts, ans, alasan, bukti, why_wrong, kosakata=None):
    """why_wrong: dict opsi-teks → alasan salah."""
    opsi = []
    for i, o in enumerate(opts):
        if i == ans:
            opsi.append(f"{ABCD[i]}. {o} — BENAR. {alasan}")
        else:
            opsi.append(f"{ABCD[i]}. {o} — Salah. {why_wrong.get(o, 'Tidak sesuai dengan isi bacaan.')}")
    return {"q": q, "opts": opts, "ans": ans, "alasan": alasan, "bukti": bukti, "opsi": opsi,
            "kosakata": kosakata or []}

# =================================================================== BAND A (N5–N4)
def a_notice(rnd, lv):
    m = rnd.randint(4, 12); d = rnd.randint(3, 25); di = rnd.randrange(7)
    dow = DOW[di]; nd = d + 1; ndow = DOW[(di + 1) % 7]
    reason = rnd.choice([("そうじを します", "ada bersih-bersih"), ("でんきの こうじが あります", "ada perbaikan listrik"),
                         ("本の かずを かぞえます", "ada penghitungan jumlah buku")])
    op, cl = rnd.choice([(9, 5), (10, 6), (9, 7)])
    place = rnd.choice([("いりぐちの 右", "sebelah kanan pintu masuk"), ("いりぐちの 左", "sebelah kiri pintu masuk"),
                        ("ちゅうしゃじょうの 前", "depan tempat parkir")])
    jp = (f"<b>としょかんの おしらせ</b><br>"
          f"{m}月{d}日（{dow}）は {reason[0]}から、としょかんは 休みです。<br>"
          f"この 日に 本を かえしたい 人は、{place[0]}に ある「本の ポスト」に 入れて ください。<br>"
          f"{nd}日（{ndow}）からは、いつもと おなじ {op}時から {cl}時まで あいて います。")
    tr = (f"PENGUMUMAN PERPUSTAKAAN. Tanggal {d} bulan {m} ({DOW_ID[dow]}) perpustakaan libur karena {reason[1]}. "
          f"Yang ingin mengembalikan buku pada hari itu, masukkan ke \"kotak buku\" di {place[1]}. "
          f"Mulai tanggal {nd} ({DOW_ID[ndow]}), buka seperti biasa pukul {op} sampai pukul {cl}.")
    correct = f"{place[0]}の ポストに 入れる"
    wrong = ["としょかんの 人に わたす", f"{nd}日に としょかんの 中で かえす", "うちで まって、つぎの 週に かえす"]
    opts, ans = shuf(rnd, correct, wrong)
    q1 = mk_q(f"{m}月{d}日に 本を かえしたい 人は どう しますか。", opts, ans,
              f"Bacaan menulis 「{place[0]}に ある『本の ポスト』に 入れて ください」.",
              f"この 日に 本を かえしたい 人は、{place[0]}に ある「本の ポスト」に 入れて ください。",
              {wrong[0]: "Perpustakaan libur, jadi tidak ada petugas yang menerima.",
               wrong[1]: f"Tanggal {nd} memang buka, tetapi pertanyaannya tentang tanggal {d}.",
               wrong[2]: "Tidak ada perintah menunggu sampai minggu depan."},
              ["おしらせ = pengumuman", "かえす = mengembalikan", "ポスト = kotak (pos)", "あく = buka"])
    c2 = f"{op}時から {cl}時まで"
    w2 = [f"{op}時から {cl+1}時まで", f"{op+1}時から {cl}時まで", f"{op}時から {cl}時半まで"]
    o2, a2 = shuf(rnd, c2, w2)
    q2 = mk_q(f"{nd}日、としょかんは 何時から 何時まで あいて いますか。", o2, a2,
              f"「{nd}日からは、いつもと おなじ {op}時から {cl}時まで あいて います」.",
              f"{nd}日（{ndow}）からは、いつもと おなじ {op}時から {cl}時まで あいて います。", {})
    return {"jenis": "Pengumuman (お知らせ)", "jp": jp, "id": tr, "qs": [q1, q2]}

def a_memo(rnd, lv):
    (to, to_r), (fr, fr_r) = rnd.sample(NAMES, 2)
    ev, ev_id = rnd.choice([("パーティー", "pesta"), ("ピクニック", "piknik"), ("べんきょうかい", "kelompok belajar")])
    t = rnd.randint(1, 5); meet = t  # pm
    place, place_id = rnd.choice([("えきの 北口", "pintu utara stasiun"), ("こうえんの 入り口", "pintu masuk taman"),
                                  ("学校の もん", "gerbang sekolah")])
    item, item_id = rnd.choice([("のみもの", "minuman"), ("おかし", "kue/camilan"), ("くだもの", "buah")])
    not_item, not_id = rnd.choice([(x, y) for x, y in [("おべんとう", "bekal"), ("おさら", "piring"), ("いす", "kursi")]])
    jp = (f"{to}さんへ<br>"
          f"あしたの {ev}は、ごご {t}時半から はじまります。<br>"
          f"わたしたちは {t}時に {place}で あいましょう。<br>"
          f"{not_item}は わたしが もって いきますから、いりません。{to}さんは {item}を かって きて ください。<br>"
          f"{fr}")
    tr = (f"Untuk {to_r}. {ev_id.capitalize()} besok mulai pukul {t}.30 siang. Kita bertemu pukul {t} di {place_id}. "
          f"{not_id.capitalize()} saya yang bawa, jadi tidak perlu. Tolong {to_r} beli {item_id}. — {fr_r}")
    c = f"{t}時に {place}へ 行って、{item}を もって いく"
    w = [f"{t}時半に {place}へ 行って、{item}を もって いく",
         f"{t}時に {place}へ 行って、{not_item}を もって いく",
         f"{t}時半に {place}へ 行って、{not_item}を もって いく"]
    o, a = shuf(rnd, c, w)
    q = mk_q(f"{to}さんは あした どう しますか。", o, a,
             f"Bertemu pukul {t} (bukan {t}.30 — itu jam mulai acara) dan membawa {item_id}.",
             f"わたしたちは {t}時に {place}で あいましょう。…{to}さんは {item}を かって きて ください。",
             {w[0]: f"{t}時半 adalah jam acara dimulai, bukan jam bertemu.",
              w[1]: f"{not_item} dibawa oleh {fr}, bukan {to}.",
              w[2]: "Jam dan barangnya sama-sama salah."},
             ["はじまる = mulai", "あう = bertemu", "いる = perlu", "かって くる = membeli lalu membawa"])
    return {"jenis": "Memo / pesan", "jp": jp, "id": tr, "qs": [q]}

def a_table(rnd, lv):
    courses = [("ギター", "gitar"), ("りょうり", "memasak"), ("えいご", "bahasa Inggris"), ("すいえい", "renang"),
               ("ダンス", "menari"), ("え", "melukis")]
    rows = rnd.sample(courses, 4)
    days = rnd.sample(DOW, 4)
    times = [rnd.choice(["ごぜん 10時", "ごご 2時", "ごご 7時", "ごご 6時半"]) for _ in rows]
    prices = [rnd.choice([2000, 2500, 3000, 3500, 4000]) for _ in rows]
    # pastikan tepat satu jawaban: hari ini malam & harga ≤ budget
    target = rnd.randrange(4)
    times[target] = rnd.choice(["ごご 7時", "ごご 6時半"])
    budget = prices[target]
    for i in range(4):
        if i != target and times[i] in ("ごご 7時", "ごご 6時半"):
            prices[i] = budget + 1000
    name, name_r = rnd.choice(FOREIGN)
    tbl = "<table class='jx-table'><tr><th>きょうしつ</th><th>曜日</th><th>時間</th><th>1回の お金</th></tr>" + "".join(
        f"<tr><td>{r[0]}</td><td>{d}曜日</td><td>{t}</td><td>{p}円</td></tr>" for r, d, t, p in zip(rows, days, times, prices)) + "</table>"
    jp = f"<b>みどり市 文化センター きょうしつの あんない</b><br>{tbl}"
    tr = "Panduan kelas Pusat Budaya Kota Midori: " + "; ".join(
        f"kelas {r[1]} hari {DOW_ID[d]}, {t.replace('ごぜん','pagi').replace('ごご','sore/malam')}, {p} yen/sekali" for r, d, t, p in zip(rows, days, times, prices))
    q_text = f"{name}さんは ひるは しごとが あります。よる、1回 {budget}円までで ならいたいです。どの きょうしつが いいですか。"
    c = rows[target][0]
    w = [r[0] for i, r in enumerate(rows) if i != target]
    o, a = shuf(rnd, c, w)
    why = {}
    for i, r in enumerate(rows):
        if i == target: continue
        why[r[0]] = (f"Jamnya {times[i]} (bukan malam)." if times[i] not in ("ごご 7時", "ごご 6時半")
                     else f"Malam, tetapi biayanya {prices[i]} yen, lebih dari {budget} yen.")
    q = mk_q(q_text, o, a, f"Hanya kelas {rows[target][1]} yang malam ({times[target]}) dan biayanya {budget} yen.",
             f"{rows[target][0]}｜{days[target]}曜日｜{times[target]}｜{prices[target]}円", why,
             ["きょうしつ = kelas/kursus", "ならう = belajar (dari guru)", "～まで = sampai/maksimal"])
    return {"jenis": "Mencari informasi (情報検索)", "jp": jp, "id": tr, "qs": [q], "info": True}

def a_diary(rnd, lv):
    w = rnd.choice([("雨", "hujan"), ("とても さむい 日", "hari yang sangat dingin")])
    plan, plan_id = rnd.choice([("友だちと うみへ 行く", "pergi ke laut bersama teman"), ("こうえんで テニスを する", "main tenis di taman"),
                                ("山に のぼる", "mendaki gunung")])
    did, did_id = rnd.choice([("へやの そうじを しました", "membersihkan kamar"), ("ケーキを 作りました", "membuat kue"),
                              ("日本語の 本を 読みました", "membaca buku bahasa Jepang")])
    fr, fr_r = rnd.choice(NAMES)
    jp = (f"きのうは {w[0]}でした。{plan}つもりでしたが、行きませんでした。"
          f"ごぜんは うちで {did}。ごごは {fr}さんから 電話が あって、らいしゅう いっしょに 行く ことに なりました。")
    tr = (f"Kemarin {w[1]}. Saya berencana {plan_id}, tetapi tidak jadi. Pagi hari saya {did_id} di rumah. "
          f"Sore, {fr_r} menelepon, dan kami memutuskan untuk pergi bersama minggu depan.")
    c = did.replace("しました", "した").replace("作りました", "作った").replace("読みました", "読んだ")
    wr = [plan, f"{fr}さんの うちへ 行った", "一日中 ねて いた"]
    o, a = shuf(rnd, c, wr)
    q = mk_q("きのうの ごぜん、この 人は 何を しましたか。", o, a, f"「ごぜんは うちで {did}」.",
             f"ごぜんは うちで {did}。",
             {wr[0]: "Itu rencananya, tetapi tidak jadi (行きませんでした).",
              wr[1]: f"{fr}さん hanya menelepon.", wr[2]: "Tidak ada keterangan tidur seharian."},
             ["つもり = rencana/niat", "～ことに なる = diputuskan bahwa…"])
    return {"jenis": "Teks pendek (短文)", "jp": jp, "id": tr, "qs": [q]}

# =================================================================== BAND B (N3)
def b_notice(rnd, lv):
    m = rnd.randint(1, 12); d1 = rnd.randint(5, 20); d2 = d1 + 2
    old, new = rnd.sample(["月曜日と木曜日", "火曜日と金曜日", "水曜日と土曜日"], 2)
    old_id = old.replace("月曜日", "Senin").replace("火曜日", "Selasa").replace("水曜日", "Rabu").replace("木曜日", "Kamis").replace("金曜日", "Jumat").replace("土曜日", "Sabtu").replace("と", " dan ")
    new_id = new.replace("月曜日", "Senin").replace("火曜日", "Selasa").replace("水曜日", "Rabu").replace("木曜日", "Kamis").replace("金曜日", "Jumat").replace("土曜日", "Sabtu").replace("と", " dan ")
    tm = rnd.choice(["8時", "8時半"])
    jp = (f"<b>さくら荘にお住まいの皆様へ</b><br>"
          f"{m}月{d1}日から、燃えるごみの日が{old}から{new}に変わります。"
          f"ごみは当日の朝{tm}までに、建物の裏にある集積所に出してください。"
          f"前の日の夜に出すと、カラスがごみを散らかすことがありますので、ご注意ください。"
          f"なお、びん・缶の日はこれまでどおりです。<br>管理人")
    tr = (f"Kepada seluruh penghuni Sakura-sō. Mulai tanggal {d1} bulan {m}, hari sampah yang bisa dibakar berubah dari {old_id} menjadi {new_id}. "
          f"Keluarkan sampah pada pagi harinya paling lambat pukul {tm.replace('時半', '.30').replace('時', '.00')} ke tempat pengumpulan di belakang gedung. "
          f"Jika dikeluarkan pada malam sebelumnya, burung gagak kadang mengacak-acak sampah, jadi harap berhati-hati. Hari botol & kaleng tetap seperti biasa. — Pengelola")
    c = f"{new}の朝{tm}までに、建物の裏に出す"
    w = [f"{old}の朝{tm}までに、建物の裏に出す", f"{new}の前の日の夜に、建物の裏に出す", f"{new}の朝{tm}までに、建物の前に出す"]
    o, a = shuf(rnd, c, w)
    q = mk_q(f"{m}月{d1}日から、燃えるごみはどのように出せばいいか。", o, a,
             "Harinya yang BARU, pagi hari sebelum batas jam, di belakang gedung.",
             f"燃えるごみの日が{old}から{new}に変わります。ごみは当日の朝{tm}までに、建物の裏にある集積所に出してください。",
             {w[0]: f"{old} adalah jadwal LAMA.", w[1]: "Malam sebelumnya justru dilarang karena gagak.",
              w[2]: "Tempatnya di BELAKANG gedung (裏), bukan depan."},
             ["燃えるごみ = sampah yang bisa dibakar", "当日 = hari itu", "集積所 = tempat pengumpulan", "散らかす = mengacak-acak", "なお = selain itu / catatan"])
    return {"jenis": "Pengumuman (お知らせ)", "jp": jp, "id": tr, "qs": [q]}

def b_mail(rnd, lv):
    (t, t_r) = rnd.choice(NAMES)
    (s, s_r) = rnd.choice(FOREIGN)
    d = rnd.randint(10, 25); room_old, room_new = rnd.sample(["301", "205", "402", "108"], 2)
    hw, hw_id = rnd.choice([("レポートを読んでおいて", "membaca laporan terlebih dahulu"),
                            ("教科書の第5課の単語を調べておいて", "mencari arti kosakata Bab 5 buku pelajaran"),
                            ("発表の資料を一枚にまとめておいて", "merangkum bahan presentasi menjadi satu lembar")])
    jp = (f"件名：{d}日の授業について<br>{s}さん<br>"
          f"来週{d}日の授業ですが、教室が{room_old}から{room_new}に変わりました。時間は変わりません。"
          f"また、授業までに{hw}ください。授業ではそれを使って話し合いをします。"
          f"わからないことがあれば、前の日までにメールで聞いてください。<br>{t}")
    tr = (f"Perihal: Kelas tanggal {d}. Untuk {s_r}. Kelas minggu depan tanggal {d}, ruangannya berubah dari {room_old} ke {room_new}. Jamnya tidak berubah. "
          f"Selain itu, sebelum kelas tolong {hw_id}. Di kelas kita akan berdiskusi memakai itu. Kalau ada yang tidak dimengerti, tanyakan lewat email paling lambat sehari sebelumnya. — {t_r}")
    c = f"{room_new}の教室に行く前に、{hw.replace('ておいて', 'ておく').replace('んでおいて', 'んでおく')}"
    w = [f"{room_old}の教室に行く前に、{hw.replace('ておいて', 'ておく').replace('んでおいて', 'んでおく')}",
         f"{room_new}の教室で、先生と一緒に話し合いの準備をする",
         f"授業の時間が変わったので、{t}先生にメールで聞く"]
    o, a = shuf(rnd, c, w)
    q = mk_q(f"このメールを読んだ{s}さんは、どうしなければならないか。", o, a,
             f"Ruang baru {room_new}, dan tugas harus selesai SEBELUM kelas (～ておいてください).",
             f"教室が{room_old}から{room_new}に変わりました。…授業までに{hw}ください。",
             {w[0]: f"{room_old} adalah ruangan lama.", w[1]: "Persiapan dikerjakan sendiri sebelum kelas, bukan bersama guru.",
              w[2]: "Jam kelas TIDAK berubah (時間は変わりません)."},
             ["件名 = perihal", "～ておく = melakukan sebagai persiapan", "話し合い = diskusi"])
    return {"jenis": "Email (メール)", "jp": jp, "id": tr, "qs": [q]}

def b_jobs(rnd, lv):
    jobs = [("コンビニ", "minimarket"), ("レストラン", "restoran"), ("本屋", "toko buku"), ("ホテルの受付", "resepsionis hotel")]
    pay = [1050, 1100, 1150, 1200]
    rnd.shuffle(pay)
    days = ["土・日", "平日のみ", "月・水・金", "土・日"]
    rnd.shuffle(days)
    lang = ["不要", "日本語で会話ができる人", "英語ができる人", "不要"]
    rnd.shuffle(lang)
    # pastikan tepat satu cocok: akhir pekan, bahasa tidak wajib Inggris, gaji tertinggi di antara yang cocok
    tgt = rnd.randrange(4)
    days[tgt] = "土・日"; lang[tgt] = rnd.choice(["不要", "日本語で会話ができる人"])
    for i in range(4):
        if i != tgt and days[i] == "土・日" and lang[i] != "英語ができる人":
            pay[i] = min(pay[i], pay[tgt] - 50) if pay[tgt] > 1000 else pay[i]
    if any(i != tgt and days[i] == "土・日" and lang[i] != "英語ができる人" and pay[i] >= pay[tgt] for i in range(4)):
        pay[tgt] = max(pay) + 50
    tbl = "<table class='jx-table'><tr><th>仕事</th><th>時給</th><th>曜日</th><th>条件</th></tr>" + "".join(
        f"<tr><td>{j[0]}</td><td>{p}円</td><td>{d}</td><td>{l}</td></tr>" for j, p, d, l in zip(jobs, pay, days, lang)) + "</table>"
    (s, s_r) = rnd.choice(FOREIGN)
    jp = f"<b>留学生向けアルバイト情報</b><br>{tbl}"
    tr = "Info kerja paruh waktu untuk pelajar asing: " + "; ".join(f"{j[1]} {p} yen/jam, hari {d}, syarat: {l}" for j, p, d, l in zip(jobs, pay, days, lang))
    qtext = f"{s}さんは平日は学校があるので、土曜日と日曜日に働きたい。英語は話せない。条件に合う仕事の中で、時給がいちばん高いものはどれか。"
    c = jobs[tgt][0]
    w = [j[0] for i, j in enumerate(jobs) if i != tgt]
    o, a = shuf(rnd, c, w)
    why = {}
    for i, j in enumerate(jobs):
        if i == tgt: continue
        if days[i] != "土・日": why[j[0]] = f"Harinya {days[i]}, bukan akhir pekan."
        elif lang[i] == "英語ができる人": why[j[0]] = "Mensyaratkan bisa bahasa Inggris."
        else: why[j[0]] = f"Cocok, tetapi upahnya {pay[i]} yen, lebih rendah dari {pay[tgt]} yen."
    q = mk_q(qtext, o, a, f"{jobs[tgt][1]}: akhir pekan, tidak wajib bahasa Inggris, upah {pay[tgt]} yen (tertinggi di antara yang cocok).",
             f"{jobs[tgt][0]}｜{pay[tgt]}円｜{days[tgt]}｜{lang[tgt]}", why,
             ["時給 = upah per jam", "平日 = hari kerja (Senin–Jumat)", "条件 = syarat", "不要 = tidak perlu"])
    return {"jenis": "Mencari informasi (情報検索)", "jp": jp, "id": tr, "qs": [q], "info": True}

# Esai pendek orisinal (pendapat) — N3
B_ESSAYS = [
    ("最近、駅や電車の中で本を読む人が減ったと言われる。確かに、スマートフォンを見ている人のほうが多い。しかし、スマートフォンで小説やニュースを読んでいる人も少なくない。読む道具が変わっただけで、文字を読むこと自体が嫌いになったわけではないのだと思う。",
     "Belakangan dikatakan bahwa orang yang membaca buku di stasiun dan kereta berkurang. Memang lebih banyak yang melihat ponsel. Namun, tidak sedikit pula yang membaca novel atau berita lewat ponsel. Saya rasa hanya alat bacanya yang berubah; bukan berarti orang menjadi benci membaca tulisan.",
     "筆者は、本を読む人が減ったことについてどう考えているか。",
     "人々は読む道具を変えただけで、読むことが嫌いになったのではない",
     ["スマートフォンのせいで、人々は文字を読まなくなった", "電車の中では、本よりニュースを読むべきだ", "本を読む人は、昔より増えている"],
     "読む道具が変わっただけで、文字を読むこと自体が嫌いになったわけではないのだと思う。"),
    ("料理が苦手だという人は多い。でも、最初から上手な人はいない。私も、初めて作ったカレーは水が多すぎて、スープのようだった。大切なのは、失敗した理由を考えて、次に少しだけ変えてみることだ。それを続ければ、だれでも上手になれる。",
     "Banyak orang yang bilang tidak pandai memasak. Tapi tidak ada orang yang pandai sejak awal. Saya pun, kari pertama yang saya buat terlalu banyak air sehingga seperti sup. Yang penting adalah memikirkan alasan gagal, lalu mencoba mengubah sedikit di kesempatan berikutnya. Kalau itu diteruskan, siapa pun bisa menjadi pandai.",
     "筆者によると、料理が上手になるために大切なことは何か。",
     "失敗の理由を考えて、次に少し変えてみること",
     ["最初から難しい料理を作ること", "水を少なくしてカレーを作ること", "上手な人に料理を作ってもらうこと"],
     "大切なのは、失敗した理由を考えて、次に少しだけ変えてみることだ。"),
    ("子どものころ、私は自転車に乗るのが怖かった。何度も転んで、もうやめたいと思った。そのとき父は「自転車を見ないで、行きたい方を見なさい」と言った。言われたとおりにすると、不思議なことにまっすぐ進めた。今でも困ったときは、この言葉を思い出す。",
     "Waktu kecil saya takut naik sepeda. Saya jatuh berkali-kali dan ingin berhenti. Saat itu ayah berkata, \"Jangan lihat sepedanya, lihatlah ke arah yang ingin kamu tuju.\" Ketika saya melakukannya, anehnya saya bisa melaju lurus. Sampai sekarang, kalau sedang kesulitan, saya teringat kata-kata ini.",
     "筆者が困ったときに父の言葉を思い出すのはなぜか。",
     "目標のほうを見ると、うまく進めることがわかったから",
     ["父に自転車をやめるように言われたから", "自転車に乗るのが今でも怖いから", "父が何度も転んだ話をしたから"],
     "言われたとおりにすると、不思議なことにまっすぐ進めた。"),
    ("私の町では、毎月一回、川の掃除をしている。参加するのはお年寄りが多く、若い人はあまり来ない。そこで今年から、掃除のあとにみんなでお茶を飲む時間を作った。すると、少しずつ若い人や子どもも来るようになった。人が集まるには、楽しみも必要なのだろう。",
     "Di kota saya, setiap bulan sekali diadakan bersih-bersih sungai. Yang ikut kebanyakan orang tua; anak muda jarang datang. Karena itu mulai tahun ini dibuat waktu minum teh bersama setelah bersih-bersih. Hasilnya, sedikit demi sedikit anak muda dan anak-anak mulai datang. Agar orang mau berkumpul, mungkin juga dibutuhkan kesenangan.",
     "若い人が来るようになったのはなぜか。",
     "掃除のあとに、みんなでお茶を飲む時間ができたから",
     ["お年寄りが掃除に来なくなったから", "掃除の回数が毎週になったから", "川がとてもきれいになったから"],
     "掃除のあとにみんなでお茶を飲む時間を作った。すると、少しずつ若い人や子どもも来るようになった。"),
    ("「早く寝なさい」と言われても、なかなか寝られない夜がある。そんなとき、私は無理に寝ようとしないで、温かい牛乳を飲んで、好きな音楽を小さい音で聞く。眠らなければと思うほど、目が覚めてしまうからだ。",
     "Ada malam-malam ketika sudah disuruh \"cepat tidur\" pun, tetap sulit tidur. Saat seperti itu, saya tidak memaksa diri untuk tidur, tetapi minum susu hangat dan mendengarkan musik kesukaan dengan suara kecil. Sebab semakin saya berpikir harus tidur, justru semakin terjaga.",
     "筆者が無理に寝ようとしないのはなぜか。",
     "寝なければと思うと、かえって眠れなくなるから",
     ["温かい牛乳を飲むと、すぐ眠くなるから", "夜は音楽を聞くほうが体にいいから", "早く寝なさいと言われるのが嫌いだから"],
     "眠らなければと思うほど、目が覚めてしまうからだ。"),
    ("私はメモを取るとき、ノートではなく小さいカードを使っている。一枚に一つのことだけを書くので、あとで並べ替えたり、いらないものを捨てたりしやすい。考えを整理するには、書く場所を小さくするのがいいようだ。",
     "Saat mencatat, saya tidak memakai buku catatan melainkan kartu kecil. Karena satu lembar hanya berisi satu hal, nantinya mudah diurutkan ulang atau dibuang yang tidak perlu. Tampaknya, untuk merapikan pikiran, lebih baik memperkecil tempat menulis.",
     "筆者がカードを使うのはなぜか。",
     "一つずつ書くので、あとで整理しやすいから",
     ["ノートより安くて便利だから", "たくさんのことを一枚に書けるから", "なくしてもあまり困らないから"],
     "一枚に一つのことだけを書くので、あとで並べ替えたり、いらないものを捨てたりしやすい。"),
    ("引っ越しをして、近所に知っている人がいなくなった。最初は寂しかったが、毎朝同じ時間に散歩していると、同じ人に何度も会う。あいさつをするうちに、天気の話をするようになり、今では野菜をもらうこともある。小さなあいさつが、関係の始まりなのだと思う。",
     "Setelah pindah rumah, saya tidak punya kenalan di sekitar. Awalnya kesepian, tetapi karena setiap pagi berjalan-jalan pada jam yang sama, saya berkali-kali bertemu orang yang sama. Sambil saling menyapa, kami mulai mengobrol soal cuaca, dan sekarang kadang saya diberi sayuran. Saya rasa sapaan kecil adalah awal sebuah hubungan.",
     "筆者が言いたいことは何か。",
     "あいさつのような小さなことから、人との関係が始まる",
     ["引っ越しをすると、必ず寂しくなる", "散歩は毎朝同じ時間にしたほうが体にいい", "近所の人から野菜をもらうのはよくない"],
     "小さなあいさつが、関係の始まりなのだと思う。"),
    ("会議で意見を言うのが苦手な人は、話す前に「結論は二つあります」のように数を先に言うといい。聞く人は全体の長さがわかるので、安心して最後まで聞いてくれる。話す人も、途中で何を言うか忘れにくくなる。",
     "Bagi orang yang tidak pandai menyampaikan pendapat dalam rapat, sebaiknya sebutkan jumlahnya lebih dulu, misalnya \"Kesimpulannya ada dua.\" Pendengar jadi tahu panjang keseluruhannya sehingga tenang mendengarkan sampai akhir. Pembicara pun jadi tidak mudah lupa apa yang akan dikatakan di tengah jalan.",
     "数を先に言うと、聞く人にとってどんないいことがあるか。",
     "話の全体の長さがわかって、安心して聞ける",
     ["話す人の意見に賛成しやすくなる", "会議の時間が必ず短くなる", "結論を自分で考えなくてよくなる"],
     "聞く人は全体の長さがわかるので、安心して最後まで聞いてくれる。"),
    ("旅行の写真をたくさん撮っても、あとで見ることは意外と少ない。最近私は、一日に撮る写真を五枚までと決めた。枚数が少ないと、本当に残したい景色を選ぶようになり、その場所をよく見るようになった。",
     "Meski memotret banyak foto saat berwisata, ternyata jarang dilihat lagi nanti. Belakangan saya memutuskan untuk memotret maksimal lima foto sehari. Karena jumlahnya sedikit, saya jadi memilih pemandangan yang benar-benar ingin disimpan, dan jadi lebih memperhatikan tempat itu.",
     "写真の数を決めてから、筆者はどう変わったか。",
     "場所をよく見て、残したい景色を選ぶようになった",
     ["旅行に行く回数が少なくなった", "撮った写真をすぐ消すようになった", "一日中写真を撮るようになった"],
     "本当に残したい景色を選ぶようになり、その場所をよく見るようになった。"),
    ("外国語を勉強するとき、間違えるのが怖くて話せない人がいる。しかし、相手は文法の先生ではない。多くの場合、少し間違えても意味は通じる。完ぺきな文を作ろうとするより、伝えたいことを短く言うほうが、会話は続くものだ。",
     "Saat belajar bahasa asing, ada orang yang tidak bisa berbicara karena takut salah. Namun, lawan bicara bukanlah guru tata bahasa. Dalam banyak kasus, walau sedikit salah, maknanya tetap tersampaikan. Daripada berusaha membuat kalimat sempurna, mengatakan hal yang ingin disampaikan secara singkat membuat percakapan terus berlanjut.",
     "筆者の考えに合うのはどれか。",
     "完ぺきでなくても、短く伝えるほうが会話は続く",
     ["間違えないように、文法をよく勉強してから話すべきだ", "外国語は先生とだけ話したほうがいい", "間違えると、意味はほとんど通じない"],
     "完ぺきな文を作ろうとするより、伝えたいことを短く言うほうが、会話は続くものだ。"),
]

# =================================================================== BAND C (N2–N1)
def c_notice(rnd, lv):
    d = rnd.randint(10, 28); h1, h2 = rnd.choice([(9, 12), (13, 17), (18, 21)])
    sys_id = rnd.choice([("勤怠管理システム", "sistem absensi"), ("経費精算システム", "sistem klaim biaya"), ("社内メール", "email internal")])
    jp = (f"<b>【社内のお知らせ】{sys_id[0]}停止のご案内</b><br>"
          f"サーバー更新作業に伴い、{d}日（土）{h1}時から{h2}時まで、{sys_id[0]}が利用できなくなります。"
          f"作業時間中に入力した内容は保存されませんので、ご注意ください。"
          f"なお、作業が予定より早く終了した場合でも、{h2}時までは利用を控えてください。"
          f"急ぎの申請がある方は、前日までに各部署の担当者へ書類で提出してください。<br>情報システム部")
    tr = (f"[Pengumuman internal] Penghentian {sys_id[1]}. Sehubungan dengan pembaruan server, pada tanggal {d} (Sabtu) pukul {h1}.00–{h2}.00 {sys_id[1]} tidak dapat digunakan. "
          f"Isian yang dimasukkan selama jam pekerjaan tidak akan tersimpan, harap berhati-hati. Selain itu, meskipun pekerjaan selesai lebih cepat dari jadwal, harap jangan menggunakan sistem sampai pukul {h2}.00. "
          f"Bagi yang memiliki pengajuan mendesak, serahkan dalam bentuk dokumen kertas kepada penanggung jawab di masing-masing bagian paling lambat sehari sebelumnya. — Divisi Sistem Informasi")
    c = "前日までに、部署の担当者に書類を出す"
    w = [f"{d}日の{h1}時前に、システムに入力しておく", f"作業が終わり次第、{h2}時前でもシステムで申請する", f"{d}日の作業時間中に、情報システム部へ直接連絡する"]
    o, a = shuf(rnd, c, w)
    q = mk_q("急いで申請しなければならない社員は、どうすればいいか。", o, a,
             "Pengajuan mendesak → dokumen kertas ke penanggung jawab bagian, paling lambat sehari sebelumnya.",
             "急ぎの申請がある方は、前日までに各部署の担当者へ書類で提出してください。",
             {w[0]: "Tidak disebutkan; yang diminta adalah dokumen kertas.",
              w[1]: f"Dilarang memakai sistem sebelum pukul {h2} walau pekerjaan selesai lebih cepat.",
              w[2]: "Tidak ada instruksi menghubungi Divisi Sistem Informasi."},
             ["～に伴い = seiring/sehubungan dengan", "控える = menahan diri", "申請 = pengajuan", "提出 = menyerahkan"])
    return {"jenis": "Pemberitahuan bisnis (お知らせ)", "jp": jp, "id": tr, "qs": [q]}

def c_mail(rnd, lv):
    (n, n_r) = rnd.choice(NAMES)
    prod, prod_id = rnd.choice([("新商品のカタログ", "katalog produk baru"), ("見積書", "surat penawaran harga"), ("会議の議事録", "notulen rapat")])
    d1 = rnd.randint(5, 15); d2 = d1 + rnd.choice([3, 4, 5])
    jp = (f"件名：{prod}送付日変更のお詫び<br>株式会社みらい商事　{n}様<br>"
          f"いつも大変お世話になっております。<br>先日ご依頼いただいた{prod}につきまして、{d1}日にお送りするとお約束しておりましたが、"
          f"内容に一部誤りが見つかったため、確認作業を行っております。誠に申し訳ございませんが、送付日を{d2}日に変更させていただけないでしょうか。"
          f"なお、ご都合が悪い場合は、修正前の資料を先にお送りすることも可能です。ご検討のほど、よろしくお願い申し上げます。<br>ひかり出版　営業部")
    tr = (f"Perihal: Permohonan maaf atas perubahan tanggal pengiriman {prod_id}. Kepada Bapak/Ibu {n_r}, PT Mirai Shōji. Terima kasih atas kerja samanya selama ini. "
          f"Mengenai {prod_id} yang Anda minta beberapa waktu lalu, kami telah berjanji mengirimkannya tanggal {d1}, namun karena ditemukan sebagian kesalahan isi, kami sedang melakukan pengecekan. "
          f"Kami mohon maaf, bolehkah tanggal pengiriman diubah menjadi tanggal {d2}? Apabila waktunya tidak sesuai, kami juga bisa mengirimkan dokumen sebelum revisi terlebih dahulu. Mohon pertimbangannya. — Divisi Penjualan Hikari Shuppan")
    c = f"送付を{d2}日にしてよいか、相手に確認すること"
    w = [f"{d1}日に修正前の資料を必ず送ること", "資料の誤りを相手に直してもらうこと", "新しい資料の注文を取り消すこと"]
    o, a = shuf(rnd, c, w)
    q = mk_q("このメールのいちばんの目的は何か。", o, a,
             f"Inti email: meminta izin mengubah tanggal kirim menjadi tanggal {d2} (させていただけないでしょうか).",
             f"送付日を{d2}日に変更させていただけないでしょうか。",
             {w[0]: "Mengirim dokumen sebelum revisi hanya alternatif JIKA penerima keberatan.",
              w[1]: "Kesalahan diperiksa oleh pengirim sendiri.", w[2]: "Tidak ada pembatalan pesanan."},
             ["お詫び = permohonan maaf", "送付 = pengiriman", "～させていただけないでしょうか = bolehkah kami… (sangat sopan)", "検討 = pertimbangan"])
    return {"jenis": "Email bisnis (メール)", "jp": jp, "id": tr, "qs": [q]}

def c_seminar(rnd, lv):
    sem = [("A", "初めての資産運用", "pengelolaan aset pemula"), ("B", "伝わる企画書の書き方", "menulis proposal yang efektif"),
           ("C", "職場のストレス対策", "mengatasi stres di kantor"), ("D", "英語で行う会議の進め方", "memimpin rapat berbahasa Inggris")]
    when = ["平日 19:00〜20:30", "土曜 10:00〜12:00", "平日 19:00〜20:30", "土曜 14:00〜16:00"]
    rnd.shuffle(when)
    fee = [rnd.choice([0, 1000, 2000, 3000]) for _ in sem]
    online = [rnd.choice(["会場のみ", "オンライン可"]) for _ in sem]
    tgt = rnd.randrange(4)
    when[tgt] = rnd.choice(["土曜 10:00〜12:00", "土曜 14:00〜16:00"]); online[tgt] = "オンライン可"; fee[tgt] = rnd.choice([0, 1000])
    for i in range(4):
        if i != tgt and when[i].startswith("土曜") and online[i] == "オンライン可":
            online[i] = "会場のみ"
    tbl = "<table class='jx-table'><tr><th>講座</th><th>テーマ</th><th>日時</th><th>受講料</th><th>参加方法</th></tr>" + "".join(
        f"<tr><td>{s[0]}</td><td>{s[1]}</td><td>{w}</td><td>{'無料' if f == 0 else str(f) + '円'}</td><td>{o}</td></tr>"
        for s, w, f, o in zip(sem, when, fee, online)) + "</table>"
    jp = f"<b>市民キャリア講座　秋期受講者募集</b><br>{tbl}<br>※申し込みは各講座の1週間前まで。オンライン参加の方には前日にURLをお送りします。"
    tr = ("Kursus Karier Warga — penerimaan peserta musim gugur: " + "; ".join(
        f"kursus {s[0]} ({s[2]}), {w.replace('平日','hari kerja').replace('土曜','Sabtu')}, biaya {'gratis' if f == 0 else str(f) + ' yen'}, {'hanya di lokasi' if o == '会場のみ' else 'bisa daring'}"
        for s, w, f, o in zip(sem, when, fee, online)) + ". Pendaftaran paling lambat 1 minggu sebelum kursus. Peserta daring dikirimi URL sehari sebelumnya.")
    (n, n_r) = rnd.choice(NAMES)
    qtext = f"{n}さんは平日は残業が多く、週末も家を離れられない。参加できる講座はどれか。"
    c = f"{sem[tgt][0]}「{sem[tgt][1]}」"
    w = [f"{s[0]}「{s[1]}」" for i, s in enumerate(sem) if i != tgt]
    o, a = shuf(rnd, c, w)
    why = {}
    for i, s in enumerate(sem):
        if i == tgt: continue
        why[f"{s[0]}「{s[1]}」"] = ("Diadakan hari kerja (malam), padahal dia sering lembur." if when[i].startswith("平日")
                                   else "Sabtu, tetapi hanya di lokasi (会場のみ), padahal dia tidak bisa keluar rumah.")
    q = mk_q(qtext, o, a, f"Kursus {sem[tgt][0]}: hari Sabtu dan bisa daring.",
             f"{sem[tgt][0]}｜{when[tgt]}｜{online[tgt]}", why,
             ["残業 = lembur", "離れる = meninggalkan", "受講料 = biaya kursus", "会場のみ = hanya di lokasi"])
    return {"jenis": "Mencari informasi (情報検索)", "jp": jp, "id": tr, "qs": [q], "info": True}

# Esai orisinal (pendapat/argumen) — N2–N1
C_ESSAYS = [
    ("「便利」は時間を生むと言われる。洗濯機や電子レンジのおかげで、家事にかかる時間は確かに短くなった。ところが、私たちは昔より暇になったと感じているだろうか。生まれた時間は、すぐに別の用事や画面を見る時間で埋められてしまう。便利さが与えてくれるのは時間そのものではなく、時間の使い道を選ぶ機会にすぎない。その機会を生かすかどうかは、結局私たち自身にかかっている。",
     "Dikatakan bahwa \"kepraktisan\" menciptakan waktu. Berkat mesin cuci dan microwave, waktu untuk pekerjaan rumah memang menjadi lebih singkat. Namun, apakah kita merasa lebih senggang dibanding dulu? Waktu yang tercipta segera terisi oleh urusan lain atau waktu menatap layar. Yang diberikan kepraktisan bukanlah waktu itu sendiri, melainkan sekadar kesempatan untuk memilih cara memakai waktu. Apakah kesempatan itu dimanfaatkan atau tidak, pada akhirnya tergantung pada diri kita sendiri.",
     "筆者の考えに最も近いものはどれか。",
     "便利さによって得られるのは、時間の使い方を選ぶ機会だ",
     ["便利な道具が増えたので、人々は昔より暇になった", "家事の時間を短くするために、便利な道具をもっと使うべきだ", "画面を見る時間が増えたのは、便利な道具のせいだ"],
     "便利さが与えてくれるのは時間そのものではなく、時間の使い道を選ぶ機会にすぎない。"),
    ("失敗を恐れるなとよく言われるが、恐れること自体が悪いわけではない。恐れがあるからこそ、人は準備をし、危険を避けようとする。問題は、恐れのあまり何も始めなくなることだ。必要なのは恐れを消すことではなく、恐れを抱えたまま一歩を踏み出せる程度に、失敗の大きさを小さく設計することではないだろうか。",
     "Sering dikatakan \"jangan takut gagal\", tetapi rasa takut itu sendiri tidaklah buruk. Justru karena ada rasa takut, manusia bersiap dan berusaha menghindari bahaya. Masalahnya adalah ketika karena terlalu takut seseorang tidak memulai apa pun. Yang dibutuhkan bukan menghapus rasa takut, melainkan merancang ukuran kegagalan menjadi kecil — sekecil yang memungkinkan kita melangkah sambil tetap membawa rasa takut itu, bukan?",
     "筆者は、失敗への恐れについてどう考えているか。",
     "恐れは残したままでよく、失敗を小さくする工夫が大切だ",
     ["恐れは悪いものなので、できるだけ早く消すべきだ", "恐れがあると準備ができないので、何も始めないほうがいい", "失敗を経験すれば、恐れは自然になくなる"],
     "必要なのは恐れを消すことではなく、…失敗の大きさを小さく設計することではないだろうか。"),
    ("地方の商店街が衰退した理由として、郊外の大型店の進出がよく挙げられる。しかし、それだけでは説明がつかない。同じ条件でもにぎわいを保っている商店街は存在するからだ。そうした商店街に共通するのは、店同士が情報を交換し、客の顔と好みを覚えていることである。つまり、彼らが売っているのは商品だけではなく、人と人との関係なのだ。",
     "Sebagai alasan merosotnya kawasan pertokoan di daerah, sering disebut masuknya toko besar di pinggiran kota. Namun, itu saja tidak cukup menjelaskan. Sebab, ada kawasan pertokoan yang tetap ramai meski kondisinya sama. Kesamaan kawasan seperti itu adalah para toko saling bertukar informasi serta mengingat wajah dan selera pelanggan. Artinya, yang mereka jual bukan hanya barang, melainkan hubungan antarmanusia.",
     "筆者によると、にぎわいを保っている商店街の特徴は何か。",
     "店と客の間に、人としてのつながりがある",
     ["郊外の大型店から離れた場所にある", "大型店より安い商品をそろえている", "店の数が他の商店街より多い"],
     "彼らが売っているのは商品だけではなく、人と人との関係なのだ。"),
    ("読書の効用として、知識が増えることがまず挙げられる。だが、私が考える最大の効用は、自分とは異なる人生を内側から体験できることだ。物語の主人公の迷いや後悔に付き合ううちに、現実では出会わない価値観が自分の中に根を下ろす。それは知識というより、他者を想像する力と呼ぶべきものだろう。",
     "Sebagai manfaat membaca, yang pertama disebut biasanya bertambahnya pengetahuan. Tetapi manfaat terbesar menurut saya adalah bisa mengalami kehidupan yang berbeda dari diri sendiri dari dalam. Sambil menemani keraguan dan penyesalan tokoh utama dalam cerita, nilai-nilai yang tidak akan kita temui dalam kenyataan berakar di dalam diri kita. Itu lebih pantas disebut kemampuan membayangkan orang lain daripada sekadar pengetahuan.",
     "筆者が考える読書の最大の効用は何か。",
     "他の人の生き方を想像する力が身につくこと",
     ["多くの知識を短い時間で得られること", "主人公と同じ失敗をしなくなること", "現実で会えない人と知り合えること"],
     "それは知識というより、他者を想像する力と呼ぶべきものだろう。"),
    ("会議が長引く原因の多くは、議論の中身ではなく目的の共有不足にある。決めるための会議なのか、意見を集めるための会議なのかが参加者の間でずれていると、話はいつまでも平行線をたどる。冒頭の一分で「今日は何を決めるか」を確認するだけで、会議の質は大きく変わる。",
     "Kebanyakan penyebab rapat berlarut-larut bukan pada isi diskusi, melainkan kurangnya kesamaan pemahaman tentang tujuan. Jika di antara peserta berbeda pandangan apakah rapat untuk memutuskan atau untuk mengumpulkan pendapat, pembicaraan akan terus berjalan sejajar tanpa titik temu. Hanya dengan memastikan \"hari ini kita memutuskan apa\" di satu menit pertama, kualitas rapat akan berubah besar.",
     "筆者によると、会議を短くするためにまず必要なことは何か。",
     "最初に会議の目的を参加者で確認すること",
     ["議論の中身をもっと深くすること", "参加者の人数を減らすこと", "意見を集める会議をやめること"],
     "冒頭の一分で「今日は何を決めるか」を確認するだけで、会議の質は大きく変わる。"),
    ("技術の進歩によって、翻訳はかなりの部分を機械に任せられるようになった。それでも外国語を学ぶ意味がなくなったとは思わない。言葉を学ぶ過程で、人は自分の言語では当たり前だった区別が、別の言語では存在しないことに気づく。その驚きこそが、自分の考え方の癖を知る手がかりになるからである。",
     "Berkat kemajuan teknologi, sebagian besar penerjemahan kini bisa diserahkan kepada mesin. Meski begitu, saya tidak menganggap makna belajar bahasa asing telah hilang. Dalam proses belajar bahasa, seseorang menyadari bahwa pembedaan yang dianggap biasa dalam bahasanya sendiri ternyata tidak ada di bahasa lain. Sebab, keterkejutan itulah yang menjadi petunjuk untuk mengenali kebiasaan cara berpikir diri sendiri.",
     "筆者が外国語を学ぶ意味があると考えるのはなぜか。",
     "学ぶ過程で、自分の考え方の特徴に気づけるから",
     ["機械の翻訳にはまだ多くの誤りがあるから", "外国語ができると仕事で有利になるから", "別の言語には区別が全く存在しないから"],
     "その驚きこそが、自分の考え方の癖を知る手がかりになるからである。"),
    ("最近の若者は物を欲しがらないと言われる。だが、これを欲がなくなったと見るのは早計だろう。彼らが求めているのは所有ではなく体験であり、物は借りたり共有したりすれば足りると考えているにすぎない。消費の形が変わったのであって、消費そのものが減ったわけではないのである。",
     "Dikatakan bahwa anak muda zaman sekarang tidak menginginkan barang. Namun, menganggap hal ini sebagai hilangnya keinginan adalah kesimpulan yang terburu-buru. Yang mereka cari bukan kepemilikan melainkan pengalaman; mereka sekadar berpikir bahwa barang cukup dipinjam atau dipakai bersama. Yang berubah adalah bentuk konsumsi, bukan berarti konsumsi itu sendiri berkurang.",
     "筆者の主張として正しいものはどれか。",
     "若者の消費は減ったのではなく、形が変わった",
     ["若者は物にも体験にも興味を失っている", "物を共有することは、消費を減らすためによくない", "若者は物を所有するために節約している"],
     "消費の形が変わったのであって、消費そのものが減ったわけではないのである。"),
    ("「わかりやすい説明」が求められる時代である。確かに、難しいことを簡単に言う技術は大切だ。しかし、わかりやすさを優先するあまり、本来は複雑な問題まで単純な話に置き換えてしまう危険もある。説明する側には、どこまで簡単にしてよいかを見極める責任がある。",
     "Ini adalah zaman yang menuntut \"penjelasan yang mudah dipahami\". Memang, keterampilan menyatakan hal sulit secara sederhana itu penting. Namun, karena terlalu mengutamakan kemudahan, ada juga bahaya mengganti masalah yang sejatinya rumit menjadi cerita yang sederhana. Pihak yang menjelaskan memiliki tanggung jawab untuk menimbang sampai sejauh mana boleh disederhanakan.",
     "筆者が最も言いたいことは何か。",
     "説明する人は、簡単にしすぎないよう判断する責任がある",
     ["難しい問題は説明しないほうがいい", "わかりやすい説明は、いつも正しい", "複雑な問題は、できるだけ単純に説明すべきだ"],
     "説明する側には、どこまで簡単にしてよいかを見極める責任がある。"),
    ("休日に何もしないことに罪悪感を覚える人は少なくない。予定を詰め込み、休みの日まで成果を求めてしまうのだ。しかし、何もしない時間は無駄ではない。頭が情報を整理し、新しい発想が生まれるのは、むしろそうした空白の中である。休むこともまた、仕事の一部なのである。",
     "Tidak sedikit orang yang merasa bersalah jika tidak melakukan apa-apa di hari libur. Mereka menjejalkan jadwal dan menuntut hasil bahkan di hari libur. Namun, waktu tanpa kegiatan bukanlah pemborosan. Otak merapikan informasi dan ide baru lahir justru di dalam kekosongan seperti itu. Beristirahat juga merupakan bagian dari pekerjaan.",
     "筆者によると、何もしない時間にはどんな価値があるか。",
     "頭が整理され、新しい考えが生まれやすくなる",
     ["次の仕事の予定を立てる時間になる", "罪悪感をなくす練習になる", "休日の成果を増やすことができる"],
     "頭が情報を整理し、新しい発想が生まれるのは、むしろそうした空白の中である。"),
    ("ある調査によれば、人は自分で選んだものほど高く評価する傾向がある。同じペンでも、渡されたものより自分で選んだもののほうが書きやすいと感じるのだ。この心理は職場にも当てはまる。仕事のやり方を部下に少しでも選ばせることが、意欲を高める近道になるのかもしれない。",
     "Menurut suatu survei, manusia cenderung menilai lebih tinggi sesuatu yang ia pilih sendiri. Bahkan untuk pena yang sama, pena yang dipilih sendiri terasa lebih enak dipakai menulis daripada yang diberikan. Psikologi ini juga berlaku di tempat kerja. Membiarkan bawahan memilih cara kerja, meski sedikit, mungkin menjadi jalan pintas untuk meningkatkan motivasi.",
     "筆者は職場で何をするとよいと考えているか。",
     "仕事の進め方を部下に選ばせる",
     ["部下に書きやすいペンを配る", "上司が仕事のやり方をすべて決める", "部下の仕事を高く評価する調査をする"],
     "仕事のやり方を部下に少しでも選ばせることが、意欲を高める近道になるのかもしれない。"),
]

def essay_passage(rnd, essays, idx, jenis):
    jp, tr, q, c, wrong, bukti = essays[idx % len(essays)]
    o, a = shuf(rnd, c, wrong)
    qq = mk_q(q, o, a, "Sesuai dengan inti pendapat penulis.", bukti,
              {w: "Tidak sesuai dengan pendapat penulis / tidak disebut dalam teks." for w in wrong})
    return {"jenis": jenis, "jp": jp, "id": tr, "qs": [qq]}

# =================================================================== 文章の文法 (grammar cloze)
CONN_GLOSS = {
    "でも": "tapi", "だから": "karena itu", "そして": "lalu / dan", "それから": "setelah itu",
    "しかし": "namun", "つまり": "dengan kata lain", "ところが": "tak disangka / padahal",
    "一方": "di sisi lain", "また": "selain itu", "ただし": "namun (dengan syarat)",
    "たとえば": "misalnya", "とくに": "terutama", "そのため": "karena itu", "それで": "maka",
    "とはいえ": "meski begitu", "したがって": "oleh karena itu", "それでも": "meski demikian",
    "しかも": "terlebih lagi", "ゆえに": "karena itu", "ちなみに": "omong-omong",
    "むしろ": "justru", "それにもかかわらず": "meski demikian",
}
# (konteks dengan （　）, penghubung benar, [3 pengecoh], terjemahan, catatan fungsi)
BUNSHOU = {
    "A": [
        ("今日は雨でした。（　）、しあいは 中止に なりました。", "だから", ["でも", "そして", "それから"], "Hari ini hujan. Karena itu, pertandingan dibatalkan.", "menyatakan sebab→akibat"),
        ("日本語を べんきょうして います。（　）、かんじは まだ むずかしいです。", "でも", ["だから", "そして", "それで"], "Saya sedang belajar bahasa Jepang. Tapi, kanji masih sulit.", "menyatakan hal yang berlawanan"),
        ("朝ごはんを 食べました。（　）、歯を みがきました。", "それから", ["でも", "だから", "しかし"], "Saya sarapan. Setelah itu, saya menggosok gigi.", "urutan kejadian"),
        ("この みせの ケーキは おいしいです。（　）、少し 高いです。", "でも", ["だから", "それで", "そして"], "Kue di toko ini enak. Tapi, sedikit mahal.", "kontras baik↔kurang"),
        ("あした テストが あります。（　）、今夜は はやく ねます。", "だから", ["でも", "しかし", "それから"], "Besok ada ujian. Karena itu, malam ini saya tidur lebih awal.", "sebab→akibat"),
        ("田中さんは やさしいです。（　）、しんせつです。", "そして", ["でも", "だから", "ところが"], "Tanaka-san baik. Dan juga ramah.", "menambah sifat yang searah"),
        ("薬を のみました。（　）、よく なりませんでした。", "でも", ["だから", "そして", "それから"], "Saya minum obat. Tapi, tidak membaik.", "hasil di luar harapan"),
        ("駅まで あるきました。（　）、バスに のりました。", "それから", ["でも", "だから", "しかし"], "Saya berjalan sampai stasiun. Setelah itu, naik bus.", "urutan kejadian"),
        ("きのうは ひまでした。（　）、今日は いそがしいです。", "でも", ["だから", "そして", "それから"], "Kemarin senggang. Tapi, hari ini sibuk.", "kontras waktu"),
        ("雨が ふって います。（　）、かさを もって いきましょう。", "だから", ["でも", "しかし", "ところが"], "Sedang hujan. Karena itu, mari bawa payung.", "sebab→ajakan"),
        ("日本の 食べ物が すきです。（　）、すしが いちばん すきです。", "とくに", ["でも", "だから", "しかし"], "Saya suka makanan Jepang. Terutama, sushi yang paling saya suka.", "menonjolkan satu contoh"),
        ("お金が ありません。（　）、りょこうに 行けません。", "だから", ["でも", "そして", "それから"], "Saya tidak punya uang. Karena itu, tidak bisa pergi liburan.", "sebab→akibat"),
    ],
    "B": [
        ("この町は交通が便利だ。（　）、家賃も高い。", "しかし", ["だから", "つまり", "また"], "Kota ini transportasinya praktis. Namun, sewanya juga mahal.", "kontras keunggulan↔kelemahan"),
        ("彼は毎日練習した。（　）、試合に勝つことができた。", "そのため", ["しかし", "ただし", "一方"], "Ia berlatih tiap hari. Karena itu, bisa memenangkan pertandingan.", "sebab→akibat"),
        ("日本語には三種類の文字がある。（　）、ひらがな・カタカナ・漢字だ。", "つまり", ["しかし", "ところが", "一方"], "Bahasa Jepang punya tiga jenis huruf. Dengan kata lain, hiragana, katakana, dan kanji.", "menjelaskan ulang / merinci"),
        ("兄はスポーツが得意だ。（　）、弟は音楽が得意だ。", "一方", ["だから", "つまり", "そのため"], "Kakak jago olahraga. Di sisi lain, adik jago musik.", "membandingkan dua hal"),
        ("参加は自由です。（　）、事前の申し込みが必要です。", "ただし", ["つまり", "だから", "また"], "Partisipasi bebas. Namun dengan syarat, perlu mendaftar lebih dulu.", "menambah syarat/pengecualian"),
        ("運動は健康にいい。（　）、ウォーキングや水泳がいい。", "たとえば", ["しかし", "つまり", "ただし"], "Olahraga baik untuk kesehatan. Misalnya, jalan kaki atau berenang.", "memberi contoh"),
        ("雨が続いている。（　）、気温も下がってきた。", "また", ["しかし", "つまり", "ただし"], "Hujan terus turun. Selain itu, suhu juga mulai turun.", "menambah informasi searah"),
        ("彼は忙しそうだった。（　）、手伝いを頼むのはやめた。", "それで", ["しかし", "つまり", "一方"], "Ia tampak sibuk. Maka, saya urung meminta bantuan.", "sebab→keputusan"),
        ("計画は完璧だった。（　）、実際にはうまくいかなかった。", "ところが", ["だから", "つまり", "また"], "Rencananya sempurna. Tak disangka, nyatanya tidak berjalan baik.", "hasil tak terduga"),
        ("この薬はよく効く。（　）、副作用もある。", "ただし", ["だから", "つまり", "たとえば"], "Obat ini manjur. Namun dengan syarat, ada efek sampingnya juga.", "menambah catatan/peringatan"),
    ],
    "C": [
        ("新制度は効率的だ。（　）、現場からは反対の声も上がっている。", "とはいえ", ["したがって", "つまり", "ゆえに"], "Sistem baru itu efisien. Meski begitu, dari lapangan muncul juga suara penolakan.", "mengakui lalu menyanggah"),
        ("調査の結果が出た。（　）、来月から対策を実施する。", "したがって", ["とはいえ", "むしろ", "ちなみに"], "Hasil survei sudah keluar. Oleh karena itu, bulan depan langkah penanganan dijalankan.", "kesimpulan logis"),
        ("彼は失敗を重ねた。（　）、あきらめなかった。", "それでも", ["したがって", "つまり", "ゆえに"], "Ia berkali-kali gagal. Meski demikian, tidak menyerah.", "bertahan meski kondisi buruk"),
        ("価格は据え置きだ。（　）、サービスは拡充された。", "しかも", ["しかし", "したがって", "つまり"], "Harga tetap. Terlebih lagi, layanannya diperluas.", "menambah keunggulan searah"),
        ("データは限られている。（　）、傾向は明確に読み取れる。", "それでも", ["したがって", "ゆえに", "つまり"], "Datanya terbatas. Meski demikian, kecenderungannya terbaca jelas.", "hasil di luar keterbatasan"),
        ("計画は承認された。（　）、予算には制約がある。", "ただし", ["したがって", "つまり", "ゆえに"], "Rencana disetujui. Namun dengan syarat, anggarannya terbatas.", "menambah syarat"),
        ("両者の主張は対立している。（　）、妥協点を探る必要がある。", "したがって", ["とはいえ", "つまり", "ちなみに"], "Klaim kedua pihak bertentangan. Oleh karena itu, perlu mencari titik kompromi.", "sebab→kesimpulan"),
        ("会議は長引いた。（　）、結論は出なかった。", "それにもかかわらず", ["したがって", "つまり", "ゆえに"], "Rapat berlarut-larut. Meski demikian, kesimpulan tak kunjung keluar.", "hasil berlawanan dengan harapan"),
    ],
}
def _band(lv):
    return "A" if lv in ("n5", "n4") else "B" if lv == "n3" else "C"

def bunshou_items(rnd, lv, n):
    """n soal 文章の文法: cloze konteks pendek, pilih penghubung yang tepat."""
    pool = BUNSHOU[_band(lv)][:]
    rnd.shuffle(pool)
    out = []
    for ctx, correct, wrong, trans, note in pool[:n]:
        opts, ans = shuf(rnd, correct, wrong)
        opsi = []
        for i, o in enumerate(opts):
            g = CONN_GLOSS.get(o, "")
            if i == ans:
                opsi.append(f"{ABCD[i]}. {o} — BENAR. 「{o}」= {g}; {note}.")
            else:
                opsi.append(f"{ABCD[i]}. {o} — Salah. 「{o}」= {g}; tidak cocok untuk {note}.")
        out.append({
            "cat": "bunpou", "tipe": "bunshou", "tipe_jp": "文章の文法",
            "q": ctx, "opts": opts, "ans": ans, "ref": {"tipe": "bunpou", "pola": correct},
            "ex": {
                "jawaban": f"{ABCD[ans]}. {correct}",
                "terjemahan": trans,
                "alasan": f"Penghubung 「{correct}」（{CONN_GLOSS.get(correct,'')}） paling tepat di sini — {note}.",
                "opsi": opsi,
                "poin": "Soal 文章の文法 menguji alur antar-kalimat. Perhatikan hubungan makna: sebab-akibat, kontras, tambahan, atau urutan.",
            },
        })
    return out

# =================================================================== 接頭辞・接尾辞 (N2/N1)
AFFIX_GLOSS = {"非": "non- / tidak ber-", "不": "tidak", "無": "tanpa / nihil", "未": "belum",
               "的": "bersifat ~", "化": "proses menjadi ~", "性": "sifat ~", "風": "bergaya ~"}
# (kalimat dengan （　）, imbuhan benar, [3 pengecoh], kata hasil, arti kata hasil, terjemahan kalimat)
SETTOU = [
    ("彼の行動は（　）常識だと言われた。", "非", ["不", "無", "未"], "非常識", "tidak tahu adat / di luar akal sehat", "Perilakunya disebut tidak tahu adat."),
    ("工事はまだ（　）完成のままだ。", "未", ["不", "非", "無"], "未完成", "belum selesai", "Pembangunannya masih belum selesai."),
    ("彼はその結果に（　）満を感じている。", "不", ["未", "非", "無"], "不満", "ketidakpuasan", "Ia merasa tidak puas dengan hasil itu."),
    ("それは（　）意味な議論だ。", "無", ["不", "非", "未"], "無意味", "tidak bermakna / sia-sia", "Itu diskusi yang sia-sia."),
    ("問題を（　）解決のままにするな。", "未", ["不", "無", "非"], "未解決", "belum terpecahkan", "Jangan biarkan masalahnya belum terpecahkan."),
    ("それは（　）可能だと思われていた。", "不", ["無", "非", "未"], "不可能", "mustahil", "Itu dianggap mustahil."),
    ("彼は（　）責任な発言をした。", "無", ["不", "非", "未"], "無責任", "tidak bertanggung jawab", "Ia membuat pernyataan yang tidak bertanggung jawab."),
    ("試験の結果は（　）合格だった。", "不", ["未", "無", "非"], "不合格", "tidak lulus", "Hasil ujiannya tidak lulus."),
    ("この仕事は（　）経験でも応募できる。", "未", ["不", "無", "非"], "未経験", "belum berpengalaman", "Pekerjaan ini bisa dilamar meski belum berpengalaman."),
    ("環境問題は国際（　）な課題だ。", "的", ["性", "化", "風"], "国際的", "berskala internasional", "Masalah lingkungan adalah persoalan berskala internasional."),
    ("書類の電子（　）が進んでいる。", "化", ["的", "性", "風"], "電子化", "digitalisasi", "Digitalisasi dokumen sedang berlangsung."),
    ("この製品は安全（　）が高い。", "性", ["的", "化", "風"], "安全性", "tingkat keamanan", "Produk ini punya tingkat keamanan yang tinggi."),
]
def settou_items(rnd, lv, n):
    pool = SETTOU[:]
    rnd.shuffle(pool)
    out = []
    for sent, correct, wrong, word, wmean, trans in pool[:n]:
        opts, ans = shuf(rnd, correct, wrong)
        opsi = []
        for i, o in enumerate(opts):
            g = AFFIX_GLOSS.get(o, "")
            if i == ans:
                opsi.append(f"{ABCD[i]}. {o} — BENAR. 「{o}」= {g} → 「{word}」（{wmean}）.")
            else:
                opsi.append(f"{ABCD[i]}. {o} — Salah. 「{o}」= {g}; tidak membentuk kata yang tepat di sini.")
        out.append({
            "cat": "kotoba", "tipe": "settou", "tipe_jp": "接頭辞・接尾辞",
            "q": sent, "opts": opts, "ans": ans, "ref": {"tipe": "kotoba", "kata": word},
            "ex": {
                "jawaban": f"{ABCD[ans]}. {correct}",
                "terjemahan": trans,
                "alasan": f"「{correct}」（{AFFIX_GLOSS.get(correct,'')}） + kata dasar → 「{word}」（{wmean}）.",
                "opsi": opsi,
                "poin": "Soal 接頭辞・接尾辞 menguji imbuhan: 非/不/無/未 (awalan negatif, maknanya beda tipis) dan 的/化/性/風 (akhiran pembentuk kata).",
            },
        })
    return out

def dokkai_set(rnd, lv, exam_no):
    """Kumpulan bacaan untuk satu paket Full Exam."""
    if lv in ("n5", "n4"):
        fs = [a_notice, a_memo, a_table, a_diary]
        rnd.shuffle(fs)
        n = 3 if lv == "n5" else 4
        return [f(rnd, lv) for f in fs[:n]]
    if lv == "n3":
        out = [essay_passage(rnd, B_ESSAYS, exam_no, "Teks pendek / pendapat (短文)"),
               essay_passage(rnd, B_ESSAYS, exam_no + 5, "Teks menengah (中文)")]
        fs = [b_notice, b_mail, b_jobs]; rnd.shuffle(fs)
        return out + [f(rnd, lv) for f in fs[:2]]
    off = 0 if lv == "n2" else 5
    out = [essay_passage(rnd, C_ESSAYS, exam_no + off, "Teks pendapat (主張理解)"),
           essay_passage(rnd, C_ESSAYS, exam_no + off + 3, "Teks menengah (中文)")]
    fs = [c_notice, c_mail, c_seminar]; rnd.shuffle(fs)
    return out + [f(rnd, lv) for f in fs[:2]]

# =================================================================== CHOUKAI (template, TTS)
SOKUJI = {
    "A": [
        ("すみません、いま 何時ですか。", ["3時半ですよ。", "3時間ぐらいです。", "はい、そうです。"], 0, "Ditanya jam berapa sekarang → jawab jamnya.", "Permisi, sekarang jam berapa?"),
        ("この ペン、ちょっと かりても いいですか。", ["ええ、どうぞ。", "いいえ、かりません。", "ペンは 100円です。"], 0, "Minta izin meminjam → \"Silakan\".", "Boleh pinjam pulpen ini sebentar?"),
        ("おさきに しつれいします。", ["おつかれさまでした。", "いただきます。", "おかえりなさい。"], 0, "Salam pulang duluan dibalas おつかれさまでした.", "Saya pulang duluan."),
        ("あした いっしょに えいがを 見ませんか。", ["いいですね。見ましょう。", "きのう 見ました。", "えいがかんです。"], 0, "Ajakan 〜ませんか dijawab menerima/menolak.", "Besok mau nonton film bersama?"),
        ("どうぞ、あがって ください。", ["おじゃまします。", "ただいま。", "いってきます。"], 0, "Dipersilakan masuk rumah → おじゃまします.", "Silakan masuk."),
        ("この りんご、いくらですか。", ["ひとつ 150円です。", "3つ あります。", "あかい りんごです。"], 0, "Ditanya harga → sebut harga.", "Apel ini berapa?"),
        ("たんじょうび、おめでとう。", ["ありがとう。", "どういたしまして。", "おめでとう ございます。"], 0, "Diberi ucapan selamat → terima kasih.", "Selamat ulang tahun."),
        ("しゅくだい、もう おわりましたか。", ["いいえ、まだです。", "はい、まだです。", "いいえ、もう します。"], 0, "もう〜ましたか → はい、もう〜ました / いいえ、まだです.", "PR-nya sudah selesai?"),
        ("まどを あけましょうか。", ["ええ、おねがいします。", "はい、あけました。", "まどは ありません。"], 0, "Tawaran 〜ましょうか → \"Ya, tolong\".", "Mau saya bukakan jendela?"),
        ("きのうは どうも ありがとう ございました。", ["いいえ、どういたしまして。", "はい、ありがとう。", "いいえ、すみません。"], 0, "Ucapan terima kasih → どういたしまして.", "Terima kasih banyak untuk kemarin."),
        ("ごはん、もう たべましたか。", ["はい、さっき たべました。", "はい、これから たべました。", "いいえ、たべました。"], 0, "Konsistensi はい + bentuk lampau.", "Sudah makan?"),
        ("でんしゃが おくれて いますね。", ["そうですね。こまりましたね。", "はい、でんしゃです。", "いいえ、あるきます。"], 0, "Berbagi keluhan → menyetujui.", "Keretanya terlambat, ya."),
    ],
    "B": [
        ("この資料、明日までにまとめてもらえる？", ["はい、やっておきます。", "はい、まとめてもらいます。", "明日はまとめました。"], 0, "Diminta tolong (〜てもらえる？) → menyanggupi.", "Bisa tolong rangkum dokumen ini sampai besok?"),
        ("あれ、山田さん、今日はずいぶん早いね。", ["ええ、朝のうちに片付けたいことがあって。", "いいえ、遅く来ます。", "早いのは山田さんですよ。"], 0, "Komentar datang pagi → beri alasan.", "Lho, Yamada-san, hari ini pagi sekali ya."),
        ("せっかく作ったのに、だれも食べてくれなかったよ。", ["それは残念だったね。", "おいしそうだね、いただきます。", "作らなくてよかったね。"], 0, "Keluhan kecewa → simpati.", "Padahal sudah susah payah masak, tidak ada yang makan."),
        ("会議の時間、3時から4時に変更になったんだって。", ["そうなんだ。教えてくれてありがとう。", "3時に始めましょう。", "変更しなくてもいいよ。"], 0, "Menerima informasi → berterima kasih.", "Katanya jam rapat diubah dari jam 3 ke jam 4."),
        ("この窓、開けっぱなしにしないでね。", ["あ、ごめん。すぐ閉めるよ。", "うん、開けておくね。", "窓はきれいだね。"], 0, "〜っぱなし = dibiarkan terus terbuka → minta maaf & tutup.", "Jangan biarkan jendela ini terbuka terus, ya."),
        ("よかったら、駅まで車で送りましょうか。", ["助かります。お願いします。", "はい、送ってあげます。", "駅は遠くないですか。"], 0, "Tawaran mengantar → terima dengan sopan.", "Kalau mau, saya antar ke stasiun pakai mobil?"),
        ("ごめん、待った？", ["ううん、今来たところ。", "うん、これから待つよ。", "待たなかったら行くね。"], 0, "Pertanyaan menunggu → \"baru saja datang\".", "Maaf, lama menunggu?"),
        ("田中さん、熱があるのに会社に来たらしいよ。", ["無理しなければいいけど。", "熱があってよかったね。", "会社は休みらしいね。"], 0, "Kabar orang sakit masuk kerja → khawatir.", "Katanya Tanaka-san tetap masuk kantor padahal demam."),
        ("あ、雨降りそう。傘持ってる？", ["うん、折りたたみのがあるよ。", "雨が降ったね。", "傘は高いよ。"], 0, "Ditanya bawa payung → jawab ada/tidak.", "Sepertinya mau hujan. Bawa payung?"),
        ("このレポート、もう少し短くできないかな。", ["わかりました。書き直してみます。", "はい、長くしておきます。", "短いレポートですね。"], 0, "Permintaan revisi → menyanggupi.", "Laporan ini bisa dibuat sedikit lebih pendek?"),
    ],
    "C": [
        ("例の件、先方には私から伝えておこうか。", ["そうしていただけると助かります。", "先方から伝えてもらいました。", "例の件はまだ聞いていません。"], 0, "Atasan menawarkan menyampaikan → terima dengan sopan.", "Urusan itu, biar saya yang sampaikan ke pihak sana?"),
        ("今回の企画、予算の面でちょっと厳しいと言わざるを得ないね。", ["では、費用を見直して出し直します。", "予算が余ってよかったですね。", "厳しくない企画にしたいです。"], 0, "〜ざるを得ない = terpaksa harus berkata → revisi biaya.", "Proyek kali ini, terpaksa saya bilang agak berat dari sisi anggaran."),
        ("課長、来週の出張の件ですが、日程を一日ずらしていただくわけにはいきませんか。", ["うーん、先方の都合もあるから、確認してみるよ。", "はい、一日ずつ出張します。", "来週は出張しないわけです。"], 0, "Permintaan sangat sopan menggeser jadwal → tanggapan mempertimbangkan.", "Pak Kepala, soal dinas minggu depan, apakah jadwalnya bisa digeser sehari?"),
        ("さすが佐藤さん、あの難しい交渉をまとめるなんて。", ["いえいえ、皆さんのおかげです。", "交渉はまとまりませんでした。", "難しくないとは思いませんか。"], 0, "Dipuji (さすが) → merendah.", "Hebat memang Sato-san, bisa menyelesaikan negosiasi sulit itu."),
        ("この報告書、数字の根拠が示されていないんだけど。", ["申し訳ありません。資料を添付し直します。", "数字はたくさんありますね。", "根拠がなくてよかったです。"], 0, "Kritik dasar angka tidak ada → minta maaf & lampirkan.", "Laporan ini tidak menunjukkan dasar angkanya."),
        ("明日の打ち合わせ、オンラインに切り替えてもかまわない？", ["はい、では後ほどリンクをお送りします。", "いいえ、切り替えたことはありません。", "オンラインは切り替えられません。"], 0, "Persetujuan ganti daring → kirim tautan.", "Rapat besok, tidak apa-apa diganti daring?"),
        ("せっかくのお誘いですが、あいにくその日は先約がありまして。", ["そうですか、では、またの機会に。", "では、その日にお会いしましょう。", "先約がなくてよかったです。"], 0, "Penolakan halus → \"lain kali saja\".", "Terima kasih atas undangannya, tapi sayang hari itu sudah ada janji."),
        ("この件は、部長の判断を仰いだほうがいいんじゃない？", ["そうですね。すぐに相談してみます。", "部長が判断を仰ぎました。", "仰ぐのは難しいですよ。"], 0, "判断を仰ぐ = meminta keputusan → setuju berkonsultasi.", "Urusan ini sebaiknya minta keputusan kepala divisi, kan?"),
        ("お忙しいところ恐縮ですが、こちらにご署名いただけますか。", ["はい、ここでよろしいですか。", "いいえ、忙しくありません。", "署名していただきます。"], 0, "Permintaan tanda tangan sopan → menyanggupi.", "Maaf mengganggu di tengah kesibukan, bisa tanda tangan di sini?"),
        ("もう少し早く言ってくれれば、手伝えたのに。", ["すみません、言い出しにくくて。", "手伝ってくれてありがとう。", "早く言いました。"], 0, "〜ば〜のに = penyesalan → minta maaf & beri alasan.", "Kalau bilang lebih cepat, saya bisa bantu."),
    ],
}
for k in SOKUJI:
    SOKUJI[k] = [(a, b, c, d, e) for a, b, c, d, e in SOKUJI[k]]

def ck_kadai_a(rnd, lv):
    items = [("たまご", "telur"), ("ぎゅうにゅう", "susu"), ("パン", "roti"), ("りんご", "apel"), ("やさい", "sayur"), ("おちゃ", "teh")]
    a, b, c, d = rnd.sample(items, 4)
    dialog = [("F", f"ねえ、スーパーで {a[0]}と {b[0]}を かって きて くれる？"),
              ("M", f"いいよ。{c[0]}は？"),
              ("F", f"{c[0]}は まだ れいぞうこに あるから、いらない。あ、{d[0]}も おねがい。"),
              ("M", "わかった。")]
    q = "男の人は 何を かいますか。"
    correct = f"{a[0]}と {b[0]}と {d[0]}"
    wrong = [f"{a[0]}と {b[0]}と {c[0]}", f"{a[0]}と {c[0]}と {d[0]}", f"{b[0]}と {c[0]}"]
    o, ans = shuf(rnd, correct, wrong)
    tr = [f"P: Hei, bisa belikan {a[1]} dan {b[1]} di supermarket?", f"L: Boleh. {c[1].capitalize()}?",
          f"P: {c[1].capitalize()} masih ada di kulkas, jadi tidak perlu. Oh, {d[1]} juga ya.", "L: Oke."]
    return dict(tipe="kadai", jp="課題理解", set="うちで 女の人と 男の人が 話して います。", q=q, dialog=dialog, opts=o, ans=ans,
                tr=tr, alasan=f"Yang dibeli: {a[1]}, {b[1]}, ditambah {d[1]} di akhir. {c[1].capitalize()} tidak perlu.",
                bukti=f"{c[0]}は まだ れいぞうこに あるから、いらない。あ、{d[0]}も おねがい。")

def ck_point_a(rnd, lv):
    t1, t2 = rnd.sample([2, 3, 4, 5, 6], 2)
    place, place_id = rnd.choice([("えきの まえ", "depan stasiun"), ("としょかん", "perpustakaan"), ("きっさてん", "kafe")])
    dialog = [("M", f"あした、{place}で あいませんか。{t1}時は どうですか。"),
              ("F", f"すみません、{t1}時は ちょっと…。{t2}時なら だいじょうぶです。"),
              ("M", f"じゃあ、{t2}時に しましょう。")]
    o, ans = shuf(rnd, f"{t2}時", [f"{t1}時", f"{t1}時半", f"{t2}時半"])
    tr = [f"L: Besok mau bertemu di {place_id}? Bagaimana kalau jam {t1}?", f"P: Maaf, jam {t1} agak… Kalau jam {t2} bisa.", f"L: Kalau begitu, jam {t2} saja."]
    return dict(tipe="point", jp="ポイント理解", set="男の人と 女の人が 話して います。", q="ふたりは 何時に あいますか。", dialog=dialog,
                opts=o, ans=ans, tr=tr, alasan=f"Jam {t1} ditolak (ちょっと…), disepakati jam {t2}.", bukti=f"じゃあ、{t2}時に しましょう。")

def ck_kadai_b(rnd, lv):
    tasks = [("会議室を予約する", "memesan ruang rapat"), ("資料をコピーする", "memfotokopi dokumen"),
             ("お客さんにメールを送る", "mengirim email ke klien"), ("お弁当を注文する", "memesan bekal")]
    t = rnd.sample(tasks, 3)
    dialog = [("F", f"明日の会議の準備、お願いできる？まず{t[0][0].replace('する', 'して')}おいてほしいんだけど。"),
              ("M", "あ、それはさっき田中さんがやってくれたみたいです。"),
              ("F", f"そう、よかった。じゃあ、{t[1][0].replace('する', 'して').replace('送る', '送って')}くれる？{t[2][0]}のは、人数が決まってからでいいから。"),
              ("M", "わかりました。すぐやります。")]
    o, ans = shuf(rnd, t[1][0], [t[0][0], t[2][0], "田中さんに電話する"])
    tr = [f"P: Bisa bantu persiapan rapat besok? Pertama aku ingin kamu {t[0][1]}.", "L: Oh, itu sepertinya tadi sudah dikerjakan Tanaka-san.",
          f"P: Oh, syukurlah. Kalau begitu, bisa {t[1][1]}? Untuk {t[2][1]}, nanti saja setelah jumlah orangnya pasti.", "L: Baik, segera saya kerjakan."]
    return dict(tipe="kadai", jp="課題理解", set="会社で女の人と男の人が話しています。", q="男の人はこのあと、まず何をしますか。", dialog=dialog,
                opts=o, ans=ans, tr=tr, alasan=f"{t[0][1].capitalize()} sudah dikerjakan Tanaka; {t[2][1]} ditunda. Yang dikerjakan sekarang: {t[1][1]}.",
                bukti=dialog[2][1])

def ck_point_b(rnd, lv):
    reasons = [("電車が止まっていたから", "keretanya berhenti"), ("寝坊したから", "kesiangan"),
               ("忘れ物を取りに帰ったから", "pulang mengambil barang yang ketinggalan"), ("道に迷ったから", "tersesat")]
    r0 = rnd.choice([x for x in reasons if x[0] != "寝坊したから"])
    r = [r0, rnd.choice([x for x in reasons if x != r0])]
    dialog = [("F", "遅かったね。また寝坊？"),
              ("M", f"違うよ。今日はちゃんと起きたんだけど、{'駅に着いたら' if r[0][0] != '道に迷ったから' else '初めての場所で'}…"),
              ("F", "え、どうしたの？"),
              ("M", f"{r[0][0].replace('から', '')}んだ。{r[1][0].replace('から', '')}わけじゃないよ。")]
    o, ans = shuf(rnd, r[0][0], [r[1][0]] + [x[0] for x in reasons if x not in r][:2])
    tr = ["P: Telat, ya. Kesiangan lagi?", "L: Bukan. Hari ini aku bangun tepat waktu, tapi…", "P: Eh, kenapa?",
          f"L: {r[0][1].capitalize()}. Bukan karena {r[1][1]}."]
    return dict(tipe="point", jp="ポイント理解", set="男の人と女の人が話しています。", q="男の人はどうして遅れましたか。", dialog=dialog,
                opts=o, ans=ans, tr=tr, alasan=f"Alasannya: {r[0][1]}. Kesiangan dibantah (違うよ).", bukti=dialog[3][1])

def ck_kadai_c(rnd, lv):
    steps = [("見積書を作り直す", "見積書を作り直して", "membuat ulang surat penawaran"),
             ("取引先に日程を確認する", "取引先に日程を確認して", "mengonfirmasi jadwal ke mitra"),
             ("部長に報告する", "部長に報告して", "melapor ke kepala divisi"),
             ("会議室を押さえる", "会議室を押さえて", "mengamankan ruang rapat")]
    rest = [x for x in steps if x[0] != "取引先に日程を確認する"]
    rnd.shuffle(rest)
    s = [rest[0], steps[1], rest[1]]
    dialog = [("M", f"例のプロジェクトだけど、来週のプレゼンまでに{s[0][1]}もらえるかな。"),
              ("F", f"はい。ただ、その前に{s[1][0]}必要があると思うんですが。日程次第で内容が変わりますので。"),
              ("M", f"なるほど、確かにそうだね。じゃあ、そっちを先にお願い。{s[2][0]}のは、全部そろってからでいいよ。"),
              ("F", "承知しました。")]
    o, ans = shuf(rnd, s[1][0], [s[0][0], s[2][0], "プレゼンの練習をする"])
    tr = [f"L: Soal proyek itu, bisa tolong {s[0][2]} sebelum presentasi minggu depan?",
          f"P: Baik. Hanya saja, saya rasa sebelum itu perlu {s[1][2]}. Isinya berubah tergantung jadwal.",
          f"L: Begitu, benar juga. Kalau begitu, yang itu dulu. Untuk {s[2][2]}, nanti setelah semuanya lengkap saja.", "P: Baik, saya mengerti."]
    return dict(tipe="kadai", jp="課題理解", set="会社で男の人と女の人が話しています。", q="女の人はこのあとまず何をしなければなりませんか。",
                dialog=dialog, opts=o, ans=ans, tr=tr, alasan=f"Atasan setuju (確かにそうだね) agar {s[1][2]} dikerjakan lebih dulu.", bukti=dialog[2][1])

def ck_point_c(rnd, lv):
    pros = [("価格が手ごろなこと", "harganya terjangkau"), ("操作が簡単なこと", "pengoperasiannya mudah"),
            ("デザインが洗練されていること", "desainnya elegan"), ("サポートが充実していること", "dukungan purnajualnya lengkap")]
    p = rnd.sample(pros, 2)
    dialog = [("F", "新しく導入するソフト、どれにするか決まった？"),
              ("M", f"うん。候補の中では{p[1][0].replace('こと', 'の')}もよかったんだけど、決め手になったのは{p[0][0]}だね。"),
              ("F", "へえ、意外。"),
              ("M", f"うちは使う人が多いから、{'結局そこが一番大事なんだよ' if p[0][0] != '価格が手ごろなこと' else '台数を考えると、やっぱりそこなんだよ'}。")]
    o, ans = shuf(rnd, p[0][0], [p[1][0]] + [x[0] for x in pros if x not in p][:2])
    tr = ["P: Software yang akan dipakai, sudah diputuskan yang mana?",
          f"L: Ya. Di antara kandidat, yang {p[1][1]} juga bagus, tapi yang jadi penentu adalah {p[0][1]}.", "P: Wah, tidak terduga.",
          "L: Di kantor kita penggunanya banyak, jadi pada akhirnya itu yang paling penting."]
    return dict(tipe="point", jp="ポイント理解", set="会社で女の人と男の人が話しています。", q="男の人は、何がいちばんの決め手だったと言っていますか。",
                dialog=dialog, opts=o, ans=ans, tr=tr, alasan=f"決め手 (penentu) = {p[0][1]}. {p[1][1].capitalize()} hanya disebut \"juga bagus\".", bukti=dialog[1][1])

def choukai_templates(lv):
    if lv in ("n5", "n4"): return [ck_kadai_a, ck_point_a], "A"
    if lv == "n3": return [ck_kadai_b, ck_point_b], "B"
    return [ck_kadai_c, ck_point_c], "C"
