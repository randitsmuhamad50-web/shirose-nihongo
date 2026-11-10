/* =====================================================================
 * WRITER — animasi urutan goresan, kanvas menulis, dan penilaian goresan
 * ---------------------------------------------------------------------
 * Dipakai bersama oleh Hiragana/Katakana (js/kana-center.js) dan Kanji.
 *
 * Data goresan  : KanjiVG (c) Ulrich Apel, CC BY-SA 3.0 — https://kanjivg.tagaini.net
 *                 - kana  : data/kana-strokes.json (dibundel, offline)
 *                 - kanji : file SVG KanjiVG via CDN (sama dengan fitur "Urutan
 *                           Goresan" yang sudah ada), cadangan raw.githubusercontent.
 * Penilaian     : PERKIRAAN GEOMETRIS (bentuk, arah, urutan, posisi, kemiripan)
 *                 terhadap goresan KanjiVG. Ini BUKAN pengenalan tulisan tangan —
 *                 hasilnya selalu diberi label "perkiraan" di UI dan disertai
 *                 perbandingan visual supaya siswa bisa menilai sendiri.
 *
 * Fungsi murni (parsePath … scoreWriting, parseKvgSvg) tidak menyentuh DOM,
 * sehingga bisa diuji di Node.
 * ===================================================================== */

export const VB = 109;                         // ukuran kotak KanjiVG
export const KVG_COMMIT = "610091ce618cf757ed1357a8954cd65283e015d6";

/* ============================ path → titik ============================ */
const NUM = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gy;
const CMD = /[MmLlHhVvCcSsQqTtZz]/;

function tokenize(d) {
  const out = []; let i = 0;
  while (i < d.length) {
    const ch = d[i];
    if (CMD.test(ch)) { out.push(ch); i++; continue; }
    if (ch === " " || ch === "," || ch === "\n" || ch === "\t" || ch === "\r") { i++; continue; }
    NUM.lastIndex = i;
    const m = NUM.exec(d);
    if (!m) throw new Error("path tidak valid pada posisi " + i);
    out.push(parseFloat(m[0])); i = NUM.lastIndex;
  }
  return out;
}

const cub = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
};
const quad = (p0, p1, p2, t) => {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
};
const hyp = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Ubah atribut d SVG menjadi polyline [[x,y],…] (rapat ±1.2 satuan). */
export function samplePath(d) {
  const t = tokenize(d);
  const pts = [];
  let i = 0, cmd = "", cur = [0, 0], start = [0, 0], lastC = null, lastQ = null;
  const num = () => t[i++];
  const push = (p) => { pts.push([p[0], p[1]]); };
  while (i < t.length) {
    if (typeof t[i] === "string") cmd = t[i++];
    else if (cmd === "M") cmd = "L"; else if (cmd === "m") cmd = "l";
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    const ox = rel ? cur[0] : 0, oy = rel ? cur[1] : 0;
    if (C === "Z") { if (pts.length) { cur = start.slice(); push(cur); } lastC = lastQ = null; continue; }
    if (C === "M") { cur = [num() + ox, num() + oy]; start = cur.slice(); push(cur); lastC = lastQ = null; }
    else if (C === "L") { cur = [num() + ox, num() + oy]; push(cur); lastC = lastQ = null; }
    else if (C === "H") { cur = [num() + (rel ? cur[0] : 0), cur[1]]; push(cur); lastC = lastQ = null; }
    else if (C === "V") { cur = [cur[0], num() + (rel ? cur[1] : 0)]; push(cur); lastC = lastQ = null; }
    else if (C === "C" || C === "S") {
      let c1;
      if (C === "C") c1 = [num() + ox, num() + oy];
      else c1 = lastC ? [2 * cur[0] - lastC[0], 2 * cur[1] - lastC[1]] : cur.slice();
      const c2 = [num() + ox, num() + oy], p = [num() + ox, num() + oy];
      const n = Math.max(8, Math.ceil((hyp(cur, c1) + hyp(c1, c2) + hyp(c2, p)) / 1.2));
      for (let k = 1; k <= n; k++) push(cub(cur, c1, c2, p, k / n));
      cur = p; lastC = c2; lastQ = null;
    } else if (C === "Q" || C === "T") {
      let c1;
      if (C === "Q") c1 = [num() + ox, num() + oy];
      else c1 = lastQ ? [2 * cur[0] - lastQ[0], 2 * cur[1] - lastQ[1]] : cur.slice();
      const p = [num() + ox, num() + oy];
      const n = Math.max(6, Math.ceil((hyp(cur, c1) + hyp(c1, p)) / 1.2));
      for (let k = 1; k <= n; k++) push(quad(cur, c1, p, k / n));
      cur = p; lastQ = c1; lastC = null;
    } else throw new Error("perintah path tidak didukung: " + cmd);
  }
  return pts;
}

