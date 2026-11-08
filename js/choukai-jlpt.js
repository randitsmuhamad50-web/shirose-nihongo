/* =====================================================================
 * Choukai JLPT (N5–N1) + Pengaturan Tampilan (kolom, ukuran huruf, menu)
 * ---------------------------------------------------------------------
 * Data soal : ./choukai/jlpt-n{5..1}.json  (script, pilihan, kunci, pembahasan)
 * Audio     : ./audio/choukai/n{X}/m{mondai}_{no}.mp3  (voice pack)
 *             Kalau file MP3 belum ada → otomatis pakai TTS browser (ja-JP).
 * Naskah rekaman lengkap: ./audio/choukai/naskah-rekaman.csv
 * ===================================================================== */

const ST = () => window.__SHIROSE_STATE || {};
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const LS = {
  get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e){ return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} },
};

/* ================= PENGATURAN TAMPILAN ================= */
const PREF_KEY = "shirose-display";
const DEF_PREF = { cm: 2, cs: 2, fs: "m", menu: "orbit", exam: 0 };
export function getPrefs(){ return Object.assign({}, DEF_PREF, LS.get(PREF_KEY, {})); }
export function applyDisplayPrefs(){
  const p = getPrefs(), b = document.body;
  if (!b) return;
  b.dataset.fs = p.fs; b.dataset.cm = p.cm; b.dataset.cs = p.cs; b.dataset.menu = p.menu;
}
function setPref(k, v){
  const p = getPrefs(); p[k] = v; LS.set(PREF_KEY, p); applyDisplayPrefs();
  document.querySelectorAll(`[data-pref="${k}"] button`).forEach(btn =>
    btn.classList.toggle("on", String(btn.dataset.v) === String(v)));
}
window.setDisplayPref = setPref;

/** Bar pengaturan. scope: "materi" | "sylabus" | "choukai" | "home" */
export function displayBar(scope = "materi"){
  const p = getPrefs();
  const grp = (k, label, vals) => `
    <div class="disp-grp" data-pref="${k}">
      <span class="disp-lbl">${label}</span>
      ${vals.map(([v, t, title]) => `<button class="${String(p[k]) === String(v) ? "on" : ""}" data-v="${v}" title="${title || t}"
        onclick="setDisplayPref('${k}', ${typeof v === "number" ? v : `'${v}'`})">${t}</button>`).join("")}
    </div>`;
  const font = grp("fs", "Aa", [["s","Kecil"],["m","Sedang"],["l","Besar"]]);
  if (scope === "home") return `<div class="disp-bar">${grp("menu", "Menu", [["orbit","◯ Orbit","Menu melingkar"],["side","▥ Samping","Menu kiri-kanan"]])}</div>`;
  if (scope === "choukai") return `<div class="disp-bar">${font}${grp("exam", "Mode", [[0,"Latihan"],[1,"Ujian","Sembunyikan teks yang di ujian asli hanya diperdengarkan"]])}</div>`;
  const key = scope === "sylabus" ? "cs" : "cm";
  return `<div class="disp-bar">${grp(key, "Kolom", [[1,"1"],[2,"2"],[3,"3"],[4,"4"]])}${font}</div>`;
}

/* ================= DATA CHOUKAI ================= */
const _cache = {};
async function loadChoukai(lvl){
  if (_cache[lvl]) return _cache[lvl];
  try {
    const r = await fetch(`./choukai/jlpt-${lvl}.json`);
    if (!r.ok) throw new Error(r.status);
    _cache[lvl] = await r.json();
  } catch(e){ _cache[lvl] = null; }
  return _cache[lvl];
}
const ANS_KEY = () => `shirose-choukai:${ST().user?.uid || "guest"}`;
const getAns = () => LS.get(ANS_KEY(), {});
const setAns = (a) => LS.set(ANS_KEY(), a);

function secProgress(sec, ans){
  let total = 0, done = 0, ok = 0;
  sec.items.forEach(it => it.qs.forEach((q, qi) => {
    total++;
    const v = ans[`${it.id}#${qi}`];
    if (v != null){ done++; if (v === q.ans) ok++; }
  }));
  return { total, done, ok };
}

