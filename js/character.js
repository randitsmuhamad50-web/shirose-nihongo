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
    harga: 500, rarity:"common", unlock_lv:1,
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
    harga: 2500, rarity:"uncommon", unlock_lv:10,
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
    harga: 10000, rarity:"rare", unlock_lv:25,
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
  n1_suit_legendary: {
    nama: "✨ Executive Suit Legendary (Gold)",
    jlpt:"n1", harga: 50000, rarity:"legendary", unlock_lv:75,
    svg: () => `
      <defs>
        <radialGradient id="outfit-legend"><stop offset="0%" stop-color="#ffd700" stop-opacity=".4"/><stop offset="100%" stop-color="#ffd700" stop-opacity="0"/></radialGradient>
      </defs>
      <circle cx="200" cy="275" r="90" fill="url(#outfit-legend)"/>
      <path d="M135 200 Q200 180 265 200 L270 345 L130 345 Z" fill="#1a1a1a" stroke="#ffd700" stroke-width="2.5"/>
      <!-- Lapels -->
      <path d="M160 200 L200 220 L240 200 L245 250 L200 240 L155 250 Z" fill="#000" stroke="#ffd700" stroke-width="1.5"/>
      <!-- Shirt + tie -->
      <path d="M190 215 L210 215 L208 270 L200 275 L192 270 Z" fill="#fff"/>
      <path d="M194 215 L206 215 L210 245 L200 265 L190 245 Z" fill="#ffd700" stroke="#b8860b" stroke-width="1"/>
      <!-- Gold buttons -->
      <circle cx="200" cy="285" r="2.5" fill="#ffd700" stroke="#b8860b"/>
      <circle cx="200" cy="310" r="2.5" fill="#ffd700" stroke="#b8860b"/>
      <circle cx="200" cy="335" r="2.5" fill="#ffd700" stroke="#b8860b"/>
      <path d="M135 205 Q110 240 115 300 L135 330 L145 325 L140 295 Q145 240 155 215 Z" fill="#1a1a1a" stroke="#ffd700" stroke-width="2"/>
      <path d="M265 205 Q290 240 285 300 L265 330 L255 325 L260 295 Q255 240 245 215 Z" fill="#1a1a1a" stroke="#ffd700" stroke-width="2"/>
      <circle cx="123" cy="325" r="11" fill="#f5d4b3"/>
      <circle cx="277" cy="325" r="11" fill="#f5d4b3"/>
    `,
  },
  kimono: {
    nama: "Kimono Tradisional",
    harga: 25000, rarity:"epic", unlock_lv:50,
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
    harga: 800, rarity:"common", unlock_lv:1,
    svg: () => `
      <path d="M163 450 L203 450 L205 465 L161 465 Z" fill="#ef4444" stroke="#7a1a1a" stroke-width="1.5"/>
      <path d="M197 450 L237 450 L239 465 L195 465 Z" fill="#ef4444" stroke="#7a1a1a" stroke-width="1.5"/>
      <path d="M170 452 L190 452" stroke="#ffffff" stroke-width="2"/>
      <path d="M204 452 L224 452" stroke="#ffffff" stroke-width="2"/>
    `,
  },
  boots: {
    nama: "Boots Hitam",
    harga: 4000, rarity:"uncommon", unlock_lv:10,
    svg: () => `
      <rect x="160" y="440" width="48" height="25" rx="4" fill="#1a1a1a" stroke="#000" stroke-width="1.5"/>
      <rect x="192" y="440" width="48" height="25" rx="4" fill="#1a1a1a" stroke="#000" stroke-width="1.5"/>
      <rect x="160" y="460" width="48" height="6" fill="#333"/>
      <rect x="192" y="460" width="48" height="6" fill="#333"/>
    `,
  },
  geta: {
    nama: "Geta (下駄) Rare",
    harga: 13000, rarity:"rare", unlock_lv:25,
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
    harga: 500, rarity:"common", unlock_lv:1,
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
    harga: 600, rarity:"common", unlock_lv:1,
    svg: () => `
      <circle cx="178" cy="132" r="10" fill="none" stroke="#ef6a9a" stroke-width="2.5"/>
      <circle cx="222" cy="132" r="10" fill="none" stroke="#ef6a9a" stroke-width="2.5"/>
      <line x1="188" y1="132" x2="212" y2="132" stroke="#ef6a9a" stroke-width="2"/>
    `,
  },
  topi_merah: {
    nama: "Topi Merah",
    harga: 2800, rarity:"uncommon", unlock_lv:10,
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
    harga: 550, rarity:"common", unlock_lv:1,
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

  /* ========== JLPT Signature Weapons (Part 4 — character journey) ========== */
  /* N5 — Nihongo Book progression */
  n5_buku_common: {
    nama: "N5 · Buku Pelajaran",
    jlpt:"n5", rarity:"common", harga:500, unlock_lv:1,
    svg: () => `
      <rect x="265" y="315" width="30" height="38" rx="2" fill="#2563eb" stroke="#1e40af" stroke-width="1.5"/>
      <rect x="265" y="315" width="30" height="6" fill="#1e40af"/>
      <text x="280" y="340" text-anchor="middle" font-size="10" fill="#fff" font-weight="bold">語</text>
    `,
  },
  n5_buku_rare: {
    nama: "N5 · Buku Rare (Aura Hijau)",
    jlpt:"n5", rarity:"rare", harga:12000, unlock_lv:25,
    svg: () => `
      <defs><radialGradient id="aura-n5r"><stop offset="0%" stop-color="#10b981" stop-opacity=".7"/><stop offset="100%" stop-color="#10b981" stop-opacity="0"/></radialGradient></defs>
      <circle cx="280" cy="334" r="28" fill="url(#aura-n5r)"/>
      <rect x="265" y="315" width="30" height="38" rx="2" fill="#059669" stroke="#047857" stroke-width="1.5"/>
      <rect x="265" y="315" width="30" height="6" fill="#047857"/>
      <text x="280" y="340" text-anchor="middle" font-size="10" fill="#fff" font-weight="bold">語</text>
    `,
  },

  /* N4 — Dual Books (API) */
  n4_dualbooks_epic: {
    nama: "N4 · Dual Books Epic (Aura Ungu + Api)",
    jlpt:"n4", rarity:"epic", harga:30000, unlock_lv:50,
    svg: () => `
      <defs><radialGradient id="aura-n4e"><stop offset="0%" stop-color="#8b5cf6" stop-opacity=".85"/><stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient></defs>
      <circle cx="280" cy="334" r="30" fill="url(#aura-n4e)"/>
      <rect x="258" y="318" width="22" height="36" rx="2" fill="#7c3aed" stroke="#5b21b6" stroke-width="1.5"/>
      <rect x="282" y="318" width="22" height="36" rx="2" fill="#7c3aed" stroke="#5b21b6" stroke-width="1.5"/>
      <!-- fire wisps -->
      <path d="M268 316 Q266 310 270 308 Q268 304 274 304 Q272 310 268 316Z" fill="#f59e0b" opacity=".85"/>
      <path d="M292 316 Q290 310 294 308 Q292 304 298 304 Q296 310 292 316Z" fill="#f59e0b" opacity=".85"/>
    `,
  },

  /* N3 — Flying Grimoire */
  n3_grimoire_epic: {
    nama: "N3 · Flying Grimoire (Aura Ungu)",
    jlpt:"n3", rarity:"epic", harga:28000, unlock_lv:50,
    svg: () => `
      <defs><radialGradient id="aura-n3e"><stop offset="0%" stop-color="#8b5cf6" stop-opacity=".9"/><stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient></defs>
      <circle cx="280" cy="300" r="34" fill="url(#aura-n3e)"/>
      <!-- Floating grimoire above hands -->
      <rect x="260" y="282" width="40" height="30" rx="3" fill="#5b21b6" stroke="#4c1d95" stroke-width="1.5"/>
      <rect x="260" y="282" width="40" height="6" fill="#4c1d95"/>
      <text x="280" y="306" text-anchor="middle" font-size="12" fill="#ffd700" font-weight="bold">文</text>
      <!-- Particles -->
      <circle cx="252" cy="292" r="1.5" fill="#ffd700"/>
      <circle cx="308" cy="300" r="1.5" fill="#ffd700"/>
      <circle cx="265" cy="275" r="1" fill="#ffd700"/>
    `,
  },

  /* N2 — Construction Hammer */
  n2_hammer_rare: {
    nama: "N2 · Palu Konstruksi (Aura)",
    jlpt:"n2", rarity:"rare", harga:14000, unlock_lv:25,
    svg: () => `
      <defs><radialGradient id="aura-n2r"><stop offset="0%" stop-color="#f59e0b" stop-opacity=".6"/><stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/></radialGradient></defs>
      <circle cx="280" cy="334" r="26" fill="url(#aura-n2r)"/>
      <rect x="276" y="314" width="4" height="40" fill="#8b4513"/>
      <rect x="265" y="312" width="26" height="12" rx="2" fill="#6b7280" stroke="#374151" stroke-width="1.5"/>
    `,
  },

  /* ========== Flying Books — 3 variants (the "paling mahal") ========== */
  /* "Buku Terbang" floats above the character; aura wraps the book. */
  flying_book_green: {
    nama: "📘 Buku Terbang · Aura Hijau",
    jlpt:"all", rarity:"epic", harga:30000, unlock_lv:50,
    svg: () => `
      <defs><radialGradient id="fb-green"><stop offset="0%" stop-color="#10b981" stop-opacity=".9"/><stop offset="100%" stop-color="#10b981" stop-opacity="0"/></radialGradient></defs>
      <circle cx="200" cy="200" r="60" fill="url(#fb-green)">
        <animate attributeName="r" values="55;70;55" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <g transform="translate(200 200)">
        <rect x="-22" y="-18" width="44" height="36" rx="3" fill="#059669" stroke="#047857" stroke-width="2">
          <animateTransform attributeName="transform" type="rotate" values="-3;3;-3" dur="3s" repeatCount="indefinite"/>
        </rect>
        <rect x="-22" y="-18" width="44" height="8" fill="#047857"/>
        <text x="0" y="8" text-anchor="middle" font-size="16" fill="#fff" font-weight="bold">語</text>
      </g>
      <!-- Particles -->
      <circle cx="160" cy="180" r="2" fill="#10b981"><animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/></circle>
      <circle cx="240" cy="220" r="2" fill="#10b981"><animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite"/></circle>
    `,
  },
  flying_book_purple: {
    nama: "📘 Buku Terbang · Aura Ungu Epic",
    jlpt:"all", rarity:"legendary", harga:60000, unlock_lv:75,
    svg: () => `
      <defs><radialGradient id="fb-purple"><stop offset="0%" stop-color="#8b5cf6" stop-opacity="1"/><stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient></defs>
      <circle cx="200" cy="200" r="75" fill="url(#fb-purple)">
        <animate attributeName="r" values="68;85;68" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <g transform="translate(200 200)">
        <rect x="-26" y="-20" width="52" height="40" rx="3" fill="#7c3aed" stroke="#5b21b6" stroke-width="2">
          <animateTransform attributeName="transform" type="rotate" values="-5;5;-5" dur="3s" repeatCount="indefinite"/>
        </rect>
        <rect x="-26" y="-20" width="52" height="9" fill="#5b21b6"/>
        <text x="0" y="10" text-anchor="middle" font-size="18" fill="#ffd700" font-weight="bold">文</text>
      </g>
      <!-- Magic circles -->
      <circle cx="200" cy="200" r="90" fill="none" stroke="#8b5cf6" stroke-width="1" opacity=".5">
        <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="12s" repeatCount="indefinite"/>
      </circle>
      <!-- Particles -->
      <circle cx="150" cy="170" r="2.5" fill="#ffd700"><animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/></circle>
      <circle cx="250" cy="230" r="2.5" fill="#ffd700"><animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite"/></circle>
      <circle cx="130" cy="230" r="2" fill="#8b5cf6"><animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite"/></circle>
    `,
  },
  flying_book_mythic: {
    nama: "✨ BUKU TERBANG MYTHIC · Emas + Api",
    jlpt:"all", rarity:"mythic", harga:120000, unlock_lv:90,
    svg: () => `
      <defs>
        <radialGradient id="fb-mythic"><stop offset="0%" stop-color="#ffd700" stop-opacity="1"/><stop offset="100%" stop-color="#ffd700" stop-opacity="0"/></radialGradient>
        <linearGradient id="fb-fire" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#ef4444"/><stop offset="60%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#fef3c7"/></linearGradient>
      </defs>
      <!-- Outer glow -->
      <circle cx="200" cy="200" r="100" fill="url(#fb-mythic)">
        <animate attributeName="r" values="90;110;90" dur="2s" repeatCount="indefinite"/>
      </circle>
      <!-- Fire wings -->
      <path d="M160 200 Q130 190 120 170 Q130 200 150 220 Z" fill="url(#fb-fire)" opacity=".85">
        <animate attributeName="opacity" values=".7;1;.7" dur="1.5s" repeatCount="indefinite"/>
      </path>
      <path d="M240 200 Q270 190 280 170 Q270 200 250 220 Z" fill="url(#fb-fire)" opacity=".85">
        <animate attributeName="opacity" values=".7;1;.7" dur="1.5s" begin=".3s" repeatCount="indefinite"/>
      </path>
      <!-- Book -->
      <g transform="translate(200 200)">
        <rect x="-28" y="-22" width="56" height="44" rx="4" fill="#ffd700" stroke="#b8860b" stroke-width="2.5">
          <animateTransform attributeName="transform" type="rotate" values="-6;6;-6" dur="2.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="-28" y="-22" width="56" height="10" fill="#b8860b"/>
        <text x="0" y="14" text-anchor="middle" font-size="22" fill="#2a1810" font-weight="bold">極</text>
      </g>
      <!-- Spinning magic rings -->
      <circle cx="200" cy="200" r="105" fill="none" stroke="#ffd700" stroke-width="1.5" opacity=".6">
        <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="10s" repeatCount="indefinite"/>
      </circle>
      <circle cx="200" cy="200" r="115" fill="none" stroke="#f59e0b" stroke-width="1" opacity=".4" stroke-dasharray="4,4">
        <animateTransform attributeName="transform" type="rotate" from="360 200 200" to="0 200 200" dur="14s" repeatCount="indefinite"/>
      </circle>
      <!-- Fire particles -->
      <circle cx="140" cy="150" r="3" fill="#ef4444"><animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite"/></circle>
      <circle cx="260" cy="150" r="3" fill="#f59e0b"><animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/></circle>
      <circle cx="120" cy="240" r="2.5" fill="#ffd700"><animate attributeName="opacity" values="0;1;0" dur="1.3s" repeatCount="indefinite"/></circle>
      <circle cx="280" cy="240" r="2.5" fill="#ffd700"><animate attributeName="opacity" values="1;0;1" dur="1.3s" repeatCount="indefinite"/></circle>
      <circle cx="200" cy="130" r="2" fill="#fef3c7"><animate attributeName="opacity" values="0;1;0" dur=".8s" repeatCount="indefinite"/></circle>
    `,
  },

  /* ========== Hammers with aura (user request) ========== */
  hammer_green: {
    nama: "🔨 Palu · Aura Hijau",
    jlpt:"n2", rarity:"uncommon", harga:4500, unlock_lv:10,
    svg: () => `
      <defs><radialGradient id="h-green"><stop offset="0%" stop-color="#10b981" stop-opacity=".7"/><stop offset="100%" stop-color="#10b981" stop-opacity="0"/></radialGradient></defs>
      <circle cx="280" cy="334" r="28" fill="url(#h-green)"/>
      <rect x="276" y="314" width="4" height="40" fill="#8b4513"/>
      <rect x="262" y="310" width="30" height="14" rx="2" fill="#4b5563" stroke="#1f2937" stroke-width="1.5"/>
    `,
  },
  hammer_purple: {
    nama: "🔨 Palu · Aura Ungu Epic",
    jlpt:"n2", rarity:"epic", harga:28000, unlock_lv:50,
    svg: () => `
      <defs><radialGradient id="h-purple"><stop offset="0%" stop-color="#8b5cf6" stop-opacity=".85"/><stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient></defs>
      <circle cx="280" cy="330" r="32" fill="url(#h-purple)"><animate attributeName="r" values="30;36;30" dur="2s" repeatCount="indefinite"/></circle>
      <rect x="276" y="314" width="4" height="40" fill="#5b21b6"/>
      <rect x="260" y="308" width="32" height="16" rx="3" fill="#7c3aed" stroke="#4c1d95" stroke-width="2"/>
      <circle cx="252" cy="310" r="2" fill="#a78bfa"><animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/></circle>
      <circle cx="300" cy="320" r="2" fill="#a78bfa"><animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite"/></circle>
    `,
  },
  hammer_fire_gold: {
    nama: "✨ Palu Mythic · Emas + Api",
    jlpt:"n2", rarity:"legendary", harga:75000, unlock_lv:85,
    svg: () => `
      <defs>
        <radialGradient id="h-mythic"><stop offset="0%" stop-color="#ffd700" stop-opacity="1"/><stop offset="100%" stop-color="#ffd700" stop-opacity="0"/></radialGradient>
        <linearGradient id="h-fire" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#ef4444"/><stop offset="60%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#fef3c7"/></linearGradient>
      </defs>
      <circle cx="280" cy="325" r="42" fill="url(#h-mythic)"><animate attributeName="r" values="38;48;38" dur="2s" repeatCount="indefinite"/></circle>
      <rect x="276" y="314" width="4" height="40" fill="#b8860b"/>
      <rect x="258" y="304" width="34" height="18" rx="3" fill="#ffd700" stroke="#b8860b" stroke-width="2.5"/>
      <!-- Fire -->
      <path d="M264 302 Q260 290 268 284 Q264 278 272 280 Q270 290 272 298Z" fill="url(#h-fire)" opacity=".9"/>
      <path d="M296 302 Q300 290 292 284 Q296 278 288 280 Q290 290 288 298Z" fill="url(#h-fire)" opacity=".9"/>
      <circle cx="248" cy="316" r="1.8" fill="#fff"><animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite"/></circle>
      <circle cx="312" cy="320" r="1.8" fill="#fff"><animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/></circle>
    `,
  },

  /* ========== Bags (tas) with aura ========== */
  tas_green: {
    nama: "🎒 Tas · Aura Hijau",
    jlpt:"all", rarity:"uncommon", harga:3000, unlock_lv:10,
    svg: () => `
      <defs><radialGradient id="t-green"><stop offset="0%" stop-color="#10b981" stop-opacity=".6"/><stop offset="100%" stop-color="#10b981" stop-opacity="0"/></radialGradient></defs>
      <circle cx="283" cy="335" r="26" fill="url(#t-green)"/>
      <rect x="265" y="315" width="35" height="40" rx="4" fill="#065f46" stroke="#064e3b" stroke-width="1.5"/>
      <path d="M270 315 Q282 302 294 315" stroke="#064e3b" stroke-width="2.5" fill="none"/>
      <rect x="275" y="335" width="15" height="4" fill="#064e3b"/>
    `,
  },
  tas_purple: {
    nama: "🎒 Tas · Aura Ungu Epic",
    jlpt:"all", rarity:"rare", harga:14000, unlock_lv:25,
    svg: () => `
      <defs><radialGradient id="t-purple"><stop offset="0%" stop-color="#8b5cf6" stop-opacity=".75"/><stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient></defs>
      <circle cx="283" cy="335" r="30" fill="url(#t-purple)"><animate attributeName="r" values="28;34;28" dur="2s" repeatCount="indefinite"/></circle>
      <rect x="263" y="313" width="38" height="44" rx="5" fill="#5b21b6" stroke="#4c1d95" stroke-width="2"/>
      <path d="M269 313 Q282 298 295 313" stroke="#4c1d95" stroke-width="3" fill="none"/>
      <rect x="273" y="337" width="18" height="5" fill="#4c1d95"/>
      <circle cx="255" cy="320" r="1.5" fill="#a78bfa"><animate attributeName="opacity" values="0;1;0" dur="1.6s" repeatCount="indefinite"/></circle>
      <circle cx="315" cy="330" r="1.5" fill="#a78bfa"><animate attributeName="opacity" values="1;0;1" dur="1.6s" repeatCount="indefinite"/></circle>
    `,
  },
  tas_fire_gold: {
    nama: "✨ Tas Mythic · Emas + Api",
    jlpt:"all", rarity:"epic", harga:35000, unlock_lv:50,
    svg: () => `
      <defs>
        <radialGradient id="t-gold"><stop offset="0%" stop-color="#ffd700" stop-opacity=".9"/><stop offset="100%" stop-color="#ffd700" stop-opacity="0"/></radialGradient>
        <linearGradient id="t-fire" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#ef4444"/><stop offset="60%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#fef3c7"/></linearGradient>
      </defs>
      <circle cx="283" cy="335" r="36" fill="url(#t-gold)"><animate attributeName="r" values="32;42;32" dur="2s" repeatCount="indefinite"/></circle>
      <path d="M268 310 Q264 300 272 294 Q268 286 276 288 Q274 298 274 304Z" fill="url(#t-fire)" opacity=".9"/>
      <path d="M298 310 Q302 300 294 294 Q298 286 290 288 Q292 298 292 304Z" fill="url(#t-fire)" opacity=".9"/>
      <rect x="261" y="315" width="42" height="44" rx="5" fill="#ffd700" stroke="#b8860b" stroke-width="2.5"/>
      <path d="M267 315 Q282 298 297 315" stroke="#b8860b" stroke-width="3" fill="none"/>
      <rect x="275" y="340" width="18" height="5" fill="#b8860b"/>
      <text x="282" y="342" text-anchor="middle" font-size="14" fill="#2a1810" font-weight="bold">極</text>
      <circle cx="248" cy="330" r="1.8" fill="#fff"><animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite"/></circle>
      <circle cx="318" cy="340" r="1.8" fill="#fff"><animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/></circle>
    `,
  },

  /* LEGENDARY — Gold + Fire — unlock Lv 75 */
  legendary_golden_tome: {
    nama: "✨ Golden Tome Legendary",
    jlpt:"all", rarity:"legendary", harga:50000, unlock_lv:75,
    svg: () => `
      <defs>
        <radialGradient id="aura-legend"><stop offset="0%" stop-color="#ffd700" stop-opacity=".95"/><stop offset="100%" stop-color="#ffd700" stop-opacity="0"/></radialGradient>
        <linearGradient id="fire-grad" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#ef4444"/><stop offset="60%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#fef3c7"/></linearGradient>
      </defs>
      <circle cx="280" cy="332" r="42" fill="url(#aura-legend)"/>
      <!-- Book -->
      <rect x="263" y="316" width="34" height="38" rx="3" fill="#ffd700" stroke="#b8860b" stroke-width="2"/>
      <rect x="263" y="316" width="34" height="7" fill="#b8860b"/>
      <text x="280" y="342" text-anchor="middle" font-size="12" fill="#2a1810" font-weight="bold">極</text>
      <!-- Fire wisps -->
      <path d="M268 312 Q264 304 270 298 Q268 292 274 294 Q272 302 272 306 Q276 302 274 298 Q278 304 274 312Z" fill="url(#fire-grad)" opacity=".9"/>
      <path d="M292 312 Q296 304 290 298 Q292 292 286 294 Q288 302 288 306 Q284 302 286 298 Q282 304 286 312Z" fill="url(#fire-grad)" opacity=".9"/>
      <!-- Sparkles -->
      <circle cx="254" cy="328" r="1.5" fill="#fff"/>
      <circle cx="306" cy="330" r="1.5" fill="#fff"/>
      <circle cx="258" cy="348" r="1" fill="#ffd700"/>
      <circle cx="302" cy="348" r="1" fill="#ffd700"/>
    `,
  },

  /* LEGENDARY — Hammer version for N2 workers */
  legendary_golden_hammer: {
    nama: "✨ Golden Hammer Legendary",
    jlpt:"n2", rarity:"legendary", harga:50000, unlock_lv:75,
    svg: () => `
      <defs>
        <radialGradient id="aura-legend-h"><stop offset="0%" stop-color="#ffd700" stop-opacity="1"/><stop offset="100%" stop-color="#ffd700" stop-opacity="0"/></radialGradient>
        <linearGradient id="fire-hammer" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#ef4444"/><stop offset="60%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#fef3c7"/></linearGradient>
      </defs>
      <circle cx="280" cy="330" r="40" fill="url(#aura-legend-h)"/>
      <rect x="276" y="314" width="4" height="40" fill="#8b4513"/>
      <rect x="262" y="310" width="30" height="14" rx="2" fill="#ffd700" stroke="#b8860b" stroke-width="2"/>
      <path d="M268 308 Q264 300 270 294 Q268 288 274 290 Q272 300 272 306Z" fill="url(#fire-hammer)" opacity=".9"/>
      <path d="M292 308 Q296 300 290 294 Q292 288 286 290 Q288 300 288 306Z" fill="url(#fire-hammer)" opacity=".9"/>
      <circle cx="252" cy="320" r="1.5" fill="#fff"/>
      <circle cx="308" cy="320" r="1.5" fill="#fff"/>
    `,
  },
};

