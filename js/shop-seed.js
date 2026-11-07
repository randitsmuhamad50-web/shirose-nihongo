/* Shop items that match character.js CATALOG. Seeded at runtime. */
import { CATALOG, CATALOG_LABELS } from "./character.js";

export function allShopItems() {
  const out = [];
  for (const [kategori, items] of Object.entries(CATALOG)) {
    for (const [id, item] of Object.entries(items)) {
      if (item.equipped_default) continue;  // skip defaults (sudah owned)
      if (item.harga === 0) continue;
      out.push({
        kategori,
        kategori_label: CATALOG_LABELS[kategori],
        id,
        nama: item.nama,
        harga: item.harga,
        rarity: item.rarity || "common",
        unlock_lv: item.unlock_lv || 1,
      });
    }
  }
  return out;
}
