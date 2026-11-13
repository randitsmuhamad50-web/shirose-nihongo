/* Service worker: network-first, cache fallback */
// v26 — SSW 特定技能 (ssw.js, ssw-core.js, ssw-art.js, css/ssw.css; data & gambar halaman buku dicache saat dibuka).
// v25 — Hiragana & Katakana (kana-center, writer, data kana + goresan), cache goresan KanjiVG.
// v23 — JLPT Center (Full Exam + Practice N5–N1, timer, pembahasan, riwayat).
// v12 — halaman hasil ujian rombak total: skor besar dengan %, breakdown
// benar/salah/kosong, navigasi pembahasan per-soal dengan grid jump dan
// tombol prev/next, tombol "Ulangi Ujian".
const CACHE = "shirose-nihongo-v146";
const AUDIO = "shirose-audio-v1";   // voice pack offline (tidak dihapus saat update)
const KVG = "shirose-kvg-v1";       // goresan KanjiVG yang pernah dibuka (offline; tidak dihapus saat update)
const CORE = [
  "./",
  "./index.html",
  "./teacher.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
  "./js/character.js",
  "./js/firebase-sync.js",
  "./js/shop-seed.js",
  "./js/achievements.js",
  "./js/choukai-jlpt.js",
  "./css/shirose-extra.css",
  "./js/voice.js",
  "./js/jlpt-center.js",
  "./css/jlpt-center.css",
  "./js/writer.js",
  "./js/kana-center.js",
  "./css/kana-center.css",
  "./data/kana.json",
  "./data/kana-baca.json",
  "./data/kana-strokes.json",
  "./js/ssw.js",
  "./js/jft.js",
  "./css/jft.css",
  "./js/ssw-core.js",
  "./js/ssw-art.js",
  "./css/ssw.css",
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== AUDIO && k !== KVG).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  // Don't cache firebase or external APIs
  if (u.hostname.includes("firebase") || u.hostname.includes("googleapis") || u.hostname.includes("gstatic")) return;
  // Goresan KanjiVG (CDN): cache-first — file SVG ini tidak pernah berubah untuk commit yang sama.
  if (/KanjiVG\/kanjivg/i.test(u.pathname) && /\.svg$/i.test(u.pathname)) {
    e.respondWith(caches.open(KVG).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      if (r.ok) c.put(e.request, r.clone()).catch(()=>{});
      return r;
    }))));
    return;
  }
  // MP3 voice pack: ambil dari cache offline dulu (file audio tidak pernah berubah isinya)
  if (u.origin === location.origin && /\.mp3$/i.test(u.pathname)) {
    e.respondWith(caches.match(e.request.url, { ignoreMethod: true, ignoreVary: true }).then(hit => {
      if (hit && !e.request.headers.has("range")) return hit;
      return fetch(e.request).catch(() => hit || new Response("Offline", { status: 503 }));
    }));
    return;
  }
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok && e.request.method === "GET" && u.origin === location.origin) {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone).catch(()=>{}));
      }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || new Response("Offline", {status:503})))
  );
});