/* ====== Aura (effect at high level) ====== */
export const AURAS = {
  none: { nama: "Tidak ada", harga: 0, equipped_default: true, svg: null },

  /* 3 aura tiers — standalone purchases that wrap the whole character. */
  aura_hijau: {
    nama: "💚 Aura Hijau",
    rarity: "uncommon", harga: 5000, unlock_lv: 10,
    svg: () => `
      <defs>
        <radialGradient id="aura-green-grad">
          <stop offset="0%" stop-color="#10b981" stop-opacity=".35"/>
          <stop offset="70%" stop-color="#10b981" stop-opacity=".12"/>
          <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="200" cy="260" r="135" fill="url(#aura-green-grad)">
        <animate attributeName="r" values="125;145;125" dur="2.3s" repeatCount="indefinite"/>
      </circle>
    `,
  },

  aura_ungu: {
    nama: "💜 Aura Ungu Epic",
    rarity: "rare", harga: 15000, unlock_lv: 25,
    svg: () => `
      <defs>
        <radialGradient id="aura-purple-grad">
          <stop offset="0%" stop-color="#8b5cf6" stop-opacity=".45"/>
          <stop offset="70%" stop-color="#8b5cf6" stop-opacity=".15"/>
          <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="200" cy="260" r="140" fill="url(#aura-purple-grad)">
        <animate attributeName="r" values="130;150;130" dur="2.2s" repeatCount="indefinite"/>
      </circle>
      <!-- Purple sparkles -->
      <circle cx="120" cy="180" r="2" fill="#a78bfa"><animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite"/></circle>
      <circle cx="285" cy="220" r="2" fill="#a78bfa"><animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite"/></circle>
      <circle cx="140" cy="360" r="2.5" fill="#c4b5fd"><animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="275" cy="370" r="2" fill="#c4b5fd"><animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite"/></circle>
    `,
  },

  aura_emas_api: {
    nama: "✨ Aura Emas + Api Legendary",
    rarity: "legendary", harga: 50000, unlock_lv: 75,
    svg: () => `
      <defs>
        <radialGradient id="aura-fire-grad">
          <stop offset="0%" stop-color="#ffd700" stop-opacity=".55"/>
          <stop offset="55%" stop-color="#f59e0b" stop-opacity=".2"/>
          <stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="aura-flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#ef4444"/><stop offset="60%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#fef3c7"/></linearGradient>
      </defs>
      <circle cx="200" cy="260" r="160" fill="url(#aura-fire-grad)">
        <animate attributeName="r" values="150;175;150" dur="2s" repeatCount="indefinite"/>
      </circle>
      <!-- Flame wisps around character -->
      <path d="M100 350 Q80 320 95 290 Q85 320 110 340Z" fill="url(#aura-flame)" opacity=".55">
        <animate attributeName="opacity" values=".4;.8;.4" dur="1.3s" repeatCount="indefinite"/>
      </path>
      <path d="M300 350 Q320 320 305 290 Q315 320 290 340Z" fill="url(#aura-flame)" opacity=".55">
        <animate attributeName="opacity" values=".8;.4;.8" dur="1.3s" repeatCount="indefinite"/>
      </path>
      <path d="M120 180 Q100 150 115 120 Q105 150 130 170Z" fill="url(#aura-flame)" opacity=".5">
        <animate attributeName="opacity" values=".4;.8;.4" dur="1.5s" begin=".2s" repeatCount="indefinite"/>
      </path>
      <path d="M280 180 Q300 150 285 120 Q295 150 270 170Z" fill="url(#aura-flame)" opacity=".5">
        <animate attributeName="opacity" values=".8;.4;.8" dur="1.5s" begin=".2s" repeatCount="indefinite"/>
      </path>
      <!-- Gold sparkles -->
      <g>
        <circle cx="130" cy="150" r="3" fill="#ffd700"><animate attributeName="opacity" values="0;1;0" dur="1.6s" repeatCount="indefinite"/></circle>
        <circle cx="280" cy="200" r="2.5" fill="#ffd700"><animate attributeName="opacity" values="1;0;1" dur="1.4s" repeatCount="indefinite"/></circle>
        <circle cx="140" cy="350" r="2.5" fill="#fef3c7"><animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite"/></circle>
        <circle cx="290" cy="380" r="3" fill="#ffd700"><animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite"/></circle>
        <circle cx="200" cy="100" r="2" fill="#fef3c7"><animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite"/></circle>
      </g>
    `,
  },

  /* Legacy aliases kept so old equipped values still render */
  aura_pink: { nama: "Aura Pink (lama)", harga: 1000, unlock_lv: 15, svg: () => `
    <defs><radialGradient id="aura-pink-grad"><stop offset="0%" stop-color="#ef6a9a" stop-opacity=".3"/><stop offset="70%" stop-color="#ef6a9a" stop-opacity=".1"/><stop offset="100%" stop-color="#ef6a9a" stop-opacity="0"/></radialGradient></defs>
    <circle cx="200" cy="260" r="130" fill="url(#aura-pink-grad)"><animate attributeName="r" values="120;140;120" dur="2s" repeatCount="indefinite"/></circle>
  ` },
  aura_emas: { nama: "Aura Emas (lama)", harga: 2500, unlock_lv: 30, svg: () => `
    <defs><radialGradient id="aura-emas-grad"><stop offset="0%" stop-color="#ffd700" stop-opacity=".35"/><stop offset="70%" stop-color="#ffd700" stop-opacity=".1"/><stop offset="100%" stop-color="#ffd700" stop-opacity="0"/></radialGradient></defs>
    <circle cx="200" cy="260" r="140" fill="url(#aura-emas-grad)"><animate attributeName="r" values="130;150;130" dur="2.5s" repeatCount="indefinite"/></circle>
  ` },
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
