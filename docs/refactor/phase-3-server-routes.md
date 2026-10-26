# Fase 3 — Server data & route dedup

> Bagian dari rencana refactor. Indeks: [README](./README.md) · Keputusan: [decisions.md](./decisions.md)

**Keputusan terkait:** `K-1`, `K-2`, `K-3`, `K-4`, `K-7` — lihat [decisions.md](./decisions.md).

---

## Langkah eksekusi

| Langkah | Temuan | Catatan |
|---|---|---|
| 3.1 | R-008 | `src/lib/prisma-selects.ts` — selesai 19 Okt 2026 (5/5 lokasi) |
| 3.2 | R-009 | `src/lib/serialize.ts`; **`publishedAt` tidak diubah/ditambah** (K-4) — selesai 19 Okt 2026 (6/6 lokasi) |
| 3.3 | R-010 | `get-posts-data.ts` + wrapper lama; config-driven — selesai 19 Okt 2026 |
| 3.4 | R-001 | factory handler post guest (list, detail, like, view) berbasis `PostTypeConfig`; **verifikasi cookie `visitor_id` masih ter-set**; `revalidatePath` tetap (K-7) — guest selesai 19 Okt 2026 (8 route) |
| 3.5 | R-001 | factory handler post admin (list, item, featured) — selesai 19 Okt 2026 (6 route) |
| 3.6 | R-007 | taxonomy API helper — **DIBATALKAN** 26 Okt 2026 (dilewati 19 Okt 2026, lalu dipastikan tidak dikerjakan) |
| 3.7 | R-020 (sebagian) | hapus import mati, duplikasi hapus-project, `console.log`. **Route `/api/guest*` dan 2 hook-nya TIDAK dihapus** (K-3); komentar TODO ditambahkan — selesai 19 Okt 2026 (5 import, `delete-project.tsx` dihapus; 3 `console.log` target sudah tidak ada; `showErrorToast` tidak disentuh) |
| 3.8 | **K-2 (bagian 2)** | Cek duplikat `Project.slug` → bila kosong: tambah `@unique` + `prisma migrate dev` + `generate`; bila ada duplikat: **tunda migrasi** dan laporkan daftar slug |

**Gate:** semua endpoint guest & admin diuji manual (GET list, GET detail, PATCH like dua kali, PATCH view, CRUD post, CRUD category/tag). Untuk K-2: hasil query duplikat dilampirkan di PR.
**Commit:** `refactor(api): share post handlers` + commit terpisah `feat(db): add unique constraint on Project.slug` (hanya bila cek duplikat bersih)

---

## Temuan dalam fase ini

Blok temuan dikutip utuh dari laporan asal. Untuk temuan yang dieksekusi bertahap, blok lengkap ada di fase pemiliknya dan fase ini memuat ringkasan field wajib.

### R-008 — Bentuk `select` post diulang 5×

- **Kategori:** Duplikasi query shape Prisma
- **Lokasi:** `src/app/api/guest/blogs/route.ts:84-110`, `src/app/api/guest/writings/route.ts:84-110`, `src/app/api/guest/featured/blogs/route.ts:10-25`, `src/app/api/guest/route.ts:16-39`, `src/lib/server/get-home-data.ts:16-31`
- **Jumlah pemakaian:** 5 (4 di API, 1 di server fetcher) — memenuhi ambang ≥3.
- **Potongan kode:**

```ts
select: {
  slug: true, excerpt: true, coverImage: true, updatedAt: true,
  title: true, viewCount: true, readingTime: true, createdAt: true,
  category: { select: { name: true, slug: true } },
  tags: { select: { tag: { select: { name: true, slug: true } } } },
}
```

- **Usulan:** `src/lib/prisma-selects.ts` (server-safe, tanpa `server-only` agar bisa dipakai `src/lib/server` dan route):

```ts
export const postListSelect = { /* field di atas */ } satisfies Prisma.PostSelect;
export const postDetailSelect = { /* + content */ } satisfies Prisma.PostSelect;
export const postCardSelect = { /* subset untuk home/featured */ } satisfies Prisma.PostSelect;
```

  `guest/featured` dan `guest/route` tidak butuh `updatedAt`; sediakan dua varian (`postCardSelect` vs `postListSelect`) daripada memaksa satu bentuk.
