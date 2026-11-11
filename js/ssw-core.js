/* =====================================================================
 * SSW (特定技能) — CORE: data, progres, spaced repetition (SM-2), util.
 * Tanpa UI. Dipakai oleh js/ssw.js.
 *
 * Sumber data (statis, di repo):
 *   data/ssw/{slug}/index.json   manifest bidang (daftar bab, file kosakata, kuis)
 *   data/ssw/{slug}/babN.json    bab → subbab → materi lengkap + ringkasan (ID & JP)
 *   data/ssw/{slug}/vocab.json   bank kosakata (otomatis dikumpulkan dari bab)
 *   data/ssw/{slug}/quiz.json    3 kuis per bab + bank soal untuk 3 kuis penuh
 *   assets/ssw/{slug}/{id|jp}/pNN.webp   halaman buku (gambar) untuk "Buku Interaktif"
 *
 * Konfigurasi guru (Firestore, dilindungi rules):
 *   ssw_bidang/{slug}  { nama, jp, aktif, urut, tema, gambar, bab:{babId:"draft|published|hidden"} }
 * Progres siswa (Firestore, per akun):
 *   siswa/{uid}/ssw_progres/{slug}
 * ===================================================================== */

let FB = null;
export function initSswCore(fb) { FB = fb; }

const S = () => window.__SHIROSE_STATE || {};
export const uidNow = () => S().user?.uid || "guest";
export const isGuest = () => !S().user || (FB && FB.isGuestUser && FB.isGuestUser());
export const isGuru = () => { try { return !!(FB && FB.userIsGuru && FB.userIsGuru()); } catch (e) { return false; } };
export const DAY = 86400000, MIN = 60000;

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const attr = esc;

/* ---------- markup teks: {漢字|かんじ} → ruby, **tebal** ---------- */
export function rich(s, opt = {}) {
  let t = esc(s);
  t = t.replace(/\{([^|{}]+)\|([^{}]+)\}/g, (m, b, r) => opt.ruby === false ? b : `<ruby>${b}<rt>${r}</rt></ruby>`);
  t = t.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  t = t.replace(/\n/g, "<br>");   // baris baru (dialog pada soal)
  return t;
}
/** teks polos tanpa markup (untuk TTS & pencarian) */
export const plain = (s) => String(s ?? "").replace(/\{([^|{}]+)\|([^{}]+)\}/g, "$1").replace(/\*\*/g, "");
/** teks untuk dibacakan (pakai furigana) */
export const spoken = (s) => String(s ?? "").replace(/\{([^|{}]+)\|([^{}]+)\}/g, "$2").replace(/\*\*/g, "");

export const shuffle = (a, rnd = Math.random) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export function seeded(seed) { let s = 0; for (const c of String(seed)) s = (s * 31 + c.charCodeAt(0)) >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};

/* ============================ DATA ============================ */
const cache = {};
async function getJSON(url) {
  if (!cache[url]) cache[url] = fetch(url).then(r => { if (!r.ok) throw new Error(`${url}: ${r.status}`); return r.json(); }).catch(e => { delete cache[url]; throw e; });
  return cache[url];
}

/** Daftar bidang bawaan — dipakai bila guru belum membuat dokumen di Firestore.
 *  Hanya building-cleaning yang punya materi (hasContent). Sisanya "belum tersedia". */
export const DEFAULT_BIDANG = [
  { slug: "building-cleaning", nama: "Building Cleaning", jp: "ビルクリーニング", aktif: true, urut: 1, tema: "building", hasContent: true },
  { slug: "kaigo", nama: "Kaigo", jp: "介護", aktif: true, urut: 2, tema: "kaigo", hasContent: true },
  { slug: "kaigo-jp", nama: "Kaigo (Bahasa Jepang)", jp: "介護の日本語", induk: "kaigo", aktif: true, urut: 2.5, tema: "kaigo", hasContent: true },
  { slug: "food-manufacturing", nama: "Food Manufacturing", jp: "飲食料品製造業", aktif: false, urut: 3, tema: "factory" },
  { slug: "food-service", nama: "Food Service (Jasa Boga)", jp: "外食業", aktif: true, urut: 4, tema: "restaurant", hasContent: true },
  { slug: "food-service-jp", nama: "Food Service (Bahasa Jepang)", jp: "外食業（日本語）", induk: "food-service", aktif: true, urut: 4.5, tema: "restaurant", hasContent: true },
  { slug: "agriculture", nama: "Agriculture", jp: "農業", aktif: false, urut: 5, tema: "farm" },
  { slug: "construction", nama: "Construction", jp: "建設", aktif: false, urut: 6, tema: "construction" },
  { slug: "accommodation", nama: "Accommodation", jp: "宿泊", aktif: false, urut: 7, tema: "hotel" },
];

