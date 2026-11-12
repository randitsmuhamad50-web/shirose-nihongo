/* =====================================================================
 * JFT-Basic (A2) — Irodori Starter A1 / Shokyuu 1 / Shokyuu 2
 * Ujian gaya CBT Shirose (intro paket → timer → nomor soal → kunci setelah kumpul).
 *  - Per level: 3 blok bab (1–6, 7–12, 13–18) × 3 paket (kotoba + kanji + bunpou dari bab itu).
 *  - Shokyuu 2 (A2.2): tambahan Simulasi Penuh format JFT-Basic (5 paket, paket 5 = ulangan paket 1).
 * Skor 10–250 pada simulasi adalah ESTIMASI latihan (bukan skor resmi Japan Foundation).
 * Data: ./data/{kosakata,kanji,bunpou}-ir{0,1,2}.json, ./data/jft/bank.json
 * Kosakata bersumber dari buku "Irodori: Japanese for Life in Japan" (The Japan Foundation),
 * dipakai untuk pembelajaran non-komersial; penjelasan bunpou ditulis ulang oleh Shirose Nihongo.
 * Route: #jft, #jft-ujian, #jft-paket/{b0p0|sim0}, #jft-tes, #jft-hasil
 * ===================================================================== */
const S = () => window.__SHIROSE_STATE || window.state || {};
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const rb = (s) => esc(s).replace(/([一-鿿々]+)\[([^\]]+)\]/g, "<ruby>$1<rt>$2</rt></ruby>").replace(/\[([^\]]+)\]/g, "");
const nl = (s) => esc(s).replace(/\n/g, "<br>");
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} },
};
const uid = () => S().user?.uid || "guest";
const HIS_KEY = () => `shirose-jft-hasil:${uid()}`;
const BEST_KEY = () => `shirose-jft-best:${uid()}`;
const SESI_KEY = () => `shirose-jft-sesi:${uid()}`;

const LV = { ir0: { nama: "Starter · A1", jp: "入門", ke: "A1" }, ir1: { nama: "Shokyuu 1 · A2.1", jp: "初級1", ke: "A2.1" }, ir2: { nama: "Shokyuu 2 · A2.2", jp: "初級2", ke: "A2.2" } };
const BLOK = [[1, 6], [7, 12], [13, 18]];
const SEK = {
  vocab:     { nama: "Script & Vocabulary", jp: "文字・語彙", n: 12 },
  conv:      { nama: "Conversation & Expression", jp: "会話・表現", n: 14 },
  listening: { nama: "Listening Comprehension", jp: "聴解", n: 12 },
  reading:   { nama: "Reading Comprehension", jp: "読解", n: 12 },
  kotoba:    { nama: "Kotoba", jp: "語彙", n: 8 },
  choukai:   { nama: "Choukai", jp: "聴解", n: 5 },
  kanji:     { nama: "Kanji", jp: "漢字", n: 6 },
  bunpou:    { nama: "Bunpou", jp: "文法", n: 6 },
};
const URUT = ["vocab", "conv", "listening", "reading"];

/* ---------- acak berbenih (paket tetap sama tiap dibuka) ---------- */
let rng = Math.random;
function setSeed(str) { let h = 1779033703 ^ String(str).length; for (const c of String(str)) { h = Math.imul(h ^ c.charCodeAt(0), 3432918353); h = (h << 13) | (h >>> 19); } let a = h >>> 0; rng = () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const unseed = () => { rng = Math.random; };
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const hasKanji = (s) => /[一-鿿]/.test(s);
const pendek = (a) => { let t = String(a).replace(/^\d+\.\s*/, "").split(/[;；(（]/)[0].trim(); if (t.length > 40) t = t.slice(0, 40) + "…"; return t; };
function withOpts(q, opts, ans, extra) { const idx = shuffle(opts.map((o, i) => i)); return { ...extra, q, o: idx.map(i => opts[i]), a: idx.indexOf(ans) }; }

/* ---------- data ---------- */
const _cache = {};
async function dat(url) { if (!_cache[url]) { try { _cache[url] = await (await fetch(url)).json(); } catch (e) { _cache[url] = []; } } return _cache[url]; }
const bank = () => dat("./data/jft/bank.json");
const gambarD = async () => { const g = await dat("./data/jft/gambar.json"); return Array.isArray(g) ? { w: {}, k: {} } : g; };
const choukaiPool = async (pk) => { const d = await dat(`./choukai/paket/n5-p${pk}.json`); return (d && d.sections && d.sections[0] && d.sections[0].items) || []; };
const CK_PK = { ir0: 901, ir1: 902, ir2: 903, sim: 904 };
const ADA_EMO = (o) => /^[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}]/u.test(o);
const SOLO_EMO = (o) => !/[\u3040-\u30ff\u4e00-\u9fffA-Za-z]/.test(o);
const emoPic = (e) => `pic:${e}`;
const KT = [["食","🍽️"],["飲","🥤"],["買","🛍️"],["行","🚶"],["電車","🚃"],["駅","🚉"],["電話","📞"],["会社","🏢"],["仕事","💼"],["学校","🏫"],["勉強","📖"],["病院","🏥"],["薬","💊"],["雨","🌧️"],["天気","⛅"],["時間","⏰"],["お金","💴"],["円","💴"],["家","🏠"],["部屋","🛏️"],["料理","🍳"],["旅行","🧳"],["写真","📷"],["音楽","🎵"],["スポーツ","⚽"],["映画","🎬"],["友","🧑‍🤝‍🧑"],["家族","👪"],["誕生日","🎂"],["バス","🚌"],["車","🚗"],["自転車","🚲"],["店","🏪"],["レストラン","🍴"],["荷物","📦"],["手紙","✉️"],["メール","📧"],["パソコン","💻"],["本","📚"],["花","🌸"],["山","⛰️"],["海","🌊"],["犬","🐶"],["猫","🐱"]];
function sceneEmoji(text, G, def) {
  const t = String(text || "").replace(/\[[^\]]*\]/g, "");
  const ks = Object.keys((G && G.w) || {}).filter(k => k.length > 1 && t.includes(k)).sort((a, b) => b.length - a.length);
  if (ks.length) return G.w[ks[0]];
  for (const [k, e] of KT) if (t.includes(k)) return e;
  return def;
}
function ckSoal(it, sec, G) {
  const dlg = it.script.filter(l => l.s !== "N").map(l => l.t).join("\n");
  const q = it.qs[0];
  return { sec, q: q.q, o: it.opts, a: q.ans, n: it.exp, audio: it.audio, say: [it.set + q.q, ...it.dialog.map(l => (l.s.startsWith("M") ? "男：" : "女：") + l.t), q.q].join("\n"), cid: it.id, emo: (G ? sceneEmoji(it.set + it.dialog.map(l => l.t).join(""), G, "🎧") : "🎧") };
}
const kosOf = (l) => dat(`./data/kosakata-${l}.json`);
const kanjiOf = (l) => dat(`./data/kanji-${l}.json`);
const bunOf = (l) => dat(`./data/bunpou-${l}.json`);
const katabersih = (w) => w.kata && w.kana && w.arti && w.kata.length <= 8 && !/[～〜（）()／]/.test(w.kata) && !w.kana.includes("／") && !/(です|ます|ました|ません|ですか|ください)$/.test(w.kata) && !/[。、]/.test(w.kata);