- **Server/Client:** server only secara pemakaian.
- **File terdampak:** 5 file.
- **Prioritas:** **Sedang**
- **Risiko:** Rendah. Tipe `satisfies Prisma.PostSelect` menangkap field salah saat compile.
- **Estimasi usaha:** 2 jam.

### R-009 — Serialisasi tanggal post diulang 6×

- **Kategori:** Duplikasi transformasi batas server→client
- **Lokasi:** `src/app/api/guest/blogs/[slug]/route.ts:36-37`, `src/app/api/guest/writings/[slug]/route.ts:36-37`, `src/app/(guest)/blogs/[slug]/page.tsx:85-86`, `src/app/(guest)/writings/[slug]/page.tsx:85-86`; pola sama untuk project di `src/app/(guest)/projects/[slug]/page.tsx:64-66` dan `src/app/api/guest/projects/[slug]/route.ts:23-25`
- **Jumlah pemakaian:** 6 (4 post + 2 project).
- **Potongan kode:**

```ts
createdAt: blog.createdAt.toISOString(),
updatedAt: blog.updatedAt.toISOString(),
```

- **Usulan:** `src/lib/serialize.ts` → `serializePost<T>(post: T): SerializedPost<T>`, `serializeProject<T>(project: T)`, `serializeDates<T>(obj, keys)`. Dipakai di route handler **dan** server component (fungsi murni, tidak butuh `server-only`).
- **Server/Client:** shared murni.
- **File terdampak:** 6 file.
- **Prioritas:** **Sedang**
- **Risiko:** Rendah. **K-4:** `publishedAt` **tidak** ditambahkan ke select/serializer dan schema tidak diubah. Bila kelak dipakai, tambahkan eksplisit saat itu — bukan sekarang. Tipe generik cukup menjaga field yang memang sudah di-select (`createdAt`, `updatedAt`).
- **Estimasi usaha:** 2 jam.
- **Keputusan terkait:** K-4 (jangan diubah).

### R-010 — `getBlogsData` vs `getWritingsData` identik

- **Kategori:** Duplikasi server fetcher
- **Lokasi:** `src/lib/server/get-blogs-data.ts:5-75` ↔ `src/lib/server/get-writings-data.ts:5-75` (diff hanya literal `BLOG`/`WRITING` dan nama key hasil)
- **Jumlah pemakaian:** 2 file; masing-masing dipakai 1 page (`blogs/page.tsx:29`, `writings/page.tsx:29`). Aturan filter `type + PUBLISHED` muncul di 2 fetcher + 2 route list + sitemap = 5 tempat.
- **Potongan kode:**

```ts
const [blogs, totalCount, categories, tags] = await Promise.all([
  prisma.post.findMany({ where: { type: "BLOG", status: "PUBLISHED" }, ... }),
  prisma.post.count({ where: { type: "BLOG", status: "PUBLISHED" } }),
  prisma.category.findMany({ where: { posts: { some: { type: "BLOG", status: "PUBLISHED" } } }, ... }),
  prisma.tag.findMany({ where: { posts: { some: { post: { type: "BLOG", status: "PUBLISHED" } } } }, ... }),
]);
```

- **Usulan:** `src/lib/server/get-posts-data.ts` → `export const getPostsData = cache(async (config: PostTypeConfig) => ...)`; `get-blogs-data.ts` dan `get-writings-data.ts` menjadi wrapper satu baris (`getPostsData(POST_TYPE_CONFIG[PostType.BLOG])`) agar import page tidak berubah. Semua perbedaan (label, filter `type`, urutan) berasal dari config, bukan cabang internal (K-1).
- **Server/Client:** **wajib** `import "server-only"`.
- **File terdampak:** 2 file lama + 1 baru + 2 page.
- **Prioritas:** **Sedang**
- **Risiko:** Rendah. `cache()` React mememo berdasarkan argumen — objek config harus **stabil** (konstanta modul, bukan literal inline) agar memoization tidak selalu miss. `POST_TYPE_CONFIG` memenuhi syarat ini.
- **Estimasi usaha:** 2 jam.
- **Keputusan terkait:** K-1.