let _bidang = null;
/** Gabungan: bawaan + dokumen Firestore (Firestore menang). Dokumen yang ada di Firestore tapi tidak di bawaan ikut tampil. */
export async function loadBidang(force = false) {
  if (_bidang && !force) return _bidang;
  let remote = [];
  try { if (FB && FB.loadSswBidang && !isGuest()) remote = await FB.loadSswBidang(); } catch (e) { console.warn("ssw: gagal memuat konfigurasi bidang:", e.message || e); }
  const map = new Map(DEFAULT_BIDANG.map(b => [b.slug, { ...b }]));
  for (const r of remote) {
    const base = map.get(r.slug) || { slug: r.slug, tema: "generic", urut: 99 };
    map.set(r.slug, { ...base, ...r });
  }
  _bidang = [...map.values()].sort((a, b) => (a.urut || 99) - (b.urut || 99));
  return _bidang;
}
export const bidangBySlug = async (slug) => (await loadBidang()).find(b => b.slug === slug) || null;

/** Manifest + semua bab + kosakata + kuis untuk satu bidang. */
const _pack = {};
export async function loadPack(slug) {
  if (_pack[slug]) return _pack[slug];
  _pack[slug] = (async () => {
    const base = `./data/ssw/${slug}`;
    const idx = await getJSON(`${base}/index.json`);
    const babs = await Promise.all(idx.bab.map(b => getJSON(`${base}/${b.file}`)));
    let vocab = [], quiz = { bab: {}, full: [] };
    try { vocab = await getJSON(`${base}/${idx.vocab || "vocab.json"}`); } catch (e) {}
    try { quiz = await getJSON(`${base}/${idx.quiz || "quiz.json"}`); } catch (e) {}
    const chapters = babs.map((d, i) => ({ ...d.bab, source: d.source, order: i, subs: d.bab.subs }));
    return { slug, idx, chapters, vocab: vocab.items || vocab, quiz };
  })();
  try { return await _pack[slug]; } catch (e) { delete _pack[slug]; throw e; }
}

/** Status bab yang berlaku: konfigurasi guru > bawaan "published". */
export const babStatus = (bidang, babId) => (bidang?.bab && bidang.bab[babId]) || "published";
export const siswaBolehBab = (bidang, babId) => isGuru() || babStatus(bidang, babId) === "published";


/* ============================ AKSES & LEADERBOARD ============================ */
/** Akses SSW.
 *  - siswa/{uid}.aksesSsw === false            → seluruh SSW diblokir (aturan lama, tetap berlaku).
 *  - Per bidang (slug), urutan prioritas:
 *      1. siswa/{uid}.aksesSswBidang[slug]  (true/false, diatur guru per siswa)
 *      2. kelas/{id}.aksesSswBidang[slug]   (true/false, diatur guru per kelas; dicocokkan lewat nama kelas)
 *      3. bawaan aman: hanya "building-cleaning" yang terbuka (seperti sebelum ada akses per bidang).
 *  Tanpa slug = cek akses SSW umum saja. */
