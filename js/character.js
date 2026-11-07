/* ========================================================================
   SHIROSE NIHONGO — LAYERED CHARACTER SYSTEM
   Default: BOTAK (bald). Rambut HARUS dibeli & di-equip dari Wardrobe.
   Sistem layer: setiap bagian = <g data-slot="..."> di dalam SVG.
   Ganti item = replace innerHTML <g> saja (bukan redraw full).
   ======================================================================== */

export const SKIN_TONES = {
  light:  { skin:"#f5d4b3", shade:"#e2b893", darker:"#c89671" },
  medium: { skin:"#e0b183", shade:"#c89467", darker:"#a67848" },
  tan:    { skin:"#b98858", shade:"#9a6d42", darker:"#7d5531" },
};

/* ====== Base body (always drawn) — kepala BOTAK, mata, mulut, telinga, leher ====== */
export function baseBody(skinKey = "light") {
  const s = SKIN_TONES[skinKey] || SKIN_TONES.light;
  return `
    <!-- Shadow -->
    <ellipse cx="200" cy="470" rx="90" ry="12" fill="#000" opacity=".15"/>

    <!-- Legs -->
    <g data-slot="legs">
      <rect x="170" y="340" width="26" height="110" rx="10" fill="#2a3758"/>
      <rect x="204" y="340" width="26" height="110" rx="10" fill="#2a3758"/>
    </g>

    <!-- Shoes default -->
    <g data-slot="shoes">
      <ellipse cx="183" cy="460" rx="20" ry="9" fill="#1a1f33"/>
      <ellipse cx="217" cy="460" rx="20" ry="9" fill="#1a1f33"/>
    </g>

    <!-- Torso + arms (uniform default) -->
    <g data-slot="pakaian">
      <path d="M135 200 Q200 180 265 200 L270 345 L130 345 Z" fill="#ffffff" stroke="#c7cde0" stroke-width="2"/>
      <!-- Dasi biru default sekolah -->
      <path d="M195 200 L205 200 L208 250 L200 260 L192 250 Z" fill="#2a3758"/>
      <!-- Arms -->
      <path d="M135 205 Q110 240 115 300 L135 330 L145 325 L140 295 Q145 240 155 215 Z" fill="#ffffff" stroke="#c7cde0" stroke-width="2"/>
      <path d="M265 205 Q290 240 285 300 L265 330 L255 325 L260 295 Q255 240 245 215 Z" fill="#ffffff" stroke="#c7cde0" stroke-width="2"/>
      <!-- Hands -->
      <circle cx="123" cy="325" r="11" fill="${s.skin}"/>
      <circle cx="277" cy="325" r="11" fill="${s.skin}"/>
    </g>

    <!-- Neck -->
    <rect x="186" y="170" width="28" height="30" fill="${s.skin}"/>
    <path d="M186 185 Q200 192 214 185" fill="${s.shade}"/>

    <!-- HEAD (botak permanent) -->
    <ellipse cx="200" cy="130" rx="55" ry="63" fill="${s.skin}"/>
    <path d="M152 140 Q145 155 150 170 Q160 175 165 165" fill="${s.shade}" opacity=".5"/>
    <path d="M248 140 Q255 155 250 170 Q240 175 235 165" fill="${s.shade}" opacity=".5"/>

    <!-- Ears -->
    <ellipse cx="148" cy="135" rx="7" ry="11" fill="${s.skin}"/>
    <ellipse cx="252" cy="135" rx="7" ry="11" fill="${s.skin}"/>

    <!-- Eyes -->
    <g data-slot="mata">
      <ellipse cx="178" cy="130" rx="6" ry="8" fill="#ffffff"/>
      <ellipse cx="222" cy="130" rx="6" ry="8" fill="#ffffff"/>
      <circle cx="178" cy="132" r="4" fill="#2a3758"/>
      <circle cx="222" cy="132" r="4" fill="#2a3758"/>
      <circle cx="179" cy="130" r="1.5" fill="#ffffff"/>
      <circle cx="223" cy="130" r="1.5" fill="#ffffff"/>
      <!-- Eyebrows -->
      <path d="M170 118 Q178 115 186 118" stroke="#3a2518" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M214 118 Q222 115 230 118" stroke="#3a2518" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </g>

    <!-- Mouth -->
    <g data-slot="mulut">
      <path d="M190 158 Q200 164 210 158" stroke="#8b4a3a" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g>
  `;
}

