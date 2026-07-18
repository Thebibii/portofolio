# Security Audit — NextAuth Configuration

**Tanggal:** 18 Juli 2026
**Metode:** Source code audit
**Lingkup:** NextAuth v4 config (`src/lib/auth.ts`), API routes, middleware, environment

---

## Ringkasan

- **Versi NextAuth:** `^4.24.11` (package.json:99)
- **Provider aktif:**
  - **Credentials** — email + password dengan bcryptjs
- **Adapter:** PrismaAdapter (`@next-auth/prisma-adapter ^1.0.7`)
- **Session strategy:** JWT
- **JWT maxAge:** 30 hari

---

## Temuan

### [KRITIS] OAuth Account Takeover via Email Auto-Linking  ✅ RESOLVED

- **Lokasi:** `src/lib/auth.ts` (sebelumnya: PrismaAdapter tanpa signIn callback)
- **Status:** ✅ RESOLVED — `GithubProvider` dihapus dari config. Tidak ada OAuth provider yang bisa ditautkan. Celah auto-linking menjadi tidak relevan.

---
### [TINGGI] Missing Rate Limiting / Brute-Force Protection  ✅ RESOLVED

- **Lokasi:** `src/lib/auth.ts:17-60` (authorize function)
- **Deskripsi:** Sebelumnya tidak ada mekanisme proteksi brute-force. Attacker bisa melakukan percobaan login tanpa batas.
- **Rekomendasi:** Implementasi DB-based account lockout: 5 gagal → lock 15 menit.
- **Status:** ✅ RESOLVED — `User` model sekarang punya `failedLoginAttempts` (Int, default 0) dan `lockoutUntil` (DateTime?). Setelah 5× gagal login dalam 15 menit berturut-turut, akun di-lock. Counter di-reset setelah login berhasil. Lockout menggunakan per-email (bukan per-IP), jadi proteksi tetap efektif meski serangan dari banyak IP berbeda.

---

### [SEDANG] Role Cached in JWT Without Periodic Refresh  ⏭️ SKIPPED

- **Lokasi:** `src/lib/auth.ts:62-68` (jwt callback)
- **Deskripsi:** Role user disimpan ke dalam JWT saat login dan tidak pernah di-refresh sampai token expired (30 hari). Jika admin mengubah role user dari USER ke ADMIN (atau sebaliknya), perubahan tidak akan berlaku sampai user login ulang atau token expired. Ini membuka celah **privilege persistence**.
- **Rekomendasi:** Refresh role dari database secara periodik di callback `jwt()`.
- **Status:** ⏭️ SKIPPED — Tidak diprioritaskan saat ini. Tidak memblokir perubahan lain.

---

### [SEDANG] NEXTAUTH_URL Masih Mengarah ke localhost  ✅ RESOLVED

- **Lokasi:** `.env:16`
- **Deskripsi:** `NEXTAUTH_URL=http://localhost:3000` — Jika project dideploy ke production (Vercel, cPanel, dll) tanpa mengubah nilai ini, akan menyebabkan **redirect mismatch**, callback URL error, dan potensi **open redirect**.
- **Rekomendasi:** Gunakan environment variable terpisah atau pastikan CI/CD pipeline mengganti nilai ini saat deploy.
- **Status:** ✅ RESOLVED — Vercel override otomatis `NEXTAUTH_URL` ke `https://thebibie.vercel.app`. Catatan: hanya bermasalah jika migrasi ke hosting non-Vercel tanpa update manual.

---

### [RENDAH] JWT_SECRET Redundan dengan NEXTAUTH_SECRET  ✅ RESOLVED

- **Lokasi:** `.env:23` + `src/lib/auth.ts:58` (sebelumnya)
- **Deskripsi:** `JWT_SECRET` di .env sama persis dengan `NEXTAUTH_SECRET`. Kode fallback `process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET` membuat kompleksitas tanpa manfaat.
- **Rekomendasi:** Hapus `JWT_SECRET` dari `.env` dan gunakan hanya `NEXTAUTH_SECRET`.
- **Status:** ✅ RESOLVED — `JWT_SECRET` dihapus dari `.env`, fallback di `auth.ts` disederhanakan jadi `process.env.NEXTAUTH_SECRET`.

