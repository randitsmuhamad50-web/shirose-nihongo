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
  signOut, sendPasswordResetEmail
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

/* ========== STATE ========== */
let currentUser = null;
let currentSiswaDoc = null;
let onReadyCallbacks = [];
let authListenerSet = false;

export function isGuru(user) {
  return !!user && user.email === GURU_EMAIL;
}
export function isDeveloper(user) {
  return !!user && user.email === DEVELOPER_EMAIL;
}
export function userIsGuru() { return isGuru(currentUser); }
export function userIsDeveloper() { return isDeveloper(currentUser); }
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

async function ensureSiswaDoc(u) {
  const ref = doc(db, "siswa", u.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const data = {
      nama: u.displayName || u.email.split("@")[0],
      email: u.email,
      kelas: "",
      aksesLevel: isGuru(u)
        ? { n5:true, n4:true, n3:true, n2:true, n1:true }
        : { n5:true, n4:false, n3:false, n2:false, n1:false },
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
    await setDoc(ref, data);
    currentSiswaDoc = data;
  } else {
    currentSiswaDoc = snap.data();
    // update last active
    updateDoc(ref, { aktif: serverTimestamp() }).catch(()=>{});
  }
}

export async function login(email, pwd) {
  return await signInWithEmailAndPassword(auth, email, pwd);
}
export async function daftar(email, pwd, nama) {
  const cred = await createUserWithEmailAndPassword(auth, email, pwd);
  if (nama) {
    await updateDoc(doc(db, "siswa", cred.user.uid), { nama }).catch(()=>{});
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
  const snap = await getDoc(doc(db, "siswa", currentUser.uid, "gami", level));
  return snap.exists() ? snap.data() : { xp:0, koin:0, streak:0, level_karakter:1 };
}
export async function tambahXP(level, dXP, dKoin = 0) {
  if (!currentUser) return;
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
}

/* ========== SRS (hafalan) ========== */
export async function saveSRS(level, kartu) {
  if (!currentUser) return;
  await setDoc(doc(db, "siswa", currentUser.uid, "srs", level), {
    kartu, updated: serverTimestamp()
  }, { merge: true });
}
export async function loadSRS(level) {
  if (!currentUser) return {};
  const snap = await getDoc(doc(db, "siswa", currentUser.uid, "srs", level));
  return snap.exists() ? (snap.data().kartu || {}) : {};
}

/* ========== NILAI (riwayat ujian) ========== */
export async function catatNilai(nilai) {
  if (!currentUser) return;
  const ref = collection(db, "siswa", currentUser.uid, "nilai");
  return await addDoc(ref, { ...nilai, tgl: serverTimestamp() });
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
  return { firstTime:true, rewardKoin: 10000 };
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
  const snap = await getDocs(collection(db, "siswa"));
  return snap.docs.map(d => ({ uid:d.id, ...d.data() }));
}
export async function updateAksesSiswa(uid, aksesLevel) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  await updateDoc(doc(db, "siswa", uid), { aksesLevel });
}
export async function updateKelasSiswa(uid, kelas) {
  if (!userIsGuru()) throw new Error("Hanya guru");
  await updateDoc(doc(db, "siswa", uid), { kelas });
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

/* ========== KELAS ========== */
export async function listKelas() {
  const snap = await getDocs(collection(db, "kelas"));
  return snap.docs.map(d => ({ id:d.id, ...d.data() }));
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
  // Query siswa docs (perlu aggregate query atau cursor; disederhanakan: fetch all + sort)
  const snap = await getDocs(collection(db, "siswa"));
  const result = [];
  for (const d of snap.docs) {
    try {
      const g = await getDoc(doc(db, "siswa", d.id, "gami", level));
      if (g.exists()) {
        result.push({
          uid: d.id, nama: d.data().nama || "Anonim",
          ...g.data()
        });
      }
    } catch(e) {}
  }
  result.sort((a,b) => (b.xp || 0) - (a.xp || 0));
  return result.slice(0, topN);
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
