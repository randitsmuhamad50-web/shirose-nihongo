/* =====================================================================
 * SSW — ilustrasi SVG 2.5D isometrik (ringan, tanpa gambar eksternal).
 * Setiap tema = satu bidang SSW. Semua digambar dari poligon sederhana
 * supaya cepat di Android dan tajam di layar apa pun.
 * ===================================================================== */

const P = (pts, fill, extra = "") => `<polygon points="${pts.map(p => p.join(",")).join(" ")}" fill="${fill}" ${extra}/>`;

/** Blok isometrik: (x,y) = titik bawah-tengah depan, w/d = lebar sisi kanan/kiri, h = tinggi. */
function iso(x, y, w, d, h, c) {
  const top = [[x, y - h], [x + w, y - h - w / 2], [x + w - d, y - h - w / 2 - d / 2], [x - d, y - h - d / 2]];
  const right = [[x, y], [x + w, y - w / 2], [x + w, y - w / 2 - h], [x, y - h]];
  const left = [[x, y], [x - d, y - d / 2], [x - d, y - d / 2 - h], [x, y - h]];
  return P(left, c.l) + P(right, c.r) + P(top, c.t);
}
/** jendela pada sisi kanan blok iso */
function winsRight(x, y, w, h, cols, rows, color = "#bfe3ff") {
  let s = "";
  const pw = w / (cols + 1), ph = h / (rows + 1);
  for (let r = 1; r <= rows; r++) for (let c = 1; c <= cols; c++) {
    const px = x + c * pw - pw * 0.3, py = y - r * ph - (c * pw) / 2 + ph * 0.35;
    s += P([[px, py], [px + pw * 0.55, py - pw * 0.275], [px + pw * 0.55, py - pw * 0.275 - ph * 0.5], [px, py - ph * 0.5]], color);
  }
  return s;
}
function winsLeft(x, y, d, h, cols, rows, color = "#9fd0f5") {
  let s = "";
  const pw = d / (cols + 1), ph = h / (rows + 1);
  for (let r = 1; r <= rows; r++) for (let c = 1; c <= cols; c++) {
    const px = x - c * pw + pw * 0.3, py = y - r * ph - (c * pw) / 2 + ph * 0.35;
    s += P([[px, py], [px - pw * 0.55, py - pw * 0.275], [px - pw * 0.55, py - pw * 0.275 - ph * 0.5], [px, py - ph * 0.5]], color);
  }
  return s;
}
const COL = {
  white: { l: "#dfe6f2", r: "#f4f7fc", t: "#ffffff" },
  blue: { l: "#3b6fb8", r: "#4d86d4", t: "#7aa9e6" },
  red: { l: "#b8433f", r: "#d65a55", t: "#ee8b84" },
  brick: { l: "#a8573f", r: "#c46c50", t: "#dc8d6e" },
  green: { l: "#3a8d5c", r: "#4fa874", t: "#79c797" },
  yellow: { l: "#d9a73a", r: "#f0c04f", t: "#ffd978" },
  gray: { l: "#8892a6", r: "#a2acc0", t: "#c3cbdb" },
  dark: { l: "#394058", r: "#4a526e", t: "#626c8c" },
  wood: { l: "#8a5a36", r: "#a8704a", t: "#c68e64" },
  cream: { l: "#e6d3a8", r: "#f4e4bd", t: "#fff2d2" },
};
const person = (x, y, shirt = "#4d6fd0", hat = null, s = 1) => `
  <g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="1" rx="6" ry="2" fill="rgba(0,0,0,.18)"/>
    <rect x="-3.4" y="-9" width="2.6" height="9" rx="1.2" fill="#8a7a62"/><rect x="0.8" y="-9" width="2.6" height="9" rx="1.2" fill="#8a7a62"/>
    <rect x="-5" y="-20" width="10" height="12" rx="3.5" fill="${shirt}"/>
    <circle cx="0" cy="-25" r="5" fill="#f3cfa6"/>
    <path d="M-5 -26 Q0 -34 5 -26 Q2 -29 -5 -26Z" fill="#2c2433"/>
    ${hat ? `<rect x="-5.5" y="-31" width="11" height="3.6" rx="1.5" fill="${hat}"/>` : ""}
  </g>`;

