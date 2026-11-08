/* ============================================================
   SHIROSE NIHONGO — FIREBASE SYNC (RPG Platform v2)
   Reuse existing project "shirose-nihongo" (Spark plan).
   Schema baru:
     siswa/{uid}: { nama, email, kelas, aksesLevel{n5,n4,n3,n2,n1}, karakter{equipped,inventory}, aktif, created }
     siswa/{uid}/gami/{lvl}: { xp, koin, streak, level_karakter, lastAktivitas }
     siswa/{uid}/srs/{lvl}: { kartu{}, updated }
     siswa/{uid}/nilai/{id}: { kategoriId, skor, benar, salah, waktu, tgl }
     siswa/{uid}/misi_harian/{tgl}: { misi[], claimed[] }
     kategori_ujian/{id}: { nama, level, deskripsi, jumlahSoal, durasi, lulus, publish, reward, tipe }
     soal/{kategoriId}/items/{soalId}: { tipe, pertanyaan, opsi[], kunci, pembahasan_id, pembahasan_jp, materi, kesulitan, poin, gambar }
     item_shop/{kategori}/items/{id}: { nama, harga, rarity, level_unlock, svg_key }
     choukai/{lvl}/items/{id}: { pertanyaan, opsi[], kunci, transkrip, pembahasan, tts_text, audio_url }
     kelas/{id}: { nama, murid[], guru }
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, sendPasswordResetEmail,
  setPersistence, browserLocalPersistence, browserSessionPersistence,
  indexedDBLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, onSnapshot, query, orderBy, limit, addDoc,
  where, writeBatch, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCPdZmpHeAOIRcFNSfoiLj-HmNTHettrQo",
  authDomain: "shirose-nihongo.firebaseapp.com",
  projectId: "shirose-nihongo",
  storageBucket: "shirose-nihongo.firebasestorage.app",
  messagingSenderId: "601020682073",
  appId: "1:601020682073:web:adb7adb44e79b17d3d4648",
};

const GURU_EMAIL = "randitsmuhamad50@gmail.com";
// Developer email (Part 6). Defaults to the same account as guru but kept
// separate so a future rename or multi-guru setup doesn't dilute dev powers.
const DEVELOPER_EMAIL = "randitsmuhamad50@gmail.com";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Make sign-in persist across reloads and tabs. We try the strongest option
// first (indexedDB) and fall back when the browser blocks it (Safari private
// mode, extensions, strict privacy). Without this a fresh profile can reload
// into a "signed-out" state even though the user just signed in — that's the
// "akun engga terdetect" bug we're fixing. Errors are swallowed because the
// in-memory default still works, just without cross-reload persistence.
(async () => {
  try {
    await setPersistence(auth, indexedDBLocalPersistence);
  } catch (_e1) {
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch (_e2) {
      try { await setPersistence(auth, browserSessionPersistence); } catch (_e3) {}
    }
  }
})();

/* ========== STATE ========== */
let currentUser = null;
let currentSiswaDoc = null;
let onReadyCallbacks = [];
let authListenerSet = false;

// Role helpers (Part 17). The siswa doc's `role` field is authoritative;
// the hard-coded GURU_EMAIL / DEVELOPER_EMAIL act as a bootstrap for the
// very first admin so they can grant roles to others.
export function siswaRole(doc){ return (doc && typeof doc.role === "string") ? doc.role : "student"; }
export function isGuru(user) {
  if (!user) return false;
  if (user.email === GURU_EMAIL) return true;
  const r = siswaRole(currentSiswaDoc);
  return r === "guru" || r === "admin" || r === "developer";
}
export function isDeveloper(user) {
  if (!user) return false;
  if (user.email === DEVELOPER_EMAIL) return true;
  return siswaRole(currentSiswaDoc) === "developer";
}
export function isAdmin(user) {
  if (!user) return false;
  if (user.email === DEVELOPER_EMAIL) return true; // developer >= admin
  const r = siswaRole(currentSiswaDoc);
  return r === "admin" || r === "developer";
}
export function userIsGuru()      { return isGuru(currentUser); }
export function userIsDeveloper() { return isDeveloper(currentUser); }
export function userIsAdmin()     { return isAdmin(currentUser); }

/* ---------- Admin ops (only callable when userIsAdmin()) ---------- */
export async function listSemuaAkun(){
  if (!userIsAdmin()) throw new Error("Hanya admin / developer");
  const snap = await getDocs(collection(db, "siswa"));
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}
export async function setRole(uid, role) {
  if (!userIsAdmin()) throw new Error("Hanya admin / developer");
  const allowed = ["student","guru","admin","developer"];
  if (!allowed.includes(role)) throw new Error("Role invalid");
  // Only developer can grant developer/admin role.
  if ((role === "developer" || role === "admin") && !userIsDeveloper())
    throw new Error("Hanya developer yang bisa set admin / developer");
  await updateDoc(doc(db, "siswa", uid), { role });
}
export async function setUnlimitedCoins(uid, enable) {
  if (!userIsDeveloper()) throw new Error("Hanya developer");
  await updateDoc(doc(db, "siswa", uid), {
    "permissions.unlimited_coins": !!enable,
  });
}
// Unlimited coins when developer OR siswa doc explicitly has the permission.
// Note: permission must come from a trusted write (admin/dev) — client shouldn't
// grant it to itself. See firestore.rules.example.
export function hasUnlimitedCoins() {
  if (isDeveloper(currentUser)) return true;
  return !!(currentSiswaDoc?.permissions?.unlimited_coins);
}
export function getUser() { return currentUser; }
export function getSiswaDoc() { return currentSiswaDoc; }

