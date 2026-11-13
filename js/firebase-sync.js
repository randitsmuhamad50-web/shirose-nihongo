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

import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, onAuthStateChanged,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInAnonymously,
  signOut, sendPasswordResetEmail,
  setPersistence, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence,
  indexedDBLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, onSnapshot, query, orderBy, limit, addDoc,
  where, writeBatch, serverTimestamp, FieldPath, deleteField, documentId
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

// Branding publik. Email moderator di atas tetap dipakai INTERNAL untuk
// autentikasi/role — jangan pernah ditampilkan ke siswa. Nama tampilan
// publik akun moderator/owner selalu memakai brand ini.
export const BRAND_NAME = "bysswnoou";
function _isOwnerEmail(email){ return !!email && (email === GURU_EMAIL || email === DEVELOPER_EMAIL); }
// Nama lama yang bocor dari prefix email moderator (mis. "randitsmuhamad50").
function _isLegacyOwnerNama(nama){
  if (!nama) return true;
  const ownerPrefixes = [GURU_EMAIL, DEVELOPER_EMAIL].map(e => e.split("@")[0].toLowerCase());
  const n = String(nama).toLowerCase();
  return ownerPrefixes.includes(n) || n.includes("randitsmuhamad");
}
// Bersihkan nama lama yang tersimpan di Firestore (mis. komentar lama).
function _cleanNama(nama){
  if (!nama) return nama;
  const ownerPrefixes = [GURU_EMAIL, DEVELOPER_EMAIL].map(e => e.split("@")[0].toLowerCase());
  const n = String(nama).toLowerCase();
  return (ownerPrefixes.includes(n) || n.includes("randitsmuhamad")) ? BRAND_NAME : nama;
}
/** Nama tampilan publik yang aman untuk user mana pun (tidak pernah membocorkan email owner). */
export function publicNama(u, siswaDoc){
  if (u && _isOwnerEmail(u.email)) return BRAND_NAME;
  return siswaDoc?.nama || (u?.email ? u.email.split("@")[0] : "") || "Anon";
}

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
// Alasan login terakhir ditolak: "not_registered" | "disabled" | null.
// Dibaca halaman login untuk menampilkan pesan yang jelas.
export let lastAuthDenied = null;
export function getLastAuthDenied(){ const r = lastAuthDenied; lastAuthDenied = null; return r; }