/** Dasar pulau melayang: rumput + batuan menggantung + bayangan. */
function base(c = "#6ac48a", c2 = "#3f9a63", rock = "#8a6f5a") {
  return `
  <ellipse cx="150" cy="226" rx="70" ry="9" fill="rgba(0,0,0,.14)"/>
  <path d="M30 128 L150 190 L270 128 L270 138 Q262 168 232 184 Q208 198 190 214 Q172 232 150 238 Q128 232 110 214 Q92 198 68 184 Q38 168 30 138Z" fill="${rock}"/>
  <path d="M110 214 Q128 232 150 238 Q142 214 132 196Z" fill="rgba(0,0,0,.14)"/>
  <path d="M190 214 Q172 232 150 238 Q160 218 168 198Z" fill="rgba(255,255,255,.08)"/>
  <polygon points="150,66 270,128 150,190 30,128" fill="${c}"/>
  <polygon points="30,128 150,190 150,198 30,136" fill="${c2}"/>
  <polygon points="270,128 150,190 150,198 270,136" fill="#4aa66f"/>
  <path d="M60 130 L88 144" stroke="rgba(255,255,255,.18)" stroke-width="3" stroke-linecap="round"/>`;
}
const tree = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-1.5" y="-8" width="3" height="9" fill="#7a5638"/><circle cx="0" cy="-14" r="8" fill="#2f9a5a"/><circle cx="-4" cy="-11" r="5" fill="#3cb26c"/></g>`;