/* ========== AUTH ========== */
export function onAuth(cb) {
  if (!authListenerSet) {
    authListenerSet = true;
    onAuthStateChanged(auth, async (u) => {
      currentUser = u;
      if (u) await ensureSiswaDoc(u);
      else currentSiswaDoc = null;
      onReadyCallbacks.forEach(c => c(u, currentSiswaDoc));
    });
  }
  onReadyCallbacks.push(cb);
}

// What role should a brand-new siswa doc carry? Guru / developer emails get
// elevated automatically so the first login already behaves as teacher, which
// also lets Firestore's isGuru() rule read other students. Everybody else is
// "student". Needs the updated firestore.rules.example (allows role at create
// when email matches the bootstrap list).
function _bootstrapRoleFor(u){
  if (!u || !u.email) return "student";
  if (u.email === DEVELOPER_EMAIL) return "developer";
  if (u.email === GURU_EMAIL)      return "guru";
  return "student";
}

// Status terakhir ensureSiswaDoc — dipakai halaman login untuk tahu apakah
// siswa doc benar-benar sudah dibuat di Firestore, atau cuma ada di Auth.
// Nilai: "ok" | "write_blocked" | "read_blocked" | null
export let lastSiswaDocStatus = null;
export function getLastSiswaDocStatus(){ return lastSiswaDocStatus; }

async function ensureSiswaDoc(u, extra = {}) {
  // PENTING: fungsi ini TIDAK PERNAH throw ke caller onAuthStateChanged —
  // sebelumnya throw di sini bikin onReadyCallbacks tidak dipanggil dan UI
  // stuck di "Memuat…" untuk user yang akunnya orphan (ada di Firebase Auth
  // tapi tidak ada di Firestore). Caller yang butuh tahu hasilnya baca
  // lastSiswaDocStatus setelah await.
  const ref = doc(db, "siswa", u.uid);
  const bootstrapRole = _bootstrapRoleFor(u);
  const isOwner = bootstrapRole !== "student";

  const base = {
    nama: extra.nama || u.displayName || u.email.split("@")[0],
    email: u.email,
    kelas: "",
    // WORKAROUND Nov 2026 (permintaan guru): semua akun dapat akses N5-N1
    // sepenuhnya, tidak dibatasi per-level. Guru bisa kembalikan ke access
    // per-user nanti dengan toggle di tab Siswa. isOwner tetap digunakan
    // untuk role bootstrap di updateDoc selanjutnya.
    aksesLevel: { n5:true, n4:true, n3:true, n2:true, n1:true },
    karakter: {
      equipped: {
        rambut: null,
        pakaian: "seragam_default",
        sepatu: "shoes_default",
        aksesori: "none",
        item_tangan: "none",
        aura: "none",
      },
      inventory: ["seragam_default", "shoes_default", "none"],
      skinTone: "light",
      hairColor: "#2a1810",
    },
    created: serverTimestamp(),
    aktif: serverTimestamp(),
  };

  lastSiswaDocStatus = null;

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      // Brand-new siswa (atau orphan: ada di Auth tapi dokumennya hilang).
      // Coba bikin — kalau diterima rules, selesai. Kalau rules reject,
      // tandai status write_blocked supaya UI bisa tampilkan tombol recovery.
      try {
        await setDoc(ref, base);
        currentSiswaDoc = { ...base };
        lastSiswaDocStatus = "ok";
      } catch (writeErr){
        console.warn("ensureSiswaDoc: setDoc blocked oleh Firestore Rules:", writeErr?.code || writeErr?.message);
        currentSiswaDoc = { ...base };
        lastSiswaDocStatus = "write_blocked";
        lastSiswaDocError = writeErr;
        // TIDAK throw — biarkan UI render dengan placeholder dan tampilkan banner recovery.
      }
    } else {
      currentSiswaDoc = snap.data();
      lastSiswaDocStatus = "ok";
      updateDoc(ref, { aktif: serverTimestamp() }).catch(()=>{});
      // WORKAROUND akses JLPT Nov 2026: kalau ada level yang masih false,
      // upgrade otomatis jadi true. Ini supaya user lama (yang didaftarin
      // waktu aksesLevel default cuma n5) langsung dapat N5-N1 saat login
      // tanpa perlu guru toggle manual. Dilakukan best-effort — kalau
      // rules nolak updateDoc, UI tetap jalan dengan state in-memory.
      const a = currentSiswaDoc.aksesLevel || {};
      const needUpgrade = ["n5","n4","n3","n2","n1"].some(l => a[l] !== true);
      if (needUpgrade){
        const full = { n5:true, n4:true, n3:true, n2:true, n1:true };
        updateDoc(ref, { aksesLevel: full }).catch(e => {
          console.warn("aksesLevel upgrade blocked:", e?.code);
        });
        currentSiswaDoc.aksesLevel = full;
      }
    }

    // Bootstrap guru/developer role untuk owner email.
    if (isOwner && currentSiswaDoc.role !== bootstrapRole){
      try {
        await updateDoc(ref, { role: bootstrapRole });
        currentSiswaDoc.role = bootstrapRole;
      } catch (_e){ /* perlu rules baru; dashboard tetap bisa jalan */ }
    }
  } catch (e){
    console.warn("ensureSiswaDoc: read blocked:", e?.code || e?.message);
    currentSiswaDoc = { ...base, role: bootstrapRole };
    lastSiswaDocStatus = "read_blocked";
    lastSiswaDocError = e;
  }
}

