/* =====================================================================
 * JLPT CENTER — Full Exam & Individual Practice (N5–N1)
 * ---------------------------------------------------------------------
 * Data soal : ./jlpt/index.json  +  ./jlpt/{lv}/{jenis}-{nn}.json
 *             (dibangun oleh tools/jlpt_build.py dari materi Shirose)
 * Hasil     : Firestore siswa/{uid}/jlpt_hasil  (lihat firebase-sync.js)
 * Sesi      : localStorage "shirose-jlpt-sesi:{uid}" — timer memakai
 *             waktu selesai absolut, jadi refresh TIDAK mereset timer.
 * Route     : #jlpt, #jlpt/{lv}, #jlpt/{lv}/{jenis}, #jlpt/{lv}/{jenis}/{pkgId},
 *             #jlpt-riwayat, #jlpt-review/{hasilId}
 * ===================================================================== */
// FB disuntikkan dari index.html (instance modul firebase-sync yang SAMA —
// import dengan query-string berbeda akan membuat instance auth terpisah).
let FB = null;
export function initJlpt(fb) { FB = fb; }

const S = () => window.__SHIROSE_STATE || window.state || {};
const LV = ["n5", "n4", "n3", "n2", "n1"];
const ABCD = "ABCD";
const JENIS = {
  full:   { ico: "🏯", nama: "Full Exam", jp: "模擬試験", desc: "Simulasi lengkap: Kanji, Kotoba, Bunpou, Dokkai, Choukai", durasi: 70 },
  kanji:  { ico: "漢", nama: "Kanji", jp: "漢字", desc: "Cara baca & penulisan kanji", durasi: 20 },
  kotoba: { ico: "語", nama: "Kotoba", jp: "語彙", desc: "Kosakata: konteks, makna, penggunaan", durasi: 20 },
  bunpou: { ico: "文", nama: "Bunpou", jp: "文法", desc: "Tata bahasa & menyusun kalimat (★)", durasi: 20 },
};
const CAT_LABEL = { kanji: "Kanji", kotoba: "Kotoba", bunpou: "Bunpou", dokkai: "Dokkai", choukai: "Choukai" };
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Teks soal dari generator sudah aman (hanya <u>, <br>, <small>, <b>, <table>…); izinkan tag itu saja.
const safe = (s) => String(s ?? "").replace(/<(?!\/?(u|br|small|b|table|tr|th|td|ruby|rt)\b)[^>]*>/gi, "");
const toast = (m) => (window.toast ? window.toast(m) : console.log(m));
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} },
};
const uid = () => S().user?.uid || "guest";
const SESI_KEY = () => `shirose-jlpt-sesi:${uid()}`;
const LOKAL_KEY = () => `shirose-jlpt-hasil:${uid()}`;
const fmt = (sec) => {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return (h ? `${h}:${String(m).padStart(2, "0")}` : String(m).padStart(2, "0")) + ":" + String(s).padStart(2, "0");
};
const fmtPanjang = (sec) => { sec = Math.max(0, Math.round(sec)); const m = Math.floor(sec / 60), s = sec % 60; return `${m} menit ${s} detik`; };
const fmtJam = (ms) => ms ? new Date(ms).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-";
const tglMs = (h) => h?.selesai || (h?.tgl?.seconds ? h.tgl.seconds * 1000 : 0);

/* ---------------- data ---------------- */
let _index = null;
const _pkgCache = {};
async function loadIndex() {
  if (_index) return _index;
  const r = await fetch("./jlpt/index.json", { cache: "no-cache" });
  if (!r.ok) throw new Error("Bank soal JLPT belum tersedia (jlpt/index.json)");
  _index = await r.json();
  return _index;
}
async function loadPkg(file) {
  if (_pkgCache[file]) return _pkgCache[file];
  const r = await fetch("./jlpt/" + file);
  if (!r.ok) throw new Error("Paket tidak ditemukan: " + file);
  const p = await r.json();
  p.flat = [];
  p.sections.forEach((s, si) => s.items.forEach(q => { q._si = si; p.flat.push(q); }));
  _pkgCache[file] = p;
  return p;
}
function findMeta(idx, pkgId) {
  for (const lv of LV) for (const j of Object.keys(JENIS)) {
    const m = (idx.level[lv]?.[j] || []).find(x => x.id === pkgId);
    if (m) return { ...m, lv, jenis: j };
  }
  return null;
}

/* ---------------- riwayat (Firestore + cadangan lokal) ---------------- */
let _hist = null, _histAt = 0;
async function riwayat(force) {
  if (!force && _hist && Date.now() - _histAt < 30000) return _hist;
  let list = [];
  const lokal = LS.get(LOKAL_KEY(), []);
  if (S().user && !S().user.isAnonymous) {
    try { list = await FB.listHasilJLPT(200); } catch (e) { console.warn("riwayat JLPT:", e.message); }
  }
  // gabungkan hasil lokal yang belum tersinkron
  const ids = new Set(list.map(x => x.localId).filter(Boolean));
  lokal.forEach(x => { if (!ids.has(x.localId)) list.push({ ...x, _lokal: true }); });
  list.sort((a, b) => tglMs(b) - tglMs(a));
  _hist = list; _histAt = Date.now();
  return list;
}

/* ---------------- ROUTER ---------------- */
export async function renderJlpt(params = []) {
  stopTimer();
  if (!S().user) {
    setTimeout(() => window.route && window.route("login"), 0);
    return `<div class="loading">Memuat…</div>`;
  }
  let sesi = LS.get(SESI_KEY(), null);
  let [lv, jenis, pkgId] = params;
  // JLPT Center hanya untuk level yang sedang dipilih siswa (tidak digabung / tidak ada tautan antar level).
  const cur = curLevel();
  if (cur) {
    if (sesi && sesi.lv && sesi.lv !== cur) sesi = null;
    if (lv !== cur) { lv = cur; jenis = undefined; pkgId = undefined; }
  }
  try {
    if (sesi && !sesi.selesai && pkgId && sesi.pkgId === pkgId) return await mulaiAtauLanjut(sesi);
    if (!lv) return await viewLevel(sesi);
    if (!LV.includes(lv)) return viewLevel(sesi);
    if (!bolehLevel(lv)) return viewTerkunci(lv);
    if (!jenis) return await viewKategori(lv, sesi);
    if (!pkgId) return await viewPaket(lv, jenis, sesi);
    return await viewSetup(lv, jenis, pkgId, sesi);
  } catch (e) {
    console.error(e);
    return `<div class="panel"><h2>JLPT Center</h2><div class="empty"><div class="emoji">⚠️</div>${esc(e.message || e)}</div>
      <button class="btn ghost" onclick="route('jlpt')">← Kembali</button></div>`;
  }
}
export async function renderRiwayatJlpt() { stopTimer(); return await viewRiwayat(); }
export async function renderReviewJlpt(params = []) { stopTimer(); return await viewReviewDariRiwayat(params[0]); }

const curLevel = () => { const l = String(S().level || "").toLowerCase(); return LV.includes(l) ? l : null; };
function bolehLevel(lv) {
  return typeof window.canAccessLevel === "function" ? window.canAccessLevel(lv) : true;
}
function crumbs(parts) {
  return `<div class="jx-crumbs">${parts.map(([t, r]) => r ? `<a onclick="route('${r}')">${esc(t)}</a>` : `<span>${esc(t)}</span>`).join(" › ")}</div>`;
}
function bannerSesi(sesi) {
  if (!sesi || sesi.selesai) return "";
  const sisa = Math.max(0, Math.floor((sesi.endAt - Date.now()) / 1000));
  return `<div class="jx-resume">
    <div>⏳ Kamu punya ujian yang belum selesai: <b>${esc(sesi.judul)}</b> (${sesi.lv.toUpperCase()}) — sisa waktu <b>${fmt(sisa)}</b></div>
    <div class="jx-row"><button class="btn gold" onclick="route('jlpt/${sesi.lv}/${sesi.jenis}/${sesi.pkgId}')">▶ Lanjutkan</button>
    <button class="btn ghost" onclick="JLPT.batalSesi()">Batalkan</button></div></div>`;
}