/* ================= AUDIO: MP3 → fallback TTS ================= */
const _exists = {};
async function fileExists(url){
  if (url in _exists) return _exists[url];
  try {
    const r = await fetch(url, { method: "HEAD", cache: "no-store" });
    const ct = r.headers.get("content-type") || "";
    _exists[url] = r.ok && !/text\/html/i.test(ct);
  } catch(e){ _exists[url] = false; }
  return _exists[url];
}
let _audio = null, _ttsToken = 0, _playingId = null;
function stopAll(){
  _ttsToken++;
  try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch(e){}
  if (_audio){ try { _audio.pause(); } catch(e){} _audio = null; }
  if (_playingId) setPlayBtn(_playingId, false);
  _playingId = null;
}
window.ckStop = stopAll;
function setPlayBtn(id, on, mode){
  const b = document.getElementById(`ck-play-${id}`);
  if (b){ b.classList.toggle("on", on); b.innerHTML = on ? "⏹ Stop" : "▶ Putar"; }
  const m = document.getElementById(`ck-src-${id}`);
  if (m && mode) m.textContent = mode;
}
function jaVoices(){
  try { return (window.speechSynthesis.getVoices() || []).filter(v => /^ja([-_]|$)/i.test(v.lang)); } catch(e){ return []; }
}
const VOICE = { N:{p:1.0, vi:0}, M:{p:.78, vi:1}, F:{p:1.22, vi:0}, M2:{p:.62, vi:1}, F2:{p:1.42, vi:2} };
function speakLines(lines, rate, id){
  const ss = window.speechSynthesis;
  if (!ss){ window.toast && window.toast("Browser tidak mendukung suara."); return; }
  const tok = ++_ttsToken, vs = jaVoices();
  let i = 0;
  const next = () => {
    if (tok !== _ttsToken) return;
    if (i >= lines.length){ setPlayBtn(id, false); _playingId = null; return; }
    const l = lines[i++], cfg = VOICE[l.s] || VOICE.N;
    const u = new SpeechSynthesisUtterance(l.t.replace(/\s+/g, ""));
    u.lang = "ja-JP"; u.rate = rate; u.pitch = cfg.p;
    if (vs.length) u.voice = vs[cfg.vi % vs.length];
    u.onend = () => setTimeout(next, l.s === "N" ? 650 : 380);
    u.onerror = () => setTimeout(next, 200);
    ss.speak(u);
  };
  try { ss.cancel(); } catch(e){}
  setTimeout(next, 150);
}
async function playItem(lvl, id){
  if (_playingId === id){ stopAll(); return; }
  stopAll();
  const data = await loadChoukai(lvl);
  let it = null, isIntro = id.endsWith("-intro");
  for (const s of data.sections){
    if (isIntro && `${lvl}-m${s.mondai}-intro` === id){ it = { audio: s.instrAudio, script: [{ s:"N", t:s.instr }] }; break; }
    const f = s.items.find(x => x.id === id); if (f){ it = f; break; }
  }
  if (!it) return;
  _playingId = id; setPlayBtn(id, true);
  const rate = { n5:.82, n4:.88, n3:.95, n2:1, n1:1.05 }[lvl] || .95;
  if (await fileExists(it.audio)){
    if (_playingId !== id) return;
    _audio = new Audio(it.audio);
    _audio.onended = () => { setPlayBtn(id, false); _playingId = null; };
    _audio.onerror = () => { setPlayBtn(id, true, "🤖 TTS"); speakLines(it.script, rate, id); };
    setPlayBtn(id, true, "🎙️ Voice pack");
    _audio.play().catch(() => { setPlayBtn(id, true, "🤖 TTS"); speakLines(it.script, rate, id); });
  } else {
    setPlayBtn(id, true, "🤖 TTS");
    speakLines(it.script, rate, id);
  }
}
window.ckPlay = (lvl, id) => playItem(lvl, id);

/* ================= RENDER ================= */
const SPK = { N:"🎙️", M:"👨", F:"👩", M2:"👨‍💼", F2:"👩‍💼" };
const NUM = ["1","2","3","4"];

