/* =====================================================================
 * MENSETSU 面接 — persiapan wawancara kerja Jepang untuk 8 bidang SSW (jawaban + koreksi AI + prompt Claude/ChatGPT)
 * ---------------------------------------------------------------------
 * Berdiri sendiri (pola sama dengan Kana Center), tidak mengubah sistem lama.
 * Route : #mensetsu, #mensetsu-bidang/{key}, #mensetsu-bank/{key},
 *         #mensetsu-persiapan/{key}, #mensetsu-hafalan/{key}, #mensetsu-prompt/{key}
 * Data  : ./data/mensetsu/{bidang}.json  (bank soal)
 * Simpan: Firestore siswa/{uid}/mensetsu_persiapan/{bidang} (+ cadangan localStorage)
 * Global: window.MS (dipakai onclick di HTML)
 * ===================================================================== */
import * as EN from "./mensetsu-engine.js";
import { initPrep, PREP_ROUTES } from "./mensetsu-prep.js";
// Akses Mensetsu = akses SSW bidang yang sama (satu sumber aturan: ssw-core.js). Versi ?v= harus sama dengan yang dipakai ssw.js.
import { initSswCore, sswAllowed, loadKelasAkses } from "./ssw-core.js?v=20261113zl";

let FB = null;
export function initMensetsu(fb) {
  FB = fb;
  initSswCore(fb);   // aman dipanggil ulang: hanya menyimpan referensi FB
  initPrep({ getFB: () => FB, esc, toast, LS, uid, isGuest, param, setPage, refresh, BIDANG, cfgGet, getProv: () => PROV, loadProviders });
}

const S = () => window.__SHIROSE_STATE || window.state || {};
const SV = () => window.SV;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const toast = (m) => (window.toast ? window.toast(m) : console.log(m));
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};
const uid = () => S().user?.uid || "guest";
const isGuest = () => !S().user || (FB && FB.isGuestUser && FB.isGuestUser());
const param = (p) => (Array.isArray(p) ? p[0] : String(p || "").split("/")[0]) || "";

/* ---------------- metadata bidang ---------------- */
const BIDANG = {
  building_cleaning: { jp: "ビルクリーニング", id: "Building Cleaning", emoji: "🧹", co: "ビルメンテナンス会社", c: ["#38bdf8", "#0e7490"] },
  kaigo: { jp: "介護", id: "Kaigo", emoji: "🤝", co: "介護施設", c: ["#f472b6", "#9d174d"] },
  food_manufacturing: { jp: "飲食料品製造業", id: "Food Manufacturing", emoji: "🏭", co: "食品工場", c: ["#fbbf24", "#b45309"] },
  food_service: { jp: "外食業", id: "Food Service", emoji: "🍜", co: "飲食店", c: ["#fb7185", "#9f1239"] },
  agriculture: { jp: "農業", id: "Agriculture", emoji: "🌾", co: "農業法人", c: ["#4ade80", "#166534"] },
  construction: { jp: "建設", id: "Construction", emoji: "🏗️", co: "建設会社", c: ["#fb923c", "#9a3412"] },
  accommodation: { jp: "宿泊", id: "Accommodation", emoji: "🏨", co: "ホテル・旅館", c: ["#a78bfa", "#5b21b6"] },
  livestock: { jp: "畜産業", id: "Livestock", emoji: "🐄", co: "畜産農家", c: ["#a3e635", "#3f6212"] },
};
const ORDER = Object.keys(BIDANG);
const MODE = {
  latihan: { jp: "練習モード", nm: "Practice", d: "AI membantu: boleh pakai bahasa Indonesia, ada contoh jawaban & koreksi singkat." },
  nyata: { jp: "本番モード", nm: "Real Interview", d: "Seperti perusahaan sungguhan: tanpa bantuan & koreksi. Penilaian di akhir." },
  lemah: { jp: "弱点克服モード", nm: "Weakness Training", d: "Fokus pada soal yang sebelumnya kurang baik (dari riwayatmu)." },
};

/* ---------------- pengaturan (disimpan per perangkat) ---------------- */
const DEF = { mode: "latihan", cats: [], n: 10, level: 0, durasi: 0, random: false, provider: "auto", sttLang: "ja-JP", autoSend: true, autoMic: true, arti: true, simpan: true, pakaiPersiapan: true };
const cfgGet = () => Object.assign({}, DEF, LS.get("shirose-mensetsu-cfg", {}));
const cfgSet = (patch) => { const c = Object.assign(cfgGet(), patch); LS.set("shirose-mensetsu-cfg", c); return c; };