export function pathLength(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += hyp(pts[i - 1], pts[i]);
  return L;
}
export function pointAt(pts, frac) {
  if (pts.length < 2) return pts[0] || [0, 0];
  const L = pathLength(pts); let target = L * Math.max(0, Math.min(1, frac)), acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = hyp(pts[i - 1], pts[i]);
    if (acc + seg >= target) { const f = seg ? (target - acc) / seg : 0; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]; }
    acc += seg;
  }
  return pts[pts.length - 1];
}
/** Resample ke n titik berjarak sama sepanjang busur. */
export function resample(pts, n) {
  if (!pts.length) return [];
  if (pts.length === 1) return Array.from({ length: n }, () => pts[0].slice());
  const L = pathLength(pts);
  if (L === 0) return Array.from({ length: n }, () => pts[0].slice());
  const out = [pts[0].slice()]; let acc = 0, j = 1;
  for (let k = 1; k < n - 1; k++) {
    const target = (L * k) / (n - 1);
    while (j < pts.length - 1 && acc + hyp(pts[j - 1], pts[j]) < target) { acc += hyp(pts[j - 1], pts[j]); j++; }
    const seg = hyp(pts[j - 1], pts[j]); const f = seg ? (target - acc) / seg : 0;
    out.push([pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * f, pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * f]);
  }
  out.push(pts[pts.length - 1].slice());
  return out;
}

/* ============================ parsing SVG KanjiVG ============================ */
/** Ekstrak goresan + posisi nomor dari teks SVG KanjiVG (tanpa DOM). */
export function parseKvgSvg(text) {
  const body = text.slice(Math.max(0, text.indexOf("<svg")));
  const s = [...body.matchAll(/<path id="kvg:[0-9a-f]+-s\d+"[^>]*? d="([^"]+)"/g)].map(m => m[1]);
  const nums = [...body.matchAll(/transform="matrix\(1 0 0 1 ([\d.\-]+) ([\d.\-]+)\)">(\d+)<\/text>/g)]
    .sort((a, b) => +a[3] - +b[3]).map(m => [parseFloat(m[1]), parseFloat(m[2])]);
  if (!s.length) throw new Error("SVG tanpa goresan");
  const n = nums.length === s.length ? nums : s.map(d => { const p = samplePath(d)[0] || [10, 10]; return [p[0] - 6, p[1] - 2]; });
  return { s, n };
}

/* ============================ pemuat glyph ============================ */
const _glyph = new Map();
const _kShard = {};
let _kanaStrokes = null;
const hexOf = (ch) => ch.codePointAt(0).toString(16).padStart(5, "0");
export const kvgUrls = (ch) => [
  `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@${KVG_COMMIT}/kanji/${hexOf(ch)}.svg`,
  `https://raw.githubusercontent.com/KanjiVG/kanjivg/${KVG_COMMIT}/kanji/${hexOf(ch)}.svg`,
];
/** Karakter yang bisa ditulis: kanji, hiragana, katakana (termasuk ー). */
export const isWritable = (ch) => {
  const c = ch.codePointAt(0);
  return (c >= 0x4E00 && c <= 0x9FFF) || (c >= 0x3400 && c <= 0x4DBF) || (c >= 0xF900 && c <= 0xFAFF)
    || (c >= 0x3041 && c <= 0x3096) || (c >= 0x30A1 && c <= 0x30FA) || c === 0x30FC;
};
export const writableChars = (str) => Array.from(String(str || "")).filter(isWritable);