/* ----------------------------- TEMA ----------------------------- */
const THEMES = {
  /* Building Cleaning: hotel tinggi, gedung kantor, petugas, vacuum, polisher, kaca */
  building() {
    return base() +
      iso(150, 170, 34, 34, 60, COL.white) + winsRight(150, 170, 34, 60, 3, 5) + winsLeft(150, 170, 34, 60, 3, 5) +
      iso(150, 110, 34, 34, 8, COL.blue) +
      `<rect x="112" y="48" width="38" height="9" rx="2" fill="#d65a55" transform="skewY(-14) translate(0 30)"/>` +
      iso(88, 160, 28, 26, 28, COL.gray) + winsRight(88, 160, 28, 28, 2, 2, "#d9ecff") + winsLeft(88, 160, 26, 28, 2, 2, "#b7d9f7") +
      iso(214, 152, 24, 22, 20, COL.cream) + winsRight(214, 152, 24, 20, 2, 1, "#fdfdf0") +
      /* kereta pel/vacuum */
      `<g transform="translate(120 188)"><rect x="-8" y="-7" width="16" height="9" rx="3" fill="#2f6fd0"/><circle cx="-5" cy="3" r="2.4" fill="#222"/><circle cx="5" cy="3" r="2.4" fill="#222"/><path d="M6 -6 L18 -24" stroke="#555" stroke-width="2.2" stroke-linecap="round"/></g>` +
      /* polisher */
      `<g transform="translate(184 190)"><ellipse cx="0" cy="0" rx="11" ry="4.5" fill="#d65a55"/><ellipse cx="0" cy="-2" rx="9" ry="3.5" fill="#ef7f78"/><path d="M0 -4 L6 -26" stroke="#666" stroke-width="2.2" stroke-linecap="round"/></g>` +
      person(150, 196, "#3f6fd8", "#ffd34d") + person(98, 188, "#2f9a6a", null, .85) +
      `<g transform="translate(62 176)"><rect x="-7" y="-12" width="14" height="16" rx="1.5" fill="#bfe3ff" stroke="#fff" stroke-width="1.6"/><path d="M-3 -9 L3 -3" stroke="#fff" stroke-width="1.4"/></g>` +
      `<g fill="#fff" opacity=".9"><circle cx="232" cy="96" r="2.2"/><circle cx="238" cy="88" r="1.6"/><circle cx="226" cy="90" r="1.4"/></g>`;
  },
  /* Kaigo: fasilitas lansia, rumah perawatan, caregiver, tempat tidur, kursi roda */
  kaigo() {
    return base("#78c892", "#44a06a") +
      iso(150, 168, 46, 30, 34, COL.cream) + winsRight(150, 168, 46, 34, 4, 2, "#cfe8ff") + winsLeft(150, 168, 30, 34, 2, 2, "#b9daf5") +
      P([[104, 134 - 6], [150, 168 - 34 - 24], [196, 134 - 6 - 6 - 14 + 6], [150, 168 - 34 - 2]], "#c4584d") +
      `<rect x="144" y="112" width="12" height="12" rx="2" fill="#fff"/><path d="M150 114v8M146 118h8" stroke="#d64f4f" stroke-width="2.6" stroke-linecap="round"/>` +
      iso(214, 160, 22, 20, 16, COL.white) +
      `<g transform="translate(92 190)"><circle cx="0" cy="-4" r="8" fill="none" stroke="#555" stroke-width="2.2"/><circle cx="12" cy="0" r="3" fill="none" stroke="#555" stroke-width="2"/><rect x="-2" y="-16" width="9" height="9" rx="2" fill="#6ba8e8"/><path d="M7 -9 L14 -9" stroke="#555" stroke-width="2"/></g>` +
      `<g transform="translate(180 192)"><rect x="-14" y="-8" width="28" height="9" rx="2.5" fill="#9fd0f5"/><rect x="-14" y="-12" width="8" height="5" rx="2" fill="#fff"/><rect x="-15" y="-9" width="2.4" height="12" fill="#777"/><rect x="12.6" y="-9" width="2.4" height="12" fill="#777"/></g>` +
      person(124, 196, "#f08cab", null) + person(146, 200, "#6fb3e8", null, .9) +
      tree(60, 168, 1.1) + tree(240, 170, .9);
  },
  /* Food Manufacturing: pabrik, conveyor, mesin, pekerja higienis */
  factory() {
    return base("#7bc88f", "#48a26b") +
      iso(120, 172, 50, 36, 38, COL.gray) + winsRight(120, 172, 50, 38, 4, 1, "#d9ecff") +
      iso(168, 148, 18, 18, 34, COL.red) + `<rect x="158" y="82" width="22" height="5" rx="2" fill="#9aa5ba" transform="translate(-3 4)"/>` +
      `<g fill="#fff" opacity=".85"><circle cx="164" cy="74" r="6"/><circle cx="174" cy="66" r="5"/><circle cx="184" cy="58" r="4"/></g>` +
      /* conveyor belt + produk */
      P([[148, 196], [220, 160], [226, 163], [154, 199]], "#444c63") + P([[148, 196], [154, 199], [154, 203], [148, 200]], "#2f3547") +
      `<g><rect x="168" y="168" width="9" height="7" rx="2" fill="#f2b84b"/><rect x="190" y="158" width="9" height="7" rx="2" fill="#f2b84b"/><rect x="208" y="150" width="9" height="7" rx="2" fill="#e8805a"/></g>` +
      iso(96, 190, 18, 16, 16, COL.blue) +
      person(128, 198, "#f4f6fb", "#f4f6fb") + person(238, 168, "#f4f6fb", "#f4f6fb", .8);
  },
  /* Food Service: restoran Jepang, dapur, sushi counter, chef & pelayan */
  restaurant() {
    return base("#7cc58f", "#46a06b") +
      iso(138, 168, 52, 36, 36, COL.wood) + P([[86, 132 - 8], [140, 168 - 36 - 28], [200, 168 - 36 - 28 + 14 - 4], [138, 168 - 36 + 2]], "#8b3b32") +
      winsRight(138, 168, 52, 36, 3, 1, "#ffe9b0") +
      `<g><rect x="106" y="146" width="10" height="14" fill="#c43c3c" transform="skewY(26) translate(0 -62)"/><rect x="120" y="150" width="10" height="14" fill="#fff" transform="skewY(26) translate(0 -62)"/><rect x="134" y="154" width="10" height="14" fill="#c43c3c" transform="skewY(26) translate(0 -62)"/></g>` +
      /* sushi counter */
      iso(206, 184, 40, 16, 12, COL.cream) +
      `<g><ellipse cx="206" cy="154" rx="4.4" ry="2.6" fill="#fff"/><ellipse cx="206" cy="152.6" rx="4.4" ry="2" fill="#f0685b"/><ellipse cx="218" cy="149" rx="4.4" ry="2.6" fill="#fff"/><ellipse cx="218" cy="147.6" rx="4.4" ry="2" fill="#f5a45d"/></g>` +
      `<g transform="translate(86 176)"><circle cx="0" cy="0" r="6" fill="#e8584a"/><rect x="-1" y="-12" width="2" height="6" fill="#7a5638"/></g>` +
      person(150, 198, "#ffffff", "#ffffff") + person(112, 192, "#3e4a78", null, .9) +
      `<g transform="translate(236 198)"><ellipse cx="0" cy="0" rx="8" ry="3" fill="#fff"/><path d="M-7 -1 L-12 -9 M7 -1 L12 -9" stroke="#888" stroke-width="1.6"/></g>`;
  },
  farm() {
    return base("#8fd18a", "#58ad63", "#8c6a4e") +
      [0, 1, 2, 3].map(i => P([[70 + i * 6, 150 + i * 6], [150 + i * 6, 190 + i * 6 - 40 + 40 - 6], [158 + i * 6, 186 + i * 6 - 4], [78 + i * 6, 146 + i * 6 + 4]], i % 2 ? "#79b855" : "#a6d46a")).join("") +
      iso(206, 168, 36, 28, 28, COL.red) + P([[168, 140 - 6], [206, 168 - 28 - 22], [244, 140 - 6 - 8], [206, 140 - 8 + 2]], "#7b3a34") +
      person(120, 196, "#d8a83a", "#e5c45a") + tree(70, 150, .9) +
      `<g transform="translate(234 196)"><rect x="-8" y="-6" width="16" height="9" rx="2" fill="#e9b13b"/><circle cx="-5" cy="3" r="3.2" fill="#444"/><circle cx="5" cy="3" r="3.2" fill="#444"/></g>`;
  },
  construction() {
    return base("#c9c19a", "#a39a74", "#7d6a58") +
      iso(150, 172, 44, 36, 52, COL.gray) + `<g stroke="#e9eef9" stroke-width="2.2" opacity=".9"><path d="M106 150 L150 172 L150 120"/><path d="M194 150 L150 172"/></g>` +
      `<rect x="196" y="84" width="4" height="78" fill="#f2b230"/><path d="M196 86 L126 86" stroke="#f2b230" stroke-width="4"/><path d="M128 86 L128 108" stroke="#444" stroke-width="1.6"/><rect x="123" y="108" width="10" height="7" fill="#e65f3c"/>` +
      iso(100, 192, 18, 16, 10, COL.yellow) + person(150, 198, "#f08f2e", "#ffd23d") + person(222, 192, "#3f6fd8", "#ffd23d", .85);
  },
  hotel() {
    return base("#76c5d6", "#459fb4", "#7f6a60") +
      iso(150, 172, 40, 40, 78, COL.cream) + winsRight(150, 172, 40, 78, 3, 6, "#a9d4f2") + winsLeft(150, 172, 40, 78, 3, 6, "#8ebfe6") +
      iso(150, 94, 40, 40, 6, COL.red) + `<rect x="138" y="62" width="24" height="9" rx="2" fill="#fff"/><text x="150" y="69" text-anchor="middle" font-size="7" font-weight="800" fill="#c43c3c">HOTEL</text>` +
      iso(214, 170, 26, 22, 18, COL.blue) + person(116, 198, "#2f3a6a", "#2f3a6a") + tree(70, 160, 1) +
      `<g transform="translate(186 196)"><rect x="-8" y="-12" width="16" height="12" rx="2" fill="#a8704a"/><rect x="-1.5" y="-16" width="3" height="5" fill="#666"/></g>`;
  },
  generic() {
    return base() + iso(150, 170, 44, 40, 44, COL.blue) + winsRight(150, 170, 44, 44, 3, 3) + person(122, 198) + tree(222, 164, 1);
  },
};