export let lastSiswaDocError = null;

/**
 * Hapus akun saya SENDIRI (Firebase Auth user + siswa doc kalau ada).
 * Dipakai user yang orphan supaya bisa daftar ulang dengan email yang sama.
 * HARUS login dulu (Firebase client Auth requirement).
 */
export async function hapusAkunSendiri(){
  if (!currentUser) throw new Error("Belum login");
  const uid = currentUser.uid;
  // Best-effort delete siswa doc dulu (kalau ada).
  try { await deleteDoc(doc(db, "siswa", uid)); } catch(_){}
  // Delete Firebase Auth user — ini yang critical supaya email bisa dipakai lagi.
  try {
    await currentUser.delete();
  } catch(e){
    // Firebase kadang minta "recent login" untuk delete. Kasih pesan jelas.
    if (e.code === "auth/requires-recent-login"){
      throw new Error(
        "Firebase minta login ulang sebelum hapus akun (keamanan). " +
        "Silakan logout, login lagi, lalu klik tombol hapus akun ini sekali lagi."
      );
    }
    throw e;
  }
  currentUser = null;
  currentSiswaDoc = null;
  lastSiswaDocStatus = null;
  return true;
}

/**
 * Coba buat ulang siswa doc untuk user yang sudah login tapi dokumennya hilang.
 * Dipakai tombol "Perbaiki Akun Saya" di UI: user yang akunnya ada di Firebase
 * Auth tapi tidak terlihat di dashboard guru bisa menekan tombol ini.
 */
export async function reparasiAkunSaya(nama){
  if (!currentUser) throw new Error("Belum login");
  await ensureSiswaDoc(currentUser, { nama });
  return { status: lastSiswaDocStatus, doc: currentSiswaDoc };
}

export async function login(email, pwd) {
  return await signInWithEmailAndPassword(auth, email, pwd);
}
export async function daftar(email, pwd, nama) {
  // Step 1: buat user di Firebase Auth.
  const cred = await createUserWithEmailAndPassword(auth, email, pwd);
  // Step 2: pastikan siswa doc tercipta. ensureSiswaDoc tidak throw lagi
  // (biar onAuthStateChanged tidak stuck untuk login orphan). Kita cek
  // lastSiswaDocStatus setelah await.
  await ensureSiswaDoc(cred.user, { nama: nama || null });
  if (lastSiswaDocStatus !== "ok"){
    const writeErr = lastSiswaDocError;
    // Rollback: hapus akun Auth supaya email bisa dipakai daftar lagi
    // setelah rules diperbaiki, daripada stuck "email sudah terdaftar".
    try { await cred.user.delete(); } catch(_){}
    const err = new Error(
      "Pendaftaran belum selesai: Firestore Rules menolak pembuatan profil " +
      "siswa. Guru perlu deploy ulang firestore.rules.example di Firebase " +
      "Console. Email kamu sudah dihapus otomatis, silakan coba daftar ulang " +
      "setelah guru memberi tahu rules sudah diperbaiki. " +
      "(Detail: " + (writeErr?.code || writeErr?.message || "permission-denied") + ")"
    );
    err.code = "siswa-doc-create-blocked";
    throw err;
  }
  return cred;
}
export async function keluar() { return await signOut(auth); }
export async function resetPassword(email) { return await sendPasswordResetEmail(auth, email); }

/* ========== CHARACTER / INVENTORY ========== */
export async function updateKarakter(karakter) {
  if (!currentUser) return;
  await updateDoc(doc(db, "siswa", currentUser.uid), { karakter });
  currentSiswaDoc.karakter = karakter;
}
export async function beliItem(kategori, itemId, harga, level) {
  if (!currentUser) throw new Error("Harus login dulu");
  const uid = currentUser.uid;
  const ref = doc(db, "siswa", uid);
  const siswa = (await getDoc(ref)).data();
  // Developer / permission-granted accounts bypass coin deduction entirely.
  const unlimited = isDeveloper(currentUser) || !!(siswa?.permissions?.unlimited_coins);
  // Cek koin
  const gamiRef = doc(db, "siswa", uid, "gami", level);
  const gamiSnap = await getDoc(gamiRef);
  const gami = gamiSnap.exists() ? gamiSnap.data() : { xp:0, koin:0, streak:0, level_karakter:1 };
  if (!unlimited && (gami.koin || 0) < harga) throw new Error("Koin tidak cukup!");
  // Deduct koin (skip for unlimited)
  if (!unlimited) gami.koin -= harga;
  // Add to inventory
  const inv = siswa.karakter?.inventory || [];
  if (inv.includes(itemId)) throw new Error("Sudah dimiliki");
  inv.push(itemId);
  await setDoc(gamiRef, gami, { merge: true });
  await updateDoc(ref, { "karakter.inventory": inv });
  currentSiswaDoc.karakter.inventory = inv;
  return { newKoin: gami.koin, unlimited };
}
export async function equipItem(kategori, itemId) {
  if (!currentUser) return;
  const eq = currentSiswaDoc.karakter.equipped || {};
  eq[kategori] = itemId;
  await updateDoc(doc(db, "siswa", currentUser.uid), { "karakter.equipped": eq });
  currentSiswaDoc.karakter.equipped = eq;
}