export async function loadKanaStrokes(base = "./") {
  if (_kanaStrokes) return _kanaStrokes;
  const r = await fetch(base + "data/kana-strokes.json");
  if (!r.ok) throw new Error("data/kana-strokes.json tidak bisa dimuat");
  _kanaStrokes = (await r.json()).strokes;
  return _kanaStrokes;
}
/** Muat goresan satu karakter. Melempar error bila tidak tersedia (mis. offline). */
export async function loadGlyph(ch, base = "./") {
  if (_glyph.has(ch)) return _glyph.get(ch);
  const code = ch.codePointAt(0);
  let g = null;
  if ((code >= 0x3041 && code <= 0x30FF)) {
    const ks = await loadKanaStrokes(base);
    g = ks[ch] || null;
  }
  if (!g && !(code >= 0x3041 && code <= 0x30FF)) {   // kanji: data lokal dulu (data/kanji-strokes), tanpa internet
    try {
      const sh = (code >> 8).toString(16).padStart(3, "0");
      if (!_kShard[sh]) _kShard[sh] = fetch(base + `data/kanji-strokes/${sh}.json`).then(r => r.ok ? r.json() : {}).catch(() => ({}));
      const e = (await _kShard[sh])[ch];
      if (e && e.s && e.s.length) g = { s: e.s, n: e.n && e.n.length === e.s.length ? e.n : e.s.map(d => { const p = samplePath(d)[0] || [10, 10]; return [p[0] - 6, p[1] - 2]; }) };
    } catch (_) {}
  }
  if (!g) {
    let lastErr = null;
    for (const url of kvgUrls(ch)) {
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error("HTTP " + r.status);
        g = parseKvgSvg(await r.text());
        break;
      } catch (e) { lastErr = e; }
    }
    if (!g) throw new Error(`Data goresan "${ch}" belum bisa dimuat (${lastErr ? lastErr.message : "tidak ada"}). Periksa koneksi internet.`);
  }
  _glyph.set(ch, g);
  return g;
}

/* ============================ penilaian ============================ */
const NPT = 32;
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const meanDist = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += hyp(a[i], b[i]); return s / a.length; };
const bbox = (pts) => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const p of pts) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
};
const norm = (pts) => {
  const b = bbox(pts), sc = Math.max(b.w, b.h, 12);
  return pts.map(p => [(p[0] - b.cx) / sc, (p[1] - b.cy) / sc]);
};
const angDiff = (u, r) => {
  const a1 = Math.atan2(u[u.length - 1][1] - u[0][1], u[u.length - 1][0] - u[0][0]);
  const a2 = Math.atan2(r[r.length - 1][1] - r[0][1], r[r.length - 1][0] - r[0][0]);
  let d = Math.abs(a1 - a2) * 180 / Math.PI; if (d > 180) d = 360 - d; return d;
};
export const labelFor = (s) => s >= 80 ? "Bagus sekali" : s >= 60 ? "Cukup baik" : s >= 40 ? "Perlu latihan" : "Coba lagi";

/**
 * @param user  goresan pengguna: [[ [x,y], … ], …] dalam koordinat 0–109
 * @param refD  daftar atribut d goresan referensi KanjiVG (urutan benar)
 * @returns {total, parts:{bentuk,arah,urutan,posisi,kemiripan}, strokes:[{q,status,ref,reversed}], tips:[…], label}
 */