/* ---------------- 1. PILIH LEVEL ---------------- */
async function viewLevel(sesi) {
  const idx = await loadIndex();
  const hist = await riwayat();
  const cards = LV.map(lv => {
    const buka = bolehLevel(lv);
    const n = Object.keys(JENIS).reduce((a, j) => a + (idx.level[lv]?.[j]?.length || 0), 0);
    const mine = hist.filter(h => h.lv === lv);
    const best = mine.length ? Math.max(...mine.map(h => h.skor || 0)) : null;
    return `<button class="jx-lv ${lv} ${buka ? "" : "locked"}" ${buka ? `onclick="route('jlpt/${lv}')"` : `onclick="toast('🔒 JLPT ${lv.toUpperCase()} belum dibuka guru')"`}>
      <span class="big">${lv.toUpperCase()}</span>
      <span class="sub">${n} paket</span>
      <span class="sub">${buka ? (best != null ? `Terbaik ${best}% · ${mine.length}× dikerjakan` : "Belum dikerjakan") : "🔒 Dikunci guru"}</span>
    </button>`;
  }).join("");
  return `
    ${bannerSesi(sesi)}
    <div class="panel jx">
      <div class="jx-head"><div><div class="jx-jp">日本語能力試験 模擬試験センター</div><h2>JLPT Center</h2>
        <p class="jx-muted">Pilih level JLPT. Setiap level berisi 10 paket Full Exam dan 20 paket latihan untuk Kanji, Kotoba, dan Bunpou.</p></div>
        <button class="btn ghost" onclick="route('jlpt-riwayat')">📊 Riwayat &amp; Nilai</button></div>
      <h3>PILIH LEVEL JLPT</h3>
      <div class="jx-lvgrid">${cards}</div>
      <p class="jx-note">Semua soal adalah soal latihan orisinal Shirose Nihongo yang disusun dari materi di website ini. Nilai yang tampil adalah <b>estimasi hasil latihan</b>, bukan nilai resmi JLPT.</p>
    </div>`;
}
function viewTerkunci(lv) {
  return `<div class="panel"><h2>🔒 JLPT ${lv.toUpperCase()}</h2><div class="empty"><div class="emoji">🔒</div>Level ini belum dibuka guru untukmu.</div>
    <button class="btn ghost" onclick="route('jlpt')">← Pilih level lain</button></div>`;
}

/* ---------------- 2. PILIH JENIS LATIHAN ---------------- */
async function viewKategori(lv, sesi) {
  const idx = await loadIndex();
  const hist = await riwayat();
  const cards = Object.entries(JENIS).map(([j, info]) => {
    const list = idx.level[lv]?.[j] || [];
    const done = new Set(hist.filter(h => h.lv === lv && h.jenis === j).map(h => h.pkgId));
    const soal = list.reduce((a, p) => a + p.jumlah, 0);
    return `<div class="jx-cat" onclick="route('jlpt/${lv}/${j}')">
      <div class="ico">${info.ico}</div>
      <div class="info"><div class="ttl">${info.nama} <span class="jx-jp-s">${info.jp}</span></div>
        <div class="sub">${info.desc}</div>
        <div class="sub">${list.length} paket · ${soal} soal · default ${info.durasi} menit</div>
        <div class="jx-bar"><i style="width:${list.length ? Math.round(done.size / list.length * 100) : 0}%"></i></div>
        <div class="sub">${done.size}/${list.length} paket sudah dikerjakan</div></div></div>`;
  }).join("");
  return `
    ${bannerSesi(sesi)}
    <div class="panel jx">
      ${crumbs([["JLPT Center", "jlpt"], [`JLPT ${lv.toUpperCase()}`]])}
      <h2>JLPT ${lv.toUpperCase()}</h2>
      <h3>PILIH JENIS LATIHAN</h3>
      <div class="jx-catgrid">${cards}</div>
    </div>`;
}

/* ---------------- 3. DAFTAR PAKET ---------------- */
async function viewPaket(lv, jenis, sesi) {
  if (!JENIS[jenis]) return viewKategori(lv, sesi);
  const idx = await loadIndex();
  const hist = await riwayat();
  const list = idx.level[lv]?.[jenis] || [];
  const cards = list.map((p, i) => {
    const mine = hist.filter(h => h.pkgId === p.id);
    const last = mine[0];
    const best = mine.length ? Math.max(...mine.map(h => h.skor || 0)) : null;
    const aktif = sesi && !sesi.selesai && sesi.pkgId === p.id;
    return `<div class="jx-pkg ${last ? "done" : ""} ${aktif ? "aktif" : ""}" onclick="route('jlpt/${lv}/${jenis}/${p.id}')">
      <div class="no">${String(i + 1).padStart(2, "0")}</div>
      <div class="info"><div class="ttl">${esc(p.judul)}</div>
        <div class="sub">${p.jumlah} soal · ${p.durasi} menit</div>
        <div class="sub mondai">${p.mondai.map(esc).join(" · ")}</div></div>
      <div class="st">${aktif ? `<span class="tag warn">Sedang dikerjakan</span>` : last ? `<span class="tag ${best >= 60 ? "ok" : "bad"}">Terbaik ${best}%</span><span class="tag">${mine.length}×</span>` : `<span class="tag">Baru</span>`}</div>
    </div>`;
  }).join("");
  return `
    ${bannerSesi(sesi)}
    <div class="panel jx">
      ${crumbs([["JLPT Center", "jlpt"], [`JLPT ${lv.toUpperCase()}`, `jlpt/${lv}`], [JENIS[jenis].nama]])}
      <h2>${JENIS[jenis].ico} ${JENIS[jenis].nama} ${lv.toUpperCase()}</h2>
      <p class="jx-muted">${JENIS[jenis].desc}. Pilih paket untuk melihat detail dan mengatur waktu.</p>
      <div class="jx-pkglist">${cards || `<div class="empty">Belum ada paket.</div>`}</div>
    </div>`;
}

