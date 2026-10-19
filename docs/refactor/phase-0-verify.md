# Fase 0 — Gate `verify`

> Bagian dari rencana refactor. Indeks: [README](./README.md) · Keputusan: [decisions.md](./decisions.md)

**Keputusan terkait:** `K-10`, `K-12` — lihat [decisions.md](./decisions.md).

---

## Langkah eksekusi

K-12: belum ada CI dan tidak akan ditambahkan pada refactor ini. Sebagai gantinya, satu script lokal yang dipakai di setiap akhir fase.

| Langkah | Detail |
|---|---|
| 0.1 | Tambah script di `package.json`: `"typecheck": "tsc --noEmit"`, `"verify": "npm run typecheck && npm run lint && npm run build"` |
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