export const BIDANG_BAWAAN_BUKA = "building-cleaning";
let _kelasAkses = null;   // { uid, map }
export async function loadKelasAkses() {
  const d = (FB && FB.getSiswaDoc && FB.getSiswaDoc()) || null;
  if (!d || !d.kelas || isGuru() || isGuest()) return {};
  if (_kelasAkses && _kelasAkses.uid === uidNow() && _kelasAkses.kelas === d.kelas) return _kelasAkses.map;
  let map = {};
  try { const k = (await FB.listKelas()).find(x => x.nama === d.kelas); map = (k && k.aksesSswBidang) || {}; } catch (e) { console.warn("ssw: akses kelas gagal dimuat:", e.message || e); }
  _kelasAkses = { uid: uidNow(), kelas: d.kelas, map };
  return map;
}
export function sswAllowed(slug) {
  if (isGuru()) return true;
  let d = null; try { d = FB && FB.getSiswaDoc && FB.getSiswaDoc(); } catch (e) {}
  if (d && d.aksesSsw === false) return false;
  if (!slug) return true;
  // Bidang "turunan" (mis. Kaigo Bahasa Jepang) mengikuti bidang induknya (Kaigo) kecuali diatur sendiri.
  const cek = (sl) => {
    const a = d && d.aksesSswBidang ? d.aksesSswBidang[sl] : undefined;
    if (typeof a === "boolean") return a;
    const k = _kelasAkses && _kelasAkses.uid === uidNow() ? _kelasAkses.map[sl] : undefined;
    return typeof k === "boolean" ? k : undefined;
  };
  let r = cek(slug);
  if (r === undefined) { const ind = (DEFAULT_BIDANG.find(b => b.slug === slug) || {}).induk; if (ind) r = cek(ind); }
  return typeof r === "boolean" ? r : (slug === BIDANG_BAWAAN_BUKA);
}
/** Poin: subbab dibaca ×10, kartu sudah dikuasai ×2 (+3 bila "kuasa"), skor terbaik tiap kuis ×0.5. */
export function points(P) {
  const baca = Object.keys(P.read || {}).length * 10;
  let kartu = 0; for (const c of Object.values(P.cards || {})) { if ((c.reps || 0) >= 1) kartu += 2; if ((c.reps || 0) >= 3 && (c.iv || 0) >= 7) kartu += 3; }
  let kuis = 0; for (const q of Object.values(P.quiz || {})) kuis += Math.max(0, q.best || 0) * 0.5;
  return { poin: Math.round(baca + kartu + kuis), rinci: { baca, kartu, kuis: Math.round(kuis) } };
}
const _rankT = {};
export function syncRank(slug) {
  if (isGuru() || isGuest() || !(FB && FB.saveSswRank)) return;
  const e = PS[slug]; if (!e) return;
  clearTimeout(_rankT[slug]);
  _rankT[slug] = setTimeout(async () => {
    try { const d = (FB.getSiswaDoc && FB.getSiswaDoc()) || {}; const r = points(e.P);
      await FB.saveSswRank(slug, { nama: d.nama || "Siswa", kelas: d.kelas || "", poin: r.poin, rinci: r.rinci }); } catch (err) { console.warn("ssw: rank gagal:", err.message || err); }
  }, 1200);
}
export async function loadRank(slug) {
  if (!(FB && FB.loadSswRank) || isGuest()) return [];
  const rows = await FB.loadSswRank(slug);
  return rows.sort((a, b) => (b.poin || 0) - (a.poin || 0) || String(a.nama).localeCompare(String(b.nama)));
}

/* ============================ PROGRES ============================ */
const DEF = () => ({ v: 1, u: 0, read: {}, cards: {}, quiz: {}, last: null, log: [] });
const PS = {};   // slug → { id, P }
const _timers = {};
const LKEY = (slug) => `shirose-ssw:${uidNow()}:${slug}`;

export async function getProgress(slug) {
  const id = uidNow();
  if (PS[slug] && PS[slug].id === id) return PS[slug].P;
  const local = LS.get(LKEY(slug), null);
  let remote = null;
  if (FB && FB.loadSswProgres && !isGuest()) { try { remote = await FB.loadSswProgres(slug); } catch (e) { console.warn("ssw: gagal memuat progres:", e.message || e); } }
  const pick = !local ? remote : !remote ? local : ((remote.u || 0) >= (local.u || 0) ? remote : local);
  const P = Object.assign(DEF(), pick || {});
  P.read = P.read || {}; P.cards = P.cards || {}; P.quiz = P.quiz || {}; P.log = P.log || [];
  PS[slug] = { id, P };
  return P;
}
/** Kartu hafalan SSW memakai MESIN JLPT (dokumen SRS "ssw-bc", kunci "s:<no>") → dipetakan ke bentuk kartu SSW untuk statistik. */
export const vnum = (v) => parseInt(String(v.id).replace(/\D/g, ""), 10) || 0;
let _srsT = 0;
export async function syncCards(P, vocab, force) {
  if (typeof window === "undefined" || !window.sswSrsLoad) return;
  if (!force && P._srsOk && Date.now() - _srsT < 2500) return;
  let srs = {}; try { srs = await window.sswSrsLoad(); } catch (e) { return; }
  _srsT = Date.now(); P._srsOk = 1;
  const out = {};
  for (const v of vocab) {
    const c = srs["s:" + vnum(v)]; if (!c) continue;
    const ok = c.last === "ingat", iv = c.mastered ? Math.max(c.interval || 1, 7) : (c.interval || 1);
    out[v.id] = { last: c.n > 0 ? (c.due || Date.now()) - iv * 86400000 : 0, due: c.due || 0, iv, reps: c.mastered ? 3 : ok ? Math.max(1, Math.min(c.n || 1, 5)) : 0, lg: ok ? 1 : 0, ok: ok ? c.n : 0, ng: ok ? 0 : c.n };
  }
  P.cards = out;
}
export function touch(slug) {
  const e = PS[slug]; if (!e) return;
  e.P.u = Date.now(); LS.set(LKEY(slug), e.P); syncRank(slug);
  clearTimeout(_timers[slug]); _timers[slug] = setTimeout(() => flush(slug), 1500);
}
export async function flush(slug) {
  const e = PS[slug]; if (!e) return;
  clearTimeout(_timers[slug]);
  if (FB && FB.saveSswProgres && !isGuest()) { try { await FB.saveSswProgres(slug, e.P); } catch (err) { console.warn("ssw: gagal menyimpan progres:", err.message || err); } }
}
export function flushAll() { for (const s of Object.keys(PS)) { LS.set(LKEY(s), PS[s].P); flush(s); } }
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushAll);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushAll(); });
}
export function logAct(slug, text) {
  const e = PS[slug]; if (!e) return;
  e.P.log.unshift({ t: Date.now(), x: text }); e.P.log.length = Math.min(e.P.log.length, 20);
}