function cardHtml(lvl, sec, it, ans, exam){
  const qa = it.qs.map((q, qi) => ({ q, qi, v: ans[`${it.id}#${qi}`] }));
  const answered = qa.every(x => x.v != null);
  const hideOpts = exam && !it.printed && !answered;
  const groups = qa.map(({ q, qi, v }) => {
    const head = it.qs.length > 1 ? `<div class="ck-subq">${esc(q.q)}</div>`
      : (!exam || answered) && q.q && !["sokuji","hatsuwa"].includes(sec.type) ? `<div class="ck-q">❓ ${esc(q.q)}</div>` : "";
    const btns = it.opts.map((o, oi) => {
      let cls = "ck-opt";
      if (v != null){ if (oi === q.ans) cls += " ok"; else if (oi === v) cls += " ng"; else cls += " dim"; }
      return `<button class="${cls}" ${v != null ? "disabled" : ""} onclick="ckAnswer('${lvl}','${it.id}',${qi},${oi})">
        <span class="n">${NUM[oi]}</span><span class="t">${hideOpts ? "<i>(didengarkan)</i>" : esc(o)}</span></button>`;
    }).join("");
    const verdict = v == null ? "" : `<div class="ck-verdict ${v === q.ans ? "ok" : "ng"}">${v === q.ans ? "✅ Benar!" : `❌ Kurang tepat — jawaban: ${NUM[q.ans]}`}</div>`;
    return `${head}<div class="ck-opts ${it.opts.length === 3 ? "three" : ""}">${btns}</div>${verdict}`;
  }).join("");
  const scene = sec.type === "hatsuwa" ? `<div class="ck-scene">🖼️ <b>${esc(it.scene)}</b><div class="jp">${esc(it.set)}</div></div>` : "";
  const setting = (!exam || answered) && it.set && sec.type !== "hatsuwa" ? `<div class="ck-set">${esc(it.set)}</div>` : "";
  const script = it.script.map(l => `<div class="ck-line"><span class="s">${SPK[l.s] || ""}</span><span class="t">${esc(l.t)}</span></div>`).join("");
  return `
    <div class="ck-card ${answered ? "done" : ""}" id="ck-card-${it.id}">
      <div class="ck-head">
        <span class="ck-no">${it.no}番</span>
        <button class="btn sm ck-play" id="ck-play-${it.id}" onclick="ckPlay('${lvl}','${it.id}')">▶ Putar</button>
        <span class="ck-src" id="ck-src-${it.id}"></span>
      </div>
      ${scene}${setting}${groups}
      ${answered || !exam ? `
        <details class="ck-script" ${answered ? "" : ""}><summary>📜 Script / transkrip</summary>${script}</details>` : ""}
      ${answered && it.exp ? `<div class="ck-exp">💡 ${esc(it.exp)}</div>` : ""}
    </div>`;
}

window.ckAnswer = async (lvl, id, qi, oi) => {
  const ans = getAns();
  const k = `${id}#${qi}`;
  if (ans[k] != null) return;
  ans[k] = oi; setAns(ans);
  const data = await loadChoukai(lvl);
  const sec = data.sections.find(s => s.items.some(x => x.id === id));
  const it = sec.items.find(x => x.id === id);
  const el = document.getElementById(`ck-card-${id}`);
  if (el) el.outerHTML = cardHtml(lvl, sec, it, ans, !!getPrefs().exam);
  const pr = secProgress(sec, ans);
  const sc = document.getElementById("ck-score");
  if (sc) sc.innerHTML = scoreHtml(pr);
  // Bonus XP sekali per 問題 saat semua soal terjawab
  if (pr.done === pr.total){
    const doneKey = `${ANS_KEY()}:bonus`;
    const got = LS.get(doneKey, {});
    const sk = `${lvl}-m${sec.mondai}`;
    if (!got[sk] && typeof window.awardXP === "function"){
      got[sk] = 1; LS.set(doneKey, got);
      const xp = 5 + pr.ok * 2;
      try { await window.awardXP(xp, Math.ceil(pr.ok / 2)); } catch(e){}
      window.toast && window.toast(`🎧 問題${sec.mondai} selesai: ${pr.ok}/${pr.total} · +${xp} XP`);
    }
  }
};
window.ckReset = (lvl, mn) => {
  const ans = getAns();
  Object.keys(ans).forEach(k => { if (k.startsWith(`${lvl}-m${mn}-`)) delete ans[k]; });
  setAns(ans);
  window.route && window.route(`choukai/${mn}`);
};
function scoreHtml(pr){
  const pct = pr.done ? Math.round(pr.ok / pr.done * 100) : 0;
  return `<b>${pr.ok}</b> benar dari <b>${pr.done}</b> dijawab · ${pr.total} soal${pr.done ? ` · ${pct}%` : ""}`;
}

