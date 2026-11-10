/* =====================================================================
 * SSW (特定技能) — UI & rute. Terintegrasi dengan login/dashboard yang ada.
 *
 * Rute (hash):  #ssw                         pilih bidang (pulau melayang)
 *               #ssw-peta/{slug}             peta pembelajaran bidang
 *               #ssw-bab/{slug}/{bab}        pengantar bab + pilih mode/bahasa
 *               #ssw-baca/{slug}/{sub}/{lengkap|ringkas}/{id|jp}
 *               #ssw-buku/{slug}/{id|jp}/{hal}   buku interaktif (halaman asli)
 *               #ssw-kosa/{slug}/{all|babN}  bank kosakata
 *               #ssw-kartu/{slug}/{scope}/{review|semua|belum}   flashcard SM-2
 *               #ssw-kuis/{slug}[/{quizId}]  daftar & pengerjaan kuis
 *               #ssw-progres                 ringkasan progres siswa
 * ===================================================================== */
import {
  initSswCore, esc, rich, plain, spoken, shuffle, seeded, isGuru, loadBidang, bidangBySlug, loadPack, getProgress, touch, flush, logAct,
  babProgress, STATUS_LABEL, babStatus, siswaBolehBab, newCard, cardState, schedule, cardStats, buildQueue, fullQuizzes, readingQuiz, recordQuiz, DAY
} from "./ssw-core.js";
import { islandSVG, buildingSVG } from "./ssw-art.js";

let FB = null;
export function initSsw(fb) { FB = fb; initSswCore(fb); }

const toast = (m) => (window.toast ? window.toast(m) : console.log(m));
const LSget = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch (e) { return d; } };
const LSset = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const getLang = () => LSget("shirose-ssw-lang", "id") === "jp" ? "jp" : "id";
const setLang = (l) => LSset("shirose-ssw-lang", l);
const getMode = () => LSget("shirose-ssw-mode", "lengkap") === "ringkas" ? "ringkas" : "lengkap";
const setMode = (m) => LSset("shirose-ssw-mode", m);
const ruby = () => LSget("shirose-ssw-ruby", "1") !== "0";
const applyRuby = () => document.body.classList.toggle("sw-noruby", !ruby());
const L = (o, lang) => (o && (o[lang] ?? o.id ?? o.jp)) || "";
const pageFile = (slug, lang, n) => `./assets/ssw/${slug}/${lang}/p${String(n).padStart(2, "0")}.webp`;
const AUDIO_LEVEL = { "building-cleaning": "ssw-bc" };

