/* =====================================================================
 * MENSETSU ENGINE — logika wawancara (tanpa UI)
 * ---------------------------------------------------------------------
 * - Bank soal  : ./data/mensetsu/{bidang}.json (dibangun tools/mensetsu_build.py)
 * - Mode AI    : lewat Cloudflare Worker "mensetsu-ai" (key aman di server; gratis)
 * - Mode Skrip : 100% di browser, tanpa AI, tanpa biaya (tanya-balik terbatas)
 * - STT        : Web Speech API browser (gratis; kualitas tergantung browser)
 * Semua fungsi murni (planner, klasifikasi, skor skrip) bisa dites di Node.
 * ===================================================================== */

export const FN_URL = "https://mensetsu-ai.shirose-nihongo.workers.dev";
export const CATS = [
  { k: "jiko", jp: "自己紹介", id: "Perkenalan diri" },
  { k: "shibou", jp: "志望動機", id: "Alasan melamar" },
  { k: "shigoto", jp: "仕事への理解", id: "Pemahaman pekerjaan" },
  { k: "seikatsu", jp: "日本での生活", id: "Kehidupan di Jepang" },
  { k: "mokuhyou", jp: "将来の目標", id: "Tujuan masa depan" },
  { k: "taiou", jp: "職場での対応", id: "Situasi di tempat kerja" },
  { k: "saigo", jp: "最後の質問", id: "Pertanyaan penutup" },
];
export const BOBOT = { isi: 25, tata_bahasa: 20, kosakata: 15, kelancaran: 15, artikulasi: 15, kesopanan: 10 };
export const AIZUCHI = ["はい、ありがとうございます。", "そうですか。", "なるほど。", "分かりました。", "ありがとうございます。", "はい、そうですか。"];
export const OPENING = "それでは、面接を始めます。よろしくお願いします。";
export const CLOSE_ASK = "最後に、何か質問はありますか。";
export const CLOSE_END = "本日の面接は以上です。ありがとうございました。";

const rnd = (a) => a[Math.floor(Math.random() * a.length)];
export const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
let _lastAiz = "";
export function aizuchi() { let a; do { a = rnd(AIZUCHI); } while (a === _lastAiz && AIZUCHI.length > 1); _lastAiz = a; return a; }

/* ---------------- bank soal ---------------- */
const _bank = {};
export async function loadIndex() {
  const r = await fetch("./data/mensetsu/index.json");
  if (!r.ok) throw new Error("Data Mensetsu belum tersedia");
  return r.json();
}
export async function loadBank(key) {
  if (_bank[key]) return _bank[key];
  const r = await fetch(`./data/mensetsu/${encodeURIComponent(key)}.json`);
  if (!r.ok) throw new Error("Bank soal bidang ini belum tersedia");
  const b = await r.json();
  b.byId = Object.fromEntries(b.soal.map(q => [q.i, q]));
  return (_bank[key] = b);
}

/* ---------------- perencana pertanyaan ---------------- */
/** cfg: {cats:[k], n, level:0|1|2|3, random:bool, mode}; weakIds: Set (mode lemah). */
export function planQuestions(bank, cfg, weakIds = new Set()) {
  const cats = cfg.cats && cfg.cats.length ? cfg.cats : CATS.map(c => c.k);
  let pool = bank.soal.filter(q => cats.includes(q.k) && q.k !== "saigo");
  if (cfg.level) pool = pool.filter(q => q.l === cfg.level);
  if (cfg.mode === "lemah" && weakIds.size) {
    const weak = pool.filter(q => weakIds.has(q.i));
    const rest = shuffle(pool.filter(q => !weakIds.has(q.i)));
    pool = [...shuffle(weak), ...rest];
    return pool.slice(0, cfg.n || pool.length);
  }
  const n = Math.min(cfg.n || pool.length, pool.length);
  if (cfg.random || cats.length === 1) return shuffle(pool).slice(0, n);
  // Semua kategori: wawancara nyata SELALU dibuka dengan 自己紹介; sisanya merata per kategori.
  const intro = cats.includes("jiko") ? pool.find(q => q.ja.startsWith("自己紹介")) : null;
  if (intro) pool = pool.filter(q => q !== intro);
  const per = {}; for (const c of cats) per[c] = shuffle(pool.filter(q => q.k === c));
  const order = CATS.map(c => c.k).filter(k => per[k] && per[k].length);
  const out = intro ? [intro] : []; let guard = 0;
  while (out.length < n && guard++ < 500) {
    let added = false;
    for (const k of order) { if (out.length >= n) break; const q = per[k].shift(); if (q) { out.push(q); added = true; } }
    if (!added) break;
  }
  // urutan alur: perkenalan → ... (stabil terhadap CATS); 自己紹介 tetap pertama
  const rank = Object.fromEntries(CATS.map((c, i) => [c.k, i]));
  const rest = out.filter(q => q !== intro).sort((a, b) => rank[a.k] - rank[b.k]);
  return intro ? [intro, ...rest] : rest;
}