export function scoreWriting(user, refD) {
  const U = user.filter(s => s.length && pathLength(s) >= 1.5).map(s => resample(s, NPT));
  const R = refD.map(d => resample(samplePath(d), NPT));
  const nu = U.length, nr = R.length;
  if (!nu) return { total: 0, parts: { bentuk: 0, arah: 0, urutan: 0, posisi: 0, kemiripan: 0 }, strokes: [], tips: ["Belum ada goresan yang ditulis."], label: labelFor(0) };

  // jarak mentah tiap goresan pengguna ke tiap goresan referensi (arah maju / mundur)
  const D = U.map(u => R.map(r => {
    const f = meanDist(u, r), b = meanDist(u.slice().reverse(), r);
    return { f, b, m: Math.min(f, b) };
  }));
  // pasangan serakah: tiap goresan pengguna (urut) → goresan referensi terdekat yang belum dipakai
  const used = new Set(), pair = [];
  for (let i = 0; i < nu; i++) {
    let best = -1, bm = 1e9;
    for (let j = 0; j < nr; j++) if (!used.has(j) && D[i][j].m < bm) { bm = D[i][j].m; best = j; }
    if (best >= 0) used.add(best);
    pair.push(best);
  }
  const strokes = [], shapeArr = [], dirArr = [], tips = [];
  let orderHit = 0;
  for (let i = 0; i < nu; i++) {
    const j = pair[i];
    if (j < 0) { strokes.push({ q: 0, status: "extra", ref: -1, reversed: false }); shapeArr.push(0); dirArr.push(0); continue; }
    const u = U[i], r = R[j], d = D[i][j];
    const reversed = d.b + 3 < d.f;
    const posS = clamp01(1 - d.m / 26);
    const lenR = pathLength(r);
    const nuV = norm(u), nrV = norm(r);
    const sh = Math.min(meanDist(nuV, nrV), meanDist(nuV.slice().reverse(), nrV));
    const shapeS = lenR < 8 ? posS : clamp01(1 - sh / 0.24);
    let dirS = 1;
    if (lenR >= 8) dirS = reversed ? 0 : (() => { const a = angDiff(u, r); return a <= 35 ? 1 : clamp01((100 - a) / 65); })();
    const q = lenR < 8 ? posS : 0.55 * posS + 0.45 * shapeS;
    shapeArr.push(shapeS); dirArr.push(dirS);
    // urutan: goresan ke-i cocok dengan referensi ke-i (toleransi kecil)
    const okOrder = j === i || (i < nr && D[i][i].m <= d.m + 6);
    if (okOrder) orderHit++;
    strokes.push({ q, status: q >= 0.7 ? "good" : q >= 0.45 ? "fair" : "poor", ref: j, reversed, orderOk: okOrder });
    if (reversed && lenR >= 8 && tips.length < 5) tips.push(`Goresan ${i + 1}: arahnya terbalik — mulailah dari ujung yang lain.`);
    else if (!okOrder && tips.length < 5) tips.push(`Goresan yang kamu tulis ke-${i + 1} mirip goresan ke-${j + 1} pada contoh — periksa urutannya.`);
    else if (shapeS < 0.4 && lenR >= 8 && tips.length < 5) tips.push(`Goresan ${i + 1}: bentuknya masih kurang mirip contoh.`);
  }
  const mean = (a) => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const countS = clamp01(1 - Math.abs(nu - nr) / Math.max(nr, 1));
  const bentuk = mean(shapeArr) * (nu >= nr ? 1 : nu / nr);
  const arah = mean(dirArr) * (nu >= nr ? 1 : nu / nr);
  const urutan = 0.7 * (orderHit / Math.max(nu, nr)) + 0.3 * countS;

  // posisi & ukuran keseluruhan
  const allU = U.flat(), allR = R.flat();
  const bu = bbox(allU), br = bbox(allR);
  const off = Math.hypot(bu.cx - br.cx, bu.cy - br.cy);
  const ratio = Math.hypot(bu.w, bu.h) / Math.max(1, Math.hypot(br.w, br.h));
  const posisi = 0.6 * clamp01(1 - off / 30) + 0.4 * clamp01(1 - Math.abs(Math.log(Math.max(ratio, 0.05))) / 0.7);
  if (off > 18) tips.push(`Tulisan agak bergeser ke ${Math.abs(bu.cx - br.cx) > Math.abs(bu.cy - br.cy) ? (bu.cx < br.cx ? "kiri" : "kanan") : (bu.cy < br.cy ? "atas" : "bawah")}.`);
  if (ratio < 0.65) tips.push("Tulisan terlalu kecil — isi kotak dengan lebih besar.");
  else if (ratio > 1.45) tips.push("Tulisan terlalu besar — beri sedikit ruang di tepi kotak.");

  // kemiripan: jarak chamfer dua arah
  const nearest = (a, set) => { let m = 1e9; for (const p of set) { const d = hyp(a, p); if (d < m) m = d; } return m; };
  const ch = (mean(allR.map(p => nearest(p, allU))) + mean(allU.map(p => nearest(p, allR)))) / 2;
  const kemiripan = clamp01(1 - ch / 14);

  if (nu !== nr) tips.unshift(`Jumlah goresan: kamu menulis ${nu}, seharusnya ${nr}.`);
  // Arah, urutan, dan posisi hanya bermakna bila bentuk goresannya memang mirip contoh:
  // tanpa "gerbang" ini, coretan acak mendapat nilai urutan/posisi yang tinggi secara kebetulan.
  const meanQ = mean(strokes.map(x => x.q));
  const gate = clamp01(1.25 * meanQ);
  let total = 100 * (0.25 * bentuk + 0.20 * arah * gate + 0.20 * urutan * gate + 0.15 * posisi * gate + 0.20 * kemiripan);
  total -= Math.min(25, 8 * Math.abs(nu - nr));
  // "Bagus sekali" (>=80) hanya bila tiap goresan berurutan benar dan arahnya tidak terbalik.
  const orderFrac = orderHit / Math.max(nu, nr);
  const anyRev = strokes.some(x => x.reversed);
  if (orderFrac < 0.5) total = Math.min(total, 64); else if (orderFrac < 1 || anyRev) total = Math.min(total, 79);
  total = Math.max(0, Math.min(100, Math.round(total)));
  if (!tips.length) tips.push(total >= 80 ? "Bentuk, arah, dan urutan goresanmu sudah sesuai contoh." : "Coba ulangi pelan-pelan mengikuti nomor goresan.");
  const pc = (x) => Math.round(clamp01(x) * 100);
  return { total, label: labelFor(total), strokes, tips,
    parts: { bentuk: pc(bentuk), arah: pc(arah), urutan: pc(urutan), posisi: pc(posisi), kemiripan: pc(kemiripan) },
    counts: { user: nu, ref: nr } };
}

