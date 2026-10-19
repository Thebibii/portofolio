# Fase 0 — Gate `verify`

> Bagian dari rencana refactor. Indeks: [README](./README.md) · Keputusan: [decisions.md](./decisions.md)

**Keputusan terkait:** `K-10`, `K-12` — lihat [decisions.md](./decisions.md).

---

## Langkah eksekusi

K-12: belum ada CI dan tidak akan ditambahkan pada refactor ini. Sebagai gantinya, satu script lokal yang dipakai di setiap akhir fase.

| Langkah | Detail |
|---|---|
| 0.1 | Tambah script di `package.json`: `"typecheck": "tsc --noEmit"`, `"verify": "npm run typecheck && npm run lint"` — `build` dijalankan manual, tidak dibungkus `verify` |
| 0.2 | Jalankan `npm run verify` sebagai **baseline**; catat error/warning yang sudah ada agar tidak dikira regresi |
| 0.3 | Tambah `NEXT_PUBLIC_SITE_URL` ke `.env.example` dengan nilai fallback `https://thebibie.vercel.app` (K-10) |
| 0.4 | Catat di PR/commit bahwa env `NEXT_PUBLIC_SITE_URL` harus diset di Vercel **Production** + **Preview** dan `.env` lokal |

**Hasil cek K-12 (sudah diverifikasi):** `next.config.ts` tidak memakai `typescript.ignoreBuildErrors` maupun `eslint.ignoreDuringBuilds`; `package.json` belum punya `typecheck`/`verify`. Tidak ada gate yang perlu "dibuka".
**Commit:** `chore: add verify script and site URL env`

---

## Catatan verifikasi fase ini

- **Baseline wajib:** jalankan `npm run verify` **sebelum** mengubah apa pun dan simpan output-nya. Error/warning yang sudah ada bukan regresi.
- **Tidak ada perubahan perilaku** yang perlu diuji manual di fase ini.
- Pastikan `package.json` memuat `typecheck` dan `verify`, dan `.env.example` memuat `NEXT_PUBLIC_SITE_URL`.
- Pastikan build tetap jalan tanpa env tersebut (fallback ke `https://thebibie.vercel.app`).

Verifikasi global (halaman minimum & cek regresi): [README](./README.md#verifikasi-global).

---

## Hasil eksekusi (19 Oktober 2026)

| Langkah | Status | Bukti |
|---|---|---|
| 0.1 | ✅ Selesai | `package.json` memuat `typecheck` dan `verify` (`verify` = `typecheck` + `lint`) |
| 0.2 | ⚠️ Baseline tercatat, gate belum hijau | lihat tabel baseline di bawah |
| 0.3 | ✅ Selesai | `.env.example` memuat `NEXT_PUBLIC_SITE_URL="https://thebibie.vercel.app"` |
| 0.4 | ⚠️ Perlu tindakan di luar repo | set `NEXT_PUBLIC_SITE_URL` di Vercel **Production** + **Preview** dan `.env` lokal |

**Baseline (sebelum perubahan):**

| Perintah | Hasil |
|---|---|
| `npx tsc --noEmit` | lolos, tanpa output |
| `npm run lint` | **gagal (exit 1)** — `Cannot find module '...node_modules/eslint-config-next/core-web-vitals'` dari `eslint.config.mjs` |
| `npm run build` | lolos (63 halaman); mencetak error ESLint yang sama (non-fatal) + warning `punycode` deprecation |

**Setelah perubahan:**

| Perintah | Hasil |
|---|---|
| `npm run verify` | **gagal di tahap `lint`**, exit 1 — pesan sama seperti baseline (pre-existing, bukan regresi) |
| `npm run build` | lolos, exit 0 — output identik dengan baseline |

**Catatan:** `eslint-config-next@15.5.6` tidak punya `exports` map, sehingga import ESM tanpa ekstensi di `eslint.config.mjs:2` gagal resolve. Perbaikan file tersebut **di luar lingkup Fase 0** dan belum dilakukan; sampai diperbaiki, `npm run verify` akan selalu berhenti di tahap `lint`.