export async function renderChoukaiJLPT(params){
  stopAll();
  const st = ST(), lvl = (st.level || "n5").toLowerCase();
  const data = await loadChoukai(lvl);
  if (!data) return `<div class="panel"><h2>🎧 Choukai</h2><div class="empty"><div class="emoji">📭</div>Bank soal ${lvl.toUpperCase()} belum tersedia.</div></div>`;
  const ans = getAns(), p = getPrefs();
  const mn = parseInt((params || [])[0]);
  const sec = data.sections.find(s => s.mondai === mn);

  if (!sec){
    const cards = data.sections.map(s => {
      const pr = secProgress(s, ans), pct = Math.round(pr.done / pr.total * 100);
      return `<div class="ck-sec" onclick="route('choukai/${s.mondai}')">
        <div class="ck-sec-top"><span class="ck-mondai">問題${s.mondai}</span><span class="ck-pct">${pr.ok}/${pr.total}</span></div>
        <div class="ck-sec-jp">${esc(s.jp)}</div>
        <div class="ck-sec-ro">${esc(s.romaji)} · ${s.items.length} soal</div>
        <div class="ck-sec-desc">${esc(s.desc)}</div>
        <div class="ck-bar"><div style="width:${pct}%"></div></div>
      </div>`;
    }).join("");
    const total = data.sections.reduce((a, s) => a + s.items.length, 0);
    return `
      <div class="panel ck-wrap">
        <h2>🎧 聴解 Choukai · ${esc(data.title)}</h2>
        <p class="ck-intro">${esc(data.karakter)}</p>
        <p class="ck-intro">📦 ${data.sections.length} tipe soal · ${total} soal · audio dari voice pack, otomatis TTS jika file belum ada.</p>
        ${displayBar("choukai")}
        <div class="ck-sec-grid">${cards}</div>
      </div>`;
  }

  const pr = secProgress(sec, ans);
  const nav = data.sections.map(s => `<button class="${s.mondai === mn ? "on" : ""}" onclick="route('choukai/${s.mondai}')">問題${s.mondai}</button>`).join("");
  return `
    <div class="panel ck-wrap">
      <div class="haf-topbar">
        <button class="btn ghost sm" onclick="route('choukai')">← Choukai</button>
        <span style="color:var(--gray); font-weight:700;">${lvl.toUpperCase()}</span>
        <button class="btn ghost sm" onclick="route('home')">🏠 Home</button>
      </div>
      <div class="chunk-tabs ck-nav">${nav}</div>
      <h2>問題${sec.mondai} · ${esc(sec.jp)} <small>${esc(sec.romaji)}</small></h2>
      <p class="ck-intro">${esc(sec.desc)}</p>
      <div class="ck-instr">
        <button class="btn ghost sm ck-play" id="ck-play-${lvl}-m${sec.mondai}-intro" onclick="ckPlay('${lvl}','${lvl}-m${sec.mondai}-intro')">▶ Putar</button>
        <span>${esc(sec.instr)}</span>
      </div>
      ${displayBar("choukai")}
      <div class="ck-score" id="ck-score">${scoreHtml(pr)}</div>
      <div class="ck-list">${sec.items.map(it => cardHtml(lvl, sec, it, ans, !!p.exam)).join("")}</div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:16px;">
        <button class="btn ghost" onclick="ckReset('${lvl}', ${sec.mondai})">🔄 Ulangi 問題${sec.mondai}</button>
        ${data.sections.find(s => s.mondai === mn + 1) ? `<button class="btn" onclick="route('choukai/${mn + 1}')">Lanjut 問題${mn + 1} →</button>` : ""}
      </div>
    </div>`;
}

// Mode ujian berubah → render ulang halaman choukai
const _origSet = setPref;
window.setDisplayPref = (k, v) => {
  _origSet(k, v);
  if (k === "exam" && (location.hash || "").startsWith("#choukai")) window.route && window.route(location.hash.slice(1));
};
window.addEventListener("hashchange", () => { if (!(location.hash || "").startsWith("#choukai")) stopAll(); });
applyDisplayPrefs();
