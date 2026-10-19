# Refactor reusability — indeks eksekusi

**Tanggal:** 19 Oktober 2026 · **Lingkup:** `src/**`, `prisma/schema.prisma` · **Status:** rencana, belum ada kode yang diubah

Dokumen ini pintu masuk. Rencana lengkap dipecah per fase agar setiap bagian bisa dibaca dan dieksekusi mandiri.

---

## 1. Ringkasan eksekutif

Struktur project sudah sehat: route group `(guest)/(admin)/(auth)` jelas, server fetcher dipisah di `src/lib/server/*` dengan `import "server-only"`, komponen `reusable/` sudah ada, dan konvensi colocation `_components` sudah dipakai. Masalahnya bukan "tidak ada abstraksi", melainkan **abstraksi yang berhenti di tengah jalan**: pasangan fitur Blog dan Writing disalin hampir byte-per-byte di 8 route API + 4 file hook + 4 komponen/halaman client, sementara aturan yang sama (envelope error, bentuk `select` Prisma, base URL SEO, key React Query) ditulis ulang di belasan tempat.

| Metrik | Jumlah | Bukti |
|---|---|---|
| Pasangan route Blog↔Writing identik kecuali literal `type` | 4 pasang (8 file) | `api/guest/blogs|writings/{,/[slug],/[slug]/like,/[slug]/view}` |
| Pemanggilan `NextResponse.json` di `src/app/api` | 155 | hasil grep |
| Literal `"Terjadi kesalahan pada server"` (500) | 33 | mis. `api/guest/blogs/route.ts:140` |
| Literal `"Terjadi kesalahan"` (500, tanpa log) | 7 | mis. `api/guest/blogs/[slug]/view/route.ts:35` |
| Respons error berbentuk `{ message }` (bukan `{ error }`) | 31 kemunculan di 9 file | mis. `api/project/[slug]/route.ts:65,74,91,105,140,144,170` |
| Catch block tanpa logging | 8 blok / 6 file | mis. `api/guest/blogs/[slug]/like/route.ts:66-71` |
| Handler `P2002` | **0** | tidak ada di seluruh `src` |
| Handler `P2025` | 5 file | mis. `api/admin/category/[id]/route.ts:92` |
| `invalidateQueries` tersebar | 22 panggilan (24 kemunculan, 2 di antaranya komentar) | mis. `admin/categories/page.tsx:91,100,110` |
| Literal base URL `https://thebibie.vercel.app` | 13 | `src/app/layout.tsx:24,34`, `src/app/sitemap.ts:5`, 10 lainnya |
| `any` eksplisit | 119 di 62 file | hasil grep |
| Hook React Query berekstensi `.tsx` tanpa JSX | 22 dari 24 | mis. `admin/blogs/use-query.tsx` |
| Skeleton tidak terpakai | 2 | `PostDetailSkeleton`, `ProjectDetailsSkeleton` |

**Kesimpulan:** 7 temuan reusability prioritas **Tinggi** (R-001…R-007) dan 4 temuan error-handling **Tinggi** (E-001…E-004) memberi dampak terbesar dengan risiko terkendali karena sebagian besar murni konsolidasi perilaku yang sudah identik. Estimasi total ±8 hari kerja terfokus (Fase 0–5), plus satu fase opsional terpisah di akhir ([Fase 6](./phase-6-optional.md)). Setiap fase dapat di-commit sendiri.

**Status keputusan:** seluruh pertanyaan **K-1…K-14 sudah dijawab** (19 Oktober 2026). **Tidak ada pertanyaan terbuka** — rencana siap dieksekusi fase demi fase ([decisions.md](./decisions.md)).

