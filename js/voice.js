/* =====================================================================
 * Shirose Voice — sistem suara VOICEVOX untuk seluruh website.
 * ---------------------------------------------------------------------
 * Urutan sumber suara untuk setiap teks:
 *   1. Voice pack VOICEVOX yang sudah dibuat (file MP3 di /audio/...)
 *   2. VOICEVOX Engine lokal (opsional, http://127.0.0.1:50021) — untuk guru
 *   3. Suara bawaan browser (cadangan terakhir)
 * Hanya 10 karakter di /audio/vv/voices.json yang dipakai.
 * Satu pemutar global: tidak pernah bertumpuk, ada Stop, ulang, kecepatan.
 * ===================================================================== */

const LS_KEY = "shirose-voice";
const ENGINE = "http://127.0.0.1:50021";
const ST = () => window.__SHIROSE_STATE || {};
const lget = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e){ return d; } };
const lset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };

let CFG = null;
const cfgReady = fetch("./audio/vv/voices.json").then(r => r.json()).then(j => (CFG = j)).catch(() => (CFG = { voices: {}, roles: {} }));

export function prefs(){ return Object.assign({ speed: 1, engine: false }, lget(LS_KEY, {})); }
export function setPref(k, v){ const p = prefs(); p[k] = v; lset(LS_KEY, p); renderBar(); }

/* ---------------- Pemutar global + indikator ---------------- */
let token = 0;           // naik setiap play/stop → callback lama otomatis batal
let audioEl = null, stopTimer = null, ttsActive = false, lastReplay = null, cancelPending = null;

function bar(){
  let el = document.getElementById("sv-bar");
  if (!el){
    el = document.createElement("div"); el.id = "sv-bar"; el.className = "sv-bar hidden";
    el.innerHTML = `<span class="sv-ico"></span><span class="sv-txt"></span>
      <span class="sv-speed"></span>
      <button class="sv-btn sv-replay" title="Putar ulang">↻</button>
      <button class="sv-btn sv-stop" title="Stop">⏹</button>`;
    el.querySelector(".sv-stop").onclick = () => stop();
    el.querySelector(".sv-replay").onclick = () => lastReplay && lastReplay();
    document.body.appendChild(el);
  }
  return el;
}
let hideTimer = null;
function show(state, text){
  const el = bar(); clearTimeout(hideTimer);
  el.classList.remove("hidden"); el.dataset.state = state;
  el.querySelector(".sv-ico").textContent = { loading: "⏳", playing: "🔊", error: "⚠️", done: "✅" }[state] || "🔊";
  el.querySelector(".sv-txt").textContent = text || "";
  renderBar();
  if (state === "done" || state === "error") hideTimer = setTimeout(() => el.classList.add("hidden"), state === "error" ? 4000 : 1800);
}
function renderBar(){
  const el = document.getElementById("sv-bar"); if (!el) return;
  const sp = prefs().speed;
  el.querySelector(".sv-speed").innerHTML = [0.75, 1, 1.25].map(v =>
    `<button class="sv-btn sv-sp ${v === sp ? "on" : ""}" onclick="SV.setSpeed(${v})">${v}×</button>`).join("");
}

export function stop(silent, nextOwner){
  token++;
  clearTimeout(stopTimer);
  if (cancelPending){ const c = cancelPending; cancelPending = null; c(); }
  if (audioEl){ try { audioEl.pause(); } catch(e){} }
  if (ttsActive){ try { speechSynthesis.cancel(); } catch(e){} ttsActive = false; }
  document.querySelectorAll(".sv-playing").forEach(b => b.classList.remove("sv-playing"));
  if (!silent) show("done", "Berhenti");
  window.dispatchEvent(new CustomEvent("sv:stop", { detail: { next: nextOwner } }));
}

function el(){
  if (!audioEl){ audioEl = new Audio(); audioEl.preload = "auto"; }
  try { audioEl.preservesPitch = true; audioEl.webkitPreservesPitch = true; } catch(e){}
  return audioEl;
}

