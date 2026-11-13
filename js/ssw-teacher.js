// Panel guru SSW: aktif/nonaktif bidang, urutan, tambah bidang, status bab (Draft/Published/Hidden), progres siswa.
// Menonaktifkan bidang TIDAK menghapus progres siswa (dokumen progres tidak disentuh).
import { DEFAULT_BIDANG, esc, STATUS_LABEL } from "./ssw-core.js?v=20261113zd";

const TEMA = ["building", "kaigo", "factory", "restaurant", "farm", "construction", "hotel", "generic"];
const BAB_ST = { published: "Published (tampil untuk siswa)", draft: "Draft (hanya guru)", hidden: "Hidden (disembunyikan)" };
let FB = null, CTX = { toast: () => {}, rerender: () => {} }, VIEW = { progres: null, rank: null, kelas: "", cari: "", bidang: "" };
let BID = [], KLS = [];
let SIS = [];

async function loadAll() {
  let remote = [];
  try { remote = await FB.loadSswBidang(); } catch (e) { CTX.toast("Gagal memuat bidang: " + (e.message || e)); }
  const map = new Map(DEFAULT_BIDANG.map(b => [b.slug, { ...b }]));
  for (const r of remote) map.set(r.slug, { ...(map.get(r.slug) || { tema: "generic", urut: 99 }), ...r });
  return [...map.values()].sort((a, b) => (a.urut || 99) - (b.urut || 99));
}
async function babList(slug) {
  try {
    const base = `data/ssw/${slug}`;
    const idx = await (await fetch(`${base}/index.json`)).json();
    return await Promise.all(idx.bab.map(async b => { const d = (await (await fetch(`${base}/${b.file}`)).json()).bab; return { id: d.id, no: d.no, title: d.title, subs: d.subs.length }; }));
  } catch (e) { return []; }
}

