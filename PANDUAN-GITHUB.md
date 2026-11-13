# Panduan Setup GitHub & Netlify Pertama Kali

Dokumen ini untuk kamu (owner Shirose Nihongo) agar bisa pindah dari "drag ZIP ke Netlify Drop" menjadi "push ke GitHub → auto deploy".

## 1. Bikin akun GitHub (5 menit)

1. Buka https://github.com/signup
2. Email: `randitsmuhamad50@gmail.com` (biar sinkron dengan Google / Firebase)
3. Password: kuat, catat.
4. Username yang disarankan: **`shirose-nihongo`** atau **`randitsmuhamad`** (ini jadi URL permanen).
5. Verifikasi email → selesai.

## 2. Bikin repository kosong (3 menit)

1. Klik tombol **"+"** di kanan atas → **New repository**
2. Repository name: **`shirose-nihongo`**
3. Description: `Website kelas bahasa Jepang Shirose Nihongo — RPG platform`
4. Privacy: pilih **Private** (kode tidak publik; kuota repo private unlimited di free plan GitHub).
5. **JANGAN** centang "Add a README / .gitignore / license" — biar repo kosong.
6. **Create repository**.

## 3. Push kode ke GitHub (2 cara)

### Cara A: Lewat Personal Access Token (kasih ke Claude)

1. https://github.com/settings/tokens?type=beta → **Generate new token (fine-grained)**
2. Token name: `Shirose Deploy`
3. Expiration: **90 days**
4. Repository access: **Only select repositories** → pilih `shirose-nihongo`
5. Permissions → **Repository permissions**:
   - Contents: **Read and write**
   - Metadata: Read (otomatis)
   - Pull requests: **Read and write** (opsional)
6. Generate token → copy (muncul sekali, hilang kalau pindah halaman).
7. Paste token + username GitHub kamu ke chat Claude.

### Cara B: Push sendiri dari komputer

Kalau punya git di laptop:
```bash
cd ~/Downloads
# extract ZIP shirose-rpg-github.zip yang dikirim Claude
cd shirose-rpg
git init -b main
git remote add origin https://github.com/<username>/shirose-nihongo.git
git add .
git commit -m "feat: initial RPG platform migration"
git push -u origin main
```

## 4. Connect GitHub ke Netlify (5 menit, sekali saja)

1. Login https://app.netlify.com
2. Ke site `shirose-nihongo` → **Site configuration → Build & deploy → Continuous deployment**
3. Klik **Link site to Git** → GitHub
4. Authorize Netlify → pilih repo `shirose-nihongo`
5. Build settings:
   - Branch: **`main`**
   - Build command: *(kosongkan)*
   - Publish directory: **`.`**
6. **Deploy site**.

Setelah ini, tiap kali kode berubah di GitHub (push dari Claude), Netlify otomatis deploy dalam ~30 detik. Kamu tidak perlu drag ZIP lagi.

## 5. (Opsional) GitHub Actions deploy

Workflow `deploy.yml` sudah ada di repo. Supaya aktif:

1. https://github.com/<username>/shirose-nihongo/settings/secrets/actions
2. **New repository secret**:
   - Name: `NETLIFY_AUTH_TOKEN` · Value: dari https://app.netlify.com/user/applications#personal-access-tokens
   - Name: `NETLIFY_SITE_ID` · Value: dari Netlify site → **Site information → Site ID**
3. Save.

Kalau tidak set secrets ini, Netlify build sendiri tetap jalan (via "Link site to Git" di step 4) — GitHub Actions cuma backup / notifikasi.

## 6. Verifikasi

1. Buka https://shirose-nihongo.netlify.app → cek RPG Dashboard tampil.
2. Login dengan akun guru → cek Dashboard Guru berfungsi.
3. Lihat Netlify dashboard → cek deploy log sukses.

## Troubleshooting

### "Netlify build failed"
Cek deploy log di Netlify. Biasanya karena file hilang atau nama file typo. Workflow `deploy.yml` sudah punya pengecekan file wajib — kalau build gagal di step `Verify static assets`, nama file di error akan jelas.

### "GitHub Actions `NETLIFY_AUTH_TOKEN` tidak dikenali"
Secret belum ditambahkan atau salah nama. Pastikan huruf besar semua.

### "Push ditolak (push rejected)"
Kalau Claude push dengan token yang sudah expired atau salah scope, akan muncul error. Generate token baru di step 3 Cara A.

### "Service worker tidak update di HP"
Clear cache atau unregister service worker di DevTools. Service worker versi berganti otomatis di `sw.js` saat deploy baru (lihat `CACHE = "shirose-rpg-v1"` — kalau update besar, bump ke v2).

## URL penting

- **Live site**: https://shirose-nihongo.netlify.app
- **GitHub repo**: https://github.com/<username>/shirose-nihongo (private)
- **Firebase console**: https://console.firebase.google.com/project/shirose-nihongo
- **Netlify dashboard**: https://app.netlify.com/sites/shirose-nihongo
<!-- redeploy 1221 -->