/* ---------------- SVG ---------------- */
function islandSvg(key) {
  const b = BIDANG[key]; const [c1, c2] = b.c;
  return `<svg viewBox="0 0 200 140" class="ms-isl-svg" aria-hidden="true">
    <defs>
      <radialGradient id="sea-${key}" cx="50%" cy="60%" r="60%"><stop offset="0" stop-color="${c1}" stop-opacity=".38"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/></radialGradient>
      <linearGradient id="gr-${key}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    </defs>
    <ellipse cx="100" cy="98" rx="94" ry="38" fill="url(#sea-${key})"/>
    <path d="M32 96 Q100 144 168 96 Q150 120 100 122 Q50 120 32 96Z" fill="#6b4a2f"/>
    <ellipse cx="100" cy="92" rx="72" ry="27" fill="url(#gr-${key})"/>
    <ellipse cx="100" cy="87" rx="58" ry="18" fill="#fff" opacity=".13"/>
    <path d="M22 118q9-6 18 0t18 0M142 124q9-6 18 0t18 0" stroke="${c1}" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round"/>
    <text x="100" y="86" text-anchor="middle" font-size="40">${b.emoji}</text>
  </svg>`;
}
function avatarSvg() {
  return `<svg viewBox="0 0 120 120" class="ms-avatar-svg" aria-label="Pewawancara">
    <circle cx="60" cy="60" r="58" fill="#1b2347"/>
    <path d="M14 112c4-22 22-30 46-30s42 8 46 30z" fill="#2a3566"/>
    <path d="M48 84l12 22 12-22z" fill="#fff"/><path d="M57 88h6l2 18-5 5-5-5z" fill="#ef6a9a"/>
    <rect x="52" y="70" width="16" height="16" rx="6" fill="#f2c9a6"/>
    <ellipse cx="60" cy="50" rx="23" ry="27" fill="#f2c9a6"/>
    <path d="M36 46c0-18 12-26 24-26s24 8 24 26c-4-10-12-14-24-14s-20 4-24 14z" fill="#16192e"/>
    <g class="ms-eyes"><ellipse cx="50" cy="52" rx="2.6" ry="3.2" fill="#16192e"/><ellipse cx="70" cy="52" rx="2.6" ry="3.2" fill="#16192e"/></g>
    <g fill="none" stroke="#16192e" stroke-width="1.6"><rect x="42" y="47" width="15" height="11" rx="4"/><rect x="63" y="47" width="15" height="11" rx="4"/><path d="M57 52h6"/></g>
    <path class="ms-mouth" d="M52 66q8 6 16 0" fill="none" stroke="#9a4d3f" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`;
}

/* ====================================================================
 *  HUB — 8 pulau
 * ==================================================================== */
let CUR = null;                       // {fn, arg} untuk refresh tanpa lompat ke atas
function setPage(fn, arg) { CUR = { fn, arg }; }
async function refresh() {
  if (!CUR || !/^mensetsu/.test(location.hash.slice(1))) return;
  const y = window.scrollY; const html = await CUR.fn(CUR.arg);
  const app = document.getElementById("app"); if (app && typeof html === "string") { app.innerHTML = html; window.scrollTo(0, y); }
}

/* ---------------- akses: Mensetsu mengikuti akses SSW per bidang ----------------
 * Sumber aturan: siswa/{uid}.aksesSswBidang[slug] → kelas → bawaan (js/ssw-core.js sswAllowed). Tamu & guru tidak berubah.
 * Mengunci hanya menyembunyikan latihan; riwayat (mensetsu_hasil), persiapan & transkrip tidak dihapus dan kembali tersedia saat dibuka. */
const slugOf = (key) => String(key).replace(/_/g, "-");
async function bolehBidang(key) {
  if (isGuest()) return true;
  try { await loadKelasAkses(); return sswAllowed(slugOf(key)); } catch (e) { console.warn("mensetsu: cek akses gagal:", e.message || e); return false; }
}
const terkunciHtml = (key) => `<div class="ms-wrap"><div class="ms-panel" style="text-align:center">
  <div style="font-size:42px">🔒</div><h2>Akses ${esc(BIDANG[key].id)} belum dibuka</h2>
  <p>Mensetsu mengikuti akses SSW. Guru belum membuka bidang ini untuk akunmu. Hubungi gurumu. Riwayat dan progres Mensetsu-mu tetap tersimpan.</p>
  <button class="btn" onclick="route('mensetsu')">← Pilih bidang lain</button></div></div>`;