export function onAuth(cb) {
  if (!authListenerSet) {
    authListenerSet = true;
    onAuthStateChanged(auth, async (u) => {
      currentUser = u;
      if (u) {
        await ensureSiswaDoc(u);
        // Pendaftaran ditutup: akun yang tidak punya profil di Firestore
        // (belum didaftarkan guru/moderator), akun tamu, dan akun yang
        // dinonaktifkan langsung dikeluarkan. Firestore Rules juga menolak
        // semua akses data untuk akun seperti ini (backend enforcement).
        if (lastSiswaDocStatus === "not_registered" || lastSiswaDocStatus === "disabled") {
          lastAuthDenied = lastSiswaDocStatus;
          currentUser = null; currentSiswaDoc = null;
          try { await signOut(auth); } catch(_) {}
          return; // onAuthStateChanged akan terpanggil lagi dengan u = null
        }
      } else currentSiswaDoc = null;
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
// Nilai: "ok" | "write_blocked" | "read_blocked" | "not_registered" | "disabled" | null
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

  // Nama default: untuk tamu (anonymous user, u.email == null) kasih
  // nama "Tamu-xxxx" biar beda dari akun siswa asli di dashboard guru.
  const emailStr = u.email || "";
  const defaultNama = u.isAnonymous
    ? `Tamu-${u.uid.slice(0, 5)}`
    : (_isOwnerEmail(emailStr) ? BRAND_NAME
       : (emailStr ? emailStr.split("@")[0] : `User-${u.uid.slice(0, 5)}`));
  const base = {
    nama: _isOwnerEmail(emailStr) ? BRAND_NAME : (extra.nama || u.displayName || defaultNama),
    email: emailStr,
    isTamu: !!u.isAnonymous,
    kelas: "",
    // Akses JLPT per siswa diatur guru di teacher.html (field aksesLevel).
    // Hanya akun moderator yang dibuat otomatis di sini, dengan akses penuh.
    aksesLevel: { n5:true, n4:true, n3:true, n2:true, n1:true },
    status: "aktif",
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
    if (!snap.exists() && !isOwner) {
      // Pendaftaran ditutup: profil siswa HANYA dibuat oleh guru/moderator
      // lewat teacher.html (buatAkunSiswa). Akun Auth tanpa profil = belum
      // terdaftar → ditolak (lihat onAuth).
      currentSiswaDoc = null;
      lastSiswaDocStatus = "not_registered";
      return;
    }
    if (!snap.exists()) {
      // Bootstrap akun moderator/owner pertama kali.
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
      if (!isOwner && currentSiswaDoc.status === "nonaktif"){
        currentSiswaDoc = null;
        lastSiswaDocStatus = "disabled";
        return;
      }
      lastSiswaDocStatus = "ok";
      updateDoc(ref, { aktif: serverTimestamp() }).catch(()=>{});
      // aksesLevel dibaca apa adanya dari database — TIDAK di-upgrade
      // otomatis. Perubahan akses oleh guru langsung berlaku saat login.
      if (!currentSiswaDoc.aksesLevel) currentSiswaDoc.aksesLevel = { n5:false, n4:false, n3:false, n2:false, n1:false };
    }

    // Rebranding: nama publik akun moderator lama masih "randitsmuhamad50"
    // (prefix email). Ganti ke BRAND_NAME supaya tidak tampil di leaderboard
    // / komentar / daftar siswa. Email TIDAK diubah. Rules mengizinkan user
    // mengubah `nama` dokumennya sendiri.
    if (_isOwnerEmail(emailStr) && _isLegacyOwnerNama(currentSiswaDoc.nama)){
      currentSiswaDoc.nama = BRAND_NAME;
      updateDoc(ref, { nama: BRAND_NAME }).catch(e => {
        console.warn("rename owner nama blocked:", e?.code);
      });
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
  // Pendaftaran mandiri DITUTUP — akun siswa dibuat guru/moderator dari
  // teacher.html. Firestore Rules juga menolak pembuatan profil oleh siswa.
  throw new Error("Pendaftaran mandiri ditutup. Minta akun ke guru/moderator.");
}
async function _daftarLamaTidakDipakai(email, pwd, nama) {
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

/**
 * Masuk sebagai Tamu (anonymous Firebase Auth user). Perlu Anonymous
 * provider di-enable di Firebase Console → Authentication → Sign-in
 * method. Kalau belum, Firebase throw auth/admin-restricted-operation
 * atau auth/operation-not-allowed — caller tampilkan pesan panduan.
 * Tamu dapat akses JLPT penuh (thanks to workaround Nov 2026) tapi
 * progres tidak permanen antar device.
 */
export async function masukTamu(){
  throw new Error("Mode tamu ditutup. Minta akun ke guru/moderator.");
}
async function _masukTamuLamaTidakDipakai(){
  const cred = await signInAnonymously(auth);
  // Siswa doc otomatis dibuat oleh onAuthStateChanged → ensureSiswaDoc.
  // Nama default "Tamu-xxxxx" biar guru tahu kalau ini anonymous.
  return cred;
}
export function isGuestUser(){
  return !!(currentUser && currentUser.isAnonymous);
}

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

/* ========== HASIL UJIAN JLPT CENTER ==========
 * Disimpan di siswa/{uid}/jlpt_hasil/{autoId} — sub-koleksi milik siswa,
 * sudah tercakup Firestore Rules yang ada (pemilik + guru boleh baca,
 * siswa lain TIDAK bisa). Tidak perlu mengubah rules.
 */
export async function simpanHasilJLPT(hasil) {
  if (!currentUser) throw new Error("Belum login");
  const ref = collection(db, "siswa", currentUser.uid, "jlpt_hasil");
  const d = await addDoc(ref, { ...hasil, uid: currentUser.uid, tgl: serverTimestamp() });
  return d.id;
}
export async function listHasilJLPT(limitN = 100) {
  if (!currentUser) return [];
  const q = query(collection(db, "siswa", currentUser.uid, "jlpt_hasil"), orderBy("tgl", "desc"), limit(limitN));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function listHasilJLPTOf(uid, limitN = 100) {
  if (!userIsGuru() && uid !== currentUser?.uid) throw new Error("Tidak diizinkan");
  const q = query(collection(db, "siswa", uid, "jlpt_hasil"), orderBy("tgl", "desc"), limit(limitN));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function getHasilJLPT(uid, id) {
  if (!userIsGuru() && uid !== currentUser?.uid) throw new Error("Tidak diizinkan");
  const s = await getDoc(doc(db, "siswa", uid, "jlpt_hasil", id));
  return s.exists() ? { id: s.id, ...s.data() } : null;
}

/* ========== PROGRES KANA & LATIHAN MENULIS ==========
 * Disimpan di siswa/{uid}/kana_progres/data — sub-koleksi milik siswa, sudah
 * tercakup Firestore Rules yang ada (pemilik + guru boleh baca/tulis, siswa
 * lain TIDAK bisa). Tidak perlu mengubah rules.
 * Isi: { v, u, hira{}, kata{}, kanji{n5..n1{}}, flash[], tes[] }  (lihat js/kana-center.js)
 */
export async function loadKanaProgres(uidOverride = null) {
  const id = uidOverride || currentUser?.uid;
  if (!id) return null;
  if (uidOverride && uidOverride !== currentUser?.uid && !userIsGuru()) throw new Error("Tidak diizinkan");
  const snap = await getDoc(doc(db, "siswa", id, "kana_progres", "data"));
  return snap.exists() ? snap.data() : null;
}
export async function saveKanaProgres(data) {
  if (!currentUser) return;
  await setDoc(doc(db, "siswa", currentUser.uid, "kana_progres", "data"),
    { ...data, uid: currentUser.uid, updated: serverTimestamp() });
}

/* ========== SSW 特定技能 ==========
 * ssw_bidang/{slug}            konfigurasi bidang (guru menulis, siswa terdaftar membaca):
 *                              { nama, jp, aktif, urut, tema, gambar, hasContent, bab:{babId:"draft|published|hidden"} }
 * siswa/{uid}/ssw_progres/{slug} progres siswa — sub-koleksi milik siswa, sudah tercakup rules {sub}/{docId}.
 * Menonaktifkan bidang TIDAK menghapus progres (dokumen progres tidak disentuh).
 */
export async function loadSswBidang() {
  const snap = await getDocs(collection(db, "ssw_bidang"));
  return snap.docs.map(d => ({ slug: d.id, ...d.data() }));
}
export async function saveSswBidang(slug, data) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  const clean = { ...data }; delete clean.slug;
  await setDoc(doc(db, "ssw_bidang", slug), { ...clean, updated: serverTimestamp(), updatedBy: currentUser.uid }, { merge: true });
}
export async function deleteSswBidang(slug) {
  if (!userIsAdmin() && !userIsDeveloper()) throw new Error("Hanya admin");
  await deleteDoc(doc(db, "ssw_bidang", slug));
}
export async function loadSswProgres(slug, uidOverride = null) {
  const id = uidOverride || currentUser?.uid;
  if (!id) return null;
  if (uidOverride && uidOverride !== currentUser?.uid && !userIsGuru()) throw new Error("Tidak diizinkan");
  const snap = await getDoc(doc(db, "siswa", id, "ssw_progres", slug));
  return snap.exists() ? snap.data() : null;
}
export async function saveSswProgres(slug, data) {
  if (!currentUser) return;
  await setDoc(doc(db, "siswa", currentUser.uid, "ssw_progres", slug),
    { ...data, uid: currentUser.uid, updated: serverTimestamp() });
}

/* ========== MENSETSU 面接 — hasil simulasi wawancara ==========
 * Disimpan di siswa/{uid}/mensetsu_hasil/{autoId} — sub-koleksi milik siswa, sudah
 * tercakup Firestore Rules yang ada (pemilik + guru boleh baca; siswa lain TIDAK).
 * Hanya TRANSKRIP TEKS + nilai. Rekaman suara tidak pernah disimpan.
 */
export async function getIdToken() {
  return currentUser ? await currentUser.getIdToken() : null;
}
export async function simpanHasilMensetsu(hasil) {
  if (!currentUser) throw new Error("Belum login");
  const { id, ...rest } = hasil || {};
  const clean = JSON.parse(JSON.stringify(rest));   // buang undefined (Firestore menolak)
  const d = await addDoc(collection(db, "siswa", currentUser.uid, "mensetsu_hasil"), { ...clean, uid: currentUser.uid, tgl: serverTimestamp() });
  return d.id;
}
export async function listHasilMensetsu(limitN = 50) {
  if (!currentUser) return [];
  const q = query(collection(db, "siswa", currentUser.uid, "mensetsu_hasil"), orderBy("tgl", "desc"), limit(limitN));
  return (await getDocs(q)).docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function listHasilMensetsuOf(uid, limitN = 100) {
  if (!userIsGuru() && uid !== currentUser?.uid) throw new Error("Tidak diizinkan");
  const q = query(collection(db, "siswa", uid, "mensetsu_hasil"), orderBy("tgl", "desc"), limit(limitN));
  return (await getDocs(q)).docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function hapusHasilMensetsu(id) {
  if (!currentUser) throw new Error("Belum login");
  await deleteDoc(doc(db, "siswa", currentUser.uid, "mensetsu_hasil", id));
}
export async function hapusSemuaHasilMensetsu() {
  if (!currentUser) throw new Error("Belum login");
  const docs = (await getDocs(collection(db, "siswa", currentUser.uid, "mensetsu_hasil"))).docs;
  for (let i = 0; i < docs.length; i += 400) {
    const b = writeBatch(db); docs.slice(i, i + 400).forEach(d => b.delete(d.ref)); await b.commit();
  }
  return docs.length;
}

/* ========== MENSETSU 面接 — persiapan jawaban + koreksi AI ==========
 * siswa/{uid}/mensetsu_persiapan/{bidang} → { sel:[id], order:[id], answers:{[id]:{asli,koreksi,diterima,ev,riwayat[],status,updated}}, updated }
 * Milik siswa (pemilik + guru boleh baca) — tercakup Rules sub-koleksi siswa yang ada.
 */
export async function getPersiapanMensetsu(bidang) {
  if (!currentUser) return null;
  const s = await getDoc(doc(db, "siswa", currentUser.uid, "mensetsu_persiapan", bidang));
  return s.exists() ? s.data() : null;
}
export async function setPersiapanMensetsu(bidang, data) {
  if (!currentUser) throw new Error("Belum login");
  const clean = JSON.parse(JSON.stringify(data || {}));
  await setDoc(doc(db, "siswa", currentUser.uid, "mensetsu_persiapan", bidang), { ...clean, uid: currentUser.uid, bidang, tgl: serverTimestamp() });
}
export async function listPersiapanMensetsuOf(uid) {
  if (!userIsGuru() && uid !== currentUser?.uid) throw new Error("Tidak diizinkan");
  return (await getDocs(collection(db, "siswa", uid, "mensetsu_persiapan"))).docs.map(d => ({ id: d.id, ...d.data() }));
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
    // Hanya baca dokumen bulan yang diminta (id = YYYYMMDD), bukan seluruh riwayat.
    const col = collection(db, "siswa", currentUser.uid, "activity");
    const q = query(col, where(documentId(), ">=", ym), where(documentId(), "<", ym + "\uf8ff"));
    const snap = await getDocs(q);
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
    return snap.docs.map(d => { const x = d.data(); return { id: d.id, ...x, nama: _cleanNama(x.nama) }; });
  } catch (e) { console.warn("listKomentar failed:", e.message); return []; }
}
export async function tambahKomentar(tipe, lvl, no, text) {
  if (!currentUser) throw new Error("Harus login dulu");
  const clean = (text || "").toString().trim().slice(0, 1000);
  if (!clean) throw new Error("Teks komentar kosong");
  const key = _cmtKey(tipe, lvl, no);
  const nama = publicNama(currentUser, currentSiswaDoc);
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

/* ========== KELAS KATA KOSAKATA (override guru) ==========
   kosakata_pos/{lvl} = { map: { "<kata>": ["KK"|"KB"|"KSい"|"KSな", ...] | ["-"] } }
   Data JSON asli tidak diubah; override dipasang di memori saat Materi/Hafalan dimuat. */
export async function getPosOverride(lvl) {
  const snap = await getDoc(doc(db, "kosakata_pos", lvl));
  return snap.exists() ? (snap.data().map || {}) : {};
}
export async function setPosOverride(lvl, kata, tags) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  await setDoc(doc(db, "kosakata_pos", lvl), { map: { [kata]: (tags && tags.length) ? tags : ["-"] }, updated: serverTimestamp() }, { merge: true });
}
export async function resetPosOverride(lvl, kata) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  await updateDoc(doc(db, "kosakata_pos", lvl), new FieldPath("map", kata), deleteField());
}

/* ========== SOAL (per kategori / paket soal) ========== */
// Urutan soal harus dipertahankan sesuai input Excel — Firestore tidak
// menjamin urutan dari getDocs, jadi kita simpan field `urutan` di tiap
// soal dan sort di client.
export async function listSoal(kategoriId) {
  const col = collection(db, "soal", kategoriId, "items");
  const snap = await getDocs(col);
  const arr = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  arr.sort((a, b) => {
    const au = typeof a.urutan === "number" ? a.urutan : Infinity;
    const bu = typeof b.urutan === "number" ? b.urutan : Infinity;
    if (au !== bu) return au - bu;
    // Fallback stable: timestamp created lalu id
    const at = a.created?.toMillis ? a.created.toMillis() : 0;
    const bt = b.created?.toMillis ? b.created.toMillis() : 0;
    if (at !== bt) return at - bt;
    return (a.id || "").localeCompare(b.id || "");
  });
  return arr;
}
// Hitung berapa soal yang sudah ada — buat tahu nomor urut berikutnya saat
// tambah manual. Tidak error kalau kategori belum ada.
async function _nextUrutan(kategoriId){
  try {
    const existing = await listSoal(kategoriId);
    const maxU = existing.reduce((m, s) => Math.max(m, typeof s.urutan === "number" ? s.urutan : 0), 0);
    return maxU + 1;
  } catch(e) { return 1; }
}
export async function tambahSoalBatch(kategoriId, soalArr) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  // Jika caller tidak kasih `urutan`, kita lanjutkan dari max yang sudah ada.
  const needAssign = soalArr.some(s => typeof s.urutan !== "number");
  let base = 0;
  if (needAssign) base = await _nextUrutan(kategoriId);
  const withUrutan = soalArr.map((s, i) => ({
    ...s,
    urutan: typeof s.urutan === "number" ? s.urutan : (base + i),
  }));
  const batches = [];
  for (let i = 0; i < withUrutan.length; i += 400) {
    batches.push(withUrutan.slice(i, i + 400));
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
const LEVELS = ["n5","n4","n3","n2","n1"];
function _normAkses(a){ const r = {}; LEVELS.forEach(l => r[l] = !!(a && a[l])); return r; }
function _profilBaru(uid, email, nama, kelas, aksesLevel, role){
  return {
    nama: (nama || "").trim() || email.split("@")[0],
    email, isTamu: false, kelas: kelas || "",
    aksesLevel: _normAkses(aksesLevel || { n5:true }),
    role: role || "student",
    status: "aktif",
    dibuatOleh: currentUser?.uid || null,
    karakter: {
      equipped: { rambut:null, pakaian:"seragam_default", sepatu:"shoes_default", aksesori:"none", item_tangan:"none", aura:"none" },
      inventory: ["seragam_default", "shoes_default", "none"],
      skinTone: "light", hairColor: "#2a1810",
    },
    created: serverTimestamp(),
  };
}
/**
 * Guru/moderator membuat akun baru (Firebase Auth + profil Firestore).
 * Pakai instance Firebase App KEDUA dengan persistence in-memory supaya
 * sesi login guru di tab ini tidak tergantikan oleh akun yang baru dibuat.
 * role "guru" hanya boleh dibuat oleh admin/moderator.
 */
export async function buatAkunSiswa({ email, password, nama, kelas, aksesLevel, role = "student" }) {
  if (!userIsGuru()) throw new Error("Hanya guru/moderator");
  if (role !== "student" && !userIsAdmin()) throw new Error("Hanya moderator yang bisa membuat akun guru");
  if (!["student","guru"].includes(role)) throw new Error("Role tidak valid");
  email = (email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Email tidak valid");
  if (!password || password.length < 6) throw new Error("Password minimal 6 karakter");
  const sec = initializeApp(firebaseConfig, "akun-creator-" + Date.now());
  const secAuth = getAuth(sec);
  try {
    await setPersistence(secAuth, inMemoryPersistence);
    const cred = await createUserWithEmailAndPassword(secAuth, email, password);
    const uid = cred.user.uid;
    try {
      await setDoc(doc(db, "siswa", uid), _profilBaru(uid, email, nama, kelas, aksesLevel, role));
    } catch (e) {
      // Rollback supaya tidak ada akun Auth yatim tanpa profil.
      try { await cred.user.delete(); } catch(_){}
      throw new Error("Akun dibatalkan — gagal menyimpan profil: " + (e.code || e.message));
    }
    return uid;
  } catch (e) {
    if (e.code === "auth/email-already-in-use") throw new Error("Email sudah terdaftar di sistem login.");
    if (e.code === "auth/weak-password") throw new Error("Password terlalu lemah (min. 6 karakter).");
    throw e;
  } finally {
    try { await signOut(secAuth); } catch(_){}
    try { await deleteApp(sec); } catch(_){}
  }
}
/** Daftarkan akun Auth yang SUDAH ada (punya UID) tapi belum punya profil. */
export async function daftarkanAkunExisting({ uid, email, nama, kelas, aksesLevel }) {
  if (!userIsGuru()) throw new Error("Hanya guru/moderator");
  const ref = doc(db, "siswa", uid);
  if ((await getDoc(ref)).exists()) throw new Error("Profil sudah ada");
  await setDoc(ref, _profilBaru(uid, (email||"").trim().toLowerCase(), nama, kelas, aksesLevel, "student"));
  return uid;
}
/**
 * Guru/moderator menghapus akun siswa: semua data belajarnya (sub-koleksi) lalu
 * profil siswa/{uid}. Catatan: record login di Firebase Authentication TIDAK ikut
 * terhapus (itu butuh Admin SDK / Firebase Console). Tanpa profil, akun itu tidak
 * bisa membaca data apa pun (status "belum terdaftar" di Rules).
 */
const _SUB_SISWA = ["activity","gami","jlpt_hasil","kana_progres","mensetsu_hasil","mensetsu_persiapan","misi_harian","nilai","rangkuman","srs","ujian_rewards"];
export async function hapusSiswa(uid) {
  if (!userIsGuru()) throw new Error("Hanya guru/moderator");
  if (!uid) throw new Error("UID kosong");
  if (currentUser && uid === currentUser.uid) throw new Error("Tidak bisa menghapus akun sendiri");
  const ref = doc(db, "siswa", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return 0;
  const data = snap.data() || {};
  const role = data.role || "student";
  if (role === "developer" || _isOwnerEmail(data.email)) throw new Error("Akun moderator tidak bisa dihapus");
  if (role !== "student" && !userIsAdmin()) throw new Error("Hanya moderator yang bisa menghapus akun guru");
  let n = 0;
  for (const sub of _SUB_SISWA) {
    const docs = (await getDocs(collection(db, "siswa", uid, sub))).docs;
    for (let i = 0; i < docs.length; i += 400) {
      const b = writeBatch(db);
      docs.slice(i, i + 400).forEach(d => b.delete(d.ref));
      await b.commit();
      n += Math.min(400, docs.length - i);
    }
  }
  await deleteDoc(ref);
  return n + 1;
}
/** Aktifkan / nonaktifkan akun (akun nonaktif tidak bisa login & ditolak Rules). */
export async function setStatusSiswa(uid, aktif) {
  if (!userIsGuru()) throw new Error("Hanya guru/moderator");
  await updateDoc(doc(db, "siswa", uid), { status: aktif ? "aktif" : "nonaktif" });
}
export async function updateAksesSiswa(uid, aksesLevel) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  await updateDoc(doc(db, "siswa", uid), { aksesLevel: _normAkses(aksesLevel) });
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
// Teacher view: kartu SRS mentah per level ({ n5:{key:{mastered,...}}, ... }) —
// dipakai untuk menghitung progres sylabus dengan rumus yang sama seperti
// halaman Sylabus siswa.
export async function getSiswaSrsAll(uid) {
  if (!userIsGuru() && uid !== currentUser?.uid) throw new Error("Tidak diizinkan");
  const result = {};
  await Promise.all(["n5","n4","n3","n2","n1"].map(async lvl => {
    try {
      const snap = await getDoc(doc(db, "siswa", uid, "srs", lvl));
      result[lvl] = snap.exists() ? (snap.data().kartu || {}) : {};
    } catch(_) { result[lvl] = {}; }
  }));
  return result;
}
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


/* ---- SSW: akses per siswa + leaderboard ----
 * siswa/{uid}.aksesSsw  (boolean; kosong = diizinkan)  — hanya guru yang boleh mengubah (rules).
 * ssw_rank/{slug}__{uid} { uid, slug, nama, kelas, poin, rinci{baca,kartu,kuis}, upd } — siswa menulis dokumennya sendiri. */
export async function setAksesSsw(uid, on) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  await updateDoc(doc(db, "siswa", uid), { aksesSsw: !!on });
}
/* siswa/{uid}.aksesJft (boolean; kosong = diizinkan) — hanya guru yang boleh mengubah (rules). */
export async function setAksesJft(uid, on) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  await updateDoc(doc(db, "siswa", uid), { aksesJft: !!on });
}
/* siswa/{uid}.aksesJftLevel {ir0,ir1,ir2: boolean}; false = level itu ditutup. */
export async function setAksesJftLevel(uid, map) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  const o = {}; ["ir0","ir1","ir2"].forEach(l => { if (typeof map?.[l] === "boolean") o[l] = map[l]; });
  await updateDoc(doc(db, "siswa", uid), { aksesJftLevel: o });
}
/* Akses SSW per bidang. v: true = boleh, false = blokir, null = hapus (ikut kelas / bawaan).
 * siswa/{uid}.aksesSswBidang.{slug}  dan  kelas/{id}.aksesSswBidang.{slug} */
export async function setAksesSswBidang(uid, slug, v) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  await updateDoc(doc(db, "siswa", uid), new FieldPath("aksesSswBidang", slug), v === null ? deleteField() : !!v);
}
export async function setAksesSswKelas(kelasId, slug, v) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  await updateDoc(doc(db, "kelas", kelasId), new FieldPath("aksesSswBidang", slug), v === null ? deleteField() : !!v);
}
export async function saveSswRank(slug, data) {
  if (!currentUser) return;
  const d = { uid: currentUser.uid, slug, nama: String(data.nama || "Siswa").slice(0, 60), kelas: String(data.kelas || "").slice(0, 40),
    poin: Math.max(0, Math.min(1000000, Math.round(data.poin || 0))), rinci: data.rinci || {}, upd: serverTimestamp() };
  await setDoc(doc(db, "ssw_rank", `${slug}__${currentUser.uid}`), d);
}
export async function loadSswRank(slug) {
  const snap = await getDocs(query(collection(db, "ssw_rank"), where("slug", "==", slug)));
  return snap.docs.map(x => x.data());
}
export async function resetSswRank(slug) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  const rows = await loadSswRank(slug);
  for (const r of rows) await deleteDoc(doc(db, "ssw_rank", `${slug}__${r.uid}`));
  return rows.length;
}

/* ========== LEADERBOARD ========== */
// PERINGATAN SKALA: dua fungsi di bawah membaca SELURUH koleksi siswa + sub-koleksi
// tiap siswa (ribuan baca per pemanggilan). Jangan dihubungkan ke UI siswa sebelum
// dibuat ulang memakai satu koleksi ringkasan (mis. leaderboard/{level}) + limit(20).
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
            nama: _isOwnerEmail(sdata.email) ? BRAND_NAME : (sdata.nama || "Anonim"),
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
        nama: _isOwnerEmail(sdata.email) ? BRAND_NAME : (sdata.nama || "Anonim"),
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