/* ========== GAMI (XP / Koin / Streak per level JLPT) ========== */
export async function getGami(level) {
  if (!currentUser) return null;
  try {
    const snap = await getDoc(doc(db, "siswa", currentUser.uid, "gami", level));
    return snap.exists() ? snap.data() : { xp:0, koin:0, streak:0, level_karakter:1 };
  } catch (e) { console.warn("getGami failed:", e.message); return { xp:0, koin:0, streak:0, level_karakter:1 }; }
}
export async function tambahXP(level, dXP, dKoin = 0) {
  if (!currentUser) return;
  try {
    const ref = doc(db, "siswa", currentUser.uid, "gami", level);
    const snap = await getDoc(ref);
    const cur = snap.exists() ? snap.data() : { xp:0, koin:0, streak:0, level_karakter:1 };
    cur.xp = (cur.xp || 0) + dXP;
    cur.koin = (cur.koin || 0) + dKoin;
    cur.level_karakter = Math.floor(Math.sqrt(cur.xp / 50)) + 1;
    const today = new Date().toISOString().slice(0,10);
    if (cur.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
      cur.streak = cur.lastDate === yesterday ? (cur.streak || 0) + 1 : 1;
      cur.lastDate = today;
    }
    await setDoc(ref, cur, { merge: true });
    return cur;
  } catch (e) { console.warn("tambahXP failed:", e.message); return null; }
}

/* ========== SRS (hafalan) ========== */
export async function saveSRS(level, kartu) {
  if (!currentUser) return;
  try {
    await setDoc(doc(db, "siswa", currentUser.uid, "srs", level), {
      kartu, updated: serverTimestamp()
    }, { merge: true });
  } catch (e) { console.warn("saveSRS failed:", e.message); }
}
export async function loadSRS(level) {
  if (!currentUser) return {};
  try {
    const snap = await getDoc(doc(db, "siswa", currentUser.uid, "srs", level));
    return snap.exists() ? (snap.data().kartu || {}) : {};
  } catch (e) { console.warn("loadSRS failed:", e.message); return {}; }
}

/* ========== NILAI (riwayat ujian) ========== */
export async function catatNilai(nilai) {
  if (!currentUser) return;
  const ref = collection(db, "siswa", currentUser.uid, "nilai");
  return await addDoc(ref, { ...nilai, tgl: serverTimestamp() });
}

