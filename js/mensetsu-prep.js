/* =====================================================================
 * MENSETSU 面接 — PERSIAPAN JAWABAN + AI添削 + HAFALAN
 * Route : #mensetsu-persiapan/{bidang}, #mensetsu-hafalan/{bidang}
 * Simpan: Firestore siswa/{uid}/mensetsu_persiapan/{bidang} (+ cadangan localStorage)
 * Suara : speechSynthesis ja-JP milik browser/HP (gratis, tanpa API)
 * ===================================================================== */
import * as EN from "./mensetsu-engine.js";

let X = null;   // konteks dari mensetsu.js
export function initPrep(ctx) { X = ctx; }
const esc = (s) => X.esc(s);
const toast = (m) => X.toast(m);
const isJiko = (q) => /^自己紹介/.test(q.ja);
const MAXHIST = 8;

/* ---------------- data ---------------- */
let P = null;   // { key, bank, data, open, filterCat }
const lsKey = (key) => `shirose-mensetsu-prep:${X.uid()}:${key}`;
const jikoOf = (bank) => bank.soal.find(isJiko);
function blank(bank) { const j = jikoOf(bank); return { sel: j ? [j.i] : [], order: j ? [j.i] : [], answers: {}, updated: 0 }; }
function fix(bank, d) {
  d = Object.assign(blank(bank), d || {});
  const ids = new Set(bank.soal.map(q => q.i));
  d.sel = [...new Set(d.sel || [])].filter(i => ids.has(i));
  const j = jikoOf(bank);
  if (j) { d.sel = [j.i, ...d.sel.filter(i => i !== j.i)]; }
  d.order = [...new Set(d.order || [])].filter(i => d.sel.includes(i));
  for (const i of d.sel) if (!d.order.includes(i)) d.order.push(i);
  if (j) d.order = [j.i, ...d.order.filter(i => i !== j.i)];   // 自己紹介 selalu pertama
  d.answers = d.answers || {};
  return d;
}
export async function loadPrep(key, bank) {
  let local = X.LS.get(lsKey(key), null), remote = null, err = null;
  const FB = X.getFB();
  if (!X.isGuest() && FB?.getPersiapanMensetsu) { try { remote = await FB.getPersiapanMensetsu(key); } catch (e) { err = e; } }
  const pick = remote && (!local || (remote.updated || 0) >= (local.updated || 0)) ? remote : (local || remote);
  const d = fix(bank, pick);
  X.LS.set(lsKey(key), d);
  return { data: d, err };
}
let _t = null, _flushP = Promise.resolve();
function setStatus(txt, cls) { const e = document.getElementById("pp-st"); if (e) { e.textContent = txt; e.dataset.s = cls || ""; } P && (P.status = { txt, cls }); }
function persist(now) {
  P.data.updated = Date.now();
  X.LS.set(lsKey(P.key), P.data);
  setStatus("Menyimpan…", "wait");
  clearTimeout(_t);
  const run = async () => {
    const FB = X.getFB();
    if (X.isGuest() || !FB?.setPersiapanMensetsu) { setStatus("💾 Tersimpan di perangkat ini. Login agar tersimpan di akun & bisa dibuka di HP lain.", "local"); return true; }
    try { await FB.setPersiapanMensetsu(P.key, P.data); setStatus("✅ Tersimpan di akun", "ok"); return true; }
    catch (e) { setStatus("⚠️ Tersimpan di perangkat, gagal sinkron ke akun: " + (e.message || e), "err"); return false; }
  };
  if (now) return run();
  _t = setTimeout(() => { _flushP = run(); }, 700);
  return Promise.resolve(true);
}
const ans = (qid) => (P.data.answers[qid] = P.data.answers[qid] || { asli: "", koreksi: "", diterima: false, ev: null, riwayat: [], status: "baru", updated: 0 });
export const aktif = (a) => (a && a.diterima && a.koreksi ? a.koreksi : (a && a.asli) || "");
const qOf = (qid) => P.bank.soal.find(q => q.i === qid);
function flushTextarea() { const ta = document.getElementById("pp-ta"); if (ta && P && P.open) { const a = ans(P.open); if (a.asli !== ta.value) { a.asli = ta.value; a.updated = Date.now(); if (a.diterima) a.diterima = false; } } }

/* ---------------- furigana ---------------- */
const RX_FURI = /([㐀-鿿々〆ヶ]+)\[([^\]]+)\]/g;
export const stripFuri = (m) => String(m || "").replace(RX_FURI, "$1");
export function furiHtml(markup) {
  const e = esc(markup); return e.replace(/([㐀-鿿々〆ヶ]+)\[([^\]]+)\]/g, "<ruby>$1<rt>$2</rt></ruby>");
}
const hasKanji = (t) => /[㐀-鿿]/.test(t);