/* ====== Hair catalog — kondisi awal: TIDAK ADA RAMBUT ====== */
export const HAIR_STYLES = {
  short: {
    nama: "Rambut Pendek",
    harga: 100,
    svg: (c="#2a1810") => `
      <path d="M150 90 Q155 72 180 68 Q200 65 220 68 Q245 72 250 90 Q252 105 250 115
               Q245 95 220 92 L220 100 Q200 90 180 100 L180 92 Q155 95 150 115 Z" fill="${c}"/>
    `,
  },
  medium: {
    nama: "Rambut Sedang",
    harga: 150,
    svg: (c="#3a2518") => `
      <path d="M145 85 Q150 65 180 62 Q200 58 220 62 Q250 65 255 85
               Q258 110 252 140 L245 135 Q245 110 240 100
               L240 110 Q200 90 160 110 L160 100
               Q155 110 155 135 L148 140 Q142 110 145 85 Z" fill="${c}"/>
    `,
  },
  long: {
    nama: "Rambut Panjang",
    harga: 200,
    svg: (c="#1a1008") => `
      <path d="M140 85 Q145 60 180 58 Q200 55 220 58 Q255 60 260 85
               Q265 130 258 180 L245 175 Q250 130 245 100
               L245 110 Q200 85 155 110 L155 100
               Q150 130 155 175 L142 180 Q135 130 140 85 Z" fill="${c}"/>
    `,
  },
  spiky: {
    nama: "Rambut Jabrik",
    harga: 300,
    svg: (c="#2a1810") => `
      <path d="M150 95 L155 70 L168 85 L175 60 L185 80 L195 55
               L205 80 L215 55 L225 80 L232 60 L245 85 L250 70 L253 95
               Q253 108 248 115 Q245 95 220 92 L220 100 Q200 90 180 100 L180 92 Q155 95 150 115 Z"
               fill="${c}"/>
    `,
  },
  messy: {
    nama: "Rambut Acak",
    harga: 250,
    svg: (c="#4a3020") => `
      <path d="M148 90 Q145 70 165 65 Q170 55 185 62 Q195 50 210 58 Q225 50 235 65
               Q255 70 252 92 Q255 108 250 125 L245 105 L240 115 L235 100
               L228 118 L222 102 L216 120 L208 103 L200 122 L192 103 L184 120
               L178 102 L172 118 L165 100 L160 115 L155 105 Q148 108 148 90 Z" fill="${c}"/>
    `,
  },
  anime_boy: {
    nama: "Anime Boy",
    harga: 400,
    svg: (c="#2a4870") => `
      <path d="M145 95 Q145 70 170 60 Q180 48 200 55 Q220 48 230 60 Q255 70 255 95
               Q258 115 252 125 L240 105 L230 120 L222 98 L210 115 L200 88
               L190 115 L178 98 L170 120 L160 105 L148 125 Q142 115 145 95 Z" fill="${c}"/>
      <path d="M170 95 L165 115 L175 110 Z" fill="${c}" opacity=".7"/>
      <path d="M225 95 L230 115 L220 110 Z" fill="${c}" opacity=".7"/>
    `,
  },
  formal: {
    nama: "Rambut Formal",
    harga: 500,
    svg: (c="#1a1008") => `
      <path d="M150 92 Q152 72 180 65 Q200 60 220 65 Q248 72 250 92
               Q250 105 248 115 L245 100 Q240 92 225 90
               L225 95 Q210 86 195 88 L195 95 Q180 86 170 88 L170 92 Q157 92 150 115
               Q148 105 150 92 Z" fill="${c}"/>
      <!-- Side parting detail -->
      <path d="M180 75 Q195 85 210 78" stroke="${c}" stroke-width="3" fill="none" opacity=".6"/>
    `,
  },
};

/* ====== Clothing catalog — default seragam (sudah ada di baseBody) ======
   Item shop pakaian = replace slot 'pakaian' + 'legs' */