/** Soal lemah dari riwayat: skor < 60 atau tidak dijawab dalam bahasa Jepang. */
export function weakFromHistory(list) {
  const score = {};
  for (const h of list || []) for (const t of h.turns || []) {
    const s = t.lang === "id" || !t.a ? 0 : (t.skor ?? 100);
    (score[t.i] = score[t.i] || []).push(s);
  }
  const weak = new Set();
  for (const [id, arr] of Object.entries(score)) { const last = arr[0]; if (last < 60) weak.add(id); }
  return weak;
}

/* ---------------- klasifikasi jawaban ---------------- */
const RX_JP = /[ぁ-んァ-ン一-龥]/g;
const RX_LAT = /[A-Za-z]/g;
const RX_CANT = /(tidak|belum|nggak|gak|ga)\s*(tahu|bisa|mengerti|paham|ngerti)|bagaimana\s*(cara|bilang|menjawab)|saya\s*bingung|わかりません|分かりません|できません|言えません/i;
export function classify(text) {
  const t = String(text || "").trim();
  if (!t) return { lang: "empty", len: 0, cant: false };
  const jp = (t.match(RX_JP) || []).length, lat = (t.match(RX_LAT) || []).length;
  let lang = "ja";
  if (!jp) lang = lat ? "id" : "empty";
  else if (lat > jp * 2) lang = "id";
  else if (lat > jp * 0.6) lang = "mix";
  return { lang, len: t.replace(/\s+/g, "").length, cant: RX_CANT.test(t) };
}

/* ---------------- tanya-balik mode skrip (tanpa AI) ---------------- */
const FOLLOW = [
  [/技術|ぎじゅつ/, "日本のどのような技術に興味がありますか。"],
  [/日本語|にほんご|勉強/, "日本語は、どのように勉強していますか。"],
  [/経験|けいけん|働いて|はたらいて/, "その経験で、どんなことを学びましたか。"],
  [/家族|かぞく|両親|りょうしん/, "ご家族のために、どんなことをしたいですか。"],
  [/体力|運動|スポーツ|サッカー/, "体力を保つために、何かしていますか。"],
  [/好き|すき|楽しい|たのしい/, "どうして好きなのですか。"],
  [/お金|給料|きゅうりょう/, "お金のほかに、日本で働きたい理由はありますか。"],
  [/チーム|協力|きょうりょく/, "チームで働いたとき、どんなことが大切だと思いますか。"],
];
/** Respons giliran wawancara tanpa AI. */
export function scriptTurn({ q, answer, followupsUsed = 0, nextQ, mode }) {
  const c = classify(answer);
  const maxFollow = mode === "latihan" ? 2 : 1;
  const help = { ja: q.aj, id: q.ai, kosakata: q.v, pola: "Contoh dari bank soal (bukan terjemahan jawabanmu). Susun jawabanmu sendiri dengan pola: 結論 → 理由 → 具体例." };
  if (c.lang === "empty" || (c.cant && c.lang !== "ja")) {
    if (mode === "nyata") return { kind: "clarify", say: "すみません、日本語でお願いできますか。", lang: c.lang };
    return { kind: "help", say: "大丈夫ですよ。インドネシア語でも大丈夫です。例を見てみましょう。では、この答えをもう一度、日本語で言ってみましょう。", lang: "id", bantuan: help };
  }
  if (c.lang === "id") {
    if (mode === "nyata") return { kind: "clarify", say: "すみません、日本語でお願いできますか。", lang: "id" };
    return { kind: "help", say: "大丈夫ですよ。インドネシア語でも大丈夫です。では、この答えをもう一度、日本語で言ってみましょう。", lang: "id", bantuan: help };
  }
  if (c.cant) {
    if (mode === "nyata") return { kind: "clarify", say: "そうですか。もう少し考えてみてください。", lang: "ja" };
    return { kind: "help", say: "大丈夫ですよ。例を見てみましょう。では、この答えをもう一度、日本語で言ってみましょう。", lang: "ja", bantuan: help };
  }
  if (c.len < 6 && followupsUsed < maxFollow) return { kind: "followup", say: "そうですか。もう少し教えてください。", lang: c.lang };
  if (followupsUsed < Math.min(1, maxFollow)) {
    for (const [rx, fq] of FOLLOW) if (rx.test(answer)) return { kind: "followup", say: aizuchi() + fq, lang: c.lang };
  }
  return { kind: "next", say: aizuchi() + (nextQ ? nextQ.ja : ""), lang: c.lang };
}

