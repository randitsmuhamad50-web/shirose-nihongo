/* =====================================================================
 * MENSETSU 面接 — simulasi wawancara kerja Jepang untuk 8 bidang SSW
 * ---------------------------------------------------------------------
 * Berdiri sendiri (pola sama dengan Kana Center), tidak mengubah sistem lama.
 * Route : #mensetsu, #mensetsu-bidang/{key}, #mensetsu-bank/{key},
 *         #mensetsu-sesi/{key}, #mensetsu-hasil/{id|last}, #mensetsu-riwayat
 * Data  : ./data/mensetsu/{bidang}.json  (bank soal)
 * Simpan: Firestore siswa/{uid}/mensetsu_hasil (+ cadangan localStorage)
 *         → sub-koleksi milik siswa, sudah tercakup Rules yang ada.
 * Global: window.MS (dipakai onclick di HTML)
 * ===================================================================== */
import * as EN from "./mensetsu-engine.js";
import { initPrep, PREP_ROUTES, sessionPrep } from "./mensetsu-prep.js";

let FB = null;
export function initMensetsu(fb) {
  FB = fb;
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

async function renderHub() {
  setPage(renderHub);
  let idx = null; try { idx = await EN.loadIndex(); } catch (e) {}
  const jml = Object.fromEntries((idx?.bidang || []).map(b => [b.bidang, b.jumlah]));
  const cards = ORDER.map((k, i) => {
    const b = BIDANG[k], n = jml[k] || 0, ok = n > 0;
    return `<button class="ms-island ${ok ? "" : "soon"}" style="--c1:${b.c[0]};--c2:${b.c[1]};--d:${(i % 4) * .35}s"
        ${ok ? `onclick="route('mensetsu-bidang/${k}')"` : `onclick="toast('Materi MENSETSU bidang ini belum selesai dibuat.')"`}>
      <span class="ms-isl-art">${islandSvg(k)}</span>
      <span class="ms-isl-name">${b.id}</span>
      <span class="ms-isl-jp">${b.jp}</span>
      <span class="ms-isl-st ${ok ? "ok" : ""}">${ok ? `✓ Tersedia · ${n} soal` : "Segera hadir"}</span>
    </button>`;
  }).join("");
  return `<div class="ms-wrap">
    <div class="ms-head"><div class="jp">面接</div><h1>MENSETSU · Simulasi wawancara kerja Jepang</h1>
      <p>Pilih bidang SSW. Setiap bidang punya bank pertanyaan sendiri — fokus pada pertanyaan wawancara dasar, bukan materi teknis.</p></div>
    <div class="ms-grid">${cards}</div>
    <div class="ms-flow"><b>Alur AI:</b> Bertanya → Mendengarkan → Memahami → Menanggapi → Menggali jawaban</div>
    <div class="ms-hubfoot"><button class="btn" onclick="route('mensetsu-riwayat')">📈 Riwayat &amp; perkembangan</button>
      <button class="btn ghost" onclick="goBack()">← Kembali</button></div>
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
  if (!bank) return `<div class="ms-wrap"><div class="panel"><h2>Bank soal belum tersedia</h2><button class="btn" onclick="route('mensetsu')">← Kembali</button></div></div>`;
  const c = cfgGet();
  const cnt = (k) => bank.soal.filter(q => q.k === k && q.k !== "saigo").length;
  const modeCards = Object.entries(MODE).map(([k, m]) => `
    <button class="ms-mode ${c.mode === k ? "on" : ""}" onclick="MS.set('mode','${k}')">
      <b>${m.jp}</b><span>${m.nm}</span><small>${m.d}</small></button>`).join("");
  const chips = EN.CATS.filter(x => x.k !== "saigo").map(x => `
    <button class="ms-chip ${c.cats.includes(x.k) ? "on" : ""}" onclick="MS.toggleCat('${x.k}')">${x.jp} <small>${x.id} · ${cnt(x.k)}</small></button>`).join("");
  const opt = (v, cur, label) => `<option value="${v}" ${String(cur) === String(v) ? "selected" : ""}>${label}</option>`;
  const prov = PROV || [];
  const provOpts = [opt("auto", c.provider, "Otomatis (AI yang tersedia)"), ...prov.map(x => opt(x.id, c.provider, "AI: " + x.label)), opt("skrip", c.provider, "Mode Skrip + suara (tanpa AI, tanpa biaya)")].join("");
  const sttOk = EN.sttSupported();
  setTimeout(async () => { if (!PROV) { await loadProviders(); refresh(); } }, 0);
  return `<div class="ms-wrap">
    <div class="ms-crumbs"><a onclick="route('mensetsu')">MENSETSU</a> › <b>${b.id}</b></div>
    <div class="ms-bhead" style="--c1:${b.c[0]};--c2:${b.c[1]}">
      <span class="ms-isl-art sm">${islandSvg(key)}</span>
      <div><div class="ms-isl-jp">${b.jp}</div><h1>${b.id}</h1><p>${bank.soal.length} pertanyaan wawancara khusus bidang ini · interviewer: 田中さん (${b.co})</p></div>
    </div>

    <section class="ms-panel"><h2>0. Persiapan jawaban</h2>
      <p class="ms-note" style="margin:0 0 10px">Pilih pertanyaan, tulis jawaban Jepang, periksa dengan AI添削, dengarkan audionya, lalu hafalkan. 自己紹介 selalu jadi pertanyaan pertama.</p>
      <div class="pp-act"><button class="btn big" onclick="route('mensetsu-persiapan/${key}')">✍️ Persiapan jawaban</button><button class="btn" onclick="route('mensetsu-hafalan/${key}')">🧠 Mode hafalan</button></div>
      <label class="ck"><input type="checkbox" ${c.pakaiPersiapan !== false ? "checked" : ""} onchange="MS.set('pakaiPersiapan',this.checked)"/> Wawancara memakai pertanyaan &amp; jawaban persiapanku (AI tahu jawaban yang kusiapkan, tapi jawaban spontan tetap diterima)</label>
    </section>

    <section class="ms-panel"><h2>1. Pilih mode wawancara</h2><div class="ms-modes">${modeCards}</div></section>

    <section class="ms-panel"><h2>2. Pengaturan pertanyaan</h2>
      <div class="ms-chips">
        <button class="ms-chip ${c.cats.length ? "" : "on"}" onclick="MS.set('cats',[])">Semua kategori</button>${chips}
      </div>
      <div class="ms-row">
        <label>Jumlah soal<select onchange="MS.set('n',+this.value)">${[5, 8, 10, 15, 20, 30].map(v => opt(v, c.n, v)).join("")}</select></label>
        <label>Tingkat<select onchange="MS.set('level',+this.value)">${opt(0, c.level, "Semua")}${opt(1, c.level, "Mudah")}${opt(2, c.level, "Sedang")}${opt(3, c.level, "Sulit")}</select></label>
        <label>Durasi<select onchange="MS.set('durasi',+this.value)">${opt(0, c.durasi, "Tanpa batas")}${[5, 10, 15, 20, 30].map(v => opt(v, c.durasi, v + " menit")).join("")}</select></label>
        <label class="ck"><input type="checkbox" ${c.random ? "checked" : ""} onchange="MS.set('random',this.checked)"/> Urutan acak</label>
      </div>
      ${c.mode === "lemah" ? `<p class="ms-note">Mode Weakness: soal dipilih dari riwayat wawancara sebelumnya. Jika belum ada, soal diacak.</p>` : ""}
    </section>

    <section class="ms-panel"><h2>3. Pewawancara &amp; suara</h2>
      <div class="ms-row">
        <label>Mesin pewawancara<select onchange="MS.set('provider',this.value)">${provOpts}</select></label>
        <label>Bahasa mikrofon<select onchange="MS.set('sttLang',this.value)">${opt("ja-JP", c.sttLang, "日本語 (Jepang)")}${opt("id-ID", c.sttLang, "Indonesia")}</select></label>
      </div>
      <div class="ms-checks">
        <label class="ck"><input type="checkbox" ${c.autoMic ? "checked" : ""} onchange="MS.set('autoMic',this.checked)"/> Mikrofon menyala otomatis setelah AI selesai bicara</label>
        <label class="ck"><input type="checkbox" ${c.autoSend ? "checked" : ""} onchange="MS.set('autoSend',this.checked)"/> Kirim jawaban otomatis setelah selesai bicara</label>
        <label class="ck"><input type="checkbox" ${c.arti ? "checked" : ""} onchange="MS.set('arti',this.checked)"/> Tampilkan arti pertanyaan (Indonesia)</label>
        <label class="ck"><input type="checkbox" ${SV()?.prefs?.().engine ? "checked" : ""} onchange="MS.engine(this.checked)"/> Pakai VOICEVOX di komputer ini (perlu VOICEVOX Engine berjalan)</label>
        <label class="ck"><input type="checkbox" ${c.simpan ? "checked" : ""} onchange="MS.set('simpan',this.checked)"/> Simpan transkrip &amp; nilai ke riwayat (suara tidak pernah disimpan)</label>
      </div>
      <p class="ms-note">${statusMesin(c, prov, sttOk)}</p>
    </section>

    <div class="ms-actions">
      <button class="btn big" onclick="route('mensetsu-sesi/${key}')">🎙️ Mulai wawancara</button>
      <button class="btn" onclick="route('mensetsu-bank/${key}')">📖 Lihat bank soal</button>
      <button class="btn ghost" onclick="route('mensetsu')">← Pilih bidang lain</button>
    </div>
  </div>`;
}
function statusMesin(c, prov, sttOk) {
  const parts = [];
  if (isGuest()) parts.push("Mode tamu: hanya Mode Skrip (AI perlu login).");
  else if (PROV === null) parts.push("Memeriksa AI…");
  else if (!prov.length) parts.push("AI server belum aktif / belum dikonfigurasi → otomatis memakai Mode Skrip (tanpa AI). Lihat README: Netlify Functions.");
  else parts.push("AI aktif: " + prov.map(x => x.label).join(", ") + ".");
  parts.push(sttOk ? "Mikrofon (Speech-to-Text) didukung browser ini." : "Browser ini tidak mendukung mikrofon/STT → jawab dengan mengetik (Chrome Android disarankan).");
  return esc(parts.join(" "));
}

/* ====================================================================
 *  BANK SOAL — latihan baca (tanpa AI)
 * ==================================================================== */
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
    <div class="ms-actions"><button class="btn big" onclick="route('mensetsu-bidang/${key}')">🎙️ Siap latihan wawancara</button></div>
  </div>`;
}

/* ====================================================================
 *  SUARA — pewawancara berbicara
 * ==================================================================== */
const _pk = {};
async function packIndex(key) {
  if (!(key in _pk)) _pk[key] = await fetch(`./audio/vv/mensetsu/${key}/index.json`).then(r => r.ok ? r.json() : null).catch(() => null);
  return _pk[key];
}
/** Ucapkan teks. Urutan: voice pack VOICEVOX (jika ada) → VOICEVOX lokal → suara browser. */
async function speakText(text) {
  const sv = SV(); if (!sv || !text) return;
  const ix = SES ? await packIndex(SES.key) : null;
  const parts = ix ? text.split(/(?<=。)/).filter(Boolean) : [text];
  for (const t of parts) {
    if (!SES || SES.dead) return;
    const f = ix && ix.clips && ix.clips[t];
    if (f) { const ok = await sv.playUrl(`./audio/vv/mensetsu/${SES.key}/${f}`, { label: "VOICEVOX · Pewawancara" }); if (ok) continue; }
    await sv.speak(t, { role: "pengumuman", say: t });
  }
}

/* ====================================================================
 *  SESI WAWANCARA
 * ==================================================================== */
let SES = null;     // sesi aktif
let LAST = null;    // hasil terakhir (belum tentu tersimpan)

const phaseText = {
  idle: "Siap", speaking: "🔊 田中さんが話しています… (AI sedang berbicara)", listening: "🎤 聞いています… (AI sedang mendengarkan)",
  thinking: "🤔 考えています…", ready: "✍️ Giliran Anda — bicara atau ketik jawaban", eval: "📊 Menghitung penilaian…", done: "Selesai",
};
function setPhase(ph) {
  if (!SES) return; SES.phase = ph;
  const el = document.getElementById("ms-status"); if (el) { el.textContent = phaseText[ph] || ph; el.dataset.ph = ph; }
  const av = document.getElementById("ms-avatar"); if (av) { av.classList.toggle("talk", ph === "speaking"); av.classList.toggle("listen", ph === "listening"); av.classList.toggle("think", ph === "thinking"); }
  const mic = document.getElementById("ms-mic"); if (mic) mic.classList.toggle("on", ph === "listening");
}
function bubble(who, ja, extra = {}) {
  const chat = document.getElementById("ms-chat"); if (!chat) return;
  const d = document.createElement("div"); d.className = "ms-b " + who;
  d.innerHTML = `<div class="ms-b-who">${who === "ai" ? "田中さん" : "あなた"}</div><div class="ms-b-ja">${esc(ja)}</div>` +
    (extra.id ? `<div class="ms-b-id">${esc(extra.id)}</div>` : "") + (extra.note ? `<div class="ms-b-note">${esc(extra.note)}</div>` : "");
  chat.appendChild(d); chat.scrollTop = chat.scrollHeight; return d;
}
function tickTimer() {
  const el = document.getElementById("ms-timer");
  if (!el || !SES || SES.dead) { return false; }
  const s = Math.floor((Date.now() - SES.t0) / 1000);
  const lim = SES.cfg.durasi * 60;
  el.textContent = lim ? `⏱ ${fmt(Math.max(0, lim - s))} tersisa` : `⏱ ${fmt(s)}`;
  return true;
}
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

async function renderSesi(p) {
  const key = param(p); const b = BIDANG[key];
  if (!b) { setTimeout(() => route("mensetsu"), 0); return '<div class="loading">Memuat…</div>'; }
  cleanupSesi();
  setPage(renderSesi, p);
  const bank = await EN.loadBank(key).catch(() => null);
  if (!bank) return `<div class="ms-wrap"><div class="panel"><h2>Bank soal belum tersedia</h2></div></div>`;
  const c = cfgGet(); const m = MODE[c.mode];
  await loadProviders();
  const aiOn = c.provider !== "skrip" && PROV && PROV.length > 0 && !isGuest();
  const eng = aiOn ? "AI" : "Mode Skrip (tanpa AI)";
  return `<div class="ms-wrap ms-sesi">
    <div class="ms-crumbs"><a onclick="MS.keluar('mensetsu')">MENSETSU</a> › <a onclick="MS.keluar('mensetsu-bidang/${key}')">${b.id}</a> › <b>Wawancara</b></div>
    <div class="ms-room">
      <div class="ms-who" style="--c1:${b.c[0]};--c2:${b.c[1]}">
        <div class="ms-avatar" id="ms-avatar">${avatarSvg()}<span class="ms-ring"></span></div>
        <div class="ms-who-t"><div class="nm">田中 誠 <small>たなか まこと</small></div><div class="pos">人事担当 · ${b.co}</div>
          <div class="ms-status" id="ms-status" data-ph="idle">Siap</div></div>
        <div class="ms-meta"><span id="ms-prog">0/0</span><span id="ms-timer">⏱ 00:00</span><span class="ms-modepill">${m.jp}</span><span class="ms-modepill">${esc(eng)}</span></div>
      </div>
      <div class="ms-chat" id="ms-chat"><div class="ms-b sys">Tekan <b>Mulai wawancara</b> untuk memulai. ${EN.sttSupported() ? "Izinkan mikrofon saat diminta." : "Browser ini tidak mendukung mikrofon — jawab dengan mengetik."}</div></div>
      <div class="ms-help hidden" id="ms-help"></div>
      <div class="ms-input">
        <textarea id="ms-ans" rows="2" placeholder="Bicara lewat mikrofon, atau ketik jawabanmu di sini… (Ctrl+Enter = kirim)" onkeydown="if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){MS.kirim();}" disabled></textarea>
        <div class="ms-ctrl">
          <button class="ms-mic" id="ms-mic" onclick="MS.mic()" title="Mikrofon" disabled>🎤</button>
          <button class="btn" id="ms-send" onclick="MS.kirim()" disabled>Kirim ➤</button>
          <button class="btn ghost" id="ms-rep" onclick="MS.ulang()" disabled>🔁 Ulangi pertanyaan</button>
          ${c.mode === "latihan" ? `<button class="btn ghost" id="ms-hint" onclick="MS.contoh()" disabled>💡 Contoh jawaban</button>` : ""}
          <button class="btn danger" id="ms-end" onclick="MS.akhiri()" disabled>⏹ Akhiri</button>
        </div>
      </div>
      <div class="ms-startbox" id="ms-startbox"><button class="btn big" onclick="MS.mulai('${key}')">▶ Mulai wawancara</button>
        <button class="btn ghost" onclick="route('mensetsu-bidang/${key}')">⚙ Pengaturan</button></div>
    </div></div>`;
}

function cleanupSesi() {
  if (SES) { SES.dead = true; try { SES.stt && SES.stt.abort(); } catch (e) {} clearInterval(SES.iv); }
  try { SV() && SV().stop(true); } catch (e) {}
  SES = null;
}
window.addEventListener("hashchange", () => { if (SES && !/^mensetsu-sesi/.test(location.hash.slice(1))) cleanupSesi(); });

async function mulai(key) {
  const bank = await EN.loadBank(key); const cfg = cfgGet();
  await loadProviders();
  let weak = new Set();
  if (cfg.mode === "lemah") { try { weak = EN.weakFromHistory(await listRiwayat(30)); } catch (e) {} if (!weak.size) toast("Belum ada data kelemahan — soal diacak."); }
  let plan = EN.planQuestions(bank, cfg, weak), prep = {}, usedSel = false;
  if (cfg.pakaiPersiapan !== false) {
    try {
      const sp = await sessionPrep(key, bank); prep = sp.prep;
      if (sp.count >= 2 && cfg.mode !== "lemah") { plan = sp.plan; usedSel = true; }
    } catch (e) { console.warn("persiapan tidak terbaca", e); }
  }
  // 自己紹介 SELALU pertama (tidak bisa dihapus / dilewati)
  const jk = bank.soal.find(q => /^自己紹介/.test(q.ja));
  if (jk) plan = [jk, ...plan.filter(q => q.i !== jk.i)];
  if (!plan.length) { toast("Tidak ada soal yang cocok dengan pengaturan."); return; }
  const useAI = cfg.provider !== "skrip" && PROV && PROV.length > 0 && !isGuest();
  SES = { key, bank, cfg, plan, prep, usedSel, idx: 0, turns: [], followups: 0, t0: Date.now(), phase: "idle", useAI, aiFail: 0, providerUsed: null, confs: [], voiceUsed: false, closing: false, repeats: 0, helped: new Set(), dead: false, stt: null, pendingConf: null };
  document.getElementById("ms-startbox")?.classList.add("hidden");
  document.getElementById("ms-chat").innerHTML = "";
  ["ms-ans", "ms-mic", "ms-send", "ms-rep", "ms-hint", "ms-end"].forEach(id => { const e = document.getElementById(id); if (e) e.disabled = false; });
  SES.iv = setInterval(() => { if (!tickTimer()) clearInterval(SES && SES.iv); }, 1000); tickTimer();
  progress();
  if (usedSel) toast("Memakai " + plan.length + " pertanyaan dari persiapanmu.");
  await say(EN.OPENING);
  if (SES.dead) return;
  await askCurrent(plan[0].ja.startsWith("自己紹介") ? "まず、自己紹介をお願いします。" : plan[0].ja);
}
function progress() { const e = document.getElementById("ms-prog"); if (e && SES) e.textContent = `質問 ${Math.min(SES.idx + 1, SES.plan.length)}/${SES.plan.length}`; }

/** Pewawancara berbicara (tampil sebagai balon + suara). */
async function say(text, extra = {}) {
  if (!SES || SES.dead) return;
  bubble("ai", text, extra);
  setPhase("speaking");
  try { await speakText(text); } catch (e) { console.warn("TTS gagal", e); }
}
async function askCurrent(text) {
  const q = SES.plan[SES.idx];
  SES.curText = text || q.ja;
  const showId = SES.cfg.arti && SES.cfg.mode !== "nyata";
  await say(SES.curText, showId ? { id: q.id } : {});
  await giliranSiswa();
}
async function giliranSiswa() {
  if (!SES || SES.dead) return;
  setPhase("ready");
  const a = document.getElementById("ms-ans"); if (a) { a.value = ""; a.focus(); }
  if (SES.cfg.autoMic && EN.sttSupported() && !SES.micBlocked) startMic();
}

/* ---------------- mikrofon ---------------- */
function startMic() {
  if (!SES || SES.dead || SES.stt) return;
  try { SV() && SV().stop(true); } catch (e) {}
  const a = document.getElementById("ms-ans");
  SES.stt = EN.listen({
    lang: SES.cfg.sttLang,
    onInterim: (t) => { if (a) a.value = t; },
    onEnd: ({ text, conf }) => {
      if (!SES || SES.dead) return; SES.stt = null;
      if (SES.phase === "listening") setPhase("ready");
      if (text) { if (a) a.value = text; SES.pendingConf = conf; SES.voiceUsed = true; if (SES.cfg.autoSend) kirim(); }
    },
    onError: (err) => {
      if (!SES) return;
      if (err === "not-allowed" || err === "service-not-allowed") { SES.micBlocked = true; toast("🎤 Izin mikrofon ditolak. Ketik jawabanmu, atau izinkan mikrofon di pengaturan browser."); }
      else if (err === "no-speech") toast("Suara tidak terdengar. Coba lagi atau ketik.");
      else if (err === "network") toast("STT butuh internet. Coba lagi atau ketik.");
    },
  });
  setPhase("listening");
}
function mic() {
  if (!SES || SES.dead) return;
  if (!EN.sttSupported()) { toast("Browser ini tidak mendukung mikrofon. Gunakan Chrome (Android/desktop) atau ketik jawaban."); return; }
  if (SES.stt) { SES.stt.stop(); return; }
  SES.micBlocked = false; startMic();
}

/* ---------------- kirim jawaban ---------------- */
async function kirim() {
  if (!SES || SES.dead || SES.phase === "thinking" || SES.phase === "eval") return;
  const a = document.getElementById("ms-ans"); const text = (a?.value || "").trim();
  if (!text) { toast("Jawaban masih kosong."); return; }
  if (SES.stt) { SES.stt.abort(); SES.stt = null; }
  try { SV() && SV().stop(true); } catch (e) {}
  const conf = SES.pendingConf; SES.pendingConf = null;
  a.value = ""; document.getElementById("ms-help")?.classList.add("hidden");
  bubble("me", text);
  setPhase("thinking");
  if (SES.closing) return jawabPenutup(text);
  const q = SES.plan[SES.idx]; const cls = EN.classify(text);
  SES.turns.push({ i: q.i, k: q.k, q: q.ja, a: text, lang: cls.lang, conf: conf, helped: false, prep: SES.prep[q.i] || "" });
  if (conf != null) SES.confs.push(conf);
  await putaran(q, text, cls);
}

async function putaran(q, text, cls) {
  const S2 = SES; const nextQ = S2.plan[S2.idx + 1]; const maxF = S2.cfg.mode === "latihan" ? 2 : 1;
  const overTime = S2.cfg.durasi && (Date.now() - S2.t0) / 1000 >= S2.cfg.durasi * 60;
  let r = null;
  if (S2.useAI) {
    try {
      const res = await EN.aiCall(FB, "turn", { bidang: S2.key, mode: S2.cfg.mode, question: q.ja, answer: text, persiapan: S2.prep[q.i] || "", followupsUsed: S2.followups, nextQuestion: nextQ ? nextQ.ja : "",
        history: S2.turns.slice(-7, -1).map(t => ({ q: t.q, a: t.a })) }, S2.cfg.provider);
      if (res && res.data && res.data.say) { r = res.data; S2.providerUsed = res.provider; S2.aiFail = 0; }
    } catch (e) { S2.aiFail++; toast("AI gagal (" + (e.message || "error") + ") — pakai Mode Skrip untuk giliran ini."); if (S2.aiFail >= 2) { S2.useAI = false; toast("AI dimatikan untuk sesi ini; lanjut Mode Skrip."); } }
  }
  if (S2.dead) return;
  if (!r) r = EN.scriptTurn({ q, answer: text, followupsUsed: S2.followups, nextQ, mode: S2.cfg.mode });
  let kind = r.kind || "next", sayText = String(r.say || "").trim();
  const t = S2.turns[S2.turns.length - 1];
  if (S2.cfg.mode === "nyata" && kind === "help") { kind = "clarify"; r.bantuan = null; }
  const stay = (kind === "followup" || kind === "clarify" || kind === "help");
  if (stay && S2.followups >= maxF + (kind === "help" ? 1 : 0)) { kind = "next"; sayText = EN.aizuchi(); }
  if (kind === "next" || (!stay)) {
    // lanjut ke pertanyaan berikutnya (atau penutup)
    if (!nextQ || overTime) { S2.idx = S2.plan.length; return penutup(overTime ? "waktu" : ""); }
    S2.idx++; S2.followups = 0; progress();
    if (!sayText.includes(nextQ.ja)) sayText = (sayText && !sayText.endsWith("。") ? sayText + "。" : sayText) + nextQ.ja;
    SES.curText = nextQ.ja;
    const showId = S2.cfg.arti && S2.cfg.mode !== "nyata";
    await say(sayText, showId ? { id: nextQ.id } : {});
    return giliranSiswa();
  }
  // tetap di pertanyaan yang sama
  S2.followups++;
  if (kind === "help" && r.bantuan && r.bantuan.ja) { t.helped = true; S2.helped.add(q.i); tampilBantuan(r.bantuan); }
  await say(sayText, r.tips && S2.cfg.mode === "latihan" ? { note: "💡 " + r.tips } : {});
  return giliranSiswa();
}
function tampilBantuan(b) {
  const el = document.getElementById("ms-help"); if (!el) return;
  const voc = (b.kosakata || []).map(x => Array.isArray(x) ? `<li><b>${esc(x[0])}</b> — ${esc(x[1])}</li>` : "").join("");
  el.innerHTML = `<h4>日本語 (contoh jawaban)</h4><p class="ja">${esc(b.ja)} <button class="ms-say" onclick="MS.say(this)" data-t="${esc(b.ja)}">🔊</button></p>
    <h4>Bahasa Indonesia</h4><p>${esc(b.id || "")}</p>${voc ? `<h4>Kosakata penting</h4><ul class="ms-voc">${voc}</ul>` : ""}
    ${b.pola ? `<h4>Pola kalimat</h4><p>${esc(b.pola)}</p>` : ""}<p class="ms-note">Ini contoh untuk belajar — ucapkan kembali dengan kata-katamu sendiri, jangan hanya menghafal.</p>`;
  el.classList.remove("hidden");
}
function contoh() {
  if (!SES || SES.closing) return;
  const q = SES.plan[SES.idx]; if (!q) return;
  SES.helped.add(q.i); const t = SES.turns.filter(x => x.i === q.i).pop(); if (t) t.helped = true;
  tampilBantuan({ ja: q.aj, id: q.ai, kosakata: q.v, pola: "Contoh dari bank soal. " + q.c });
}
async function ulang() {
  if (!SES || SES.dead || SES.phase === "thinking" || SES.phase === "eval") return;
  if (SES.stt) { SES.stt.abort(); SES.stt = null; }
  SES.repeats++;
  const txt = SES.closing ? EN.CLOSE_ASK : (SES.curText || SES.plan[SES.idx].ja);
  setPhase("speaking"); try { await speakText(txt); } catch (e) {}
  if (SES && !SES.dead) giliranSiswa();
}

/* ---------------- penutup ---------------- */
async function penutup(alasan) {
  SES.closing = true;
  if (alasan === "waktu") await say("お時間になりましたので、そろそろ終わりにします。");
  await say(EN.CLOSE_ASK);
  await giliranSiswa();
}
async function jawabPenutup(text) {
  const tidakAda = /^(いいえ|特に)?(ありません|ないです|大丈夫です)|tidak ada|^tidak\b|^nggak|^no\b/i.test(text.trim());
  if (!tidakAda) {
    let reply = null;
    if (SES.useAI) {
      try { const res = await EN.aiCall(FB, "tanya", { bidang: SES.key, mode: SES.cfg.mode, answer: text }, SES.cfg.provider); if (res?.data?.say) { reply = res.data; SES.providerUsed = res.provider; } } catch (e) {}
    }
    if (SES.dead) return;
    if (!reply) reply = { say: "ご質問ありがとうございます。申し訳ありません、その点は、まだ確認できていません。担当者にお聞きください。", id: "Terima kasih atas pertanyaannya. Maaf, informasi itu belum tersedia." };
    await say(reply.say, SES.cfg.mode !== "nyata" && reply.id ? { id: reply.id } : {});
  }
  if (SES.dead) return;
  await say(EN.CLOSE_END);
  await selesai();
}
async function akhiri() {
  if (!SES || SES.dead) return;
  const jwb = SES.turns.length;
  if (!jwb) { const k = SES.key; cleanupSesi(); route("mensetsu-bidang/" + k); return; }
  if (!confirm("Akhiri wawancara sekarang dan lihat penilaian?")) return;
  if (SES.stt) { SES.stt.abort(); SES.stt = null; }
  try { SV() && SV().stop(true); } catch (e) {}
  await selesai();
}
function keluar(r) {
  if (SES && SES.turns.length && !SES.finished && !confirm("Wawancara belum selesai. Keluar tanpa penilaian?")) return;
  cleanupSesi(); route(r);
}

/* ---------------- penilaian & simpan ---------------- */
function finalTurns() {
  // satu entri per pertanyaan (jawaban terakhir), tandai bila sempat dibantu
  const m = new Map(); for (const t of SES.turns) { const prev = m.get(t.i); m.set(t.i, Object.assign({}, t, { helped: t.helped || (prev && prev.helped) || SES.helped.has(t.i) })); }
  return [...m.values()];
}
async function selesai() {
  if (!SES || SES.finished) return;
  SES.finished = true; clearInterval(SES.iv); setPhase("eval");
  ["ms-send", "ms-mic", "ms-rep", "ms-hint", "ms-end", "ms-ans"].forEach(id => { const e = document.getElementById(id); if (e) e.disabled = true; });
  const S2 = SES; const turns = finalTurns();
  const answered = turns.filter(t => t.a);
  let ev = null, prov = "skrip";
  if (S2.useAI || (S2.providerUsed && S2.cfg.provider !== "skrip")) {
    try {
      const res = await EN.aiCall(FB, "evaluate", { bidang: S2.key, mode: S2.cfg.mode, turns: turns.map(t => ({ q: t.q, a: t.a, lang: t.lang, prep: t.prep || "" })) }, S2.cfg.provider);
      if (res?.data?.skor) { ev = res.data; ev.sumber = res.provider; prov = res.provider; }
    } catch (e) { toast("Penilaian AI gagal — memakai penilaian skrip sederhana."); }
  }
  if (!ev) ev = EN.scoreScript(turns, S2.bank);
  // skor per soal → turns
  const perId = {}; (ev.per_soal || []).forEach(p => { const t = turns[p.i ?? -1]; if (t) t.skor = Math.max(0, Math.min(100, Math.round(+p.skor || 0))); else if (p.id) perId[p.id] = p.skor; });
  turns.forEach(t => { if (t.skor == null) t.skor = perId[t.i] != null ? perId[t.i] : (t.lang === "id" || !t.a ? 10 : 60); });
  const voiceConf = S2.voiceUsed && S2.confs.length ? S2.confs.reduce((a, b) => a + b, 0) / S2.confs.length : null;
  const skor = EN.combine(ev, { voiceConf });
  const result = {
    v: 1, bidang: S2.key, bidangNama: BIDANG[S2.key].id, mode: S2.cfg.mode, provider: prov, durasi: Math.round((Date.now() - S2.t0) / 1000),
    voice: S2.voiceUsed, ulang: S2.repeats, jumlahSoal: S2.plan.length, dijawab: answered.length,
    skor, ev: trimEv(ev), turns: turns.map(t => ({ i: t.i, k: t.k, q: t.q, a: t.a, lang: t.lang, conf: t.conf == null ? null : +t.conf.toFixed(2), skor: t.skor, helped: !!t.helped })),
    tglLocal: new Date().toISOString(),
  };
  LAST = result; result.id = null;
  if (S2.cfg.simpan) { try { result.id = await simpanRiwayat(result); } catch (e) { toast("Gagal menyimpan riwayat: " + (e.message || e)); } }
  cleanupSesi();
  route("mensetsu-hasil/" + (result.id || "last"));
}
const trimEv = (ev) => ({ sumber: ev.sumber, kelebihan: ev.kelebihan || [], kekurangan: ev.kekurangan || [], tidak_dijawab: ev.tidak_dijawab || [], kurang_tepat: ev.kurang_tepat || [],
  salah_tata_bahasa: ev.salah_tata_bahasa || [], salah_kosakata: ev.salah_kosakata || [], saran: ev.saran || [], jawaban_lebih_baik: ev.jawaban_lebih_baik || [], catatan: ev.catatan || "" });

/* ---------------- riwayat (Firestore + cadangan lokal) ---------------- */
const lsKey = () => `shirose-mensetsu-hist:${uid()}`;
async function simpanRiwayat(r) {
  const local = LS.get(lsKey(), []); const lid = "L" + Date.now();
  if (!isGuest() && FB && FB.simpanHasilMensetsu) {
    try { const id = await FB.simpanHasilMensetsu(r); return id; } catch (e) { console.warn("simpan Firestore gagal", e); }
  }
  local.unshift({ ...r, id: lid }); LS.set(lsKey(), local.slice(0, 30)); return lid;
}
async function listRiwayat(n = 50) {
  let out = [];
  if (!isGuest() && FB && FB.listHasilMensetsu) { try { out = await FB.listHasilMensetsu(n); } catch (e) { console.warn(e); } }
  const local = LS.get(lsKey(), []);
  const ids = new Set(out.map(x => x.id)); local.forEach(x => { if (!ids.has(x.id)) out.push(x); });
  out.sort((a, b) => tglOf(b) - tglOf(a));
  return out.slice(0, n);
}
const tglOf = (h) => (h.tgl && h.tgl.toDate ? h.tgl.toDate() : new Date(h.tglLocal || h.tgl || 0));
const fmtTgl = (d) => d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/* ====================================================================
 *  HASIL
 * ==================================================================== */
const KAT = [["isi", "Isi jawaban & relevansi", 25], ["tata_bahasa", "Tata bahasa Jepang", 20], ["kosakata", "Kosakata", 15], ["kelancaran", "Kelancaran berbicara", 15], ["artikulasi", "Pelafalan & artikulasi", 15], ["kesopanan", "Kesopanan & komunikasi", 10]];
const li = (a, f) => (a && a.length ? `<ul class="ms-ul">${a.map(f || (x => `<li>${esc(x)}</li>`)).join("")}</ul>` : `<p class="ms-note">—</p>`);
async function renderHasil(p) {
  const id = param(p);
  setPage(renderHasil, p);
  let r = null;
  if (id === "last") r = LAST; else if (LAST && LAST.id === id) r = LAST;
  else { const all = await listRiwayat(100); r = all.find(x => x.id === id); }
  if (!r) return `<div class="ms-wrap"><div class="panel"><h2>Hasil tidak ditemukan</h2><button class="btn" onclick="route('mensetsu-riwayat')">Riwayat</button></div></div>`;
  const b = BIDANG[r.bidang] || { id: r.bidangNama, jp: "", c: ["#ef6a9a", "#9d174d"] }; const sk = r.skor, ev = r.ev || {};
  const ring = (() => { const R = 52, C = 2 * Math.PI * R, off = C * (1 - sk.total / 100); return `<svg viewBox="0 0 120 120" class="ms-ringsc"><circle cx="60" cy="60" r="${R}" class="bg"/><circle cx="60" cy="60" r="${R}" class="fg" stroke-dasharray="${C}" stroke-dashoffset="${off}"/><text x="60" y="64" text-anchor="middle">${sk.total}</text><text x="60" y="82" text-anchor="middle" class="s">/ 100</text></svg>`; })();
  const bars = KAT.map(([k, nm, max]) => {
    const v = sk[k]; const na = v == null;
    return `<div class="ms-sc"><div class="top"><span>${nm}</span><b>${na ? "—" : v + " / " + max}</b></div><div class="bar"><i style="width:${na ? 0 : Math.round(v / max * 100)}%"></i></div>${k === "artikulasi" ? `<small>${na ? "Tidak dinilai (tidak memakai suara). Nilai total dihitung dari 5 kategori lainnya." : "ESTIMASI dari tingkat keyakinan pengenalan suara (STT), BUKAN penilaian fonetik. Vokal panjang/pendek, intonasi, dll. tidak dapat dinilai akurat tanpa layanan pronunciation khusus."}</small>` : ""}</div>`;
  }).join("");
  const dijawab = (r.turns || []).filter(t => t.lang === "id" || !t.a);
  const trans = (r.turns || []).map(t => `<div class="ms-tr"><div class="q">${esc(t.q)}</div><div class="a ${t.lang === "id" ? "id" : ""}">${esc(t.a || "(tidak dijawab)")}</div><div class="m"><span class="sc">${t.skor ?? "–"}</span>${t.helped ? "<span>dibantu</span>" : ""}${t.lang === "id" ? "<span>jawab Indonesia</span>" : ""}${t.conf != null ? `<span>STT ${Math.round(t.conf * 100)}%</span>` : ""}</div></div>`).join("");
  return `<div class="ms-wrap">
    <div class="ms-crumbs"><a onclick="route('mensetsu')">MENSETSU</a> › <a onclick="route('mensetsu-riwayat')">Riwayat</a> › <b>Hasil</b></div>
    <div class="ms-head compact"><div class="jp">評価</div><h1>Hasil evaluasi · ${esc(b.id)}</h1>
      <p>${esc(MODE[r.mode]?.jp || r.mode)} · ${fmtTgl(tglOf(r))} · ${Math.round(r.durasi / 60)} menit · ${r.dijawab}/${r.jumlahSoal} dijawab</p></div>
    <section class="ms-panel ms-score"><div class="ms-ringwrap">${ring}</div><div class="ms-scs">${bars}</div></section>
    <p class="ms-note center">Penilaian oleh: <b>${r.provider === "skrip" ? "Mode Skrip (perkiraan sederhana tanpa AI)" : "AI (" + esc(r.provider) + ")"}</b>. ${esc(ev.catatan || "")} Hasil adalah perkiraan untuk latihan, bukan penilaian resmi.</p>
    <div class="ms-two">
      <section class="ms-panel"><h2>👍 Kelebihan</h2>${li(ev.kelebihan)}</section>
      <section class="ms-panel"><h2>⚠️ Kekurangan</h2>${li(ev.kekurangan)}</section>
    </div>
    ${dijawab.length ? `<section class="ms-panel"><h2>❓ Pertanyaan yang belum bisa dijawab (bahasa Jepang)</h2>${li(dijawab.map(t => t.q))}</section>` : ""}
    ${(ev.kurang_tepat || []).length ? `<section class="ms-panel"><h2>🎯 Jawaban kurang tepat</h2>${li(ev.kurang_tepat, x => `<li><b>${esc(x.q)}</b><br>“${esc(x.a)}”<br><small>${esc(x.alasan)}</small></li>`)}</section>` : ""}
    ${(ev.salah_tata_bahasa || []).length ? `<section class="ms-panel"><h2>📝 Kesalahan tata bahasa</h2>${li(ev.salah_tata_bahasa, x => `<li>✗ ${esc(x.salah)} → ✓ <b>${esc(x.benar)}</b><br><small>${esc(x.catatan)}</small></li>`)}</section>` : ""}
    ${(ev.salah_kosakata || []).length ? `<section class="ms-panel"><h2>🔤 Pemilihan kosakata</h2>${li(ev.salah_kosakata, x => `<li>✗ ${esc(x.salah)} → ✓ <b>${esc(x.benar)}</b><br><small>${esc(x.catatan)}</small></li>`)}</section>` : ""}
    <section class="ms-panel"><h2>💡 Saran perbaikan</h2>${li(ev.saran)}</section>
    ${(ev.jawaban_lebih_baik || []).length ? `<section class="ms-panel"><h2>✨ Contoh jawaban yang lebih baik</h2>${li(ev.jawaban_lebih_baik, x => `<li><b>${esc(x.q)}</b>${x.versi_siswa ? `<br>Jawabanmu: ${esc(x.versi_siswa)}` : ""}<br>Lebih baik: <b>${esc(x.versi_baik)}</b> <button class="ms-say" onclick="MS.say(this)" data-t="${esc(x.versi_baik)}">🔊</button><br><small>${esc(x.arti || "")}</small></li>`)}</section>` : ""}
    <section class="ms-panel"><h2>🗒 Transkrip jawaban asli</h2><div class="ms-trs">${trans}</div></section>
    <div class="ms-actions">
      <button class="btn big" onclick="MS.set('mode','lemah');route('mensetsu-bidang/${r.bidang}')">🔥 Latihan soal yang lemah</button>
      <button class="btn" onclick="route('mensetsu-bidang/${r.bidang}')">🔁 Ulangi wawancara</button>
      <button class="btn ghost" onclick="route('mensetsu-riwayat')">📈 Riwayat</button>
    </div></div>`;
}

/* ====================================================================
 *  RIWAYAT & PERKEMBANGAN
 * ==================================================================== */
async function renderRiwayat() {
  setPage(renderRiwayat);
  const list = await listRiwayat(60);
  if (!list.length) return `<div class="ms-wrap"><div class="ms-head compact"><div class="jp">履歴</div><h1>Riwayat wawancara</h1></div><div class="ms-panel"><p>Belum ada wawancara tersimpan. Mulai dari peta pulau!</p><button class="btn big" onclick="route('mensetsu')">🏝 Pilih bidang</button></div></div>`;
  const chrono = list.slice().reverse();
  const W = 640, H = 170, pad = 24; const n = chrono.length;
  const pts = chrono.map((h, i) => [pad + (n === 1 ? (W - 2 * pad) / 2 : i * (W - 2 * pad) / (n - 1)), H - pad - (h.skor.total / 100) * (H - 2 * pad)]);
  const chart = `<svg viewBox="0 0 ${W} ${H}" class="ms-chart"><g class="grid">${[0, 50, 100].map(v => { const y = H - pad - v / 100 * (H - 2 * pad); return `<line x1="${pad}" x2="${W - pad}" y1="${y}" y2="${y}"/><text x="2" y="${y + 4}">${v}</text>`; }).join("")}</g>
    <polyline points="${pts.map(q => q.join(",")).join(" ")}" fill="none"/>${pts.map((q, i) => `<circle cx="${q[0]}" cy="${q[1]}" r="4"><title>${chrono[i].skor.total}</title></circle>`).join("")}</svg>`;
  // kategori terlemah & soal sering salah
  const cat = {}, soal = {};
  list.forEach(h => (h.turns || []).forEach(t => { (cat[t.k] = cat[t.k] || []).push(t.skor ?? 0); const s = (soal[t.q] = soal[t.q] || []); s.push(t.skor ?? 0); }));
  const catAvg = EN.CATS.map(c => ({ ...c, avg: cat[c.k] ? Math.round(cat[c.k].reduce((a, b) => a + b, 0) / cat[c.k].length) : null })).filter(c => c.avg != null).sort((a, b) => a.avg - b.avg);
  const sering = Object.entries(soal).map(([q, a]) => [q, Math.round(a.reduce((x, y) => x + y, 0) / a.length), a.length]).filter(x => x[1] < 60).sort((a, b) => a[1] - b[1]).slice(0, 5);
  const rek = catAvg[0] ? `Fokuskan latihan pada kategori <b>${catAvg[0].jp}</b> (${catAvg[0].id}), rata-rata nilai ${catAvg[0].avg}. Gunakan mode <b>Weakness Training</b>.` : "";
  const rows = list.map(h => `<div class="ms-hrow"><div><b>${esc(h.bidangNama || h.bidang)}</b><small>${MODE[h.mode]?.nm || h.mode} · ${fmtTgl(tglOf(h))}</small></div>
      <div class="sc">${h.skor.total}</div><div class="bt"><button class="btn" onclick="route('mensetsu-hasil/${h.id}')">Lihat</button><button class="btn ghost" onclick="MS.hapus('${h.id}')">🗑</button></div></div>`).join("");
  return `<div class="ms-wrap">
    <div class="ms-crumbs"><a onclick="route('mensetsu')">MENSETSU</a> › <b>Riwayat</b></div>
    <div class="ms-head compact"><div class="jp">履歴</div><h1>Riwayat &amp; perkembangan</h1></div>
    <section class="ms-panel"><h2>Grafik nilai</h2>${chart}</section>
    <div class="ms-two">
      <section class="ms-panel"><h2>Kategori paling lemah</h2>${catAvg.length ? `<ul class="ms-ul">${catAvg.slice(0, 4).map(c => `<li>${c.jp} <small>${c.id}</small> — <b>${c.avg}</b></li>`).join("")}</ul>` : "—"}</section>
      <section class="ms-panel"><h2>Soal yang sering kurang baik</h2>${sering.length ? `<ul class="ms-ul">${sering.map(s => `<li>${esc(s[0])} <small>(rata-rata ${s[1]})</small></li>`).join("")}</ul>` : "<p class=ms-note>Belum ada.</p>"}</section>
    </div>
    ${rek ? `<section class="ms-panel"><h2>Rekomendasi latihan berikutnya</h2><p>${rek}</p></section>` : ""}
    <section class="ms-panel"><h2>Semua sesi</h2><div class="ms-hlist">${rows}</div></section>
    <section class="ms-panel"><h2>🔒 Privasi data</h2><p class="ms-note">Yang disimpan hanya <b>transkrip teks &amp; nilai</b>. Rekaman suara tidak pernah disimpan. Guru dapat melihat riwayat wawancaramu. Kamu bisa menghapus riwayatmu kapan saja.</p>
      <button class="btn danger" onclick="MS.hapusSemua()">Hapus semua riwayat wawancara</button></section>
  </div>`;
}

/* ====================================================================
 *  Handler global (onclick)
 * ==================================================================== */
const MS = {
  set(k, v) { cfgSet({ [k]: v }); refresh(); },
  toggleCat(k) { const c = cfgGet(); const s = new Set(c.cats); s.has(k) ? s.delete(k) : s.add(k); cfgSet({ cats: [...s] }); refresh(); },
  bankCat(k) { BANKCAT = k; refresh(); },
  engine(on) { SV() && SV().setPref("engine", !!on); if (on) SV().engineAvailable(true).then(ok => toast(ok ? "✅ VOICEVOX Engine terdeteksi." : "VOICEVOX Engine tidak terdeteksi (jalankan di 127.0.0.1:50021). Memakai suara browser.")); },
  say(btn) { const t = btn.dataset.t; if (SV() && t) SV().speak(t, { role: "pengumuman", say: t }); },
  mulai, mic, kirim, ulang, contoh, akhiri, keluar,
  async hapus(id) {
    if (!confirm("Hapus riwayat wawancara ini?")) return;
    try { if (!String(id).startsWith("L") && FB?.hapusHasilMensetsu) await FB.hapusHasilMensetsu(id); } catch (e) { toast("Gagal menghapus: " + (e.message || e)); return; }
    LS.set(lsKey(), LS.get(lsKey(), []).filter(x => x.id !== id)); toast("Riwayat dihapus."); refresh();
  },
  async hapusSemua() {
    if (!confirm("Hapus SEMUA riwayat wawancara? Tindakan ini tidak bisa dibatalkan.")) return;
    try { if (FB?.hapusSemuaHasilMensetsu && !isGuest()) await FB.hapusSemuaHasilMensetsu(); } catch (e) { toast("Gagal menghapus: " + (e.message || e)); return; }
    LS.set(lsKey(), []); toast("Semua riwayat dihapus."); refresh();
  },
};
window.MS = MS;

export const MENSETSU_ROUTES = {
  mensetsu: () => renderHub(),
  "mensetsu-bidang": (p) => renderBidang(p),
  "mensetsu-bank": (p) => renderBank(p),
  "mensetsu-sesi": (p) => renderSesi(p),
  "mensetsu-hasil": (p) => renderHasil(p),
  "mensetsu-riwayat": () => renderRiwayat(),
  ...PREP_ROUTES,
};
export const MENSETSU_PUBLIC = Object.keys(MENSETSU_ROUTES);