/* ============================ SVG helper ============================ */
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const PAPER = "#fdfbf4", INK = "#1d2340", ACCENT = "#ef6a9a";

function guideSvg() {
  return `<rect x="0.5" y="0.5" width="108" height="108" fill="${PAPER}" stroke="#c9c3b0" stroke-width="1"/>
    <g stroke="#d6d0bd" stroke-width=".6" stroke-dasharray="3 3"><line x1="54.5" y1="0" x2="54.5" y2="109"/><line x1="0" y1="54.5" x2="109" y2="54.5"/></g>`;
}
function arrowPoly(pts, color) {
  if (pts.length < 3) return "";
  const e = pts[pts.length - 1];
  let p = pts[Math.max(0, pts.length - 6)];
  const a = Math.atan2(e[1] - p[1], e[0] - p[0]);
  const s = 3.4, h = (ang, r) => [e[0] + Math.cos(ang) * r, e[1] + Math.sin(ang) * r];
  const p1 = h(a, s), p2 = h(a + 2.5, s), p3 = h(a - 2.5, s);
  return `<polygon points="${p1.map(n => n.toFixed(1))} ${p2.map(n => n.toFixed(1))} ${p3.map(n => n.toFixed(1))}" fill="${color}"/>`;
}

/** Perbandingan visual: tulisan siswa (diwarnai per goresan) di atas bayangan contoh. */
export function compareSvg(user, glyph, result) {
  const col = { good: "#16a34a", fair: "#d97706", poor: "#dc2626", extra: "#dc2626" };
  const ghost = glyph.s.map(d => `<path d="${d}" fill="none" stroke="#b9c4e8" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
  const us = user.filter(s => s.length && pathLength(s) >= 1.5);
  const paths = us.map((s, i) => {
    const st = result?.strokes?.[i]?.status || "fair";
    return `<polyline points="${s.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ")}" fill="none" stroke="${col[st]}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="${(s[0][0] - 4).toFixed(1)}" y="${(s[0][1] - 2).toFixed(1)}" font-size="7" font-weight="700" fill="${col[st]}">${i + 1}</text>`;
  }).join("");
  return `<svg viewBox="0 0 109 109" class="kc-svg" role="img" aria-label="Perbandingan tulisanmu dengan contoh">${guideSvg()}${ghost}${paths}</svg>`;
}
export function glyphSvg(glyph, { numbers = true, color = INK } = {}) {
  const paths = glyph.s.map(d => `<path d="${d}" fill="none" stroke="${color}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
  const nums = numbers ? glyph.n.map((p, i) => `<text x="${p[0]}" y="${p[1]}" font-size="8" font-weight="700" fill="${ACCENT}">${i + 1}</text>`).join("") : "";
  return `<svg viewBox="0 0 109 109" class="kc-svg" role="img">${guideSvg()}${paths}${nums}</svg>`;
}

