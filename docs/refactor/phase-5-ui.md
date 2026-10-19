# Fase 5 — UI dedup

> Bagian dari rencana refactor. Indeks: [README](./README.md) · Keputusan: [decisions.md](./decisions.md)

**Keputusan terkait:** `K-1`, `K-5`, `K-9` — lihat [decisions.md](./decisions.md).

---

## Langkah eksekusi

| Langkah | Temuan | Catatan |
|---|---|---|
| 5.1 | R-005 | `usePostListUrlState` + `PostListShell` + `PaginationBar`; **reset ke page 1** saat filter berubah (K-5) |
| 5.2 | R-005 | `PostDetailLayout`; bagian like/view kondisional dari `config.features` (K-1) |
| 5.3 | R-006 | `PostListPage` admin; 6 halaman jadi tipis; **judul edit diperbaiki** (K-9) |
| 5.4 | R-007 (UI) | `TaxonomyManager`; categories/tags page jadi konfigurasi |
| 5.5 | R-016 | `ConfirmDeleteDialog` |
| 5.6 | R-017 | preset empty state + skeleton bersama |
| 5.7 | R-015 | `FilterBar` — **hanya** bila perilaku filter project disetujui; `SearchProject` boleh dibiarkan (lihat [not-extracted.md](./not-extracted.md)) |
| 5.8 | R-022 | inti upload bersama (opsional, boleh fase terpisah) |

**Gate:** screenshot before/after untuk 8 halaman (blogs, writings, blog detail, writing detail, admin blogs, admin writings, categories, tags); responsive 375px/768px/1440px. Uji khusus K-5: dari page 3, ubah filter → kembali ke page 1.
**Commit:** `refactor(ui): share post list, detail, and taxonomy components`

---

## Temuan dalam fase ini

Blok temuan dikutip utuh dari laporan asal. Untuk temuan yang dieksekusi bertahap, blok lengkap ada di fase pemiliknya dan fase ini memuat ringkasan field wajib.

### R-005 — Komponen client Blog/Writing identik (list 557/547, detail 189/192)

- **Kategori:** Duplikasi UI + state URL
- **Lokasi:**
  - `src/app/(guest)/blogs/_components/blogs-client.tsx:60-75` (`getPageList`), `:96` (debounce), `:116-192` (sinkronisasi URL), `:203-260` (handler tag/kategori/sort), `:434-522` (pagination)
  - `src/app/(guest)/writings/_components/writings-client.tsx:54-69`, `:90`, `:109-185`, `:196-255`, `:424-512`
  - `src/app/(guest)/blogs/[slug]/_components/blog-detail-client.tsx:49-189` ↔ `writing-detail-client.tsx:49-192`
- **Jumlah pemakaian:** 2 pasang komponen; 7 blok `URLSearchParams` per file; 2 salinan `getPageList`.
- **Potongan kode:**

```ts
// blogs-client.tsx:60-75 == writings-client.tsx:54-69
function getPageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const clamped = Math.min(Math.max(current, 2), total - 1);
  return [1, "ellipsis", clamped - 1, clamped, clamped + 1, "ellipsis", total];
}
```

- **Usulan:**
  - `src/hooks/use-post-list-url-state.ts` → `usePostListUrlState({ resetPageOnFilterChange = true })`. **Keputusan K-5: filter berubah → reset ke page 1** (perilaku Blog). Default `true`, dan perilaku ini yang dipakai kedua halaman.
  - `src/components/reusable/guest/post-list/PostListShell.tsx` (client) — props `{ config: PostTypeConfig, data, renderCard, isLoading, error, categories, tags }`. `config` menyediakan `label`, `labelPlural`, `slug` untuk copy dan URL, bukan hardcode "Blog"/"Writing".
  - `src/components/reusable/guest/pagination-bar.tsx` — pagination responsif yang sekarang 88 baris × 2.
  - `src/components/reusable/guest/post-detail-layout.tsx` — header, meta (tanggal, reading time, view, like), tags, cover, comments; props `{ post, config, backHref, backLabel }`. Bagian `like`/`view` dirender kondisional dari `config.features`, sehingga Writing bisa mematikannya nanti tanpa mengubah layout.
  - Nama file tetap `blogs-client.tsx`/`writings-client.tsx` sebagai wrapper tipis agar route tidak berubah.