/* ---------- pembuat soal: paket bab ---------- */
async function paketBab(lv, blok, p) {
  const [lo, hi] = BLOK[blok];
  const semua = (await kosOf(lv)).filter(katabersih);
  const dlm = (x) => x.bab >= lo && x.bab <= hi;
  setSeed(`${lv}|${blok}|pool`);
  const kosPool = shuffle(semua.filter(dlm)).filter((_, i) => i % 3 === p);
  const kjAll = (await kanjiOf(lv));
  const kjPool = shuffle(kjAll.filter(dlm)).filter((_, i) => i % 3 === p);
  const bnAll = await bunOf(lv);
  const bnPool = bnAll.filter(dlm).filter((_, i) => i % 3 === p);
  setSeed(`${lv}|${blok}|${p}|soal`);
  const out = [];
  // kotoba (8): 4 arti, 2 baca, 2 tulis-kanji
  const kosKj = kosPool.filter(w => hasKanji(w.kata)), kosAll = semua.filter(w => hasKanji(w.kata));
  const dipakai = new Set();
  const ambil = (arr) => { const w = arr.find(x => !dipakai.has(x.kata)); if (w) dipakai.add(w.kata); return w; };
  const G = await gambarD();
  const adaG = (w) => G.w[w.kata] || G.w[w.kata.replace(/^お/, "")];
  const gAll = semua.filter(adaG);
  const gPool = kosPool.filter(adaG);
  const tipeKos = ["gA", "gB", "gA", "gB", "gA", "gB", "gA", "kanji"];
  tipeKos.forEach(t => {
    if (t === "gA" || t === "gB") {
      const w = ambil(gPool.length ? gPool : gAll.filter(x => !dipakai.has(x.kata)).slice(0, 40)) || ambil(gAll); if (!w) return;
      const e = adaG(w);
      const lain = pick(gAll.filter(x => adaG(x) !== e), 3);
      if (t === "gA") out.push(withOpts("Gambar ini disebut apa dalam bahasa Jepang?", [w.kata, ...lain.map(x => x.kata)], 0, { sec: "kotoba", emo: e, n: `${e} = ${w.kata}（${w.kana}）${pendek(w.arti)}` }));
      else out.push(withOpts(`「${w.kata}」 yang mana?`, [emoPic(e), ...lain.map(x => emoPic(adaG(x)))], 0, { sec: "kotoba", n: `${w.kata}（${w.kana}）= ${e} ${pendek(w.arti)}` }));
      return;
    }
    if (t === "arti") { const w = ambil(kosPool); if (!w) return; const salah = pick(semua.filter(x => pendek(x.arti) !== pendek(w.arti)), 3); out.push(withOpts(`「${w.kata}」 artinya…`, [pendek(w.arti), ...salah.map(x => pendek(x.arti))], 0, { sec: "kotoba", n: `${w.kata}（${w.kana}）= ${pendek(w.arti)}` })); }
    else if (t === "baca") { const w = ambil(kosKj) || ambil(kosPool); if (!w) return; const base = kosAll.length > 6 ? kosAll : semua; const salah = pick(base.filter(x => x.kana !== w.kana), 3); out.push(withOpts(`「${w.kata}」 cara bacanya…`, [w.kana, ...salah.map(x => x.kana)], 0, { sec: "kotoba", n: `${w.kata} dibaca ${w.kana} (${pendek(w.arti)})` })); }
    else { const w = ambil(kosKj) || ambil(kosPool); if (!w) return; const base = kosAll.length > 6 ? kosAll : semua; const salah = pick(base.filter(x => x.kata !== w.kata), 3); out.push(withOpts(`「${w.kana}」 ditulis dengan…`, [w.kata, ...salah.map(x => x.kata)], 0, { sec: "kotoba", n: `${w.kana} = ${w.kata} (${pendek(w.arti)})` })); }
  });
  // kanji (6): arti & baca kata gabungan
  const kjG = kjAll.filter(x => G.k[x.k]);
  kjPool.slice(0, 6).forEach((k, i) => {
    const c = (k.c || []).find(x => x.k && x.r && hasKanji(x.k));
    if (i % 3 === 0 && (G.k[k.k] || kjG.length > 4)) {
      const kk = G.k[k.k] ? k : kjG[Math.floor(rng() * kjG.length)]; const e = G.k[kk.k];
      const lain = pick(kjG.filter(x => G.k[x.k] !== e), 3);
      out.push(withOpts(`Kanji 「${kk.k}」 — gambar yang mana?`, [emoPic(e), ...lain.map(x => emoPic(G.k[x.k]))], 0, { sec: "kanji", n: `${kk.k} = ${e} ${pendek(kk.a)}` }));
    } else if (i % 2 === 1 && c) {
      const salah = pick(kjAll.flatMap(x => (x.c || []).filter(y => y.r && y.r !== c.r).map(y => y.r)), 3);
      out.push(withOpts(`「${c.k}」 cara bacanya…`, [c.r.replace(/\s/g, ""), ...salah], 0, { sec: "kanji", emo: G.k[k.k] || sceneEmoji(c.k, G, "🈶"), n: `${c.k} = ${c.r} (${pendek(c.a)})` }));
    } else {
      const salah = pick(kjAll.filter(x => pendek(x.a) !== pendek(k.a)), 3);
      out.push(withOpts(`Kanji 「${k.k}」 artinya…`, [pendek(k.a), ...salah.map(x => pendek(x.a))], 0, { sec: "kanji", emo: G.k[k.k] || "🈶", n: `${k.k}: ${pendek(k.a)} (On: ${k.on || "-"}; Kun: ${k.kun || "-"})` }));
    }
  });
  // bunpou (6): contoh → arti / contoh → pola
  bnPool.slice(0, 6).forEach((b, i) => {
    if (!b.contoh) return;
    if (i % 2 === 0) {
      const salah = pick(bnAll.filter(x => x.arti_contoh && x.arti_contoh !== b.arti_contoh), 3);
      out.push(withOpts(b.contoh, [b.arti_contoh, ...salah.map(x => x.arti_contoh)], 0, { sec: "bunpou", emo: sceneEmoji(b.contoh, G, "💬"), pre: "Arti kalimat ini…", n: `${b.contoh.replace(/\[[^\]]*\]/g, "")} = ${b.arti_contoh} (pola ${b.pola.replace(/\[[^\]]*\]/g, "")})` }));
    } else {
      const salah = pick(bnAll.filter(x => x.pola !== b.pola), 3);
      out.push(withOpts(b.contoh, [b.pola, ...salah.map(x => x.pola)], 0, { sec: "bunpou", emo: sceneEmoji(b.contoh, G, "💬"), pre: "Pola yang dipakai kalimat ini…", n: `${b.pola.replace(/\[[^\]]*\]/g, "")}: ${b.penjelasan}` }));
    }
  });
  // choukai (3): dibacakan VOICEVOX (mp3 dibuat otomatis dari choukai/paket/n5-p90x.json)
  const ck = (await choukaiPool(CK_PK[lv])).filter(it => it.blok === blok && it.p === p);
  ck.forEach(it => out.push(ckSoal(it, "choukai", G)));
  const bb = await bank(); const L = ((bb.bab || {})[lv] || []).flat();
  if (L.length) { const i0 = Math.floor((blok * 3 + p) * L.length / 9); [L[i0 % L.length], L[(i0 + 1) % L.length]].forEach(x => x.qs.forEach(q => out.push({ sec: "reading", fl: x.fl, q: q.q, o: q.o, a: q.a, n: q.n }))); }
  unseed();
  return out;
}

