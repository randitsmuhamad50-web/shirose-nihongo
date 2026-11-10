// Panel guru SSW: aktif/nonaktif bidang, urutan, tambah bidang, status bab (Draft/Published/Hidden), progres siswa.
// Menonaktifkan bidang TIDAK menghapus progres siswa (dokumen progres tidak disentuh).
import { DEFAULT_BIDANG, esc, STATUS_LABEL } from "./ssw-core.js";

const TEMA = ["building", "kaigo", "factory", "restaurant", "farm", "construction", "hotel", "generic"];
const BAB_ST = { published: "Published (tampil untuk siswa)", draft: "Draft (hanya guru)", hidden: "Hidden (disembunyikan)" };
let FB = null, CTX = { toast: () => {}, rerender: () => {} }, VIEW = { progres: null };

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
  const list = await loadAll();
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
      </div>
      ${babs.length ? `<div class="table-wrap" style="margin-top:10px"><table><thead><tr><th>Bab</th><th>Status</th></tr></thead><tbody>${babRows}</tbody></table></div>` : ""}
      ${b.aktif && !b.hasContent ? `<div style="color:var(--gold,#f59e0b);font-size:12px;margin-top:8px">⚠ Bidang aktif tapi belum ada materi: siswa hanya melihat "belum tersedia".</div>` : ""}
      ${VIEW.progres === b.slug ? `<div id="sswt-prog" style="margin-top:10px">Memuat progres…</div>` : ""}
    </div>`;
  }
  setTimeout(() => { if (VIEW.progres) fillProgres(VIEW.progres); }, 0);
  return `<div class="page-title"><h2>🌏 SSW 特定技能</h2></div>
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
  progres: (slug) => { VIEW.progres = VIEW.progres === slug ? null : slug; CTX.rerender(); },
};
