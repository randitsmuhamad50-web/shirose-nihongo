/* =====================================================================
 * KANA CENTER — Hiragana & Katakana + latihan menulis (juga dipakai Kanji)
 * ---------------------------------------------------------------------
 * Berdiri sendiri, terpisah dari JLPT N5–N1.
 * Data     : ./data/kana.json (tabel, romaji, contoh kata)  — dibangun tools/kana_build.py
 *            ./data/kana-strokes.json (goresan KanjiVG, dibundel)
 * Progres  : Firestore siswa/{uid}/kana_progres/data  (+ cadangan localStorage)
 *            → sub-koleksi milik siswa, sudah tercakup Firestore Rules yang ada.
 * Route    : #kana, #kana-tabel/{hira|kata}, #kana-order, #kana-tulis,
 *            #kana-hafalan, #kana-tes, #kana-progres
 * Global   : window.KC  (dipakai onclick di HTML + index.html untuk Kanji)
 * ===================================================================== */
import { loadGlyph, writableChars, createPlayer, WriteCanvas, scoreWriting, compareSvg, glyphSvg, loadKanaStrokes, labelFor } from "./writer.js";

let FB = null;
export function initKana(fb) { FB = fb; }

const S = () => window.__SHIROSE_STATE || window.state || {};
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const toast = (m) => (window.toast ? window.toast(m) : console.log(m));
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};
const uid = () => S().user?.uid || "guest";
const isGuest = () => !S().user || (FB && FB.isGuestUser && FB.isGuestUser());
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const DAY = 86400000;
const SCRIPT_NAME = { hira: "Hiragana", kata: "Katakana" };
const SCRIPT_JP = { hira: "ひらがな", kata: "カタカナ" };
const LV = ["n5", "n4", "n3", "n2", "n1"];

/* ============================== data ============================== */
let KD = null;
export async function loadKana() {
  if (KD) return KD;
  const r = await fetch("./data/kana.json");
  if (!r.ok) throw new Error("Data kana belum tersedia (data/kana.json)");
  KD = await r.json();
  return KD;
}
const info = (t, k) => KD.chars[`${t}:${k}`];
const sections = (t) => KD.sections[t];
/** Semua kunci karakter satu skrip, urut sesuai tabel; common=true → tanpa karakter jarang. */
function keysOf(t, secIds = null, common = true) {
  const out = [];
  for (const s of sections(t)) {
    if (secIds && !secIds.includes(s.id)) continue;
    for (const r of s.rows) for (const c of r.c) if (c && !out.includes(c)) { if (common && info(t, c)?.rare) continue; out.push(c); }
  }
  return out;
}

/* ============================== progres ============================== */
const DEF = () => ({ v: 1, u: 0, hira: {}, kata: {}, kanji: {}, flash: [], tes: [], baca: { hira: {}, kata: {} } });
let P = null, Pid = null, _saveT = 0, _loading = null;
const LKEY = () => `shirose-kana:${uid()}`;
export async function ensureProgress() {
  const id = uid();
  if (P && Pid === id) return P;
  if (_loading && _loading.id === id) return _loading.p;
  const p = (async () => {
    const local = LS.get(LKEY(), null);
    let remote = null;
    if (FB && !isGuest()) { try { remote = await FB.loadKanaProgres(); } catch (e) { console.warn("kana: gagal memuat progres:", e.message || e); } }
    const pick = !local ? remote : !remote ? local : ((remote.u || 0) >= (local.u || 0) ? remote : local);
    P = Object.assign(DEF(), pick || {}); Pid = id;
    for (const k of ["hira", "kata", "kanji"]) P[k] = P[k] || {};
    P.flash = P.flash || []; P.tes = P.tes || []; P.baca = P.baca || {}; P.baca.hira = P.baca.hira || {}; P.baca.kata = P.baca.kata || {};
    return P;
  })();
  _loading = { id, p };
  try { return await p; } finally { _loading = null; }
}
const touch = () => { if (!P) return; P.u = Date.now(); LS.set(LKEY(), P); clearTimeout(_saveT); _saveT = setTimeout(flush, 1500); };
async function flush() { clearTimeout(_saveT); if (P && FB && !isGuest()) { try { await FB.saveKanaProgres(P); } catch (e) { console.warn("kana: gagal menyimpan progres:", e.message || e); } } }
window.addEventListener("pagehide", () => { if (P) { LS.set(LKEY(), P); flush(); } });
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });

const pk = (t, k) => (P[t][k] = P[t][k] || { s: 0, m: 0, box: 0, due: 0, n: 0, ok: 0, ng: 0, wr: 0, bs: 0 });
const kj = (lv, no) => ((P.kanji[lv] = P.kanji[lv] || {})[no] = P.kanji[lv][no] || { s: 0, m: 0, wr: 0, bs: 0 });
function markStudied(ref) { const o = ref.kind === "kanji" ? kj(ref.level, ref.no) : pk(ref.t, ref.key); if (!o.s) { o.s = 1; o.ts = Date.now(); touch(); } }
function markMastered(ref, v) {
  const o = ref.kind === "kanji" ? kj(ref.level, ref.no) : pk(ref.t, ref.key);
  o.s = 1; o.m = v ? 1 : 0;
  if (ref.kind !== "kanji") { if (v) { o.box = Math.max(o.box, 3); o.due = Date.now() + 8 * DAY; } else { o.box = 0; o.due = 0; } }
  touch();
}
const stateClass = (t, k) => { const o = P?.[t]?.[k]; return o ? (o.m ? "mastered" : o.s ? "studied" : "") : ""; };

function stats(t) {
  const keys = keysOf(t, null, true); let s = 0, m = 0;
  for (const k of keys) { const o = P[t][k]; if (o?.s) s++; if (o?.m) m++; }
  return { total: keys.length, studied: s, mastered: m, unmastered: keys.length - m, pct: keys.length ? Math.round(100 * m / keys.length) : 0 };
}

/* ============================== util UI ============================== */
const bar = (pct, cls = "") => `<div class="kc-bar ${cls}"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i></div>`;
function say(text) {
  try { window.SV.speak(text, { role: "kosakata", level: "kana" }); } catch (_) { toast("Suara tidak tersedia di perangkat ini"); }
}
const fmtTgl = (ms) => ms ? new Date(ms).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-";
const fmtDur = (s) => `${Math.floor(s / 60)}m ${String(Math.round(s % 60)).padStart(2, "0")}d`;
const crumbs = (cur) => `<div class="kc-crumbs"><a onclick="route('kana')">あいうえお・カタカナ</a>${cur ? ` <span>›</span> <b>${cur}</b>` : ""}</div>`;

/* ============================== HUB ============================== */
export async function renderKanaHub() {
  await Promise.all([loadKana(), ensureProgress()]);
  const h = stats("hira"), k = stats("kata");
  setTimeout(fillHubPreviews, 0);
  const mini = ["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と"].map(c => `<span>${c}</span>`).join("");
  return `
  <div class="kc-wrap">
    <div class="kc-head">
      <div class="jp">あいうえお・カタカナ</div>
      <h1>Belajar Hiragana &amp; Katakana</h1>
      <p>Mulai dari nol: kenali huruf, lihat urutan goresan, tulis langsung di layar, hafalkan, lalu uji kemampuan membacamu.</p>
    </div>
    <div class="kc-cards">
      <a class="kc-card" onclick="route('kana-tabel/hira')">
        <div class="art art-table"><div class="grid5">${mini}</div></div>
        <h3>Tabel Hiragana &amp; Katakana</h3><p>Semua karakter bisa diklik untuk belajar.</p>
      </a>
      <a class="kc-card" onclick="route('kana-order')">
        <div class="art art-order" id="kc-prev-order"><span class="big">あ</span></div>
        <h3>Stroke Order</h3><p>Melihat urutan penulisan yang benar.</p>
      </a>
      <a class="kc-card" onclick="route('kana-tulis')">
        <div class="art art-write" id="kc-prev-write"><span class="ghost">あ</span></div>
        <h3>Latihan Menulis</h3><p>Menulis langsung dengan jari atau mouse.</p>
      </a>
      <a class="kc-card" onclick="route('kana-baca/hira')">
        <div class="art art-quiz"><div class="fc"><b>ねこ</b><small>neko · kucing</small></div></div>
        <h3>Latihan Baca 200 Kata</h3><p>200 kata hiragana dan 200 kata katakana yang mudah, dengan bacaan &amp; arti.</p>
      </a>
      <a class="kc-card" onclick="route('kana-aturan')">
        <div class="art art-quiz"><div class="fc"><b>が ぱ っ ー</b><small>゛ ゜ っ ー</small></div></div>
        <h3>Ten-ten, Maru, っ kecil &amp; ー</h3><p>Penjelasan tanda baca khusus kana beserta contoh dan suara.</p>
      </a>
      <div class="kc-card">
        <div class="art art-quiz" onclick="route('kana-hafalan')"><div class="fc"><b>あ</b><small>a · あめ = hujan</small></div></div>
        <h3 onclick="route('kana-hafalan')" style="cursor:pointer">Hafalan &amp; Test</h3><p>Menghafal karakter dan menguji kemampuan membaca.</p>
        <div class="kc-card-btns"><button class="btn sm" onclick="route('kana-hafalan')">文字を覚えよう</button><button class="btn sm ghost" onclick="route('kana-tes')">読み方テスト</button></div>
      </div>
    </div>
    <div class="kc-panel">
      <div class="kc-panel-h"><h2>Progres belajarmu</h2><a class="kc-link" onclick="route('kana-progres')">Lihat detail ›</a></div>
      <div class="kc-prog2">
        ${[["hira", h], ["kata", k]].map(([t, s]) => `<div class="kc-prog">
          <div class="kc-prog-top"><b>${SCRIPT_JP[t]}</b><span>${s.mastered}/${s.total} hafal</span></div>
          ${bar(s.pct, t)}<div class="kc-prog-sub">${s.studied} dipelajari · ${s.unmastered} belum hafal · ${s.pct}%</div></div>`).join("")}
      </div>
      ${isGuest() ? `<p class="kc-note">Kamu belum masuk — progres hanya tersimpan di perangkat ini. Masuk agar progres tersimpan di akunmu.</p>` : ""}
    </div>
  </div>`;
}
async function fillHubPreviews() {
  try {
    const ks = await loadKanaStrokes(); const g = ks["あ"]; if (!g) return;
    const a = document.getElementById("kc-prev-order"); if (a) a.innerHTML = glyphSvg(g, { numbers: true });
    const b = document.getElementById("kc-prev-write"); if (b) b.innerHTML = `<svg viewBox="0 0 109 109" class="kc-svg"><rect x=".5" y=".5" width="108" height="108" fill="#fdfbf4" stroke="#c9c3b0"/><g stroke="#d6d0bd" stroke-width=".6" stroke-dasharray="3 3"><line x1="54.5" y1="0" x2="54.5" y2="109"/><line x1="0" y1="54.5" x2="109" y2="54.5"/></g>${g.s.map(d => `<path d="${d}" fill="none" stroke="#cfd6ee" stroke-width="5.4" stroke-linecap="round"/>`).join("")}</svg>`;
  } catch (_) {}
}