- **Server/Client:** **client** (`"use client"`).
- **File terdampak:** 4 komponen + 4 page wrapper.
- **Prioritas:** **Tinggi**
- **Risiko:** Sedang–Tinggi (UI). Perbedaan perilaku yang ada sudah diputuskan: **reset ke page 1** (K-5), jadi Writing akan berubah perilaku (sebelumnya mempertahankan page). Ini perubahan yang diinginkan dan harus diuji manual: ubah filter saat berada di page 3 → harus kembali ke page 1 dan `?page` hilang dari URL.
- **Estimasi usaha:** 1,5 hari.
- **Keputusan terkait:** K-1 (config/props), K-5 (reset page).

### R-006 — Halaman admin blogs/writings identik

- **Kategori:** Duplikasi halaman + blok toast/invalidation
- **Lokasi:** `src/app/(admin)/admin/blogs/page.tsx:90-115,124-207` ↔ `src/app/(admin)/admin/writings/page.tsx:88-113,122-205`; create: `blogs/create/page.tsx:18-36` ↔ `writings/create/page.tsx:19-37`; edit: `blogs/[slug]/page.tsx:28-49` ↔ `writings/[slug]/page.tsx:24-45`
- **Jumlah pemakaian:** 3 pasang halaman (6 file), masing-masing ±200 baris.
- **Potongan kode:**

```tsx
// blogs/page.tsx:104-112 == writings/page.tsx:102-110
const { mutate: toggleFeatured } = useToggleFeaturedPost({
  onSuccess: (body) => { toast.success(body.message); },
  onError: (error) => { toast.error(error?.message || "Gagal mengubah featured status"); },
});
```

- **Usulan:** `src/components/reusable/admin/posts/PostListPage.tsx` (client) dengan props `{ config: PostTypeConfig, title, createHref, baseHref }`, memakai hook dari R-002. `blogs/page.tsx` dan `writings/page.tsx` menjadi 10–15 baris. Judul halaman edit diambil dari `config` sehingga perbaikan K-9 otomatis berlaku untuk kedua tipe.
- **Server/Client:** client.
- **File terdampak:** 6 halaman + 1 komponen baru.
- **Prioritas:** **Tinggi**
- **Risiko:** Rendah. Bergantung pada R-002; kerjakan setelahnya.
- **Estimasi usaha:** 6 jam.
- **Keputusan terkait:** K-1 (config), K-9 (judul edit diperbaiki).

#### R-007 — CRUD taxonomy Category/Tag kembar (API + halaman + hook)

> Lanjutan dari [Fase 3](./phase-3-server-routes.md). Blok lengkap: lihat fase tersebut.

- **Lokasi:**
  - API: `src/app/api/admin/category/route.ts:7-10,13-30,43-67`, `category/[id]/route.ts:7-10,21-59,78-95` ↔ `tag/route.ts`, `tag/[id]/route.ts` (diff hanya nama model)
  - Hook: `src/hooks/react-query/admin/category/use-mutation.tsx:5-8,18-40,57-77,94-114` ↔ `tag/use-mutation.tsx` (identik + `console.log(id)` di :56)
  - Halaman: `src/app/(admin)/admin/categories/page.tsx:75-145,164-413` ↔ `tags/page.tsx:69-139,158-406`

- **Usulan:**
  - `src/lib/api/taxonomy.ts` → `createTaxonomyHandlers({ model: "category" | "tag", revalidate: string[], label: string })`
  - `src/types/validation/taxonomy.ts` → `taxonomySchema`, `TaxonomyInput`
  - `src/components/reusable/admin/taxonomy/TaxonomyManager.tsx` — props `{ title, description, entityLabel, useList, useCreate, useUpdate, useDelete, icon }`; satu tabel + dialog + alert hapus.
  - `categories/page.tsx` dan `tags/page.tsx` menjadi konfigurasi ±30 baris.

- **Risiko:** Sedang. Category punya `description` di schema Prisma tetapi **tidak** dipakai di form/schema saat ini — jangan "sekalian" menambahkannya. Perbedaan `take`/`orderBy` di route GET (`_count.posts desc` vs `createdAt desc`) harus dipertahankan lewat config.

