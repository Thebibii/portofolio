# Fase 1 — Fondasi tanpa perubahan perilaku

> Bagian dari rencana refactor. Indeks: [README](./README.md) · Keputusan: [decisions.md](./decisions.md)

**Keputusan terkait:** `K-1`, `K-6`, `K-10` — lihat [decisions.md](./decisions.md).

---

## Langkah eksekusi

| Langkah | Temuan | Catatan |
|---|---|---|
| 1.1 | R-011 (rename slug util saja) | `genarate-slug.ts` + `unique-slug.ts` → `src/lib/slug.ts`; **belum** `@unique` |
| 1.2 | R-014 | `src/lib/visitor.ts`; **cookie saja, tanpa fallback IP** (K-6) |
| 1.3 | R-018 | `src/lib/format-date.ts` + re-export path lama |
| 1.4 | R-012 | `src/lib/seo/site.ts` + `metadata.ts`; `SITE_URL` pakai `||` fallback (K-10) |
| 1.5 | R-013 | `src/lib/react-query/keys.ts` (string lama dipertahankan) |
| 1.6 | R-021 | rename 22 file `.tsx` → `.ts` |
| 1.7 | R-023 | hapus 2 skeleton mati + rename 3 skeleton |
| 1.8 | **K-1** | `src/lib/post-type-config.ts` — dibuat sekarang sebagai fondasi, belum dipakai |

**Alasan urutan:** semua langkah ini murni pemindahan/penamaan; belum menyentuh logika. Fase 2–5 bergantung pada helper di sini.
**Gate:** `npm run verify` hijau.
**Commit:** `refactor(lib): extract slug, visitor, date, seo, query keys and post type config`

---

## Temuan dalam fase ini

Blok temuan dikutip utuh dari laporan asal. Untuk temuan yang dieksekusi bertahap, blok lengkap ada di fase pemiliknya dan fase ini memuat ringkasan field wajib.

### R-011 — Utilitas slug: nama file typo + aturan unik hanya untuk Post

- **Kategori:** Utilitas tersebar + aturan domain tidak konsisten
- **Lokasi:** `src/lib/genarate-slug.ts:1-9` (dipakai `api/admin/category/route.ts:1,51`, `category/[id]/route.ts:1,43`, `tag/route.ts:1,51`, `tag/[id]/route.ts:1,43`, `api/project/route.ts:1,68`, `api/project/[slug]/route.ts:9,182`); `src/lib/unique-slug.ts:10-35` (dipakai `admin/blogs/route.ts:6,163`, `blogs/[slug]/route.ts:8,98`, `admin/writings/route.ts:4,163`, `writings/[slug]/route.ts:8,98`)
- **Jumlah pemakaian:** `generateSlug` 6 file (8 call site); `generateUniquePostSlug` 4 file.
- **Potongan kode:**

```ts
// src/lib/genarate-slug.ts:1-8  (nama file typo "genarate")
export function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 50);
}
```

- **Usulan:**
  - `src/lib/slug.ts` → `normalizeSlug()` (fungsi murni, dipakai client/server), `generateUniqueSlug({ model, source, currentSlug })` generik untuk `post`/`project`/`category`/`tag`.
  - Hapus `genarate-slug.ts` + `unique-slug.ts` setelah semua import dipindah (import memakai path, bukan nama ekspor).
  - **K-2 disetujui:** tambahkan `@unique` pada `Project.slug` (`prisma/schema.prisma:119`) **beserta** `generateUniqueSlug` untuk project, sehingga `api/project/route.ts:68` dan `api/project/[slug]/route.ts:182` tidak lagi menulis slug yang mungkin bertabrakan.
  - **Urutan wajib (jangan dibalik):**
    1. Cek duplikat existing:
       ```sql
       SELECT slug, COUNT(*) FROM "Project" GROUP BY slug HAVING COUNT(*) > 1;
       ```
    2. Bila hasil **kosong** → ubah schema + `npx prisma migrate dev --name project_slug_unique` + `npx prisma generate`.
    3. Bila ada duplikat → **tunda migrasi**, laporkan daftar slug ke pemilik data, selesaikan manual (rename slug duplikat), baru ulangi langkah 1–2. Refactor kode tetap boleh jalan tanpa migrasi (helper slug tetap dipakai).
  - Pastikan `P2002` pada `Project.slug` dipetakan lewat `mapPrismaError` (E-004) menjadi **409**, bukan 500.
