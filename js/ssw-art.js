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
  return `<svg class="sw-bld-svg" viewBox="0 0 120 110" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><ellipse cx="60" cy="100" rx="44" ry="7" fill="rgba(0,0,0,.18)"/>${(b[kind] || b.training)()}</svg>`;
}