export const OUTFITS = {
  seragam_default: {
    nama: "Seragam Sekolah",
    harga: 0,
    equipped_default: true,
    svg: null,  // null = pakai default dari baseBody
  },
  kemeja_navy: {
    nama: "Kemeja Navy",
    harga: 150,
    svg: () => `
      <path d="M135 200 Q200 180 265 200 L270 345 L130 345 Z" fill="#2a3758" stroke="#1a2040" stroke-width="2"/>
      <path d="M195 200 L205 200 L208 250 L200 260 L192 250 Z" fill="#ef6a9a"/>
      <path d="M135 205 Q110 240 115 300 L135 330 L145 325 L140 295 Q145 240 155 215 Z" fill="#2a3758" stroke="#1a2040" stroke-width="2"/>
      <path d="M265 205 Q290 240 285 300 L265 330 L255 325 L260 295 Q255 240 245 215 Z" fill="#2a3758" stroke="#1a2040" stroke-width="2"/>
      <circle cx="123" cy="325" r="11" fill="#f5d4b3"/>
      <circle cx="277" cy="325" r="11" fill="#f5d4b3"/>
    `,
  },
  jaket_hitam: {
    nama: "Jaket Hitam",
    harga: 300,
    svg: () => `
      <path d="M135 200 Q200 180 265 200 L270 345 L130 345 Z" fill="#1a1a1a" stroke="#000" stroke-width="2"/>
      <!-- Jacket zipper -->
      <line x1="200" y1="200" x2="200" y2="345" stroke="#333" stroke-width="1.5"/>
      <circle cx="200" cy="220" r="2" fill="#666"/>
      <path d="M135 205 Q110 240 115 300 L135 330 L145 325 L140 295 Q145 240 155 215 Z" fill="#1a1a1a" stroke="#000" stroke-width="2"/>
      <path d="M265 205 Q290 240 285 300 L265 330 L255 325 L260 295 Q255 240 245 215 Z" fill="#1a1a1a" stroke="#000" stroke-width="2"/>
      <circle cx="123" cy="325" r="11" fill="#f5d4b3"/>
      <circle cx="277" cy="325" r="11" fill="#f5d4b3"/>
    `,
  },
  hoodie_pink: {
    nama: "Hoodie Pink Sakura",
    harga: 400,
    svg: () => `
      <path d="M135 200 Q200 180 265 200 L270 345 L130 345 Z" fill="#ef6a9a" stroke="#c8325a" stroke-width="2"/>
      <!-- Hood -->
      <path d="M160 200 Q200 150 240 200 Q230 190 200 190 Q170 190 160 200 Z" fill="#c8325a"/>
      <!-- Pocket -->
      <path d="M160 270 L240 270 L235 300 L165 300 Z" fill="#c8325a" opacity=".5"/>
      <path d="M135 205 Q110 240 115 300 L135 330 L145 325 L140 295 Q145 240 155 215 Z" fill="#ef6a9a" stroke="#c8325a" stroke-width="2"/>
      <path d="M265 205 Q290 240 285 300 L265 330 L255 325 L260 295 Q255 240 245 215 Z" fill="#ef6a9a" stroke="#c8325a" stroke-width="2"/>
      <circle cx="123" cy="325" r="11" fill="#f5d4b3"/>
      <circle cx="277" cy="325" r="11" fill="#f5d4b3"/>
    `,
  },
  kimono: {
    nama: "Kimono",
    harga: 800,
    svg: () => `
      <path d="M135 200 Q200 180 265 200 L270 345 L130 345 Z" fill="#8c1f2e" stroke="#5a0f1a" stroke-width="2"/>
      <!-- Pattern -->
      <path d="M150 220 Q160 215 170 225" stroke="#f5d4b3" stroke-width="2" fill="none"/>
      <path d="M220 240 Q230 235 240 245" stroke="#f5d4b3" stroke-width="2" fill="none"/>
      <path d="M170 280 Q180 275 190 285" stroke="#f5d4b3" stroke-width="2" fill="none"/>
      <!-- Obi -->
      <rect x="130" y="280" width="140" height="25" fill="#ffd700" stroke="#a88900" stroke-width="1.5"/>
      <path d="M135 205 Q110 240 115 300 L135 330 L145 325 L140 295 Q145 240 155 215 Z" fill="#8c1f2e" stroke="#5a0f1a" stroke-width="2"/>
      <path d="M265 205 Q290 240 285 300 L265 330 L255 325 L260 295 Q255 240 245 215 Z" fill="#8c1f2e" stroke="#5a0f1a" stroke-width="2"/>
      <circle cx="123" cy="325" r="11" fill="#f5d4b3"/>
      <circle cx="277" cy="325" r="11" fill="#f5d4b3"/>
    `,
  },
};