### R-015 — Komponen filter/pencarian admin terpisah & tidak konsisten

- **Kategori:** Duplikasi UI filter + dua sumber state berbeda
- **Lokasi:** `src/components/reusable/admin/search-content.tsx:1-160` (URL/debounce) dipakai `admin/blogs/page.tsx:132` dan `admin/writings/page.tsx:130`; `src/components/reusable/admin/projects/search-project.tsx` (state lokal + `useEffect`) dipakai `admin/project/page.tsx:68`
- **Jumlah pemakaian:** 3 (2× SearchContent, 1× SearchProject).
- **Potongan kode:**

```tsx
// search-content.tsx:53-64
const debouncedSearchTerm = useDebounce(searchTerm, 400);
useEffect(() => { setSearchTerm(search); }, [search]);
useEffect(() => { if (debouncedSearchTerm !== search) onSearchChange?.(debouncedSearchTerm); }, [debouncedSearchTerm]);
```

- **Usulan:** `src/components/reusable/admin/filter-bar.tsx` dengan props deklaratif `{ fields: Array<{ kind: "search" | "select"; key; label; options? }>, value, onChange }`, plus `useDebouncedUrlFilter()` untuk sinkronisasi URL. `SearchContent` dan `SearchProject` menjadi konfigurasi.
- **Server/Client:** client.
- **File terdampak:** 3 file + 1 baru.
- **Prioritas:** **Sedang**
- **Risiko:** Sedang. SearchProject saat ini **tidak** menulis ke URL (filter lokal) — menyatukan berarti mengubah perilaku project page. Bila tidak diinginkan, biarkan SearchProject dan hanya satukan SearchContent (2 pemakaian, di bawah ambang) → **jangan ekstrak**. Lihat [not-extracted.md](./not-extracted.md).
- **Status K-8:** pemindahan path `/api/project/**` **tidak dilakukan** di refactor ini, sehingga R-015 **tidak** bergantung pada rename path. Rekomendasi: **tunda R-015** atau kerjakan hanya bagian SearchContent bila ada kebutuhan nyata; jangan menyentuh SearchProject demi konsistensi kosmetik.
- **Estimasi usaha:** 3 jam (jika disetujui).

### R-016 — Dialog konfirmasi hapus berulang 5×

- **Kategori:** Duplikasi UI destruktif
- **Lokasi:** `src/components/reusable/admin/blogs/dropdown-blogs.tsx` (AlertDialog), `src/components/reusable/admin/projects/dropdown-project.tsx`, `src/components/reusable/admin/projects/delete-project.tsx:1-50`, `src/app/(admin)/admin/categories/page.tsx:50-58`, `src/app/(admin)/admin/tags/page.tsx:49-57`
- **Jumlah pemakaian:** 5 titik (3 komponen + 2 halaman).
- **Potongan kode:**

