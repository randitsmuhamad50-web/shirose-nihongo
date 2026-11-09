/* Service worker: network-first, cache fallback */
// v12 — halaman hasil ujian rombak total: skor besar dengan %, breakdown
// benar/salah/kosong, navigasi pembahasan per-soal dengan grid jump dan
// tombol prev/next, tombol "Ulangi Ujian".
const CACHE = "shirose-nihongo-v20";
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
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  // Don't cache firebase or external APIs
  if (u.hostname.includes("firebase") || u.hostname.includes("googleapis") || u.hostname.includes("gstatic")) return;
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