/* ---------------- TTS (speechSynthesis) ---------------- */
const TS_KEY = "shirose-mensetsu-tts";
const tsPref = () => Object.assign({ voice: "", slow: false }, X.LS.get(TS_KEY, {}));
const T = { q: [], i: 0, state: "idle", tok: 0, text: "", owner: "" };
const ttsOk = () => typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
export const sentences = (t) => String(t || "").replace(/\s+/g, " ").split(/(?<=[。！？!?])/).map(x => x.trim()).filter(Boolean);
const jaVoices = () => (ttsOk() ? speechSynthesis.getVoices().filter(v => /^ja/i.test(v.lang)) : []);
function ttsUi() {
  document.querySelectorAll("[data-tts]").forEach(b => {
    const k = b.dataset.tts;
    if (k === "play") b.textContent = T.state === "playing" ? "⏹ Stop" : (T.state === "paused" ? "▶ Lanjut" : "▶ Putar");
    if (k === "pause") b.disabled = T.state !== "playing";
  });
  const s = document.getElementById("pp-ttsst"); if (s) s.textContent = T.state === "playing" ? "🔊 memutar…" : T.state === "paused" ? "⏸ dijeda" : "";
}
function ttsRun(tok) {
  if (tok !== T.tok) return;
  if (T.i >= T.q.length) { T.state = "idle"; ttsUi(); return; }
  const u = new SpeechSynthesisUtterance(T.q[T.i]); const pf = tsPref();
  u.lang = "ja-JP"; u.rate = pf.slow ? 0.65 : 1; u.pitch = 1;
  const v = jaVoices().find(x => x.voiceURI === pf.voice || x.name === pf.voice) || jaVoices()[0]; if (v) u.voice = v;
  u.onend = () => { if (tok !== T.tok || T.state !== "playing") return; T.i++; ttsRun(tok); };
  u.onerror = (e) => { if (tok !== T.tok) return; if (e.error === "canceled" || e.error === "interrupted") return; T.state = "idle"; ttsUi(); toast("Suara gagal diputar (" + e.error + "). Cek pengaturan Text-to-speech Jepang di HP."); };
  try { speechSynthesis.speak(u); } catch (e) { T.state = "idle"; ttsUi(); }
}
export function ttsPlay(text, owner) {
  if (!ttsOk()) { toast("Browser ini tidak mendukung suara (speechSynthesis)."); return false; }
  text = String(text || "").trim(); if (!text) { toast("Belum ada teks untuk dibaca."); return false; }
  ttsStop(); T.tok++; T.q = sentences(stripFuri(text)); T.i = 0; T.text = text; T.owner = owner || ""; T.state = "playing";
  try { speechSynthesis.resume(); } catch (e) {}
  ttsRun(T.tok); ttsUi(); return true;
}
export function ttsStop() { T.tok++; T.state = "idle"; try { ttsOk() && speechSynthesis.cancel(); } catch (e) {} ttsUi(); }
export function ttsPause() { if (T.state !== "playing") return; T.state = "paused"; T.tok++; try { speechSynthesis.cancel(); } catch (e) {} ttsUi(); }
export function ttsResume() { if (T.state !== "paused") return; T.state = "playing"; ttsRun(++T.tok); ttsUi(); }
export const ttsState = () => T.state;
window.addEventListener("hashchange", () => { if (!/^mensetsu-(persiapan|hafalan)/.test(location.hash.slice(1))) { try { ttsStop(); } catch (e) {} } });
if (typeof window !== "undefined" && ttsOk()) { try { speechSynthesis.addEventListener("voiceschanged", () => { const s = document.getElementById("pp-voice"); if (s) s.innerHTML = voiceOpts(); }); } catch (e) {} }
function voiceOpts() {
  const pf = tsPref(), vs = jaVoices();
  if (!vs.length) return `<option value="">(suara Jepang bawaan)</option>`;
  return vs.map(v => `<option value="${esc(v.voiceURI)}" ${v.voiceURI === pf.voice || v.name === pf.voice ? "selected" : ""}>${esc(v.name)}</option>`).join("");
}
function ttsBar(getTextJs, owner) {
  const pf = tsPref(); const nv = ttsOk() ? jaVoices().length : 0;
  return `<div class="pp-tts">
    <button class="btn" data-tts="play" onclick="PP.play(${getTextJs},'${owner}')">▶ Putar</button>
    <button class="btn ghost" data-tts="pause" onclick="PP.pause()" disabled>⏸ Jeda</button>
    <button class="btn ghost" onclick="PP.replay(${getTextJs},'${owner}')">🔁 Ulang</button>
    <label class="pp-sp"><input type="radio" name="pp-sp" ${pf.slow ? "" : "checked"} onchange="PP.speed(false)"/> Normal</label>
    <label class="pp-sp"><input type="radio" name="pp-sp" ${pf.slow ? "checked" : ""} onchange="PP.speed(true)"/> Lambat</label>
    <select id="pp-voice" onchange="PP.voice(this.value)" title="Pilih suara">${voiceOpts()}</select>
    <span id="pp-ttsst" class="ms-note"></span>
  </div>${ttsOk() && !nv ? `<p class="ms-note">Belum terdeteksi suara Jepang di perangkat ini. Android: Pengaturan → Sistem → Bahasa → Output text-to-speech → Google → pasang bahasa Jepang. Suara tetap dicoba memakai ja-JP.</p>` : ""}`;
}