/* ====== Shoes catalog ====== */
export const SHOES = {
  shoes_default: {
    nama: "Sepatu Sekolah",
    harga: 0,
    equipped_default: true,
    svg: null,
  },
  sneakers_putih: {
    nama: "Sneakers Putih",
    harga: 150,
    svg: () => `
      <path d="M163 450 L203 450 L205 465 L161 465 Z" fill="#ffffff" stroke="#999" stroke-width="1.5"/>
      <path d="M197 450 L237 450 L239 465 L195 465 Z" fill="#ffffff" stroke="#999" stroke-width="1.5"/>
      <line x1="170" y1="458" x2="195" y2="458" stroke="#d0d0d0" stroke-width="1"/>
      <line x1="204" y1="458" x2="229" y2="458" stroke="#d0d0d0" stroke-width="1"/>
    `,
  },
  sneakers_merah: {
    nama: "Sneakers Merah",
    harga: 200,
    svg: () => `
      <path d="M163 450 L203 450 L205 465 L161 465 Z" fill="#ef4444" stroke="#7a1a1a" stroke-width="1.5"/>
      <path d="M197 450 L237 450 L239 465 L195 465 Z" fill="#ef4444" stroke="#7a1a1a" stroke-width="1.5"/>
      <path d="M170 452 L190 452" stroke="#ffffff" stroke-width="2"/>
      <path d="M204 452 L224 452" stroke="#ffffff" stroke-width="2"/>
    `,
  },
  boots: {
    nama: "Boots Hitam",
    harga: 350,
    svg: () => `
      <rect x="160" y="440" width="48" height="25" rx="4" fill="#1a1a1a" stroke="#000" stroke-width="1.5"/>
      <rect x="192" y="440" width="48" height="25" rx="4" fill="#1a1a1a" stroke="#000" stroke-width="1.5"/>
      <rect x="160" y="460" width="48" height="6" fill="#333"/>
      <rect x="192" y="460" width="48" height="6" fill="#333"/>
    `,
  },
  geta: {
    nama: "Geta (下駄)",
    harga: 500,
    svg: () => `
      <rect x="163" y="454" width="42" height="10" fill="#8b4a3a" stroke="#5a2f22" stroke-width="1"/>
      <rect x="197" y="454" width="42" height="10" fill="#8b4a3a" stroke="#5a2f22" stroke-width="1"/>
      <rect x="170" y="464" width="6" height="4" fill="#3a2518"/>
      <rect x="192" y="464" width="6" height="4" fill="#3a2518"/>
      <rect x="204" y="464" width="6" height="4" fill="#3a2518"/>
      <rect x="226" y="464" width="6" height="4" fill="#3a2518"/>
    `,
  },
};

/* ====== Accessories (hat/glasses/etc) ====== */
export const ACCESSORIES = {
  none: { nama: "Tidak ada", harga: 0, equipped_default: true, svg: null },
  kacamata: {
    nama: "Kacamata",
    harga: 120,
    svg: () => `
      <circle cx="178" cy="132" r="10" fill="none" stroke="#1a1a1a" stroke-width="2"/>
      <circle cx="222" cy="132" r="10" fill="none" stroke="#1a1a1a" stroke-width="2"/>
      <line x1="188" y1="132" x2="212" y2="132" stroke="#1a1a1a" stroke-width="2"/>
      <line x1="168" y1="132" x2="155" y2="130" stroke="#1a1a1a" stroke-width="2"/>
      <line x1="232" y1="132" x2="245" y2="130" stroke="#1a1a1a" stroke-width="2"/>
    `,
  },
  kacamata_pink: {
    nama: "Kacamata Pink",
    harga: 180,
    svg: () => `
      <circle cx="178" cy="132" r="10" fill="none" stroke="#ef6a9a" stroke-width="2.5"/>
      <circle cx="222" cy="132" r="10" fill="none" stroke="#ef6a9a" stroke-width="2.5"/>
      <line x1="188" y1="132" x2="212" y2="132" stroke="#ef6a9a" stroke-width="2"/>
    `,
  },
  topi_merah: {
    nama: "Topi Merah",
    harga: 200,
    svg: () => `
      <ellipse cx="200" cy="90" rx="58" ry="12" fill="#ef4444"/>
      <path d="M160 88 Q200 55 240 88 L235 90 Q200 60 165 90 Z" fill="#c8325a"/>
      <ellipse cx="200" cy="80" rx="42" ry="20" fill="#ef4444"/>
      <!-- star emblem -->
      <path d="M200 70 L203 78 L212 78 L205 83 L208 92 L200 87 L192 92 L195 83 L188 78 L197 78 Z" fill="#ffd700"/>
    `,
  },
  headband_pink: {
    nama: "Headband Pink",
    harga: 160,
    svg: () => `
      <path d="M152 92 Q200 78 248 92 L245 100 Q200 88 155 100 Z" fill="#ef6a9a" stroke="#c8325a" stroke-width="1.5"/>
      <!-- Rose detail -->
      <circle cx="235" cy="94" r="5" fill="#c8325a"/>
      <circle cx="235" cy="94" r="2" fill="#ffd0e0"/>
    `,
  },
  mahkota: {
    nama: "Mahkota Emas",
    harga: 1500,
    svg: () => `
      <path d="M160 85 L170 68 L180 85 L190 60 L200 85 L210 60 L220 85 L230 68 L240 85 L240 95 L160 95 Z"
            fill="#ffd700" stroke="#a88900" stroke-width="1.5"/>
      <circle cx="170" cy="78" r="3" fill="#ef4444"/>
      <circle cx="200" cy="72" r="3" fill="#2a5aef"/>
      <circle cx="230" cy="78" r="3" fill="#10b981"/>
    `,
  },
};

