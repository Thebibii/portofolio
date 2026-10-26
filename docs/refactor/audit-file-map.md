# Peta audit file

> Bagian dari rencana refactor. Indeks: [README](./README.md) · Keputusan: [decisions.md](./decisions.md)
>
> **Catatan 26 Okt 2026:** baris dengan usulan **R-007** bersifat historis — R-007 **dibatalkan** dan tidak akan dieksekusi. Lihat [README](./README.md).

| File | Masalah | Usulan | Alasan |
|---|---|---|---|
| `api/guest/blogs/route.ts` (144) | identik dengan writings kecuali `type` + log tag | R-001 | diff hanya 2 hunk |
| `api/guest/writings/route.ts` (144) | idem | R-001 | — |
| `api/guest/blogs/[slug]/route.ts` (48) | identik dengan writings detail | R-001 | — |
| `api/guest/writings/[slug]/route.ts` (48) | idem | R-001 | — |
| `api/guest/blogs/[slug]/like/route.ts` (129) | helper visitor/IP + GET/PATCH identik; catch tanpa log | R-001, R-014, E-002 | 3 helper × 2 file |
| `api/guest/writings/[slug]/like/route.ts` (129) | idem | R-001, R-014, E-002 | — |
| `api/guest/blogs/[slug]/view/route.ts` (39) | identik; `viewCount` di-select tapi tak dipakai; catch tanpa log | R-001, E-002 | — |
| `api/guest/writings/[slug]/view/route.ts` (39) | idem | R-001, E-002 | — |
| `api/admin/blogs/route.ts` (218) | `postSchema` + `listQuerySchema` duplikat; envelope beda dari guest | R-003, E-001 | schema 17 baris × 3 |
| `api/admin/writings/route.ts` (218) | idem | R-003, E-001 | — |
| `api/admin/blogs/[slug]/route.ts` (215) | identik dengan writings `[slug]`; campur `PostType.BLOG` dan literal `"BLOG"` | R-001, E-001 | — |
| `api/admin/writings/[slug]/route.ts` (215) | idem | R-001, E-001 | — |
| `api/admin/category/route.ts` (67) | `categorySchema` = `tagSchema`; CRUD kembar dengan tag | R-007, E-004 | model beda, aturan sama |
| `api/admin/tag/route.ts` (67) | idem | R-007, E-004 | — |
| `api/admin/category/[id]/route.ts` (95) | idem + P2025 mapping | R-007, E-004 | — |
| `api/admin/tag/[id]/route.ts` (95) | idem | R-007, E-004 | — |
| `api/project/route.ts` (93) | `projectSchema` duplikat; path legacy (rename ditunda) | R-004, K-8 | 2 salinan schema |
| `api/project/[slug]/route.ts` (210) | schema duplikat; `isValidCUID` heuristik; 500 GET `{message}` vs PUT `{error}` | R-004, E-001 | 1 file 2 envelope |
| `api/project/[slug]/featured/route.ts` (56) | kembar dengan `admin/posts/[slug]/featured` | R-001 | beda model/lookup |
| `api/admin/posts/[slug]/featured/route.ts` (57) | idem | R-001 | — |
| `api/guest/route.ts` (55) | tanpa consumer terverifikasi (hook `useGetDataHome`); select duplikat — **tidak dihapus** (K-3) | R-008, Fase 6 | 1 deklarasi, 0 consumer |
| `api/guest/about/route.ts` (30) | `orderBy` desc + `omitId`, admin asc tanpa `omitId` | [not-extracted.md](./not-extracted.md) | alasan berbeda → jangan digabung |
| `api/guest/projects/route.ts` (31) | tanpa consumer terverifikasi; dev-only raw error leak; catch tanpa log — **tidak dihapus** (K-3) | E-002, Fase 6 | — |
| `api/guest/projects/[slug]/route.ts` (35) | return full row termasuk `id` (inkonsisten `omitId`) | [not-extracted.md](./not-extracted.md) | perlu keputusan, bukan refactor |
| `api/guest/statistics/route.ts` (98) | blok BLOG & WRITING duplikat 2× | R-001 (pola) | 2 salinan select/aggregate |
| `lib/server/get-blogs-data.ts` (75) | identik dengan writings kecuali `type` | R-010 | 2 file |
| `lib/server/get-writings-data.ts` (75) | idem | R-010 | — |
| `lib/genarate-slug.ts` (9) | typo nama file; dipakai 6 file | R-011 | rename aman |
| `lib/unique-slug.ts` (35) | hanya untuk Post; Project slug tak unik di schema | R-011, K-2 | `Project.slug` tanpa `@unique` |
| `lib/helper.ts` (13) | `omitId(obj: any)`, hanya 3 file | [not-extracted.md](./not-extracted.md) | terlalu kecil, cukup diberi tipe |
| `hooks/react-query/admin/blogs/use-query.tsx` | identik dengan writings | R-002 | diff 1 baris nama export |
| `hooks/react-query/admin/writings/use-query.tsx` | idem | R-002 | — |
| `hooks/react-query/admin/blogs/use-mutation.tsx` | identik; import `ProjectFormData` tak dipakai; `useToggleFeaturedPost` hanya di sini | R-002, R-020 | — |
| `hooks/react-query/admin/writings/use-mutation.tsx` | idem | R-002 | — |
| `hooks/react-query/guest/blogs/{use-query,use-mutation}.tsx` | identik dengan writings | R-002 | error handling writings lebih baik |
| `hooks/react-query/guest/writings/{use-query,use-mutation}.tsx` | idem | R-002 | — |
| `hooks/react-query/admin/{category,tag}/use-mutation.tsx` | identik; `TagFormData` 2×; `console.log(id)` | R-007, R-019, E-010 | — |
| `hooks/react-query/admin/about/use-mutation.tsx` | fallback error salah ("Gagal membuat category" 4×) | E-006 | copy-paste |
| `hooks/react-query/admin/projects/use-mutation.tsx` | delete fallback "Gagal membuat project" | E-006 | — |
| 22 file hook `*.tsx` | tanpa JSX | R-021 | mekanis |
| `(guest)/blogs/_components/blogs-client.tsx` (557) | filter/sort/pagination/URL-sync duplikat dengan writings (547) | R-005 | 7 blok `URLSearchParams` |
| `(guest)/writings/_components/writings-client.tsx` (547) | idem | R-005 | — |
| `(guest)/blogs/[slug]/_components/blog-detail-client.tsx` (189) | struktur identik dengan writing detail (192) | R-005 | — |
| `(guest)/writings/[slug]/_components/writing-detail-client.tsx` (192) | idem | R-005 | — |
| `(admin)/admin/blogs/page.tsx` (218) | struktur identik dengan writings page (216) | R-006 | — |
| `(admin)/admin/writings/page.tsx` (216) | idem | R-006 | — |
| `(admin)/admin/categories/page.tsx` (415) | CRUD dialog + tabel identik dengan tags (408) | R-007 | — |
| `(admin)/admin/tags/page.tsx` (408) | idem | R-007 | — |
| `(admin)/admin/blogs/[slug]/page.tsx` | judul "Create New Post" pada halaman edit — **diperbaiki** (K-9) | R-006 | bug copy |
| `components/reusable/admin/blogs/form-create-post.tsx` (431) | `postSchema` ke-3 | R-003 | — |
| `components/reusable/admin/projects/FormCreateProject.tsx` | `projectSchema` ke-3; `isMounted` tak dipakai | R-004, R-020 | — |
| `components/reusable/admin/projects/form-edit-project.tsx` | `projectSchema` ke-4; duplikasi form create | R-004 | — |
| `components/reusable/admin/search-content.tsx` | filter bar blogs/writings; `SearchProject` terpisah | R-015 | 3 pemakaian |
| `components/reusable/admin/projects/search-project.tsx` | filter lokal `useEffect` berbeda dari URL-based | R-015 | — |
| `components/reusable/admin/{blogs/dropdown-blogs,projects/dropdown-project,projects/delete-project}.tsx` | AlertDialog hapus 3×; hapus project juga 2× di `project/page.tsx:24-31` | R-016 | 5 titik |
| `components/reusable/state/{empty-state,loading-state}.tsx` | dipakai 14×, tapi fallback empty inline di 6 tempat | R-017 | — |
| `(guest)/statistics/page.tsx` | `StatisticsSkeleton` inline 27 baris | R-017 | — |
| `(guest)/about/page.tsx` | skeleton inline | R-017 | — |
| `(admin)/about/{experiences,current-activities}/page.tsx` | skeleton inline + `console.log` validasi | R-017, E-010 | — |
| `(guest)/{blogs,writings,projects}/page.tsx`, `[slug]/page.tsx`, `src/app/page.tsx` | `const baseUrl` + blok `openGraph/twitter` berulang | R-012 | 13 literal |
| `src/app/layout.tsx`, `sitemap.ts`, `robots.ts` | base URL literal | R-012 | — |
| `hooks/use-image-upload.ts` + `use-upload-file.ts` | dua implementasi upload Supabase | R-022 | 2 implementasi |
| `components/reusable/skeleton/post-detail-skeleton.tsx`, `project-detail-skeleton.tsx` | 0 pemakaian | R-023 | dead |
| `types/{blogs,tags}.ts` | `Tag` didefinisikan 2× | R-019 | — |
| `types/response.ts` | `APIResponse.data: any`, `success?: number` (harusnya boolean) | R-019 | — |
| `provider/react-query.tsx` | default `QueryClient` dikomentari → tanpa staleTime/retry global | E-008 | — |