/* ---------------- koreksi ---------------- */
const arr = (x) => (Array.isArray(x) ? x : []);
const S = (x) => String(x == null ? "" : x);
export function normEv(d, text, sumber) {
  d = d && typeof d === "object" ? d : {};
  const k = d.kealamian && typeof d.kealamian === "object" ? d.kealamian : {};
  return {
    sumber: sumber || "ai", asli: text, bahasa: ["ja", "id", "mix"].includes(d.bahasa_input) ? d.bahasa_input : "ja",
    relevan: d.relevan !== false, catRel: S(d.catatan_relevansi), ringkas: S(d.ringkas),
    salah: arr(d.bagian_salah).map(x => ({ asli: S(x.asli), benar: S(x.benar), jenis: S(x.jenis), penjelasan: S(x.penjelasan) })).filter(x => x.asli || x.benar || x.penjelasan),
    benar: S(d.versi_benar).trim(), terjemahan: S(d.terjemahan),
    kosakata: arr(d.kosakata).filter(x => Array.isArray(x) && x.length >= 2).map(x => [S(x[0]), S(x[1])]),
    pola: arr(d.pola).map(x => ({ pola: S(x.pola), arti: S(x.arti), contoh: S(x.contoh) })),
    kealamian: { skor: Math.max(0, Math.min(100, Math.round(+k.skor || 0))), level: S(k.level), catatan: S(k.catatan) },
    alternatif: arr(d.alternatif).map(x => ({ ja: S(x.ja), id: S(x.id), catatan: S(x.catatan) })).filter(x => x.ja),
    furigana: S(d.furigana),
  };
}
/** Pemeriksaan dasar TANPA AI (aturan sederhana, bukan koreksi tata bahasa penuh). */
export function cekDasar(text, q) {
  const cls = EN.classify(text); const salah = []; const t = text.trim();
  let ringkas = "Pemeriksaan dasar (tanpa AI). Ini hanya aturan sederhana, bukan koreksi tata bahasa lengkap — aktifkan AI (login + mesin AI) untuk 添削 penuh.";
  if (cls.lang === "id" || cls.lang === "mix") salah.push({ asli: t.slice(0, 30), benar: "", jenis: "bahasa", penjelasan: cls.lang === "id" ? "Jawaban ini bahasa Indonesia. Di wawancara, jawab dalam bahasa Jepang. Minta AI menerjemahkan (butuh AI)." : "Jawaban bercampur Indonesia dan Jepang. Gunakan Jepang sepenuhnya." });
  if (cls.lang !== "id" && cls.len < 15) salah.push({ asli: t, benar: "", jenis: "kejelasan", penjelasan: "Jawaban terlalu pendek. Tambahkan alasan atau contoh (2–3 kalimat)." });
  const plain = t.match(/[^。！？\n]*?(?:だ|である|した|った|ない|ている|する)(?=。|$)/g);
  if (cls.lang !== "id" && plain && plain.length) salah.push({ asli: plain[0].trim().slice(-20), benar: "", jenis: "keigo", penjelasan: "Ada akhiran bentuk biasa (だ/である/した…). Di wawancara pakai bentuk sopan です・ます." });
  if (cls.lang !== "id" && cls.len >= 15 && !/(です|ます|ました|ません|ございます|申します|でした)/.test(t)) salah.push({ asli: t.slice(0, 20), benar: "", jenis: "keigo", penjelasan: "Tidak ditemukan です/ます. Gunakan bentuk sopan." });
  if (isJiko(q) && cls.lang !== "id") {
    if (!/(と申します|です)/.test(t.slice(0, 40))) salah.push({ asli: "", benar: "", jenis: "relevansi", penjelasan: "Perkenalan diri biasanya diawali nama: 〜と申します。" });
    if (!/よろしくお願い/.test(t)) salah.push({ asli: "", benar: "", jenis: "kesopanan", penjelasan: "Tutup perkenalan dengan よろしくお願いします。" });
  }
  if (!salah.length) ringkas = "Pemeriksaan dasar tidak menemukan masalah umum (jawaban cukup panjang, sopan). Untuk memeriksa partikel, kosakata & kealamian, gunakan AI.";
  return { sumber: "dasar", asli: text, bahasa: cls.lang === "id" ? "id" : (cls.lang === "mix" ? "mix" : "ja"), relevan: true, catRel: "", ringkas, salah, benar: "", terjemahan: "", kosakata: [], pola: [], kealamian: { skor: 0, level: "", catatan: "" }, alternatif: [], furigana: "" };
}
const aiReady = () => { const c = X.cfgGet(); const pv = X.getProv(); return c.provider !== "skrip" && pv && pv.length > 0 && !X.isGuest(); };