/* ====== Hand-held items ====== */
export const HANDHELD = {
  none: { nama: "Tangan kosong", harga: 0, equipped_default: true, svg: null },
  tas_sekolah: {
    nama: "Tas Sekolah",
    harga: 100,
    svg: () => `
      <rect x="265" y="315" width="35" height="40" rx="4" fill="#5a2f22" stroke="#3a1f16" stroke-width="1.5"/>
      <path d="M270 315 Q280 305 290 315" stroke="#3a1f16" stroke-width="2" fill="none"/>
      <rect x="275" y="335" width="15" height="4" fill="#3a1f16"/>
    `,
  },
  buku_emas: {
    nama: "Buku Emas 極意の書",
    harga: 1200,
    rarity: "mythic",
    unlock_lv: 8,
    svg: () => `
      <defs>
        <radialGradient id="aura-gold">
          <stop offset="0%" stop-color="#ffd700" stop-opacity=".8"/>
          <stop offset="100%" stop-color="#ffd700" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="283" cy="335" r="30" fill="url(#aura-gold)"/>
      <rect x="265" y="320" width="35" height="35" rx="2" fill="#ffd700" stroke="#a88900" stroke-width="1.5"/>
      <rect x="265" y="320" width="35" height="8" fill="#a88900"/>
      <text x="282" y="345" text-anchor="middle" font-size="12" fill="#5a2f22" font-weight="bold">極</text>
    `,
  },
  pedang_bambu: {
    nama: "Shinai 竹刀",
    harga: 700,
    svg: () => `
      <rect x="276" y="260" width="4" height="85" fill="#d4a068" stroke="#8b6534" stroke-width=".5"/>
      <rect x="273" y="340" width="10" height="12" fill="#1a1a1a" rx="2"/>
      <circle cx="278" cy="258" r="3" fill="#ef6a9a"/>
    `,
  },
};

/* ====== Aura (effect at high level) ====== */
export const AURAS = {
  none: { nama: "Tidak ada", harga: 0, equipped_default: true, svg: null },
  aura_pink: {
    nama: "Aura Pink",
    harga: 1000,
    unlock_lv: 15,
    svg: () => `
      <defs>
        <radialGradient id="aura-pink-grad">
          <stop offset="0%" stop-color="#ef6a9a" stop-opacity=".3"/>
          <stop offset="70%" stop-color="#ef6a9a" stop-opacity=".1"/>
          <stop offset="100%" stop-color="#ef6a9a" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="200" cy="260" r="130" fill="url(#aura-pink-grad)">
        <animate attributeName="r" from="120" to="140" dur="2s" repeatCount="indefinite" values="120;140;120"/>
      </circle>
    `,
  },
  aura_emas: {
    nama: "Aura Emas",
    harga: 2500,
    unlock_lv: 30,
    svg: () => `
      <defs>
        <radialGradient id="aura-emas-grad">
          <stop offset="0%" stop-color="#ffd700" stop-opacity=".35"/>
          <stop offset="70%" stop-color="#ffd700" stop-opacity=".1"/>
          <stop offset="100%" stop-color="#ffd700" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="200" cy="260" r="140" fill="url(#aura-emas-grad)">
        <animate attributeName="r" from="130" to="150" dur="2.5s" repeatCount="indefinite" values="130;150;130"/>
      </circle>
      <!-- Sparkles -->
      <g opacity=".8">
        <circle cx="130" cy="150" r="3" fill="#ffd700"><animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/></circle>
        <circle cx="280" cy="200" r="2" fill="#ffd700"><animate attributeName="opacity" values="0;1;0" dur="1.5s" begin=".5s" repeatCount="indefinite"/></circle>
        <circle cx="140" cy="350" r="2" fill="#ffd700"><animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="1s" repeatCount="indefinite"/></circle>
        <circle cx="290" cy="380" r="3" fill="#ffd700"><animate attributeName="opacity" values="0;1;0" dur="2.2s" begin=".2s" repeatCount="indefinite"/></circle>
      </g>
    `,
  },
};