/* ---------------- 4. PENGATURAN WAKTU ---------------- */
async function viewSetup(lv, jenis, pkgId, sesi) {
  const idx = await loadIndex();
  const meta = findMeta(idx, pkgId);
  if (!meta) throw new Error("Paket tidak ditemukan");
  const def = JENIS[jenis].durasi;
  const pilihan = jenis === "full" ? [30, 45, 60, 70] : [5, 10, 15, 20];
  const lain = sesi && !sesi.selesai && sesi.pkgId !== pkgId;
  return `
    <div class="panel jx">
      ${crumbs([["JLPT Center", "jlpt"], [`JLPT ${lv.toUpperCase()}`, `jlpt/${lv}`], [JENIS[jenis].nama, `jlpt/${lv}/${jenis}`], [meta.judul]])}
      <h2>${esc(meta.judul)}</h2>
      <div class="jx-setup">
        <div class="jx-box">
          <h4>Isi paket</h4>
          <ul class="jx-list">${meta.mondai.map(m => `<li>${esc(m)}</li>`).join("")}</ul>
          <div class="jx-muted">Total <b>${meta.jumlah}</b> soal</div>
        </div>
        <div class="jx-box">
          <h4>⏱ Pengaturan waktu</h4>
          <p class="jx-muted">Rekomendasi: <b>${def} menit</b>. Kamu boleh memilih sendiri.</p>
          <div class="jx-times" id="jx-times">
            ${pilihan.map(m => `<button class="jx-time ${m === def ? "on" : ""}" data-m="${m}" onclick="JLPT.pilihWaktu(${m})">${m} menit${m === def ? " ★" : ""}</button>`).join("")}
            <button class="jx-time" data-m="custom" onclick="JLPT.pilihWaktu('custom')">Custom</button>
          </div>
          <div class="jx-custom hidden" id="jx-custom">
            <label>Durasi custom (menit): <input type="number" id="jx-menit" min="1" max="300" value="${def}" inputmode="numeric"/></label>
          </div>
          <input type="hidden" id="jx-durasi" value="${def}"/>
          <ul class="jx-list small">
            <li>Timer tetap berjalan walau halaman di-refresh atau ditutup.</li>
            <li>Jawaban tersimpan otomatis di perangkat ini.</li>
            <li>Jika waktu habis, ujian dikumpulkan otomatis.</li>
            <li>Kunci jawaban baru tampil setelah ujian dikumpulkan.</li>
          </ul>
          ${lain ? `<div class="jx-warn">⚠️ Ada ujian lain yang belum selesai (${esc(sesi.judul)}). Memulai paket ini akan membatalkan ujian tersebut.</div>` : ""}
          <button class="btn gold jx-start" onclick="JLPT.mulai('${lv}','${jenis}','${pkgId}')">▶ Mulai ${jenis === "full" ? "Ujian" : "Latihan"}</button>
        </div>
      </div>
    </div>`;
}
function pilihWaktu(m) {
  document.querySelectorAll("#jx-times .jx-time").forEach(b => b.classList.toggle("on", String(b.dataset.m) === String(m)));
  const c = document.getElementById("jx-custom");
  if (m === "custom") { c.classList.remove("hidden"); document.getElementById("jx-menit").focus(); }
  else { c.classList.add("hidden"); document.getElementById("jx-durasi").value = m; }
}
async function mulai(lv, jenis, pkgId) {
  let menit = parseInt(document.getElementById("jx-durasi")?.value) || JENIS[jenis].durasi;
  const custom = !document.getElementById("jx-custom")?.classList.contains("hidden");
  if (custom) {
    menit = parseInt(document.getElementById("jx-menit").value);
    if (!menit || menit < 1 || menit > 300) { toast("Masukkan durasi 1–300 menit"); return; }
  }
  const idx = await loadIndex();
  const meta = findMeta(idx, pkgId);
  const now = Date.now();
  const sesi = {
    pkgId, file: meta.file, lv, jenis, judul: meta.judul, jumlah: meta.jumlah,
    durasiMenit: menit, startAt: now, endAt: now + menit * 60000,
    jawaban: {}, tandai: {}, pos: 0, putar: {}, selesai: false,
  };
  LS.set(SESI_KEY(), sesi);
  window.route(`jlpt/${lv}/${jenis}/${pkgId}`);
}
function batalSesi() {
  if (!confirmBox("Batalkan ujian yang sedang berjalan? Jawaban akan dihapus.", () => { LS.del(SESI_KEY()); window.route("jlpt"); })) return;
}

/* ---------------- 5. MENGERJAKAN ---------------- */
let E = null;            // { sesi, pkg }
let _timer = null;
function stopTimer() { if (_timer) { clearInterval(_timer); _timer = null; } }
function simpanSesi() { if (E) LS.set(SESI_KEY(), E.sesi); }

async function mulaiAtauLanjut(sesi) {
  const pkg = await loadPkg(sesi.file);
  E = { sesi, pkg };
  if (Date.now() >= sesi.endAt) {
    setTimeout(() => kumpulkan(true), 0);
    return `<div class="panel"><div class="loading">⏰ Waktu habis — mengumpulkan jawaban…</div></div>`;
  }
  setTimeout(() => { mulaiTimer(); }, 0);
  return htmlUjian();
}
function mulaiTimer() {
  stopTimer();
  const tick = () => {
    if (!E) return stopTimer();
    const now = Date.now(), s = E.sesi;
    const sisa = Math.max(0, (s.endAt - now) / 1000), pakai = (now - s.startAt) / 1000;
    const a = document.getElementById("jx-sisa"), b = document.getElementById("jx-pakai");
    if (!a) return stopTimer();     // halaman sudah pindah
    a.textContent = fmt(sisa); b.textContent = fmt(pakai);
    a.parentElement.classList.toggle("danger", sisa <= 60);
    a.parentElement.classList.toggle("warn", sisa > 60 && sisa <= 300);
    if (sisa <= 0) { stopTimer(); toast("⏰ Waktu habis — jawaban dikumpulkan otomatis"); kumpulkan(true); }
  };
  tick();
  _timer = setInterval(tick, 1000);
}
function hitung() {
  const s = E.sesi, n = E.pkg.flat.length;
  const dijawab = Object.values(s.jawaban).filter(v => v != null).length;
  return { n, dijawab, belum: n - dijawab, tandai: Object.values(s.tandai).filter(Boolean).length };
}
function htmlUjian() {
  const { sesi: s, pkg } = E;
  const q = pkg.flat[s.pos];
  const sec = pkg.sections[q._si];
  const c = hitung();
  const firstOfSec = pkg.flat.findIndex(x => x._si === q._si) === s.pos;
  const passage = q.pid ? pkg.passages[q.pid] : null;
  const pilihan = s.jawaban[s.pos];
  const ck = q.ck;
  const printed = !ck || ck.printed !== false;
  const opsiHtml = q.opts.map((o, i) => `
    <button class="jx-opt ${pilihan === i ? "on" : ""}" onclick="JLPT.jawab(${i})">
      <span class="k">${ck ? i + 1 : ABCD[i]}</span><span class="t">${printed ? safe(o) : `Pilihan ${i + 1}`}</span></button>`).join("");
  const grid = pkg.flat.map((x, i) => {
    const cls = (s.jawaban[i] != null ? "ok" : "") + (s.tandai[i] ? " flag" : "") + (i === s.pos ? " cur" : "");
    const head = (i === 0 || pkg.flat[i - 1]._si !== x._si) ? `<span class="sec">M${pkg.sections[x._si].mondai}</span>` : "";
    return `${head}<button class="${cls}" onclick="JLPT.lompat(${i})">${i + 1}</button>`;
  }).join("");
  return `
  <div class="jx-exam">
    <div class="jx-top">
      <div class="jx-title"><b>${esc(pkg.judul)}</b><span>${s.lv.toUpperCase()} · ${esc(sec.tipe_jp)}</span></div>
      <div class="jx-clock"><span class="lbl">Sisa</span><span class="big" id="jx-sisa">--:--</span></div>
      <div class="jx-stats">
        <span>Dipilih <b>${s.durasiMenit} mnt</b></span>
        <span>Terpakai <b id="jx-pakai">--:--</b></span>
        <span>Soal <b>${c.n}</b></span>
        <span class="g">Dijawab <b>${c.dijawab}</b></span>
        <span class="r">Belum <b>${c.belum}</b></span>
        ${c.tandai ? `<span class="y">🚩 <b>${c.tandai}</b></span>` : ""}
      </div>
    </div>

    <div class="jx-body">
      <div class="jx-main">
        <div class="jx-sec ${firstOfSec ? "first" : ""}">
          <div class="m">問題${sec.mondai} · ${esc(sec.tipe_jp)} <span class="jx-muted">— ${esc(sec.judul)}</span></div>
          <div class="ins">${esc(sec.instr)}</div>
        </div>
        ${passage ? `<details class="jx-passage" open><summary>📄 Bacaan (${esc(passage.jenis)})</summary><div class="jp">${safe(passage.jp)}</div></details>` : ""}
        ${ck ? `<div class="jx-audio">
            <button class="btn" onclick="JLPT.putar()">▶ Putar audio</button>
            <span class="jx-muted">Diputar ${s.putar[s.pos] || 0}×${ck.audio ? " · rekaman" : " · suara TTS"}</span>
            ${ck.set && printed ? `<div class="jx-muted">${esc(ck.set)}</div>` : ""}</div>` : ""}
        <div class="jx-q">
          <div class="no">${s.pos + 1}</div>
          <div class="txt">${safe(q.q)}</div>
        </div>
        <div class="jx-opts ${q.html_opts ? "long" : ""}">${opsiHtml}</div>
        <div class="jx-nav">
          <button class="btn ghost" ${s.pos === 0 ? "disabled" : ""} onclick="JLPT.geser(-1)">← Sebelumnya</button>
          <button class="btn ghost jx-flagbtn ${s.tandai[s.pos] ? "on" : ""}" onclick="JLPT.tandai()">🚩 ${s.tandai[s.pos] ? "Ditandai" : "Tandai"}</button>
          ${s.pos < c.n - 1 ? `<button class="btn" onclick="JLPT.geser(1)">Selanjutnya →</button>`
                            : `<button class="btn gold" onclick="JLPT.konfirmasi()">Kumpulkan ✔</button>`}
        </div>
      </div>
      <aside class="jx-side">
        <div class="jx-legend"><span class="ok">Dijawab</span><span>Belum</span><span class="flag">Ditandai</span></div>
        <div class="jx-grid">${grid}</div>
        <button class="btn gold jx-submit" onclick="JLPT.konfirmasi()">📤 Kumpulkan Ujian</button>
      </aside>
    </div>
  </div>`;
}
function rerender(keepScroll) {
  const y = window.scrollY;
  document.getElementById("app").innerHTML = htmlUjian();
  mulaiTimer();
  if (keepScroll) window.scrollTo(0, y); else {
    const el = document.querySelector(".jx-q");
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" });
  }
}
function jawab(i) {
  if (!E) return;
  E.sesi.jawaban[E.sesi.pos] = i; simpanSesi(); rerender(true);
}
function geser(d) {
  if (!E) return;
  stopAudio();
  E.sesi.pos = Math.max(0, Math.min(E.pkg.flat.length - 1, E.sesi.pos + d)); simpanSesi(); rerender(false);
  window.scrollTo({ top: 0 });
}
function lompat(i) { if (!E) return; stopAudio(); E.sesi.pos = i; simpanSesi(); rerender(false); window.scrollTo({ top: 0 }); }
function tandai() { if (!E) return; const p = E.sesi.pos; E.sesi.tandai[p] = !E.sesi.tandai[p]; simpanSesi(); rerender(true); }
function stopAudio() { try { window.SV && window.SV.stop(true); } catch (e) {} }
function putar(qOverride) {
  const q = qOverride || (E && E.pkg.flat[E.sesi.pos]);
  if (!q || !q.ck) return;
  if (!qOverride && E) { E.sesi.putar[E.sesi.pos] = (E.sesi.putar[E.sesi.pos] || 0) + 1; simpanSesi(); }
  const lines = (q.ck.script && q.ck.script.length ? q.ck.script : q.ck.dialog).map(l => ({ s: l.s, t: String(l.t).replace(/<[^>]+>/g, "") }));
  {
    window.SV.playScript({ file: q.ck.audio ? "./" + q.ck.audio : null, lines, voices: q.ck.voices || { N: "aoyama", F: "mochiko", M: "kurita" }, label: "Choukai", owner: "jlpt" });
  }
  if (!qOverride) {
    const sp = document.querySelector(".jx-audio .jx-muted");
    if (sp) sp.textContent = `Diputar ${E.sesi.putar[E.sesi.pos]}×${q.ck.audio ? " · rekaman" : " · suara TTS"}`;
  }
}
function confirmBox(msg, onYes, yesLabel = "Ya") {
  const wrap = document.createElement("div");
  wrap.className = "jx-modal";
  wrap.innerHTML = `<div class="box"><div class="msg">${msg}</div><div class="jx-row">
    <button class="btn ghost" data-no>Batal</button><button class="btn gold" data-yes>${yesLabel}</button></div></div>`;
  document.body.appendChild(wrap);
  wrap.querySelector("[data-no]").onclick = () => wrap.remove();
  wrap.querySelector("[data-yes]").onclick = () => { wrap.remove(); onYes(); };
  return true;
}
function konfirmasi() {
  if (!E) return;
  const c = hitung();
  confirmBox(`<h3>Kumpulkan ujian?</h3>
    <p>Dijawab <b>${c.dijawab}</b> dari <b>${c.n}</b> soal.</p>
    ${c.belum ? `<p class="r">⚠️ ${c.belum} soal belum dijawab.</p>` : ""}
    ${c.tandai ? `<p class="y">🚩 ${c.tandai} soal masih ditandai untuk ditinjau.</p>` : ""}
    <p class="jx-muted">Setelah dikumpulkan, jawaban tidak bisa diubah.</p>`, () => kumpulkan(false), "Ya, kumpulkan");
}