- **Server/Client:** shared (fungsi murni).
- **File terdampak:** 10 file.
- **Prioritas:** **Sedang**
- **Risiko:** Rendah untuk rename. Untuk `@unique`: sedang — migrasi bisa gagal bila ada duplikat. Karena itu cek duplikat adalah **langkah pertama yang wajib**, dan migrasi ditunda (bukan dipaksa) bila hasilnya tidak kosong. Pisahkan commit rename dari commit migrasi.
- **Estimasi usaha:** 2 jam (rename) + 2 jam (migrasi + verifikasi, bila tidak ada duplikat).
- **Keputusan terkait:** K-2.

### R-014 — Helper visitor/IP duplikat (cookie + header)

- **Kategori:** Duplikasi aturan identitas pengunjung
- **Lokasi:** `src/app/api/guest/blogs/[slug]/like/route.ts:4-6,8-15,17-23` ↔ `src/app/api/guest/writings/[slug]/like/route.ts:4-6,8-15,17-23` (identik)
- **Jumlah pemakaian:** 6 fungsi identik di 2 file (`getVisitorId`, `setVisitorIdCookie`, `getClientIp`); dipakai 2× per file.
- **Potongan kode:**

```ts
function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}
```

- **Usulan:** `src/lib/visitor.ts` (server, boleh `server-only`)

```ts
export const VISITOR_COOKIE = "visitor_id";
export function getVisitorId(request: NextRequest): string | null;
export function setVisitorIdCookie(response: NextResponse, id: string): void;
export function getClientIp(request: NextRequest): string;
export function resolveVisitor(request: NextRequest): { visitorId: string; isNew: boolean };
```

  **K-6:** identitas like tetap **cookie `visitor_id` saja** — tidak ada fallback IP, tidak ada anti-spam. Karena itu:
  - `getClientIp()` **tidak** diekspor dari `src/lib/visitor.ts` kecuali masih ada pemakaian nyata. Saat ini hasilnya di-assign tapi tidak dipakai (`:32` kedua file), jadi fungsi itu **dihapus** bersama pemindahan, bukan dipindahkan.
  - `resolveVisitor()` hanya mengurus cookie (baca, buat `crypto.randomUUID()`, set, dan kembalikan `isNew`).
  - `Like @@unique([visitorId, postId])` di `schema.prisma:207` tetap menjadi satu-satunya pengaman duplikasi.
- **Server/Client:** server only.
- **File terdampak:** 2 file + 1 baru (dan otomatis terpakai R-001).
- **Prioritas:** **Sedang**
- **Risiko:** Rendah. Perilaku cookie (`httpOnly:false`, `sameSite:"lax"`, `maxAge` 1 tahun) harus dipertahankan persis.
- **Estimasi usaha:** 1 jam.
- **Keputusan terkait:** K-6.

### R-018 — Format tanggal tersebar (helper + native)

- **Kategori:** Duplikasi formatting
- **Lokasi:** `src/hooks/use-formatted-date.ts:11-31` (`formattedDate`, 7 call site), `:35-55` (`formatCreatedUpdated`, 2 call site); duplikasi native `toLocaleDateString()` di `src/components/reusable/admin/blogs/admin-blogs-card.tsx:138` dan `src/components/reusable/admin/projects/admin-project-card.tsx:41`; `format(date, "PPP")` 6× di `experience-form.tsx:222,260`, `form-edit-project.tsx:303,343`, `FormCreateProject.tsx:371,411`.
- **Jumlah pemakaian:** 7 + 2 + 2 + 6 = 17 titik.
- **Potongan kode:**

```ts
// admin-project-card.tsx:41
return new Date(date).toLocaleDateString();
// admin-blogs-card.tsx:138
{new Date(post.createdAt).toLocaleDateString()}
```

- **Usulan:**
  - Pindahkan ke `src/lib/format-date.ts` (bukan `hooks/`, karena bukan hook) dan re-export dari path lama untuk kompatibilitas.
  - Tambah `formatShortDate()` (menggantikan `toLocaleDateString`) dengan locale `id` agar konsisten.
  - `DATE_FORMATS = { short: "d MMM yyyy", long: "d MMMM yyyy", month: "MMM yyyy", picker: "PPP" }`.