/* ----------- bangunan per bidang (peta pembelajaran) ----------- */
const cow = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="1" rx="12" ry="3" fill="rgba(0,0,0,.18)"/><rect x="-10" y="-14" width="20" height="11" rx="4" fill="#fff"/><ellipse cx="-3" cy="-10" rx="3.2" ry="2.4" fill="#2c2433"/><ellipse cx="4" cy="-8" rx="2.6" ry="2" fill="#2c2433"/><rect x="-9" y="-4" width="3" height="6" fill="#fff"/><rect x="6" y="-4" width="3" height="6" fill="#fff"/><rect x="-14" y="-17" width="8" height="8" rx="3" fill="#fff"/><ellipse cx="-12.5" cy="-11" rx="3" ry="2" fill="#f2b6b0"/><rect x="-12" y="-20" width="1.6" height="3" fill="#8a7a62"/><rect x="-8" y="-20" width="1.6" height="3" fill="#8a7a62"/><path d="M10 -12 q4 2 3 7" stroke="#999" stroke-width="1.4" fill="none"/></g>`;
const hen = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="1" rx="6" ry="2" fill="rgba(0,0,0,.18)"/><ellipse cx="0" cy="-5" rx="6" ry="5" fill="#fff"/><circle cx="-5" cy="-10" r="3" fill="#fff"/><path d="M-6 -14 q1 -3 3 -1" fill="#d65a55" stroke="#d65a55" stroke-width="1.5"/><path d="M-8 -10 l-3 1 l3 1z" fill="#f2b84b"/><path d="M-1 1v3M2 1v3" stroke="#f2b84b" stroke-width="1.2"/></g>`;
const pig = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="1" rx="10" ry="2.6" fill="rgba(0,0,0,.18)"/><rect x="-9" y="-12" width="18" height="10" rx="5" fill="#f4a9b4"/><circle cx="-9" cy="-9" r="5" fill="#f4a9b4"/><ellipse cx="-13" cy="-8" rx="2.4" ry="1.8" fill="#e98c9b"/><path d="M-8 -14 l2 -3 l2 3z" fill="#e98c9b"/><rect x="-6" y="-3" width="2.4" height="4" fill="#e98c9b"/><rect x="4" y="-3" width="2.4" height="4" fill="#e98c9b"/></g>`;
const roof = (x1, y1, x2, y2, c = "#a8574a") => `<polygon points="${x1},${y1} ${(x1 + x2) / 2},${y1 - 24} ${x2},${y2}" fill="${c}"/>`;
const crate = (x, y, c = "#e0b45a") => `<g transform="translate(${x} ${y})"><rect x="-6" y="-9" width="12" height="9" fill="${c}" stroke="#8a6a2c" stroke-width="1"/><path d="M-6 -4.5h12" stroke="#8a6a2c" stroke-width=".8"/></g>`;
const BLD2 = {
  /* Food Manufacturing */
  fm_plant: () => iso(52, 94, 44, 34, 34, COL.gray) + winsRight(52, 94, 44, 34, 3, 1, "#d9ecff") + iso(92, 80, 14, 14, 40, COL.red) + `<g fill="#fff" opacity=".85"><circle cx="90" cy="30" r="5"/><circle cx="98" cy="22" r="4"/></g>` + `<polygon points="12,100 60,86 70,92 22,106" fill="#444c63"/>` + crate(34, 98, "#f2b84b") + crate(50, 92, "#e8805a"),
  fm_clean: () => iso(58, 94, 44, 34, 38, COL.white) + winsRight(58, 94, 44, 38, 3, 2, "#cfe8ff") + `<rect x="40" y="34" width="36" height="9" rx="2" fill="#2f9a6a"/><path d="M58 36v5M55.5 38.5h5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>` + person(24, 100, "#ffffff", "#ffffff", .75) + `<g fill="#bfe3ff" stroke="#fff"><circle cx="96" cy="66" r="5"/><circle cx="104" cy="56" r="3.5"/><circle cx="90" cy="54" r="3"/></g>`,
  fm_safe: () => iso(56, 94, 44, 34, 32, COL.yellow) + winsRight(56, 94, 44, 32, 3, 1, "#fff6d9") + `<path d="M56 18 l16 6 v12 q0 12 -16 18 q-16 -6 -16 -18 v-12z" fill="#e65f3c" stroke="#fff" stroke-width="2" transform="translate(0 -4)"/><path d="M50 32 l5 5 l9 -10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" transform="translate(0 -4)"/>` + person(96, 100, "#f08f2e", "#ffd23d", .75),
  /* Food Service */
  fs_shop: () => iso(58, 94, 46, 34, 32, COL.wood) + `<polygon points="8,60 58,34 110,56 60,76" fill="#8b3b32" transform="translate(0 -2)"/>` + winsRight(58, 94, 46, 32, 3, 1, "#ffe9b0") + `<g transform="translate(0 6)"><rect x="40" y="62" width="9" height="16" fill="#c43c3c"/><rect x="52" y="66" width="9" height="16" fill="#fff"/><rect x="64" y="70" width="9" height="16" fill="#c43c3c"/></g>`,
  fs_kitchen: () => iso(52, 94, 44, 34, 30, COL.cream) + winsRight(52, 94, 44, 30, 3, 1, "#fff") + `<g transform="translate(94 96)"><rect x="-10" y="-12" width="20" height="12" rx="3" fill="#8892a6"/><rect x="-12" y="-14" width="24" height="3" rx="1.5" fill="#c3cbdb"/><path d="M-5 -18 q-3 -5 0 -9 M2 -18 q-3 -5 0 -9 M8 -18 q-3 -5 0 -9" stroke="#fff" stroke-width="2" fill="none" opacity=".9"/></g>` + person(22, 100, "#ffffff", "#ffffff", .8),
  fs_serve: () => iso(50, 94, 44, 30, 22, COL.brick) + iso(52, 70, 44, 30, 6, COL.cream) + `<g><ellipse cx="38" cy="58" rx="6" ry="3" fill="#fff"/><ellipse cx="38" cy="56.5" rx="6" ry="2.4" fill="#f0685b"/><ellipse cx="58" cy="52" rx="6" ry="3" fill="#fff"/><ellipse cx="58" cy="50.5" rx="6" ry="2.4" fill="#f5a45d"/></g>` + person(92, 100, "#3e4a78", null, .85) + person(22, 100, "#ffffff", "#ffffff", .8),
  /* Construction */
  cn_crane: () => iso(48, 94, 36, 30, 40, COL.gray) + `<rect x="84" y="8" width="4" height="88" fill="#f2b230"/><path d="M88 12 L22 12" stroke="#f2b230" stroke-width="4"/><path d="M26 12 L26 36" stroke="#444" stroke-width="1.6"/><rect x="21" y="36" width="10" height="7" fill="#e65f3c"/>` + person(100, 102, "#f08f2e", "#ffd23d", .65),
  cn_scaf: () => `<g stroke="#8892a6" stroke-width="2.4" fill="none"><path d="M24 96V30M56 96V30M88 96V30M24 30H88M24 52H88M24 74H88M24 96H88"/><path d="M24 96L56 52M56 96L88 52M56 74L88 30" stroke-width="1.6"/></g><rect x="24" y="48" width="32" height="4" fill="#c68e64"/><rect x="56" y="70" width="32" height="4" fill="#c68e64"/>` + person(40, 48, "#3f6fd8", "#ffd23d", .6) + person(72, 70, "#f08f2e", "#ffd23d", .6),
  cn_dig: () => iso(86, 96, 26, 20, 8, COL.wood) + `<g transform="translate(44 94)"><rect x="-18" y="-14" width="30" height="12" rx="3" fill="#f2b230"/><rect x="-8" y="-26" width="16" height="14" rx="2" fill="#f2b230"/><rect x="-5" y="-23" width="10" height="8" fill="#bfe3ff"/><rect x="-22" y="-2" width="38" height="7" rx="3.5" fill="#444"/><path d="M12 -16 L34 -34 L44 -22" stroke="#f2b230" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="M42 -22 l8 4 l-4 8 l-8 -4z" fill="#8892a6"/></g>`,
  cn_mix: () => `<g transform="translate(60 92)"><rect x="-26" y="-12" width="52" height="8" rx="2" fill="#f2b230"/><circle cx="-16" cy="-2" r="6" fill="#444"/><circle cx="16" cy="-2" r="6" fill="#444"/><path d="M-12 -14 L12 -14 L18 -44 L-6 -50 Z" fill="#a2acc0" stroke="#7d869a" stroke-width="2"/><path d="M-8 -26 L16 -30 M-7 -36 L17 -40" stroke="#7d869a" stroke-width="2"/></g>` + person(100, 100, "#3f6fd8", "#ffd23d", .65) + crate(22, 100, "#c3cbdb"),
  cn_house: () => iso(56, 94, 40, 34, 34, COL.cream) + roof(14, 60, 106, 62, "#c4584d") + winsRight(56, 94, 40, 34, 2, 1, "#a9d4f2") + `<rect x="44" y="70" width="10" height="20" fill="#7a5638" transform="skewY(26) translate(0 -26)"/>` + person(98, 102, "#f08f2e", "#ffd23d", .65),
  cn_pole: () => `<rect x="30" y="14" width="5" height="82" fill="#7a5638"/><path d="M16 26H50M20 38H46" stroke="#7a5638" stroke-width="3"/><path d="M16 26 Q60 44 104 26M20 38 Q62 54 104 38" stroke="#444" stroke-width="1.4" fill="none"/><circle cx="16" cy="25" r="2" fill="#fff"/><circle cx="50" cy="25" r="2" fill="#fff"/>` + `<polygon points="60,98 112,98 112,92 66,92" fill="#444c63"/><ellipse cx="86" cy="95" rx="22" ry="6" fill="#8892a6"/><ellipse cx="86" cy="93" rx="22" ry="6" fill="#c3cbdb"/><ellipse cx="86" cy="93" rx="12" ry="3" fill="#444c63"/>` + person(54, 102, "#3f6fd8", "#ffd23d", .6),
  /* Accommodation */
  ac_front: () => iso(58, 94, 46, 34, 30, COL.cream) + winsRight(58, 94, 46, 30, 3, 1, "#a9d4f2") + `<polygon points="10,62 58,40 108,60 60,80" fill="#d65a55" transform="translate(0 4)"/>` + `<g transform="translate(96 98)"><ellipse cx="0" cy="-3" rx="9" ry="5" fill="#f2c14b"/><rect x="-1" y="-12" width="2" height="5" fill="#8a6a2c"/></g>` + person(24, 102, "#2f3a6a", null, .75),
  ac_dine: () => iso(52, 94, 44, 34, 28, COL.wood) + winsRight(52, 94, 44, 28, 3, 1, "#ffe9b0") + `<g transform="translate(94 94)"><ellipse cx="0" cy="0" rx="12" ry="4" fill="#fff"/><path d="M-6 -2 q0 -10 6 -10 q6 0 6 10z" fill="#e8d9b0"/><path d="M-4 -16 q-2 -4 0 -7 M3 -16 q-2 -4 0 -7" stroke="#fff" stroke-width="2" fill="none"/></g>` + person(22, 102, "#ffffff", "#ffffff", .75),
  ac_room: () => iso(56, 94, 46, 36, 36, COL.white) + winsRight(56, 94, 46, 36, 2, 1, "#a9d4f2") + `<g transform="translate(56 78)"><rect x="-18" y="-10" width="30" height="12" rx="3" fill="#3b6fb8"/><rect x="-18" y="-16" width="9" height="7" rx="3" fill="#fff"/></g>` + `<rect x="94" y="64" width="10" height="26" rx="2" fill="#a8704a"/><circle cx="101" cy="78" r="1.4" fill="#f2c14b"/>`,
  ac_safe: () => iso(54, 94, 44, 34, 34, COL.gray) + winsRight(54, 94, 44, 34, 3, 1, "#d9ecff") + `<g transform="translate(96 98)"><rect x="-7" y="-26" width="14" height="26" rx="4" fill="#d65a55"/><rect x="-3" y="-32" width="6" height="7" fill="#444"/><path d="M3 -30 q8 0 10 8" stroke="#444" stroke-width="2" fill="none"/></g>` + `<rect x="30" y="30" width="48" height="9" rx="2" fill="#2f9a6a"/><path d="M42 34h24" stroke="#fff" stroke-width="2.4"/>`,
  /* Peternakan */
  lv_barn: () => iso(52, 94, 46, 34, 32, COL.red) + roof(6, 56, 98, 58, "#7b3a34") + `<rect x="40" y="66" width="14" height="22" fill="#f4e4bd" transform="skewY(26) translate(0 -22)"/>` + cow(96, 100, .85),
  lv_coop: () => iso(50, 94, 40, 30, 24, COL.wood) + roof(8, 66, 90, 66, "#b8433f") + hen(88, 100, 1) + hen(104, 96, .8) + `<g stroke="#a8704a" stroke-width="2" fill="none"><path d="M78 100V86M110 100V86M78 90H112"/></g>`,
  lv_pasture: () => `<polygon points="10,96 60,72 110,96 60,112" fill="#8fd18a"/><g stroke="#a8704a" stroke-width="2.2" fill="none"><path d="M14 94L60 72L106 94M14 86L60 64L106 86"/><path d="M26 98V84M42 90V76M78 90V76M94 98V84"/></g>` + cow(44, 98, .9) + pig(80, 100, .9) + tree(22, 84, .8),
  /* Pertanian */
  ag_field: () => [0, 1, 2, 3].map(i => `<polygon points="${10 + i * 8},${88 + i * 5} ${60 + i * 8},${64 + i * 5} ${110 + i * 8 - 8},${76 + i * 5} ${60 + i * 8 - 8},${100 + i * 5}" fill="${i % 2 ? "#79b855" : "#a6d46a"}" opacity=".95"/>`).join("") + `<g fill="#5e9a3a"><circle cx="44" cy="82" r="3"/><circle cx="60" cy="76" r="3"/><circle cx="76" cy="82" r="3"/></g>` + person(100, 104, "#d8a83a", "#e5c45a", .65),
  ag_green: () => iso(52, 94, 46, 36, 30, COL.white) + `<polygon points="6,56 52,34 98,56 52,70" fill="#bfe3ff" opacity=".8" stroke="#fff"/>` + winsRight(52, 94, 46, 30, 3, 1, "#bfe3ff") + `<g fill="#3a8d5c"><circle cx="38" cy="86" r="4"/><circle cx="52" cy="90" r="4"/><circle cx="68" cy="84" r="4"/></g>` + tree(100, 98, .7),
  ag_tractor: () => `<g transform="translate(58 94)"><rect x="-4" y="-22" width="22" height="22" rx="3" fill="#3a8d5c"/><rect x="-22" y="-14" width="20" height="14" rx="3" fill="#4fa874"/><rect x="2" y="-30" width="14" height="10" rx="2" fill="#bfe3ff"/><circle cx="-14" cy="0" r="8" fill="#333"/><circle cx="-14" cy="0" r="3.5" fill="#aaa"/><circle cx="14" cy="2" r="11" fill="#333"/><circle cx="14" cy="2" r="4.5" fill="#aaa"/></g>`,
  ag_silo: () => `<g transform="translate(40 94)"><rect x="-12" y="-54" width="24" height="54" fill="#c3cbdb"/><ellipse cx="0" cy="-54" rx="12" ry="5" fill="#dfe6f2"/><path d="M-12 -40h24M-12 -26h24M-12 -12h24" stroke="#a2acc0" stroke-width="1.6"/></g>` + iso(88, 96, 30, 24, 24, COL.red) + roof(60, 66, 118, 68, "#7b3a34") + tree(104, 98, .7),
  ag_orch: () => tree(30, 96, 1.4) + tree(62, 90, 1.5) + tree(94, 96, 1.4) + `<g fill="#e8584a"><circle cx="28" cy="72" r="2.6"/><circle cx="36" cy="78" r="2.6"/><circle cx="60" cy="64" r="2.6"/><circle cx="70" cy="70" r="2.6"/><circle cx="92" cy="74" r="2.6"/></g>` + person(46, 104, "#d8a83a", "#e5c45a", .6),
  /* Kaigo */
  kg_home: () => iso(54, 94, 46, 32, 30, COL.cream) + roof(8, 62, 100, 62, "#c4584d") + winsRight(54, 94, 46, 30, 3, 1, "#cfe8ff") + `<rect x="46" y="30" width="14" height="14" rx="2" fill="#fff"/><path d="M53 33v8M49 37h8" stroke="#d64f4f" stroke-width="2.6" stroke-linecap="round"/>` + tree(104, 98, .75),
  kg_bed: () => iso(54, 94, 46, 32, 26, COL.white) + winsRight(54, 94, 46, 26, 3, 1, "#cfe8ff") + `<g transform="translate(50 74)"><rect x="-18" y="-6" width="32" height="10" rx="3" fill="#9fd0f5"/><rect x="-18" y="-12" width="9" height="7" rx="3" fill="#fff"/></g>` + person(96, 102, "#f08cab", null, .7),
  kg_chair: () => iso(52, 94, 40, 30, 28, COL.cream) + winsRight(52, 94, 40, 28, 2, 1, "#cfe8ff") + `<g transform="translate(92 98)"><circle cx="0" cy="-6" r="9" fill="none" stroke="#555" stroke-width="2.4"/><circle cx="14" cy="-1" r="3.4" fill="none" stroke="#555" stroke-width="2"/><rect x="-6" y="-24" width="10" height="14" rx="3" fill="#6fb3e8"/><circle cx="-1" cy="-29" r="4.4" fill="#f3cfa6"/></g>`,
  kg_heart: () => iso(54, 94, 44, 32, 28, COL.white) + winsRight(54, 94, 44, 28, 3, 1, "#cfe8ff") + `<path d="M54 40 q-14 -12 -22 0 q0 10 22 22 q22 -12 22 -22 q-8 -12 -22 0z" fill="#ef6a9a" transform="translate(0 -6)"/>` + person(98, 102, "#6fb3e8", null, .7) + person(18, 102, "#f08cab", null, .7),
};
const BLD_SETS = {
  "food-manufacturing": ["fm_plant", "fm_clean", "fm_safe"],
  "food-service": ["fs_shop", "fs_kitchen", "fs_serve"],
  "food-service-jp": ["fs_shop", "fs_kitchen", "fs_serve"],
  "construction": ["cn_crane", "cn_scaf", "cn_dig", "cn_mix", "cn_house", "cn_crane", "cn_scaf"],
  "construction-bangunan": ["cn_house", "cn_scaf", "cn_crane", "cn_mix", "cn_dig", "cn_house", "cn_scaf"],
  "construction-lifeline": ["cn_pole", "cn_dig", "cn_scaf", "cn_mix", "cn_pole", "cn_crane", "cn_dig"],
  "accommodation": ["ac_front", "hotel", "ac_dine", "ac_room", "ac_safe"],
  "livestock": ["lv_barn", "lv_coop", "lv_pasture"],
  "agriculture": ["ag_field", "ag_green", "ag_tractor", "ag_silo", "ag_orch", "ag_field", "ag_green"],
  "kaigo": ["kg_home", "kg_bed", "kg_chair", "kg_heart"],
  "kaigo-jp": ["kg_home", "kg_chair", "kg_heart"],
};
/** Jenis bangunan peta untuk bab ke-i pada bidang tertentu (BC / tidak dikenal = set bawaan). */
export function bldFor(slug, i) {
  const set = BLD_SETS[slug];
  return set ? set[i % set.length] : (["training", "hotel", "maint", "exam"][i] || "training");
}

