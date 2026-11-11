/* =====================================================================
 * JFT-Basic (A2) — Irodori Starter A1 / Shokyuu 1 / Shokyuu 2
 * Menu + simulasi ujian CBT bergaya JFT-Basic (50 soal, 60 menit, 4 bagian).
 * Skor 10–250 adalah ESTIMASI latihan (bukan skor resmi Japan Foundation).
 * Data: ./data/kosakata-ir{0,1,2}.json, kanji-*, bunpou-*, ./data/jft/bank.json
 * Materi bersumber dari kosakata buku "Irodori: Japanese for Life in Japan"
 * (The Japan Foundation) untuk pembelajaran non-komersial. Penjelasan bunpou
 * ditulis ulang oleh Shirose Nihongo.
 * Route: #jft, #jft-tes/full, #jft-tes/latihan/{vocab|conv|listening|reading}, #jft-hasil
 * ===================================================================== */
const S = () => window.__SHIROSE_STATE || window.state || {};
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nl = (s) => esc(s).replace(/\n/g, "<br>");
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} },
};
const uid = () => S().user?.uid || "guest";
const HIS_KEY = () => `shirose-jft-hasil:${uid()}`;
const SESI_KEY = () => `shirose-jft-sesi:${uid()}`;

const SEK = {
  vocab:     { nama: "Script & Vocabulary", jp: "文字・語彙", ico: "語", n: 12 },
  conv:      { nama: "Conversation & Expression", jp: "会話・表現", ico: "話", n: 14 },
  listening: { nama: "Listening Comprehension", jp: "聴解", ico: "🎧", n: 12 },
  reading:   { nama: "Reading Comprehension", jp: "読解", ico: "読", n: 12 },
};
const URUT = ["vocab", "conv", "listening", "reading"];
const DURASI_MENIT = 60;

const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const hasKanji = (s) => /[一-鿿]/.test(s);