/* ============================ pemutar animasi ============================ */
/**
 * Animasi urutan goresan. Mendukung play/pause/ulang/kecepatan/nomor/hasil akhir.
 * @returns kontrol {play,pause,toggle,replay,final,setSpeed,setNumbers,destroy,get state}
 */
export function createPlayer(host, glyph, opts = {}) {
  const sampled = glyph.s.map(samplePath);
  const lens = sampled.map(pathLength);
  const DUR = lens.map(L => Math.max(0.55, L / 48)), GAP = 0.28;
  const starts = []; let T = 0;
  DUR.forEach((d, i) => { starts.push(T); T += d + GAP; });
  const st = { speed: opts.speed || 1, numbers: opts.numbers !== false, t: 0, playing: false, raf: 0, last: 0, done: false };
  host.innerHTML = `<svg viewBox="0 0 109 109" class="kc-svg" role="img" aria-label="Animasi urutan goresan">
    ${guideSvg()}
    <g>${glyph.s.map(d => `<path d="${d}" fill="none" stroke="#e4e0d2" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`).join("")}</g>
    <g>${glyph.s.map((d, i) => `<path data-i="${i}" d="${d}" pathLength="100" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="100" stroke-dashoffset="100"/>`).join("")}</g>
    <g class="kc-nums">${glyph.n.map((p, i) => `<text data-n="${i}" x="${p[0]}" y="${p[1]}" font-size="8" font-weight="700" fill="${ACCENT}" opacity="0">${i + 1}</text>`).join("")}</g>
    <circle class="kc-pen" r="2.6" fill="${ACCENT}" opacity="0"/>
  </svg>`;
  const paths = [...host.querySelectorAll("path[data-i]")], nums = [...host.querySelectorAll("text[data-n]")], pen = host.querySelector(".kc-pen");
  const ease = (x) => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  const emit = () => opts.onState && opts.onState({ playing: st.playing, done: st.done, speed: st.speed, numbers: st.numbers, stroke: cur() });
  const cur = () => { let k = -1; for (let i = 0; i < starts.length; i++) if (st.t >= starts[i]) k = i; return k; };
  function paint() {
    let penShown = false;
    for (let i = 0; i < paths.length; i++) {
      const f = clamp01((st.t - starts[i]) / DUR[i]);
      paths[i].setAttribute("stroke-dashoffset", String(100 * (1 - ease(f))));
      const started = st.t >= starts[i];
      nums[i].setAttribute("opacity", st.numbers && started ? "1" : "0");
      if (f > 0 && f < 1 && st.playing) { const p = pointAt(sampled[i], ease(f)); pen.setAttribute("cx", p[0]); pen.setAttribute("cy", p[1]); penShown = true; }
    }
    pen.setAttribute("opacity", penShown ? "1" : "0");
  }
  function frame(ts) {
    if (!st.playing) return;
    if (!st.last) st.last = ts;
    st.t += ((ts - st.last) / 1000) * st.speed; st.last = ts;
    if (st.t >= T) { st.t = T; st.playing = false; st.done = true; paint(); emit(); return; }
    paint(); st.raf = requestAnimationFrame(frame);
  }
  const api = {
    play() { if (st.done || st.t >= T) { st.t = 0; st.done = false; } st.playing = true; st.last = 0; cancelAnimationFrame(st.raf); st.raf = requestAnimationFrame(frame); emit(); },
    pause() { st.playing = false; cancelAnimationFrame(st.raf); paint(); emit(); },
    toggle() { st.playing ? api.pause() : api.play(); },
    replay() { st.t = 0; st.done = false; api.play(); },
    final() { st.playing = false; cancelAnimationFrame(st.raf); st.t = T; st.done = true; paint(); emit(); },
    setSpeed(v) { st.speed = v; emit(); },
    setNumbers(v) { st.numbers = !!v; paint(); emit(); },
    destroy() { st.playing = false; cancelAnimationFrame(st.raf); },
    get state() { return { ...st, total: T, strokes: glyph.s.length }; },
  };
  paint();
  return api;
}