/* ---------------- penilaian mode skrip (perkiraan sederhana) ---------------- */
const RX_POLITE = /(です|ます|ました|でした|ません|ください|お願い|ございます|いたします|思います|申します)/;
const RX_GREET = /(よろしく|ありがとう|お願い|失礼|申し訳)/;
export function scoreScript(turns, bank) {
  let n = 0, jaN = 0, polite = 0, sumIsi = 0, sumLen = 0, greet = false; const seen = new Set();
  const per = [];
  for (const t of turns) {
    n++;
    const q = bank?.byId?.[t.i];
    if (t.lang === "id" || t.lang === "empty" || !t.a) { per.push({ i: t.i, skor: 10 }); continue; }
    jaN++;
    const len = t.a.replace(/\s+/g, "").length, lenScore = Math.min(1, len / 40), pol = RX_POLITE.test(t.a) ? 1 : 0;
    const words = (q?.v || []).map(([w]) => String(w).replace(/[〜~]/g, "").trim()).filter(w => w.length >= 2);
    const hits = words.filter(w => t.a.includes(w)); hits.forEach(w => seen.add(w));
    const vocabScore = Math.min(1, hits.length / 2);
    polite += pol; sumIsi += 0.5 * vocabScore + 0.5 * lenScore; sumLen += lenScore;
    if (RX_GREET.test(t.a)) greet = true;
    per.push({ i: t.i, skor: Math.round(100 * (0.35 * lenScore + 0.25 * pol + 0.4 * vocabScore)) });
  }
  const N = Math.max(1, n), J = Math.max(1, jaN);
  const skor = {
    isi: Math.round((sumIsi / N) * BOBOT.isi),
    tata_bahasa: Math.round((polite / J) * (jaN / N) * BOBOT.tata_bahasa * 0.9),
    kosakata: Math.round(Math.min(1, seen.size / (N * 1.5)) * BOBOT.kosakata),
    kelancaran: Math.round((jaN / N) * (sumLen / J) * BOBOT.kelancaran),
    kesopanan: Math.round(((polite / J) * 0.7 + (greet ? 0.3 : 0)) * (jaN / N) * BOBOT.kesopanan),
  };
  const kelebihan = [], kekurangan = [], saran = [];
  if (jaN / N >= 0.8) kelebihan.push("Sebagian besar pertanyaan dijawab dalam bahasa Jepang.");
  if (polite / J >= 0.7) kelebihan.push("Bentuk sopan (です・ます) cukup konsisten.");
  if (seen.size >= N) kelebihan.push("Kosakata penting dari topik pertanyaan cukup banyak dipakai.");
  if (jaN / N < 0.8) kekurangan.push("Beberapa pertanyaan belum dijawab dalam bahasa Jepang.");
  if (sumLen / J < 0.5) kekurangan.push("Banyak jawaban terlalu pendek.");
  if (polite / J < 0.7) kekurangan.push("Bentuk sopan (です・ます) belum konsisten.");
  saran.push("Latih pola 結論 → 理由 → 具体例 (kesimpulan → alasan → contoh).", "Ulangi pertanyaan bernilai rendah di mode Weakness Training.");
  const tidak = turns.filter(t => t.lang === "id" || t.lang === "empty" || !t.a).map(t => t.q);
  const lemah = per.filter(p => p.skor < 60).slice(0, 5);
  return {
    sumber: "skrip",
    skor, kelebihan, kekurangan, saran, tidak_dijawab: tidak,
    kurang_tepat: [], salah_tata_bahasa: [], salah_kosakata: [],
    jawaban_lebih_baik: lemah.map(p => { const q = bank?.byId?.[p.i], t = turns.find(x => x.i === p.i); return q && { q: q.ja, versi_siswa: t?.a || "", versi_baik: q.aj, arti: q.ai }; }).filter(Boolean),
    per_soal: per.map((p, i) => ({ i, id: p.i, skor: p.skor })),
    catatan: "Penilaian otomatis SEDERHANA tanpa AI: hanya perkiraan dari panjang jawaban, bentuk sopan, dan kata kunci. Analisis kesalahan tata bahasa/kosakata hanya tersedia di mode AI.",
  };
}

