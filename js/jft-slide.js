/* =====================================================================
 * JFT · Slide Bunpou Irodori (ala buku interaktif SSW)
 *  - Pilih level: A1 (入門) · A2 (初級1) · A2 (初級2) → pilih bab → slideshow
 *  - Tiap bab: pola bunpou (pola, arti, penjelasan, contoh) dengan tombol audio 🔊
 *  - Sumber slide: materi Shirose (data/bunpou-ir*.json + data/kosakata-ir*.json) — ada unduhan .pptx
 *  - Tab "PPT Resmi JF": tautan unduhan PPT resmi Irodori (Japan Foundation) + file lokal bila sudah diunggah.
 * Route: #jft-slide, #jft-slide/{ir0|ir1|ir2}, #jft-slide/{lv}/{bab}
 * ===================================================================== */
const S = () => window.__SHIROSE_STATE || window.state || {};
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const rb = (s) => esc(s).replace(/([一-鿿々]+)\[([^\]]+)\]/g, "<ruby>$1<rt>$2</rt></ruby>").replace(/\[([^\]]+)\]/g, "");
const plain = (s) => String(s ?? "").replace(/\[[^\]]*\]/g, "");
const LS = { get(k, d) { try { return localStorage.getItem(k) ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
const LV = {
  ir0: { jp: "入門", ke: "A1", nama: "Starter · A1", file: "いろどり入門", url: "starter-5", dir: "2024/08" },
  ir1: { jp: "初級1", ke: "A2", nama: "Shokyuu 1 · A2", file: "いろどり初級1", url: "elementary-1-8", dir: "" },
  ir2: { jp: "初級2", ke: "A2", nama: "Shokyuu 2 · A2", file: "いろどり初級2", url: "", dir: "" },
};
const cache = {};
const dat = async (u) => cache[u] || (cache[u] = fetch(u).then(r => r.json()).catch(() => []));
const sayBtn = (t, role) => `<button class="say-mini jfs-say" title="Dengarkan" data-say="${esc(t)}" data-role="${role}" onclick="event.stopPropagation();JFTS.say(this)">🔊</button>`;
const rubyOn = () => LS.get("shirose-jfs-ruby", "1") !== "0";
const autoOn = () => LS.get("shirose-jfs-auto", "0") === "1";

/* ---------- daftar ---------- */
async function renderList(lvIn) {
  const st = S();
  if (!st.user) { setTimeout(() => route("login"), 0); return '<div class="loading">Memuat…</div>'; }
  const lv = LV[lvIn] ? lvIn : (LV[st.level] ? st.level : "ir0");
  const tabs = Object.keys(LV).map(l => `<button class="${l === lv ? "on" : ""}" onclick="route('jft-slide/${l}')">${LV[l].ke} · ${LV[l].jp}</button>`).join("");
  const bun = await dat(`./data/bunpou-${lv}.json`);
  const babs = [...new Set(bun.map(x => x.bab))].sort((a, b) => a - b);
  const kartu = babs.map(b => {
    const n = bun.filter(x => x.bab === b).length;
    return `<button class="jfs-bab" onclick="route('jft-slide/${lv}/${b}')"><b>Bab ${b}</b><small>${n} pola</small></button>`;
  }).join("");
  const L = LV[lv];
  const idx = await dat("./data/jft/ppt/index.json");
  const pptPanel = idx.length ? `<div class="panel"><h3>📽️ PPT resmi Irodori (interaktif, ketuk ikon 🔊)</h3><div class="jfs-grid">${idx.filter(x => x.lv === lv).map(x => `<button class="jfs-bab" onclick="route('jft-ppt/${x.id}')"><b>${esc(x.judul)}</b><small>PPT resmi</small></button>`).join("") || '<small style="color:var(--gray)">Belum ada PPT resmi untuk level ini.</small>'}</div></div>` : "";
  const resmiTautan = `<div class="jfs-resmi">
      <h3>PPT resmi Irodori (Japan Foundation)</h3>
      <p>PPT kelas resmi (dengan audio tertanam) dibagikan Japan Foundation. Unduh langsung dari situs resmi, atau dari halaman Yangon:</p>
      <div class="jfs-links">
        <a class="btn ghost sm" target="_blank" rel="noopener" href="https://yg.jpf.go.jp/irodori/starter-5/">⬇ A1 入門 (L01–L18)</a>
        <a class="btn ghost sm" target="_blank" rel="noopener" href="https://yg.jpf.go.jp/irodori/elementary-1-2/">⬇ A2 初級1 (L07–L18)</a>
        <a class="btn ghost sm" target="_blank" rel="noopener" href="https://yg.jpf.go.jp/ja/irodori/elementary-1-8/">⬇ A2 初級1 (L01–L17)</a>
        <a class="btn ghost sm" target="_blank" rel="noopener" href="https://www.irodori.jpf.go.jp/">🌐 Situs Irodori</a>
      </div>
      <small>Hak cipta PPT resmi ada pada The Japan Foundation. Slide “Shirose” di bawah dibuat sendiri dari materi bunpou &amp; kosakata Irodori kita.</small>
    </div>`;
  return `
  <div class="jfs-wrap">
    <div class="jft-crumb"><a href="#jft">JFT-Basic</a> › Slide Irodori</div>
    <div class="panel">
      <h2>🎞️ Slide Irodori — ${L.nama}</h2>
      <div class="jfs-tabs">${tabs}</div>
      <p style="color:var(--gray);font-size:14px;margin:8px 0">Slide per bab: pola bunpou → contoh. Ketuk 🔊 untuk audio, panah/geser untuk pindah slide.</p>
      <div class="jfs-grid">${kartu}</div>
      <div style="margin-top:12px"><a class="btn sm" href="./data/jft/slide/${lv}.pptx" download>⬇ Unduh PPTX ${L.ke} ${L.jp} (semua bab)</a></div>
    </div>
    ${pptPanel}
    <div class="panel">${resmiTautan}</div>
  </div>`;
}

/* ---------- slideshow ---------- */
let SL = null;   // { lv, bab, slides, i }
async function buildSlides(lv, bab) {
  const [bun, kos] = await Promise.all([dat(`./data/bunpou-${lv}.json`), dat(`./data/kosakata-${lv}.json`)]);
  const pols = bun.filter(x => x.bab === bab);
  const words = kos.filter(x => x.bab === bab && x.kata && x.kana && x.arti);
  const slides = [{ t: "title", judul: `Bab ${bab}`, sub: `${LV[lv].nama} · ${pols.length} pola` }];
  pols.forEach((p, k) => {
    slides.push({ t: "pola", p, k: k + 1, n: pols.length });
    if (p.contoh) slides.push({ t: "contoh", p, k: k + 1, n: pols.length });
  });
  slides.push({ t: "end", bab });
  return slides;
}
const slideHtml = (s, lv) => {
  if (s.t === "title") return `<div class="jfs-s title"><div class="jfs-big">${esc(s.judul)}</div><div class="jfs-sub">${esc(s.sub)}</div></div>`;
  if (s.t === "vocab") return `<div class="jfs-s"><div class="jfs-h">語彙 Kosakata <small>${s.hal[0]}/${s.hal[1]}</small></div><div class="jfs-vgrid">${s.items.map(w => `
      <div class="jfs-v"><div class="jfs-vk">${rb(w.kata)}</div><div class="jfs-vr">${esc(w.kana)}</div><div class="jfs-va">${esc(w.arti)}</div>${sayBtn(plain(w.kata), "kosakata")}</div>`).join("")}</div></div>`;
  if (s.t === "pola") return `<div class="jfs-s"><div class="jfs-h">文型 Pola ${s.k}/${s.n}</div><div class="jfs-pola">${rb(s.p.pola)}</div><div class="jfs-pen">${esc(s.p.penjelasan || s.p.arti)}</div>${s.p.note ? `<div class="jfs-note">💡 ${esc(s.p.note)}</div>` : ""}</div>`;
  if (s.t === "contoh") return `<div class="jfs-s"><div class="jfs-h">例文 Contoh ${s.k}/${s.n}</div><div class="jfs-polasm">${rb(s.p.pola)}</div><div class="jfs-ex">${rb(s.p.contoh)} ${sayBtn(plain(s.p.contoh), "bunpou-contoh")}</div><div class="jfs-id">${esc(s.p.arti_contoh)}</div></div>`;
  return `<div class="jfs-s title"><div class="jfs-big">お疲れさま！</div><div class="jfs-sub">Bab ${s.bab} selesai</div><div style="margin-top:14px"><button class="btn" onclick="route('jft-slide/${lv}')">← Pilih bab lain</button> ${s.bab < 18 ? `<button class="btn gold" onclick="route('jft-slide/${lv}/${s.bab + 1}')">Bab ${s.bab + 1} →</button>` : ""}</div></div>`;
};
function paint() {
  const el = document.getElementById("jfs-stage"); if (!el || !SL) return;
  const s = SL.slides[SL.i];
  el.innerHTML = slideHtml(s, SL.lv);
  el.className = "jfs-stage" + (rubyOn() ? "" : " noruby");
  document.getElementById("jfs-pos").textContent = `${SL.i + 1} / ${SL.slides.length}`;
  document.getElementById("jfs-bar").style.width = `${((SL.i + 1) / SL.slides.length) * 100}%`;
  if (autoOn() && (s.t === "contoh")) setTimeout(() => el.querySelector(".jfs-say")?.click(), 250);
}
async function renderSlides(lv, bab) {
  const st = S();
  if (!st.user) { setTimeout(() => route("login"), 0); return '<div class="loading">Memuat…</div>'; }
  const slides = await buildSlides(lv, bab);
  const i0 = SL && SL.lv === lv && SL.bab === bab ? SL.i : 0;
  SL = { lv, bab, slides, i: Math.min(i0, slides.length - 1) };
  setTimeout(() => { paint(); bind(); }, 0);
  return `
  <div class="jfs-wrap" id="jfs-wrap">
    <div class="jfs-top">
      <button class="btn ghost sm" onclick="route('jft-slide/${lv}')">← Bab</button>
      <span id="jfs-pos" style="font-weight:700;color:var(--gray)"></span>
      <span class="jfs-tools">
        <button class="btn ghost sm" id="jfs-ruby" onclick="JFTS.ruby()">ふりがな ${rubyOn() ? "ON" : "OFF"}</button>
        <button class="btn ghost sm" id="jfs-auto" onclick="JFTS.auto()">🔊 Auto ${autoOn() ? "ON" : "OFF"}</button>
        <button class="btn ghost sm" onclick="JFTS.full()">⛶</button>
      </span>
    </div>
    <div class="jfs-progress"><i id="jfs-bar"></i></div>
    <div class="jfs-stage" id="jfs-stage"></div>
    <div class="jfs-nav"><button class="btn" onclick="JFTS.go(-1)">‹ Sebelumnya</button><button class="btn gold" onclick="JFTS.go(1)">Berikutnya ›</button></div>
  </div>`;
}
let keyBound = false, tx = 0;
function bind() {
  if (!keyBound) {
    keyBound = true;
    document.addEventListener("keydown", (e) => { if (!document.getElementById("jfs-stage")) return; if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); JFTS.go(1); } else if (e.key === "ArrowLeft") JFTS.go(-1); });
  }
  const st = document.getElementById("jfs-stage"); if (!st) return;
  st.addEventListener("touchstart", (e) => { tx = e.changedTouches[0].clientX; }, { passive: true });
  st.addEventListener("touchend", (e) => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 60) JFTS.go(dx < 0 ? 1 : -1); }, { passive: true });
}
const JFTS = window.JFTS = {
  say(b) { document.querySelectorAll(".sv-playing").forEach(x => x.classList.remove("sv-playing")); b.classList.add("sv-playing"); window.SV?.speak(b.dataset.say, { role: b.dataset.role, level: SL?.lv }); },
  ppGo(d) { if (!PP) return; ppStop(); PP.i = Math.max(0, Math.min(PP.m.slides.length - 1, PP.i + d)); ppPaint(); },
  ppPlay(k, el) { if (!PP) return; if (el?.classList.contains("on")) { ppStop(); return; } ppPlay(PP.m.slides[PP.i].au[k].src, el); },
  ppAll() { if (!PP) return; const au = PP.m.slides[PP.i].au; const hs = [...document.querySelectorAll(".jfs-hot")]; const run = (k) => { if (k >= au.length) return; ppPlay(au[k].src, hs[k], () => run(k + 1)); }; run(0); },
  go(d) { if (!SL) return; SL.i = Math.max(0, Math.min(SL.slides.length - 1, SL.i + d)); paint(); },
  ruby() { LS.set("shirose-jfs-ruby", rubyOn() ? "0" : "1"); document.getElementById("jfs-ruby").textContent = `ふりがな ${rubyOn() ? "ON" : "OFF"}`; paint(); },
  auto() { LS.set("shirose-jfs-auto", autoOn() ? "0" : "1"); document.getElementById("jfs-auto").textContent = `🔊 Auto ${autoOn() ? "ON" : "OFF"}`; },
  full() { const w = document.getElementById("jfs-wrap"); if (document.fullscreenElement) document.exitFullscreen(); else w?.requestFullscreen?.(); },
};
/* ---------- viewer PPT resmi (gambar slide + hotspot audio dari PPTX) ---------- */
let PP = null, ppAudio = null;
async function renderPpt(id) {
  const st = S();
  if (!st.user) { setTimeout(() => route("login"), 0); return '<div class="loading">Memuat…</div>'; }
  const m = await fetch(`./data/jft/ppt/${id}/m.json`).then(r => r.json()).catch(() => null);
  if (!m) return '<div class="panel">PPT tidak ditemukan.</div>';
  const info = ((await dat("./data/jft/ppt/index.json")).find(x => x.id === id)) || { judul: id, lv: "ir0" };
  PP = { id, m, i: PP && PP.id === id ? PP.i : 0, info };
  setTimeout(() => { ppPaint(); ppBind(); }, 0);
  return `
  <div class="jfs-wrap" id="jfs-wrap">
    <div class="jfs-top">
      <button class="btn ghost sm" onclick="route('jft-slide/${info.lv}')">← Daftar</button>
      <span id="jfs-pos" style="font-weight:700;color:var(--gray)"></span>
      <span class="jfs-tools"><button class="btn ghost sm" onclick="JFTS.ppAll()">▶ Putar semua audio</button><button class="btn ghost sm" onclick="JFTS.full()">⛶</button></span>
    </div>
    <div class="jfs-progress"><i id="jfs-bar"></i></div>
    <div class="jfs-pptbox" id="jfs-ppt"></div>
    <div class="jfs-nav"><button class="btn" onclick="JFTS.ppGo(-1)">‹ Sebelumnya</button><button class="btn gold" onclick="JFTS.ppGo(1)">Berikutnya ›</button></div>
  </div>`;
}
function ppStop() { if (ppAudio) { try { ppAudio.pause(); } catch (e) {} ppAudio = null; } document.querySelectorAll(".jfs-hot.on").forEach(x => x.classList.remove("on")); }
function ppPlay(src, el, then) {
  ppStop(); const a = ppAudio = new Audio(`./data/jft/ppt/${PP.id}/${src}`); el?.classList.add("on");
  a.onended = () => { el?.classList.remove("on"); then?.(); }; a.onerror = () => el?.classList.remove("on"); a.play().catch(() => el?.classList.remove("on"));
}
function ppPaint() {
  const box = document.getElementById("jfs-ppt"); if (!box || !PP) return;
  const sl = PP.m.slides[PP.i];
  box.innerHTML = `<div class="jfs-pptwrap" style="aspect-ratio:${PP.m.w}/${PP.m.h}"><img src="./data/jft/ppt/${PP.id}/${sl.img}" alt="Slide ${PP.i + 1}" draggable="false">${sl.au.map((a, k) => `<button class="jfs-hot" data-k="${k}" title="Putar audio" style="left:${a.x}%;top:${a.y}%;width:${a.w}%;height:${a.h}%" onclick="JFTS.ppPlay(${k},this)"></button>`).join("")}</div>`;
  document.getElementById("jfs-pos").textContent = `${PP.i + 1} / ${PP.m.slides.length}`;
  document.getElementById("jfs-bar").style.width = `${((PP.i + 1) / PP.m.slides.length) * 100}%`;
}
function ppBind() {
  if (!window.__jfsPpKey) { window.__jfsPpKey = true; document.addEventListener("keydown", (e) => { if (!document.getElementById("jfs-ppt")) return; if (e.key === "ArrowRight") JFTS.ppGo(1); else if (e.key === "ArrowLeft") JFTS.ppGo(-1); }); }
  const b = document.getElementById("jfs-ppt"); if (!b) return; let x0 = 0;
  b.addEventListener("touchstart", (e) => { x0 = e.changedTouches[0].clientX; }, { passive: true });
  b.addEventListener("touchend", (e) => { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 70) JFTS.ppGo(dx < 0 ? 1 : -1); }, { passive: true });
}
window.addEventListener("hashchange", () => ppStop());
export const JFTS_ROUTES = {
  "jft-ppt": (p) => renderPpt(Array.isArray(p) ? p[0] : String(p || "")),
  "jft-slide": (p) => { const [lv, bab] = Array.isArray(p) ? p : String(p || "").split("/"); return LV[lv] && +bab ? renderSlides(lv, +bab) : renderList(lv); },
};