/* ---------- pembuat soal: simulasi JFT ---------- */
async function vocabSim(n, lvls) {
  const kos = (await Promise.all(lvls.map(kosOf))).flat().filter(katabersih);
  const kj = kos.filter(w => hasKanji(w.kata));
  const out = []; const used = new Set();
  const ambil = (arr) => { for (let t = 0; t < 60; t++) { const w = arr[Math.floor(rng() * arr.length)]; if (!used.has(w.kata)) { used.add(w.kata); return w; } } return arr[0]; };
  const G = await gambarD(); const adaG = (w) => G.w[w.kata] || G.w[w.kata.replace(/^お/, "")]; const gAll = kos.filter(adaG);
  const tipe = ["arti", "baca", "gambar", "kanji", "gambar2", "baca"];
  for (let i = 0; i < n; i++) {
    const j = tipe[i % 6];
    if (j === "gambar" || j === "gambar2") {
      const w = ambil(gAll); const e = adaG(w); const lain = pick(gAll.filter(x => adaG(x) !== e), 3);
      if (j === "gambar") out.push(withOpts("Gambar ini disebut apa dalam bahasa Jepang?", [w.kata, ...lain.map(x => x.kata)], 0, { sec: "vocab", emo: e, n: `${e} = ${w.kata}（${w.kana}）` }));
      else out.push(withOpts(`「${w.kata}」 yang mana?`, [emoPic(e), ...lain.map(x => emoPic(adaG(x)))], 0, { sec: "vocab", n: `${w.kata} = ${e}` }));
      continue;
    }
    if (j === "arti") { const w = ambil(kos); const salah = pick(kos.filter(x => pendek(x.arti) !== pendek(w.arti)), 3); out.push(withOpts(`「${w.kata}」 artinya…`, [pendek(w.arti), ...salah.map(x => pendek(x.arti))], 0, { sec: "vocab", n: `${w.kata}（${w.kana}）= ${pendek(w.arti)}` })); }
    else if (j === "baca") { const w = ambil(kj); const salah = pick(kj.filter(x => x.kana !== w.kana), 3); out.push(withOpts(`「${w.kata}」 cara bacanya…`, [w.kana, ...salah.map(x => x.kana)], 0, { sec: "vocab", n: `${w.kata} dibaca ${w.kana}` })); }
    else { const w = ambil(kj); const salah = pick(kj.filter(x => x.kata !== w.kata), 3); out.push(withOpts(`「${w.kana}」 ditulis dengan kanji…`, [w.kata, ...salah.map(x => x.kata)], 0, { sec: "vocab", n: `${w.kana} = ${w.kata}` })); }
  }
  return shuffle(out);
}
async function soalSek(sek, n, lvls) {
  const b = await bank();
  if (sek === "vocab") return vocabSim(n, lvls || ["ir0", "ir1", "ir2"]);
  if (sek === "conv") return pick(b.conv, n).map(x => withOpts(x.q, x.o, x.a, { sec: "conv", n: x.n }));
  if (sek === "listening") { const G2 = await gambarD(); return pick(await choukaiPool(CK_PK.sim), n).map(it => ckSoal(it, "listening", G2)); }
  const out = []; pick(b.read, Math.ceil(n / 2)).forEach((t, ti) => t.qs.forEach(x => out.push(withOpts(x.q, x.o, x.a, { sec: "reading", fl: t.fl, pid: ti, n: x.n }))));
  return out.slice(0, n);
}
async function paketSim(p) {
  setSeed(`sim|${p === 4 ? 0 : p}`);   // paket 5 = ulangan paket 1 (klon)
  const qs = [];
  for (const s of URUT) (await soalSek(s, SEK[s].n)).forEach(q => qs.push(q));
  unseed();
  return qs;
}