/* ---------- data ---------- */
let _bank = null, _kos = null;
async function loadBank() { if (!_bank) { try { _bank = await (await fetch("./data/jft/bank.json")).json(); } catch (e) { _bank = { conv: [], read: [], listen: [] }; } } return _bank; }
async function loadKos() {
  if (_kos) return _kos;
  const r = await Promise.all(["ir0", "ir1", "ir2"].map(l => fetch(`./data/kosakata-${l}.json`).then(x => x.json()).catch(() => [])));
  _kos = r.flat().filter(w => w.kata && w.kana && w.arti);
  return _kos;
}
const pendek = (a) => { let t = String(a).replace(/^\d+\.\s*/, "").split(/[;；(（]/)[0].trim(); if (t.length > 40) t = t.slice(0, 40) + "…"; return t; };

function withOpts(q, opts, ans, extra) {
  const idx = shuffle(opts.map((o, i) => i));
  return { ...extra, q, o: idx.map(i => opts[i]), a: idx.indexOf(ans) };
}
async function buatVocab(n) {
  const kos = await loadKos();
  const base = kos.filter(w => w.kata.length <= 6 && !/(です|ます|ました|ません|ですか|ください)$/.test(w.kata) && !/[。、]/.test(w.kata) && !/[～〜（）()／]/.test(w.kata) && !w.kana.includes("／"));
  const kj = base.filter(w => hasKanji(w.kata));
  const out = [];
  const jenis = ["arti", "baca", "kanji"];
  const tiap = { arti: Math.ceil(n / 3), baca: Math.ceil(n / 3), kanji: n - 2 * Math.ceil(n / 3) };
  const used = new Set();
  const ambil = (arr) => { for (let t = 0; t < 50; t++) { const w = arr[Math.floor(Math.random() * arr.length)]; if (!used.has(w.kata)) { used.add(w.kata); return w; } } return arr[0]; };
  jenis.forEach(j => {
    for (let i = 0; i < tiap[j]; i++) {
      if (j === "arti") {
        const w = ambil(base); const salah = pick(base.filter(x => pendek(x.arti) !== pendek(w.arti)), 3);
        out.push(withOpts(`「${w.kata}」 artinya…`, [pendek(w.arti), ...salah.map(x => pendek(x.arti))], 0, { sec: "vocab", n: `${w.kata}（${w.kana}）= ${pendek(w.arti)}` }));
      } else if (j === "baca") {
        const w = ambil(kj); const salah = pick(kj.filter(x => x.kana !== w.kana), 3);
        out.push(withOpts(`「${w.kata}」 cara bacanya…`, [w.kana, ...salah.map(x => x.kana)], 0, { sec: "vocab", n: `${w.kata} dibaca ${w.kana} (${pendek(w.arti)})` }));
      } else {
        const w = ambil(kj); const salah = pick(kj.filter(x => x.kata !== w.kata), 3);
        out.push(withOpts(`「${w.kana}」 ditulis dengan kanji…`, [w.kata, ...salah.map(x => x.kata)], 0, { sec: "vocab", n: `${w.kana} = ${w.kata} (${pendek(w.arti)})` }));
      }
    }
  });
  return shuffle(out).slice(0, n);
}
async function buatSoal(sek, n) {
  const b = await loadBank();
  if (sek === "vocab") return buatVocab(n);
  if (sek === "conv") return pick(b.conv, n).map(x => withOpts(x.q, x.o, x.a, { sec: "conv", n: x.n }));
  if (sek === "listening") return pick(b.listen, n).map(x => withOpts(x.q, x.o, x.a, { sec: "listening", say: x.say, n: x.n }));
  // reading: ambil teks utuh (2 soal per teks)
  const jumlahTeks = Math.ceil(n / 2);
  const out = [];
  pick(b.read, jumlahTeks).forEach((t, ti) => t.qs.forEach(x => out.push(withOpts(x.q, x.o, x.a, { sec: "reading", p: t.p, pid: ti, n: x.n }))));
  return out.slice(0, n);
}

/* ---------- skor (estimasi) ---------- */
// JFT asli memakai skala 10–250 hasil equating (IRT). Di sini dipakai pemetaan linear bertahap
// supaya latihan terasa mirip: 0%→10, 50%→145, 70%→200, 100%→250.
export function skalaJft(pct) {
  const p = Math.max(0, Math.min(1, pct));
  const seg = [[0, 10], [0.5, 145], [0.7, 200], [1, 250]];
  for (let i = 1; i < seg.length; i++) if (p <= seg[i][0]) { const [x0, y0] = seg[i - 1], [x1, y1] = seg[i]; return Math.round(y0 + (y1 - y0) * (p - x0) / (x1 - x0)); }
  return 250;
}
export function bandJft(s) {
  if (s >= 200) return { k: "A2.2", lulus: true, t: "Lulus standar A2 (≥ 200)", c: "#22c55e" };
  if (s >= 175) return { k: "A2.1", lulus: false, t: "Level A2.1 — hampir lulus, naikkan sedikit lagi", c: "#eab308" };
  if (s >= 145) return { k: "A1", lulus: false, t: "Level A1", c: "#f97316" };
  return { k: "*", lulus: false, t: "Di bawah A1 (di ujian asli tampil “*”)", c: "#ef4444" };
}

/* ---------- suara (listening) ---------- */
let _voices = [];
const _loadVoices = () => { try { _voices = (speechSynthesis.getVoices() || []).filter(v => /^ja/i.test(v.lang)); } catch (e) {} };
try { _loadVoices(); speechSynthesis.onvoiceschanged = _loadVoices; } catch (e) {}
function bicara(teks, onend) {
  if (!("speechSynthesis" in window)) { onend && onend(false); return; }
  speechSynthesis.cancel(); _loadVoices();
  const baris = String(teks).split(/\n/).map(s => s.trim()).filter(Boolean);
  const q = baris.map(b => { const m = /^(男|女)：(.*)$/.exec(b); return m ? { who: m[1], t: m[2] } : { who: "", t: b.replace(/^（[^）]*）/, "") }; });
  q.forEach((x, i) => {
    const u = new SpeechSynthesisUtterance(x.t.replace(/[「」]/g, ""));
    u.lang = "ja-JP"; u.rate = 0.88; u.pitch = x.who === "男" ? 0.75 : x.who === "女" ? 1.3 : 1;
    if (_voices[0]) u.voice = _voices[0];
    if (i === q.length - 1) u.onend = () => onend && onend(true);
    speechSynthesis.speak(u);
  });
}

/* ---------- sesi ---------- */
let J = null;   // sesi aktif
let _tick = null;
const simpanSesi = () => { if (J && J.mode === "full" && !J.selesai) LS.set(SESI_KEY(), { ...J, qs: J.qs }); };
function pulihSesi() { const s = LS.get(SESI_KEY(), null); if (s && s.mode === "full" && !s.selesai && s.endAt > Date.now()) return s; LS.del(SESI_KEY()); return null; }

async function mulai(mode, sekPilih) {
  const full = mode === "full";
  const daftar = full ? URUT : [sekPilih];
  const qs = [];
  for (const s of daftar) (await buatSoal(s, SEK[s].n)).forEach(q => qs.push(q));
  J = { mode, daftar, qs, ans: {}, plays: {}, idx: 0, secIdx: 0, locked: 0, mulai: Date.now(), endAt: full ? Date.now() + DURASI_MENIT * 60000 : 0, selesai: false, konfirm: false };
  simpanSesi();
}
const rentang = (sek) => { const idx = []; J.qs.forEach((q, i) => { if (q.sec === sek) idx.push(i); }); return idx; };
const secNow = () => J.qs[J.idx]?.sec;

function sisaDetik() { return Math.max(0, Math.round((J.endAt - Date.now()) / 1000)); }
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
function startTick() {
  clearInterval(_tick);
  if (!J || !J.endAt) return;
  _tick = setInterval(() => {
    if (!J || J.selesai) { clearInterval(_tick); return; }
    const el = $("jft-timer"); const s = sisaDetik();
    if (el) { el.textContent = mmss(s); el.classList.toggle("warn", s <= 300); }
    if (s <= 0) { clearInterval(_tick); selesaiSesi(); }
  }, 1000);
}
function draw() { const app = $("app"); if (app) { app.innerHTML = renderSoal(); window.scrollTo(0, 0); } }

function renderSoal() {
  const q = J.qs[J.idx]; const sek = q.sec; const full = J.mode === "full";
  const idxSek = rentang(sek); const posSek = idxSek.indexOf(J.idx);
  const dengar = sek === "listening";
  const terkunciMaju = full && dengar;                // listening: tidak bisa pindah-pindah soal
  const main = (J.plays[J.idx] || 0);
  const maxPlay = full ? 2 : 99;
  const nomor = idxSek.map((gi, k) => `<button class="no ${J.ans[gi] != null ? "terjawab" : ""} ${gi === J.idx ? "aktif" : ""}" ${terkunciMaju ? "disabled" : ""} onclick="JFT.ke(${gi})">${k + 1}</button>`).join("");
  const teks = q.p ? `<div class="jft-passage">${nl(q.p)}</div>` : "";
  const audio = dengar ? `<div class="jft-audio">
      <button class="btn" id="jft-play" ${main >= maxPlay ? "disabled" : ""} onclick="JFT.play()">▶ Putar audio ${full ? `(${main}/${maxPlay})` : ""}</button>
      <div class="jft-hint">${full ? "Audio hanya bisa diputar 2 kali. Soal tidak bisa kembali." : "Latihan: audio bisa diputar berulang."} Teks audio tidak ditampilkan saat ujian.</div></div>` : "";
  const opsi = q.o.map((o, i) => `<button class="jft-opt ${J.ans[J.idx] === i ? "on" : ""}" onclick="JFT.jawab(${i})"><b>${"ABCD"[i]}</b> ${esc(o)}</button>`).join("");
  const adaNext = posSek < idxSek.length - 1;
  const bagianAkhir = J.daftar.indexOf(sek) === J.daftar.length - 1;
  const nav = `<div class="jft-nav">
      ${(!terkunciMaju && posSek > 0) ? `<button class="btn ghost" onclick="JFT.ke(${idxSek[posSek - 1]})">← Sebelumnya</button>` : "<span></span>"}
      ${adaNext ? `<button class="btn" onclick="JFT.ke(${idxSek[posSek + 1]})">Berikutnya →</button>` :
        (J.konfirm ? `<button class="btn danger" onclick="JFT.lanjutBagian()">${bagianAkhir ? "Ya, selesaikan ujian" : "Ya, lanjut (tidak bisa kembali)"}</button>`
          : `<button class="btn" onclick="JFT.minta()">${bagianAkhir ? "Selesai ✓" : "Selesai bagian ini ▶"}</button>`)}
    </div>`;
  const belum = idxSek.filter(gi => J.ans[gi] == null).length;
  const peringatan = J.konfirm ? `<div class="jft-warn">${belum ? `Masih ${belum} soal belum dijawab di bagian ini. ` : ""}${bagianAkhir ? "Ujian akan diakhiri." : "Setelah lanjut, bagian ini tidak bisa dibuka lagi."} <button class="btn ghost" onclick="JFT.batalKonfirm()">Batal</button></div>` : "";
  return `
  <div class="jft-wrap">
    <div class="jft-top">
      <div><div class="jft-sec">${SEK[sek].jp} · ${SEK[sek].nama}</div><div class="jft-sub">Soal ${posSek + 1}/${idxSek.length} · total ${J.idx + 1}/${J.qs.length}</div></div>
      ${full ? `<div class="jft-timer" id="jft-timer">${mmss(sisaDetik())}</div>` : `<button class="btn ghost" onclick="JFT.akhiriLatihan()">Selesai</button>`}
    </div>
    <div class="jft-nomor">${nomor}</div>
    <div class="panel jft-q">${teks}${audio}<div class="jft-qtext">${esc(q.q)}</div><div class="jft-opts">${opsi}</div></div>
    ${peringatan}${nav}
  </div>`;
}

function selesaiSesi() {
  clearInterval(_tick); speechSynthesis?.cancel?.();
  J.selesai = true; J.selesaiAt = Date.now();
  const per = {};
  J.daftar.forEach(s => { const gi = rentang(s); const b = gi.filter(i => J.ans[i] === J.qs[i].a).length; per[s] = { benar: b, total: gi.length }; });
  const benar = Object.values(per).reduce((a, x) => a + x.benar, 0), total = J.qs.length;
  const pct = total ? benar / total : 0;
  const full = J.mode === "full";
  const rec = { t: Date.now(), mode: J.mode, per, benar, total, pct, skor: full ? skalaJft(pct) : null, detik: Math.round((Date.now() - J.mulai) / 1000) };
  rec.review = J.qs.map((q, i) => ({ sec: q.sec, q: q.q, o: q.o, a: q.a, u: J.ans[i] ?? null, n: q.n || "", p: q.p || "", say: q.say || "" }));
  const his = LS.get(HIS_KEY(), []); his.unshift({ ...rec, review: undefined }); LS.set(HIS_KEY(), his.slice(0, 30));
  LS.set(HIS_KEY() + ":last", rec);
  LS.del(SESI_KEY());
  try { if (window.state?.user && window.FB?.tambahNilai) { /* hasil ujian disimpan lokal saja */ } } catch (e) {}
  route("jft-hasil");
}

/* ---------- aksi publik ---------- */
window.JFT = {
  async mulai(mode, sek) { document.getElementById("app").innerHTML = '<div class="loading">Menyiapkan soal…</div>'; await mulai(mode, sek); startTick(); window._routeStack = ["jft"]; draw(); history.replaceState(null, "", "#jft-tes/" + (mode === "full" ? "full" : "latihan/" + sek)); },
  lanjutSesi() { const s = pulihSesi(); if (!s) return; J = s; startTick(); draw(); },
  jawab(i) { J.ans[J.idx] = i; J.konfirm = false; simpanSesi(); draw(); },
  ke(i) { J.idx = i; J.konfirm = false; simpanSesi(); draw(); },
  play() {
    const full = J.mode === "full"; const n = (J.plays[J.idx] || 0);
    if (full && n >= 2) return; J.plays[J.idx] = n + 1; simpanSesi();
    const b = $("jft-play"); if (b) { b.disabled = true; b.textContent = "🔊 Memutar…"; }
    bicara(J.qs[J.idx].say, (ok) => { if (!J || J.selesai) return; draw(); if (ok === false) window.toast?.("Browser ini tidak punya suara bahasa Jepang"); });
  },
  minta() { J.konfirm = true; draw(); },
  batalKonfirm() { J.konfirm = false; draw(); },
  lanjutBagian() {
    const sek = secNow(); const k = J.daftar.indexOf(sek);
    if (k >= J.daftar.length - 1) return selesaiSesi();
    speechSynthesis?.cancel?.(); J.konfirm = false; J.locked = k + 1;
    J.idx = rentang(J.daftar[k + 1])[0]; simpanSesi(); draw();
  },
  akhiriLatihan() { selesaiSesi(); },
  hapusRiwayat() { LS.del(HIS_KEY()); route("jft"); },
  tampilReview(on) { const el = $("jft-review"); if (el) el.hidden = !on; },
};

/* ---------- halaman ---------- */
async function renderHub() {
  const st = S();
  if (!st.user) { setTimeout(() => route("login"), 0); return '<div class="loading">Memuat…</div>'; }
  const kos = {}, knj = {}, bun = {};
  for (const l of ["ir0", "ir1", "ir2"]) {
    kos[l] = (await window.__loadMateri?.("kosakata", l) || []).length;
    knj[l] = (await window.__loadMateri?.("kanji", l) || []).length;
    bun[l] = (await window.__loadMateri?.("bunpou", l) || []).length;
  }
  const info = {
    ir0: { jp: "入門", nama: "Starter · A1", d: "Sapaan, perkenalan, makanan, belanja, transportasi, rencana akhir pekan." },
    ir1: { jp: "初級1", nama: "Shokyuu 1 · A2", d: "Ngobrol di tempat kerja & kota, cuaca, kesehatan, janji, izin & larangan." },
    ir2: { jp: "初級2", nama: "Shokyuu 2 · A2", d: "Informasi publik, pengumuman, pasif, saran, pengalaman hidup di Jepang." },
  };
  const cur = st.level;
  const kartu = ["ir0", "ir1", "ir2"].map(l => `
    <button class="jlpt-card jft ${cur === l ? "current" : ""}" data-kanji="${info[l].jp}" onclick="pilihLevel('${l}')">
      <span class="lv">${info[l].jp}</span><span class="jpname">${info[l].nama}</span>
      <span class="desc">${info[l].d}<br><small>${kos[l]} kosakata · ${knj[l]} kanji · ${bun[l]} bunpou</small></span>
      <span class="st">${cur === l ? "✓ Sedang dipelajari" : "Buka materi →"}</span>
    </button>`).join("");
  const sesi = pulihSesi();
  const his = LS.get(HIS_KEY(), []).filter(h => h.mode === "full");
  const riw = his.length ? `<div class="panel" style="margin-top:12px"><h3>Riwayat simulasi</h3>${his.slice(0, 8).map(h => { const b = bandJft(h.skor); return `<div class="jft-his"><span>${new Date(h.t).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span><b>${h.skor}</b><span style="color:${b.c}">${b.k}</span><small>${h.benar}/${h.total}</small></div>`; }).join("")}<button class="btn ghost" style="margin-top:8px" onclick="if(confirm('Hapus riwayat simulasi?'))JFT.hapusRiwayat()">Hapus riwayat</button></div>` : "";
  return `
  <div class="jlpt-pick">
    <div class="head"><div class="jp">JFT-Basic · いろどり</div><h1>JFT-Basic A2</h1>
      <p>Pilih level Irodori untuk belajar kosakata, kanji, bunpou &amp; hafalan — atau langsung simulasi ujian CBT JFT-Basic.</p></div>
    <div class="jlpt-grid">${kartu}</div>
    <div class="panel jft-menu" style="margin-top:14px">
      <h3>📝 Simulasi ujian JFT-Basic (CBT)</h3>
      <p style="color:var(--gray);font-size:13px;line-height:1.6">50 soal · 60 menit · 4 bagian berurutan (Script &amp; Vocabulary → Conversation &amp; Expression → Listening → Reading). Dalam satu bagian soal bebas dibuka ulang; bagian yang sudah selesai tidak bisa dibuka lagi. Listening: 2× putar, tidak bisa kembali. Skor estimasi 10–250, lulus A2 ≥ 200.</p>
      ${sesi ? `<button class="btn" onclick="JFT.lanjutSesi()">▶ Lanjutkan ujian (sisa ${mmss(Math.max(0, Math.round((sesi.endAt - Date.now()) / 1000)))})</button> ` : ""}
      <button class="btn" onclick="JFT.mulai('full')">🏁 Mulai simulasi penuh</button>
      <div class="jft-latihan">${URUT.map(s => `<button class="btn ghost" onclick="JFT.mulai('latihan','${s}')">${SEK[s].ico} ${SEK[s].nama.split(" ")[0]} (${SEK[s].n} soal)</button>`).join("")}</div>
    </div>
    ${riw}
    <div class="foot"><small style="color:var(--gray-dim)">Kosakata bersumber dari buku Irodori — The Japan Foundation (pemakaian edukasi non-komersial). Skor di sini hanya perkiraan latihan, bukan skor resmi JFT-Basic.</small></div>
  </div>`;
}

function renderTes(params) {
  const [mode, sek] = params || [];
  if (J && !J.selesai && ((mode === "full" && J.mode === "full") || (mode === "latihan" && J.mode === "latihan" && J.daftar[0] === sek))) { startTick(); return renderSoal(); }
  if (mode === "full") { const s = pulihSesi(); if (s) { J = s; startTick(); return renderSoal(); } }
  if (mode === "latihan" && SEK[sek]) { setTimeout(() => window.JFT.mulai("latihan", sek), 0); return '<div class="loading">Menyiapkan soal…</div>'; }
  setTimeout(() => route("jft"), 0); return '<div class="loading">Memuat…</div>';
}

function renderHasil() {
  const r = LS.get(HIS_KEY() + ":last", null);
  if (!r) { setTimeout(() => route("jft"), 0); return '<div class="loading">Memuat…</div>'; }
  const full = r.mode === "full"; const b = full ? bandJft(r.skor) : null;
  const bars = Object.entries(r.per).map(([s, x]) => { const p = x.total ? Math.round(100 * x.benar / x.total) : 0; return `<div class="jft-bar"><div class="l">${SEK[s].jp} ${SEK[s].nama}</div><div class="t"><i style="width:${p}%"></i></div><div class="v">${x.benar}/${x.total} · ${p}%</div></div>`; }).join("");
  const rv = r.review.map((x, i) => {
    const ok = x.u === x.a;
    return `<div class="jft-rv ${ok ? "ok" : "ng"}"><div class="h">${i + 1}. ${ok ? "✅" : "❌"} <small>${SEK[x.sec].jp}</small></div>
      ${x.p ? `<div class="jft-passage">${nl(x.p)}</div>` : ""}${x.say ? `<div class="jft-passage">🎧 ${nl(x.say)}</div>` : ""}
      <div class="q">${esc(x.q)}</div>
      <div class="a">Jawabanmu: ${x.u == null ? "—" : `${"ABCD"[x.u]}. ${esc(x.o[x.u])}`}${ok ? "" : `<br>Benar: <b>${"ABCD"[x.a]}. ${esc(x.o[x.a])}</b>`}</div>
      ${x.n ? `<div class="n">💡 ${esc(x.n)}</div>` : ""}</div>`;
  }).join("");
  return `
  <div class="jft-wrap">
    <div class="panel jft-hasil">
      <div class="jp">${full ? "JFT-Basic · Hasil simulasi" : "Hasil latihan"}</div>
      ${full ? `<div class="skor" style="color:${b.c}">${r.skor}<small> / 250</small></div>
        <div class="band" style="background:${b.c}22;border-color:${b.c};color:${b.c}">${b.k} — ${b.t}</div>
        <div class="jft-skala"><i style="left:${Math.min(100, (r.skor - 10) / 2.4)}%"></i><span style="left:${(145 - 10) / 2.4}%">145</span><span style="left:${(175 - 10) / 2.4}%">175</span><span style="left:${(200 - 10) / 2.4}%">200</span></div>`
      : `<div class="skor">${Math.round(r.pct * 100)}<small>%</small></div>`}
      <div class="jft-sub">Benar ${r.benar} dari ${r.total} soal · ${Math.floor(r.detik / 60)} menit ${r.detik % 60} detik</div>
      <div class="jft-bars">${bars}</div>
      ${full ? `<div class="jft-note">⚠ Ini <b>estimasi latihan</b>. Skor JFT-Basic resmi dihitung dengan equating (IRT) sehingga bobot tiap soal berbeda. Skor di bawah 145 tampil “*” di ujian asli.</div>` : ""}
      <div class="jft-aksi"><button class="btn" onclick="JFT.tampilReview(true);this.remove()">📋 Lihat pembahasan</button> <button class="btn ghost" onclick="route('jft')">↩ Menu JFT</button></div>
    </div>
    <div id="jft-review" hidden>${rv}</div>
  </div>`;
}

export const JFT_ROUTES = {
  jft: () => renderHub(),
  "jft-tes": (p) => renderTes(p),
  "jft-hasil": () => renderHasil(),
};
export function initJft(fb, loadMateri) { window.FB = window.FB || fb; window.__loadMateri = loadMateri; }