### R-001 — Route API Blog/Writing identik (4 pasang)

- **Kategori:** Duplikasi logika server (copy-paste dengan satu literal berbeda)
- **Lokasi:**
  - `src/app/api/guest/blogs/route.ts:19-22` ↔ `src/app/api/guest/writings/route.ts:19-22`
  - `src/app/api/guest/blogs/[slug]/route.ts:11-19` ↔ `src/app/api/guest/writings/[slug]/route.ts:11-19`
  - `src/app/api/guest/blogs/[slug]/like/route.ts:36-39,48-59,102-106` ↔ `src/app/api/guest/writings/[slug]/like/route.ts:36-39,48-59,102-106`
  - `src/app/api/guest/blogs/[slug]/view/route.ts:12-28` ↔ `src/app/api/guest/writings/[slug]/view/route.ts:12-28`
  - `src/app/api/admin/blogs/route.ts` ↔ `src/app/api/admin/writings/route.ts` (diff: hanya `type`, label, log tag)
  - `src/app/api/admin/blogs/[slug]/route.ts` ↔ `src/app/api/admin/writings/[slug]/route.ts` (diff: hanya `type`, pesan, path revalidate)
  - `src/app/api/admin/posts/[slug]/featured/route.ts:7-56` ↔ `src/app/api/project/[slug]/featured/route.ts:7-55` (pola toggle featured)
- **Jumlah pemakaian:** 4 pasang route Blog↔Writing (8 file) + 1 pasang toggle featured (2 file). ±1.100 baris dengan duplikasi >90%.
- **Potongan kode:**

```ts
// api/guest/blogs/route.ts:19-22  ==  api/guest/writings/route.ts:19-22
const whereClause: any = {
  type: "BLOG",          // hanya ini yang berbeda: "WRITING"
  status: "PUBLISHED",
};

// api/guest/blogs/[slug]/like/route.ts:4-23 == writings/.../like/route.ts:4-23
function getVisitorId(request: NextRequest): string | null {
  return request.cookies.get("visitor_id")?.value ?? null;
}
```

- **Usulan (config-driven, sesuai K-1):**
  - `src/lib/post-type-config.ts` — **satu sumber kebenaran** per tipe. Semua perbedaan yang sah (label, path revalidate, pesan 404, log tag, fitur yang aktif) dinyatakan di sini, **bukan** sebagai `if (type === "BLOG")` di dalam handler:

```ts
export type PostFeatureFlags = {
  like: boolean;
  view: boolean;
  comments: boolean;
  readingTime: boolean;
};

export type PostTypeConfig = {
  type: PostType;
  slug: "blogs" | "writings";
  label: string;              // "Blog" | "Writing"
  labelPlural: string;        // "Blogs" | "Writings"
  revalidatePaths: string[];  // ["/", "/blogs"] dst.
  notFoundMessage: string;
  logTag: string;
  features: PostFeatureFlags;
};

export const POST_TYPE_CONFIG: Record<PostType, PostTypeConfig> = { ... };
```

  - `src/lib/api/post-list.ts` → `buildPostListQuery(config, filters)` + `POST_LIST_SELECT`
  - `src/lib/api/post-detail.ts` → `createGuestPostDetailHandler(config)`
  - `src/lib/api/post-reaction.ts` → `createGuestPostReactionHandlers(config)`; bila `config.features.like === false`, handler mengembalikan 404/405 secara eksplisit (bukan crash).
  - Signature route: `export const { GET } = createGuestPostDetailHandler(POST_TYPE_CONFIG[PostType.BLOG])` — route file tetap tipis dan tipe tetap eksplisit.
  - Admin: `createAdminPostCollectionHandlers(config)` dan `createAdminPostItemHandlers(config)`.
  - **Larangan:** jangan membuat `handlePost(type)` dengan cabang internal per tipe; semua cabang harus lewat config agar Writing bisa divergen tanpa menyentuh handler.
  - **K-7:** `revalidatePath("/")` pada `view` **dipertahankan**. Nilainya ditaruh di `config.revalidatePaths` agar tetap eksplisit per tipe, tetapi isinya tidak diubah pada refactor ini.