/* ---------- skor (estimasi) ---------- */
// JFT asli memakai skala 10–250 hasil equating (IRT). Di sini dipakai pemetaan linear bertahap:
// 0%→10, 50%→145, 70%→200, 100%→250.
export function skalaJft(pct) {
  const p = Math.max(0, Math.min(1, pct));
  const seg = [[0, 10], [0.5, 145], [0.7, 200], [1, 250]];
  for (let i = 1; i < seg.length; i++) if (p <= seg[i][0]) { const [x0, y0] = seg[i - 1], [x1, y1] = seg[i]; return Math.round(y0 + (y1 - y0) * (p - x0) / (x1 - x0)); }
  return 250;
}
export function bandJft(s) {
  if (s >= 200) return { k: "A2.2", t: "Lulus standar A2 (≥ 200)", c: "#22c55e" };
  if (s >= 175) return { k: "A2.1", t: "Level A2.1 — hampir lulus, naikkan sedikit lagi", c: "#eab308" };
  if (s >= 145) return { k: "A1", t: "Level A1", c: "#f97316" };
  return { k: "*", t: "Di bawah A1 (di ujian asli tampil “*”)", c: "#ef4444" };
}
const gradeBab = (pct) => pct >= 0.8 ? { t: "Bagus sekali — siap lanjut", c: "#22c55e" } : pct >= 0.7 ? { t: "Lulus (≥ 70%)", c: "#84cc16" } : pct >= 0.5 ? { t: "Belum lulus — ulangi materi lalu coba lagi", c: "#f97316" } : { t: "Perlu belajar lagi sebelum mencoba ulang", c: "#ef4444" };

/* ---------- suara (listening) ---------- */
let _voices = [];
const _loadVoices = () => { try { _voices = (speechSynthesis.getVoices() || []).filter(v => /^ja/i.test(v.lang)); } catch (e) {} };
try { _loadVoices(); speechSynthesis.onvoiceschanged = _loadVoices; } catch (e) {}
function bicara(teks, onend) {
  if (!("speechSynthesis" in window)) { onend && onend(false); return; }
  speechSynthesis.cancel(); _loadVoices();
  const baris = String(teks).split(/\n/).map(s => s.trim()).filter(Boolean);
  const q = baris.map(b => { const m = /^(男|女)：(.*)$/.exec(b); return m ? { who: m[1], t: m[2] } : { who: "", t: b.replace(/^（[^）]*）/, "") }; });
  q.forEach((x, i) => {
    const u = new SpeechSynthesisUtterance(x.t.replace(/[「」]/g, ""));
    u.lang = "ja-JP"; u.rate = 0.88; u.pitch = x.who === "男" ? 0.75 : x.who === "女" ? 1.3 : 1;
    if (_voices[0]) u.voice = _voices[0];
    if (i === q.length - 1) u.onend = () => onend && onend(true);
    speechSynthesis.speak(u);
  });
}

/* ---------- sesi ujian ---------- */
let J = null, _tick = null;
const simpanSesi = () => { if (J && J.mode !== "latihan" && !J.selesai) LS.set(SESI_KEY(), J); };
function pulihSesi() { const s = LS.get(SESI_KEY(), null); if (s && !s.selesai && s.endAt > Date.now()) return s; LS.del(SESI_KEY()); return null; }
const rentang = (sek) => { const idx = []; J.qs.forEach((q, i) => { if (q.sec === sek) idx.push(i); }); return idx; };
const grup = (sek) => J.flat ? J.qs.map((_, i) => i) : rentang(sek);
const sisaDetik = () => Math.max(0, Math.round((J.endAt - Date.now()) / 1000));
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function parseKode(kode) {
  const m = /^b([0-2])p([0-2])$/.exec(kode || ""); if (m) return { jenis: "bab", blok: +m[1], p: +m[2] };
  const s = /^sim([0-4])$/.exec(kode || ""); if (s) return { jenis: "sim", p: +s[1] };
  return null;
}
const judulKode = (lv, k) => k.jenis === "bab" ? `${LV[lv].nama} · Bab ${BLOK[k.blok][0]}–${BLOK[k.blok][1]} · Paket ${k.p + 1}` : `Simulasi JFT-Basic · Paket ${k.p + 1}${k.p === 4 ? " (ulangan Paket 1)" : ""}`;

async function mulaiPaket(kode, menit) {
  const lv = S().level; const k = parseKode(kode);
  if (!LV[lv] || !k) return false;
  let qs, daftar, flat, mode;
  if (k.jenis === "bab") { qs = await paketBab(lv, k.blok, k.p); daftar = ["kotoba", "kanji", "bunpou", "choukai", "reading"]; flat = true; mode = "bab"; menit = menit || 25; }
  else { qs = await paketSim(k.p); daftar = URUT; flat = false; mode = "sim"; menit = 60; }
  J = { mode, kode, lv, judul: judulKode(lv, k), daftar, flat, qs, ans: {}, plays: {}, idx: 0, mulai: Date.now(), endAt: Date.now() + menit * 60000, menit, selesai: false, konfirm: false };
  simpanSesi(); return true;
}
async function mulaiLatihan(sek) {
  setSeed("x" + Math.random()); unseed();
  const qs = await soalSek(sek, SEK[sek].n, [S().level && LV[S().level] ? S().level : "ir0"]);
  J = { mode: "latihan", kode: "latihan-" + sek, lv: S().level, judul: "Latihan " + SEK[sek].nama, daftar: [sek], flat: false, qs, ans: {}, plays: {}, idx: 0, mulai: Date.now(), endAt: 0, menit: 0, selesai: false, konfirm: false };
}

function startTick() {
  clearInterval(_tick);
  if (!J || !J.endAt) return;
  _tick = setInterval(() => {
    if (!J || J.selesai) { clearInterval(_tick); return; }
    const el = $("jft-timer"); const s = sisaDetik();
    if (el) { el.textContent = mmss(s); el.classList.toggle("warn", s <= 300); }
    if (s <= 0) { clearInterval(_tick); selesaiSesi(); }
  }, 1000);
}
function draw() { const app = $("app"); if (app) { app.innerHTML = renderSoal(); window.scrollTo(0, 0); } }