/* ---------- progres bab (berdasar subbab dibaca + kuis) ---------- */
export function babProgress(P, chapter, vocab) {
  const subs = chapter.subs || [];
  const read = subs.filter(s => P.read[s.id]).length;
  const qids = [1, 2, 3].map(n => `${chapter.id}-q${n}`);
  const quizDone = qids.filter(q => (P.quiz[q]?.best ?? -1) >= 0).length;
  const total = subs.length + 3;
  const done = read + quizDone;
  const pct = total ? Math.round(100 * done / total) : 0;
  const words = vocab.filter(v => v.bab === chapter.id);
  const weak = words.filter(v => cardState(P.cards[v.id]) === "ulang" || cardState(P.cards[v.id]) === "belum").length;
  const hasQuizFail = qids.some(q => P.quiz[q] && P.quiz[q].best < 60);
  let status = "belum";
  if (pct >= 100 && !weak && !hasQuizFail) status = "selesai";
  else if (pct >= 100 && (weak || hasQuizFail)) status = "ulang";
  else if (pct > 0 || words.some(v => P.cards[v.id])) status = "proses";
  return { pct, read, subsTotal: subs.length, quizDone, status, weak };
}
export const STATUS_LABEL = { belum: "Belum dimulai", proses: "Sedang dipelajari", selesai: "Sudah selesai", ulang: "Perlu pengulangan" };

/* ============================ SM-2 FLASHCARD ============================ */
export const newCard = () => ({ ef: 2.5, iv: 0, reps: 0, lapses: 0, due: 0, ok: 0, ng: 0, last: 0, lg: null });

