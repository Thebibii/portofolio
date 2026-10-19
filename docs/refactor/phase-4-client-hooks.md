# Fase 4 — Client hooks & cache

> Bagian dari rencana refactor. Indeks: [README](./README.md) · Keputusan: [decisions.md](./decisions.md)

**Keputusan terkait:** `K-1` — lihat [decisions.md](./decisions.md).

---

## Langkah eksekusi

| Langkah | Temuan | Catatan |
|---|---|---|
| 4.1 | R-002 | `createAdminPostHooks(config)` / `createGuestPostHooks(config)`; file lama jadi re-export |
| 4.2 | R-013 (lanjutan) | ganti literal `queryKey` di 22 hook + 22 invalidation |
| 4.3 | E-008 | aktifkan `defaultOptions`; hapus `refetchOnWindowFocus` per-hook |
| 4.4 | R-007 (client) | `useTaxonomyHooks` untuk category/tag |
| 4.5 | E-006 | perbaiki fallback pesan di factory (sekali saja) |
| 4.6 | E-007 | `QueryState`/`ErrorState`; perbaiki toast saat render di about page |

**Gate:** create/update/delete blog → list ter-refresh tanpa reload; network tab: tidak ada request berulang dalam 60 detik; 401 tidak di-retry.
**Commit:** `refactor(hooks): unify post/taxonomy query hooks and query client defaults`

---

## Temuan dalam fase ini

Blok temuan dikutip utuh dari laporan asal. Untuk temuan yang dieksekusi bertahap, blok lengkap ada di fase pemiliknya dan fase ini memuat ringkasan field wajib.

### R-002 — Hook React Query Blog/Writing identik

- **Kategori:** Duplikasi lapisan client cache
- **Lokasi:**
  - `src/hooks/react-query/admin/blogs/use-query.tsx:17-22,24-31,33,44-52` ↔ `admin/writings/use-query.tsx` (satu-satunya beda: nama export di baris 44)
  - `src/hooks/react-query/admin/blogs/use-mutation.tsx:15-36,52-74,136-158` ↔ `admin/writings/use-mutation.tsx:14-35,51-73,90-112`
  - `src/hooks/react-query/guest/blogs/use-query.tsx:16-40,61-70` ↔ `guest/writings/use-query.tsx:16-40,61-82`
  - `src/hooks/react-query/guest/blogs/use-mutation.tsx:8-40,46-75` ↔ `guest/writings/use-mutation.tsx:8-28,34-63`
- **Jumlah pemakaian:** 4 pasang file (8 file), 3 export per file = 24 export; ±430 baris duplikat.
- **Potongan kode:**

```ts
// admin/blogs/use-query.tsx:24-31 == admin/writings/use-query.tsx:24-31
const params = new URLSearchParams();
params.set("page", String(page));
params.set("limit", String(limit));
if (search) params.set("search", search);
if (status) params.set("status", status);
if (categoryId) params.set("categoryId", categoryId);
if (tagId) params.set("tagId", tagId);
```

- **Usulan:** `src/hooks/react-query/admin/use-admin-posts.ts` dengan factory yang menerima **config**, bukan `type` mentah (K-1):

```ts
export function createAdminPostHooks(config: PostTypeConfig) {
  return {
    useList: (filters: AdminPostFilters = {}) => useQuery({ ... }),
    useBySlug: ({ slug }: { slug: string }) => useQuery({ ... }),
    useCreate: (opts) => useMutation({ ... }),
    useUpdate: ({ slug, ...opts }) => useMutation({ ... }),
    useDelete: (opts) => useMutation({ ... }),
  };
}
export const blogHooks = createAdminPostHooks(POST_TYPE_CONFIG[PostType.BLOG]);
export const writingHooks = createAdminPostHooks(POST_TYPE_CONFIG[PostType.WRITING]);
```

  URL endpoint dibentuk dari `config.slug` (`/admin/${config.slug}`), sehingga perbedaan path tetap terpusat di config. Pesan toast memakai `config.label`/`config.labelPlural`.
  File lama tetap ada sebagai re-export tipis agar import 12 halaman tidak berubah sekaligus. `useToggleFeaturedPost` hanya ada di file blogs dan dipakai juga oleh writings — pindahkan ke `admin/posts/use-featured.ts` (bukan ke factory).
- **Server/Client:** client (file hook hanya memakai `@tanstack/react-query`; saat ini pun tanpa directive — pertahankan).
- **File terdampak:** 8 file hook + 12 halaman admin + 4 komponen guest.
- **Prioritas:** **Tinggi**
- **Risiko:** Rendah–Sedang. `queryKey` harus tetap persis (`["get.admin.blogs", ...]`) agar invalidation lama tetap jalan; kalau tidak, data basi setelah create/update.
- **Estimasi usaha:** 1 hari.

#### R-013 — Key React Query sebagai string literal tersebar

> Lanjutan dari [Fase 1](./phase-1-foundation.md). Blok lengkap: lihat fase tersebut.