/* ---------------- halaman PERSIAPAN ---------------- */
function crumbs(key, last) { const b = X.BIDANG[key]; return `<div class="ms-crumbs"><a onclick="route('mensetsu')">MENSETSU</a> › <a onclick="route('mensetsu-bidang/${key}')">${b.id}</a> › <b>${last}</b></div>`; }
const STAT = { baru: "Belum hafal", hafal: "Hafal ✅", sulit: "Sulit ⚠️" };
async function init(key) {
  const bank = await EN.loadBank(key).catch(() => null); if (!bank) return null;
  const { data, err } = await loadPrep(key, bank);
  P = { key, bank, data, open: P && P.key === key ? P.open : null, cat: "semua", status: null };
  if (err) P.status = { txt: "⚠️ Gagal membaca dari akun (" + (err.message || err) + "). Memakai data perangkat ini.", cls: "err" };
  return P;
}
export async function renderPersiapan(p) {
  const key = X.param(p); if (!X.BIDANG[key]) { setTimeout(() => route("mensetsu"), 0); return '<div class="loading">Memuat…</div>'; }
  X.setPage(renderPersiapan, p);
  if (!P || P.key !== key || !P.bank) { const r = await init(key); if (!r) return `<div class="ms-wrap"><div class="ms-panel"><h2>Bank soal belum tersedia</h2><button class="btn" onclick="route('mensetsu')">← Kembali</button></div></div>`; }
  if (!X.getProv()) { X.loadProviders().then(() => {}).catch(() => {}); }
  const b = X.BIDANG[key]; const { bank, data } = P; const cats = EN.CATS.filter(c => c.k !== "saigo");
  const jiko = jikoOf(bank);
  const filled = data.order.filter(i => aktif(data.answers[i]).trim()).length;
  const chips = [`<button class="ms-chip ${P.cat === "semua" ? "on" : ""}" onclick="PP.cat('semua')">Semua</button>`, ...cats.map(c => `<button class="ms-chip ${P.cat === c.k ? "on" : ""}" onclick="PP.cat('${c.k}')">${c.jp} <small>${bank.soal.filter(q => q.k === c.k).length}</small></button>`)].join("");
  const pool = bank.soal.filter(q => q.k !== "saigo" && (P.cat === "semua" || q.k === P.cat));
  const checklist = pool.map(q => {
    const on = data.sel.includes(q.i); const lock = jiko && q.i === jiko.i;
    return `<label class="pp-ck ${on ? "on" : ""}"><input type="checkbox" ${on ? "checked" : ""} ${lock ? "disabled" : ""} onchange="PP.toggle('${q.i}',this.checked)"/><span><b class="jp">${esc(q.ja)}</b><small>${esc(q.id)}${lock ? " · 🔒 wajib, selalu pertama" : ""}</small></span></label>`;
  }).join("");
  const list = data.order.map((id, n) => {
    const q = qOf(id); if (!q) return ""; const a = data.answers[id]; const has = aktif(a).trim(); const op = P.open === id;
    const lock = jiko && id === jiko.i;
    return `<div class="pp-item ${op ? "open" : ""}" id="pp-it-${id}">
      <div class="pp-ih"><span class="pp-n">${n + 1}</span>
        <div class="pp-q" onclick="PP.open('${id}')"><b class="jp">${esc(q.ja)}</b><small>${esc(q.id)}</small>
          <span class="pp-tags">${has ? `<i class="t ok">Ada jawaban</i>` : `<i class="t">Kosong</i>`}${a && a.diterima ? `<i class="t ai">Versi AI dipakai</i>` : ""}${a && a.status && a.status !== "baru" ? `<i class="t ${a.status}">${STAT[a.status]}</i>` : ""}</span></div>
        <div class="pp-mv"><button class="btn ghost sm" ${n <= 1 || lock ? "disabled" : ""} onclick="PP.move('${id}',-1)" title="Naik">↑</button><button class="btn ghost sm" ${lock || n === data.order.length - 1 ? "disabled" : ""} onclick="PP.move('${id}',1)" title="Turun">↓</button>
          <button class="btn ghost sm" ${lock ? "disabled" : ""} onclick="PP.toggle('${id}',false)" title="${lock ? "Wajib" : "Hapus dari daftar"}">✕</button></div></div>
      ${op ? editor(q, a || ans(id)) : ""}</div>`;
  }).join("");
  return `<div class="ms-wrap pp">
    ${crumbs(key, "Persiapan jawaban")}
    <div class="ms-head compact"><div class="jp">準備</div><h1>Persiapan jawaban — ${esc(b.id)}</h1>
      <p>Pilih pertanyaan, tulis jawabanmu dalam bahasa Jepang, lalu periksa dengan AI. Semua tersimpan di akunmu.</p></div>
    <div class="pp-bar"><span id="pp-st" class="pp-st" data-s="${P.status ? P.status.cls : ""}">${esc(P.status ? P.status.txt : (X.isGuest() ? "Belum login — data hanya di perangkat ini." : "Siap."))}</span>
      <span class="ms-note">${data.order.length} pertanyaan dipilih · ${filled} sudah berjawaban</span></div>
    <section class="ms-panel"><h2>1. Pilih pertanyaan untuk bidang ini</h2>
      <div class="ms-chips">${chips}</div>
      <div class="pp-act"><button class="btn ghost" onclick="PP.all(true)">Pilih semua yang tampil</button><button class="btn ghost" onclick="PP.all(false)">Kosongkan (自己紹介 tetap)</button></div>
      <div class="pp-chk">${checklist}</div></section>
    <section class="ms-panel"><h2>2. Urutan &amp; jawaban</h2>
      <p class="ms-note">自己紹介をお願いします。 selalu pertama dan tidak bisa dihapus. Ketuk pertanyaan untuk menulis jawaban. Urutan ini dipakai di simulasi wawancara.</p>
      <div class="pp-list">${list || '<p class="ms-note">Belum ada pertanyaan.</p>'}</div></section>
    <div class="ms-actions"><button class="btn big" onclick="route('mensetsu-hafalan/${key}')">🧠 Mode hafalan</button>
      <button class="btn big" onclick="route('mensetsu-sesi/${key}')">🎙️ Simulasi wawancara</button>
      <button class="btn ghost" onclick="route('mensetsu-bidang/${key}')">← Pengaturan</button></div>
  </div>`;
}
function evHtml(q, a) {
  const ev = a.ev; if (!ev) return "";
  const sec = (h, body) => `<div class="pp-sec"><h4>${h}</h4>${body}</div>`;
  const sal = ev.salah.length ? `<ul class="pp-ul">${ev.salah.map(x => `<li>${x.asli ? `<span class="bad">${esc(x.asli)}</span>` : ""}${x.benar ? ` → <span class="good">${esc(x.benar)}</span>` : ""}${x.jenis ? ` <em>[${esc(x.jenis)}]</em>` : ""}<br><small>${esc(x.penjelasan)}</small></li>`).join("")}</ul>` : `<p class="ms-note">Tidak ada bagian yang perlu diperbaiki.</p>`;
  const lvl = ev.kealamian.skor ? `<div class="pp-meter"><i style="width:${ev.kealamian.skor}%"></i></div><p><b>${ev.kealamian.skor}/100</b> ${esc(ev.kealamian.level)}<br><small>${esc(ev.kealamian.catatan)}</small></p>` : `<p class="ms-note">—</p>`;
  const furiOn = X.LS.get("shirose-mensetsu-furi", false);
  const benarHtml = ev.benar ? (furiOn && ev.furigana && stripFuri(ev.furigana).replace(/\s/g, "") === ev.benar.replace(/\s/g, "") ? furiHtml(ev.furigana) : esc(ev.benar)) : "";
  const head = ev.sumber === "dasar" ? `<div class="pp-warn">Pemeriksaan dasar tanpa AI — tidak ada versi perbaikan otomatis.</div>` : `<div class="pp-warn ok">Diperiksa AI (${esc(ev.sumber)}). AI bisa keliru — pakai penilaian sendiri dan tanyakan guru bila ragu.</div>`;
  return `<div class="pp-ev">${head}
    ${sec("A. Jawaban asli kamu", `<p class="pp-box jp">${esc(ev.asli)}</p>`)}
    ${ev.bahasa !== "ja" ? `<p class="ms-note">Terdeteksi: jawaban ${ev.bahasa === "id" ? "bahasa Indonesia" : "campuran Indonesia–Jepang"}.</p>` : ""}
    ${ev.catRel && ev.catRel !== "-" ? `<p class="ms-note ${ev.relevan ? "" : "bad"}">${ev.relevan ? "✔ Relevan" : "✖ Kurang sesuai pertanyaan"}: ${esc(ev.catRel)}</p>` : ""}
    ${ev.ringkas ? `<p>${esc(ev.ringkas)}</p>` : ""}
    ${sec("B. Bagian yang perlu diperbaiki &nbsp;·&nbsp; C. Penjelasan", sal)}
    ${ev.benar ? sec("D. Jawaban Jepang yang sudah diperbaiki", `<p class="pp-box jp good2" id="pp-benar">${benarHtml}</p>
      <div class="pp-act"><button class="btn" onclick="PP.pakai('${q.i}',true)">✅ Pakai versi perbaikan</button><button class="btn ghost" onclick="PP.pakai('${q.i}',false)">↩️ Tolak, pakai jawaban asli</button><button class="btn ghost" onclick="PP.salin('${q.i}')">📋 Salin jawaban perbaikan</button></div>
      <p class="ms-note">${a.diterima ? "Status: versi perbaikan DIPAKAI." : "Status: kamu memakai jawaban asli (belum menerima perbaikan)."} Jawaban asli tetap tersimpan terpisah.</p>`) : ""}
    ${ev.terjemahan ? sec("E. Terjemahan Indonesia", `<p>${esc(ev.terjemahan)}</p>`) : ""}
    ${(ev.kosakata.length || ev.pola.length) ? sec("F. Kosakata &amp; pola kalimat penting", `${ev.kosakata.length ? `<ul class="pp-ul">${ev.kosakata.map(k => `<li><b class="jp">${esc(k[0])}</b> — ${esc(k[1])}</li>`).join("")}</ul>` : ""}${ev.pola.length ? `<ul class="pp-ul">${ev.pola.map(k => `<li><b class="jp">${esc(k.pola)}</b> — ${esc(k.arti)}${k.contoh ? `<br><small class="jp">${esc(k.contoh)}</small>` : ""}</li>`).join("")}</ul>` : ""}`) : ""}
    ${ev.kealamian.skor ? sec("G. Tingkat kealamian", lvl) : ""}
    ${ev.alternatif.length ? sec("Alternatif kalimat", `<ul class="pp-ul">${ev.alternatif.map((x, i) => `<li><b class="jp">${esc(x.ja)}</b><br><small>${esc(x.id)}${x.catatan ? " · " + esc(x.catatan) : ""}</small><br><button class="btn ghost sm" onclick="PP.alt('${q.i}',${i})">Pakai kalimat ini</button></li>`).join("")}</ul>`) : ""}
  </div>`;
}
function editor(q, a) {
  const act = aktif(a); const furiOn = X.LS.get("shirose-mensetsu-furi", false);
  const actHtml = act ? (furiOn && a.furi && a.furi.t === act ? furiHtml(a.furi.m) : (furiOn && a.ev && a.ev.furigana && a.diterima && stripFuri(a.ev.furigana).replace(/\s/g, "") === act.replace(/\s/g, "") ? furiHtml(a.ev.furigana) : esc(act))) : "";
  const rh = (a.riwayat || []).slice().reverse();
  return `<div class="pp-ed">
    <p class="ms-note"><b>Pertanyaan:</b> <span class="jp">${esc(q.ja)}</span> — ${esc(q.id)} <button class="btn ghost sm" onclick="PP.sayQ('${q.i}')">🔊 Dengar pertanyaan</button></p>
    <label class="pp-lb">Jawabanmu (bahasa Jepang)
      <textarea id="pp-ta" rows="5" placeholder="Tulis jawaban dalam bahasa Jepang… (boleh bahasa Indonesia dulu, nanti AI bantu ubah ke Jepang)" oninput="PP.input('${q.i}')">${esc(a.asli)}</textarea></label>
    <div class="pp-act"><button class="btn" onclick="PP.simpan('${q.i}')">💾 Simpan</button>
      <button class="btn big" id="pp-kor" onclick="PP.koreksi('${q.i}')">🤖 AI添削 — Periksa Jawaban</button>
      <button class="btn ghost" onclick="PP.contoh('${q.i}')">💡 Lihat contoh dari bank soal</button></div>
    <div id="pp-contoh" class="hidden pp-box"></div>
    <div id="pp-evwrap">${evHtml(q, a)}</div>
    <div class="pp-sec"><h4>🔊 Jawaban yang dipakai ${a.diterima ? "(versi perbaikan AI)" : "(jawaban asli)"}</h4>
      <p class="pp-box jp" id="pp-aktif">${actHtml || '<span class="ms-note">Belum ada jawaban.</span>'}</p>
      <div class="pp-act"><label class="ck"><input type="checkbox" ${furiOn ? "checked" : ""} onchange="PP.furi(this.checked)"/> Tampilkan furigana (ふりがな)</label>
        <label class="pp-lb inline">Baca:<select id="pp-which"><option value="aktif">Yang dipakai</option><option value="asli">Jawaban asli</option>${a.koreksi ? '<option value="koreksi">Versi perbaikan</option>' : ""}</select></label></div>
      ${ttsBar(`PP.bacaTeks('${q.i}')`, "ed")}</div>
    <div class="pp-sec"><h4>Status hafalan</h4><div class="pp-act">${["baru", "hafal", "sulit"].map(s => `<button class="btn ${a.status === s ? "" : "ghost"}" onclick="PP.status('${q.i}','${s}')">${STAT[s]}</button>`).join("")}</div></div>
    <details class="pp-sec"><summary><b>Riwayat revisi AI (${rh.length})</b></summary>
      ${rh.length ? rh.map((r, i) => `<div class="pp-rv"><small>${new Date(r.t).toLocaleString("id-ID")} · ${esc(r.sumber)}${r.keputusan ? " · " + esc(r.keputusan) : ""}</small>
        <div class="jp">Asli: ${esc(r.asli)}</div>${r.koreksi ? `<div class="jp good2">Perbaikan: ${esc(r.koreksi)}</div>` : ""}
        <button class="btn ghost sm" onclick="PP.pulih('${q.i}',${rh.length - 1 - i})">Pulihkan teks asli ini ke editor</button></div>`).join("") : '<p class="ms-note">Belum ada.</p>'}</details>
  </div>`;
}