- **Server/Client:** server only (route handler). Helper di `src/lib/api/*` tanpa `"use client"`, boleh `import "server-only"`.
- **File terdampak:** 10 route file + `src/lib/api/*` (baru) + hook yang memanggil URL (tidak berubah bila URL dipertahankan).
- **Prioritas:** **Tinggi**
- **Risiko:** Sedang. `diff` membuktikan perilaku identik, tetapi route `like` menyentuh cookie `visitor_id` — pastikan `Set-Cookie` tetap di-set pada respons yang sama. Revalidate path berbeda per tipe harus tetap diparametrisasi lewat `config.revalidatePaths` (lihat K-7: perilaku sekarang dipertahankan).
- **Estimasi usaha:** 1,5 hari.
- **Keputusan terkait:** K-1 (config-driven), K-6 (cookie `visitor_id` saja), K-7 (revalidate tetap).

### R-007 — CRUD taxonomy Category/Tag kembar (API + halaman + hook)

> **DIBATALKAN 26 Okt 2026.** R-007 tidak dikerjakan. Blok ini dipertahankan sebagai catatan audit — jangan buat `lib/api/taxonomy.ts`, `TaxonomyManager`, atau `useTaxonomyHooks`.

- **Kategori:** Duplikasi CRUD dengan model berbeda, aturan sama
- **Lokasi:**
  - API: `src/app/api/admin/category/route.ts:7-10,13-30,43-67`, `category/[id]/route.ts:7-10,21-59,78-95` ↔ `tag/route.ts`, `tag/[id]/route.ts` (diff hanya nama model)
  - Hook: `src/hooks/react-query/admin/category/use-mutation.tsx:5-8,18-40,57-77,94-114` ↔ `tag/use-mutation.tsx` (identik + `console.log(id)` di :56)
  - Halaman: `src/app/(admin)/admin/categories/page.tsx:75-145,164-413` ↔ `tags/page.tsx:69-139,158-406`
- **Jumlah pemakaian:** 4 route file, 2 file hook, 2 halaman = **8 file**; `categorySchema`/`tagSchema` identik; `TagFormData` didefinisikan 2×.
- **Potongan kode:**

```ts
// category/route.ts:7-10 == tag/route.ts:7-10
const categorySchema = z.object({
  name: z.string().min(1, "Title is required"),
  color: z.string().optional(),
});
```

- **Usulan:**
  - `src/lib/api/taxonomy.ts` → `createTaxonomyHandlers({ model: "category" | "tag", revalidate: string[], label: string })`
  - `src/types/validation/taxonomy.ts` → `taxonomySchema`, `TaxonomyInput`
  - `src/components/reusable/admin/taxonomy/TaxonomyManager.tsx` — props `{ title, description, entityLabel, useList, useCreate, useUpdate, useDelete, icon }`; satu tabel + dialog + alert hapus.
  - `categories/page.tsx` dan `tags/page.tsx` menjadi konfigurasi ±30 baris.
- **Server/Client:** API helper server; `TaxonomyManager` client.
- **File terdampak:** 8 file + 3 file baru.
- **Prioritas:** **Tinggi**
- **Risiko:** Sedang. Category punya `description` di schema Prisma tetapi **tidak** dipakai di form/schema saat ini — jangan "sekalian" menambahkannya. Perbedaan `take`/`orderBy` di route GET (`_count.posts desc` vs `createdAt desc`) harus dipertahankan lewat config.
- **Estimasi usaha:** 1 hari.

### R-020 — Dead code & import tak terpakai