/* ========== ACTIVITY CALENDAR (Part 12) ========== */
// Each activity bumps a date-bucket document. Date is YYYYMMDD in Asia/Bangkok
// so streaks line up with the user's local day. Activity types:
//   kanji | kosakata | latihan | ujian | sesi
function _ymdLocal(d = new Date()){
  // Use the browser's local timezone (which is what the user experiences)
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}${m}${day}`;
}
export async function recordActivity(type, count = 1){
  if (!currentUser) return;
  const allowed = new Set(["kanji","kosakata","latihan","ujian","sesi"]);
  if (!allowed.has(type)) return;
  try {
    const ymd = _ymdLocal();
    const ref = doc(db, "siswa", currentUser.uid, "activity", ymd);
    const snap = await getDoc(ref);
    const prev = snap.exists() ? snap.data() : { kanji:0, kosakata:0, latihan:0, ujian:0, sesi:0 };
    const next = { ...prev, [type]: (prev[type]||0) + count, lastTs: serverTimestamp() };
    await setDoc(ref, next, { merge: true });
  } catch (e) { console.warn("recordActivity failed:", e.message); }
}
export async function listActivity(ym /* YYYYMM */){
  if (!currentUser) return {};
  try {
    const col = collection(db, "siswa", currentUser.uid, "activity");
    const snap = await getDocs(col);
    const result = {};
    snap.forEach(d => {
      if (d.id.startsWith(ym)) result[d.id] = d.data();
    });
    return result;
  } catch (e) { console.warn("listActivity failed:", e.message); return {}; }
}

/* ========== KOMENTAR (public per-item discussion) ========== */
// Composite key per detail page (kanji/kosakata/bunpou + level + number).
function _cmtKey(tipe, lvl, no){ return `${tipe}_${lvl}_${no}`; }
export async function listKomentar(tipe, lvl, no) {
  try {
    const key = _cmtKey(tipe, lvl, no);
    const col = collection(db, "komentar", key, "items");
    const q = query(col, orderBy("created", "desc"), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { console.warn("listKomentar failed:", e.message); return []; }
}
export async function tambahKomentar(tipe, lvl, no, text) {
  if (!currentUser) throw new Error("Harus login dulu");
  const clean = (text || "").toString().trim().slice(0, 1000);
  if (!clean) throw new Error("Teks komentar kosong");
  const key = _cmtKey(tipe, lvl, no);
  const nama = currentSiswaDoc?.nama || currentUser.email?.split("@")[0] || "Anon";
  const kelas = currentSiswaDoc?.kelas || "";
  const col = collection(db, "komentar", key, "items");
  return await addDoc(col, {
    uid: currentUser.uid, nama, kelas, text: clean,
    jlpt: lvl, tipe, no, created: serverTimestamp(),
  });
}
export async function hapusKomentar(tipe, lvl, no, id, ownerUid) {
  if (!currentUser) return;
  if (ownerUid && ownerUid !== currentUser.uid && !isGuru(currentUser)) {
    throw new Error("Bukan komentarmu");
  }
  const key = _cmtKey(tipe, lvl, no);
  await deleteDoc(doc(db, "komentar", key, "items", id));
}

/* ========== RANGKUMAN SENDIRI (personal word collection) ==========
 * Hybrid storage: tries Firestore first, falls back to localStorage so
 * the feature works even when Firestore rules haven't been deployed yet.
 * The two layers are merged on read (Firestore takes precedence per id).
 * When rules are applied later, the next call that succeeds will
 * silently upload the localStorage entries to Firestore.
 * ======================================================== */
function _lsRangKey(uid){ return `shirose-rangkuman-${uid||"guest"}`; }
function _lsRangGet(uid){
  try { return JSON.parse(localStorage.getItem(_lsRangKey(uid)) || "{}"); }
  catch { return {}; }
}
function _lsRangSet(uid, map){
  try { localStorage.setItem(_lsRangKey(uid), JSON.stringify(map)); } catch {}
}
function _safeRangId(jp){
  return jp.replace(/[\.#\$\[\]\/]/g, "_").slice(0, 120);
}

export async function tambahRangkuman({ jp, kana, arti, sumber = null, kategori = null }) {
  if (!currentUser) throw new Error("Harus login dulu");
  if (!jp) throw new Error("Kata kosong");
  const uid = currentUser.uid;
  const id = _safeRangId(jp);
  const now = Date.now();
  const payload = {
    jp, kana: kana || "", arti: arti || "",
    sumber: sumber || "", kategori: kategori || "",
    updatedMs: now,
  };

  // 1) Always write to localStorage first — that way even offline / blocked
  //    sessions never lose a word.
  const local = _lsRangGet(uid);
  local[id] = { ...payload, _local: true };
  _lsRangSet(uid, local);

  // 2) Try Firestore. On success, remove the _local flag so sync is complete.
  try {
    const ref = doc(db, "siswa", uid, "rangkuman", id);
    await setDoc(ref, { ...payload, updated: serverTimestamp() }, { merge: true });
    delete local[id]._local;
    _lsRangSet(uid, local);
    return { id, synced: true };
  } catch (e) {
    // Firestore write blocked (rules not deployed, offline, etc.) — entry
    // stays in localStorage, feature keeps working.
    console.warn("Rangkuman: Firestore write blocked, saved locally:", e.message);
    return { id, synced: false };
  }
}

export async function listRangkuman() {
  if (!currentUser) return [];
  const uid = currentUser.uid;
  // Local first — always available.
  const local = _lsRangGet(uid);
  const merged = new Map();
  Object.entries(local).forEach(([id, v]) => merged.set(id, { id, ...v }));

  // Try to overlay Firestore entries (more authoritative if available)
  try {
    const col = collection(db, "siswa", uid, "rangkuman");
    const snap = await getDocs(col);
    snap.docs.forEach(d => merged.set(d.id, { id: d.id, ...d.data() }));

    // Opportunistic re-upload: if any local entry is marked _local,
    // retry its upload now that Firestore seems reachable.
    for (const [id, v] of Object.entries(local)){
      if (v._local){
        try {
          await setDoc(doc(db, "siswa", uid, "rangkuman", id),
            { jp:v.jp, kana:v.kana||"", arti:v.arti||"", sumber:v.sumber||"", kategori:v.kategori||"", updated: serverTimestamp() },
            { merge: true });
          delete local[id]._local;
        } catch {}
      }
    }
    _lsRangSet(uid, local);
  } catch (e) {
    console.warn("listRangkuman: Firestore read failed, using local only:", e.message);
  }

  // Sort newest first by updatedMs if present, otherwise stable.
  return Array.from(merged.values()).sort((a,b) => (b.updatedMs||0) - (a.updatedMs||0));
}

export async function hapusRangkuman(id) {
  if (!currentUser) return;
  const uid = currentUser.uid;
  // Local delete always.
  const local = _lsRangGet(uid);
  delete local[id];
  _lsRangSet(uid, local);
  // Firestore delete best-effort.
  try { await deleteDoc(doc(db, "siswa", uid, "rangkuman", id)); }
  catch (e) { console.warn("hapusRangkuman: Firestore delete failed:", e.message); }
}

/**
 * Update a few safe fields in siswa.permissions (currently only
 * audio_autoplay; never let clients write unlimited_coins here).
 */
export async function updateSiswaPermissions(partial) {
  if (!currentUser) return;
  const allowed = {};
  if (typeof partial.audio_autoplay === "boolean") allowed["permissions.audio_autoplay"] = partial.audio_autoplay;
  if (!Object.keys(allowed).length) return;
  await updateDoc(doc(db, "siswa", currentUser.uid), allowed);
}

/**
 * Part 5 — reward 10.000 coin ONCE when a student passes an exam.
 * Returns { firstTime: boolean, rewardKoin: number } so caller can toast.
 * Idempotent: a second call for the same kategoriId with any score returns
 * { firstTime: false, rewardKoin: 0 }.
 */
export async function claimUjianLulusReward(kategoriId, skor, lulusMin) {
  if (!currentUser || !kategoriId) return { firstTime:false, rewardKoin:0 };
  if (skor < (lulusMin || 60)) return { firstTime:false, rewardKoin:0 };
  const ref = doc(db, "siswa", currentUser.uid, "ujian_rewards", kategoriId);
  const snap = await getDoc(ref);
  if (snap.exists()) return { firstTime:false, rewardKoin:0 };
  await setDoc(ref, { skor, tgl: serverTimestamp() });
  // Part 5 revised reward: 2.500 coin per ujian lulus (sekali).
  // Semula 10k, user minta diturunin supaya legendary tetap susah dibeli.
  return { firstTime:true, rewardKoin: 2500 };
}

/**
 * Part 5 — reward 1 coin when a SRS card reaches "mastered" (interval >= 21d)
 * for the first time. Called from hafalan after SRS updates.
 * The caller passes the card object (already updated) and we mutate
 * card.mastered_at + card.mastered = true on first mastery.
 * Returns true when a coin should be awarded.
 */
export function detectNewMastery(card) {
  const MASTERY_INTERVAL = 21;
  if (!card || card.mastered) return false;
  if ((card.interval || 0) < MASTERY_INTERVAL) return false;
  if (card.last === "salah") return false;
  card.mastered = true;
  card.mastered_at = Date.now();
  return true;
}
export async function listNilai(limitN = 50) {
  if (!currentUser) return [];
  const q = query(collection(db, "siswa", currentUser.uid, "nilai"),
                  orderBy("tgl","desc"), limit(limitN));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id:d.id, ...d.data() }));
}

/* ========== KATEGORI UJIAN (guru CRUD) ========== */
export async function listKategori(level = null) {
  const col = collection(db, "kategori_ujian");
  const snap = await getDocs(col);
  let arr = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  if (level) arr = arr.filter(k => k.level === level);
  return arr;
}
export async function simpanKategori(data, id = null) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  const col = collection(db, "kategori_ujian");
  if (id) {
    await setDoc(doc(col, id), { ...data, updated: serverTimestamp() }, { merge: true });
    return id;
  } else {
    const ref = await addDoc(col, { ...data, created: serverTimestamp() });
    return ref.id;
  }
}
export async function hapusKategori(id) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  await deleteDoc(doc(db, "kategori_ujian", id));
}

/* ========== SOAL (per kategori) ========== */
export async function listSoal(kategoriId) {
  const col = collection(db, "soal", kategoriId, "items");
  const snap = await getDocs(col);
  return snap.docs.map(d => ({ id:d.id, ...d.data() }));
}
export async function tambahSoalBatch(kategoriId, soalArr) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  const batches = [];
  for (let i = 0; i < soalArr.length; i += 400) {
    batches.push(soalArr.slice(i, i + 400));
  }
  let total = 0;
  for (const batch of batches) {
    const b = writeBatch(db);
    batch.forEach(s => {
      const r = doc(collection(db, "soal", kategoriId, "items"));
      b.set(r, { ...s, created: serverTimestamp() });
    });
    await b.commit();
    total += batch.length;
  }
  return total;
}
export async function hapusSoal(kategoriId, soalId) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  await deleteDoc(doc(db, "soal", kategoriId, "items", soalId));
}
export async function editSoal(kategoriId, soalId, data) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  await updateDoc(doc(db, "soal", kategoriId, "items", soalId), data);
}

/* ========== ITEM SHOP (seedable) ========== */
export async function listShopItems(kategori = null) {
  if (kategori) {
    const col = collection(db, "item_shop", kategori, "items");
    const snap = await getDocs(col);
    return snap.docs.map(d => ({ id:d.id, kategori, ...d.data() }));
  }
  // All categories
  const result = [];
  for (const k of ["rambut","pakaian","sepatu","aksesori","item_tangan","aura"]) {
    try {
      const col = collection(db, "item_shop", k, "items");
      const snap = await getDocs(col);
      snap.docs.forEach(d => result.push({ id:d.id, kategori:k, ...d.data() }));
    } catch(e) { /* empty */ }
  }
  return result;
}

/* ========== CHOUKAI ========== */
export async function listChoukai(level) {
  const col = collection(db, "choukai", level, "items");
  const snap = await getDocs(col);
  return snap.docs.map(d => ({ id:d.id, ...d.data() }));
}
export async function tambahChoukaiBatch(level, soalArr) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  let total = 0;
  for (let i = 0; i < soalArr.length; i += 400) {
    const b = writeBatch(db);
    soalArr.slice(i, i + 400).forEach(s => {
      const r = doc(collection(db, "choukai", level, "items"));
      b.set(r, { ...s, created: serverTimestamp() });
      total++;
    });
    await b.commit();
  }
  return total;
}

/* ========== SISWA (guru dashboard) ========== */
export async function listSiswa() {
  if (!userIsGuru()) throw new Error("Hanya guru");
  try {
    const snap = await getDocs(collection(db, "siswa"));
    return snap.docs.map(d => ({ uid:d.id, ...d.data() }));
  } catch (e){
    // Firestore most likely rejected the collection read because the guru's
    // siswa doc still has role != "guru" (bootstrap not applied). Give a
    // clearer message so the user knows the Firebase Console step to take.
    if (e && (e.code === "permission-denied" || /permission/i.test(e.message || ""))){
      throw new Error("Firestore menolak baca daftar siswa. Update Firestore Rules dari firestore.rules.example (Firebase Console → Firestore → Rules → Publish), lalu refresh halaman.");
    }
    throw e;
  }
}

/**
 * Diagnosa cepat untuk guru: cek permission tulis/baca di titik-titik penting
 * tanpa benar-benar memodifikasi data. Dipakai tombol "Diagnosa Firestore Rules"
 * di teacher dashboard — guru bisa lihat mana rule yang block dan tahu harus
 * publish ulang firestore.rules.example.
 * Return: array { op, path, ok, error }
 */
export async function diagnosaRules(){
  const results = [];
  const check = async (op, path, fn) => {
    try { await fn(); results.push({ op, path, ok:true }); }
    catch(e){ results.push({ op, path, ok:false, error: e.code || e.message }); }
  };
  if (!currentUser){ return [{ op:"auth", ok:false, error:"Belum login" }]; }
  const uid = currentUser.uid;
  // Baca siswa doc sendiri
  await check("read", `/siswa/${uid}`, () => getDoc(doc(db, "siswa", uid)));
  // Baca koleksi siswa (guru only)
  await check("list", `/siswa (all)`, () => getDocs(collection(db, "siswa")));
  // Baca subkoleksi activity sendiri
  await check("read", `/siswa/${uid}/activity`, () => getDocs(collection(db, "siswa", uid, "activity")));
  // Baca kategori_ujian
  await check("read", `/kategori_ujian`, () => getDocs(collection(db, "kategori_ujian")));
  // Coba tulis timestamp ke siswa doc sendiri (non-destruktif, hanya update aktif)
  await check("write", `/siswa/${uid}.aktif`, () => updateDoc(doc(db, "siswa", uid), { aktif: serverTimestamp() }));
  return results;
}
export async function updateAksesSiswa(uid, aksesLevel) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  await updateDoc(doc(db, "siswa", uid), { aksesLevel });
}
export async function updateKelasSiswa(uid, kelas) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  await updateDoc(doc(db, "siswa", uid), { kelas });
}
// Bulk-assign: put each uid into the given kelas (or "" to unassign).
export async function assignSiswaKeKelas(uids, namaKelas) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  if (!Array.isArray(uids) || uids.length === 0) return 0;
  const b = writeBatch(db);
  uids.forEach(uid => b.update(doc(db, "siswa", uid), { kelas: namaKelas || "" }));
  await b.commit();
  return uids.length;
}
export async function getSiswaGami(uid) {
  if (!userIsGuru() && uid !== currentUser?.uid) throw new Error("Tidak diizinkan");
  const result = {};
  for (const lvl of ["n5","n4","n3","n2","n1"]) {
    const s = await getDoc(doc(db, "siswa", uid, "gami", lvl));
    result[lvl] = s.exists() ? s.data() : null;
  }
  return result;
}
// Teacher view: all exam records for a specific student (newest first).
export async function listNilaiOf(uid, limitN = 100) {
  if (!userIsGuru() && uid !== currentUser?.uid) throw new Error("Tidak diizinkan");
  const q = query(collection(db, "siswa", uid, "nilai"), orderBy("tgl","desc"), limit(limitN));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
// Teacher view: count SRS mastery per level. Returns { n5:{mastered,total}, ... }
export async function getSiswaMasteryCounts(uid) {
  if (!userIsGuru() && uid !== currentUser?.uid) throw new Error("Tidak diizinkan");
  const result = {};
  for (const lvl of ["n5","n4","n3","n2","n1"]) {
    const snap = await getDoc(doc(db, "siswa", uid, "srs", lvl));
    const kartu = snap.exists() ? (snap.data().kartu || {}) : {};
    const total = Object.keys(kartu).length;
    const mastered = Object.values(kartu).filter(c => c?.mastered).length;
    result[lvl] = { mastered, total };
  }
  return result;
}

/* ========== KELAS ========== */
export async function listKelas() {
  const snap = await getDocs(collection(db, "kelas"));
  return snap.docs.map(d => ({ id:d.id, ...d.data() }));
}
export async function hapusKelas(id) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  await deleteDoc(doc(db, "kelas", id));
}
export async function simpanKelas(data, id = null) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  if (id) {
    await setDoc(doc(db, "kelas", id), data, { merge: true });
    return id;
  } else {
    const r = await addDoc(collection(db, "kelas"), data);
    return r.id;
  }
}

/* ========== LEADERBOARD ========== */
export async function leaderboard(level, topN = 20) {
  // Per-level leaderboard (original behaviour, backward compatible)
  try {
    const snap = await getDocs(collection(db, "siswa"));
    const result = [];
    for (const d of snap.docs) {
      try {
        const g = await getDoc(doc(db, "siswa", d.id, "gami", level));
        if (g.exists()) {
          const sdata = d.data();
          result.push({
            uid: d.id,
            nama: sdata.nama || "Anonim",
            kelas: sdata.kelas || "",
            avatar: sdata.karakter?.equipped || null,
            ...g.data()
          });
        }
      } catch(e) {}
    }
    result.sort((a,b) => (b.xp || 0) - (a.xp || 0));
    return result.slice(0, topN);
  } catch (e) { console.warn("leaderboard failed:", e.message); return []; }
}

/**
 * Part 15 — Global leaderboard variants:
 *   kind = "jlpt-{level}" (default) — per-JLPT XP
 *   kind = "global"                 — sum XP across all 5 JLPTs
 *   kind = "weekly" / "monthly"     — ranked by activity count in window
 */
export async function leaderboardAdvanced(kind = "global", topN = 20) {
  try {
    const snap = await getDocs(collection(db, "siswa"));
    const result = [];
    for (const d of snap.docs) {
      const sdata = d.data();
      const entry = {
        uid: d.id,
        nama: sdata.nama || "Anonim",
        kelas: sdata.kelas || "",
        avatar: sdata.karakter?.equipped || null,
        score: 0, meta: "",
      };
      try {
        if (kind.startsWith("jlpt-")){
          const lvl = kind.slice(5);
          const g = await getDoc(doc(db, "siswa", d.id, "gami", lvl));
          if (!g.exists()) continue;
          const gd = g.data();
          entry.score = gd.xp || 0;
          entry.level_karakter = gd.level_karakter || 1;
          entry.streak = gd.streak || 0;
          entry.meta = `Lv ${gd.level_karakter||1} · ${gd.streak||0}🔥`;
        } else if (kind === "global"){
          let total = 0, maxStreak = 0, maxLv = 1;
          for (const lvl of ["n5","n4","n3","n2","n1"]){
            const g = await getDoc(doc(db, "siswa", d.id, "gami", lvl));
            if (!g.exists()) continue;
            const gd = g.data();
            total += gd.xp || 0;
            if ((gd.streak||0) > maxStreak) maxStreak = gd.streak;
            if ((gd.level_karakter||1) > maxLv) maxLv = gd.level_karakter;
          }
          if (total === 0) continue;
          entry.score = total;
          entry.level_karakter = maxLv;
          entry.streak = maxStreak;
          entry.meta = `Lv ${maxLv} · ${maxStreak}🔥`;
        } else if (kind === "weekly" || kind === "monthly"){
          // Sum activity counts within window
          const now = new Date();
          const windowDays = kind === "weekly" ? 7 : 30;
          const col = await getDocs(collection(db, "siswa", d.id, "activity"));
          let total = 0, days = 0;
          col.forEach(ad => {
            const ymd = ad.id;
            if (ymd.length !== 8) return;
            const y = +ymd.slice(0,4), m = +ymd.slice(4,6)-1, da = +ymd.slice(6,8);
            const diff = (now - new Date(y, m, da)) / 86400000;
            if (diff >= 0 && diff < windowDays){
              const a = ad.data();
              const dayTotal = (a.kanji||0)+(a.kosakata||0)+(a.latihan||0)+(a.ujian||0);
              if (dayTotal > 0){ total += dayTotal; days++; }
            }
          });
          if (total === 0) continue;
          entry.score = total;
          entry.meta = `${days} hari aktif`;
        }
      } catch(e){ continue; }
      result.push(entry);
    }
    result.sort((a,b) => (b.score||0) - (a.score||0));
    return result.slice(0, topN);
  } catch (e) { console.warn("leaderboardAdvanced failed:", e.message); return []; }
}

/* ========== MISI HARIAN ========== */
export async function getMisiHariIni() {
  if (!currentUser) return null;
  const tgl = new Date().toISOString().slice(0,10);
  const ref = doc(db, "siswa", currentUser.uid, "misi_harian", tgl);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  // Generate 3 misi baru
  const misiPool = [
    { id: "hafalan_10", nama: "Hafalkan 10 kata", target: 10, reward_xp: 30, reward_koin: 10 },
    { id: "benar_20", nama: "Jawab benar 20 soal", target: 20, reward_xp: 50, reward_koin: 20 },
    { id: "selesai_sesi", nama: "Selesaikan 1 sesi ujian", target: 1, reward_xp: 40, reward_koin: 15 },
    { id: "streak_lanjut", nama: "Jaga streak hari ini", target: 1, reward_xp: 20, reward_koin: 5 },
    { id: "kanji_5", nama: "Pelajari 5 kanji baru", target: 5, reward_xp: 25, reward_koin: 10 },
    { id: "bunpou_3", nama: "Pelajari 3 bunpou", target: 3, reward_xp: 30, reward_koin: 10 },
  ];
  const shuffled = [...misiPool].sort(() => Math.random() - 0.5);
  const misi = shuffled.slice(0, 3).map(m => ({ ...m, progres: 0 }));
  const data = { misi, claimed: [] };
  await setDoc(ref, data);
  return data;
}
export async function updateMisiProgres(misiId, delta = 1) {
  if (!currentUser) return;
  try {
    const tgl = new Date().toISOString().slice(0,10);
    const ref = doc(db, "siswa", currentUser.uid, "misi_harian", tgl);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    const m = data.misi.find(x => x.id === misiId);
    if (!m || data.claimed.includes(misiId)) return;
    m.progres = Math.min((m.progres || 0) + delta, m.target);
    await setDoc(ref, data);
    return m;
  } catch (e) { console.warn("updateMisiProgres failed:", e.message); }
}
export async function claimMisi(misiId, level = "n5") {
  if (!currentUser) return;
  const tgl = new Date().toISOString().slice(0,10);
  const ref = doc(db, "siswa", currentUser.uid, "misi_harian", tgl);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = snap.data();
  const m = data.misi.find(x => x.id === misiId);
  if (!m || data.claimed.includes(misiId) || m.progres < m.target) return;
  data.claimed.push(misiId);
  await setDoc(ref, data);
  await tambahXP(level, m.reward_xp, m.reward_koin);
  return m;
}

export { db, auth };