- **Lokasi:** 22 `invalidateQueries` di 12 file, mis. `admin/categories/page.tsx:91,100,110`, `admin/tags/page.tsx:85,94,104`, `admin/project/page.tsx:29,36`, `FormCreateProject.tsx:84`, `form-edit-project.tsx:105-106`, `delete-project.tsx:27`, `blogs/page.tsx:95,107`, `blogs/create/page.tsx:23`, `blogs/[slug]/page.tsx:31-33`, `writings/page.tsx:93,105`, `writings/create/page.tsx:24`, `writings/[slug]/page.tsx:27-29`, `about/experiences/page.tsx:59`, `about/current-activities/page.tsx:59`

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

- **Risiko:** Rendah, tapi bila ada salah ketik justru makin sulit dilacak — sediakan tipe `as const` dan biarkan TypeScript menangkap.

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

#### E-006 — Pesan error client salah karena copy-paste

> Lanjutan dari [Fase 2](./phase-2-validation-errors.md). Blok lengkap: lihat fase tersebut.

- **Lokasi:** `src/hooks/react-query/admin/about/use-mutation.tsx:28,68,105,145` ("Gagal membuat category"), `src/hooks/react-query/admin/projects/use-mutation.tsx:65` ("Gagal membuat project" pada operasi update), `src/hooks/react-query/admin/writings/use-mutation.tsx:65` (pesan update menyebut create)

- **Usulan:** Sediakan `getErrorMessage(error, fallback)` di `src/lib/errors.ts`, dan fallback spesifik per aksi: `"Gagal menambahkan pengalaman"`, `"Gagal memperbarui project"`, dst. Setelah R-002/R-007, pesan ini otomatis terpusat di factory — jangan perbaiki dua kali.

- **Risiko:** Sangat rendah.

### E-007 — Tidak ada error state yang konsisten di UI

- **Kategori:** UX error
- **Lokasi:** `src/app/(guest)/about/page.tsx:20` (toast dipanggil saat render, bukan di `useEffect`/`onError`), `src/app/(guest)/statistics/page.tsx` (tidak ada cabang error), `admin/blogs/page.tsx`/`writings/page.tsx` (hanya toast, tabel kosong tanpa pesan), `EmptyState` dipakai untuk kondisi error juga di beberapa tempat.
- **Jumlah pemakaian:** 4 pola berbeda untuk kondisi "fetch gagal" di 6 halaman.
- **Potongan kode:**

```tsx
// (guest)/about/page.tsx:20 — dipanggil di body komponen
if (error) {
  toast.error("Gagal memuat data", { description: "Silakan coba lagi nanti" });
}
```

- **Usulan:** `src/components/reusable/state/query-state.tsx` (client) — props `{ isLoading, isError, error, onRetry, skeleton?, empty? , children }`, plus `ErrorState` dengan tombol retry. Panggil `toast` di `useEffect` atau serahkan ke `onError` hook. Ini melengkapi R-017; kerjakan bersamaan.
- **Server/Client:** client.
- **File terdampak:** 6 halaman.
- **Prioritas:** **Sedang**
- **Risiko:** Rendah. Perbaiki juga bug toast-saat-render (bisa berulang setiap re-render).
- **Estimasi usaha:** 3 jam.

### E-008 — `QueryClient` global tanpa default → tidak ada retry/staleTime terdefinisi

- **Kategori:** Konfigurasi
- **Lokasi:** `src/provider/react-query.tsx:13-22` (blok `defaultOptions` dikomentari), `:22` `new QueryClient()`
- **Jumlah pemakaian:** 1 titik konfigurasi, berdampak ke 24 hook.
- **Potongan kode:**

```tsx
const [queryClient] = useState(
  () =>
    /*  new QueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000 } } }) */
    new QueryClient()
);
```

- **Usulan:** Aktifkan `defaultOptions`:

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) => (isUnauthorized(error) ? false : failureCount < 2),
      refetchOnWindowFocus: false,   // sudah di-set per-hook di guest; bisa diseragamkan
    },
    mutations: { retry: 0 },
  },
});
```

  Catatan: beberapa hook sudah menulis `refetchOnWindowFocus: false` per-hook; setelah default dipasang, duplikasi itu bisa dihapus (bagian dari R-002).
- **Server/Client:** client.
- **File terdampak:** 1 file (+ pembersihan opsi per-hook).
- **Prioritas:** **Sedang**
- **Risiko:** Sedang. Retry pada 401 memperlambat redirect login; 401 tidak di-retry. `staleTime` 60 detik bisa membuat data admin terasa tidak segar setelah edit — andalkan `invalidateQueries` (R-013) agar aman.
- **Estimasi usaha:** 1 jam.

---

## Catatan verifikasi fase ini

- **Gate:** `npm run verify` hijau.
- **Cache:** create/update/delete blog → list ter-refresh **tanpa reload**.
- **Key:** setelah update post, buka `/blogs` di tab lain tanpa reload → data segar (membuktikan `invalidateQueries` memakai key yang sama).
- **Network tab:** tidak ada request berulang dalam 60 detik (`staleTime`); 401 **tidak** di-retry.
- **Error UI (E-007):** toast tidak muncul berulang setiap re-render di `/about`; `ErrorState` punya tombol retry yang berfungsi.
- **Pesan error (E-006):** fallback per aksi benar (tidak ada "Gagal membuat category" pada mutasi pengalaman).

Verifikasi global (halaman minimum & cek regresi): [README](./README.md#verifikasi-global).