/** SVG pulau melayang lengkap (viewBox 300x250). */
export function islandSVG(theme, { dim = false } = {}) {
  const fn = THEMES[theme] || THEMES.generic;
  return `<svg class="sw-isl-svg ${dim ? "dim" : ""}" viewBox="0 0 300 250" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${fn()}</svg>`;
}

/* ----------------------- bangunan khusus tiap bab ----------------------- */
/** Bangunan kecil (viewBox 120x110) untuk peta pembelajaran. */
export function buildingSVG(kind) {
  const b = {
    training: () => iso(60, 92, 40, 34, 34, COL.white) + winsRight(60, 92, 40, 34, 3, 2) + winsLeft(60, 92, 34, 34, 2, 2) + `<rect x="46" y="30" width="30" height="9" rx="2" fill="#2f6fd0"/><text x="61" y="37" text-anchor="middle" font-size="6.5" font-weight="800" fill="#fff">CLEANING</text>` + person(28, 98, "#3f6fd8", "#ffd34d", .7),
    hotel: () => iso(56, 96, 34, 30, 58, COL.cream) + winsRight(56, 96, 34, 58, 3, 5, "#a9d4f2") + winsLeft(56, 96, 30, 58, 2, 5, "#8ebfe6") + `<rect x="44" y="14" width="24" height="8" rx="2" fill="#d65a55"/>` + iso(96, 98, 18, 16, 20, COL.gray) + person(80, 100, "#2f9a6a", null, .7),
    maint: () => iso(52, 94, 44, 34, 30, COL.gray) + winsRight(52, 94, 44, 30, 3, 1, "#d9ecff") + `<g transform="translate(86 100)"><ellipse cx="0" cy="0" rx="12" ry="5" fill="#d65a55"/><ellipse cx="0" cy="-2.4" rx="10" ry="4" fill="#ef7f78"/><path d="M0 -4 L7 -30" stroke="#666" stroke-width="2.4" stroke-linecap="round"/></g>` + `<g transform="translate(24 98)"><rect x="-9" y="-16" width="14" height="18" rx="1.5" fill="#bfe3ff" stroke="#fff" stroke-width="1.6"/></g>`,
    exam: () => iso(60, 92, 44, 38, 38, COL.yellow) + `<polygon points="14,46 60,18 106,46" fill="#a8574a" transform="translate(0 6)"/>` + winsRight(60, 92, 44, 38, 3, 2, "#fff6d9") + `<rect x="48" y="62" width="14" height="22" rx="2" fill="#7a5638" transform="skewY(26) translate(0 -24)"/><text x="60" y="30" text-anchor="middle" font-size="9" font-weight="800" fill="#fff">試験</text>`,
  };
  return `<svg class="sw-bld-svg" viewBox="0 0 120 110" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><ellipse cx="60" cy="100" rx="44" ry="7" fill="rgba(0,0,0,.18)"/>${(b[kind] || BLD2[kind] || b.training)()}</svg>`;
}