/** Putar file (opsional potongan start..start+dur dari sprite). */
function playUrl(url, opts = {}){ return _play(url, opts, ++token); }
function _play(url, { start = 0, dur = 0, label = "", onend } = {}, my){
  const a = el(); const rate = prefs().speed;
  show("loading", "Memuat suara…");
  return new Promise((resolve) => {
    let started = false;
    cancelPending = () => resolve(false);
    const fail = (why) => { if (my !== token) return; show("error", "Suara gagal dimuat" + (why ? ` (${why})` : "")); resolve(false); };
    const finish = () => { if (my !== token) return; clearTimeout(stopTimer); try { a.pause(); } catch(e){}
      show("done", "Selesai"); onend && onend(); resolve(true); };
    const begin = () => {
      if (my !== token || started) return; started = true;
      try { a.currentTime = start; } catch(e){}
      a.playbackRate = rate;
      a.play().then(() => {
        if (my !== token) return;
        show("playing", label || "Memutar…");
        if (dur) stopTimer = setTimeout(finish, (dur / rate) * 1000 + 120);
      }).catch(err => fail(err && err.name === "NotAllowedError" ? "ketuk sekali lagi" : ""));
    };
    a.onended = () => { if (!dur) finish(); };
    a.onerror = () => fail();
    a.ontimeupdate = () => { if (dur && my === token && a.currentTime >= start + dur + 0.05) finish(); };
    const abs = new URL(url, location.href).href;
    if (a.src !== abs){ a.src = abs; a.load(); a.oncanplay = () => { a.oncanplay = null; begin(); }; }
    else begin();
    setTimeout(() => { if (!started && my === token) fail("waktu habis"); }, 15000);
  });
}

/* ---------------- Indeks voice pack materi ---------------- */
const CATS = ["kosakata", "kanji", "kanji-contoh", "kosakata-contoh", "bunpou-contoh"];
const idxCache = {};
function loadIndex(lvl, cat){
  const k = `${lvl}/${cat}`;
  if (!idxCache[k]) idxCache[k] = fetch(`./audio/vv/${k}.json`, { cache: "no-cache" })
    .then(r => r.ok ? r.json() : null).catch(() => null);
  return idxCache[k];
}
async function findClip(text, role, lvl){
  const order = role && CATS.includes(role) ? [role, ...CATS.filter(c => c !== role)] : CATS;
  for (const cat of order){
    const ix = await loadIndex(lvl, cat);
    const c = ix && ix.clips && ix.clips[text];
    if (c) return { url: `./audio/vv/${lvl}/${cat}/${String(c[0]).padStart(3, "0")}.mp3`, start: c[1], dur: c[2], voice: ix.voice };
  }
  return null;
}