function say(text, slug) {
  const t = spoken(text); if (!t) return;
  try { if (window.SV && window.SV.speak) { window.SV.speak(t, { role: "kosakata", level: AUDIO_LEVEL[slug] || "ssw-bc" }); return; } } catch (_) {}
  try { const u = new SpeechSynthesisUtterance(t); u.lang = "ja-JP"; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (_) { toast("Suara tidak tersedia di perangkat ini"); }
}

const crumbs = (parts) => `<div class="sw-crumbs">${parts.map((p, i) => p.go ? `<a onclick="${p.go}">${p.t}</a>` : `<b>${p.t}</b>`).join(" <span>›</span> ")}</div>`;
const wrap = (inner, cls = "") => `<div class="sw-wrap ${cls}">${inner}</div>`;
const msgPage = (emoji, title, text, back = "route('ssw')") => wrap(`
  <div class="sw-panel sw-center"><div class="sw-emoji">${emoji}</div><h2>${title}</h2><p class="sw-muted">${text}</p>
  <button class="btn" onclick="${back}">← Kembali</button></div>`);

/** Cek akses bidang. Konfigurasi dibaca dari Firestore (dilindungi rules), bukan sekadar menyembunyikan tombol. */
async function gate(slug) {
  const b = await bidangBySlug(slug);
  if (!b) return { err: msgPage("🧭", "Bidang tidak ditemukan", "Bidang SSW ini belum terdaftar.") };
  if (!b.aktif && !isGuru()) return { err: msgPage("🔒", `${esc(b.nama)} belum tersedia`, "Materi bidang ini sedang ditutup guru atau belum dibuka. Progres belajarmu tidak hilang dan tetap tersimpan.") };
  let pack;
  try { pack = await loadPack(slug); }
  catch (e) { return { err: msgPage("🚧", `${esc(b.nama)} belum tersedia`, "Materi untuk bidang ini belum diunggah.") }; }
  const P = await getProgress(slug);
  return { b, pack, P };
}
const visibleChapters = (b, pack) => pack.chapters.filter(c => siswaBolehBab(b, c.id));

/* ============================== HUB: pulau melayang ============================== */
async function renderHub() {
  applyRuby();
  const list = await loadBidang();
  const guru = isGuru();
  const isl = list.map((b, i) => {
    const open = b.aktif || guru;
    const tag = b.aktif ? (b.hasContent === false ? "Segera" : "Tersedia") : (guru ? "Nonaktif · guru" : "Belum tersedia");
    const art = b.gambar ? `<img class="sw-isl-img" src="${esc(b.gambar)}" alt="" loading="lazy">` : islandSVG(b.tema || "generic", { dim: !open });
    return `<button class="sw-isl ${b.aktif ? "on" : "off"} pos${i % 4}" data-slug="${esc(b.slug)}" style="--d:${(i * 0.7).toFixed(1)}s" onclick="SSW.pick('${esc(b.slug)}')" aria-label="${esc(b.nama)}">
      ${art}<span class="sw-isl-name"><b>${esc(b.nama)}</b><i class="jp">${esc(b.jp || "")}</i></span><span class="sw-isl-tag ${b.aktif ? "ok" : ""}">${tag}</span></button>`;
  }).join("");
  setTimeout(() => { window.__swHubInit && window.__swHubInit(); }, 0);
  return `<div class="sw-wrap sw-hub">
    <div class="sw-sky" aria-hidden="true"><i class="sw-cloud c1"></i><i class="sw-cloud c2"></i><i class="sw-cloud c3"></i></div>
    <div class="sw-top">
      <button class="sw-back" onclick="route('pilih-level')">← Pilih level</button>
      ${guru ? `<button class="sw-back" onclick="location.href='./teacher.html#ssw'">師 Kelola SSW</button>` : ""}
    </div>
    <div class="sw-head"><div class="jp">特定技能 · 世界の学習島</div><h1>SSW — Pilih Bidang</h1>
      <p>Ketuk sebuah pulau untuk melihat bidangnya. Tiap pulau adalah satu bidang pekerjaan SSW.</p></div>
    <div class="sw-world" id="sw-world">${isl || '<div class="sw-muted">Belum ada bidang.</div>'}</div>
    <div class="sw-sheet" id="sw-sheet" hidden></div>
  </div>`;
}

/* ============================== PETA PEMBELAJARAN ============================== */
const NODE_BLD = ["training", "hotel", "maint", "exam"];
function nodeSVG(c, x, y, size, st, label, sub, pct, go) {
  const col = { belum: "#8b93b5", proses: "#f5b83d", selesai: "#37c58a", ulang: "#ef6a6a" }[st];
  const w = size, h = size * 110 / 120;
  return `<g class="sw-node st-${st}" onclick="${go}" role="button" tabindex="0" aria-label="${esc(label)}">
    <svg x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" viewBox="0 0 120 110">${buildingSVG(c).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg>
    <g transform="translate(${x} ${y + h / 2 + 10})"><text class="sw-nl" text-anchor="middle" y="0">${esc(label)}</text><text class="sw-ns" text-anchor="middle" y="15">${esc(sub)}</text></g>
    <g transform="translate(${x + w / 2 - 6} ${y - h / 2 + 4})"><circle r="15" fill="#161b36" stroke="${col}" stroke-width="3"/><text class="sw-np" text-anchor="middle" y="4" fill="${col}">${pct == null ? "★" : pct + "%"}</text></g>
  </g>`;
}
function mapSVG(nodes, vertical) {
  const n = nodes.length;
  let W, H, pts;
  if (vertical) { W = 360; const step = 200; H = 90 + (n - 1) * step + 150; pts = nodes.map((_, i) => [i % 2 ? 250 : 110, 100 + i * step]); }
  else { H = 420; const step = Math.min(250, 760 / Math.max(1, n - 1)); W = 140 + (n - 1) * step + 140; pts = nodes.map((_, i) => [120 + i * step, i % 2 ? 270 : 150]); }
  let d = `M ${pts[0][0]} ${pts[0][1] + 40}`;
  for (let i = 1; i < n; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    d += vertical ? ` C ${x0} ${y0 + 110}, ${x1} ${y1 - 110}, ${x1} ${y1 + 40}` : ` C ${x0 + 90} ${y0 + 40}, ${x1 - 90} ${y1 + 40}, ${x1} ${y1 + 40}`;
  }
  const flag = `<g class="sw-flag"><path d="M0 0 V-26" stroke="#e9e3d0" stroke-width="2"/><path class="wave" d="M0 -26 L16 -21 L0 -15Z" fill="#ef6a9a"/></g>`;
  return `<svg class="sw-map-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin meet" xmlns="http://www.w3.org/2000/svg">
    <path d="${d}" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="14" stroke-linecap="round" transform="translate(0 4)"/>
    <path d="${d}" fill="none" stroke="#f3e6b8" stroke-width="10" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="#fff7d6" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 12" class="sw-dash"/>
    ${nodes.map((nd, i) => nodeSVG(nd.bld, pts[i][0], pts[i][1], vertical ? 128 : 136, nd.st, nd.label, nd.sub, nd.pct, nd.go)).join("")}
    <g transform="translate(${pts[0][0] - 74} ${pts[0][1] + 10})">${flag}</g>
  </svg>`;
}
async function renderPeta([slug]) {
  applyRuby();
  const g = await gate(slug); if (g.err) return g.err;
  const { b, pack, P } = g;
  const chs = visibleChapters(b, pack);
  const nodes = chs.map((c, i) => {
    const pr = babProgress(P, c, pack.vocab);
    return { bld: NODE_BLD[i] || "training", st: pr.status, label: `BAB ${c.no}`, sub: L(c.title, "id"), pct: pr.pct, go: `route('ssw-bab/${slug}/${c.id}')` };
  });
  const qDone = [...chs.map(c => [1, 2, 3].map(n => `${c.id}-q${n}`)).flat(), "full-q1", "full-q2", "full-q3"].filter(q => P.quiz[q]).length;
  nodes.push({ bld: "exam", st: qDone ? "proses" : "belum", label: "EVALUASI", sub: "試験センター", pct: null, go: `route('ssw-kuis/${slug}')` });
  const st = cardStats(P, pack.vocab);
  const last = P.last;
  const draftNote = isGuru() && pack.chapters.some(c => babStatus(b, c.id) !== "published") ? `<div class="sw-note">Mode guru: bab Draft/Hidden tetap terlihat di sini sebagai pratinjau.</div>` : "";
  return `<div class="sw-wrap sw-mapwrap">
    <div class="sw-sky" aria-hidden="true"><i class="sw-cloud c1"></i><i class="sw-cloud c2"></i><i class="sw-cloud c3"></i></div>
    ${crumbs([{ t: "SSW", go: "route('ssw')" }, { t: esc(b.nama) }])}
    <div class="sw-head compact"><div class="jp">${esc(b.jp || "")}</div><h1>${esc(b.nama)}</h1><p>Ketuk sebuah bangunan untuk masuk ke babnya.</p></div>
    ${draftNote}
    <div class="sw-map sw-map-p">${mapSVG(nodes, true)}</div>
    <div class="sw-map sw-map-l">${mapSVG(nodes, false)}</div>
    <div class="sw-actions">
      ${last ? `<button class="btn" onclick="route('${esc(last.route)}')">▶ Lanjutkan: ${esc(last.label)}</button>` : ""}
      <button class="btn ghost" onclick="route('ssw-kartu/${slug}/all/review')">🃏 Flashcard${st.due ? ` · ${st.due} jatuh tempo` : ""}</button>
      <button class="btn ghost" onclick="route('ssw-kosa/${slug}/all')">📚 Kosakata (${st.total})</button>
      <button class="btn ghost" onclick="route('ssw-buku/${slug}/${getLang()}/1')">📖 Buku interaktif</button>
      <button class="btn ghost" onclick="route('ssw-kuis/${slug}')">📝 Kuis</button>
    </div>
    <div class="sw-attr">Materi: ${esc(pack.chapters[0]?.source || "")}</div>
  </div>`;
}

/* ============================== PENGANTAR BAB ============================== */
async function renderBab([slug, babId]) {
  applyRuby();
  const g = await gate(slug); if (g.err) return g.err;
  const { b, pack, P } = g;
  const c = pack.chapters.find(x => x.id === babId);
  if (!c) return msgPage("🧭", "Bab tidak ditemukan", "Bab ini tidak ada.", `route('ssw-peta/${slug}')`);
  if (!siswaBolehBab(b, c.id)) return msgPage("🔒", "Bab belum dibuka", "Guru belum mempublikasikan bab ini.", `route('ssw-peta/${slug}')`);
  const lang = getLang(), mode = getMode();
  const pr = babProgress(P, c, pack.vocab);
  const subs = c.subs.map(s => `<li><a onclick="SSW.go('${slug}','${s.id}')" class="${P.read[s.id] ? "done" : ""}"><span class="n">${s.no}</span><span class="t">${rich(L(s.title, "id"), { ruby: false })}<small class="jp">${rich(L(s.title, "jp"))}</small></span><span class="ck">${P.read[s.id] ? "✓" : "›"}</span></a></li>`).join("");
  const qz = (pack.quiz.bab?.[c.id] || []);
  const words = pack.vocab.filter(v => v.bab === c.id);
  return wrap(`
    ${crumbs([{ t: "SSW", go: "route('ssw')" }, { t: esc(b.nama), go: `route('ssw-peta/${slug}')` }, { t: `BAB ${c.no}` }])}
    <div class="sw-head compact"><div class="jp">${rich(L(c.title, "jp"))}</div><h1>BAB ${c.no} — ${esc(L(c.title, "id"))}</h1><p>${esc(L(c.intro, "id"))}</p>
      <div class="sw-bar"><i style="width:${pr.pct}%"></i></div><small class="sw-muted">${pr.pct}% · ${STATUS_LABEL[pr.status]}</small></div>
    <div class="sw-panel"><h2>Pilih cara belajar</h2>
      <div class="sw-choice" id="sw-mode">
        <button class="${mode === "lengkap" ? "on" : ""}" data-v="lengkap" onclick="SSW.setM('lengkap')"><b>A. Materi Lengkap</b><span>Seluruh penjelasan, prosedur, catatan keselamatan.</span></button>
        <button class="${mode === "ringkas" ? "on" : ""}" data-v="ringkas" onclick="SSW.setM('ringkas')"><b>B. Ringkasan Materi</b><span>Inti, poin penting, kesalahan, potensi soal ujian.</span></button>
      </div>
      <div class="sw-seg" id="sw-lang"><button class="${lang === "jp" ? "on" : ""}" data-v="jp" onclick="SSW.setL('jp')">日本語</button><button class="${lang === "id" ? "on" : ""}" data-v="id" onclick="SSW.setL('id')">Indonesia</button></div>
      <button class="btn sw-big" onclick="SSW.go('${slug}','${c.subs[0].id}')">Mulai belajar ›</button>
    </div>
    <div class="sw-panel"><h2>Subbab</h2><ol class="sw-subs">${subs}</ol></div>
    <div class="sw-panel"><h2>Latihan bab ini</h2><div class="sw-actions left">
      <button class="btn ghost" onclick="route('ssw-kosa/${slug}/${c.id}')">📚 Kosakata BAB ${c.no} (${words.length})</button>
      <button class="btn ghost" onclick="route('ssw-kartu/${slug}/${c.id}/review')">🃏 Flashcard BAB ${c.no}</button>
      ${qz.map((q, i) => `<button class="btn ghost" onclick="route('ssw-kuis/${slug}/${q.id}')">📝 Kuis ${i + 1}${P.quiz[q.id] ? ` · ${P.quiz[q.id].best}%` : ""}</button>`).join("")}
    </div></div>`);
}

/* ============================== BACA MATERI ============================== */
function blocksHTML(arr) {
  return (arr || []).map(b => {
    if (b.h) return `<h3>${rich(b.h)}</h3>`;
    if (b.p) return `<p>${rich(b.p)}</p>`;
    if (b.ul) return `<ul>${b.ul.map(x => `<li>${rich(x)}</li>`).join("")}</ul>`;
    if (b.ol) return `<ol>${b.ol.map(x => `<li>${rich(x)}</li>`).join("")}</ol>`;
    if (b.note) return `<div class="sw-note">${rich(b.note)}</div>`;
    return "";
  }).join("");
}
function summaryHTML(s) {
  if (!s) return "";
  const box = (t, cls, arr) => arr && arr.length ? `<div class="sw-sbox ${cls}"><h4>${t}</h4><ul>${arr.map(x => `<li>${rich(x)}</li>`).join("")}</ul></div>` : "";
  return `<div class="sw-core">${rich(s.core)}</div>` +
    box("Poin yang harus diingat", "pt", s.points) + box("Kesalahan yang harus dihindari", "av", s.avoid) + box("Berpotensi keluar di ujian", "ex", s.exam);
}
function flatSubs(b, pack) { const out = []; for (const c of visibleChapters(b, pack)) for (const s of c.subs) out.push({ c, s }); return out; }
async function renderBaca([slug, subId, mode, lang]) {
  const g = await gate(slug); if (g.err) return g.err;
  const { b, pack, P } = g;
  mode = mode === "ringkas" ? "ringkas" : "lengkap"; lang = lang === "jp" ? "jp" : "id";
  setMode(mode); setLang(lang); applyRuby();
  const flat = flatSubs(b, pack);
  const idx = flat.findIndex(x => x.s.id === subId);
  if (idx < 0) return msgPage("🧭", "Subbab tidak ditemukan", "Subbab ini tidak ada atau belum dipublikasikan.", `route('ssw-peta/${slug}')`);
  const { c, s } = flat[idx], prev = flat[idx - 1], next = flat[idx + 1];
  const link = (x) => `SSW.go('${slug}','${x.s.id}')`;
  P.last = { route: `ssw-baca/${slug}/${subId}/${mode}/${lang}`, label: `BAB ${c.no} · ${plain(L(s.title, "id"))}`, t: Date.now() };
  touch(slug);
  const words = pack.vocab.filter(v => (v.src || []).includes(s.id));
  const [p1, p2] = s.pages;
  const thumbs = []; for (let p = p1; p <= p2; p++) thumbs.push(p);
  const body = mode === "lengkap" ? blocksHTML(s.full?.[lang]) : summaryHTML(s.summary?.[lang]);
  return wrap(`
    ${crumbs([{ t: "SSW", go: "route('ssw')" }, { t: esc(b.nama), go: `route('ssw-peta/${slug}')` }, { t: `BAB ${c.no}`, go: `route('ssw-bab/${slug}/${c.id}')` }, { t: `${s.no}` }])}
    <div class="sw-bar-top">
      <div class="sw-seg sm"><button class="${mode === "lengkap" ? "on" : ""}" onclick="route('ssw-baca/${slug}/${subId}/lengkap/${lang}')">Lengkap</button><button class="${mode === "ringkas" ? "on" : ""}" onclick="route('ssw-baca/${slug}/${subId}/ringkas/${lang}')">Ringkasan</button></div>
      <div class="sw-seg sm"><button class="${lang === "jp" ? "on" : ""}" onclick="route('ssw-baca/${slug}/${subId}/${mode}/jp')">日本語</button><button class="${lang === "id" ? "on" : ""}" onclick="route('ssw-baca/${slug}/${subId}/${mode}/id')">ID</button></div>
      ${lang === "jp" ? `<button class="sw-chip" onclick="SSW.toggleRuby()">${ruby() ? "ふりがな ON" : "ふりがな OFF"}</button>` : ""}
    </div>
    <article class="sw-panel sw-lesson ${lang}">
      <div class="sw-lh"><small>BAB ${c.no} · Subbab ${s.no}/${c.subs.length}</small><h1>${rich(L(s.title, lang))}</h1>
        <button class="sw-chip" onclick="SSW.sayTitle('${slug}','${s.id}','${lang}')">🔊</button></div>
      <div class="sw-body">${body || '<p class="sw-muted">Konten belum tersedia untuk tampilan ini.</p>'}</div>
    </article>
    <div class="sw-panel"><h2>📖 Halaman buku (${p1 === p2 ? "hal. " + p1 : `hal. ${p1}–${p2}`})</h2>
      <div class="sw-thumbs">${thumbs.map(p => `<a onclick="route('ssw-buku/${slug}/${lang}/${p}')"><img loading="lazy" src="${pageFile(slug, lang, p + 1)}" alt="Halaman ${p}"><span>${p}</span></a>`).join("")}</div>
    </div>
    ${words.length ? `<div class="sw-panel"><h2>📚 Kosakata subbab ini (${words.length})</h2><div class="sw-vchips">${words.map(v => `<button class="sw-vc" onclick="SSW.sayWord('${slug}','${v.id}')"><span class="jp">${esc(v.kata)}</span><small>${esc(v.arti)}</small></button>`).join("")}</div>
      <button class="btn ghost" onclick="route('ssw-kosa/${slug}/${c.id}')">Buka bank kosakata</button></div>` : ""}
    <div class="sw-nav">
      ${prev ? `<button class="btn ghost" onclick="${link(prev)}">‹ ${plain(L(prev.s.title, "id")).slice(0, 26)}</button>` : `<button class="btn ghost" onclick="route('ssw-bab/${slug}/${c.id}')">‹ Pengantar bab</button>`}
      ${next ? `<button class="btn" onclick="SSW.finish('${slug}','${s.id}','${next.s.id}')">Selesai & lanjut ›</button>` : `<button class="btn" onclick="SSW.finish('${slug}','${s.id}',null)">Selesai bab ✓</button>`}
    </div>`);
}

/* ============================== BUKU INTERAKTIF ============================== */
const BOOK = { zoom: 1 };
async function renderBuku([slug, lang, page]) {
  const g = await gate(slug); if (g.err) return g.err;
  const { b, pack } = g;
  lang = lang === "jp" ? "jp" : "id";
  const total = pack.idx.pages?.[lang] || 85;
  const pg = Math.max(0, Math.min(total - 1, parseInt(page, 10) || 1));
  setLang(lang); BOOK.zoom = 1;
  const other = lang === "jp" ? "id" : "jp";
  const chips = flatSubs(b, pack).map(({ c, s }) => `<button class="sw-chip ${pg >= s.pages[0] && pg <= s.pages[1] ? "on" : ""}" onclick="route('ssw-buku/${slug}/${lang}/${s.pages[0]}')">${c.no}.${s.no}</button>`).join("");
  setTimeout(() => window.SSW.bookInit(slug, lang, pg, total), 0);
  return `<div class="sw-book">
    <div class="sw-book-top">
      <button class="sw-back" onclick="route('ssw-peta/${slug}')">← Peta</button>
      <div class="sw-seg sm"><button class="${lang === "jp" ? "on" : ""}" onclick="route('ssw-buku/${slug}/jp/${pg}')">日本語</button><button class="${lang === "id" ? "on" : ""}" onclick="route('ssw-buku/${slug}/id/${pg}')">ID</button></div>
      <span class="sw-pg">Hal. <b id="bk-n">${pg}</b> / ${total - 1}</span>
      <button class="sw-chip" onclick="SSW.bookZoom(-.25)">−</button><button class="sw-chip" onclick="SSW.bookZoom(.25)">＋</button>
    </div>
    <div class="sw-book-chips">${chips}</div>
    <div class="sw-book-stage" id="bk-stage"><img id="bk-img" alt="Halaman ${pg}" src="${pageFile(slug, lang, pg + 1)}" draggable="false"></div>
    <div class="sw-book-nav"><button class="btn ghost" onclick="SSW.bookGo(-1)">‹ Sebelumnya</button>
      <input id="bk-range" type="range" min="0" max="${total - 1}" value="${pg}" aria-label="Halaman" oninput="SSW.bookJump(this.value)">
      <button class="btn" onclick="SSW.bookGo(1)">Berikutnya ›</button></div>
    <div class="sw-attr">Sumber: ${esc(pack.chapters[0]?.source || "")}</div>
  </div>`;
}

/* ============================== KOSAKATA ============================== */
const VS = { q: "", cat: "" };
async function renderKosa([slug, scope = "all"]) {
  applyRuby();
  const g = await gate(slug); if (g.err) return g.err;
  const { b, pack, P } = g;
  const chs = visibleChapters(b, pack);
  const okBab = new Set(chs.map(c => c.id));
  let vocab = pack.vocab.filter(v => okBab.has(v.bab));
  if (scope !== "all") vocab = vocab.filter(v => v.bab === scope);
  const cats = [...new Set(vocab.map(v => v.cat).filter(Boolean))];
  const st = cardStats(P, vocab);
  window.__swVocab = { slug, vocab };
  setTimeout(() => window.SSW.vFilter(), 0);
  return wrap(`
    ${crumbs([{ t: "SSW", go: "route('ssw')" }, { t: esc(b.nama), go: `route('ssw-peta/${slug}')` }, { t: "Kosakata" }])}
    <div class="sw-head compact"><div class="jp">VOCABULARY COLLECTION</div><h1>${esc(b.nama)} Vocabulary</h1>
      <p>${vocab.length} kata · ${st.hafal + st.kuasa} hafal · ${st.belum + st.ulang} perlu review · ${st.baru} baru</p></div>
    <div class="sw-tabs"><button class="${scope === "all" ? "on" : ""}" onclick="route('ssw-kosa/${slug}/all')">All Vocabulary</button>${chs.map(c => `<button class="${scope === c.id ? "on" : ""}" onclick="route('ssw-kosa/${slug}/${c.id}')">BAB ${c.no} Vocabulary</button>`).join("")}</div>
    <div class="sw-tools"><input id="sw-q" type="search" placeholder="Cari kata / arti / romaji…" oninput="SSW.vFilter()"><select id="sw-cat" onchange="SSW.vFilter()"><option value="">Semua kategori</option>${cats.map(c => `<option>${esc(c)}</option>`).join("")}</select>
      <button class="btn" onclick="route('ssw-kartu/${slug}/${scope}/review')">🃏 Flashcard</button></div>
    <div class="sw-vlist" id="sw-vlist"></div>`);
}
function vRow(v, P, slug) {
  const s = cardState(P.cards[v.id]);
  const lbl = { baru: "Baru", belum: "Belum hafal", ulang: "Perlu ulang", hafal: "Hafal", kuasa: "Dikuasai" }[s];
  const srcs = (v.src || []).map(id => `<a onclick="SSW.go('${slug}','${id}')">${esc(id.replace(/^b(\d+)s(\d+)$/, "BAB $1.$2"))}</a>`).join(" · ");
  return `<details class="sw-vrow s-${s}"><summary><span class="jp k">${esc(v.kata)}</span><span class="m"><b>${esc(v.arti)}</b><small>${esc(v.kana)}${v.romaji ? " · " + esc(v.romaji) : ""}</small></span><i class="b">${lbl}</i>
    <button class="sw-chip" onclick="event.preventDefault();event.stopPropagation();SSW.sayWord('${slug}','${v.id}')">🔊</button></summary>
    <div class="x">${v.contoh ? `<p class="jp">${rich(v.contoh)}</p><p class="sw-muted">${esc(v.arti_contoh || "")}</p>` : ""}<p class="sw-muted">${v.cat ? `Kategori: ${esc(v.cat)} · ` : ""}Sumber: ${srcs}</p></div></details>`;
}

/* ============================== FLASHCARD SM-2 ============================== */
let FC = null;
async function renderKartu([slug, scope = "all", mode = "review"]) {
  applyRuby();
  const g = await gate(slug); if (g.err) return g.err;
  const { b, pack, P } = g;
  const okBab = new Set(visibleChapters(b, pack).map(c => c.id));
  let vocab = pack.vocab.filter(v => okBab.has(v.bab));
  if (scope !== "all") vocab = vocab.filter(v => v.bab === scope);
  const queue = buildQueue(P, vocab, { mode });
  P.last = { route: `ssw-kartu/${slug}/${scope}/${mode}`, label: `Flashcard ${scope === "all" ? "semua bab" : scope.replace("bab", "BAB ")}`, t: Date.now() };
  FC = { slug, scope, mode, vocab, P, queue, i: 0, hist: [], rq: {}, ok: 0, ng: 0, flipped: false };
  setTimeout(() => window.SSW.fcDraw(), 0);
  const st = cardStats(P, vocab);
  return wrap(`
    ${crumbs([{ t: "SSW", go: "route('ssw')" }, { t: esc(b.nama), go: `route('ssw-peta/${slug}')` }, { t: "Flashcard" }])}
    <div class="sw-tabs sm"><button class="${mode === "review" ? "on" : ""}" onclick="route('ssw-kartu/${slug}/${scope}/review')">Review harian (${buildQueue(P, vocab, {}).length})</button><button class="${mode === "belum" ? "on" : ""}" onclick="route('ssw-kartu/${slug}/${scope}/belum')">Belum hafal (${st.belum + st.ulang})</button><button class="${mode === "semua" ? "on" : ""}" onclick="route('ssw-kartu/${slug}/${scope}/semua')">Semua kartu (${vocab.length})</button></div>
    <div id="fc-root"></div>`, "sw-fcwrap");
}

/* ============================== KUIS ============================== */
let QZ = null;
function qImage(slug, lang, im) {
  if (!im) return "";
  const box = im[lang] || im.id || im.box; if (!box) return "";
  const [x, y, w, h] = box;
  const ar = (lang === "jp" ? 612 / 792 : 595.32 / 841.92) * w / h;
  const bgW = 10000 / w, px = w >= 100 ? 0 : (x / (100 - w)) * 100, py = h >= 100 ? 0 : (y / (100 - h)) * 100;
  return `<div class="sw-qimg" style="aspect-ratio:${ar.toFixed(3)};background-image:url('${pageFile(slug, lang, im.p + 1)}');background-size:${bgW.toFixed(1)}% auto;background-position:${px.toFixed(1)}% ${py.toFixed(1)}%" role="img" aria-label="Gambar soal"></div>`;
}
async function renderKuis([slug, quizId]) {
  applyRuby();
  const g = await gate(slug); if (g.err) return g.err;
  const { b, pack, P } = g;
  const chs = visibleChapters(b, pack);
  const full = fullQuizzes(pack);
  const row = (q, label) => { const r = P.quiz[q.id]; return `<button class="sw-qrow" onclick="route('ssw-kuis/${slug}/${q.id}')"><span><b>${label}</b><small>${q.items.length} soal</small></span><span class="sc ${r ? (r.best >= 60 ? "ok" : "ng") : ""}">${r ? r.best + "%" : "Belum"}</span></button>`; };
  if (!quizId) {
    return wrap(`
      ${crumbs([{ t: "SSW", go: "route('ssw')" }, { t: esc(b.nama), go: `route('ssw-peta/${slug}')` }, { t: "Kuis & Evaluasi" }])}
      <div class="sw-head compact"><div class="jp">試験センター</div><h1>Evaluasi — Examination Center</h1><p>3 kuis tiap bab dan 3 ujian penuh dari semua bab. Skor terbaik tersimpan di akunmu.</p></div>
      ${chs.map(c => `<div class="sw-panel"><h2>BAB ${c.no} — ${esc(L(c.title, "id"))}</h2><div class="sw-qlist">${(pack.quiz.bab?.[c.id] || []).map((q, i) => row(q, `Kuis ${i + 1} · ${esc(L(q.title, "id"))}`)).join("") || '<p class="sw-muted">Belum ada kuis.</p>'}</div></div>`).join("")}
      <div class="sw-panel"><h2>Tes Membaca Kosakata</h2><p class="sw-muted">Kanji dari kosakata buku → pilih bacaannya (hiragana/katakana). 15 soal acak.</p><div class="sw-qlist">${row({ id: "baca-kosakata", items: { length: 15 } }, "読み方テスト · Tes Membaca")}</div></div>
      <div class="sw-panel"><h2>Ujian Penuh (semua bab)</h2><div class="sw-qlist">${full.map((q, i) => row(q, `Ujian Penuh ${i + 1}`)).join("") || '<p class="sw-muted">Belum ada soal.</p>'}</div></div>`);
  }
  const q = quizId === "baca-kosakata" ? readingQuiz(pack) : [...chs.flatMap(c => pack.quiz.bab?.[c.id] || []), ...full].find(x => x.id === quizId);
  if (!q) return msgPage("🧭", "Kuis tidak ditemukan", "Kuis ini tidak ada atau belum dipublikasikan.", `route('ssw-kuis/${slug}')`);
  const lang = getLang();
  const rnd = seeded(quizId + Date.now());
  const items = q.items.map((it, i) => {
    const order = shuffle(it.opts.map((_, k) => k), rnd);
    return { ...it, _i: i, order };
  });
  P.last = { route: `ssw-kuis/${slug}/${quizId}`, label: `Kuis ${L(q.title, "id")}`, t: Date.now() };
  QZ = { slug, q, items: shuffle(items, rnd), i: 0, sel: null, score: 0, wrong: [], lang, P };
  setTimeout(() => window.SSW.qzDraw(), 0);
  return wrap(`${crumbs([{ t: "SSW", go: "route('ssw')" }, { t: "Kuis", go: `route('ssw-kuis/${slug}')` }, { t: esc(L(q.title, "id")) }])}<div id="qz-root"></div>`);
}

/* ============================== DASHBOARD SISWA ============================== */
async function summaryFor(b) {
  try {
    const pack = await loadPack(b.slug), P = await getProgress(b.slug);
    const chs = visibleChapters(b, pack);
    const prs = chs.map(c => babProgress(P, c, pack.vocab));
    const okBab = new Set(chs.map(c => c.id));
    const vocab = pack.vocab.filter(v => okBab.has(v.bab));
    const st = cardStats(P, vocab);
    const quizzes = Object.entries(P.quiz).map(([id, r]) => ({ id, ...r })).sort((a, b) => (b.ts || 0) - (a.ts || 0));
    const pct = prs.length ? Math.round(prs.reduce((s, x) => s + x.pct, 0) / prs.length) : 0;
    return { b, pack, P, chs, prs, st, quizzes, pct, selesai: prs.filter(x => x.status === "selesai").length };
  } catch (e) { return null; }
}
async function renderProgres() {
  applyRuby();
  const list = (await loadBidang()).filter(b => b.aktif || isGuru());
  const sums = (await Promise.all(list.map(summaryFor))).filter(Boolean);
  if (!sums.length) return msgPage("🏝️", "Belum ada progres SSW", "Mulai belajar dari pulau SSW dulu.");
  return wrap(`${crumbs([{ t: "SSW", go: "route('ssw')" }, { t: "Progres" }])}
    <div class="sw-head compact"><div class="jp">学習の記録</div><h1>Progres SSW</h1></div>
    ${sums.map(s => `<div class="sw-panel"><h2>${esc(s.b.nama)} <small class="jp">${esc(s.b.jp || "")}</small></h2>
      <div class="sw-bar"><i style="width:${s.pct}%"></i></div>
      <div class="sw-stats"><div><b>${s.chs.length}</b><span>Total bab</span></div><div><b>${s.selesai}</b><span>Bab selesai</span></div><div><b>${s.pct}%</b><span>Progres</span></div>
        <div><b>${s.st.total}</b><span>Kosakata</span></div><div><b>${s.st.hafal + s.st.kuasa}</b><span>Sudah hafal</span></div><div><b>${s.st.belum + s.st.ulang}</b><span>Perlu review</span></div></div>
      ${s.quizzes.length ? `<h3>Hasil tes terakhir</h3><ul class="sw-ql">${s.quizzes.slice(0, 5).map(q => `<li><span>${esc(q.id)}</span><b class="${q.best >= 60 ? "ok" : "ng"}">terakhir ${q.last}% · terbaik ${q.best}%</b></li>`).join("")}</ul>` : ""}
      ${s.P.log.length ? `<h3>Aktivitas terakhir</h3><ul class="sw-ql">${s.P.log.slice(0, 4).map(l => `<li><span>${esc(l.x)}</span><b>${new Date(l.t).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</b></li>`).join("")}</ul>` : ""}
      <div class="sw-actions left">${s.P.last ? `<button class="btn" onclick="route('${esc(s.P.last.route)}')">▶ Lanjutkan: ${esc(s.P.last.label)}</button>` : ""}<button class="btn ghost" onclick="route('ssw-peta/${s.b.slug}')">Buka peta</button></div></div>`).join("")}`);
}
/** Kartu ringkas untuk dashboard siswa (home). Mengisi #ssw-dash. */
async function dashCard() {
  const el = document.getElementById("ssw-dash"); if (!el) return;
  try {
    const list = (await loadBidang()).filter(b => b.aktif && b.hasContent !== false);
    const sums = (await Promise.all(list.map(summaryFor))).filter(Boolean);
    if (!sums.length) { el.innerHTML = ""; return; }
    el.innerHTML = sums.map(s => `<a class="sw-dash" onclick="route('ssw-progres')"><span class="jp">特定技能</span><b>SSW · ${esc(s.b.nama)}</b>
      <div class="sw-bar"><i style="width:${s.pct}%"></i></div>
      <small>${s.selesai}/${s.chs.length} bab · ${s.st.hafal + s.st.kuasa}/${s.st.total} kata hafal${s.st.due ? ` · ${s.st.due} perlu review` : ""}</small></a>`).join("");
  } catch (e) { el.innerHTML = ""; }
}

/* ============================== HANDLER GLOBAL ============================== */
const SSW = window.SSW = {
  /* --- hub --- */
  async pick(slug) {
    const w = document.getElementById("sw-world"), sheet = document.getElementById("sw-sheet"); if (!w) return;
    const list = await loadBidang(); const b = list.find(x => x.slug === slug); if (!b) return;
    w.classList.remove("focus"); w.style.transform = "";
    const el = w.querySelector(`[data-slug="${CSS.escape(slug)}"]`);
    w.querySelectorAll(".sw-isl").forEach(e => e.classList.toggle("sel", e === el));
    const wr = w.parentElement.getBoundingClientRect(), er = el.getBoundingClientRect();
    const dx = (wr.left + wr.width / 2) - (er.left + er.width / 2), dy = (wr.top + Math.min(wr.height / 2.4, 240)) - (er.top + er.height / 2);
    requestAnimationFrame(() => { w.classList.add("focus"); w.style.transform = `translate(${dx}px,${dy}px) scale(1.14)`; });
    const can = b.aktif || isGuru();
    sheet.hidden = false;
    sheet.innerHTML = `<div class="sw-sheet-in"><div><div class="jp">${esc(b.jp || "")}</div><h2>${esc(b.nama)}</h2>
      <p class="sw-muted">${can ? (b.hasContent === false ? "Materi sedang disiapkan." : "Bidang ini sudah dibuka. Masuk dan jelajahi peta pembelajarannya.") : "Materi bidang ini belum tersedia. Progres belajarmu tidak akan hilang."}</p></div>
      <div class="sw-sheet-b">${can ? `<button class="btn sw-big" onclick="route('ssw-peta/${esc(slug)}')">MASUK BELAJAR ›</button>` : `<button class="btn ghost" disabled>Belum tersedia</button>`}<button class="btn ghost" onclick="SSW.unpick()">Kembali</button></div></div>`;
  },
  unpick() {
    const w = document.getElementById("sw-world"), s = document.getElementById("sw-sheet"); if (!w) return;
    w.classList.remove("focus"); w.style.transform = ""; w.querySelectorAll(".sw-isl").forEach(e => e.classList.remove("sel")); if (s) s.hidden = true;
  },
  /* --- bab --- */
  setM(m) { setMode(m); document.querySelectorAll("#sw-mode button").forEach(b => b.classList.toggle("on", b.dataset.v === m)); },
  setL(l) { setLang(l); document.querySelectorAll("#sw-lang button").forEach(b => b.classList.toggle("on", b.dataset.v === l)); },
  go(slug, subId) { route(`ssw-baca/${slug}/${subId}/${getMode()}/${getLang()}`); },
  toggleRuby() { LSset("shirose-ssw-ruby", ruby() ? "0" : "1"); applyRuby(); const h = location.hash.replace(/^#/, ""); route(h); },
  async finish(slug, subId, nextId) {
    const P = await getProgress(slug);
    if (!P.read[subId]) { P.read[subId] = { t: Date.now() }; logAct(slug, `Selesai subbab ${subId.replace(/^b(\d+)s(\d+)$/, "BAB $1.$2")}`); }
    touch(slug); flush(slug);
    if (nextId) SSW.go(slug, nextId); else { toast("🎉 Bab selesai!"); const pack = await loadPack(slug); const c = pack.chapters.find(x => x.subs.some(s => s.id === subId)); route(`ssw-bab/${slug}/${c.id}`); }
  },
  async sayTitle(slug, subId, lang) { const pack = await loadPack(slug); for (const c of pack.chapters) for (const s of c.subs) if (s.id === subId) say(L(s.title, lang), slug); },
  async sayWord(slug, id) { const pack = await loadPack(slug); const v = pack.vocab.find(x => x.id === id); if (v) say(v.kana || v.kata, slug); },
  /* --- buku --- */
  bookInit(slug, lang, pg, total) {
    const st = document.getElementById("bk-stage"); if (!st) return;
    BOOK.slug = slug; BOOK.lang = lang; BOOK.pg = pg; BOOK.total = total; BOOK.zoom = 1;
    let x0 = null, y0 = null, t0 = 0, lastTap = 0;
    st.onpointerdown = (e) => { x0 = e.clientX; y0 = e.clientY; t0 = Date.now(); };
    st.onpointerup = (e) => {
      if (x0 == null) return; const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (BOOK.zoom === 1 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { SSW.bookGo(dx < 0 ? 1 : -1); return; }
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && Date.now() - t0 < 300) { const n = Date.now(); if (n - lastTap < 320) { BOOK.zoom = BOOK.zoom > 1 ? 1 : 2; SSW.bookApply(); } lastTap = n; }
    };
    window.onkeydown = (e) => { if (!document.getElementById("bk-stage")) { window.onkeydown = null; return; } if (e.key === "ArrowRight") SSW.bookGo(1); if (e.key === "ArrowLeft") SSW.bookGo(-1); };
  },
  bookApply() { const i = document.getElementById("bk-img"); if (i) { i.style.width = (BOOK.zoom * 100) + "%"; } },
  bookZoom(d) { BOOK.zoom = Math.max(1, Math.min(3.5, BOOK.zoom + d)); SSW.bookApply(); },
  bookGo(d) { const n = Math.max(0, Math.min(BOOK.total - 1, BOOK.pg + d)); if (n !== BOOK.pg) route(`ssw-buku/${BOOK.slug}/${BOOK.lang}/${n}`); },
  bookJump(v) { const n = parseInt(v, 10); const el = document.getElementById("bk-n"); if (el) el.textContent = n; clearTimeout(BOOK._t); BOOK._t = setTimeout(() => route(`ssw-buku/${BOOK.slug}/${BOOK.lang}/${n}`), 350); },
  /* --- kosakata --- */
  vFilter() {
    const box = document.getElementById("sw-vlist"); if (!box || !window.__swVocab) return;
    const { slug, vocab } = window.__swVocab;
    const q = (document.getElementById("sw-q")?.value || "").toLowerCase().trim(), cat = document.getElementById("sw-cat")?.value || "";
    getProgress(slug).then(P => {
      const rows = vocab.filter(v => (!cat || v.cat === cat) && (!q || [v.kata, v.kana, v.romaji, v.arti].some(x => String(x || "").toLowerCase().includes(q))));
      box.innerHTML = rows.length ? rows.map(v => vRow(v, P, slug)).join("") : '<div class="sw-muted sw-center">Tidak ada kata yang cocok.</div>';
    });
  },
  /* --- flashcard --- */
  fcDraw() {
    const root = document.getElementById("fc-root"); if (!root || !FC) return;
    const total = FC.queue.length;
    if (!total) { root.innerHTML = `<div class="sw-panel sw-center"><div class="sw-emoji">🎉</div><h2>Tidak ada kartu untuk direview</h2><p class="sw-muted">Semua kartu sudah dijadwalkan. Coba mode “Semua kartu”.</p><button class="btn" onclick="route('ssw-kartu/${FC.slug}/${FC.scope}/semua')">Latih semua kartu</button></div>`; return; }
    if (FC.i >= total) {
      root.innerHTML = `<div class="sw-panel sw-center"><div class="sw-emoji">✅</div><h2>Sesi selesai</h2><p>Hafal: <b>${FC.ok}</b> · Belum hafal: <b>${FC.ng}</b></p>
        <div class="sw-actions">${FC.hist.length ? `<button class="btn ghost" onclick="SSW.fcUndo()">↶ Kembali ke kartu terakhir</button>` : ""}<button class="btn" onclick="route('ssw-kartu/${FC.slug}/${FC.scope}/belum')">Ulangi yang belum hafal</button><button class="btn ghost" onclick="route('ssw-peta/${FC.slug}')">Kembali ke peta</button></div></div>`; return;
    }
    const v = FC.queue[FC.i], c = FC.P.cards[v.id], s = cardState(c);
    const pct = Math.round(100 * FC.i / total);
    root.innerHTML = `
      <div class="sw-fc-top"><span>${FC.i + 1} / ${total}</span><div class="sw-bar"><i style="width:${pct}%"></i></div><span class="sw-st s-${s}">${{ baru: "Baru", belum: "Belum hafal", ulang: "Perlu ulang", hafal: "Hafal", kuasa: "Dikuasai" }[s]}</span></div>
      <div class="sw-fc-stage"><div class="sw-fc ${FC.flipped ? "flip" : ""}" id="fc-card" tabindex="0" aria-label="Kartu, ketuk untuk membalik">
        <div class="face front"><div class="jp big">${esc(v.kata)}</div><small>Ketuk untuk membalik · geser ← →</small></div>
        <div class="face back"><div class="jp mid">${esc(v.kana || v.kata)}</div><div class="ro">${esc(v.romaji || "")}</div><div class="ar">${esc(v.arti)}</div>
          ${v.contoh ? `<div class="ex jp">${rich(v.contoh)}<small>${esc(v.arti_contoh || "")}</small></div>` : ""}<div class="src">${(v.src || []).map(id => id.replace(/^b(\d+)s(\d+)$/, "BAB $1.$2")).join(" · ")}</div></div>
        <i class="hint l">✕ Belum</i><i class="hint r">Hafal ✓</i></div></div>
      <div class="sw-fc-btns"><button class="btn ghost" onclick="SSW.fcUndo()" ${FC.hist.length ? "" : "disabled"} aria-label="Kartu sebelumnya">↶ Kembali</button>
        <button class="btn no" onclick="SSW.fcAns(1)">✕ Belum Hafal</button><button class="btn yes" onclick="SSW.fcAns(4)">✓ Hafal</button></div>
      <div class="sw-fc-btns two"><button class="sw-chip" onclick="SSW.fcSay()">🔊 Dengar</button><button class="sw-chip" onclick="SSW.fcShuffle()">🔀 Acak sisa</button></div>`;
    SSW.fcBind();
  },
  fcBind() {
    const card = document.getElementById("fc-card"); if (!card) return;
    let sx = 0, sy = 0, dx = 0, drag = false, moved = false, pid = null;
    card.onpointerdown = (e) => { drag = true; moved = false; sx = e.clientX; sy = e.clientY; dx = 0; pid = e.pointerId; card.style.transition = "none"; try { card.setPointerCapture(pid); } catch (_) {} };
    card.onpointermove = (e) => {
      if (!drag) return; dx = e.clientX - sx; const dy = e.clientY - sy;
      if (Math.abs(dx) > 8) moved = true;
      if (moved) { card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`; card.classList.toggle("l", dx < -30); card.classList.toggle("r", dx > 30); }
    };
    const end = () => {
      if (!drag) return; drag = false; card.style.transition = "";
      if (!moved) { FC.flipped = !FC.flipped; card.classList.toggle("flip", FC.flipped); card.style.transform = ""; return; }
      if (dx > 90) { card.classList.add("out-r"); setTimeout(() => SSW.fcAns(4), 180); }
      else if (dx < -90) { card.classList.add("out-l"); setTimeout(() => SSW.fcAns(1), 180); }
      else { card.style.transform = ""; card.classList.remove("l", "r"); }
    };
    card.onpointerup = end; card.onpointercancel = end;
    card.onkeydown = (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); FC.flipped = !FC.flipped; card.classList.toggle("flip", FC.flipped); } if (e.key === "ArrowRight") SSW.fcAns(4); if (e.key === "ArrowLeft") SSW.fcAns(1); };
  },
  fcAns(grade) {
    if (!FC || FC.i >= FC.queue.length) return;
    const v = FC.queue[FC.i], prev = FC.P.cards[v.id] ? { ...FC.P.cards[v.id] } : null;
    const entry = { id: v.id, prev, i: FC.i, rq: false, grade };
    FC.P.cards[v.id] = schedule(FC.P.cards[v.id] || newCard(), grade);
    if (grade >= 3) FC.ok++; else { FC.ng++; if ((FC.rq[v.id] || 0) < 2) { FC.rq[v.id] = (FC.rq[v.id] || 0) + 1; FC.queue.push(v); entry.rq = true; } }
    FC.hist.push(entry); FC.i++; FC.flipped = false;
    logAct(FC.slug, "Review flashcard"); touch(FC.slug); SSW.fcDraw();
  },
  /** Kembali ke kartu sebelumnya: mengembalikan jadwal kartu itu persis seperti sebelum dijawab. */
  fcUndo() {
    if (!FC || !FC.hist.length) return;
    const h = FC.hist.pop();
    if (h.prev) FC.P.cards[h.id] = h.prev; else delete FC.P.cards[h.id];
    if (h.rq) { FC.queue.pop(); FC.rq[h.id] = Math.max(0, (FC.rq[h.id] || 1) - 1); }
    if (h.grade >= 3) FC.ok = Math.max(0, FC.ok - 1); else FC.ng = Math.max(0, FC.ng - 1);
    FC.i = h.i; FC.flipped = true; touch(FC.slug); SSW.fcDraw();
  },
  fcShuffle() { if (!FC) return; const rest = FC.queue.slice(FC.i); FC.queue = [...FC.queue.slice(0, FC.i), ...shuffle(rest)]; SSW.fcDraw(); },
  fcSay() { if (!FC) return; const v = FC.queue[FC.i]; if (v) say(v.kana || v.kata, FC.slug); },
  /* --- kuis --- */
  qzDraw() {
    const root = document.getElementById("qz-root"); if (!root || !QZ) return;
    const Q = QZ, total = Q.items.length;
    if (Q.i >= total) {
      const pct = recordQuiz(Q.P, Q.q.id, Q.score, total, Q.wrong.map(w => w.id));
      logAct(Q.slug, `Kuis ${plain(L(Q.q.title, "id"))}: ${pct}%`); touch(Q.slug); flush(Q.slug);
      root.innerHTML = `<div class="sw-panel sw-center"><div class="sw-emoji">${pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "📖"}</div><h2>Skor: ${pct}%</h2><p>${Q.score} benar dari ${total} soal.</p>
        ${Q.wrong.length ? `<div class="sw-review"><h3>Yang perlu diulang</h3>${Q.wrong.map(w => `<div class="sw-rv"><p>${rich(L(w.q, Q.lang))}</p><p class="ok">✓ ${rich(L(w.opts[w.a], Q.lang))}</p><p class="sw-muted">${rich(L(w.exp, Q.lang))}</p></div>`).join("")}</div>` : '<p class="ok">Sempurna!</p>'}
        <div class="sw-actions"><button class="btn" onclick="route('ssw-kuis/${Q.slug}/${Q.q.id}')">Ulangi kuis</button><button class="btn ghost" onclick="route('ssw-kuis/${Q.slug}')">Daftar kuis</button></div></div>`; return;
    }
    const it = Q.items[Q.i], lang = Q.lang, answered = Q.sel != null;
    root.innerHTML = `
      <div class="sw-fc-top"><span>${Q.i + 1} / ${total}</span><div class="sw-bar"><i style="width:${Math.round(100 * Q.i / total)}%"></i></div>
        <div class="sw-seg sm"><button class="${lang === "jp" ? "on" : ""}" onclick="SSW.qzLang('jp')">日本語</button><button class="${lang === "id" ? "on" : ""}" onclick="SSW.qzLang('id')">ID</button></div></div>
      <div class="sw-panel sw-q">${it.img ? qImage(Q.slug, lang, it.img) : ""}<h2>${rich(L(it.q, lang))}</h2>
        <div class="sw-opts">${it.order.map((k, n) => {
          const cls = answered ? (k === it.a ? "ok" : k === Q.sel ? "ng" : "") : "";
          return `<button class="sw-opt ${cls}" ${answered ? "disabled" : ""} onclick="SSW.qzPick(${k})"><span class="l">${"ABCD"[n]}</span><span>${rich(L(it.opts[k], lang))}</span></button>`;
        }).join("")}</div>
        ${answered ? `<div class="sw-exp ${Q.sel === it.a ? "ok" : "ng"}"><b>${Q.sel === it.a ? "Benar!" : "Kurang tepat."}</b> ${rich(L(it.exp, lang))}</div><button class="btn sw-big" onclick="SSW.qzNext()">${Q.i + 1 >= total ? "Lihat hasil" : "Soal berikutnya ›"}</button>` : ""}
      </div>`;
  },
  qzLang(l) { if (!QZ) return; QZ.lang = l; setLang(l); SSW.qzDraw(); },
  qzPick(k) { if (!QZ || QZ.sel != null) return; const it = QZ.items[QZ.i]; QZ.sel = k; if (k === it.a) QZ.score++; else QZ.wrong.push(it); SSW.qzDraw(); },
  qzNext() { if (!QZ) return; QZ.i++; QZ.sel = null; SSW.qzDraw(); window.scrollTo(0, 0); },
  dashCard,
};

/** Dipanggil sekali oleh hub setelah render: efek awan & jaga transform saat resize. */
window.__swHubInit = () => {
  const w = document.getElementById("sw-world"); if (!w) return;
  w.addEventListener("click", (e) => { if (e.target === w) SSW.unpick(); });
};

export const SSW_ROUTES = {
  ssw: () => renderHub(),
  "ssw-peta": (p) => renderPeta(p),
  "ssw-bab": (p) => renderBab(p),
  "ssw-baca": (p) => renderBaca(p),
  "ssw-buku": (p) => renderBuku(p),
  "ssw-kosa": (p) => renderKosa(p),
  "ssw-kartu": (p) => renderKartu(p),
  "ssw-kuis": (p) => renderKuis(p),
  "ssw-progres": () => renderProgres(),
};