/** state tampilan: baru | belum | ulang | hafal | kuasa */
export function cardState(c, now = Date.now()) {
  if (!c || !c.last) return "baru";
  if (c.lg === 0 || c.reps === 0) return "belum";
  if (c.due <= now) return "ulang";
  if (c.reps >= 3 && c.iv >= 7) return "kuasa";
  return "hafal";
}
/** SM-2 disesuaikan dua tombol. grade: 1=belum hafal (again), 4=hafal (good). */
export function schedule(card, grade, now = Date.now()) {
  const c = { ...newCard(), ...card };
  c.last = now;
  if (grade >= 3) {
    c.ok++; c.lg = 1;
    c.iv = c.reps === 0 ? 1 : c.reps === 1 ? 3 : Math.round(c.iv * c.ef);
    c.reps++;
    c.ef = Math.max(1.3, c.ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
    c.due = now + c.iv * DAY;
  } else {
    c.ng++; c.lapses++; c.lg = 0; c.reps = 0; c.iv = 0;
    c.ef = Math.max(1.3, c.ef - 0.2);
    c.due = now + 10 * MIN;   // muncul lagi di sesi yang sama / segera
  }
  return c;
}
export function cardStats(P, vocab, now = Date.now()) {
  const st = { total: vocab.length, baru: 0, belum: 0, ulang: 0, hafal: 0, kuasa: 0, due: 0 };
  for (const v of vocab) {
    const s = cardState(P.cards[v.id], now); st[s]++;
    const c = P.cards[v.id]; if (c && c.last && c.due <= now) st.due++;
  }
  return st;
}
/** Antrean sesi: jatuh tempo (paling lama dulu) → belum hafal → baru (maks newLimit). */
export function buildQueue(P, vocab, { newLimit = 15, now = Date.now(), mode = "review" } = {}) {
  const due = [], fresh = [], all = [];
  for (const v of vocab) {
    const c = P.cards[v.id];
    if (!c || !c.last) fresh.push(v);
    else if (c.due <= now) due.push(v);
  }
  due.sort((a, b) => (P.cards[a.id].due - P.cards[b.id].due));
  if (mode === "semua") return shuffle(vocab);
  if (mode === "baru") return shuffle(vocab.filter(v => cardState(P.cards[v.id], now) === "baru"));
  if (mode === "ulang") return shuffle(vocab.filter(v => ["belum", "ulang"].includes(cardState(P.cards[v.id], now))));
  if (mode === "hafal") return shuffle(vocab.filter(v => ["hafal", "kuasa"].includes(cardState(P.cards[v.id], now))));
  if (mode === "belum") return shuffle(vocab.filter(v => ["belum", "ulang"].includes(cardState(P.cards[v.id], now))));
  return [...due, ...fresh.slice(0, newLimit)];
}

/* ============================ KUIS ============================ */
/** 3 kuis penuh = sampel deterministik dari seluruh bank soal semua bab. */
export function fullQuizzes(pack, perQuiz = 20, count = 10) {
  const pool = [];
  for (const ch of pack.chapters) for (const q of (pack.quiz.bab?.[ch.id] || [])) { if (q.rev) continue; for (const it of q.items) pool.push({ ...it, bab: ch.id }); }   // q.rev = kuis ulangan (soalnya sudah ada di kuis subbab)
  if (!pool.length) return [];
  const out = [];
  const isImg = (x) => !!x.img, isMB = (x) => !!x.mb && !x.img, isMC = (x) => !x.mb && !x.img;
  for (let n = 1; n <= count; n++) {
    const rnd = seeded(`${pack.slug}-full-${n}`);
    const take = (arr, k, used) => shuffle(arr.filter(x => !used.has(x)), rnd).slice(0, k);
    const used = new Set(), pick = [];
    const nImg = Math.min(4, pool.filter(isImg).length), nMB = 6;
    for (const grp of [take(pool.filter(isImg), nImg, used), take(pool.filter(isMB), nMB, used)]) for (const x of grp) { used.add(x); pick.push(x); }
    // sisanya pilihan ganda, dibagi merata antar bab
    const byBab = {}; for (const it of pool.filter(isMC)) (byBab[it.bab] = byBab[it.bab] || []).push(it);
    const keys = Object.keys(byBab).map(k => shuffle(byBab[k], rnd)); let i = 0;
    while (pick.length < Math.min(perQuiz, pool.length) && keys.some(a => a.length)) { const it = keys[i++ % keys.length].shift(); if (it) pick.push(it); }
    out.push({ id: `full-q${n}`, title: { id: `Ujian Penuh ${n}`, jp: `総合テスト ${n}` }, items: shuffle(pick, rnd) });
  }
  return out;
}

/** Tes membaca: kanji kosakata → bacaan kana (diambil dari bank kosakata). 15 soal acak tiap kali dibuka. */
export function readingQuiz(pack, n = 15) {
  const items = (pack.vocab?.items || pack.vocab || []).filter(v => /[\u4e00-\u9fff]/.test(v.kata) && v.kana && v.kana !== v.kata);
  if (items.length < 4) return null;
  const pickN = shuffle(items).slice(0, Math.min(n, items.length));
  const out = pickN.map(v => {
    const others = shuffle(items.filter(o => o.kana !== v.kana)).sort((a, b) => Math.abs(a.kana.length - v.kana.length) - Math.abs(b.kana.length - v.kana.length)).slice(0, 6);
    const wrong = shuffle(others).slice(0, 3).map(o => o.kana);
    const opts = shuffle([v.kana, ...wrong]);
    return { q: { id: `Bagaimana cara membaca ${v.kata} ?`, jp: `「${v.kata}」の{読|よ}み{方|かた}は？` }, opts: opts.map(k => ({ id: k, jp: k })), a: opts.indexOf(v.kana),
      exp: { id: `${v.kata} dibaca ${v.kana} (${v.romaji}) = ${v.arti}.`, jp: `${v.kata}＝${v.kana}。` } };
  });
  return { id: "baca-kosakata", title: { id: "Tes Membaca Kosakata", jp: "{読|よ}み{方|かた}テスト" }, items: out };
}
export function recordQuiz(P, quizId, score, total, wrongIds) {
  const pct = Math.round(100 * score / Math.max(1, total));
  const q = P.quiz[quizId] || { best: -1, n: 0, hist: [] };
  q.best = Math.max(q.best, pct); q.last = pct; q.n++; q.ts = Date.now(); q.wrong = wrongIds || [];
  q.hist = [...(q.hist || []), { t: Date.now(), p: pct }].slice(-10);
  P.quiz[quizId] = q;
  return pct;
}