```tsx
<AlertDialog open={openDeleteAlertDialog} onOpenChange={setOpenDeleteAlertDialog}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={() => onDelete(post)}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

- **Usulan:** `src/components/reusable/admin/confirm-delete-dialog.tsx` — props `{ trigger, title, description, onConfirm, isPending? }`; `dropdown-blogs`/`dropdown-project` memakai dialog ini.
- **Server/Client:** client.
- **File terdampak:** 5 file + 1 baru.
- **Prioritas:** **Sedang**
- **Risiko:** Rendah (visual identik), tetapi jangan ubah copy tanpa persetujuan desain.
- **Estimasi usaha:** 2 jam.

### R-017 — Empty/loading state belum berpreset

- **Kategori:** Duplikasi presentasi state
- **Lokasi:** `EmptyState` dipakai 14× (`admin/blogs/page.tsx:146-177`, `admin/writings/page.tsx:144-175`, `admin/project/page.tsx:72-102`, `projects-client.tsx:22-59`, `featured-section.tsx:40-90`, `form-create-post.tsx:356-390`). Fallback empty ditulis inline 6×. Skeleton inline: `statistics/page.tsx:207-233` (27 baris), `admin/about/experiences/page.tsx:97-99`, `admin/about/current-activities/page.tsx:99-101`.
- **Jumlah pemakaian:** `EmptyState` 14 call site; skeleton inline 3 file; `LoadingState` 14 call site.
- **Potongan kode:**

```tsx
<EmptyState data={featured} emptyFallback={
  <div className="flex flex-col items-center justify-center py-16 text-center col-span-full">
    <Rocket className="h-12 w-12 text-muted-foreground/40 mb-3" />
    <h3 className="font-semibold">Belum ada projek unggulan</h3>
    <p className="text-sm text-muted-foreground mt-1">Nanti lagi ya.</p>
  </div>
}>
```

- **Usulan:**
  - `src/components/reusable/state/empty-state.tsx` → tambah varian `icon`, `title`, `description` agar tidak perlu menulis markup.
  - `src/components/reusable/state/empty-presets.tsx` → `EmptyProjects`, `EmptyPosts`, `EmptyTaxonomy`.
  - `src/components/reusable/skeleton/statistics-skeleton.tsx` (pindahkan dari halaman) dan `form-skeleton.tsx` generik untuk about pages.
  - Pertimbangkan menggabungkan `EmptyState` + `LoadingState` menjadi satu `QueryState` **hanya jika** error state ikut diseragamkan (E-007).
- **Server/Client:** `EmptyState` tanpa directive; karena menerima `children` ReactNode dan tidak memakai hook, biarkan tanpa directive.
- **File terdampak:** 8 file + 3 baru.
- **Prioritas:** **Sedang**
- **Risiko:** Rendah; risiko utama adalah menghapus copy yang sengaja berbeda per konteks (mis. "Nanti lagi ya."). Simpan copy di preset, bukan di komponen generik.
- **Estimasi usaha:** 3 jam.

### R-022 — Dua implementasi upload Supabase

- **Kategori:** Duplikasi integrasi storage
- **Lokasi:** `src/hooks/use-image-upload.ts:8-62` (delegasi ke `src/lib/imageUpload.ts:14-50`) vs `src/hooks/use-upload-file.ts:27-226` (reimplementasi upload di `:128-199`); keduanya memakai bucket/folder, `cacheControl: "3600"`, `upsert: false`, nama file `${Date.now()}-${random}.${ext}`, lalu `getPublicUrl`.
- **Jumlah pemakaian:** 2 hook, 2 consumer (`components/ui/image-uploader.tsx:33,174`, `components/ui/media-placeholder-node.tsx:61`).
- **Potongan kode:**

```ts
// use-upload-file.ts:130-134 (duplikat logika imageUpload.ts)
const timestamp = Date.now();
const randomString = Math.random().toString(36).substring(2, 15);
const fileExt = file.name.split(".").pop();
const fileName = `${timestamp}-${randomString}.${fileExt}`;
```

- **Usulan:** `src/lib/storage/upload.ts` → `uploadToBucket(file, { bucket, folder })` + `deleteFromBucket(path, bucket)`; `useImageUpload` dan `useUploadFile` menjadi pembungkus state/progress di atas satu inti. Simpan `useUploadFile` untuk fitur progress/validasi tipe (dipakai Plate).
- **Server/Client:** client.
- **File terdampak:** 4 file.
- **Prioritas:** **Rendah**
- **Risiko:** Sedang. `useUploadFile` punya validasi MIME & progress simulasi; `useImageUpload` tidak. Jangan menyamakan validasi tanpa keputusan produk.
- **Estimasi usaha:** 3 jam.

---

## Catatan verifikasi fase ini

- **Gate:** `npm run verify` hijau.
- **Screenshot before/after** untuk 8 halaman: `/blogs`, `/writings`, `/blogs/[slug]`, `/writings/[slug]`, `/admin/blogs`, `/admin/writings`, `/admin/categories`, `/admin/tags`.
- **Responsive:** 375px, 768px, 1440px untuk list & detail (pagination 88 baris × 2 kandidat utama rusak).
- **K-5 (wajib):** dari page 3, ubah filter → kembali ke page 1 dan `?page` hilang dari URL.
- **K-9:** judul halaman edit blog/writing **bukan** "Create New Post".
- **R-016:** dialog hapus tampil dan berfungsi di 5 titik.
- **R-017:** empty state dan skeleton tampil benar di statistics, about, dan list admin.

Verifikasi global (halaman minimum & cek regresi): [README](./README.md#verifikasi-global).