- **Server/Client:** shared murni. **Perhatian:** `format` dari `date-fns` dengan locale `id` aman di server dan client, tetapi output bisa beda zona waktu → tetapkan `timeZone` eksplisit bila dipakai di server component.
- **File terdampak:** 8 file.
- **Prioritas:** **Rendah**
- **Risiko:** Rendah. Perubahan tampilan tanggal bisa terlihat; samakan dengan screenshot.
- **Estimasi usaha:** 2 jam.

### R-012 — Base URL & metadata SEO diulang 13×

- **Kategori:** Duplikasi konfigurasi + blok metadata
- **Lokasi:** literal `https://thebibie.vercel.app` di `src/app/layout.tsx:24,34`, `src/app/page.tsx:7`, `src/app/(guest)/blogs/page.tsx:5`, `blogs/[slug]/page.tsx:12`, `writings/page.tsx:5`, `writings/[slug]/page.tsx:12`, `projects/page.tsx:5`, `projects/[slug]/page.tsx:12`, `statistics/layout.tsx:13`, `guestbook/layout.tsx:13`, `src/app/sitemap.ts:5`, `src/app/robots.ts:10`. Blok `openGraph`+`twitter` berulang di 3 list page (`blogs/page.tsx:15-25`, `writings/page.tsx:15-25`, `projects/page.tsx:15-31`) dan 3 detail page (`blogs/[slug]/page.tsx:44-57`, `writings/[slug]/page.tsx:44-57`, `projects/[slug]/page.tsx:40-52`).
- **Jumlah pemakaian:** 13 literal base URL (2 di `layout.tsx`); 6 blok metadata; 3 `generateMetadata`.
- **Potongan kode:**

```ts
// diulang identik di 3 file list
const baseUrl = "https://thebibie.vercel.app";
openGraph: {
  title: "... | The Bibi",
  description: "...",
  url: `${baseUrl}/blogs`,
  images: [{ url: "/profile.png", width: 1080, height: 1440, alt: "The Bibi" }],
},
twitter: { title: "...", description: "...", images: ["/profile.png"] },
```

- **Usulan:** `src/lib/seo/site.ts`

```ts
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thebibie.vercel.app";
export const SITE_NAME = "The Bibi";
export const DEFAULT_OG_IMAGE = { url: "/profile.png", width: 1080, height: 1440, alt: "The Bibi" };
export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();
```

  `src/lib/seo/metadata.ts` → `buildListMetadata({ title, description, path })` dan `buildPostMetadata({ title, description, path, image })`.
  `metadataBase` di `layout.tsx:24` memakai `SITE_URL`.
- **K-10 disetujui:** tambahkan `NEXT_PUBLIC_SITE_URL` dengan **fallback ke URL produksi saat ini** (`https://thebibie.vercel.app`) agar build tidak rusak bila env belum diset. Tambahkan juga ke `.env.example`:
  ```bash
  # Site URL (dipakai metadata, sitemap, robots). Fallback ke domain produksi bila kosong.
  NEXT_PUBLIC_SITE_URL="https://thebibie.vercel.app"
  ```
  **Wajib dikerjakan di luar repo:** set variabel yang sama di Vercel untuk environment **Production** dan **Preview** (dan `.env` lokal masing-masing developer).
- **Server/Client:** server (metadata API). Jangan import dari komponen client.
- **File terdampak:** 12 file + `.env.example`.
- **Prioritas:** **Sedang**
- **Risiko:** Rendah. Jangan mengubah teks copy SEO (di luar lingkup). Pastikan fallback benar-benar dipakai: `process.env.NEXT_PUBLIC_SITE_URL || "https://thebibie.vercel.app"` — jangan `??` bila env bisa berisi string kosong (`""` tidak dianggap null).
- **Estimasi usaha:** 3 jam.
- **Keputusan terkait:** K-10.

### R-013 — Key React Query sebagai string literal tersebar

- **Kategori:** Duplikasi kontrak cache (rawan typo → invalidation gagal senyap)
- **Lokasi:** 22 `invalidateQueries` di 12 file, mis. `admin/categories/page.tsx:91,100,110`, `admin/tags/page.tsx:85,94,104`, `admin/project/page.tsx:29,36`, `FormCreateProject.tsx:84`, `form-edit-project.tsx:105-106`, `delete-project.tsx:27`, `blogs/page.tsx:95,107`, `blogs/create/page.tsx:23`, `blogs/[slug]/page.tsx:31-33`, `writings/page.tsx:93,105`, `writings/create/page.tsx:24`, `writings/[slug]/page.tsx:27-29`, `about/experiences/page.tsx:59`, `about/current-activities/page.tsx:59`
- **Jumlah pemakaian:** 22 invalidation (24 kemunculan termasuk 2 komentar) + 22 deklarasi `queryKey` di hook.
- **Potongan kode:**