const fmtOpt = (o) => {
  if (String(o).startsWith("pic:")) return `<span class="jft-emo big">${esc(o.slice(4))}</span>`;
  if (ADA_EMO(o) && SOLO_EMO(o)) return `<span class="jft-emo big">${esc(o)}</span>`;
  const m = /^((?:[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\uFE0F\u200D])+(?:×\d+)?(?:\s+(?:[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\uFE0F\u200D])+(?:×\d+)?)*)\s*(.*)$/u.exec(o);
  if (m && m[2]) return `<span class="jft-emo">${esc(m[1])}</span> ${rb(m[2])}`;
  if (m) return `<span class="jft-emo big">${esc(m[1])}</span>`;
  return rb(o);
};
const isPicOpts = (arr) => arr.every(o => String(o).startsWith("pic:") || (ADA_EMO(o) && SOLO_EMO(o)));
function renderFlyer(f) {
  const rows = (f.r || []).map(([k, v]) => `<div class="fl-row"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join("");
  return `<div class="jft-flyer t-${esc(f.t || "notice")}"><div class="fl-head"><span class="fl-emo">${f.e || ""}</span><div><div class="fl-title">${esc(f.j)}</div>${f.s ? `<div class="fl-sub">${esc(f.s)}</div>` : ""}</div></div><div class="fl-body">${rows}</div>${f.f ? `<div class="fl-foot">${esc(f.f)}</div>` : ""}</div>`;
}
function renderSoal() {
  const q = J.qs[J.idx]; const sek = q.sec; const sim = J.mode === "sim"; const timed = !!J.endAt;
  const idxSek = grup(sek); const posSek = idxSek.indexOf(J.idx);
  const dengar = sek === "listening" || sek === "choukai";
  const terkunciMaju = sim && sek === "listening";
  const main = (J.plays[J.idx] || 0); const maxPlay = sim ? 2 : 99;
  const nomor = idxSek.map((gi, k) => `<button class="no ${J.ans[gi] != null ? "terjawab" : ""} ${gi === J.idx ? "aktif" : ""}" ${terkunciMaju ? "disabled" : ""} onclick="JFT.ke(${gi})">${k + 1}</button>`).join("");
  const teks = q.fl ? renderFlyer(q.fl) : q.p ? `<div class="jft-passage">${nl(q.p)}</div>` : "";
  const audio = dengar ? `<div class="jft-audio">
      <button class="btn" id="jft-play" ${main >= maxPlay ? "disabled" : ""} onclick="JFT.play()">▶ Putar audio ${sim ? `(${main}/${maxPlay})` : ""}</button>
      <div class="jft-hint">${sim ? "Audio hanya bisa diputar 2 kali. Soal tidak bisa kembali." : "Latihan: audio bisa diputar berulang."} Teks audio tidak ditampilkan saat ujian.</div></div>` : "";
  const picO = isPicOpts(q.o);
  const opsi = q.o.map((o, i) => `<button class="jft-opt ${J.ans[J.idx] === i ? "on" : ""} ${picO ? "pic" : ""}" onclick="JFT.jawab(${i})"><b>${"ABCD"[i]}</b> ${fmtOpt(o)}</button>`).join("");
  const adaNext = posSek < idxSek.length - 1;
  const bagianAkhir = J.flat || J.daftar.indexOf(sek) === J.daftar.length - 1;
  const nav = `<div class="jft-nav">
      ${(!terkunciMaju && posSek > 0) ? `<button class="btn ghost" onclick="JFT.ke(${idxSek[posSek - 1]})">← Sebelumnya</button>` : "<span></span>"}
      ${adaNext ? `<button class="btn" onclick="JFT.ke(${idxSek[posSek + 1]})">Berikutnya →</button>` :
        (J.konfirm ? `<button class="btn danger" onclick="JFT.lanjutBagian()">${bagianAkhir ? "Ya, kumpulkan" : "Ya, lanjut (tidak bisa kembali)"}</button>`
          : `<button class="btn" onclick="JFT.minta()">${bagianAkhir ? "Selesai & kumpulkan ✓" : "Selesai bagian ini ▶"}</button>`)}
    </div>`;
  const belum = idxSek.filter(gi => J.ans[gi] == null).length;
  const peringatan = J.konfirm ? `<div class="jft-warn">${belum ? `Masih ${belum} soal belum dijawab. ` : "Semua soal terjawab. "}${bagianAkhir ? "Ujian akan dikumpulkan." : "Setelah lanjut, bagian ini tidak bisa dibuka lagi."} <button class="btn ghost" onclick="JFT.batalKonfirm()">Batal</button></div>` : "";
  const judulSek = J.flat ? `${SEK[sek].jp} · ${SEK[sek].nama}` : `${SEK[sek].jp} · ${SEK[sek].nama}`;
  return `
  <div class="jft-wrap">
    <div class="jft-crumb">${esc(J.judul)}</div>
    <div class="jft-top">
      <div><div class="jft-sec">${judulSek}</div><div class="jft-sub">${J.flat ? `Soal ${J.idx + 1}/${J.qs.length}` : `Soal ${posSek + 1}/${idxSek.length} · total ${J.idx + 1}/${J.qs.length}`}</div></div>
      ${timed ? `<div class="jft-timer" id="jft-timer">${mmss(sisaDetik())}</div>` : `<button class="btn ghost" onclick="JFT.minta()">Selesai</button>`}
    </div>
    <div class="jft-nomor">${nomor}</div>
    <div class="panel jft-q">${teks}${audio}${q.pre ? `<div class="jft-pre">${esc(q.pre)}</div>` : ""}${q.emo ? `<div class="jft-bigemo">${q.emo}</div>` : ""}<div class="jft-qtext">${rb(q.q)}</div><div class="jft-opts ${picO ? "pics" : ""}">${opsi}</div></div>
    ${peringatan}${nav}
  </div>`;
}

function selesaiSesi() {
  clearInterval(_tick); try { speechSynthesis.cancel(); } catch (e) {}
  J.selesai = true;
  const per = {};
  J.daftar.forEach(s => { const gi = rentang(s); per[s] = { benar: gi.filter(i => J.ans[i] === J.qs[i].a).length, total: gi.length }; });
  const benar = Object.values(per).reduce((a, x) => a + x.benar, 0), total = J.qs.length;
  const pct = total ? benar / total : 0;
  const rec = { t: Date.now(), mode: J.mode, kode: J.kode, lv: J.lv, judul: J.judul, per, benar, total, pct, skor: J.mode === "sim" ? skalaJft(pct) : null, detik: Math.round((Date.now() - J.mulai) / 1000) };
  rec.review = J.qs.map((q, i) => ({ sec: q.sec, q: q.q, o: q.o, a: q.a, u: J.ans[i] ?? null, n: q.n || "", p: q.p || "", fl: q.fl || null, emo: q.emo || "", say: q.say || "", pre: q.pre || "" }));
  if (J.mode !== "latihan") {
    const his = LS.get(HIS_KEY(), []); his.unshift({ ...rec, review: undefined }); LS.set(HIS_KEY(), his.slice(0, 40));
    const best = LS.get(BEST_KEY(), {}); const bk = `${J.lv}:${J.kode}`; if (!best[bk] || pct > best[bk].pct) best[bk] = { pct, skor: rec.skor, t: rec.t }; LS.set(BEST_KEY(), best);
  }
  LS.set(HIS_KEY() + ":last", rec);
  LS.del(SESI_KEY());
  route("jft-hasil");
}

/* ---------- aksi publik ---------- */
window.JFT = {
  async mulai(kode, menit) { $("app").innerHTML = '<div class="loading">Menyiapkan soal…</div>'; if (!(await mulaiPaket(kode, menit))) { toastP("Paket tidak ditemukan"); return route("jft-ujian"); } window._routeStack = ["jft-ujian"]; history.replaceState(null, "", "#jft-tes"); startTick(); draw(); },
  async latihan(sek) { $("app").innerHTML = '<div class="loading">Menyiapkan soal…</div>'; await mulaiLatihan(sek); history.replaceState(null, "", "#jft-tes"); draw(); },
  lanjutSesi() { const s = pulihSesi(); if (!s) return; J = s; history.replaceState(null, "", "#jft-tes"); startTick(); draw(); },
  jawab(i) { J.ans[J.idx] = i; J.konfirm = false; simpanSesi(); draw(); },
  ke(i) { J.idx = i; J.konfirm = false; simpanSesi(); draw(); },
  play() {
    const sim = J.mode === "sim"; const n = (J.plays[J.idx] || 0);
    if (sim && n >= 2) return; J.plays[J.idx] = n + 1; simpanSesi();
    const b = $("jft-play"); if (b) { b.disabled = true; b.textContent = "🔊 Memutar…"; }
    const q = J.qs[J.idx];
    const selesai = (ok) => { if (!J || J.selesai) return; draw(); if (ok === false) toastP("Audio tidak bisa diputar di perangkat ini"); };
    const cadangan = () => bicara(q.say, selesai);
    if (q.audio) {
      try { try { speechSynthesis.cancel(); } catch (e) {} const a = new Audio("./" + q.audio); window.__jftAudio = a; a.onended = () => selesai(true); a.onerror = cadangan; const pr = a.play(); if (pr && pr.catch) pr.catch(cadangan); } catch (e) { cadangan(); }
    } else cadangan();
  },
  minta() { J.konfirm = true; draw(); },
  batalKonfirm() { J.konfirm = false; draw(); },
  lanjutBagian() {
    if (J.flat) return selesaiSesi();
    const k = J.daftar.indexOf(J.qs[J.idx].sec);
    if (k >= J.daftar.length - 1) return selesaiSesi();
    try { speechSynthesis.cancel(); } catch (e) {}
    J.konfirm = false; J.idx = rentang(J.daftar[k + 1])[0]; simpanSesi(); draw();
  },
  async keUjian(lv) { if (S().level !== lv) await window.pilihLevel(lv); route("jft-ujian"); },
  hapusRiwayat() { LS.del(HIS_KEY()); LS.del(BEST_KEY()); route("jft-ujian"); },
  tampilReview() { const el = $("jft-review"); if (el) el.hidden = false; },
  waktu(m, btn) { document.querySelectorAll(".jft-wk button").forEach(b => b.classList.remove("on")); btn.classList.add("on"); window.__jftMenit = m; },
  waktuCustom() { const v = parseInt(prompt("Durasi (menit, 5–90):", "25"), 10); if (v >= 5 && v <= 90) { window.__jftMenit = v; document.querySelectorAll(".jft-wk button").forEach(b => b.classList.remove("on")); document.getElementById("jft-wk-c").classList.add("on"); document.getElementById("jft-wk-c").textContent = `★ ${v} menit`; } },
  mulaiDariIntro(kode) { window.JFT.mulai(kode, window.__jftMenit || 25); },
};
const toastP = (m) => (window.toast ? window.toast(m) : console.log(m));

/* ---------- halaman ---------- */
const bestOf = (lv, kode) => (LS.get(BEST_KEY(), {}))[`${lv}:${kode}`];
function lencana(lv, kode, sim) { const b = bestOf(lv, kode); if (!b) return ""; return `<small class="jft-done">✓ ${sim ? b.skor : Math.round(b.pct * 100) + "%"}</small>`; }

async function renderHub() {
  const st = S();
  if (!st.user) { setTimeout(() => route("login"), 0); return '<div class="loading">Memuat…</div>'; }
  const cnt = {};
  for (const l of Object.keys(LV)) cnt[l] = [(await kosOf(l)).length, (await kanjiOf(l)).length, (await bunOf(l)).length];
  const info = {
    ir0: "Sapaan, perkenalan, makanan, belanja, transportasi, rencana akhir pekan.",
    ir1: "Ngobrol di tempat kerja & kota, cuaca, kesehatan, janji, izin & larangan.",
    ir2: "Informasi publik, pengumuman, pasif, saran, pengalaman hidup di Jepang.",
  };
  const kartu = Object.keys(LV).map(l => `
    <div class="jlpt-card jft ${st.level === l ? "current" : ""}" data-kanji="${LV[l].jp}" role="button" tabindex="0" onclick="pilihLevel('${l}')">
      <span class="lv">${LV[l].jp}</span><span class="jpname">${LV[l].nama}</span>
      <span class="desc">${info[l]}<br><small>${cnt[l][0]} kosakata · ${cnt[l][1]} kanji · ${cnt[l][2]} bunpou</small></span>
      <span class="st">${st.level === l ? "✓ Sedang dipelajari" : "Buka materi →"}</span>
      <button class="btn jft-ujbtn" onclick="event.stopPropagation();JFT.keUjian('${l}')">📝 Ujian ${LV[l].ke}</button>
    </div>`).join("");
  return `
  <div class="jlpt-pick">
    <div class="head"><div class="jp">JFT-Basic · いろどり</div><h1>JFT-Basic A2</h1>
      <p>Pilih level Irodori untuk belajar kosakata, kanji, bunpou &amp; hafalan — atau masuk ke ujian CBT tiap level.</p></div>
    <div class="jlpt-grid">${kartu}</div>
    <div style="text-align:center;margin:14px 0"><button class="btn gold" onclick="route('jft-slide')">🎞️ Slide Bunpou Irodori (A1 · A2) — dengan audio</button></div>
    <div class="foot"><small style="color:var(--gray-dim)">Kosakata bersumber dari buku Irodori — The Japan Foundation (pemakaian edukasi non-komersial). Skor di sini hanya perkiraan latihan, bukan skor resmi JFT-Basic.</small></div>
  </div>`;
}

async function renderUjian() {
  const st = S();
  if (!st.user) { setTimeout(() => route("login"), 0); return '<div class="loading">Memuat…</div>'; }
  const lv = st.level;
  if (!LV[lv]) return `<div class="panel"><h2>📝 Ujian JFT-Basic</h2><p style="color:var(--gray)">Pilih level Irodori dulu:</p><div class="jft-latihan">${Object.keys(LV).map(l => `<button class="btn" onclick="JFT.keUjian('${l}')">${LV[l].jp} ${LV[l].nama}</button>`).join("")}</div></div>`;
  const sesi = pulihSesi();
  const blok = BLOK.map((r, b) => `
    <div class="panel jft-blok"><h3>Bab ${r[0]}–${r[1]}</h3>
      <div class="jft-sub">Kotoba · Kanji · Bunpou dari bab ${r[0]}–${r[1]} (23 soal per paket)</div>
      <div class="jft-paket">${[0, 1, 2].map(p => `<button class="jft-pk" onclick="route('jft-paket/b${b}p${p}')"><b>Paket ${p + 1}</b>${lencana(lv, `b${b}p${p}`)}</button>`).join("")}</div>
    </div>`).join("");
  const sim = lv === "ir2" ? `
    <div class="panel jft-blok jft-simcard"><h3>🏁 Simulasi Penuh JFT-Basic</h3>
      <div class="jft-sub">Format asli: 50 soal · 60 menit · 4 bagian (Script &amp; Vocabulary → Conversation &amp; Expression → Listening → Reading). Skor estimasi 10–250, lulus A2 ≥ 200.</div>
      <div class="jft-paket">${[0, 1, 2, 3, 4].map(p => `<button class="jft-pk" onclick="route('jft-paket/sim${p}')"><b>Paket ${p + 1}</b>${p === 4 ? "<small>ulangan Paket 1</small>" : ""}${lencana(lv, `sim${p}`, true)}</button>`).join("")}</div>
    </div>` : `<div class="panel"><div class="jft-sub">🔒 Simulasi penuh JFT-Basic (50 soal) tersedia di level <b>Shokyuu 2 · A2.2</b>.</div></div>`;
  const his = LS.get(HIS_KEY(), []).filter(h => h.lv === lv).slice(0, 6);
  const riw = his.length ? `<div class="panel" style="margin-top:12px"><h3>Riwayat terakhir</h3>${his.map(h => `<div class="jft-his"><span>${new Date(h.t).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span><b>${h.skor ?? Math.round(h.pct * 100) + "%"}</b><small>${esc(h.judul)}</small></div>`).join("")}<button class="btn ghost" style="margin-top:8px" onclick="if(confirm('Hapus riwayat ujian?'))JFT.hapusRiwayat()">Hapus riwayat</button></div>` : "";
  return `
  <div class="jft-wrap">
    <div class="jft-crumb">JFT-Basic › ${LV[lv].nama}</div>
    <h2 style="margin:4px 0 12px">📝 Ujian ${LV[lv].jp} · ${LV[lv].nama}</h2>
    ${sesi ? `<div class="panel"><button class="btn" onclick="JFT.lanjutSesi()">▶ Lanjutkan ujian: ${esc(sesi.judul)} (sisa ${mmss(Math.max(0, Math.round((sesi.endAt - Date.now()) / 1000)))})</button></div>` : ""}
    ${blok}${sim}
    <div class="panel" style="margin-top:12px"><h3>Latihan cepat per bagian JFT</h3><div class="jft-latihan">${URUT.map(s => `<button class="btn ghost" onclick="JFT.latihan('${s}')">${SEK[s].jp} ${SEK[s].nama.split(" ")[0]} (${SEK[s].n})</button>`).join("")}</div></div>
    ${riw}
  </div>`;
}

async function renderPaket(params) {
  const st = S(); const lv = st.level; const kode = (params || [])[0]; const k = parseKode(kode);
  if (!st.user || !LV[lv] || !k) { setTimeout(() => route("jft-ujian"), 0); return '<div class="loading">Memuat…</div>'; }
  window.__jftMenit = 25;
  let isi = "";
  if (k.jenis === "bab") isi = `<li>語彙 Kotoba (8)</li><li>漢字 Kanji (6)</li><li>文法 Bunpou (6)</li><li>聴解 Choukai (5) — suara VOICEVOX</li><li>読解 Dokkai (4) — panflet</li><li>Total <b>29 soal</b> dari bab ${BLOK[k.blok][0]}–${BLOK[k.blok][1]}</li>`;
  else isi = URUT.map(s => `<li>${SEK[s].jp} ${SEK[s].nama} (${SEK[s].n})</li>`).join("") + "<li>Total <b>50 soal</b></li>";
  const waktu = k.jenis === "bab" ? `<h3>⏱ Pengaturan waktu</h3><div class="jft-sub">Rekomendasi: <b>25 menit</b>. Kamu boleh memilih sendiri.</div>
      <div class="jft-wk">${[15, 20, 25, 30].map(m => `<button class="${m === 25 ? "on" : ""}" onclick="JFT.waktu(${m},this)">${m} menit${m === 25 ? " ★" : ""}</button>`).join("")}<button id="jft-wk-c" onclick="JFT.waktuCustom()">Custom</button></div>`
    : `<h3>⏱ Waktu</h3><div class="jft-sub">60 menit (tetap, seperti ujian asli).</div>`;
  const aturan = k.jenis === "bab" ? `<li>Soal bebas dibuka ulang sebelum dikumpulkan.</li>` : `<li>Dalam satu bagian soal bebas dibuka ulang; bagian yang sudah selesai terkunci.</li><li>Listening: audio 2× putar, tidak bisa kembali ke soal sebelumnya.</li><li>Skor dihitung estimasi skala 10–250 (lulus A2 ≥ 200).</li>`;
  return `
  <div class="jft-wrap">
    <div class="jft-crumb">JFT-Basic › ${LV[lv].nama} › ${k.jenis === "bab" ? `Bab ${BLOK[k.blok][0]}–${BLOK[k.blok][1]}` : "Simulasi"}</div>
    <h2 style="margin:4px 0 12px">${esc(judulKode(lv, k))}</h2>
    <div class="jft-grid2">
      <div class="panel"><h3>Isi paket</h3><ul class="jft-ul">${isi}</ul></div>
      <div class="panel">${waktu}
        <ul class="jft-ul"><li>Timer tetap berjalan walau halaman di-refresh atau ditutup.</li><li>Jawaban tersimpan otomatis di perangkat ini.</li><li>Jika waktu habis, ujian dikumpulkan otomatis.</li><li>Kunci jawaban tampil setelah ujian dikumpulkan.</li>${aturan}</ul>
        <button class="btn jft-go" onclick="JFT.mulaiDariIntro('${kode}')">▶ Mulai Ujian</button></div>
    </div>
  </div>`;
}

function renderTes() {
  if (J && !J.selesai) { startTick(); return renderSoal(); }
  const s = pulihSesi(); if (s) { J = s; startTick(); return renderSoal(); }
  setTimeout(() => route("jft-ujian"), 0); return '<div class="loading">Memuat…</div>';
}

function renderHasil() {
  const r = LS.get(HIS_KEY() + ":last", null);
  if (!r) { setTimeout(() => route("jft-ujian"), 0); return '<div class="loading">Memuat…</div>'; }
  const sim = r.mode === "sim"; const b = sim ? bandJft(r.skor) : gradeBab(r.pct);
  const bars = Object.entries(r.per).map(([s, x]) => { const p = x.total ? Math.round(100 * x.benar / x.total) : 0; return `<div class="jft-bar"><div class="l">${SEK[s].jp} ${SEK[s].nama}</div><div class="t"><i style="width:${p}%"></i></div><div class="v">${x.benar}/${x.total} · ${p}%</div></div>`; }).join("");
  const rv = r.review.map((x, i) => {
    const ok = x.u === x.a;
    return `<div class="jft-rv ${ok ? "ok" : "ng"}"><div class="h">${i + 1}. ${ok ? "✅" : "❌"} <small>${SEK[x.sec].jp}</small></div>
      ${x.fl ? renderFlyer(x.fl) : x.p ? `<div class="jft-passage">${nl(x.p)}</div>` : ""}${x.say ? `<div class="jft-passage">🎧 ${nl(x.say)}</div>` : ""}${x.emo ? `<div class="jft-bigemo">${x.emo}</div>` : ""}
      ${x.pre ? `<div class="jft-pre">${esc(x.pre)}</div>` : ""}<div class="q">${rb(x.q)}</div>
      <div class="a">Jawabanmu: ${x.u == null ? "—" : `${"ABCD"[x.u]}. ${fmtOpt(x.o[x.u])}`}${ok ? "" : `<br>Benar: <b>${"ABCD"[x.a]}. ${fmtOpt(x.o[x.a])}</b>`}</div>
      ${x.n ? `<div class="n">💡 ${esc(x.n)}</div>` : ""}</div>`;
  }).join("");
  return `
  <div class="jft-wrap">
    <div class="panel jft-hasil">
      <div class="jp">${esc(r.judul)}</div>
      ${sim ? `<div class="skor" style="color:${b.c}">${r.skor}<small> / 250</small></div>
        <div class="band" style="background:${b.c}22;border-color:${b.c};color:${b.c}">${b.k} — ${b.t}</div>
        <div class="jft-skala"><i style="left:${Math.min(100, (r.skor - 10) / 2.4)}%"></i><span style="left:${(145 - 10) / 2.4}%">145</span><span style="left:${(175 - 10) / 2.4}%">175</span><span style="left:${(200 - 10) / 2.4}%">200</span></div>`
      : `<div class="skor" style="color:${b.c}">${Math.round(r.pct * 100)}<small>%</small></div><div class="band" style="background:${b.c}22;border-color:${b.c};color:${b.c}">${b.t}</div>`}
      <div class="jft-sub">Benar ${r.benar} dari ${r.total} soal · ${Math.floor(r.detik / 60)} menit ${r.detik % 60} detik</div>
      <div class="jft-bars">${bars}</div>
      ${sim ? `<div class="jft-note">⚠ Ini <b>estimasi latihan</b>. Skor JFT-Basic resmi dihitung dengan equating (IRT) sehingga bobot tiap soal berbeda. Skor di bawah 145 tampil “*” di ujian asli.</div>` : ""}
      <div class="jft-aksi"><button class="btn" onclick="JFT.tampilReview();this.remove()">📋 Lihat kunci &amp; pembahasan</button> <button class="btn ghost" onclick="route('jft-ujian')">↩ Daftar ujian</button></div>
    </div>
    <div id="jft-review" hidden>${rv}</div>
  </div>`;
}

import { JFTS_ROUTES } from "./jft-slide.js?v=20261113b";
export const JFT_ROUTES = {
  ...JFTS_ROUTES,
  jft: () => renderHub(),
  "jft-ujian": () => renderUjian(),
  "jft-paket": (p) => renderPaket(p),
  "jft-tes": () => renderTes(),
  "jft-hasil": () => renderHasil(),
};
export function initJft(fb, loadMateri) { window.__loadMateri = loadMateri; }