/* ---------------- aksi PERSIAPAN ---------------- */
function rerender() { return X.refresh(); }
const PP = {
  cat(k) { flushTextarea(); P.cat = k; rerender(); },
  toggle(id, on) {
    flushTextarea(); const d = P.data; const j = jikoOf(P.bank);
    if (j && id === j.i) { toast("自己紹介 wajib dan selalu pertama."); rerender(); return; }
    if (on) { if (!d.sel.includes(id)) { d.sel.push(id); d.order.push(id); } }
    else { d.sel = d.sel.filter(x => x !== id); d.order = d.order.filter(x => x !== id); if (P.open === id) P.open = null; }
    persist(); rerender();
  },
  all(on) {
    flushTextarea(); const d = P.data; const j = jikoOf(P.bank);
    const pool = P.bank.soal.filter(q => q.k !== "saigo" && (P.cat === "semua" || q.k === P.cat));
    for (const q of pool) { if (j && q.i === j.i) continue; if (on && !d.sel.includes(q.i)) { d.sel.push(q.i); d.order.push(q.i); } if (!on) { d.sel = d.sel.filter(x => x !== q.i); d.order = d.order.filter(x => x !== q.i); } }
    if (!on) P.open = P.open && d.sel.includes(P.open) ? P.open : null;
    persist(); rerender();
  },
  move(id, dir) {
    flushTextarea(); const o = P.data.order; const i = o.indexOf(id); const j = i + dir;
    if (i < 1 || j < 1 || j >= o.length) return;   // indeks 0 = 自己紹介 terkunci
    [o[i], o[j]] = [o[j], o[i]]; persist(); rerender();
  },
  open(id) { flushTextarea(); ttsStop(); P.open = P.open === id ? null : id; persist(); rerender().then(() => document.getElementById("pp-it-" + id)?.scrollIntoView({ block: "nearest" })); },
  input(id) {
    const ta = document.getElementById("pp-ta"); if (!ta) return; const a = ans(id);
    a.asli = ta.value; a.updated = Date.now(); if (a.diterima && a.koreksi) { /* edit setelah menerima: tetap pakai versi perbaikan sampai ditolak */ }
    persist();
  },
  async simpan(id) { flushTextarea(); const ok = await persist(true); toast(ok ? "Jawaban disimpan." : "Disimpan di perangkat; sinkron akun gagal."); },
  contoh(id) {
    const q = qOf(id), box = document.getElementById("pp-contoh"); if (!box) return;
    box.classList.toggle("hidden"); box.innerHTML = `<b>Contoh dari bank soal (hanya referensi — jangan dihafal mentah):</b><p class="jp">${esc(q.aj || "—")}</p><p class="ms-note">${esc(q.ai || "")}</p>${q.aj ? `<button class="btn ghost sm" onclick="PP.pakaiContoh('${id}')">Salin contoh ke editor</button>` : ""}`;
  },
  pakaiContoh(id) { const q = qOf(id), ta = document.getElementById("pp-ta"); if (ta && q.aj) { if (ta.value.trim() && !confirm("Timpa teks di editor dengan contoh? (teks lama masuk riwayat bila sudah diperiksa AI)")) return; ta.value = q.aj; PP.input(id); } },
  async koreksi(id) {
    flushTextarea(); const q = qOf(id), a = ans(id); const text = a.asli.trim();
    if (!text) { toast("Tulis jawabanmu dulu."); return; }
    if (text.length > 800) { toast("Jawaban terlalu panjang (maks 800 karakter)."); return; }
    const btn = document.getElementById("pp-kor"); if (btn) { btn.disabled = true; btn.textContent = "⏳ Memeriksa…"; }
    await persist(true);
    let ev = null;
    if (aiReady()) {
      try { const r = await EN.aiCall(X.getFB(), "koreksi", { bidang: P.key, question: q.ja, answer: text }, X.cfgGet().provider); ev = normEv(r.data, text, r.provider || "ai"); if (!ev.benar && ev.bahasa !== "ja") ev = null; if (ev && !ev.benar && !ev.salah.length && !ev.ringkas) ev = null; }
      catch (e) { toast("AI gagal: " + (e.message || e) + " — memakai pemeriksaan dasar."); }
    } else toast(X.isGuest() ? "Belum login — memakai pemeriksaan dasar tanpa AI." : "AI tidak tersedia — memakai pemeriksaan dasar tanpa AI.");
    if (!ev) ev = cekDasar(text, q);
    a.ev = ev; a.koreksi = ev.benar || a.koreksi; if (ev.benar) a.diterima = false;
    a.riwayat = [...(a.riwayat || []), { t: Date.now(), asli: text, koreksi: ev.benar, skor: ev.kealamian.skor, sumber: ev.sumber, keputusan: "" }].slice(-MAXHIST);
    a.updated = Date.now(); await persist(true); P.open = id; await rerender();
    document.getElementById("pp-evwrap")?.scrollIntoView({ behavior: "smooth", block: "start" });
  },
  pakai(id, yes) {
    flushTextarea(); const a = ans(id); if (yes && !(a.ev && a.ev.benar)) return;
    if (yes) a.koreksi = a.ev.benar; a.diterima = !!yes; a.updated = Date.now();
    const r = a.riwayat[a.riwayat.length - 1]; if (r) r.keputusan = yes ? "diterima" : "ditolak";
    persist(); toast(yes ? "Versi perbaikan dipakai." : "Memakai jawaban asli."); rerender();
  },
  alt(id, i) { flushTextarea(); const a = ans(id); const x = a.ev && a.ev.alternatif[i]; if (!x) return; a.koreksi = x.ja; a.diterima = true; a.furi = null; a.updated = Date.now(); const r = a.riwayat[a.riwayat.length - 1]; if (r) r.keputusan = "alternatif dipakai"; persist(); toast("Kalimat alternatif dipakai."); rerender(); },
  async salin(id) {
    const a = ans(id); const t = a.ev && a.ev.benar ? a.ev.benar : a.koreksi; if (!t) return;
    try { await navigator.clipboard.writeText(t); toast("Jawaban perbaikan disalin."); }
    catch (e) { const ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch (e2) {} ta.remove(); toast(ok ? "Jawaban perbaikan disalin." : "Gagal menyalin — pilih teks lalu salin manual."); }
  },
  pulih(id, idx) { const a = ans(id); const r = a.riwayat[idx]; if (!r) return; a.asli = r.asli; a.diterima = false; a.updated = Date.now(); persist(); rerender(); },
  status(id, s) { flushTextarea(); const a = ans(id); a.status = s; a.updated = Date.now(); persist(); rerender(); },
  async furi(on) {
    X.LS.set("shirose-mensetsu-furi", !!on); flushTextarea();
    if (on && P && P.open) {
      const a = ans(P.open); const act = aktif(a);
      const hasEv = a.ev && a.diterima && a.ev.furigana && stripFuri(a.ev.furigana).replace(/\s/g, "") === act.replace(/\s/g, "");
      if (act && hasKanji(act) && !hasEv && !(a.furi && a.furi.t === act)) {
        if (aiReady()) { try { const r = await EN.aiCall(X.getFB(), "furigana", { bidang: P.key, answer: act }, X.cfgGet().provider); const m = S(r.data && r.data.furigana); if (m && stripFuri(m).replace(/\s/g, "") === act.replace(/\s/g, "")) { a.furi = { t: act, m }; persist(); } else toast("Furigana dari AI tidak cocok dengan teks; ditampilkan tanpa furigana."); } catch (e) { toast("Furigana gagal: " + (e.message || e)); } }
        else toast("Furigana otomatis butuh AI (login + mesin AI aktif).");
      }
    }
    rerender();
  },
  bacaTeks(id) { const a = ans(id); const w = document.getElementById("pp-which")?.value || "aktif"; return w === "asli" ? a.asli : w === "koreksi" ? a.koreksi : aktif(a); },
  play(text, owner) { if (T.state === "playing") return ttsStop(); if (T.state === "paused") return ttsResume(); ttsPlay(text, owner); },
  pause() { ttsPause(); },
  replay(text, owner) { ttsPlay(text, owner); },
  speed(slow) { const p = tsPref(); p.slow = !!slow; X.LS.set(TS_KEY, p); if (T.state === "playing") { ttsPause(); ttsResume(); } },
  voice(v) { const p = tsPref(); p.voice = v; X.LS.set(TS_KEY, p); if (T.state === "playing") { ttsPause(); ttsResume(); } },
  sayQ(id) { ttsPlay(qOf(id).ja, "q"); },
};