export async function renderSswTab(fb, ctx) {
  FB = fb; CTX = ctx;
  const list = await loadAll(); BID = list;
  let rows = "";
  for (const b of list) {
    const babs = b.hasContent ? await babList(b.slug) : [];
    const babRows = babs.map(x => {
      const st = (b.bab && b.bab[x.id]) || "published";
      return `<tr><td>BAB ${x.no} — ${esc(x.title.id)} <span style="color:var(--gray);font-size:12px">(${x.subs} subbab)</span></td>
        <td><select onchange="SSWT.setBab('${b.slug}','${x.id}',this.value)">${Object.entries(BAB_ST).map(([k, v]) => `<option value="${k}" ${st === k ? "selected" : ""}>${v}</option>`).join("")}</select></td></tr>`;
    }).join("");
    rows += `<div class="card" style="margin-bottom:14px;">
      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;">
        <div><b style="font-size:16px">${esc(b.nama)}</b> <span style="color:var(--gray)">${esc(b.jp || "")}</span>
          <span style="font-size:12px;margin-left:8px;color:${b.hasContent ? "var(--green,#10b981)" : "var(--gray)"}">${b.hasContent ? "materi tersedia" : "belum ada materi"}</span></div>
        <label style="display:flex;gap:6px;align-items:center;cursor:pointer"><input type="checkbox" ${b.aktif ? "checked" : ""} onchange="SSWT.toggle('${b.slug}',this.checked)"> ${b.aktif ? "Aktif" : "Nonaktif"}</label>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;align-items:center;font-size:13px">
        <label>Urutan <input type="number" value="${b.urut || 99}" style="width:64px" onchange="SSWT.field('${b.slug}','urut',+this.value)"></label>
        <label>Tema <select onchange="SSWT.field('${b.slug}','tema',this.value)">${TEMA.map(t => `<option ${b.tema === t ? "selected" : ""}>${t}</option>`).join("")}</select></label>
        <label>Nama <input value="${esc(b.nama)}" style="width:150px" onchange="SSWT.field('${b.slug}','nama',this.value)"></label>
        <label>日本語 <input value="${esc(b.jp || "")}" style="width:150px" onchange="SSWT.field('${b.slug}','jp',this.value)"></label>
        <button class="btn ghost sm" onclick="SSWT.progres('${b.slug}')">👥 Progres siswa</button>
        <button class="btn ghost sm" onclick="SSWT.rank('${b.slug}')">🏆 Leaderboard</button>
      </div>
      ${babs.length ? `<div class="table-wrap" style="margin-top:10px"><table><thead><tr><th>Bab</th><th>Status</th></tr></thead><tbody>${babRows}</tbody></table></div>` : ""}
      ${b.aktif && !b.hasContent ? `<div style="color:var(--gold,#f59e0b);font-size:12px;margin-top:8px">⚠ Bidang aktif tapi belum ada materi: siswa hanya melihat "belum tersedia".</div>` : ""}
      ${VIEW.rank === b.slug ? `<div id="sswt-rank" style="margin-top:10px">Memuat…</div>` : ""}
      ${VIEW.progres === b.slug ? `<div id="sswt-prog" style="margin-top:10px">Memuat progres…</div>` : ""}
    </div>`;
  }
  setTimeout(() => { if (VIEW.progres) fillProgres(VIEW.progres); if (VIEW.rank) rankHtml(VIEW.rank); }, 0);
  const akses = await aksesHtml();
  return `<div class="page-title"><h2>🌏 SSW 特定技能</h2></div>${akses}
    <p style="color:var(--gray);font-size:13px;margin:0 0 12px">Aktifkan bidang yang sudah punya materi. Bab berstatus Draft/Hidden tidak terlihat siswa. Menonaktifkan bidang tidak menghapus progres belajar siswa.</p>
    ${rows}
    <div class="card"><b>➕ Tambah bidang baru</b>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
        <input id="sswt-slug" placeholder="slug (contoh: ship-building)" style="width:190px">
        <input id="sswt-nama" placeholder="Nama" style="width:160px"><input id="sswt-jp" placeholder="日本語" style="width:140px">
        <select id="sswt-tema">${TEMA.map(t => `<option>${t}</option>`).join("")}</select>
        <button class="btn" onclick="SSWT.add()">Tambah</button></div>
      <div style="color:var(--gray);font-size:12px;margin-top:6px">Bidang baru tampil sebagai "belum tersedia" sampai materinya (folder <code>data/ssw/{slug}/</code>) ditambahkan dan dicentang aktif.</div></div>`;
}