**Arah keputusan yang memengaruhi seluruh rencana:**
- **K-1** — Blog dan Writing **belum pasti identik selamanya**. Semua penggabungan (R-001/R-002/R-005/R-006/R-010) harus **config-driven**: perilaku per tipe dinyatakan sebagai objek konfigurasi/props, bukan `if (type === "BLOG")` yang tersebar. Tujuannya agar Writing bisa divergen tanpa membongkar komponen bersama.
- **K-2** — `Project.slug` akan diberi `@unique`, **didahului** cek duplikat di database; migrasi ditunda bila ada duplikat. `P2002` wajib dipetakan lewat helper error.
- **K-3** — `/api/guest` dan `/api/guest/projects` **tidak dihapus** di refactor ini; hanya dicatat sebagai kandidat di fase terpisah.
- **K-7** — `revalidatePath("/")` pada view **dipertahankan**; optimasi performa di luar scope.
- **K-8** — pemindahan `/api/project/**` → `/api/admin/projects/**` **tidak dilakukan sekarang**; menjadi fase opsional terakhir.
- **K-12** — belum ada CI; sebagai gantinya ditambahkan script `verify` (`tsc` + `lint` + `build`) di Fase 0.

---

## 2. Peta struktur & konvensi

### 2.1 Route groups

```
src/app/
├── (guest)/            # publik
│   ├── about/page.tsx                 ("use client", 145 baris)
│   ├── blogs/{page.tsx, _components/blogs-client.tsx (557), [slug]/...}
│   ├── writings/{page.tsx, _components/writings-client.tsx (547), [slug]/...}
│   ├── projects/{page.tsx, _components/projects-client.tsx, [slug]/...}
│   ├── statistics/page.tsx            ("use client", 232 baris + skeleton inline)
│   └── guestbook/layout.tsx
├── (admin)/admin/
│   ├── dashboard/page.tsx             (296)
│   ├── blogs/{page.tsx (218), create, [slug]/page.tsx}
│   ├── writings/{page.tsx (216), create, [slug]/page.tsx}
│   ├── categories/page.tsx            (415)
│   ├── tags/page.tsx                  (408)
│   ├── project/{page.tsx (106), create/page.tsx (5), [id]/page.tsx (16)}
│   └── about/{page.tsx, experiences, current-activities}
├── (auth)/{signin,register}
└── api/
    ├── admin/**        # semua butuh requireAdmin() in-handler
    ├── guest/**        # publik
    ├── project/**      # admin CRUD project (naming legacy, bukan /api/admin/project)
    ├── auth/[...nextauth]
    └── cron/keep-alive # Bearer CRON_SECRET
```

### 2.2 Lapisan data

| Lapisan | Lokasi | Aturan |
|---|---|---|
| Prisma client | `src/lib/prisma.ts` | singleton |
| Server fetcher | `src/lib/server/get-{home,blogs,writings,projects}-data.ts` | `import "server-only"`, `cache()` React, serialisasi Date→ISO |
| Route handler | `src/app/api/**/route.ts` | `requireAdmin()` untuk admin; try/catch per handler |
| Client cache | `src/hooks/react-query/{admin,guest}/<domain>/{use-query,use-mutation}` | key `get.{scope}.{entity}` |
| Guard | `src/lib/require-admin.ts:18-33` | `{ session, response }`, return `response` bila 401 |
| Middleware | `src/middleware.ts:54` | matcher **mengecualikan `api`** → proteksi API 100% in-handler |

### 2.3 Konvensi yang sudah baik (jangan diubah)

- `requireAdmin()` dipakai konsisten di 18 file route admin (pola `if (response) return response;`).
- `src/lib/server/*` sudah `server-only` + `cache()`.
- `FormCreatePost` dipakai ulang untuk create **dan** edit blog/writing (4 halaman) — sudah benar, meski judul halaman edit salah (lihat [audit-file-map.md](./audit-file-map.md)).
- `JsonLd` + `schemas/{article,breadcrumb,software-application,person,website}` sudah terpusat.
- `EmptyState`/`LoadingState` sudah ada dan dipakai 14×; masalahnya hanya belum ada preset.
- `generateUniquePostSlug()` sudah menangani suffix `-2`, `-3` dan exclusion `currentSlug` (`src/lib/unique-slug.ts:10-35`).

### 2.4 Batas server/client untuk file hasil ekstraksi