const jaga = (fn) => async (p) => { const key = param(p); if (BIDANG[key] && !(await bolehBidang(key))) { setPage(() => terkunciHtml(key)); return terkunciHtml(key); } return fn(p); };

async function renderHub() {
  setPage(renderHub);
  let idx = null; try { idx = await EN.loadIndex(); } catch (e) {}
  const jml = Object.fromEntries((idx?.bidang || []).map(b => [b.bidang, b.jumlah]));
  const buka = Object.fromEntries(await Promise.all(ORDER.map(async k => [k, await bolehBidang(k)])));
  const cards = ORDER.map((k, i) => {
    const b = BIDANG[k], n = jml[k] || 0, ok = n > 0, kunci = !buka[k];
    return `<button class="ms-island ${ok && !kunci ? "" : "soon"}" style="--c1:${b.c[0]};--c2:${b.c[1]};--d:${(i % 4) * .35}s"
        ${kunci ? `onclick="toast('Akses bidang ini belum dibuka guru (mengikuti akses SSW).')"` : ok ? `onclick="route('mensetsu-bidang/${k}')"` : `onclick="toast('Materi MENSETSU bidang ini belum selesai dibuat.')"`}>
      <span class="ms-isl-art">${islandSvg(k)}</span>
      <span class="ms-isl-name">${b.id}</span>
      <span class="ms-isl-jp">${b.jp}</span>
      <span class="ms-isl-st ${ok && !kunci ? "ok" : ""}">${kunci ? "🔒 Belum dibuka guru" : ok ? `✓ Tersedia · ${n} soal` : "Segera hadir"}</span>
    </button>`;
  }).join("");
  return `<div class="ms-wrap">
    <div class="ms-head"><div class="jp">面接</div><h1>MENSETSU · Persiapan wawancara kerja Jepang</h1>
      <p>Pilih bidang SSW. Setiap bidang punya bank pertanyaan sendiri — fokus pada pertanyaan wawancara dasar, bukan materi teknis.</p></div>
    <div class="ms-grid">${cards}</div>
    <div class="ms-flow"><b>Alur:</b> Pilih pertanyaan → Tulis jawaban Jepang → Koreksi AI → Dengar &amp; hafalkan → Latihan wawancara di Claude / ChatGPT</div>
    <div class="ms-hubfoot"><button class="btn ghost" onclick="goBack()">← Kembali</button></div>
  </div>`;
}

/* ====================================================================
 *  HALAMAN BIDANG — mode & pengaturan
 * ==================================================================== */
