# Keputusan konfirmasi (K-1…K-14)

> Bagian dari rencana refactor. Indeks: [README](./README.md) · Keputusan: [decisions.md](./decisions.md)

Seluruh pertanyaan **K-1…K-14 sudah dijawab** pada 19 Oktober 2026. Kolom **Dampak** menunjukkan di mana keputusan itu diterapkan di laporan ini. Tidak ada refactor yang boleh menyimpang dari tabel ini.

### 6.1 Keputusan yang sudah final

| ID | Jawaban | Dampak pada laporan | Status |
|---|---|---|---|
| **K-1** | Blog/Writing **belum pasti identik selamanya**. Satukan logika & komponen, tetapi **config-driven** (props/parameter), bukan hardcode. | R-001, R-002, R-005, R-006, R-010 diubah menjadi berbasis `PostTypeConfig`; ditambahkan `src/lib/post-type-config.ts` | ✅ Terjawab |
| **K-2** | **Ya**, tambah `@unique` pada `Project.slug`. Wajib cek duplikat dulu; migrasi **ditunda** bila ada duplikat. `P2002` dipetakan lewat helper. | R-011 (prosedur 3 langkah), E-004 (P2002 → 409 wajib sebelum migrasi), Fase 2 & 3 | ✅ Terjawab |
| **K-3** | **JANGAN hapus** `/api/guest` & `/api/guest/projects` di refactor ini. Catat sebagai kandidat di fase terpisah. | R-020 dipersempit; Fase 6 opsional ditambahkan | ✅ Terjawab |
| **K-4** | **JANGAN hapus/ubah** `Post.publishedAt` atau schema. Cukup dicatat; keputusan di luar refactor. | R-009 tetap; [not-extracted.md](./not-extracted.md) ditambah baris | ✅ Terjawab |
| **K-5** | **Reset ke page 1** saat filter berubah (perilaku Blog) di logika bersama. | R-005 (`usePostListUrlState` default `resetPageOnFilterChange = true`) | ✅ Terjawab |
| **K-6** | Pertahankan perilaku sekarang: **cookie `visitor_id` saja**, tanpa fallback IP. Anti-spam di luar scope. | R-001, R-014; `getClientIp` **dihapus** karena hasilnya tidak pernah dipakai | ✅ Terjawab |
| **K-7** | Pertahankan `revalidatePath("/")` di view. Catat sebagai perbaikan performa terpisah. | R-001 (`config.revalidatePaths`), [not-extracted.md](./not-extracted.md), dan Fase 6 langkah 6.3 | ✅ Terjawab |
| **K-8** | **Jangan pindahkan** `/api/project/**` sekarang. Fase opsional terakhir, syarat: semua pemanggil diubah + proteksi auth mencakup path baru. | Fase 6 opsional; R-004 tetap tanpa rename path | ✅ Terjawab |
| **K-9** | **Ya**, perbaiki judul halaman edit. | R-006 (`config` menyediakan judul), Fase 5 | ✅ Terjawab |
| **K-10** | **Ya**, `NEXT_PUBLIC_SITE_URL` dengan fallback URL produksi. Catat env untuk Vercel (Production + Preview) dan `.env` lokal. | R-012, Fase 0 & 1 | ✅ Terjawab |
| **K-11** | **Konservatif**: wrapper hanya menangani error dikenal (AppError, Prisma, Zod) dan **melempar ulang** sisanya. Jangan import `isRedirectError` dari internal Next. Cek `unstable_rethrow`. | E-003 ditulis ulang; Next **15.4.8**, `unstable_rethrow` tersedia | ✅ Terjawab |
| **K-12** | Belum ada CI. Tambahkan script **`verify`** (`tsc` + `lint`; `build` dijalankan manual) di fase pertama. Cek `ignoreBuildErrors`/`eslint.ignoreDuringBuilds`. | Fase 0 diubah; hasil cek: `next.config.ts` **tidak** memakai keduanya | ✅ Terjawab |

### 6.2 Temuan pendukung K-11 dan K-12

**K-11 — versi Next & `unstable_rethrow`:**

| Item | Hasil |
|---|---|
| Versi `next` | **15.4.8** (`package.json:98`) |
| `unstable_rethrow` tersedia? | **Ya** — diekspor di `node_modules/next/dist/client/components/navigation.d.ts:126` dan `navigation.react-server.d.ts:16` |
| Dipakai di rencana? | **Ya** — disetujui lewat K-14; dipanggil paling awal di `catch` (lihat E-003) |
| `isRedirectError`/`isNotFoundError` internal | **Tidak dipakai** (dilarang oleh K-11) |
| Perilaku `unstable_rethrow` (dari implementasi server) | Melempar ulang Next router error, bailout CSR, dynamic server error, postpone, hanging promise rejection; **menelusuri `error.cause` rekursif**; selain itu no-op |
| Konsekuensi | `redirect()`, `notFound()`, `forbidden()`, `unauthorized()` aman; error domain yang membungkus error Next juga ikut dilempar |
| Mitigasi API `unstable_` | Versi Next di-pin (`"next": "15.4.8"`, tanpa `^`) — jangan diubah tanpa menjalankan ulang verifikasi |

Konsekuensi desain: `withRouteHandler` **melempar ulang semua error tak dikenal**. Ini otomatis aman untuk `redirect()`/`notFound()` tanpa bergantung pada API internal Next.

**K-12 — konfigurasi build saat ini:**

| Item | Hasil | Catatan |
|---|---|---|
| Script `package.json` | `dev`, `build`, `start`, `lint` | **tidak ada** `typecheck` maupun `verify` |
| `next.config.ts` | hanya `images.remotePatterns` | 17 baris, tanpa `typescript`/`eslint` block |
| `typescript.ignoreBuildErrors` | **tidak dipakai** | build sudah type-check |
| `eslint.ignoreDuringBuilds` | **tidak dipakai** | lint sudah jalan saat build |
| CI | **tidak ada** `.github/workflows` | — |
| `.env.example` | ada; **belum** memuat `NEXT_PUBLIC_SITE_URL` | perlu ditambah (K-10) |

Artinya: menambahkan `verify` memberi nilai tambah nyata karena `next build` memang gagal pada type error, tetapi `verify` memisahkan tahap `tsc --noEmit` (lebih cepat, tanpa bundling) dan `lint`. `build` tetap dijalankan manual karena durasinya lama. Tidak ada "lubang" `ignoreBuildErrors` yang perlu ditutup.

### 6.3 Pertanyaan lanjutan (sudah terjawab)

| ID | Jawaban | Dampak | Status |
|---|---|---|---|
| **K-13** | **Kelas minimal saja.** `AppError extends Error { status; code }` di `src/lib/app-error.ts` — tanpa hierarchy, tanpa subclass, tanpa `cause` chain, tanpa serialization. | E-003 (contoh kode wrapper), langkah 2.6, [not-extracted.md](./not-extracted.md) | ✅ Terjawab |
| **K-14** | **Setuju** memakai `unstable_rethrow(e)` dari `next/navigation`. | E-003 dipanggil paling awal di `catch`; [§6.2](#62-temuan-pendukung-k-11-dan-k-12) mencatat perilaku & mitigasi versi | ✅ Terjawab |

**Tidak ada pertanyaan terbuka.** Rencana siap dieksekusi.