/** Gabungkan skor kategori + artikulasi (estimasi STT) → total /100. */
export function combine(ev, { voiceConf = null } = {}) {
  const s = ev.skor || {}; const clamp = (v, m) => Math.max(0, Math.min(m, Math.round(+v || 0)));
  const out = { isi: clamp(s.isi, 25), tata_bahasa: clamp(s.tata_bahasa, 20), kosakata: clamp(s.kosakata, 15), kelancaran: clamp(s.kelancaran, 15), kesopanan: clamp(s.kesopanan, 10), artikulasi: null };
  let total;
  if (voiceConf != null) {
    out.artikulasi = clamp(voiceConf * BOBOT.artikulasi, 15);
    total = out.isi + out.tata_bahasa + out.kosakata + out.kelancaran + out.kesopanan + out.artikulasi;
  } else {
    const sum = out.isi + out.tata_bahasa + out.kosakata + out.kelancaran + out.kesopanan;
    total = Math.round((sum / 85) * 100);
  }
  return { ...out, total: Math.max(0, Math.min(100, total)) };
}

/* ---------------- klien API (Cloudflare Worker) ---------------- */
async function tokenOf(FB) {
  try { return FB && FB.getIdToken ? await FB.getIdToken() : null; } catch (e) { return null; }
}
export async function apiProviders(FB) {
  const token = await tokenOf(FB); if (!token) return [];
  try {
    const r = await fetch(FN_URL, { headers: { Authorization: "Bearer " + token } });
    if (!r.ok) return [];
    const j = await r.json(); return j.providers || [];
  } catch (e) { return []; }
}
export async function aiCall(FB, task, payload, provider = "auto") {
  const token = await tokenOf(FB); if (!token) throw new Error("Belum login");
  const r = await fetch(FN_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify({ task, provider, ...payload }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || ("HTTP " + r.status));
  return j; // {provider, data}
}

/* ---------------- Speech-to-Text (Web Speech API) ---------------- */
export function sttSupported() { return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition); }
/** Mulai mendengarkan. Mengembalikan {stop, abort}. onEnd({text, conf}) dipanggil sekali. */
export function listen({ lang = "ja-JP", onInterim, onEnd, onError }) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR(); rec.lang = lang; rec.interimResults = true; rec.continuous = true; rec.maxAlternatives = 1;
  let finalText = "", confs = [], done = false, silenceTimer = null;
  const finish = () => { if (done) return; done = true; clearTimeout(silenceTimer); onEnd && onEnd({ text: finalText.trim(), conf: confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : null }); };
  const bump = () => { clearTimeout(silenceTimer); silenceTimer = setTimeout(() => { try { rec.stop(); } catch (e) {} }, 2200); }; // tidak memotong terlalu cepat
  rec.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) { finalText += r[0].transcript; if (typeof r[0].confidence === "number" && r[0].confidence > 0) confs.push(r[0].confidence); }
      else interim += r[0].transcript;
    }
    onInterim && onInterim((finalText + interim).trim()); bump();
  };
  rec.onerror = (e) => { onError && onError(e.error || "error"); };
  rec.onend = finish;
  try { rec.start(); bump(); } catch (e) { onError && onError("start"); finish(); }
  return { stop: () => { try { rec.stop(); } catch (e) {} }, abort: () => { done = true; clearTimeout(silenceTimer); try { rec.abort(); } catch (e) {} } };
}