| File hasil ekstraksi | Wajib |
|---|---|
| `src/lib/post-type-config.ts`, `src/lib/api-error.ts`, `src/lib/prisma-selects.ts`, `src/lib/slug.ts`, `src/lib/serialize.ts` | tanpa `"use client"` |
| `src/lib/visitor.ts`, `src/lib/server/get-posts-data.ts` | `import "server-only"` |
| `src/lib/seo/*` | server-safe, jangan `"use client"` |
| `src/lib/validation/{post,project,taxonomy}.ts` | **bebas `"use client"`** (dipakai route handler dan form client); zod murni, tanpa `server-only` |
| `src/lib/http.ts`, `src/lib/react-query/keys.ts`, `src/lib/format-date.ts` | shared murni |
| `src/components/reusable/guest/post-list/*`, `pagination-bar`, `confirm-delete-dialog`, `filter-bar` | **wajib `"use client"`** |
| `src/components/reusable/admin/*` | pertahankan `"use client"` yang sudah ada |

---

## Urutan fase

Setiap fase **dapat di-commit sendiri** dan tidak meninggalkan kode setengah jadi. Seluruh **K-1…K-14 sudah terjawab** ([decisions.md](./decisions.md)) — tidak ada blocker keputusan.

| Fase | File | Estimasi | Temuan | Prasyarat |
|---|---|---|---|---|
| 0 — Gate `verify` | [phase-0-verify.md](./phase-0-verify.md) | 0,5 hari | — (K-10, K-12) | — |
| 1 — Fondasi | [phase-1-foundation.md](./phase-1-foundation.md) | 0,5 hari | R-011, R-012, R-013, R-014, R-018, R-021, R-023 | Fase 0 |
| 2 — Validasi & error | [phase-2-validation-errors.md](./phase-2-validation-errors.md) | 1,5 hari | R-003, R-004, R-019, E-001…E-006, E-009, E-010 | Fase 1 |
| 3 — Server & route | [phase-3-server-routes.md](./phase-3-server-routes.md) | 2 hari | R-001, R-007, R-008, R-009, R-010, R-020 | Fase 2 (khusus `mapPrismaError` sebelum migrasi) |
| 4 — Hooks & cache | [phase-4-client-hooks.md](./phase-4-client-hooks.md) | 1,5 hari | R-002, R-007 (lanj.), R-013 (lanj.), E-006 (lanj.), E-007, E-008 | Fase 3 |
| 5 — UI | [phase-5-ui.md](./phase-5-ui.md) | 2 hari | R-005, R-006, R-007 (lanj.), R-015, R-016, R-017, R-022 | Fase 4 (R-002) |
| 6 — Opsional | [phase-6-optional.md](./phase-6-optional.md) | +1–1,5 hari | K-3, K-4, K-7, K-8 | Fase 0–5 selesai + persetujuan terpisah |

**Total Fase 0–5:** ±8 hari (tanpa Fase 0: ±7,5 hari). Fase 6 tidak termasuk karena menunggu persetujuan.

### Ketergantungan

```
Fase 0 ──► Fase 1 ──► Fase 2 ──► Fase 3 ──► Fase 4 ──► Fase 5 ──► Fase 6 (opsional)
 verify     config      schema      handlers    hooks       UI          cleanup/rename path
            slug        api-error   selects     keys        list/detail
            visitor     prisma-err  serialize   defaults    taxonomy
```

- `src/lib/post-type-config.ts` (Fase 1.8) adalah prasyarat R-001, R-002, R-005, R-006, R-010.
- `mapPrismaError` (Fase 2.3) **harus** selesai sebelum migrasi `Project.slug` (Fase 3.8).
- Fase 5 tidak boleh dimulai sebelum R-002 (Fase 4) selesai, karena komponen UI baru mengonsumsi factory hook.
- Fase 6 hanya setelah seluruh Fase 0–5 terverifikasi.

---

## Checklist gabungan

### Reusability