```ts
queryClient.invalidateQueries({ queryKey: ["get.admin.writings"] });
// ...dan di hook:
queryKey: ["get.admin.writings", { page, limit, search, status, categoryId, tagId }],
```

- **Usulan:** `src/lib/react-query/keys.ts`

```ts
export const qk = {
  admin: {
    about: ["get.admin.about"] as const,
    posts: (type: PostType) => [`get.admin.${type === PostType.BLOG ? "blogs" : "writings"}`] as const,
    post: (type: PostType, slug: string) => [...qk.admin.posts(type), slug] as const,
    categories: ["get.admin.category"] as const,
    tags: ["get.admin.tag"] as const,
    projects: ["get.admin.projects"] as const,
    project: (id: string) => ["get.admin.project", id] as const,
    dashboard: ["get.admin.dashboard"] as const,
  },
  guest: { /* ... */ },
};
```

  **Jaga string lama tetap sama** agar tidak perlu migrasi cache.
- **Server/Client:** shared murni.
- **File terdampak:** 24 hook + 12 halaman/komponen.
- **Prioritas:** **Sedang**
- **Risiko:** Rendah, tapi bila ada salah ketik justru makin sulit dilacak — sediakan tipe `as const` dan biarkan TypeScript menangkap.
- **Estimasi usaha:** 4 jam.

### R-021 — 22 file hook berekstensi `.tsx` tanpa JSX

- **Kategori:** Inkonsistensi konvensi file
- **Lokasi:** Semua `src/hooks/react-query/**/use-{query,mutation}.tsx` kecuali `guest/featured/use-query.ts` dan `guest/statistics/use-query.ts`.
- **Jumlah pemakaian:** 22 dari 24 file.
- **Potongan kode:** tidak ada JSX di file mana pun (hanya `useQuery`/`useMutation`).
- **Usulan:** rename `.tsx` → `.ts`. Import tidak menyertakan ekstensi, jadi tidak ada perubahan import.
- **Server/Client:** netral.
- **File terdampak:** 22 file (rename).
- **Prioritas:** **Rendah**
- **Risiko:** Sangat rendah. Lakukan setelah R-002 agar tidak konflik rename.
- **Estimasi usaha:** 15 menit.

### R-023 — Skeleton tak terpakai & penamaan tidak konsisten

- **Kategori:** Dead asset
- **Lokasi:** `src/components/reusable/skeleton/post-detail-skeleton.tsx` (0 pemakaian), `src/components/reusable/skeleton/project-detail-skeleton.tsx` (0 pemakaian); `AdminTagsSkeleton.tsx` dipakai juga oleh halaman Categories; `AdminBlogsSkeleton.tsx` dipakai juga oleh Writings.
- **Jumlah pemakaian:** 2 file 0 pemakaian; 2 file dengan nama menyesatkan (dipakai 2 domain).
- **Usulan:** Hapus 2 skeleton mati; rename `AdminTagsSkeleton` → `AdminTaxonomySkeleton`, `AdminBlogsSkeleton` → `AdminPostsSkeleton`, `BlogFormSkeleton` → `PostFormSkeleton` (nama file & export), lalu update 6 import.
- **Server/Client:** netral.
- **File terdampak:** 6 file.
- **Prioritas:** **Rendah**
- **Risiko:** Sangat rendah.
- **Estimasi usaha:** 30 menit.

---

## Catatan verifikasi fase ini

- **Gate:** `npm run verify` hijau.
- **Tidak ada perubahan perilaku yang diharapkan.** Semua langkah hanya memindahkan/rename.
- Smoke test: `/`, `/blogs`, `/writings`, `/projects`, `/blogs/[slug]`, `/writings/[slug]` render tanpa error console.
- Cek metadata: canonical & OG image di 3 list page + 3 detail page tidak berubah nilainya.
- Cek import lama: `genarate-slug.ts`/`unique-slug.ts` sudah tidak dirujuk (grep); `use-formatted-date.ts` dihapus dan seluruh import dipindah ke `@/lib/format-date`.
- Rename `.tsx` → `.ts` tidak boleh mengubah import (import tanpa ekstensi).

Verifikasi global (halaman minimum & cek regresi): [README](./README.md#verifikasi-global).