let PROV = null;   // daftar provider AI dari server (null = belum dimuat)
async function loadProviders(force) {
  if (PROV && !force) return PROV;
  PROV = isGuest() ? [] : await EN.apiProviders(FB);
  return PROV;
}
async function renderBidang(p) {
  const key = param(p); const b = BIDANG[key];
  if (!b) { setTimeout(() => route("mensetsu"), 0); return '<div class="loading">Memuat…</div>'; }
  setPage(renderBidang, p);
  const bank = await EN.loadBank(key).catch(() => null);
  if (!bank) return `<div class="ms-wrap"><div class="ms-panel"><h2>Bank soal belum tersedia</h2><button class="btn" onclick="route('mensetsu')">← Kembali</button></div></div>`;
  const card = (ico, t, d, r, big) => `<button class="ms-mode" onclick="route('${r}/${key}')"><b>${ico} ${t}</b><small>${d}</small></button>`;
  return `<div class="ms-wrap">
    <div class="ms-crumbs"><a onclick="route('mensetsu')">MENSETSU</a> › <b>${b.id}</b></div>
    <div class="ms-bhead" style="--c1:${b.c[0]};--c2:${b.c[1]}">
      <span class="ms-isl-art sm">${islandSvg(key)}</span>
      <div><div class="ms-isl-jp">${b.jp}</div><h1>${b.id}</h1><p>${bank.soal.length} pertanyaan wawancara khusus bidang ini</p></div>
    </div>
    <section class="ms-panel"><h2>Pilih yang ingin kamu lakukan</h2>
      <div class="ms-modes">
        ${card("✍️", "Persiapan jawaban", "Pilih pertanyaan, tulis jawaban Jepang, periksa dengan AI (benar/salah + perbaikan), dengarkan audionya.", "mensetsu-persiapan")}
        ${card("🧠", "Mode hafalan", "Lihat pertanyaan, coba jawab, buka jawaban, dengar, shadowing, tandai hafal/sulit.", "mensetsu-hafalan")}
        ${card("🤖", "Wawancara di Claude / ChatGPT", "お願いします — pilih pertanyaan yang ingin ditanyakan, lalu salin prompt siap pakai ke Claude atau ChatGPT.", "mensetsu-prompt")}
      </div>
      <div class="pp-act"><button class="btn ghost" onclick="route('mensetsu-bank/${key}')">📖 Lihat bank soal</button><button class="btn ghost" onclick="route('mensetsu')">← Pilih bidang lain</button></div>
    </section>
  </div>`;
}
let BANKCAT = "jiko";
async function renderBank(p) {
  const key = param(p); const b = BIDANG[key];
  if (!b) { setTimeout(() => route("mensetsu"), 0); return '<div class="loading">Memuat…</div>'; }
  setPage(renderBank, p);
  const bank = await EN.loadBank(key).catch(() => null);
  if (!bank) return `<div class="ms-wrap"><div class="panel"><h2>Bank soal belum tersedia</h2></div></div>`;
  const tabs = EN.CATS.map(x => `<button class="ms-chip ${BANKCAT === x.k ? "on" : ""}" onclick="MS.bankCat('${x.k}')">${x.jp} <small>${bank.soal.filter(q => q.k === x.k).length}</small></button>`).join("");
  const lvl = ["", "Mudah", "Sedang", "Sulit"];
  const list = bank.soal.filter(q => q.k === BANKCAT).map(q => `
    <details class="ms-q">
      <summary><span class="ms-q-ja">${esc(q.ja)}</span><span class="ms-q-lv l${q.l}">${lvl[q.l]}</span>
        <button class="ms-say" onclick="event.stopPropagation(); MS.say(this)" data-t="${esc(q.ja)}" title="Dengarkan">🔊</button></summary>
      <div class="ms-q-body">
        <p class="ms-q-id">${esc(q.id)}</p>
        <h4>Kosakata penting</h4><ul class="ms-voc">${q.v.map(([j, i]) => `<li><b>${esc(j)}</b> — ${esc(i)}</li>`).join("")}</ul>
        <h4>Maksud pertanyaan</h4><p>${esc(q.m)}</p>
        <h4>Contoh jawaban <small>(referensi, jangan dihafal mentah-mentah)</small></h4>
        <p class="ms-ans">${esc(q.aj)} <button class="ms-say" onclick="MS.say(this)" data-t="${esc(q.aj)}" title="Dengarkan">🔊</button></p>
        <p class="ms-ans-id">${esc(q.ai)}</p>
        <h4>Yang ingin diketahui pewawancara</h4><p>${esc(q.c)}</p>
      </div>
    </details>`).join("");
  return `<div class="ms-wrap">
    <div class="ms-crumbs"><a onclick="route('mensetsu')">MENSETSU</a> › <a onclick="route('mensetsu-bidang/${key}')">${b.id}</a> › <b>Bank soal</b></div>
    <div class="ms-head compact"><div class="jp">${b.jp}</div><h1>Bank soal · ${b.id}</h1></div>
    <div class="ms-chips">${tabs}</div>
    <div class="ms-qlist">${list}</div>
    <div class="ms-actions"><button class="btn big" onclick="route('mensetsu-persiapan/${key}')">✍️ Siapkan jawabanku</button></div>
  </div>`;
}

/* ====================================================================
 *  SUARA — pewawancara berbicara
 * ==================================================================== */
const MS = {
  bankCat(k) { BANKCAT = k; refresh(); },
  say(btn) { const t = btn.dataset.t; if (SV() && t) SV().speak(t, { role: "pengumuman", say: t }); },
};
window.MS = MS;

export const MENSETSU_ROUTES = {
  mensetsu: () => renderHub(),
  "mensetsu-bidang": jaga(renderBidang),
  "mensetsu-bank": jaga(renderBank),
  ...Object.fromEntries(Object.entries(PREP_ROUTES).map(([r, f]) => [r, jaga(f)])),
};
export const MENSETSU_PUBLIC = Object.keys(MENSETSU_ROUTES);