/* ---------------- halaman HAFALAN ---------------- */
let H = { i: 0, filter: "semua", show: false, hide: false, trans: false, shadow: null, rec: null };
function hItems() {
  const d = P.data; let ids = d.order.filter(i => qOf(i));
  if (H.filter === "belum") ids = ids.filter(i => (d.answers[i]?.status || "baru") !== "hafal");
  if (H.filter === "sulit") ids = ids.filter(i => d.answers[i]?.status === "sulit");
  return ids;
}
function lcsMark(target, said) {
  const n = (x) => x.replace(/[\s。、，,.！!？?「」『』\-ー〜~]/g, "");
  const a = [...n(target)], b = [...n(said)]; const m = a.length, k = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(k + 1));
  for (let i = m - 1; i >= 0; i--) for (let j = k - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const hit = new Array(m).fill(false); let i = 0, j = 0;
  while (i < m && j < k) { if (a[i] === b[j]) { hit[i] = true; i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++; }
  return { chars: a, hit, recall: m ? dp[0][0] / m : 0 };
}
export const similarity = (t, s) => lcsMark(t, s).recall;
export async function renderHafalan(p) {
  const key = X.param(p); if (!X.BIDANG[key]) { setTimeout(() => route("mensetsu"), 0); return '<div class="loading">Memuat…</div>'; }
  X.setPage(renderHafalan, p);
  if (!P || P.key !== key || !P.bank) { const r = await init(key); if (!r) return `<div class="ms-wrap"><div class="ms-panel"><h2>Bank soal belum tersedia</h2></div></div>`; }
  const items = hItems(); if (H.i >= items.length) H.i = Math.max(0, items.length - 1);
  const d = P.data; const cnt = (s) => d.order.filter(i => (d.answers[i]?.status || "baru") === s).length;
  const head = `${crumbs(key, "Hafalan")}<div class="ms-head compact"><div class="jp">暗記</div><h1>Mode hafalan — ${esc(X.BIDANG[key].id)}</h1></div>
    <div class="pp-bar"><span class="ms-note">✅ ${cnt("hafal")} hafal · ⚠️ ${cnt("sulit")} sulit · ${cnt("baru")} belum</span>
      <span class="pp-fil">${[["semua", "Semua"], ["belum", "Belum hafal"], ["sulit", "Sulit"]].map(([k, l]) => `<button class="ms-chip ${H.filter === k ? "on" : ""}" onclick="PP.hFilter('${k}')">${l}</button>`).join("")}</span></div>`;
  if (!items.length) return `<div class="ms-wrap pp">${head}<div class="ms-panel"><p>${d.order.length ? "Tidak ada pertanyaan pada filter ini." : "Belum ada pertanyaan dipilih."}</p><button class="btn big" onclick="route('mensetsu-persiapan/${key}')">✍️ Ke persiapan jawaban</button></div></div>`;
  const id = items[H.i], q = qOf(id), a = d.answers[id] || {}; const act = aktif(a).trim();
  const furiOn = X.LS.get("shirose-mensetsu-furi", false);
  const actHtml = act ? (furiOn && a.furi && a.furi.t === act ? furiHtml(a.furi.m) : (furiOn && a.ev && a.diterima && a.ev.furigana && stripFuri(a.ev.furigana).replace(/\s/g, "") === act.replace(/\s/g, "") ? furiHtml(a.ev.furigana) : esc(act))) : "";
  const sh = H.shadow;
  const shHtml = sh ? `<div class="pp-sec"><h4>Hasil shadowing (perkiraan)</h4><p class="pp-box jp">${sh.chars.map((c, i) => `<span class="${sh.hit[i] ? "good" : "bad"}">${esc(c)}</span>`).join("")}</p>
      <p><b>${Math.round(sh.recall * 100)}%</b> huruf cocok. <small>Ini perkiraan dari pengenalan suara browser (bisa salah dengar), bukan penilaian pelafalan.</small></p><p class="ms-note">Kamu bilang: <span class="jp">${esc(sh.said)}</span></p></div>` : "";
  return `<div class="ms-wrap pp">${head}
    <section class="ms-panel pp-card"><div class="pp-prog">${H.i + 1} / ${items.length}</div>
      <p class="pp-big jp">${esc(q.ja)}</p>
      <div class="pp-act"><button class="btn ghost" onclick="PP.sayQ('${id}')">🔊 Ulangi pertanyaan</button><button class="btn ghost" onclick="PP.hTrans()">${H.trans ? "Sembunyikan" : "Lihat"} arti</button></div>
      ${H.trans ? `<p class="ms-note">${esc(q.id)}</p>` : ""}
      ${act ? `<label class="pp-lb">Coba jawab dulu dari ingatan (opsional)<textarea id="pp-try" rows="3" placeholder="Ketik jawabanmu tanpa melihat…"></textarea></label>
        <div class="pp-act"><button class="btn big" onclick="PP.hShow()">${H.show ? "🙈 Tutup jawaban" : "👁 Tampilkan jawaban"}</button><button class="btn ghost" onclick="PP.hHide()">${H.hide ? "Tampilkan teks" : "Sembunyikan teks (dengar saja)"}</button></div>
        ${H.show ? `<div class="pp-box jp ${H.hide ? "blur" : ""}" id="pp-ans">${actHtml}</div>
          ${a.ev && a.ev.terjemahan && a.diterima ? `<p class="ms-note">${esc(a.ev.terjemahan)}</p>` : ""}
          <label class="ck"><input type="checkbox" ${furiOn ? "checked" : ""} onchange="PP.furi(this.checked)"/> Furigana</label>` : ""}
        ${ttsBar(`PP.hTeks()`, "h")}
        <div class="pp-act"><button class="btn" id="pp-shbtn" onclick="PP.shadow()" ${EN.sttSupported() ? "" : "disabled title='Browser tidak mendukung mikrofon'"}>${H.rec ? "⏹ Selesai bicara" : "🎤 Shadowing (ucapkan ulang)"}</button>${EN.sttSupported() ? "" : '<span class="ms-note">Mikrofon tidak didukung browser ini.</span>'}</div>
        ${shHtml}`
      : `<div class="pp-box"><p>Belum ada jawaban untuk pertanyaan ini.</p><button class="btn" onclick="PP.goEdit('${id}')">✍️ Tulis jawabannya</button></div>`}
      <div class="pp-act pp-marks"><button class="btn ${a.status === "hafal" ? "" : "ghost"}" onclick="PP.hMark('hafal')">✅ Sudah hafal</button><button class="btn ${a.status === "sulit" ? "" : "ghost"}" onclick="PP.hMark('sulit')">⚠️ Sulit</button><button class="btn ${!a.status || a.status === "baru" ? "" : "ghost"}" onclick="PP.hMark('baru')">↺ Belum</button></div>
      <div class="pp-act"><button class="btn ghost" ${H.i ? "" : "disabled"} onclick="PP.hGo(-1)">← Sebelumnya</button><button class="btn ghost" ${H.i < items.length - 1 ? "" : "disabled"} onclick="PP.hGo(1)">Berikutnya →</button></div>
    </section>
    <div class="ms-actions"><button class="btn ghost" onclick="route('mensetsu-persiapan/${key}')">✍️ Edit jawaban</button><button class="btn big" onclick="route('mensetsu-sesi/${key}')">🎙️ Simulasi wawancara</button></div></div>`;
}
Object.assign(PP, {
  hFilter(f) { ttsStop(); H.filter = f; H.i = 0; H.show = false; H.shadow = null; rerender(); },
  hGo(n) { ttsStop(); stopRec(); H.i += n; H.show = false; H.shadow = null; rerender(); },
  hShow() { H.show = !H.show; rerender(); },
  hHide() { H.hide = !H.hide; rerender(); },
  hTrans() { H.trans = !H.trans; rerender(); },
  hTeks() { const id = hItems()[H.i]; return id ? aktif(P.data.answers[id]) : ""; },
  hMark(s) { const id = hItems()[H.i]; if (!id) return; ans(id).status = s; ans(id).updated = Date.now(); persist(); toast(STAT[s]); rerender(); },
  goEdit(id) { P.open = id; route("mensetsu-persiapan/" + P.key); },
  shadow() {
    if (H.rec) { stopRec(); return; }
    const id = hItems()[H.i]; const target = aktif(P.data.answers[id]).trim(); if (!target) return;
    ttsStop(); H.shadow = null;
    H.rec = EN.listen({ lang: "ja-JP", onInterim: () => {}, onEnd: ({ text }) => { H.rec = null; if (!text) { toast("Suara tidak terdengar. Coba lagi lebih dekat ke mikrofon."); rerender(); return; } const m = lcsMark(stripFuri(target), text); H.shadow = { ...m, said: text }; rerender(); },
      onError: (e) => { H.rec = null; toast("Mikrofon: " + (e && e.error ? e.error : e || "gagal")); rerender(); } });
    const b = document.getElementById("pp-shbtn"); if (b) b.textContent = "⏹ Selesai bicara";
  },
});
function stopRec() { try { H.rec && H.rec.stop && H.rec.stop(); } catch (e) {} }

window.PP = PP;
export const PREP_ROUTES = { "mensetsu-persiapan": (p) => renderPersiapan(p), "mensetsu-hafalan": (p) => renderHafalan(p) };

/* ---------------- dipakai simulasi wawancara ---------------- */
/** Ambil pertanyaan terpilih (urutan siswa, 自己紹介 pertama) + jawaban persiapan aktif. */
export async function sessionPrep(key, bank) {
  const { data } = await loadPrep(key, bank);
  const prep = {}; for (const i of data.order) { const t = aktif(data.answers[i]).trim(); if (t) prep[i] = t; }
  const plan = data.order.map(i => bank.soal.find(q => q.i === i)).filter(Boolean);
  return { plan, prep, count: data.order.length, answers: Object.keys(prep).length };
}