/* ---------------- 6. PENILAIAN ---------------- */
function nilai(pkg, jawaban) {
  let benar = 0, salah = 0, kosong = 0;
  const kat = {};
  pkg.flat.forEach((q, i) => {
    const c = q.cat || pkg.sections[q._si].cat;
    kat[c] = kat[c] || { benar: 0, total: 0 };
    kat[c].total++;
    const p = jawaban[i];
    if (p == null) kosong++;
    else if (p === q.ans) { benar++; kat[c].benar++; }
    else salah++;
  });
  const total = pkg.flat.length;
  return { benar, salah, kosong, total, skor: total ? Math.round(benar / total * 100) : 0, perKategori: kat };
}
let _mengumpulkan = false;
async function kumpulkan(timeout) {
  if (!E || _mengumpulkan) return;
  _mengumpulkan = true;
  stopTimer(); stopAudio();
  try {
    const { sesi: s, pkg } = E;
    const selesai = Math.min(Date.now(), s.endAt);
    const n = nilai(pkg, s.jawaban);
    const hasil = {
      localId: `${s.pkgId}-${s.startAt}`,
      pkgId: s.pkgId, file: s.file, lv: s.lv, jenis: s.jenis, judul: s.judul,
      nama: S().siswa?.nama || S().user?.email?.split("@")[0] || "Siswa",
      email: S().user?.email || "",
      ...n,
      durasiDipilih: s.durasiMenit * 60,
      durasiAktual: Math.round((selesai - s.startAt) / 1000),
      mulai: s.startAt, selesai,
      status: timeout ? "timeout" : "selesai",
      jawaban: pkg.flat.map((_, i) => (s.jawaban[i] == null ? -1 : s.jawaban[i])),
      tandai: pkg.flat.map((_, i) => !!s.tandai[i]),
    };
    // cadangan lokal dulu (tidak boleh hilang walau offline)
    const lokal = LS.get(LOKAL_KEY(), []);
    lokal.unshift(hasil); LS.set(LOKAL_KEY(), lokal.slice(0, 60));
    s.selesai = true; LS.del(SESI_KEY());
    let tersimpan = false;
    if (S().user && !S().user.isAnonymous) {
      try {
        hasil.id = await FB.simpanHasilJLPT(hasil);
        tersimpan = true;
        LS.set(LOKAL_KEY(), LS.get(LOKAL_KEY(), []).filter(x => x.localId !== hasil.localId));
      } catch (e) { console.warn("simpan hasil JLPT:", e.message); }
    }
    _hist = null;
    // XP kecil sebagai apresiasi (memakai sistem gami yang sudah ada)
    try { if (window.awardXP && n.benar) await window.awardXP(n.benar * 3, 0); } catch (e) {}
    try { FB.recordActivity && FB.recordActivity("ujian", Math.max(1, n.benar + n.salah)).catch(() => {}); } catch (e) {}
    R = { hasil, pkg, filter: "semua", pos: 0, tersimpan };
    E = null;
    document.getElementById("app").innerHTML = htmlHasil();
    window.scrollTo(0, 0);
  } finally { _mengumpulkan = false; }
}