---

### [RENDAH] bcrypt Rounds di Seed Terlalu Rendah  ✅ RESOLVED

- **Lokasi:** `prisma/seed.ts:10` (rounds = 10)
- **Deskripsi:** Seed menggunakan `bcrypt.hash("admin123", 10)`. Setelah register endpoint dihapus, seed adalah satu-satunya tempat yang menghasilkan hash dengan cost factor 10, lebih rendah dari standar 12 yang direkomendasikan.
- **Rekomendasi:** Tingkatkan salt rounds seed menjadi **12** agar konsisten.
- **Status:** ✅ RESOLVED — Seed sekarang menggunakan cost 12.

---

### [RENDAH] No Explicit Cookie Security Configuration  ⏭️ SKIPPED

- **Lokasi:** `src/lib/auth.ts` — tidak ada properti `cookies` di `authOptions`
- **Deskripsi:** NextAuth menggunakan default: `httpOnly: true`, `secure: true` (jika HTTPS), `sameSite: "lax"`. Tidak eksplisit bisa menyebabkan perilaku berbeda antar environment.
- **Rekomendasi:** Tambahkan konfigurasi cookie eksplisit.
- **Status:** ⏭️ SKIPPED — Default NextAuth sudah aman untuk skema Vercel + HTTPS.

---

### [INFO] Tidak Ada File .env.example

- **Lokasi:** Root project (tidak ada `.env.example`)
- **Deskripsi:** Tidak ada file `.env.example` yang mendokumentasikan environment variables yang dibutuhkan. Developer baru harus membaca kode atau AGENTS.md untuk mengetahui variabel apa saja yang diperlukan. Ini meningkatkan risiko misconfiguration.
- **Rekomendasi:** Buat file `.env.example` dengan placeholder untuk semua variabel yang diperlukan:

  ```env
  DATABASE_URL=postgresql://user:pass@localhost:5432/db
  DIRECT_URL=postgresql://user:pass@localhost:5432/db
  NEXTAUTH_SECRET=your-secret-here
  NEXTAUTH_URL=http://localhost:3000
  NEXT_PUBLIC_API_URL=http://localhost:3000/api
  # ... dan seterusnya
  ```

---

## Kesimpulan

### Prioritas Perbaikan

| Prioritas | Tindakan | Risiko | Status |
|-----------|----------|--------|--------|
| **P1** | Tambah `signIn` callback untuk mencegah OAuth account takeover | KRITIS | ✅ SELESAI (fitur OAuth dihapus) |
| **P1** | Implementasi rate limiting / brute-force protection | TINGGI | ✅ SELESAI (DB-based account lockout) |
| **P2** | Refresh role dari database di `jwt()` callback | SEDANG | ⏭️ SKIPPED |
| **P2** | Pastikan `NEXTAUTH_URL` dinamis di production | SEDANG | ✅ SELESAI (Vercel auto-set) |
| **P3** | Konsistenkan bcrypt rounds jadi 12 | RENDAH | ✅ SELESAI |
| **P3** | Tambah konfigurasi cookie eksplisit | RENDAH | ⏭️ SKIPPED |
| **P3** | Hapus `JWT_SECRET` redundan | RENDAH | ✅ SELESAI |
| **P4** | Buat `.env.example` | INFO | ⬜ OPEN |

### Catatan Tambahan

- **Hal yang sudah baik:**
  - Password di-hash dengan bcrypt saat verifikasi login (authorize function)
  - Credentials authorize function tidak membedakan error "user not found" vs "wrong password" (return `null` untuk keduanya)
  - `.env` sudah di `.gitignore`
  - Menggunakan PrismaAdapter yang sudah mature

- **Eksposure terbesar saat ini:** Tidak ada open issue dengan risiko di atas SEDANG. Item RENDAH dan INFO bisa dikerjakan kapan pun sesuai prioritas.

---

*Laporan ini berdasarkan source code pada commit terakhir. Beberapa temuan mungkin tidak relevan jika konfigurasi berbeda di production.*