- [ ] R-001 — Route API Blog/Writing identik (4 pasang + featured) — **config-driven** (K-1)
- [ ] R-002 — Hook React Query Blog/Writing identik — **config-driven** (K-1)
- [ ] R-003 — `postSchema` & `listQuerySchema` 3×
- [ ] R-004 — `projectSchema` 4× (+ gabung form create/edit)
- [ ] R-005 — Komponen client Blog/Writing (list 557/547, detail 189/192) — reset page 1 (K-5)
- [ ] R-006 — Halaman admin blogs/writings identik + judul edit (K-9)
- [ ] R-007 — CRUD taxonomy Category/Tag (API + hook + halaman)
- [ ] R-008 — Bentuk `select` post 5×
- [ ] R-009 — Serialisasi tanggal 6×
- [ ] R-010 — `getBlogsData` vs `getWritingsData` — config-driven (K-1)
- [ ] R-011 — Utilitas slug (typo nama) + `Project.slug @unique` dengan cek duplikat dulu (K-2)
- [ ] R-012 — Base URL & metadata SEO 13× + `NEXT_PUBLIC_SITE_URL` (K-10)
- [ ] R-013 — Key React Query literal
- [ ] R-014 — Helper visitor/IP duplikat — cookie saja, tanpa fallback IP (K-6)
- [ ] R-015 — Filter/pencarian admin
- [ ] R-016 — Dialog konfirmasi hapus 5×
- [ ] R-017 — Empty/loading state belum berpreset
- [ ] R-018 — Format tanggal tersebar
- [ ] R-019 — Duplikasi tipe & `any`
- [ ] R-020 — Dead code & import tak terpakai (route `/api/guest*` **dikecualikan**, K-3)
- [ ] R-021 — 22 hook `.tsx` tanpa JSX
- [ ] R-022 — Dua implementasi upload Supabase
- [ ] R-023 — Skeleton tak terpakai & penamaan

### Error handling

- [ ] E-001 — Envelope error tidak konsisten
- [ ] E-002 — Catch tanpa logging (8 blok)
- [ ] E-003 — Wrapper handler konservatif, 51 catch block (K-11)
- [ ] E-004 — `P2025` parsial, `P2002` nol → `P2002` = 409 wajib sebelum migrasi (K-2)
- [ ] E-005 — Zod `parse` 12 route
- [ ] E-006 — Pesan error client salah
- [ ] E-007 — Error state UI tidak konsisten
- [ ] E-008 — `QueryClient` tanpa default
- [ ] E-009 — `parseInt`/`Number` tanpa guard
- [ ] E-010 — `console.log` sisa debugging & `catch (error: any)`

### Gate & keputusan

- [x] K-1 … K-12 dijawab (19 Okt 2026) — lihat [decisions.md](./decisions.md)
- [x] K-13 — `AppError` minimal (`status`, `code`) — diputuskan
- [x] K-14 — `unstable_rethrow` disetujui & dipakai paling awal di `catch`
- [ ] Fase 0 — script `verify` + `NEXT_PUBLIC_SITE_URL` di `.env.example`
- [ ] Env `NEXT_PUBLIC_SITE_URL` diset di Vercel Production + Preview (di luar repo)
- [ ] K-2 — query cek duplikat `Project.slug` dijalankan & hasilnya dilampirkan
- [ ] Fase 6 — persetujuan terpisah untuk K-3/K-8/K-7/K-4

---

## Verifikasi global

### Perubahan ini hanya dokumen

Tidak ada file kode yang disentuh. Tidak ada perintah build/lint yang perlu dijalankan untuk memvalidasi laporan. Angka pada laporan diambil dari pembacaan file dan `grep` pada commit saat ini.

### Saat implementasi (per fase)

**Otomatis (wajib tiap fase):**

```bash
npx tsc --noEmit          # type-check tanpa build penuh
npm run lint              # next lint, ESLint 9 flat config
npm run build             # pastikan App Router & route handler valid
```

Setelah Fase 0, ketiganya dibungkus menjadi satu perintah:

```bash
npm run verify            # typecheck && lint && build
```

Catatan: project **tidak punya test framework** dan tidak ada CI (K-12) — verifikasi bergantung pada `verify` plus manual check. Jangan mengklaim "aman" hanya dari `tsc` untuk perubahan UI.

**Manual — daftar halaman minimum:**