/* ====== ITEM CATALOGS (indexed) ====== */
export const CATALOG = {
  rambut: HAIR_STYLES,
  pakaian: OUTFITS,
  sepatu: SHOES,
  aksesori: ACCESSORIES,
  item_tangan: HANDHELD,
  aura: AURAS,
};

export const CATALOG_LABELS = {
  rambut: "Rambut",
  pakaian: "Pakaian",
  sepatu: "Sepatu",
  aksesori: "Aksesori",
  item_tangan: "Item Tangan",
  aura: "Aura",
};

/* ====== Default equipped state (bald, uniform, standard shoes) ====== */
export const DEFAULT_EQUIPPED = {
  rambut: null,              // BOTAK — default harus kosong
  pakaian: "seragam_default",
  sepatu: "shoes_default",
  aksesori: "none",
  item_tangan: "none",
  aura: "none",
};

/* ====== Render the full character given equipped state ====== */
export function renderCharacter(equipped = {}, skinKey = "light", opts = {}) {
  const eq = { ...DEFAULT_EQUIPPED, ...equipped };

  const auraSvg = (eq.aura && eq.aura !== "none" && AURAS[eq.aura]?.svg) ? AURAS[eq.aura].svg() : "";

  const base = baseBody(skinKey);

  // Overlay pakaian (replace default)
  let pakaianOverlay = "";
  if (eq.pakaian && eq.pakaian !== "seragam_default" && OUTFITS[eq.pakaian]?.svg) {
    pakaianOverlay = `<g data-slot="pakaian-overlay">${OUTFITS[eq.pakaian].svg()}</g>`;
  }

  // Overlay sepatu
  let sepatuOverlay = "";
  if (eq.sepatu && eq.sepatu !== "shoes_default" && SHOES[eq.sepatu]?.svg) {
    sepatuOverlay = `<g data-slot="sepatu-overlay">${SHOES[eq.sepatu].svg()}</g>`;
  }

  // Hair (OPTIONAL — default botak)
  let hairSvg = "";
  if (eq.rambut && HAIR_STYLES[eq.rambut]?.svg) {
    hairSvg = `<g data-slot="rambut">${HAIR_STYLES[eq.rambut].svg(opts.hairColor)}</g>`;
  }

  // Accessories
  let aksesoriSvg = "";
  if (eq.aksesori && eq.aksesori !== "none" && ACCESSORIES[eq.aksesori]?.svg) {
    aksesoriSvg = `<g data-slot="aksesori">${ACCESSORIES[eq.aksesori].svg()}</g>`;
  }

  // Handheld
  let handheldSvg = "";
  if (eq.item_tangan && eq.item_tangan !== "none" && HANDHELD[eq.item_tangan]?.svg) {
    handheldSvg = `<g data-slot="item_tangan">${HANDHELD[eq.item_tangan].svg()}</g>`;
  }

  return `
    <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" class="chara-svg">
      ${auraSvg}
      ${base}
      ${pakaianOverlay}
      ${sepatuOverlay}
      ${hairSvg}
      ${aksesoriSvg}
      ${handheldSvg}
    </svg>
  `;
}

/* ====== Build item card HTML (for shop & inventory) ====== */
export function itemCardSvg(kategori, itemId) {
  const cat = CATALOG[kategori];
  const item = cat?.[itemId];
  if (!item) return "";
  // Render with ONLY this item visible (base + item)
  const eq = { ...DEFAULT_EQUIPPED };
  eq[kategori] = itemId;
  return renderCharacter(eq);
}