/* ---------------- 7. HASIL & ANALISIS ---------------- */
let R = null;
function analisis(per) {
  const rows = Object.entries(per).map(([k, v]) => ({ k, pct: v.total ? Math.round(v.benar / v.total * 100) : 0, ...v }));
  const ada = rows.filter(r => r.total);
  const kuat = ada.slice().sort((a, b) => b.pct - a.pct)[0];
  const lemah = ada.slice().sort((a, b) => a.pct - b.pct)[0];
  return { rows, kuat, lemah };
}
const REKOM = {
  kanji: ["Ulangi kartu Kanji di menu Hafalan (SRS).", "Fokus pada bacaan on/kun dan tanda っ, ゛, vokal panjang.", "Kerjakan paket Kanji Practice level ini."],
  kotoba: ["Baca contoh kalimat di Materi → Kosakata.", "Latih kolokasi (kata + kata kerja yang biasa dipakai bersama).", "Kerjakan paket Kotoba Practice."],
  bunpou: ["Pelajari ulang pola di Materi → Bunpou beserta contohnya.", "Latih soal ★: cari pasangan frasa yang pasti menempel dulu.", "Kerjakan paket Bunpou Practice."],
  dokkai: ["Biasakan membaca pertanyaan dulu, lalu cari kalimat kunci.", "Untuk 情報検索, coret pilihan berdasarkan syarat satu per satu."],
  choukai: ["Latih di menu Choukai dengan Mode Ujian (teks disembunyikan).", "Perhatikan perubahan rencana di tengah percakapan (でも／じゃあ)."],
};
// ---- Penilaian ala JLPT resmi (jlpt.jp): seksi, skala poin, ambang lulus, CEFR ----
const JLPT_PASS = {
  n5: { overall: 80, cefr: "A1" }, n4: { overall: 90, cefr: "A2" },
  n3: { overall: 95, cefr: "B1" }, n2: { overall: 90, cefr: "B2" }, n1: { overall: 100, cefr: "C1" },
};
function jlptSections(lv) {
  if (lv === "n5" || lv === "n4") return [
    { label: "言語知識・読解", sub: "Kosakata・Tata Bahasa・Membaca", max: 120, pass: 38, cats: ["kanji", "kotoba", "bunpou", "dokkai"] },
    { label: "聴解", sub: "Menyimak", max: 60, pass: 19, cats: ["choukai"] },
  ];
  return [
    { label: "言語知識", sub: "Kosakata・Tata Bahasa", max: 60, pass: 19, cats: ["kanji", "kotoba", "bunpou"] },
    { label: "読解", sub: "Membaca", max: 60, pass: 19, cats: ["dokkai"] },
    { label: "聴解", sub: "Menyimak", max: 60, pass: 19, cats: ["choukai"] },
  ];
}
function hitungJLPT(h) {
  const per = h.perKategori || {};
  const secs = jlptSections(h.lv).map(s => {
    let benar = 0, total = 0;
    s.cats.forEach(c => { if (per[c]) { benar += per[c].benar; total += per[c].total; } });
    const skor = total ? Math.round(benar / total * s.max) : 0;
    return { ...s, benar, total, skor, lulus: skor >= s.pass };
  });
  const total = secs.reduce((a, s) => a + s.skor, 0);
  const cfg = JLPT_PASS[h.lv] || { overall: 90, cefr: "-" };
  const lulus = total >= cfg.overall && secs.every(s => s.lulus);
  return { secs, total, overall: cfg.overall, cefr: cfg.cefr, lulus };
}
function htmlHasil() {
  const { hasil: h, pkg, tersimpan } = R;
  const a = analisis(h.perKategori || {});
  const rata = h.total ? h.durasiAktual / h.total : 0;
  const isFull = h.jenis === "full";
  const J = isFull ? hitungJLPT(h) : null;
  const warna = J ? (J.lulus ? "var(--green)" : "var(--red)") : (h.skor >= 80 ? "var(--green)" : h.skor >= 60 ? "var(--gold)" : "var(--red)");
  const scorecard = J ? `
    <div class="jx-jlpt-card ${J.lulus ? "lulus" : "gagal"}">
      <div class="jx-jlpt-top">
        <div class="verdict">${J.lulus ? "✅ GÔKAKU · LULUS" : "❌ FUGÔKAKU · TIDAK LULUS"}</div>
        <div class="tot"><b>${J.total}</b> <span>/ 180</span></div>
        <div class="jx-muted">Ambang lulus ${h.lv.toUpperCase()}: ${J.overall} · CEFR ≈ <b>${J.cefr}</b></div>
      </div>
      <table class="jx-jlpt-sec">
        <tr><th>Seksi</th><th>Skor</th><th>Min.</th><th></th></tr>
        ${J.secs.map(s => `<tr>
          <td><b>${s.label}</b><br><small class="jx-muted">${s.sub} · ${s.benar}/${s.total} benar</small></td>
          <td><b>${s.skor}</b> / ${s.max}</td>
          <td>${s.pass}</td>
          <td class="${s.lulus ? "g" : "r"}">${s.lulus ? "✔ lolos" : "✗ di bawah minimum"}</td>
        </tr>`).join("")}
      </table>
      <div class="jx-muted sm">Skor diskalakan proporsional sebagai <b>estimasi</b> — JLPT asli memakai skala setara (equated). Lulus = total ≥ ambang DAN setiap seksi ≥ minimumnya.</div>
    </div>` : "";
  return `
  <div class="panel jx jx-result">
    ${crumbs([["JLPT Center", "jlpt"], [`JLPT ${h.lv.toUpperCase()}`, `jlpt/${h.lv}`], [JENIS[h.jenis]?.nama || h.jenis, `jlpt/${h.lv}/${h.jenis}`], ["Hasil"]])}
    ${scorecard}
    <div class="jx-res-head">
      <div class="skor" style="--c:${warna}"><b>${h.skor}</b><span>%</span><div class="jx-muted">${isFull ? "Akurasi jawaban" : "Estimasi hasil latihan"}</div></div>
      <div class="meta">
        <div><span>Nama</span><b>${esc(h.nama)}</b></div>
        <div><span>Level</span><b>JLPT ${h.lv.toUpperCase()}</b></div>
        <div><span>Paket</span><b>${esc(h.judul)}</b></div>
        <div><span>Status</span><b class="${h.status === "timeout" ? "y" : "g"}">${h.status === "timeout" ? "⏰ Waktu habis (otomatis)" : "✔ Selesai"}</b></div>
        <div><span>Benar / Salah / Kosong</span><b><i class="g">${h.benar}</i> / <i class="r">${h.salah}</i> / <i>${h.kosong}</i> dari ${h.total}</b></div>
        <div><span>Waktu dipilih</span><b>${Math.round(h.durasiDipilih / 60)} menit</b></div>
        <div><span>Waktu terpakai</span><b>${fmtPanjang(h.durasiAktual)}</b></div>
        <div><span>Rata-rata per soal</span><b>${Math.round(rata)} detik</b></div>
        <div><span>Mulai</span><b>${fmtJam(h.mulai)}</b></div>
        <div><span>Selesai</span><b>${fmtJam(h.selesai)}</b></div>
      </div>
    </div>
    ${tersimpan ? "" : `<div class="jx-warn">Hasil disimpan di perangkat ini. ${S().user?.isAnonymous ? "Akun tamu tidak tersimpan ke server — masuk dengan akun dari guru agar nilai tercatat." : "Belum tersinkron ke server (offline?). Akan dicoba lagi saat membuka Riwayat."}</div>`}
    <h3>Analisis per kategori</h3>
    <div class="jx-kat">${a.rows.map(r => `
      <div class="row"><span class="k">${CAT_LABEL[r.k] || r.k}</span>
        <div class="jx-bar big"><i style="width:${r.pct}%; background:${r.pct >= 80 ? "var(--green)" : r.pct >= 60 ? "var(--gold)" : "var(--red)"}"></i></div>
        <span class="v">${r.benar}/${r.total} · ${r.pct}%</span></div>`).join("")}</div>
    ${a.kuat ? `<div class="jx-insight">
      <div>💪 Paling dikuasai: <b>${CAT_LABEL[a.kuat.k]}</b> (${a.kuat.pct}%)</div>
      <div>🎯 Perlu ditingkatkan: <b>${CAT_LABEL[a.lemah.k]}</b> (${a.lemah.pct}%)</div>
      <ul>${(REKOM[a.lemah.k] || []).map(x => `<li>${x}</li>`).join("")}</ul></div>` : ""}
    <div class="jx-row wrap">
      <button class="btn gold" onclick="JLPT.bukaReview()">📖 Lihat Pembahasan</button>
      <button class="btn ghost" onclick="route('jlpt/${h.lv}/${h.jenis}/${h.pkgId}')">🔄 Ulangi</button>
      <button class="btn ghost" onclick="route('jlpt/${h.lv}/${h.jenis}')">← Daftar paket</button>
      <button class="btn ghost" onclick="route('jlpt-riwayat')">📊 Riwayat</button>
    </div>
  </div>`;
}