async function aksesHtml() {
  try { SIS = (await FB.listSiswa()).filter(x => (x.role || "student") === "student"); } catch (e) { SIS = []; return `<div class="card" style="margin-bottom:14px"><b>🔑 Akses siswa ke SSW</b><div style="color:var(--gray);font-size:13px;margin-top:6px">${esc(e.message || e)}</div></div>`; }
  const kelas = [...new Set(SIS.map(x => x.kelas).filter(Boolean))].sort();
  const q = VIEW.cari.toLowerCase();
  const vis = SIS.filter(x => (!VIEW.kelas || x.kelas === VIEW.kelas) && (!q || ((x.nama || "") + " " + (x.email || "")).toLowerCase().includes(q)))
    .sort((a, b) => (a.nama || "").localeCompare(b.nama || ""));
  if (VIEW.bidang) return aksesBidangHtml(kelas, vis);
  const on = SIS.filter(x => x.aksesSsw !== false).length;
  const rows = vis.map(x => `<tr><td>${esc(x.nama || x.email || x.uid)}<div style="color:var(--gray);font-size:12px">${esc(x.kelas || "-")}</div></td>
    <td style="text-align:right"><label style="display:inline-flex;gap:6px;align-items:center;cursor:pointer;min-height:40px"><input type="checkbox" ${x.aksesSsw !== false ? "checked" : ""} onchange="SSWT.akses('${x.uid}',this.checked)"> ${x.aksesSsw !== false ? "Boleh" : "Diblokir"}</label></td></tr>`).join("");
  return `<div class="card" style="margin-bottom:14px"><b>🔑 Akses siswa ke SSW</b>
    <div style="color:var(--gray);font-size:12px;margin:4px 0 8px">Siswa baru otomatis boleh. Hilangkan centang untuk memblokir. Progres siswa yang diblokir tetap tersimpan. ${on}/${SIS.length} siswa punya akses.</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px">
      ${bidangSelect()}
      <select onchange="SSWT.filter('kelas',this.value)"><option value="">Semua kelas</option>${kelas.map(k => `<option ${VIEW.kelas === k ? "selected" : ""}>${esc(k)}</option>`).join("")}</select>
      <input id="sswt-cari" placeholder="Cari nama/email" value="${esc(VIEW.cari)}" style="width:160px" onchange="SSWT.filter('cari',this.value)">
      <button class="btn ghost sm" onclick="SSWT.massal(true)">✅ Izinkan yang tampil (${vis.length})</button>
      <button class="btn ghost sm" onclick="SSWT.massal(false)">🚫 Blokir yang tampil</button></div>
    ${rows ? `<div class="table-wrap" style="max-height:340px;overflow:auto"><table><tbody>${rows}</tbody></table></div>` : `<div style="color:var(--gray)">Tidak ada siswa.</div>`}</div>`;
}
/* ---- Akses per bidang: siswa (prioritas 1) → kelas (prioritas 2) → bawaan (hanya Building Cleaning terbuka) ---- */
const bidangSelect = () => `<select onchange="SSWT.filter('bidang',this.value)"><option value="">Semua SSW (blokir total)</option>${BID.filter(b => !b.induk).map(b => `<option value="${esc(b.slug)}" ${VIEW.bidang === b.slug ? "selected" : ""}>Bidang: ${esc(b.nama)}</option>`).join("")}</select>`;
const tri = (v) => typeof v === "boolean" ? (v ? "1" : "0") : "";
const triSel = (cur, fn) => `<select onchange="${fn}"><option value="" ${cur === "" ? "selected" : ""}>Ikut bawaan</option><option value="1" ${cur === "1" ? "selected" : ""}>Boleh</option><option value="0" ${cur === "0" ? "selected" : ""}>Blokir</option></select>`;
async function aksesBidangHtml(kelas, vis) {
  const slug = VIEW.bidang, b = BID.find(x => x.slug === slug) || { nama: slug };
  try { KLS = await FB.listKelas(); } catch (e) { KLS = []; }
  const bawaan = slug === "building-cleaning";
  const efektif = (x) => { const a = (x.aksesSswBidang || {})[slug]; if (typeof a === "boolean") return a; const k = (KLS.find(k => k.nama === x.kelas)?.aksesSswBidang || {})[slug]; if (typeof k === "boolean") return k; return bawaan; };
  const kRows = KLS.map(k => `<tr><td>${esc(k.nama || k.id)}</td><td style="text-align:right">${triSel(tri((k.aksesSswBidang || {})[slug]), `SSWT.aksesKelas('${k.id}',this.value)`)}</td></tr>`).join("");
  const rows = vis.map(x => `<tr><td>${esc(x.nama || x.email || x.uid)}<div style="color:var(--gray);font-size:12px">${esc(x.kelas || "-")} · sekarang: <b style="color:${x.aksesSsw === false ? "var(--red)" : efektif(x) ? "var(--green,#10b981)" : "var(--red)"}">${x.aksesSsw === false ? "SSW diblokir total" : efektif(x) ? "boleh" : "terkunci"}</b></div></td>
    <td style="text-align:right">${triSel(tri((x.aksesSswBidang || {})[slug]), `SSWT.aksesBidang('${x.uid}',this.value)`)}</td></tr>`).join("");
  return `<div class="card" style="margin-bottom:14px"><b>🔑 Akses bidang: ${esc(b.nama)}</b>
    <div style="color:var(--gray);font-size:12px;margin:4px 0 8px">Urutan: pengaturan siswa → pengaturan kelas → bawaan (${bawaan ? "terbuka" : "terkunci"}). Mengunci akses tidak menghapus progres.</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px">${bidangSelect()}
      <select onchange="SSWT.filter('kelas',this.value)"><option value="">Semua kelas</option>${kelas.map(k => `<option ${VIEW.kelas === k ? "selected" : ""}>${esc(k)}</option>`).join("")}</select>
      <input placeholder="Cari nama/email" value="${esc(VIEW.cari)}" style="width:160px" onchange="SSWT.filter('cari',this.value)">
      <button class="btn ghost sm" onclick="SSWT.massalBidang(true)">✅ Boleh untuk yang tampil (${vis.length})</button>
      <button class="btn ghost sm" onclick="SSWT.massalBidang(false)">🚫 Blokir yang tampil</button>
      <button class="btn ghost sm" onclick="SSWT.massalBidang(null)">↺ Ikut bawaan</button></div>
    ${kRows ? `<div style="font-size:13px;margin:6px 0 4px"><b>Per kelas</b></div><div class="table-wrap"><table><tbody>${kRows}</tbody></table></div>` : `<div style="color:var(--gray);font-size:12px">Belum ada kelas (buat di tab Kelas untuk mengatur akses per kelas).</div>`}
    <div style="font-size:13px;margin:10px 0 4px"><b>Per siswa</b></div>
    ${rows ? `<div class="table-wrap" style="max-height:340px;overflow:auto"><table><tbody>${rows}</tbody></table></div>` : `<div style="color:var(--gray)">Tidak ada siswa.</div>`}</div>`;
}
const triVal = (v) => v === "1" ? true : v === "0" ? false : null;
async function rankHtml(slug) {
  const el = document.getElementById("sswt-rank"); if (!el) return;
  let rows = []; try { rows = await FB.loadSswRank(slug); } catch (e) { el.textContent = "Gagal: " + (e.message || e); return; }
  rows.sort((a, b) => (b.poin || 0) - (a.poin || 0));
  el.innerHTML = rows.length ? `<div class="table-wrap"><table><thead><tr><th>#</th><th>Siswa</th><th>Kelas</th><th>Poin</th></tr></thead><tbody>${rows.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.nama)}</td><td>${esc(r.kelas || "-")}</td><td>${r.poin}</td></tr>`).join("")}</tbody></table></div>
    <button class="btn ghost sm" style="margin-top:8px" onclick="SSWT.resetRank('${slug}')">🗑 Reset leaderboard</button>` : `<div style="color:var(--gray)">Belum ada data.</div>`;
}

async function save(slug, data, msg) {
  try { await FB.saveSswBidang(slug, data); CTX.toast(msg || "Tersimpan"); } catch (e) { CTX.toast("Gagal: " + (e.message || e)); }
}
async function fillProgres(slug) {
  const el = document.getElementById("sswt-prog"); if (!el) return;
  let sis = []; try { sis = await FB.listSiswa(); } catch (e) {}
  const out = [];
  for (const s of sis) {
    try {
      const P = await FB.loadSswProgres(slug, s.uid); if (!P) continue;
      const read = Object.keys(P.read || {}).length, cards = Object.values(P.cards || {}), hafal = cards.filter(c => c.reps >= 1 || c.st === "hafal").length;
      const q = Object.values(P.quiz || {}).map(x => x.best ?? x.pct ?? 0), best = q.length ? Math.max(...q) : 0;
      out.push(`<tr><td>${esc(s.nama || s.email || s.uid)}</td><td>${read}</td><td>${hafal}/${cards.length}</td><td>${q.length ? Math.round(best) + "%" : "-"}</td></tr>`);
    } catch (e) {}
  }
  el.innerHTML = out.length ? `<div class="table-wrap"><table><thead><tr><th>Siswa</th><th>Subbab dibaca</th><th>Kartu hafal</th><th>Kuis terbaik</th></tr></thead><tbody>${out.join("")}</tbody></table></div>` : `<div style="color:var(--gray)">Belum ada siswa yang memulai bidang ini.</div>`;
}

window.SSWT = {
  toggle: (slug, v) => save(slug, { aktif: !!v }, v ? "Bidang diaktifkan" : "Bidang dinonaktifkan (progres siswa tetap aman)").then(() => CTX.rerender()),
  field: (slug, k, v) => save(slug, { [k]: v }),
  setBab: async (slug, babId, st) => {
    const cur = (await loadAll()).find(b => b.slug === slug) || {};
    await save(slug, { bab: { ...(cur.bab || {}), [babId]: st } }, "Status bab: " + st);
  },
  add: async () => {
    const slug = document.getElementById("sswt-slug").value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const nama = document.getElementById("sswt-nama").value.trim();
    if (!slug || !nama) return CTX.toast("Isi slug dan nama");
    await save(slug, { nama, jp: document.getElementById("sswt-jp").value.trim(), tema: document.getElementById("sswt-tema").value, aktif: false, hasContent: false, urut: 50 }, "Bidang ditambahkan");
    CTX.rerender();
  },
  rank: (slug) => { VIEW.rank = VIEW.rank === slug ? null : slug; CTX.rerender(); },
  resetRank: async (slug) => { if (!confirm("Hapus semua poin leaderboard bidang ini? Progres belajar siswa TIDAK terhapus.")) return; try { await FB.resetSswRank(slug); CTX.toast("Leaderboard direset"); } catch (e) { CTX.toast("Gagal: " + (e.message || e)); } CTX.rerender(); },
  filter: (k, v) => { VIEW[k] = v; CTX.rerender(); },
  akses: async (uid, v) => { try { await FB.setAksesSsw(uid, v); const x = SIS.find(y => y.uid === uid); if (x) x.aksesSsw = !!v; CTX.toast(v ? "Akses SSW dibuka" : "Akses SSW diblokir"); } catch (e) { CTX.toast("Gagal: " + (e.message || e)); } CTX.rerender(); },
  massal: async (v) => {
    const q = VIEW.cari.toLowerCase();
    const vis = SIS.filter(x => (!VIEW.kelas || x.kelas === VIEW.kelas) && (!q || ((x.nama || "") + " " + (x.email || "")).toLowerCase().includes(q)));
    if (!vis.length || !confirm(`${v ? "Izinkan" : "Blokir"} ${vis.length} siswa?`)) return;
    let n = 0; for (const x of vis) { try { await FB.setAksesSsw(x.uid, v); n++; } catch (e) {} }
    CTX.toast(`${n} siswa diperbarui`); CTX.rerender();
  },
  aksesBidang: async (uid, v) => { const val = triVal(v); try { await FB.setAksesSswBidang(uid, VIEW.bidang, val); const x = SIS.find(y => y.uid === uid); if (x) { x.aksesSswBidang = { ...(x.aksesSswBidang || {}) }; if (val === null) delete x.aksesSswBidang[VIEW.bidang]; else x.aksesSswBidang[VIEW.bidang] = val; } CTX.toast("Akses bidang disimpan"); } catch (e) { CTX.toast("Gagal: " + (e.message || e)); } CTX.rerender(); },
  aksesKelas: async (kid, v) => { try { await FB.setAksesSswKelas(kid, VIEW.bidang, triVal(v)); CTX.toast("Akses kelas disimpan"); } catch (e) { CTX.toast("Gagal: " + (e.message || e)); } CTX.rerender(); },
  massalBidang: async (val) => {
    const q = VIEW.cari.toLowerCase();
    const vis = SIS.filter(x => (!VIEW.kelas || x.kelas === VIEW.kelas) && (!q || ((x.nama || "") + " " + (x.email || "")).toLowerCase().includes(q)));
    if (!vis.length || !confirm(`Ubah akses bidang untuk ${vis.length} siswa?`)) return;
    let n = 0; for (const x of vis) { try { await FB.setAksesSswBidang(x.uid, VIEW.bidang, val); n++; } catch (e) {} }
    CTX.toast(`${n} siswa diperbarui`); CTX.rerender();
  },
  progres: (slug) => { VIEW.progres = VIEW.progres === slug ? null : slug; CTX.rerender(); },
};