/* ============================== TABEL / GRID ============================== */
const TS = { t: "hira", sec: "gojuon", mode: "tabel" };
const MODE_INFO = {
  tabel: { jp: "あいうえお・カタカナ", h: "Tabel Hiragana & Katakana", p: "Semua karakter bisa diklik untuk belajar.", tab: "belajar" },
  order: { jp: "書き順", h: "Stroke Order", p: "Pilih karakter untuk melihat urutan penulisan yang benar.", tab: "belajar" },
  tulis: { jp: "練習", h: "Latihan Menulis", p: "Pilih karakter lalu tulis langsung dengan jari, stylus, atau mouse.", tab: "latihan" },
};
export async function renderKanaTabel(params, mode = "tabel") {
  await Promise.all([loadKana(), ensureProgress()]);
  TS.mode = mode;
  const want = params && params[0];
  if (want === "hira" || want === "kata") TS.t = want;
  if (!sections(TS.t).some(s => s.id === TS.sec)) TS.sec = "gojuon";
  const mi = MODE_INFO[mode];
  return `<div class="kc-wrap">
    ${crumbs(mi.h)}
    <div class="kc-head compact"><div class="jp">${mi.jp}</div><h1>${mi.h}</h1><p>${mi.p}</p></div>
    <div class="kc-panel"><div id="kc-tbl-host"></div></div>
  </div>${(setTimeout(paintTable, 0), "")}`;
}
function paintTable() {
  const host = document.getElementById("kc-tbl-host"); if (!host) return;
  const t = TS.t, secs = sections(t), mi = MODE_INFO[TS.mode];
  const sec = secs.find(s => s.id === TS.sec) || secs[0];
  const cell = (c) => {
    if (!c) return `<span class="kc-blank"></span>`;
    const i = info(t, c), cls = stateClass(t, c);
    return `<button class="kc-cell ${cls} ${i.rare ? "rare" : ""}" data-kc-t="${t}" data-kc-k="${esc(c)}" data-kc-tab="${mi.tab}" aria-label="${esc(c)} dibaca ${esc(i.r)}">
      <span class="c">${esc(c)}</span><span class="r">${esc(i.r)}</span>${cls === "mastered" ? '<i class="st">★</i>' : cls === "studied" ? '<i class="st">●</i>' : ""}</button>`;
  };
  let body;
  if (sec.cols) {
    body = `<table class="kc-table"><thead><tr><th></th>${sec.cols.map(c => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>
      ${sec.rows.map(r => `<tr><th>${esc(r.l)}</th>${r.c.map(c => `<td>${cell(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  } else {
    body = `<div class="kc-flow">${sec.rows.map(r => `<div class="kc-flow-row"><b>${esc(r.l)}</b><div>${r.c.map(cell).join("")}</div></div>`).join("")}</div>`;
  }
  host.innerHTML = `
    <div class="kc-tabs2">${["hira", "kata"].map(x => `<button class="${x === t ? "on" : ""}" onclick="KC.script('${x}')"><span class="jp">${SCRIPT_JP[x]}</span> ${SCRIPT_NAME[x]}</button>`).join("")}</div>
    <div class="kc-chips">${secs.map(s => `<button class="${s.id === sec.id ? "on" : ""}" onclick="KC.sec('${s.id}')">${esc(s.jp)} <small>${esc(s.nama)}</small></button>`).join("")}</div>
    <div class="kc-tbl-wrap">${body}</div>
    <div class="kc-legend"><span><i class="st">●</i> sudah dipelajari</span><span><i class="st">★</i> sudah hafal</span><span class="rare">abu-abu = jarang dipakai</span></div>`;
}

/* ============================== WRITER (popup belajar + latihan) ============================== */
let WS = null;
function kanaRef(t, key) { return { kind: "kana", t, key }; }
function kanjiEntry(idx) { const s = S(); return (s.materi?.kanji?.[s.level] || [])[idx]; }

function openWriter(o) {
  closeWriter(true);
  const ws = WS = { tab: o.tab || "belajar", mode: o.mode || "trace", ci: 0, glyph: null, res: {}, list: o.list || null, li: o.li ?? 0, token: Date.now() };
  if (o.kind === "kanji") {
    const it = o.entry, k = it.kanji || it.k || "";
    Object.assign(ws, { kind: "kanji", level: o.level, no: o.no, entry: it, key: k, chars: writableChars(k) });
  } else {
    const i = info(o.t, o.key);
    Object.assign(ws, { kind: "kana", t: o.t, key: o.key, i, chars: writableChars(o.key) });
  }
  const el = document.createElement("div");
  el.className = "kc-modal"; el.id = "kc-modal"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true");
  el.innerHTML = `<div class="kc-sheet" id="kc-sheet"></div>`;
  el.addEventListener("click", (e) => { if (e.target === el) closeWriter(); });
  document.body.appendChild(el); document.body.classList.add("kc-lock");
  paintSheet();
}
function closeWriter(silent) {
  if (WS) { try { WS.player && WS.player.destroy(); WS.cv && WS.cv.destroy(); } catch (_) {} }
  WS = null;
  document.getElementById("kc-modal")?.remove(); document.body.classList.remove("kc-lock");
  if (!silent && P) { flush(); const f = window.__kcAfterClose; if (typeof f === "function") f(); }
}
const refOf = () => WS.kind === "kanji" ? { kind: "kanji", level: WS.level, no: WS.no } : { kind: "kana", t: WS.t, key: WS.key };

function sheetTitle() {
  if (WS.kind === "kanji") {
    const it = WS.entry;
    return `<span class="kc-big-mini">${esc(WS.key)}</span><div><b>${esc(it.arti || it.a || "")}</b><small>Kanji ${WS.level.toUpperCase()} · No.${String(WS.no).padStart(3, "0")}</small></div>`;
  }
  return `<span class="kc-big-mini">${esc(WS.key)}</span><div><b>${SCRIPT_NAME[WS.t]} · ${esc(WS.i.r)}</b><small>${esc(MODE_INFO.tabel.h)}</small></div>`;
}
function paintSheet() {
  const sh = document.getElementById("kc-sheet"); if (!sh || !WS) return;
  const hasNav = WS.list && WS.list.length > 1;
  const st = WS.kind === "kana" ? stateClass(WS.t, WS.key) : (P.kanji[WS.level]?.[WS.no]?.m ? "mastered" : P.kanji[WS.level]?.[WS.no]?.s ? "studied" : "");
  sh.innerHTML = `
    <div class="kc-sheet-head">
      ${hasNav ? `<button class="kc-ic" onclick="KC.step(-1)" aria-label="Karakter sebelumnya">‹</button>` : ""}
      <div class="kc-title">${sheetTitle()}</div>
      ${hasNav ? `<button class="kc-ic" onclick="KC.step(1)" aria-label="Karakter berikutnya">›</button>` : ""}
      <button class="kc-ic x" onclick="KC.close()" aria-label="Tutup">✕</button>
    </div>
    <div class="kc-tabs">
      <button data-tab="belajar" class="${WS.tab === "belajar" ? "on" : ""}" onclick="KC.tab('belajar')">📖 Belajar</button>
      <button data-tab="latihan" class="${WS.tab === "latihan" ? "on" : ""}" onclick="KC.tab('latihan')">✍️ Latihan menulis</button>
      <span class="kc-state ${st}">${st === "mastered" ? "★ hafal" : st === "studied" ? "● dipelajari" : ""}</span>
    </div>
    ${WS.chars.length > 1 ? `<div class="kc-chars">${WS.chars.map((c, i) => `<button class="${i === WS.ci ? "on" : ""}" onclick="KC.ch(${i})">${esc(c)}${WS.res[c] != null ? `<i>${WS.res[c]}</i>` : ""}</button>`).join("")}<small>karakter ${WS.ci + 1}/${WS.chars.length}</small></div>` : ""}
    <div class="kc-body" id="kc-body"><div class="kc-loading">Memuat goresan…</div></div>`;
  paintBody();
}
async function paintBody() {
  const body = document.getElementById("kc-body"); if (!body || !WS) return;
  const tok = WS.token = Date.now() + Math.random();
  try { WS.player && WS.player.destroy(); WS.cv && WS.cv.destroy(); } catch (_) {}
  WS.player = WS.cv = null;
  if (!WS.chars.length) {
    body.innerHTML = `<div class="kc-err">Entri “${esc(WS.key)}” tidak mengandung huruf Jepang yang bisa ditulis (kanji/hiragana/katakana).</div>`; return;
  }
  const ch = WS.chars[WS.ci];
  try { WS.glyph = await loadGlyph(ch); }
  catch (e) { if (tok === WS.token) body.innerHTML = `<div class="kc-err">${esc(e.message)}<br><button class="btn sm" onclick="KC.retry()">↻ Coba lagi</button></div>`; return; }
  if (!WS || tok !== WS.token) return;
  markStudied(refOf());
  document.querySelector(".kc-state")?.classList.add("studied");
  if (WS.tab === "belajar") bodyBelajar(); else bodyLatihan();
}
function metaHtml(withWord = true) {
  if (WS.kind === "kanji") {
    const it = WS.entry, on = it.onyomi || it.on || "", kun = it.kunyomi || it.kun || "", arti = it.arti || it.a || "", kana = it.kana || "";
    const contoh = (it.c || []).slice(0, 4);
    return `<div class="kc-meta">
      <div class="kc-glyphtxt">${esc(WS.key)}</div>
      <div class="kc-arti">${esc(arti)}</div>
      <div class="kc-read">${on ? `<div><span>Onyomi</span>${esc(on)}</div>` : ""}${kun ? `<div><span>Kunyomi</span>${esc(kun)}</div>` : ""}${kana && !on && !kun ? `<div><span>Bacaan</span>${esc(kana)}</div>` : ""}</div>
      <div class="kc-strokes">Jumlah goresan: <b>${WS.glyph.s.length}</b>${WS.chars.length > 1 ? ` (karakter “${esc(WS.chars[WS.ci])}”)` : ""}</div>
      ${withWord && contoh.length ? `<div class="kc-ex"><h4>Contoh kosakata</h4>${contoh.map(c => `<div><b>${esc(c.k)}</b> <small>${esc(c.r || "")}</small> — ${esc(c.a || "")}</div>`).join("")}</div>` : ""}
    </div>`;
  }
  const i = WS.i;
  return `<div class="kc-meta">
    <div class="kc-glyphtxt">${esc(WS.key)}</div>
    <div class="kc-read"><div><span>Romaji</span><b class="big">${esc(i.r.toUpperCase())}</b></div></div>
    <div class="kc-howto"><span>Cara membaca</span>${esc(i.bc)}</div>
    <div class="kc-strokes">Jumlah goresan: <b>${WS.glyph.s.length}</b>${WS.chars.length > 1 ? ` (karakter “${esc(WS.chars[WS.ci])}”)` : ""}</div>
    ${withWord ? (i.w ? `<div class="kc-ex"><h4>Contoh kata</h4><div><b class="jpw">${esc(i.w)}</b> <small>${esc(i.wr)}</small> — ${esc(i.wa)}</div></div>` : `<div class="kc-ex"><h4>Contoh kata</h4><div><small>Karakter ini jarang dipakai sebagai kata tersendiri.</small></div></div>`) : ""}
  </div>`;
}
function bodyBelajar() {
  const body = document.getElementById("kc-body");
  body.innerHTML = `
    <div class="kc-left">
      <div class="kc-stage" id="kc-stage"></div>
      <div class="kc-ctrl">
        <button id="kc-pp" class="btn sm" onclick="KC.pp()">⏸ Jeda</button>
        <button class="btn sm ghost" onclick="KC.replay()">↻ Ulangi animasi</button>
        <button class="btn sm ghost" onclick="KC.final()">⏭ Hasil akhir</button>
      </div>
      <div class="kc-ctrl">
        <div class="kc-seg" id="kc-sp"><button data-sp="0.5" onclick="KC.speed(0.5)">🐢 Pelan</button><button data-sp="1" class="on" onclick="KC.speed(1)">Normal</button><button data-sp="2" onclick="KC.speed(2)">🚀 Cepat</button></div>
        <label class="kc-chk"><input type="checkbox" id="kc-num" checked onchange="KC.nums(this.checked)"> Nomor goresan</label>
      </div>
    </div>
    <div class="kc-right">
      ${metaHtml(true)}
      <div class="kc-actions">
        <button class="btn" onclick="KC.tab('latihan')">✍️ 書いてみよう — latihan menulis</button>
        <button class="btn ghost" onclick="KC.sayNow()">🔊 Dengarkan</button>
        <button class="btn ghost" id="kc-hafal" onclick="KC.toggleHafal()">${isMastered() ? "★ Sudah hafal (klik untuk batal)" : "☆ Tandai sudah hafal"}</button>
      </div>
    </div>`;
  WS.player = createPlayer(document.getElementById("kc-stage"), WS.glyph, {
    speed: WS.speed || 1, numbers: WS.numbers !== false,
    onState: (s) => { const b = document.getElementById("kc-pp"); if (b) b.textContent = s.playing ? "⏸ Jeda" : (s.done ? "▶ Putar lagi" : "▶ Lanjut"); WS.speed = s.speed; WS.numbers = s.numbers; },
  });
  const sp = WS.speed || 1; document.querySelectorAll("#kc-sp button").forEach(b => b.classList.toggle("on", +b.dataset.sp === sp));
  const cb = document.getElementById("kc-num"); if (cb) cb.checked = WS.numbers !== false;
  WS.player.play();
}
const isMastered = () => WS.kind === "kanji" ? !!P.kanji[WS.level]?.[WS.no]?.m : !!P[WS.t][WS.key]?.m;

function bodyLatihan() {
  const body = document.getElementById("kc-body"), m = WS.mode, g = WS.glyph;
  const memoQ = WS.kind === "kanji" ? `${esc(WS.entry.arti || WS.entry.a || "")}${WS.entry.kana ? `<br><small>${esc(WS.entry.kana)}</small>` : ""}` : `bunyi «${esc(WS.i.r.toUpperCase())}»`;
  const left = m === "memory"
    ? `<div class="kc-memo"><div class="lab">Tulis dari ingatan</div><div class="q">${memoQ}</div><div class="kc-hint">Contoh disembunyikan. Setelah selesai tekan “Cek hasil” untuk membandingkan.</div></div>`
    : m === "copy"
      ? `<div class="kc-stage small">${glyphSvg(g, { numbers: true })}</div><div class="kc-hint">Tiru karakter di samping pada kotak tulis. Perhatikan nomor dan urutan goresan.</div>`
      : `<div class="kc-stage small">${glyphSvg(g, { numbers: true })}</div><div class="kc-hint">Ikuti bayangan di kotak tulis. <b style="color:#16a34a">Titik hijau</b> = awal goresan, <b style="color:#ef6a9a">panah</b> = arah. Nomor muncul bertahap.</div>`;
  body.innerHTML = `
    <div class="kc-left kc-prac-left"><div class="kc-prac-ex">${left}</div>${m !== "memory" ? metaHtml(false) : ""}</div>
    <div class="kc-right">
      <div class="kc-seg modes" id="kc-modes">
        <button data-m="trace" class="${m === "trace" ? "on" : ""}" onclick="KC.mode('trace')">Trace</button>
        <button data-m="copy" class="${m === "copy" ? "on" : ""}" onclick="KC.mode('copy')">Copy</button>
        <button data-m="memory" class="${m === "memory" ? "on" : ""}" onclick="KC.mode('memory')">Memory</button>
      </div>
      <div class="kc-canvas-host" id="kc-cv"></div>
      <div class="kc-scount" id="kc-sc"></div>
      <div class="kc-cvctrl">
        <button class="btn sm ghost" onclick="KC.undo()">↶ Hapus</button>
        <button class="btn sm ghost" onclick="KC.clear()">↻ Ulangi</button>
        <button class="btn sm ghost" onclick="KC.peek()">👁 Tampilkan contoh</button>
        <button class="btn sm" onclick="KC.check()">✓ Cek hasil</button>
      </div>
      <div id="kc-res"></div>
    </div>`;
  WS.cv = new WriteCanvas(document.getElementById("kc-cv"), { onChange: updateCount });
  WS.cv.setMode(m); WS.cv.setGlyph(g); updateCount();
}
function updateCount() {
  const el = document.getElementById("kc-sc"); if (!el || !WS?.cv) return;
  el.innerHTML = `Goresan: <b>${WS.cv.strokes.length}</b> / ${WS.glyph.s.length}`;
}
function showResult() {
  const cv = WS.cv; if (!cv) return;
  if (!cv.strokes.length) { toast("Tulis dulu karakternya, baru tekan Cek hasil"); return; }
  const r = cv.result(), ch = WS.chars[WS.ci];
  WS.res[ch] = r.total;
  const o = WS.kind === "kanji" ? kj(WS.level, WS.no) : pk(WS.t, WS.key);
  o.wr = (o.wr || 0) + 1; o.bs = Math.max(o.bs || 0, r.total); o.s = 1; touch();
  const cls = r.total >= 80 ? "good" : r.total >= 60 ? "fair" : "poor";
  const parts = [["Bentuk", r.parts.bentuk], ["Arah goresan", r.parts.arah], ["Urutan goresan", r.parts.urutan], ["Posisi karakter", r.parts.posisi], ["Kemiripan tulisan", r.parts.kemiripan]];
  const last = WS.ci >= WS.chars.length - 1;
  const memo = WS.mode === "memory";
  document.getElementById("kc-res").innerHTML = `
    <div class="kc-result">
      <div class="kc-score ${cls}"><div class="n">${r.total}</div><div><b>${esc(r.label)}</b><small>perkiraan otomatis${cv.hintUsed ? " · contoh dilihat" : ""}</small></div></div>
      <div class="kc-parts">${parts.map(([n, v]) => `<div><span>${n}</span>${bar(v, v >= 75 ? "ok" : v >= 50 ? "mid" : "low")}<em>${v}</em></div>`).join("")}</div>
      <ul class="kc-tips">${r.tips.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
      <div class="kc-cmp">
        <figure>${compareSvg(cv.strokes, WS.glyph, r)}<figcaption>Tulisanmu <small>(hijau baik · oranye cukup · merah kurang)</small></figcaption></figure>
        <figure>${glyphSvg(WS.glyph, { numbers: true })}<figcaption>Contoh yang benar</figcaption></figure>
      </div>
      <p class="kc-disc">ℹ️ Nilai ini <b>perkiraan geometris</b> (bentuk, arah, urutan, posisi) terhadap data goresan KanjiVG — <b>bukan</b> pengenalan tulisan tangan. Gunakan perbandingan visual di atas untuk menilai sendiri.</p>
      <div class="kc-cvctrl">
        <button class="btn sm ghost" onclick="KC.clear()">↻ Coba lagi</button>
        ${memo ? `<button class="btn sm ghost" onclick="KC.selfMark(true)">★ Aku sudah hafal</button><button class="btn sm ghost" onclick="KC.selfMark(false)">Belum hafal</button>` : ""}
        ${!last ? `<button class="btn sm" onclick="KC.ch(${WS.ci + 1})">Karakter berikutnya ›</button>` : (WS.list && WS.list.length > 1 ? `<button class="btn sm" onclick="KC.step(1)">Berikutnya ›</button>` : "")}
      </div>
    </div>`;
  document.getElementById("kc-res").scrollIntoView({ block: "nearest", behavior: "smooth" });
  const chip = document.querySelectorAll(".kc-chars button")[WS.ci]; if (chip) { chip.querySelector("i")?.remove(); chip.insertAdjacentHTML("beforeend", `<i>${r.total}</i>`); }
}

/* ============================== FLASHCARD ============================== */
const INTERVAL = [0, 1, 2, 4, 8, 16];
const FC = { script: "hira", secs: ["gojuon", "dakuten", "handakuten", "youon"], newPer: 10, rare: false, q: [], i: 0, shown: false, ok: 0, ng: 0, rep: 0, seen: new Set(), t0: 0, mode: "srs", phase: "setup" };
export async function renderKanaHafalan() {
  await Promise.all([loadKana(), ensureProgress()]);
  FC.phase = "setup";
  setTimeout(paintFlash, 0);
  return `<div class="kc-wrap">${crumbs("文字を覚えよう")}
    <div class="kc-head compact"><div class="jp">文字を覚えよう</div><h1>Hafalan Karakter</h1><p>Flashcard dengan pengulangan berjarak: karakter yang belum hafal muncul lebih sering.</p></div>
    <div class="kc-panel" id="kc-flash"></div></div>`;
}
function fcPool() {
  const scripts = FC.script === "both" ? ["hira", "kata"] : [FC.script];
  const out = [];
  for (const t of scripts) {
    const secIds = FC.secs.filter(id => sections(t).some(s => s.id === id));
    for (const k of keysOf(t, secIds.length ? secIds : null, !FC.rare)) out.push({ t, k });
  }
  return out;
}
function fcCounts() {
  const now = Date.now(), pool = fcPool();
  const due = pool.filter(c => { const o = P[c.t][c.k]; return o && o.n > 0 && o.due <= now; });
  const fresh = pool.filter(c => { const o = P[c.t][c.k]; return !o || !o.n; });
  const ok = pool.filter(c => P[c.t][c.k]?.m).length;
  return { pool, due, fresh, mastered: ok };
}
function paintFlash() {
  const host = document.getElementById("kc-flash"); if (!host) return;
  if (FC.phase === "setup") {
    const c = fcCounts(), s = (t) => stats(t);
    const secs = [...new Map(["hira", "kata"].flatMap(t => sections(t)).map(x => [x.id, x])).values()];
    const hist = P.flash.slice(-5).reverse();
    host.innerHTML = `
      <div class="kc-setup">
        <h3>Pilih set karakter</h3>
        <div class="kc-chips">${[["hira", "ひらがな Hiragana"], ["kata", "カタカナ Katakana"], ["both", "Keduanya"]].map(([v, l]) => `<button class="${FC.script === v ? "on" : ""}" onclick="KC.fcSet('script','${v}')">${l}</button>`).join("")}</div>
        <div class="kc-chips">${secs.filter(x => x.id !== "kecil").map(x => `<button class="${FC.secs.includes(x.id) ? "on" : ""}" onclick="KC.fcSec('${x.id}')">${esc(x.jp)} <small>${esc(x.nama)}</small></button>`).join("")}</div>
        <label class="kc-chk"><input type="checkbox" ${FC.rare ? "checked" : ""} onchange="KC.fcSet('rare',this.checked)"> Sertakan karakter yang jarang dipakai</label>
        <div class="kc-stats3">
          <div><b>${c.pool.length}</b><span>karakter di set ini</span></div>
          <div><b>${c.mastered}</b><span>sudah hafal</span></div>
          <div><b>${c.pool.length - c.mastered}</b><span>belum hafal</span></div>
          <div><b>${c.due.length}</b><span>waktunya diulang</span></div>
          <div><b>${c.fresh.length}</b><span>belum pernah dilihat</span></div>
          <div><b>${c.pool.length ? Math.round(100 * c.mastered / c.pool.length) : 0}%</b><span>penguasaan</span></div>
        </div>
        ${bar(c.pool.length ? 100 * c.mastered / c.pool.length : 0)}
        <div class="kc-cvctrl" style="margin-top:14px">
          <button class="btn" onclick="KC.fcStart('srs')" ${c.pool.length ? "" : "disabled"}>▶ Mulai sesi (${Math.min(c.due.length, 30) + Math.min(c.fresh.length, FC.newPer)} kartu)</button>
          <button class="btn ghost" onclick="KC.fcStart('semua')" ${c.pool.length ? "" : "disabled"}>🔀 Acak semua (${c.pool.length})</button>
          <button class="btn ghost" onclick="KC.fcStart('belum')" ${c.pool.length - c.mastered ? "" : "disabled"}>🎯 Hanya yang belum hafal</button>
        </div>
        <p class="kc-note">Sesi biasa = karakter yang sudah waktunya diulang + maksimal ${FC.newPer} karakter baru. “Sudah hafal” menunda kartu 1 → 2 → 4 → 8 → 16 hari; “Belum hafal” mengembalikannya ke awal.</p>
        ${hist.length ? `<h3>Riwayat latihan</h3><div class="kc-hist">${hist.map(h => `<div><span>${fmtTgl(h.t)}</span><b>${h.ok}/${h.n} hafal</b><small>${esc(h.label || "")}</small></div>`).join("")}</div>` : ""}
      </div>`;
    return;
  }
  if (FC.phase === "done") {
    const n = FC.ok + FC.ng;
    host.innerHTML = `<div class="kc-done"><div class="big">🎉</div><h2>Sesi selesai!</h2>
      <div class="kc-stats3"><div><b>${n}</b><span>kartu dinilai</span></div><div><b>${FC.ok}</b><span>sudah hafal</span></div><div><b>${FC.ng}</b><span>belum hafal</span></div></div>
      ${FC.ng ? `<p>Karakter yang belum hafal akan muncul lagi di sesi berikutnya.</p>` : `<p>Semua kartu di sesi ini sudah kamu kuasai. Bagus!</p>`}
      <div class="kc-cvctrl"><button class="btn" onclick="KC.fcBack()">Kembali ke pengaturan</button><button class="btn ghost" onclick="route('kana-tes')">読み方テスト ›</button><button class="btn ghost" onclick="route('kana-progres')">Lihat progres</button></div></div>`;
    return;
  }
  const c = FC.q[FC.i]; if (!c) { fcFinish(); return; }
  const inf = info(c.t, c.k), sc = pk(c.t, c.k);
  const remain = FC.q.length - FC.i;
  host.innerHTML = `
    <div class="kc-fc-top"><span>${FC.i + 1} / ${FC.q.length}</span>${bar(100 * FC.i / FC.q.length)}<button class="kc-link" onclick="KC.fcBack()">Selesai ✕</button></div>
    <div class="kc-fc ${FC.shown ? "shown" : ""}">
      <div class="kc-fc-front"><span class="kc-fc-tag">${SCRIPT_NAME[c.t]}</span><div class="ch">${esc(c.k)}</div></div>
      ${FC.shown ? `<div class="kc-fc-back">
        <div class="row"><span>Romaji</span><b class="big">${esc(inf.r.toUpperCase())}</b></div>
        <div class="row"><span>Cara membaca</span><b>${esc(inf.r)}</b></div>
        <div class="row"><span>Contoh kata</span><b class="jpw">${inf.w ? esc(inf.w) : "—"}</b>${inf.w ? `<small>${esc(inf.wr)}</small>` : ""}</div>
        <div class="row"><span>Arti</span><b>${inf.wa ? esc(inf.wa[0].toUpperCase() + inf.wa.slice(1)) : "—"}</b></div>
        <div class="how">${esc(inf.bc)}</div>
        <button class="btn sm ghost" onclick="KC.fcSay()">🔊 Dengarkan</button>
      </div>` : ""}
    </div>
    <div class="kc-fc-btns">
      ${FC.shown ? `<button class="btn ok" onclick="KC.fcGrade(true)">✅ Sudah hafal</button><button class="btn no" onclick="KC.fcGrade(false)">❌ Belum hafal</button><button class="btn ghost" onclick="KC.fcRepeat()">🔁 Ulangi</button>`
                 : `<button class="btn" onclick="KC.fcShow()">Tampilkan jawaban</button>`}
      <button class="btn ghost" onclick="KC.fcNext()">Berikutnya ➡️</button>
    </div>
    <div class="kc-fc-meta">Dilihat ${sc.n}× · ✅ ${sc.ok} · ❌ ${sc.ng} · sisa ${remain} kartu · kotak ${sc.box}/5</div>`;
}
function fcBuild(mode) {
  const now = Date.now(), c = fcCounts();
  let q;
  if (mode === "srs") q = [...shuffle(c.due).slice(0, 30), ...c.fresh.slice(0, FC.newPer)];
  else if (mode === "belum") q = shuffle(c.pool.filter(x => !P[x.t][x.k]?.m));
  else q = shuffle(c.pool);
  if (mode === "srs" && !q.length) { q = shuffle(c.pool).slice(0, 15); toast("Tidak ada kartu jatuh tempo — mengulang acak"); }
  return q;
}
function fcFinish() {
  if (FC.ok + FC.ng > 0) {
    P.flash.push({ t: Date.now(), n: FC.ok + FC.ng, ok: FC.ok, ng: FC.ng, label: `${FC.script === "both" ? "Hiragana+Katakana" : SCRIPT_NAME[FC.script]} · ${Math.round((Date.now() - FC.t0) / 1000)} dtk` });
    P.flash = P.flash.slice(-40); touch(); flush();
  }
  FC.phase = "done"; paintFlash();
}

/* ============================== TES MEMBACA ============================== */
const TQ = { jenis: "A", script: "hira", level: "basic", n: 10, qs: [], i: 0, answers: [], t0: 0, phase: "setup", locked: false };
const LEVELS = { basic: { n: "Basic", d: "Karakter dasar (gojuon)", secs: ["gojuon"] }, mid: { n: "Intermediate", d: "Dakuten & Handakuten", secs: ["dakuten", "handakuten"] }, adv: { n: "Advanced", d: "Youon & kombinasi", secs: ["youon", "asing"] }, mixed: { n: "Mixed", d: "Semua karakter", secs: ["gojuon", "dakuten", "handakuten", "youon", "asing"] } };
const JENIS = { A: "Karakter → Romaji", B: "Romaji → Karakter", C: "Membaca kata", D: "Mixed (Hiragana + Katakana)" };
export async function renderKanaTes() {
  await Promise.all([loadKana(), ensureProgress()]);
  TQ.phase = "setup";
  setTimeout(paintTest, 0);
  return `<div class="kc-wrap">${crumbs("読み方テスト")}
    <div class="kc-head compact"><div class="jp">読み方テスト</div><h1>Tes Membaca</h1><p>Pilih jenis latihan dan tingkat kesulitan. Setiap soal punya 4 pilihan, nilai otomatis, dan pembahasan.</p></div>
    <div class="kc-panel" id="kc-test"></div></div>`;
}
function tqPoolKeys(t, level) { return keysOf(t, LEVELS[level].secs, true).filter(k => info(t, k).g !== "kecil"); }
function uniqRomaji(t, keys) { const cnt = {}; keys.forEach(k => { const r = info(t, k).r; cnt[r] = (cnt[r] || 0) + 1; }); return keys.filter(k => cnt[info(t, k).r] === 1); }
function conf(t, k) { return (KD.conf[k] || "").split("").filter(c => info(t, c)); }
function mkQuestion(type, t, level, avoid) {
  const keys = tqPoolKeys(t, level);
  if (type === "A") {
    const k = rnd(keys.filter(x => !avoid.has(`A:${t}:${x}`)) .concat(keys).slice(0, Math.max(1, keys.length)));
    const ans = info(t, k).r;
    const near = conf(t, k).filter(c => keys.includes(c) && info(t, c).r !== ans).map(c => info(t, c).r);
    const others = shuffle(keys.map(c => info(t, c).r).filter(r => r !== ans && !near.includes(r)));
    const opts = shuffle([ans, ...[...new Set([...shuffle(near).slice(0, 2), ...others])].slice(0, 3)]);
    return { type, t, k, prompt: k, promptCls: "char", options: opts.map(o => o.toUpperCase()), correct: opts.indexOf(ans), expl: explain(t, k) };
  }
  if (type === "B") {
    const ukeys = uniqRomaji(t, keys), k = rnd(ukeys), ans = info(t, k).r;
    const sameRow = keys.filter(c => c !== k && info(t, c).r !== ans && (info(t, c).r[0] === ans[0] || (KD.conf[k] || "").includes(c)));
    const rest = shuffle(keys.filter(c => c !== k && info(t, c).r !== ans && !sameRow.includes(c)));
    const pickc = []; const seen = new Set([ans]);
    for (const c of [...shuffle(sameRow), ...rest]) { const r = info(t, c).r; if (!seen.has(r)) { seen.add(r); pickc.push(c); } if (pickc.length === 3) break; }
    const opts = shuffle([k, ...pickc]);
    return { type, t, k, prompt: ans.toUpperCase(), promptCls: "rom", options: opts, optCls: "char", correct: opts.indexOf(k), expl: explain(t, k) };
  }
  const words = keys.filter(c => info(t, c).w && info(t, c).wt !== false);
  const k = rnd(words), i = info(t, k), opts = shuffle([i.wr, ...i.wd]);
  return { type: "C", t, k, prompt: i.w, promptCls: "word", options: opts, correct: opts.indexOf(i.wr),
    expl: `「${i.w}」 dibaca «${i.wr}» — ${i.wa}. Karakter «${k}» dibaca «${i.r}».${conf(t, k).length ? ` Hati-hati: «${k}» mirip ${conf(t, k).map(c => `«${c}»`).join(", ")}.` : ""}` };
}
function explain(t, k) {
  const i = info(t, k), cf = conf(t, k).slice(0, 3);
  return `「${k}」 dibaca «${i.r}». ${i.bc}${cf.length ? ` Hati-hati: mirip ${cf.map(c => `«${c}» (${info(t, c).r})`).join(", ")}.` : ""}${i.w ? ` Contoh: ${i.w} (${i.wa}).` : ""}`;
}
function tqBuild() {
  const qs = [], used = new Set();
  for (let n = 0; n < TQ.n; n++) {
    let type = TQ.jenis, t = TQ.script;
    if (TQ.jenis === "D") { type = rnd(["A", "B", "C"]); t = rnd(["hira", "kata"]); }
    let q = null, tries = 0;
    while (tries++ < 25) {
      try { q = mkQuestion(type, t, TQ.level, used); } catch (e) { q = null; }
      if (q && q.correct >= 0 && q.options.length === 4 && !used.has(`${q.type}:${q.t}:${q.k}`)) break; q = null;
    }
    if (!q) { try { q = mkQuestion(type, t, TQ.level, used); } catch (e) { continue; } if (!q || q.correct < 0 || q.options.length < 4) continue; }
    used.add(`${q.type}:${q.t}:${q.k}`); qs.push(q);
  }
  return qs;
}
function paintTest() {
  const host = document.getElementById("kc-test"); if (!host) return;
  if (TQ.phase === "setup") {
    const hist = P.tes.slice(-8).reverse();
    const best = P.tes.length ? Math.max(...P.tes.map(h => h.skor)) : null;
    host.innerHTML = `<div class="kc-setup">
      <h3>Jenis latihan</h3>
      <div class="kc-chips">${Object.entries(JENIS).map(([v, l]) => `<button class="${TQ.jenis === v ? "on" : ""}" onclick="KC.tqSet('jenis','${v}')">${l}</button>`).join("")}</div>
      ${TQ.jenis !== "D" ? `<h3>Aksara</h3><div class="kc-chips">${["hira", "kata"].map(t => `<button class="${TQ.script === t ? "on" : ""}" onclick="KC.tqSet('script','${t}')">${SCRIPT_JP[t]} ${SCRIPT_NAME[t]}</button>`).join("")}</div>` : ""}
      <h3>Tingkat kesulitan</h3>
      <div class="kc-chips">${Object.entries(LEVELS).map(([v, l]) => `<button class="${TQ.level === v ? "on" : ""}" onclick="KC.tqSet('level','${v}')">${l.n} <small>${l.d}</small></button>`).join("")}</div>
      <h3>Jumlah soal</h3>
      <div class="kc-chips">${[10, 20, 30].map(n => `<button class="${TQ.n === n ? "on" : ""}" onclick="KC.tqSet('n',${n})">${n} soal</button>`).join("")}</div>
      <div class="kc-cvctrl" style="margin-top:14px"><button class="btn" onclick="KC.tqStart()">▶ Mulai tes</button></div>
      ${hist.length ? `<h3>Riwayat nilai${best != null ? ` <small>· terbaik ${best}</small>` : ""}</h3><div class="kc-hist">${hist.map(h => `<div><span>${fmtTgl(h.t)}</span><b>${h.skor}</b><small>${esc(h.jenis)} · ${esc(h.level)} · ${h.benar}/${h.total} benar · ${fmtDur(h.detik)}</small></div>`).join("")}</div>` : ""}
    </div>`;
    return;
  }
  if (TQ.phase === "done") return paintTestDone(host);
  const q = TQ.qs[TQ.i], ans = TQ.answers[TQ.i];
  host.innerHTML = `
    <div class="kc-fc-top"><span>Soal ${TQ.i + 1} / ${TQ.qs.length}</span>${bar(100 * TQ.i / TQ.qs.length)}<button class="kc-link" onclick="KC.tqQuit()">Keluar ✕</button></div>
    <div class="kc-q">
      <div class="kc-q-tag">${SCRIPT_NAME[q.t]} · ${JENIS[q.type] || ""}</div>
      <div class="kc-q-prompt ${q.promptCls}">${esc(q.prompt)}</div>
      <div class="kc-q-opts">${q.options.map((o, i) => `<button class="kc-opt ${q.optCls || ""} ${ans != null ? (i === q.correct ? "right" : i === ans ? "wrong" : "dim") : ""}" ${ans != null ? "disabled" : ""} onclick="KC.tqAnswer(${i})"><i>${"ABCD"[i]}</i><span>${esc(o)}</span></button>`).join("")}</div>
      ${ans != null ? `<div class="kc-expl ${ans === q.correct ? "ok" : "no"}"><b>${ans === q.correct ? "✅ Benar!" : "❌ Kurang tepat."}</b> ${esc(q.expl)}</div>
        <div class="kc-cvctrl"><button class="btn" onclick="KC.tqNext()">${TQ.i + 1 >= TQ.qs.length ? "Lihat hasil" : "Lanjut ›"}</button></div>` : ""}
    </div>`;
}
function paintTestDone(host) {
  const total = TQ.qs.length, benar = TQ.answers.filter((a, i) => a === TQ.qs[i].correct).length, skor = Math.round(100 * benar / total);
  const wrong = TQ.qs.map((q, i) => ({ q, a: TQ.answers[i] })).filter(x => x.a !== x.q.correct);
  host.innerHTML = `<div class="kc-done"><div class="kc-score ${skor >= 80 ? "good" : skor >= 60 ? "fair" : "poor"} big"><div class="n">${skor}</div><div><b>${benar} dari ${total} benar</b><small>${skor >= 80 ? "Sangat baik!" : skor >= 60 ? "Cukup baik — terus berlatih." : "Ayo ulangi dan hafalkan lagi."}</small></div></div>
    ${wrong.length ? `<h3>Pembahasan soal yang salah</h3><div class="kc-review">${wrong.map(({ q, a }) => `<div><div class="p"><b class="${q.promptCls}">${esc(q.prompt)}</b></div><div>Jawabanmu: <s>${esc(q.options[a] ?? "—")}</s> → benar: <b>${esc(q.options[q.correct])}</b></div><small>${esc(q.expl)}</small></div>`).join("")}</div>` : `<p>Semua jawabanmu benar. 🎉</p>`}
    <div class="kc-cvctrl"><button class="btn" onclick="KC.tqStart()">↻ Ulangi tes ini</button><button class="btn ghost" onclick="KC.tqBack()">Ubah pengaturan</button><button class="btn ghost" onclick="route('kana-progres')">Lihat progres</button></div></div>`;
}

/* ============================== PROGRES ============================== */
const _kanjiTotals = {};
async function kanjiTotal(lv) {
  if (_kanjiTotals[lv] != null) return _kanjiTotals[lv];
  const cached = S().materi?.kanji?.[lv];
  if (cached) return (_kanjiTotals[lv] = cached.length);
  try { const r = await fetch(`./data/kanji-${lv}.json`); return (_kanjiTotals[lv] = (await r.json()).length); } catch (e) { return (_kanjiTotals[lv] = 0); }
}
export async function renderKanaProgres() {
  await Promise.all([loadKana(), ensureProgress()]);
  const totals = await Promise.all(LV.map(kanjiTotal));
  const h = stats("hira"), k = stats("kata");
  const block = (t, s) => `<div class="kc-prog big">
    <div class="kc-prog-top"><b>${SCRIPT_JP[t]} ${SCRIPT_NAME[t]}</b><span>${s.pct}%</span></div>${bar(s.pct, t)}
    <div class="kc-stats3"><div><b>${s.total}</b><span>total karakter</span></div><div><b>${s.studied}</b><span>sudah dipelajari</span></div><div><b>${s.mastered}</b><span>sudah hafal</span></div><div><b>${s.unmastered}</b><span>belum hafal</span></div></div>
    <button class="btn sm ghost" onclick="route('kana-tabel/${t}')">Buka tabel</button></div>`;
  const kan = LV.map((lv, i) => {
    const m = P.kanji[lv] || {}, vals = Object.values(m), st = vals.filter(x => x.s).length, ma = vals.filter(x => x.m).length, tot = totals[i];
    const pct = tot ? Math.round(100 * ma / tot) : 0, pst = tot ? Math.round(100 * st / tot) : 0;
    return `<div class="kc-prog"><div class="kc-prog-top"><b>${lv.toUpperCase()}</b><span>${ma}/${tot} hafal · ${st} dipelajari</span></div>${bar(pst, "studied")}${bar(pct, "kanji")}<div class="kc-prog-sub">${pst}% dipelajari · ${pct}% hafal</div></div>`;
  }).join("");
  const hist = [...P.tes.map(x => ({ t: x.t, txt: `Tes ${x.jenis} (${x.level}) — nilai ${x.skor}, ${x.benar}/${x.total} benar` })), ...P.flash.map(x => ({ t: x.t, txt: `Hafalan — ${x.ok}/${x.n} hafal (${x.label || ""})` }))].sort((a, b) => b.t - a.t).slice(0, 10);
  return `<div class="kc-wrap">${crumbs("Progres")}
    <div class="kc-head compact"><div class="jp">進捗</div><h1>Progres Belajar Menulis</h1><p>Disimpan per akun. Jika kamu keluar lalu masuk lagi, progres tetap ada.</p></div>
    <div class="kc-panel"><h2>Hiragana &amp; Katakana</h2><div class="kc-prog2">${block("hira", h)}${block("kata", k)}</div></div>
    <div class="kc-panel"><h2>Kanji</h2><div class="kc-prog5">${kan}</div>
      <p class="kc-note">Kanji dihitung per level bank Kanji Shirose. N3 berisi kata majemuk — tiap entri dilatih per karakter. “Dipelajari” = sudah membuka detail/animasi/latihan; “hafal” = ditandai sudah hafal.</p></div>
    <div class="kc-panel"><h2>Riwayat latihan</h2>${hist.length ? `<div class="kc-hist">${hist.map(x => `<div><span>${fmtTgl(x.t)}</span><b>${esc(x.txt)}</b></div>`).join("")}</div>` : `<div class="kc-note">Belum ada riwayat. Coba <a class="kc-link" onclick="route('kana-hafalan')">hafalan</a> atau <a class="kc-link" onclick="route('kana-tes')">tes membaca</a>.</div>`}</div>
    ${isGuest() ? `<p class="kc-note">Mode tamu: progres hanya di perangkat ini.</p>` : ""}
  </div>`;
}

/* ============================== KANJI hooks ============================== */
export function kanjiState(level, no) { const o = P?.kanji?.[level]?.[no]; return o ? (o.m ? "mastered" : o.s ? "studied" : "") : ""; }
export function kanjiCounts(level) { const v = Object.values(P?.kanji?.[level] || {}); return { studied: v.filter(x => x.s).length, mastered: v.filter(x => x.m).length }; }

/* ============================== API global ============================== */
const KC = window.KC = {
  /* tabel */
  script(t) { TS.t = t; if (!sections(t).some(s => s.id === TS.sec)) TS.sec = "gojuon"; paintTable(); },
  sec(id) { TS.sec = id; paintTable(); },
  /* writer */
  open(t, key, tab) {
    const sec = sections(t).find(s => s.id === TS.sec) || sections(t)[0];
    const list = keysOf(t, [sec.id], false).map(k => ({ t, key: k }));
    let li = list.findIndex(x => x.key === key); if (li < 0) { list.length = 0; list.push({ t, key }); li = 0; }
    openWriter({ kind: "kana", t, key, tab: tab || "belajar", list, li });
  },
  async openKanji(idx, tab) {
    await ensureProgress(); await loadKana().catch(() => {});
    const it = kanjiEntry(idx); if (!it) { toast("Data kanji belum dimuat"); return; }
    const level = S().level, no = Number.isFinite(it.no) ? it.no : idx + 1;   // sama dengan itemNo() di index.html
    openWriter({ kind: "kanji", entry: it, level, no, tab: tab || "belajar", list: null });
  },
  async openWord(idx, tab) {   // latihan menulis untuk kata di Kosakata (kanji dalam kata)
    await ensureProgress(); await loadKana().catch(() => {});
    const st = S(), it = (st.materi?.kosakata?.[st.level] || [])[idx]; if (!it) { toast("Data kosakata belum dimuat"); return; }
    const kata = it.kata || it.k || "";
    if (!writableChars(kata).some(c => c.codePointAt(0) >= 0x3400)) { toast("Kata ini tidak berisi kanji"); return; }
    const no = 100000 + (Number.isFinite(it.no) ? it.no : idx + 1);   // jauh dari nomor kanji agar progres tidak bentrok
    openWriter({ kind: "kanji", entry: { kanji: kata, kana: it.kana || it.f || "", arti: it.arti || it.a || "" }, level: st.level, no, tab: tab || "latihan", list: null });
  },
  close() { closeWriter(); },
  step(d) {
    if (!WS || !WS.list) return;
    const n = WS.list.length, li = (WS.li + d + n) % n, x = WS.list[li], tab = WS.tab, mode = WS.mode;
    openWriter({ kind: "kana", t: x.t, key: x.key, tab, mode, list: WS.list, li });
  },
  tab(t) { if (!WS) return; WS.tab = t; paintSheet(); },
  ch(i) { if (!WS || i < 0 || i >= WS.chars.length) return; WS.ci = i; paintSheet(); },
  retry() { paintBody(); },
  mode(m) { if (!WS) return; WS.mode = m; paintBody(); },
  pp() { WS?.player?.toggle(); },
  replay() { WS?.player?.replay(); },
  final() { WS?.player?.final(); },
  speed(v) { if (!WS?.player) return; WS.player.setSpeed(v); document.querySelectorAll("#kc-sp button").forEach(b => b.classList.toggle("on", +b.dataset.sp === v)); },
  nums(v) { WS?.player?.setNumbers(v); },
  sayNow() { if (!WS) return; say(WS.kind === "kanji" ? (WS.entry.kana || WS.key) : WS.key); },
  toggleHafal() {
    if (!WS) return; const v = !isMastered(); markMastered(refOf(), v);
    const b = document.getElementById("kc-hafal"); if (b) b.textContent = v ? "★ Sudah hafal (klik untuk batal)" : "☆ Tandai sudah hafal";
    const s = document.querySelector(".kc-state"); if (s) { s.className = "kc-state " + (v ? "mastered" : "studied"); s.textContent = v ? "★ hafal" : "● dipelajari"; }
    toast(v ? "★ Ditandai sudah hafal" : "Ditandai belum hafal");
  },
  selfMark(v) { if (!WS) return; markMastered(refOf(), v); toast(v ? "★ Ditandai sudah hafal" : "Oke, terus berlatih!"); const s = document.querySelector(".kc-state"); if (s) { s.className = "kc-state " + (v ? "mastered" : "studied"); s.textContent = v ? "★ hafal" : "● dipelajari"; } },
  /* kanvas */
  undo() { WS?.cv?.undo(); },
  clear() { if (WS?.cv) { WS.cv.clear(); const r = document.getElementById("kc-res"); if (r) r.innerHTML = ""; } },
  peek() { WS?.cv?.peek(); },
  check() { showResult(); },
  /* flashcard */
  fcSet(k, v) { FC[k] = v; paintFlash(); },
  fcSec(id) { const i = FC.secs.indexOf(id); if (i >= 0) { if (FC.secs.length > 1) FC.secs.splice(i, 1); } else FC.secs.push(id); paintFlash(); },
  fcStart(mode) { FC.q = fcBuild(mode); if (!FC.q.length) { toast("Tidak ada kartu untuk set ini"); return; } Object.assign(FC, { i: 0, shown: false, ok: 0, ng: 0, rep: 0, t0: Date.now(), phase: "run", mode }); paintFlash(); },
  fcShow() { FC.shown = true; paintFlash(); },
  fcSay() { const c = FC.q[FC.i]; if (c) say(info(c.t, c.k).w || c.k); },
  fcGrade(ok) {
    const c = FC.q[FC.i]; if (!c) return; const o = pk(c.t, c.k), now = Date.now();
    o.n++; o.s = 1; o.t = now;
    if (ok) { o.ok++; o.box = Math.min(5, o.box + 1); o.due = now + INTERVAL[o.box] * DAY; o.m = o.box >= 3 ? 1 : 0; FC.ok++; }
    else { o.ng++; o.box = 0; o.due = now; o.m = 0; FC.ng++; FC.q.splice(Math.min(FC.q.length, FC.i + 5), 0, { t: c.t, k: c.k, again: true }); }
    touch(); FC.i++; FC.shown = false; paintFlash();
  },
  fcRepeat() { const c = FC.q[FC.i]; if (!c) return; FC.rep++; FC.q.splice(Math.min(FC.q.length, FC.i + 4), 0, { t: c.t, k: c.k, again: true }); FC.i++; FC.shown = false; paintFlash(); },
  fcNext() { FC.i++; FC.shown = false; paintFlash(); },
  fcBack() { if (FC.phase === "run" && FC.ok + FC.ng > 0) { fcFinish(); FC.phase = "setup"; } FC.phase = "setup"; paintFlash(); },
  /* tes */
  tqSet(k, v) { TQ[k] = v; paintTest(); },
  tqStart() {
    TQ.qs = tqBuild();
    if (TQ.qs.length < 4) { toast("Soal belum cukup untuk pengaturan ini"); return; }
    Object.assign(TQ, { i: 0, answers: [], t0: Date.now(), phase: "run" }); paintTest();
  },
  tqAnswer(i) { if (TQ.answers[TQ.i] != null) return; TQ.answers[TQ.i] = i; const q = TQ.qs[TQ.i]; const o = pk(q.t, q.k); if (q.type !== "C") { o.s = 1; touch(); } paintTest(); },
  tqNext() {
    if (TQ.i + 1 >= TQ.qs.length) {
      const total = TQ.qs.length, benar = TQ.answers.filter((a, i) => a === TQ.qs[i].correct).length;
      P.tes.push({ t: Date.now(), jenis: TQ.jenis === "D" ? "Mixed" : JENIS[TQ.jenis], level: LEVELS[TQ.level].n, script: TQ.jenis === "D" ? "both" : TQ.script, skor: Math.round(100 * benar / total), benar, total, detik: Math.round((Date.now() - TQ.t0) / 1000) });
      P.tes = P.tes.slice(-50); touch(); flush(); TQ.phase = "done";
    } else TQ.i++;
    paintTest();
  },
  tqQuit() { TQ.phase = "setup"; paintTest(); },
  tqBack() { TQ.phase = "setup"; paintTest(); },
  ensure: ensureProgress, kanjiState, kanjiCounts, flush,
};
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest("[data-kc-k]");
  if (b) { e.preventDefault(); KC.open(b.dataset.kcT, b.dataset.kcK, b.dataset.kcTab); }
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && WS) closeWriter(); });
window.addEventListener("hashchange", () => { if (WS) closeWriter(true); });
/* ============================== LATIHAN BACA 200 KATA ============================== */
let BACA = null; const KB = { t: "hira", set: "all", mode: "kartu", list: [], i: 0, show: false, sc: { ok: 0, ng: 0 }, pick: null };
async function loadBaca() { if (BACA) return BACA; const r = await fetch("./data/kana-baca.json?v=20261111n"); if (!r.ok) throw new Error("Data latihan baca belum tersedia"); BACA = await r.json(); return BACA; }
const bst = (t, k) => { const o = P.baca[t][k]; return !o ? "baru" : (o.ok >= 2 && o.last === 1) ? "kuasa" : o.last === 1 ? "bisa" : "belum"; };
function bacaPool() { const all = BACA[KB.t]; if (KB.set === "all") return all; if (KB.set === "belum") return all.filter(w => { const s = bst(KB.t, w.k); return s === "baru" || s === "belum"; }); const n = +KB.set; return all.slice(n * 20, n * 20 + 20); }
export async function renderKanaBaca([t]) {
  await Promise.all([loadBaca(), ensureProgress()]);
  if (t === "hira" || t === "kata") KB.t = t;
  KB.list = []; KB.i = 0; KB.show = false; KB.sc = { ok: 0, ng: 0 }; KB.set = KB.set || "all";
  const all = BACA[KB.t], ku = all.filter(w => bst(KB.t, w.k) === "kuasa").length, ada = all.filter(w => bst(KB.t, w.k) !== "baru").length;
  const sets = Array.from({ length: 10 }, (_, n) => `<button class="${KB.set === String(n) ? "on" : ""}" onclick="KC.bacaSet('${n}')">${n * 20 + 1}–${n * 20 + 20}</button>`).join("");
  return `<div class="kc-wrap">${crumbs("Latihan baca")}
    <div class="kc-head"><div class="jp">${KB.t === "hira" ? "ひらがな" : "カタカナ"} 読み練習</div><h1>Latihan Baca ${all.length} Kata ${SCRIPT_NAME[KB.t]}</h1>
      <p>Baca kata di layar, lalu cek bacaan dan artinya. ${KB.t === "hira" ? "Semua kata ditulis hanya dengan hiragana." : "Kata serapan yang mudah, ditulis dengan katakana."}</p></div>
    <div class="kc-panel">
      <div class="kc-seg" style="display:flex;gap:8px;margin-bottom:10px"><button class="${KB.t === "hira" ? "on" : ""}" onclick="route('kana-baca/hira')">ひらがな Hiragana</button><button class="${KB.t === "kata" ? "on" : ""}" onclick="route('kana-baca/kata')">カタカナ Katakana</button></div>
      <div class="kc-prog-sub">${ku} dikuasai · ${ada} sudah dicoba · dari ${all.length} kata</div>
      <h3 style="margin:12px 0 6px">Pilih kelompok</h3>
      <div class="kc-chips"><button class="${KB.set === "all" ? "on" : ""}" onclick="KC.bacaSet('all')">Semua ${all.length}</button><button class="${KB.set === "belum" ? "on" : ""}" onclick="KC.bacaSet('belum')">Belum dikuasai</button>${sets}</div>
      <div class="kc-chips"><button class="${KB.mode === "kartu" ? "on" : ""}" onclick="KC.bacaMode('kartu')">🃏 Baca &amp; cek</button><button class="${KB.mode === "pilih" ? "on" : ""}" onclick="KC.bacaMode('pilih')">✅ Pilih bacaan (romaji)</button><button class="${KB.mode === "daftar" ? "on" : ""}" onclick="KC.bacaMode('daftar')">📋 Daftar kata</button></div>
      <button class="btn sw-big" onclick="KC.bacaMulai()">MULAI ›</button>
      <p class="kc-note"><a class="kc-link" onclick="route('kana-aturan')">Bingung ゛ ゜ っ ー? Baca penjelasannya ›</a></p>
    </div><div id="kb-root"></div></div>`;
}
const bacaDraw = () => {
  const root = document.getElementById("kb-root"); if (!root) return;
  if (KB.mode === "daftar") {
    const L = bacaPool(); const ico = { baru: "", belum: "🔸", bisa: "✅", kuasa: "🏆" };
    root.innerHTML = `<div class="kc-panel"><h3>${L.length} kata</h3><div class="kb-list">${L.map(w => `<button class="kb-row" onclick="KC.sayKata('${w.k}')"><b class="kb-w">${w.k}</b><span class="kb-r">${w.r}</span><span class="kb-a">${esc(w.a)}</span><span>${ico[bst(KB.t, w.k)]}</span></button>`).join("")}</div><p class="kc-note">Ketuk baris untuk mendengar suaranya.</p></div>`; return;
  }
  if (KB.i >= KB.list.length) {
    root.innerHTML = `<div class="kc-panel kb-end"><div style="font-size:42px">${KB.sc.ok >= KB.list.length * 0.8 ? "🏆" : "👍"}</div><h2>Selesai!</h2><p>${KB.sc.ok} bisa · ${KB.sc.ng} belum dari ${KB.list.length} kata.</p><button class="btn sw-big" onclick="KC.bacaMulai()">Ulangi ›</button></div>`; return;
  }
  const w = KB.list[KB.i], pct = Math.round(KB.i / KB.list.length * 100);
  let body;
  if (KB.mode === "kartu") {
    body = KB.show ? `<div class="kb-ans"><div class="kb-rom">${w.r}</div><div class="kb-ar">${esc(w.a)}</div><button class="kc-chip" onclick="KC.sayKata('${w.k}')">🔊 Dengar</button></div>
      <div class="kb-btns"><button class="btn ghost" onclick="KC.bacaNilai(0)">✕ Belum bisa</button><button class="btn gold" onclick="KC.bacaNilai(1)">✓ Bisa baca</button></div>`
      : `<p class="kc-note">Coba baca dulu dalam hati, lalu cek.</p><button class="btn sw-big" onclick="KC.bacaShow()">Lihat bacaan &amp; arti</button>`;
  } else {
    const opts = KB.pick || (KB.pick = (() => { const o = shuffle(BACA[KB.t].filter(x => x.r !== w.r)).slice(0, 3).map(x => x.r); o.push(w.r); return shuffle(o); })());
    body = `<div class="kb-opts">${opts.map(o => `<button class="kb-opt ${KB.show ? (o === w.r ? "ok" : KB.chosen === o ? "ng" : "") : ""}" ${KB.show ? "disabled" : ""} onclick="KC.bacaPilih('${o}')">${o}</button>`).join("")}</div>
      ${KB.show ? `<div class="kb-ans"><div class="kb-ar">${esc(w.a)}</div><button class="kc-chip" onclick="KC.sayKata('${w.k}')">🔊 Dengar</button></div><button class="btn gold" onclick="KC.bacaNext()">Lanjut →</button>` : ""}`;
  }
  root.innerHTML = `<div class="kc-panel kb-card"><div class="kb-top"><span>${KB.i + 1} / ${KB.list.length}</span><div class="kb-bar"><i style="width:${pct}%"></i></div></div><div class="kb-word">${w.k}</div>${body}</div>`;
};
function bacaRecord(w, ok) {
  const o = P.baca[KB.t][w.k] || (P.baca[KB.t][w.k] = { ok: 0, ng: 0 }); if (ok) o.ok++; else o.ng++; o.last = ok ? 1 : 0; o.ts = Date.now(); touch();
  if (ok) KB.sc.ok++; else KB.sc.ng++;
  if (ok && window.awardXP) window.awardXP(2, 1);   // koin & XP langsung bertambah tiap bacaan benar
}
Object.assign(KC, {
  bacaSet(v) { KB.set = v; const h = location.hash; route(h.replace(/^#/, "")); },
  bacaMode(m) { KB.mode = m; if (m === "daftar") { bacaDraw(); } else route(location.hash.replace(/^#/, "")); },
  bacaMulai() { KB.list = shuffle(bacaPool()); KB.i = 0; KB.show = false; KB.pick = null; KB.chosen = null; KB.sc = { ok: 0, ng: 0 }; if (!KB.list.length) { toast("Tidak ada kata di kelompok ini"); return; } bacaDraw(); document.getElementById("kb-root")?.scrollIntoView({ behavior: "smooth", block: "start" }); },
  bacaShow() { KB.show = true; bacaDraw(); },
  bacaNilai(ok) { bacaRecord(KB.list[KB.i], ok); KB.i++; KB.show = false; bacaDraw(); },
  bacaPilih(o) { const w = KB.list[KB.i]; KB.chosen = o; KB.show = true; bacaRecord(w, o === w.r); bacaDraw(); },
  bacaNext() { KB.i++; KB.show = false; KB.pick = null; KB.chosen = null; bacaDraw(); },
  sayKata(k) { say(k); },
  sayText(t) { say(t); },
});

/* ============================== ATURAN: ゛ ゜ っ ー ============================== */
const eg = (k, r, a) => `<button class="kb-eg" onclick="KC.sayText('${k}')"><b>${k}</b><span>${r}</span><small>${a}</small></button>`;
export async function renderKanaAturan() {
  return `<div class="kc-wrap">${crumbs("Tanda khusus")}
    <div class="kc-head"><div class="jp">濁点・半濁点・促音・長音</div><h1>Ten-ten, Maru, っ kecil &amp; Garis panjang</h1><p>Empat tanda kecil yang mengubah bunyi. Ketuk contoh untuk mendengar suaranya.</p></div>

    <div class="kc-panel kb-rule"><h2>① Ten-ten ゛ <small>(dakuten 濁点)</small></h2>
      <p>Dua titik kecil di kanan atas huruf membuat bunyinya <b>menjadi bersuara (lebih "berat")</b>.</p>
      <div class="kb-map"><span>か ka → <b>が ga</b></span><span>さ sa → <b>ざ za</b></span><span>た ta → <b>だ da</b></span><span>は ha → <b>ば ba</b></span></div>
      <div class="kb-map"><span>き→<b>ぎ</b> gi</span><span>し→<b>じ</b> ji</span><span>ち→<b>ぢ</b> ji</span><span>く→<b>ぐ</b> gu</span><span>す→<b>ず</b> zu</span><span>つ→<b>づ</b> zu</span></div>
      <p class="kc-note">じ/ぢ dan ず/づ bunyinya sama; yang dipakai sehari-hari adalah じ dan ず. Katakana sama: カ→ガ, ハ→バ.</p>
      <div class="kb-egs">${eg("がっこう", "gakkou", "sekolah")}${eg("だいがく", "daigaku", "universitas")}${eg("でんしゃ", "densha", "kereta")}${eg("ごはん", "gohan", "nasi")}${eg("ぶた", "buta", "babi")}${eg("バス", "basu", "bus")}</div></div>

    <div class="kc-panel kb-rule"><h2>② Maru ゜ <small>(handakuten 半濁点)</small></h2>
      <p>Lingkaran kecil <b>hanya dipakai pada baris は (ha)</b>, mengubahnya menjadi bunyi "p".</p>
      <div class="kb-map"><span>は→<b>ぱ</b> pa</span><span>ひ→<b>ぴ</b> pi</span><span>ふ→<b>ぷ</b> pu</span><span>へ→<b>ぺ</b> pe</span><span>ほ→<b>ぽ</b> po</span></div>
      <p class="kc-note">Bandingkan: は ha → ば ba (ten-ten) → ぱ pa (maru). Katakana: ハ→バ→パ.</p>
      <div class="kb-egs">${eg("ぱん", "pan", "roti")}${eg("えんぴつ", "enpitsu", "pensil")}${eg("さんぽ", "sanpo", "jalan-jalan")}${eg("てんぷら", "tenpura", "tempura")}${eg("ペン", "pen", "pena")}${eg("パン", "pan", "roti")}</div></div>

    <div class="kc-panel kb-rule"><h2>③ っ / ッ kecil <small>(sokuon 促音)</small></h2>
      <p>Huruf <b>tsu ditulis kecil</b> tidak dibaca "tsu". Ia berarti <b>jeda singkat</b> lalu konsonan sesudahnya <b>diucapkan dua kali</b> (ditahan sebentar).</p>
      <div class="kb-map"><span>き<b>っ</b>て → ki<b>t</b>te</span><span>ざ<b>っ</b>し → za<b>s</b>shi</span><span>が<b>っ</b>こう → ga<b>k</b>kou</span><span>い<b>っ</b>ぱい → i<b>p</b>pai</span></div>
      <p class="kc-note">Dalam tulisan mendatar, っ kecil ada di kanan bawah. Panjang bunyi berbeda arti: きて <i>kite</i> "datanglah" vs きって <i>kitte</i> "perangko". Katakana memakai ッ: ベッド beddo, ロッカー rokkā.</p>
      <div class="kb-egs">${eg("きって", "kitte", "perangko")}${eg("ざっし", "zasshi", "majalah")}${eg("ちょっと", "chotto", "sebentar")}${eg("ずっと", "zutto", "terus-menerus")}${eg("ベッド", "beddo", "tempat tidur")}${eg("コップ", "koppu", "gelas")}</div></div>

    <div class="kc-panel kb-rule"><h2>④ Garis panjang ー <small>(chōonpu 長音符)</small></h2>
      <p>Di <b>katakana</b>, tanda <b>ー</b> memanjangkan vokal sebelumnya (bunyi dibaca dua ketukan).</p>
      <div class="kb-map"><span>コ<b>ー</b>ヒー → kōhī</span><span>ビ<b>ー</b>ル → bīru</span><span>ラ<b>ー</b>メン → rāmen</span><span>ケ<b>ー</b>キ → kēki</span></div>
      <p>Di <b>hiragana</b> tidak ada ー; vokal panjang ditulis dengan menambah huruf vokal:</p>
      <div class="kb-map"><span>あ段 + <b>あ</b>: おかあさん okaasan</span><span>い段 + <b>い</b>: おにいさん oniisan</span><span>う段 + <b>う</b>: ゆうめい yuumei</span><span>え段 + <b>い/え</b>: せんせい sensei, おねえさん oneesan</span><span>お段 + <b>う/お</b>: とうきょう toukyou, おおきい ookii</span></div>
      <p class="kc-note">Panjang pendek mengubah arti: おばさん (bibi) vs おばあさん (nenek); おじさん (paman) vs おじいさん (kakek); ビル (gedung) vs ビール (bir).</p>
      <div class="kb-egs">${eg("コーヒー", "kōhī", "kopi")}${eg("ビール", "bīru", "bir")}${eg("ラーメン", "rāmen", "ramen")}${eg("おかあさん", "okaasan", "ibu")}${eg("おばあさん", "obaasan", "nenek")}${eg("ゆうめい", "yuumei", "terkenal")}</div></div>

    <div class="kc-panel"><h2>Bonus: ゃ ゅ ょ kecil <small>(youon 拗音)</small></h2>
      <p>Ya/yu/yo kecil menggabung dengan huruf sebelumnya menjadi <b>satu suku kata</b>: き+ゃ → <b>kya</b>, し+ゅ → <b>shu</b>, ち+ょ → <b>cho</b>.</p>
      <div class="kb-egs">${eg("しゃしん", "shashin", "foto")}${eg("きょう", "kyou", "hari ini")}${eg("じゅう", "juu", "sepuluh")}${eg("りょうり", "ryouri", "masakan")}</div>
      <button class="btn sw-big" onclick="route('kana-baca/hira')">Latihan baca 200 kata ›</button></div>
  </div>`;
}
export const KANA_ROUTES = {
  "kana-baca": (p) => renderKanaBaca(p),
  "kana-aturan": () => renderKanaAturan(),
  kana: () => renderKanaHub(),
  "kana-tabel": (p) => renderKanaTabel(p, "tabel"),
  "kana-order": (p) => renderKanaTabel(p, "order"),
  "kana-tulis": (p) => renderKanaTabel(p, "tulis"),
  "kana-hafalan": () => renderKanaHafalan(),
  "kana-tes": () => renderKanaTes(),
  "kana-progres": () => renderKanaProgres(),
};