| Halaman | URL | Yang dicek |
|---|---|---|
| Guest list blog | `/blogs` | filter search/tag/category, sort, pagination, URL sinkron saat reload, back/forward browser |
| Guest list writing | `/writings` | idem; **sekarang harus reset ke page 1** saat filter berubah (K-5) |
| Guest detail blog | `/blogs/[slug]` | view counter naik 1×, like toggle, cookie `visitor_id`, metadata OG |
| Guest detail writing | `/writings/[slug]` | idem |
| Guest projects | `/projects`, `/projects/[slug]` | filter, view counter, serialisasi tanggal |
| Home | `/` | featured section, data home, tidak ada error console |
| Admin list blog | `/admin/blogs` | create/edit/delete/toggle featured → list ter-refresh tanpa reload |
| Admin list writing | `/admin/writings` | idem |
| Admin categories/tags | `/admin/categories`, `/admin/tags` | create duplikat → 409 (bukan 500), update, delete, dialog konfirmasi |
| Admin project | `/admin/project` | create/edit (tanggal!), delete, featured; slug duplikat → 409 bukan 500 (K-2) |
| About | `/about`, `/admin/about/experiences`, `/admin/about/current-activities` | skeleton, validasi form, toast tidak muncul berulang |
| Statistics | `/statistics` | skeleton, angka BLOG/WRITING benar |

**Cek regresi khusus (mudah terlewat):**

1. **Like:** PATCH dua kali dari browser yang sama → `liked` harus `false` pada panggilan kedua; header `Set-Cookie` hanya pada panggilan pertama.
2. **View:** `revalidatePath("/")` **tetap ada** (K-7) — jangan menghapusnya di refactor ini; cukup pastikan view counter tetap naik 1× per panggilan.
3. **Envelope error:** POST body invalid → status 400 dengan `{ error: string[] }`; DELETE id tidak ada → 404 `{ error: string }`; POST tag duplikat → 409 `{ error: string }`. Tidak boleh ada `{ message }` tersisa di endpoint yang sudah dimigrasi.
4. **Cache:** setelah update post, buka `/blogs` di tab lain tanpa reload → data harus segar (membuktikan `invalidateQueries` masih memakai key yang sama).
5. **`redirect`/`notFound`:** bila E-003 diterapkan pada route yang memanggilnya, pastikan tetap 307/404, bukan 500.
6. **`Project.slug` (K-2):** jalankan cek duplikat **sebelum** migrasi:
   ```sql
   SELECT slug, COUNT(*) FROM "Project" GROUP BY slug HAVING COUNT(*) > 1;
   ```
   Kosong → lanjut migrasi. Ada isi → **tunda migrasi**, perbaiki data manual, ulangi cek.
7. **Responsive:** 375px, 768px, 1440px untuk list & detail (pagination 88 baris × 2 adalah kandidat utama rusak).

### Estimasi total

| Fase | Estimasi |
|---|---|
| 0 — Gate | 0,5 hari |
| 1 — Fondasi | 0,5 hari |
| 2 — Validasi & error | 1,5 hari |
| 3 — Server & route | 2 hari |
| 4 — Hooks & cache | 1,5 hari |
| 5 — UI | 2 hari |
| **Total Fase 0–5** | **±8 hari** (tanpa Fase 0: ±7,5 hari) |
| 6 — Opsional (K-3/K-8/K-7/K-4) | +1–1,5 hari, **hanya bila disetujui** |

Estimasi mengasumsikan satu orang yang sudah familiar dengan codebase, tanpa perubahan lingkup (mis. penambahan fitur atau desain ulang). Fase 6 tidak termasuk dalam total karena eksekusinya menunggu persetujuan terpisah.

---

## Berkas lain

| File | Isi |
|---|---|
| [decisions.md](./decisions.md) | Seluruh keputusan K-1…K-14 + hasil cek K-11/K-12 |
| [not-extracted.md](./not-extracted.md) | Daftar yang **sengaja tidak** diekstrak (anti over-engineering) |
| [audit-file-map.md](./audit-file-map.md) | Tabel audit per file (file · masalah · usulan · alasan) |
| [reusability-analysis.md](./reusability-analysis.md) | Penunjuk ke README (isi lama sudah dipecah) |