- **Kategori:** Sisa refactor
- **Lokasi:**
  - Hook tak terpakai: `src/hooks/react-query/guest/use-query.tsx:5` (`useGetDataHome`, 0 consumer), `src/hooks/react-query/guest/projects/use-query.tsx:4` (`useGetGuestProjects`, 0 consumer), `src/hooks/use-upload-file.ts:247` (`showErrorToast`, 0 consumer)
  - Route **tanpa consumer terverifikasi** (K-3: **JANGAN dihapus** di refactor ini): `src/app/api/guest/route.ts` (hanya dipanggil `useGetDataHome`), `src/app/api/guest/projects/route.ts` (hanya `useGetGuestProjects`)
  - Import tak terpakai: `(admin)/admin/writings/create/page.tsx:5` (`useCreateBlog`), `(admin)/admin/blogs/[slug]/page.tsx:7` (`useCreateBlog`), `(admin)/admin/categories/page.tsx:40` (`useAdminTag`), `:44-46` (`useCreateTag/useUpdateTag/useDeleteTag`), `hooks/react-query/admin/blogs/use-mutation.tsx:2` (`ProjectFormData`)
  - Duplikasi hapus project: `(admin)/admin/project/page.tsx:24-31` vs `components/reusable/admin/projects/delete-project.tsx:25-42`
  - `console.log` produksi: `hooks/react-query/admin/tag/use-mutation.tsx:56`, `(admin)/admin/about/experiences/page.tsx:72`, `.../current-activities/page.tsx:72`
- **Jumlah pemakaian:** 2 hook tanpa consumer, 2 route tanpa consumer, 5 import mati, 1 UI duplikat, 3 `console.log`.
- **Potongan kode:**

```ts
// src/hooks/react-query/guest/use-query.tsx:5 — hanya deklarasi, 0 consumer
export const useGetDataHome = () => { ... };
```

- **Usulan (disesuaikan K-3):**
  - **Boleh dikerjakan sekarang:** hapus 5 import mati, hapus duplikasi hapus-project di `project/page.tsx:24-31`, hapus 3 `console.log` debugging. Ini murni kebersihan kode tanpa dampak perilaku.
  - **DITUNDA:** `src/app/api/guest/route.ts`, `src/app/api/guest/projects/route.ts`, `useGetDataHome`, `useGetGuestProjects`. **Jangan dihapus** di refactor ini. Tambahkan komentar penanda di kode saat Fase 3 selesai, misalnya `// TODO(cleanup): kandidat penghapusan — menunggu konfirmasi pemakaian eksternal (K-3)`.
  - Kandidat penghapusan dicatat sebagai **Fase 6 (opsional, terpisah)** di [Fase 6](./phase-6-optional.md) dan hanya dieksekusi setelah user mengonfirmasi.
  - Untuk import mati: jalankan `npx tsc --noEmit` + ESLint sekali untuk daftar lengkap, atau aktifkan `@typescript-eslint/no-unused-vars`.
- **Server/Client:** campuran.
- **File terdampak:** 8 file (tidak termasuk 2 route + 2 hook yang ditunda).
- **Prioritas:** **Rendah**
- **Risiko:** Rendah setelah K-3: bagian berisiko (route) dikeluarkan dari scope. Sisa pekerjaan tidak mengubah perilaku.
- **Estimasi usaha:** 1 jam (turun dari 1,5 jam).
- **Keputusan terkait:** K-3.

---

## Catatan verifikasi fase ini

- **Gate:** `npm run verify` hijau.
- **Endpoint guest:** GET list blog/writing (search, tag, category, sort, pagination), GET detail, PATCH view, PATCH like.
- **Endpoint admin:** GET list, GET detail, POST create, PUT update, DELETE, PATCH featured.
- **Like (K-6):** PATCH dua kali dari browser yang sama → `liked` `false` pada panggilan kedua; `Set-Cookie` hanya pada panggilan pertama.
- **View (K-7):** `revalidatePath("/")` **tetap ada**; pastikan `viewCount` naik 1× per panggilan.
- **`publishedAt` (K-4):** tidak muncul di respons; schema tidak berubah.
- **`Project.slug` (K-2 bagian 2):** jalankan cek duplikat **sebelum** migrasi:
  ```sql
  SELECT slug, COUNT(*) FROM "Project" GROUP BY slug HAVING COUNT(*) > 1;
  ```
  Kosong → lanjut migrasi. Ada isi → **tunda migrasi**, laporkan daftar slug, perbaiki manual, ulangi cek. Hasil query dilampirkan di PR.
- **Route `/api/guest*` (K-3):** masih ada dan masih merespons; hanya ditambahi komentar TODO.

Verifikasi global (halaman minimum & cek regresi): [README](./README.md#verifikasi-global).