/* ---------------- 8. REVIEW & PEMBAHASAN ---------------- */
function statusOf(i) {
  const q = R.pkg.flat[i], p = R.hasil.jawaban[i];
  if (p == null || p < 0) return "kosong";
  return p === q.ans ? "benar" : "salah";
}
function daftarFilter() {
  const f = R.filter;
  return R.pkg.flat.map((_, i) => i).filter(i => f === "semua" || (f === "ditandai" ? R.hasil.tandai?.[i] : statusOf(i) === f));
}
function bukaReview() { R.filter = "semua"; R.pos = 0; renderReview(); }
function renderReview() {
  document.getElementById("app").innerHTML = htmlReview();
  window.scrollTo(0, 0);
  linkKanji(document.querySelector(".jx-revq")).catch(() => {});
}
/* ---------------- 8b. KANJI BISA DIPENCET DI PEMBAHASAN (kamus dari materi) ---------------- */
const LV_ORDER = ["n5", "n4", "n3", "n2", "n1"];
const isKj = (ch) => { const c = ch.codePointAt(0); return (c >= 0x4E00 && c <= 0x9FFF) || (c >= 0x3400 && c <= 0x4DBF) || (c >= 0xF900 && c <= 0xFAFF) || ch === "々"; };
const hasKj = (str) => Array.from(str).some(isKj);
const isHira = (ch) => ch >= "ぁ" && ch <= "ゖ";
let KD = null, KD_PROMISE = null;
async function loadKD(lv) {
  const need = LV_ORDER.slice(0, Math.max(1, LV_ORDER.indexOf(lv) + 1));
  const key = need.join();
  if (KD && KD.key === key) return KD;
  if (KD_PROMISE && KD_PROMISE.key === key) return KD_PROMISE.p;
  const p = (async () => {
    const getJ = (u) => fetch(u).then(r => r.ok ? r.json() : []).catch(() => []);
    const files = await Promise.all(need.flatMap(l => [getJ(`./data/kosakata-${l}.json`), getJ(`./data/kanji-${l}.json`)]));
    const words = new Map(), stems = new Map(), chars = new Map(), byChar = new Map();
    const addWord = (kata, kana, arti, contoh, ctArti, l) => {
      kata = String(kata || "").replace(/[（(][^）)]*[）)]|[～〜○]/g, "").trim();
      if (!kata || !hasKj(kata) || words.has(kata)) return;
      const e = { kata, kana: kana || "", arti: arti || "", contoh: contoh || "", ctArti: ctArti || "", lv: l };
      words.set(kata, e);
      for (const ch of new Set(Array.from(kata).filter(isKj))) { const a = byChar.get(ch) || []; if (a.length < 8) { a.push(e); byChar.set(ch, a); } }
      const last = kata[kata.length - 1];
      if (kata.length >= 3 && isHira(last)) { const st = kata.slice(0, -1); if (hasKj(st) && !stems.has(st)) stems.set(st, e); }
    };
    need.forEach((l, i) => {
      for (const it of files[i * 2] || []) addWord(it.kata || it.k, it.kana || it.f, it.arti || it.a, it.contoh || it.ej, it.arti_contoh || it.et, l);
      for (const it of files[i * 2 + 1] || []) {
        const k = it.kanji || it.k || "";
        if (Array.from(k).length === 1 && !chars.has(k)) chars.set(k, { k, on: it.onyomi || it.on || "", kun: it.kunyomi || it.kun || "", arti: it.arti || it.a || "", lv: l });
        for (const c of it.c || []) addWord(c.k, c.r, c.a, "", "", l);
      }
    });
    const maxLen = Math.max(...[...words.keys()].map(k => k.length), 2);
    KD = { key, words, stems, chars, byChar, maxLen: Math.min(maxLen, 8), lv };
    return KD;
  })();
  KD_PROMISE = { key, p };
  return p;
}
function tokenKanji(str, D) {
  const A = Array.from(str), out = []; let i = 0, buf = "";
  const flush = () => { if (buf) { out.push({ t: buf }); buf = ""; } };
  while (i < A.length) {
    if (!isKj(A[i])) { buf += A[i++]; continue; }
    let hit = null;
    for (let n = Math.min(D.maxLen, A.length - i); n >= 1 && !hit; n--) {
      const seg = A.slice(i, i + n).join("");
      if (n >= 2 && D.words.has(seg)) hit = { seg, ty: "w", key: seg };
      else if (n >= 2 && D.stems.has(seg)) hit = { seg, ty: "w", key: D.stems.get(seg).kata };
    }
    if (!hit) hit = { seg: A[i], ty: "c", key: A[i] };
    flush(); out.push({ t: hit.seg, ty: hit.ty, key: hit.key }); i += Array.from(hit.seg).length;
  }
  flush(); return out;
}
async function linkKanji(root) {
  if (!root || root.dataset.kw) return; root.dataset.kw = "1";
  const D = await loadKD(R?.hasil?.lv || S().level || "n5").catch(() => null); if (!D) return;
  const sels = ".jx-q .txt, .jx-opt .t, .jx-passage .jp, .jx-ex .ans, .jx-ex .jp, .jx-ex li, .jx-ex p";
  for (const box of root.querySelectorAll(sels)) {
    const tw = document.createTreeWalker(box, NodeFilter.SHOW_TEXT, { acceptNode: (n) => n.parentElement.closest("rt,rp,.jx-w,script,style,button") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const nodes = []; let n; while ((n = tw.nextNode())) if (hasKj(n.nodeValue)) nodes.push(n);
    for (const nd of nodes) {
      const toks = tokenKanji(nd.nodeValue, D); if (!toks.some(t => t.ty)) continue;
      const fr = document.createDocumentFragment();
      for (const t of toks) {
        if (!t.ty) { fr.append(t.t); continue; }
        const sp = document.createElement("span"); sp.className = "jx-w"; sp.dataset.ty = t.ty; sp.dataset.key = t.key; sp.tabIndex = 0; sp.setAttribute("role", "button");
        sp.textContent = t.t; fr.append(sp);
      }
      nd.replaceWith(fr);
    }
  }
}
const brRuby = (t) => safe(String(t || "")).replace(/([\u3400-\u9fff々]+)\[([^\]]+)\]/g, "<ruby>$1<rt>$2</rt></ruby>");
function kwClose() { document.getElementById("jx-kw")?.remove(); }
function kwOpen(el) {
  const D = KD; if (!D) return;
  const ty = el.dataset.ty, key = el.dataset.key; let body = "", say = "", read = "";
  const L = (D.lv || "").toUpperCase();
  if (ty === "w") {
    const e = D.words.get(key); if (!e) return;
    say = e.kata; read = e.kana;
    body = `<div class="jx-kw-h"><ruby class="jp">${esc(e.kata)}<rt>${esc(e.kana)}</rt></ruby><span class="tag">N${e.lv.slice(1)}</span></div>
      <div class="jx-kw-m"><b>${esc(e.arti)}</b></div>
      <div class="jx-muted">Bacaan: <b class="jp">${esc(e.kana)}</b></div>
      ${e.contoh ? `<div class="jx-kw-ex"><p class="jp">${brRuby(e.contoh)}</p><p class="jx-muted">${esc(e.ctArti)}</p></div>` : ""}`;
  } else {
    const c = D.chars.get(key), ws = D.byChar.get(key) || [];
    say = key; read = c ? (c.kun || c.on || "").split(/[、,\s]/)[0].replace(/[.\-]/g, "") : "";
    body = `<div class="jx-kw-h"><span class="jp big">${esc(key)}</span>${c ? `<span class="tag">N${c.lv.slice(1)}</span>` : ""}</div>
      ${c ? `<div class="jx-kw-m"><b>${esc(c.arti)}</b></div>
        ${c.on ? `<div class="jx-muted">Onyomi: <b class="jp">${esc(c.on)}</b></div>` : ""}${c.kun ? `<div class="jx-muted">Kunyomi: <b class="jp">${esc(c.kun)}</b></div>` : ""}` : `<div class="jx-muted">Kanji ini belum ada di data materi level ${L} ke bawah.</div>`}
      ${ws.length ? `<div class="jx-kw-ex"><b>Kata dengan ${esc(key)}:</b><ul>${ws.slice(0, 6).map(w => `<li><span class="jp">${esc(w.kata)}</span> (${esc(w.kana)}) — ${esc(w.arti)}</li>`).join("")}</ul></div>` : ""}`;
  }
  kwClose();
  const sh = document.createElement("div"); sh.id = "jx-kw";
  sh.innerHTML = `<div class="jx-kw-bg" onclick="JLPT.kwClose()"></div><div class="jx-kw-in" role="dialog" aria-label="Detail kanji">
    <button type="button" class="jx-kw-x" onclick="JLPT.kwClose()" aria-label="Tutup">✕</button>${body}
    <div class="jx-row"><button class="btn" onclick="JLPT.kwSay()">🔊 Dengar</button><button class="btn ghost" onclick="JLPT.kwClose()">Tutup</button></div></div>`;
  sh.dataset.say = say; sh.dataset.read = read;
  document.body.append(sh);
}
function kwSay() {
  const sh = document.getElementById("jx-kw"); if (!sh) return;
  try { window.SV.speak(sh.dataset.say, { role: "kosakata", level: (R?.hasil?.lv || "n5"), say: sh.dataset.read || undefined }); } catch (_) {}
}
if (!window.__jxKw) {
  window.__jxKw = true;
  const go = (e) => { const w = e.target.closest?.(".jx-w"); if (!w) return; e.preventDefault(); kwOpen(w); };
  document.addEventListener("click", go);
  document.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") go(e); });
}

function htmlEx(q, pkg) {
  const x = q.ex || {};
  const part = (no, jp, id, body) => body ? `<section><h5><span class="n">${no}</span>${jp} <small>${id}</small></h5>${body}</section>` : "";
  const list = (arr) => arr && arr.length ? `<ul>${arr.map(v => `<li>${safe(v)}</li>`).join("")}</ul>` : "";
  const g = x.grammar;
  const gHtml = g ? `<div class="jx-g"><div><b>Pola:</b> ${esc(g.pola)}</div><div><b>Arti:</b> ${esc(g.arti)}</div>
      ${g.rumus ? `<div><b>Pembentukan &amp; penjelasan:</b> ${esc(g.rumus)}</div>` : ""}
      ${g.situasi && g.situasi !== g.rumus ? `<div><b>Situasi penggunaan:</b> ${esc(g.situasi)}</div>` : ""}</div>` : "";
  const passage = q.pid ? pkg.passages[q.pid] : null;
  let terj = x.terjemahan ? `<p>${esc(x.terjemahan)}</p>` : "";
  if (passage) terj = `<p class="jx-muted">Terjemahan bacaan:</p><p>${esc(passage.id)}</p>`;
  let alasan = x.alasan ? `<p>${esc(x.alasan)}</p>` : "";
  if (x.bukti) alasan += `<blockquote class="jx-bukti">📌 Dasar jawaban: ${safe(x.bukti)}</blockquote>`;
  const trans = x.transkrip ? `<details><summary>📜 Transkrip</summary><ul class="jp">${x.transkrip.map(t => `<li>${esc(t)}</li>`).join("")}</ul></details>` : "";
  return `<div class="jx-ex">
    ${part(1, "正解", "Jawaban benar", x.jawaban ? `<p class="ans">${esc(x.jawaban)}</p>` : "")}
    ${part(2, "問題の意味", "Terjemahan soal", terj + trans)}
    ${part(3, "正解の理由", "Alasan jawaban benar", alasan)}
    ${part(4, "選択肢の解説", "Penjelasan setiap pilihan", list(x.opsi))}
    ${part(5, "文法解説", "Penjelasan grammar", gHtml)}
    ${part(6, "語彙解説", "Kosakata penting", list(x.kosakata))}
    ${part(7, "漢字解説", "Kanji penting", list(x.kanji))}
    ${part(8, "文構造", "Struktur kalimat", x.struktur ? `<p class="jp">${esc(x.struktur)}</p>` : "")}
    ${part(9, "例文", "Contoh kalimat", list(x.contoh))}
    ${part(10, "学習ポイント", "Poin belajar", x.poin ? `<p>${esc(x.poin)}</p>` : "")}
  </div>`;
}
function htmlReview() {
  const { hasil: h, pkg } = R;
  const ids = daftarFilter();
  const counts = { semua: pkg.flat.length, benar: 0, salah: 0, kosong: 0, ditandai: 0 };
  pkg.flat.forEach((_, i) => { counts[statusOf(i)]++; if (h.tandai?.[i]) counts.ditandai++; });
  const filt = [["semua", "Semua"], ["benar", "Benar"], ["salah", "Salah"], ["kosong", "Tidak dijawab"], ["ditandai", "Ditandai"]]
    .map(([k, t]) => `<button class="jx-chip ${R.filter === k ? "on" : ""}" onclick="JLPT.filter('${k}')">${t} <b>${counts[k]}</b></button>`).join("");
  const grid = pkg.flat.map((_, i) => `<button class="${statusOf(i)} ${h.tandai?.[i] ? "flag" : ""} ${ids[R.pos] === i ? "cur" : ""} ${ids.includes(i) ? "" : "dim"}" onclick="JLPT.revLompat(${i})">${i + 1}</button>`).join("");
  if (!ids.length) {
    return `<div class="panel jx">${crumbs([["JLPT Center", "jlpt"], ["Pembahasan"]])}<h2>📖 Pembahasan — ${esc(h.judul)}</h2>
      <div class="jx-row wrap">${filt}</div><div class="empty">Tidak ada soal untuk filter ini.</div>
      <button class="btn ghost" onclick="JLPT.kembaliHasil()">← Ringkasan hasil</button></div>`;
  }
  const i = ids[Math.min(R.pos, ids.length - 1)];
  const q = pkg.flat[i], sec = pkg.sections[q._si];
  const pick = h.jawaban[i];
  const st = statusOf(i);
  const passage = q.pid ? pkg.passages[q.pid] : null;
  const ck = q.ck;
  const opts = q.opts.map((o, k) => {
    const cls = k === q.ans ? "right" : (k === pick ? "wrong" : "");
    const tag = k === q.ans ? `<em class="g">✓ Jawaban benar</em>` : (k === pick ? `<em class="r">✗ Jawabanmu</em>` : "");
    return `<div class="jx-opt static ${cls}"><span class="k">${ck ? k + 1 : ABCD[k]}</span><span class="t">${safe(o)}</span>${tag}</div>`;
  }).join("");
  return `
  <div class="panel jx">
    ${crumbs([["JLPT Center", "jlpt"], [`JLPT ${h.lv.toUpperCase()}`, `jlpt/${h.lv}`], ["Pembahasan"]])}
    <h2>📖 Pembahasan — ${esc(h.judul)}</h2>
    <div class="jx-row wrap">${filt}</div>
    <div class="jx-grid review">${grid}</div>
    <div class="jx-revq">
      <div class="jx-revhead"><b>Soal ${i + 1}</b> · 問題${sec.mondai} ${esc(sec.tipe_jp)}
        <span class="badge ${st}">${st === "benar" ? "✓ BENAR" : st === "salah" ? "✗ SALAH" : "◯ TIDAK DIJAWAB"}</span>
        ${h.tandai?.[i] ? `<span class="badge flag">🚩 Ditandai</span>` : ""}</div>
      <div class="jx-muted">Jawabanmu: <b>${pick == null || pick < 0 ? "—" : (ck ? pick + 1 : ABCD[pick])}</b> · Jawaban benar: <b>${ck ? q.ans + 1 : ABCD[q.ans]}</b></div>
      ${passage ? `<details class="jx-passage" open><summary>📄 Bacaan</summary><div class="jp">${safe(passage.jp)}</div></details>` : ""}
      ${ck ? `<div class="jx-audio"><button class="btn ghost" onclick="JLPT.putarReview(${i})">▶ Putar ulang audio</button></div>` : ""}
      <div class="jx-q"><div class="no">${i + 1}</div><div class="txt">${safe(q.q)}</div></div>
      <div class="jx-opts ${q.html_opts ? "long" : ""}">${opts}</div>
      ${htmlEx(q, pkg)}
      <div class="jx-nav">
        <button class="btn ghost" ${R.pos <= 0 ? "disabled" : ""} onclick="JLPT.revGeser(-1)">← Sebelumnya</button>
        <button class="btn ghost" onclick="JLPT.kembaliHasil()">Ringkasan</button>
        <button class="btn" ${R.pos >= ids.length - 1 ? "disabled" : ""} onclick="JLPT.revGeser(1)">Selanjutnya →</button>
      </div>
    </div>
  </div>`;
}
function filterReview(f) { R.filter = f; R.pos = 0; renderReview(); }
function revGeser(d) { R.pos = Math.max(0, Math.min(daftarFilter().length - 1, R.pos + d)); renderReview(); }
function revLompat(i) {
  let ids = daftarFilter();
  if (!ids.includes(i)) { R.filter = "semua"; ids = daftarFilter(); }
  R.pos = ids.indexOf(i); renderReview();
}
function kembaliHasil() { document.getElementById("app").innerHTML = htmlHasil(); window.scrollTo(0, 0); }
function putarReview(i) { putar(R.pkg.flat[i]); }

async function viewReviewDariRiwayat(id) {
  const list = await riwayat();
  const h = list.find(x => x.id === id || x.localId === id);
  if (!h) return `<div class="panel"><h2>Pembahasan</h2><div class="empty">Data hasil tidak ditemukan.</div><button class="btn ghost" onclick="route('jlpt-riwayat')">← Riwayat</button></div>`;
  const pkg = await loadPkg(h.file);
  R = { hasil: h, pkg, filter: "semua", pos: 0, tersimpan: !h._lokal };
  return htmlHasil();
}

/* ---------------- 9. RIWAYAT & PERKEMBANGAN ---------------- */
async function sinkronLokal() {
  if (!S().user || S().user.isAnonymous) return 0;
  const lokal = LS.get(LOKAL_KEY(), []);
  let ok = 0;
  for (const h of lokal.slice()) {
    try { await FB.simpanHasilJLPT(h); ok++; LS.set(LOKAL_KEY(), LS.get(LOKAL_KEY(), []).filter(x => x.localId !== h.localId)); } catch (e) { break; }
  }
  return ok;
}
function grafik(list) {
  const pts = list.slice(0, 20).reverse();
  if (pts.length < 2) return `<div class="jx-muted">Grafik muncul setelah minimal 2 kali ujian.</div>`;
  const W = 640, H = 200, P = 30;
  const x = (i) => P + i * (W - 2 * P) / (pts.length - 1);
  const y = (v) => H - P - v / 100 * (H - 2 * P);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.skor || 0).toFixed(1)}`).join(" ");
  return `<svg class="jx-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik perkembangan nilai">
    ${[0, 60, 100].map(v => `<line x1="${P}" x2="${W - P}" y1="${y(v)}" y2="${y(v)}" class="gl"/><text x="4" y="${y(v) + 4}" class="tl">${v}</text>`).join("")}
    <path d="${line}" class="ln"/>
    ${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.skor || 0)}" r="4" class="pt"><title>${esc(p.judul)}: ${p.skor}%</title></circle>`).join("")}
  </svg>`;
}
async function viewRiwayat() {
  const n = await sinkronLokal();
  if (n) toast(`☁️ ${n} hasil tersinkron ke server`);
  const cur = curLevel();
  const list = (await riwayat(true)).filter(h => !cur || h.lv === cur);
  const idx = await loadIndex();
  const perLv = LV.filter(l => !cur || l === cur).map(lv => {
    const total = Object.keys(JENIS).reduce((a, j) => a + (idx.level[lv]?.[j]?.length || 0), 0);
    const mine = list.filter(h => h.lv === lv);
    const unik = new Set(mine.map(h => h.pkgId)).size;
    const rata = mine.length ? Math.round(mine.reduce((a, h) => a + (h.skor || 0), 0) / mine.length) : 0;
    return { lv, total, unik, rata, n: mine.length };
  });
  const katAll = {};
  list.forEach(h => Object.entries(h.perKategori || {}).forEach(([k, v]) => { katAll[k] = katAll[k] || { benar: 0, total: 0 }; katAll[k].benar += v.benar; katAll[k].total += v.total; }));
  const a = analisis(katAll);
  const last = list[0];
  const rows = list.map(h => `<tr onclick="route('jlpt-review/${h.id || h.localId}')">
      <td>${fmtJam(tglMs(h))}</td><td>${h.lv.toUpperCase()}</td><td>${esc(h.judul)}${h._lokal ? ' <span class="tag">lokal</span>' : ""}</td>
      <td><b>${h.skor}%</b></td><td>${h.benar}/${h.total}</td><td>${fmtPanjang(h.durasiAktual)}</td>
      <td>${h.status === "timeout" ? "⏰" : "✔"}</td></tr>`).join("");
  return `
  <div class="panel jx">
    ${crumbs([["JLPT Center", "jlpt"], ["Riwayat"]])}
    <h2>📊 Riwayat &amp; Perkembangan</h2>
    <div class="jx-cards4">
      <div><span>Nilai terakhir</span><b>${last ? last.skor + "%" : "-"}</b><small>${last ? esc(last.judul) : "Belum ada"}</small></div>
      <div><span>Total ujian</span><b>${list.length}</b><small>${cur ? "level " + cur.toUpperCase() : "semua level"}</small></div>
      <div><span>Rata-rata</span><b>${list.length ? Math.round(list.reduce((s, h) => s + (h.skor || 0), 0) / list.length) + "%" : "-"}</b><small>estimasi latihan</small></div>
      <div><span>Perlu dilatih</span><b>${a.lemah ? CAT_LABEL[a.lemah.k] : "-"}</b><small>${a.lemah ? a.lemah.pct + "% benar" : ""}</small></div>
    </div>
    <h3>Grafik nilai (20 ujian terakhir)</h3>
    ${grafik(list)}
    <h3>Progress per level</h3>
    <div class="jx-kat">${perLv.map(p => `<div class="row"><span class="k">${p.lv.toUpperCase()}</span>
      <div class="jx-bar big"><i style="width:${p.total ? Math.round(p.unik / p.total * 100) : 0}%"></i></div>
      <span class="v">${p.unik}/${p.total} paket · rata ${p.rata}%</span></div>`).join("")}</div>
    ${a.lemah ? `<h3>Rekomendasi latihan</h3><div class="jx-insight"><div>Kategori terlemah: <b>${CAT_LABEL[a.lemah.k]}</b> (${a.lemah.pct}%)</div>
      <ul>${(REKOM[a.lemah.k] || []).map(x => `<li>${x}</li>`).join("")}</ul></div>` : ""}
    <h3>Semua hasil</h3>
    ${list.length ? `<div class="jx-table-wrap"><table class="jx-tbl"><thead><tr><th>Tanggal</th><th>Lv</th><th>Paket</th><th>Nilai</th><th>Benar</th><th>Durasi</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`
                  : `<div class="empty">Belum ada riwayat. Mulai dari <a onclick="route('jlpt')">JLPT Center</a>.</div>`}
    <p class="jx-note">Hanya kamu dan guru yang bisa melihat riwayat ini.</p>
  </div>`;
}

/* ---------------- ringkasan untuk widget dashboard ---------------- */
export async function ringkasanTerakhir() {
  try { const c = curLevel(); const l = (await riwayat()).filter(h => !c || h.lv === c); return l[0] || null; } catch (e) { return null; }
}

window.JLPT = {
  pilihWaktu, mulai, batalSesi, jawab, geser, lompat, tandai, putar: () => putar(), konfirmasi,
  bukaReview, kwClose, kwSay, filter: filterReview, revGeser, revLompat, kembaliHasil, putarReview,
};