/* ---------------- VOICEVOX Engine lokal (opsional) ---------------- */
let engineOk = null;
export async function engineAvailable(force){
  if (!prefs().engine) return false;
  if (engineOk !== null && !force) return engineOk;
  try { const r = await fetch(ENGINE + "/version", { signal: AbortSignal.timeout(1500) }); engineOk = r.ok; }
  catch(e){ engineOk = false; }
  return engineOk;
}
let speakersCache = null;
async function styleId(vkey){
  await cfgReady;
  const v = CFG.voices[vkey]; if (!v) throw new Error("voice " + vkey);
  if (!speakersCache) speakersCache = await (await fetch(ENGINE + "/speakers")).json();
  const sp = speakersCache.find(s => s.name === v.name); if (!sp) throw new Error(v.name + " belum terpasang");
  return (sp.styles.find(s => s.name === v.style) || sp.styles[0]).id;
}
const engineCache = new Map();
async function engineUrl(text, vkey, speed = 1){
  const key = vkey + "|" + speed + "|" + text;
  if (engineCache.has(key)) return engineCache.get(key);
  const v = CFG.voices[vkey], sid = await styleId(vkey);
  const q = await (await fetch(`${ENGINE}/audio_query?speaker=${sid}&text=${encodeURIComponent(text)}`, { method: "POST" })).json();
  Object.assign(q, { speedScale: (v.speed || 1) * speed, pitchScale: v.pitch || 0, intonationScale: v.intonation || 1, volumeScale: v.volume || 1 });
  const wav = await (await fetch(`${ENGINE}/synthesis?speaker=${sid}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(q) })).blob();
  const url = URL.createObjectURL(wav); engineCache.set(key, url); return url;
}

/* ---------------- Cadangan: suara browser ---------------- */
const TTS_PITCH = { kurono: .95, kotaro: 1.15, aoyama: .7, mochiko: 1.2, kenzaki: .85, goki: 1.05, no7: 1.1, sourin: .6, nana: 1.4, kurita: .9 };
function ttsLines(lines, my, rate){
  return new Promise((resolve) => {
    cancelPending = () => resolve(false);
    const ss = window.speechSynthesis;
    if (!ss){ show("error", "Browser tidak mendukung suara"); return resolve(false); }
    const jv = (ss.getVoices() || []).filter(v => /^ja([-_]|$)/i.test(v.lang));
    let i = 0; ttsActive = true;
    show("playing", "Suara browser (voice pack belum tersedia)");
    const next = () => {
      if (my !== token) return resolve(false);
      if (i >= lines.length){ ttsActive = false; show("done", "Selesai"); return resolve(true); }
      const l = lines[i++];
      const u = new SpeechSynthesisUtterance(l.t.replace(/\s+/g, ""));
      u.lang = "ja-JP"; u.rate = 0.95 * rate; u.pitch = TTS_PITCH[l.v] || 1;
      if (jv.length) u.voice = jv[0];
      u.onend = () => setTimeout(next, l.pause || 250);
      u.onerror = () => setTimeout(next, 100);
      ss.speak(u);
    };
    try { ss.cancel(); } catch(e){}
    setTimeout(next, 150);
  });
}

/* ---------------- API publik ---------------- */
/** Ucapkan satu teks. opt.role: kosakata | kanji | kanji-contoh | kosakata-contoh | bunpou-contoh | pengumuman */
export async function speak(text, opt = {}){
  text = String(text || "").trim(); if (!text) return;
  stop(true); const my = token;
  lastReplay = () => speak(text, opt);
  await cfgReady;
  const lvl = (opt.level || ST().level || "n5").toLowerCase();
  show("loading", "Memuat suara…");
  const clip = await findClip(text, opt.role, lvl);
  if (my !== token) return;
  if (clip){
    const ok = await _play(clip.url, { start: clip.start, dur: clip.dur, label: CFG.voices[clip.voice]?.name || "" }, my);
    if (ok || my !== token) return;
  }
  const vkey = (CFG.roles || {})[opt.role] || (CFG.roles || {}).umum || "mochiko";
  if (await engineAvailable()){
    try { const u = await engineUrl(opt.say || text, vkey, 1); if (my === token) await _play(u, { label: CFG.voices[vkey].name + " · VOICEVOX lokal" }, my); return; }
    catch(e){ engineOk = false; }
  }
  if (my === token) await ttsLines([{ t: opt.say || text, v: vkey }], my, prefs().speed);
}

/** Putar naskah percakapan (Choukai). file = MP3 voice pack; lines [{s,t}]; voices {s: vkey} */
export async function playScript({ file, lines, voices, label, rate = 1, pauseN = 900, owner }){
  stop(true, owner); const my = token;
  lastReplay = () => playScript(arguments[0]);
  await cfgReady;
  if (file){
    let ok = false;
    try { const h = await fetch(file, { method: "HEAD", cache: "no-cache" }); ok = h.ok && !/text\/html/i.test(h.headers.get("content-type") || ""); } catch(e){}
    if (my !== token) return "stopped";
    if (ok){ await _play(file, { label: label || "Voice pack VOICEVOX" }, my); return "pack"; }
  }
  if (await engineAvailable()){
    try {
      for (let i = 0; i < lines.length; i++){
        if (my !== token) return "stopped";
        show("loading", `Membuat suara ${i + 1}/${lines.length}…`);
        const u = await engineUrl(lines[i].t, voices[lines[i].s] || "kenzaki", rate);
        if (my !== token) return "stopped";
        const ok = await _play(u, { label: `${CFG.voices[voices[lines[i].s]]?.name || ""} · VOICEVOX lokal` }, my);
        if (my !== token) return "stopped";
        if (!ok) throw new Error("play");
        await new Promise(r => setTimeout(r, lines[i].s === "N" ? pauseN : 350));
      }
      return "engine";
    } catch(e){ engineOk = false; }
  }
  if (my !== token) return "stopped";
  await ttsLines(lines.map(l => ({ t: l.t, v: voices[l.s], pause: l.s === "N" ? pauseN : 380 })), my, prefs().speed * rate);
  return "tts";
}

export function setSpeed(v){
  setPref("speed", v);
  if (audioEl && !audioEl.paused) audioEl.playbackRate = v;
}

/** Tombol 🔊 generik: <button data-say="…" data-role="…" onclick="SV.btn(this)"> */
export function btn(b){
  document.querySelectorAll(".sv-playing").forEach(x => x.classList.remove("sv-playing"));
  b.classList.add("sv-playing");
  speak(b.dataset.say, { role: b.dataset.role, say: b.dataset.read });
}
export const escAttr = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function voiceList(){ return cfgReady.then(() => CFG.voices); }

const SV = { speak, stop, playScript, setSpeed, setPref, prefs, btn, escAttr, engineAvailable, voiceList, playUrl };
window.SV = SV;
export default SV;