/* ============================ kanvas menulis ============================ */
/**
 * Kanvas menulis dengan Pointer Events (mouse, sentuh, stylus).
 * Mode: "trace" (bayangan + goresan berikutnya disorot), "copy" (contoh di luar kanvas),
 *       "memory" (kosong; contoh hanya muncul sebentar bila diminta).
 */
export class WriteCanvas {
  constructor(host, { onChange } = {}) {
    this.host = host; this.onChange = onChange || (() => {});
    this.mode = "trace"; this.glyph = null; this.strokes = []; this.cur = null; this.peekUntil = 0; this.hintUsed = false;
    this.verdicts = [];
    host.innerHTML = `<canvas class="kc-canvas" aria-label="Area menulis"></canvas>`;
    this.cv = host.querySelector("canvas");
    this.cv.style.touchAction = "none";
    this.ctx = this.cv.getContext("2d");
    const stop = (e) => { if (e.cancelable) e.preventDefault(); };
    for (const ev of ["touchstart", "touchmove", "touchend"]) this.cv.addEventListener(ev, stop, { passive: false });
    this.cv.addEventListener("contextmenu", stop);
    this._down = (e) => this.down(e); this._move = (e) => this.move(e); this._up = (e) => this.up(e);
    this.cv.addEventListener("pointerdown", this._down);
    this.cv.addEventListener("pointermove", this._move);
    this.cv.addEventListener("pointerup", this._up);
    this.cv.addEventListener("pointercancel", this._up);
    this.cv.addEventListener("lostpointercapture", this._up);
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
  }
  setGlyph(glyph) { this.glyph = glyph; this._ref = glyph ? glyph.s.map(samplePath) : []; this.clear(); }
  setMode(m) { this.mode = m; this.hintUsed = false; this.clear(); }
  resize() {
    const w = Math.max(120, Math.round(this.host.clientWidth)), dpr = window.devicePixelRatio || 1;
    this.cv.width = w * dpr; this.cv.height = w * dpr; this.cv.style.width = w + "px"; this.cv.style.height = w + "px";
    this.k = (w * dpr) / VB; this.draw();
  }
  pt(e) {
    const r = this.cv.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * VB, ((e.clientY - r.top) / r.height) * VB];
  }
  down(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (!this.glyph) return;
    if (e.cancelable) e.preventDefault();
    try { this.cv.setPointerCapture(e.pointerId); } catch (_) {}
    this.cur = [this.pt(e)]; this.pid = e.pointerId; this.draw();
  }
  move(e) {
    if (!this.cur || e.pointerId !== this.pid) return;
    if (e.cancelable) e.preventDefault();
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    for (const ev of (evs.length ? evs : [e])) this.cur.push(this.pt(ev));
    this.draw();
  }
  up(e) {
    if (!this.cur || (e && e.pointerId !== undefined && e.pointerId !== this.pid)) return;
    const s = this.cur; this.cur = null;
    if (s.length === 1) s.push([s[0][0] + 0.01, s[0][1] + 0.01]);     // ketukan = titik
    this.strokes.push(s);
    this.verdicts.push(this.quickVerdict(this.strokes.length - 1));
    this.draw(); this.onChange(this);
  }
  /** Umpan balik cepat per goresan (tidak memblokir): sesuai/tidak dengan goresan yang diharapkan. */
  quickVerdict(i) {
    const r = this._ref[i]; if (!r) return "extra";
    const u = resample(this.strokes[i], NPT), rr = resample(r, NPT);
    const m = Math.min(meanDist(u, rr), meanDist(u.slice().reverse(), rr));
    return m <= 16 ? "good" : m <= 26 ? "fair" : "poor";
  }
  undo() { this.strokes.pop(); this.verdicts.pop(); this.draw(); this.onChange(this); }
  clear() { this.strokes = []; this.verdicts = []; this.cur = null; this.peekUntil = 0; this.draw(); this.onChange(this); }
  peek(ms = 2500) {
    this.peekUntil = Date.now() + ms; this.hintUsed = true; this.draw();
    clearTimeout(this._pk); this._pk = setTimeout(() => this.draw(), ms + 30);
  }
  get peeking() { return Date.now() < this.peekUntil; }
  result() { return this.glyph ? scoreWriting(this.strokes, this.glyph.s) : null; }
  draw() {
    const c = this.ctx, k = this.k || 1, W = this.cv.width;
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, W);
    c.fillStyle = PAPER; c.fillRect(0, 0, W, W);
    // kotak panduan
    c.strokeStyle = "#c9c3b0"; c.lineWidth = Math.max(1, k * .9); c.strokeRect(k * .5, k * .5, W - k, W - k);
    c.setLineDash([k * 3, k * 3]); c.strokeStyle = "#d6d0bd"; c.lineWidth = Math.max(1, k * .6);
    c.beginPath(); c.moveTo(W / 2, 0); c.lineTo(W / 2, W); c.moveTo(0, W / 2); c.lineTo(W, W / 2); c.stroke();
    c.beginPath(); c.moveTo(0, 0); c.lineTo(W, W); c.moveTo(W, 0); c.lineTo(0, W); c.strokeStyle = "#e7e2d2"; c.stroke();
    c.setLineDash([]);
    const stroke = (pts, w, col, alpha = 1) => {
      if (pts.length < 2) return;
      c.globalAlpha = alpha; c.strokeStyle = col; c.lineWidth = w * k; c.lineCap = "round"; c.lineJoin = "round";
      c.beginPath(); c.moveTo(pts[0][0] * k, pts[0][1] * k); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0] * k, pts[i][1] * k); c.stroke(); c.globalAlpha = 1;
    };
    const showGhost = this.glyph && (this.mode === "trace" || this.peeking);
    if (showGhost) {
      this._ref.forEach((p, i) => stroke(p, 5.2, this.mode === "trace" ? "#cfd6ee" : "#9fb0e6", this.peeking && this.mode !== "trace" ? .85 : 1));
      const next = this.strokes.length;
      c.font = `700 ${8 * k}px sans-serif`;
      this.glyph.n.forEach((n, i) => {
        if (this.mode === "trace" && i > next) return;                     // nomor muncul bertahap
        c.fillStyle = i === next && this.mode === "trace" ? ACCENT : "#8b93b8"; c.fillText(String(i + 1), n[0] * k, n[1] * k);
      });
      if (this.mode === "trace" && next < this._ref.length) {            // sorot goresan berikutnya + titik awal + panah arah
        const p = this._ref[next];
        stroke(p, 5.6, ACCENT, .45);
        c.fillStyle = "#16a34a"; c.beginPath(); c.arc(p[0][0] * k, p[0][1] * k, 3 * k, 0, 7); c.fill();
        const e = p[p.length - 1], q = p[Math.max(0, p.length - 6)], a = Math.atan2(e[1] - q[1], e[0] - q[0]);
        c.fillStyle = ACCENT; c.beginPath();
        c.moveTo((e[0] + Math.cos(a) * 3.6) * k, (e[1] + Math.sin(a) * 3.6) * k);
        c.lineTo((e[0] + Math.cos(a + 2.5) * 3.6) * k, (e[1] + Math.sin(a + 2.5) * 3.6) * k);
        c.lineTo((e[0] + Math.cos(a - 2.5) * 3.6) * k, (e[1] + Math.sin(a - 2.5) * 3.6) * k); c.fill();
      }
    }
    const col = { good: "#16a34a", fair: "#d97706", poor: "#dc2626", extra: "#dc2626" };
    this.strokes.forEach((s, i) => stroke(s, 3.8, this.mode === "trace" ? (col[this.verdicts[i]] || INK) : INK));
    if (this.cur) stroke(this.cur, 3.8, INK);
    c.restore();
  }
  destroy() { this.ro.disconnect(); clearTimeout(this._pk); this.cv.remove(); }
}
