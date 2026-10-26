# Yang sengaja TIDAK diekstrak

> Bagian dari rencana refactor. Indeks: [README](./README.md) · Keputusan: [decisions.md](./decisions.md)

Daftar ini sama pentingnya dengan daftar temuan: mencegah over-engineering.

| Item | Lokasi | Alasan tidak diekstrak |
|---|---|---|
| `omitId()` | `src/lib/helper.ts:1-13` | Hanya 3 pemakaian. Cukup beri tipe generik (`<T extends { id: unknown }>`), bukan abstraksi baru. |
| `getHomeData` vs `getBlogsData` | `src/lib/server/get-home-data.ts` vs `get-blogs-data.ts` | Bentuk data & tujuan berbeda (home agregat, list terpaginasi). Mirip ≠ sama. |
| `api/guest/about` vs `api/admin/about` | `guest/about/route.ts:12-20`, `admin/about/route.ts:10-18` | `orderBy` berbeda (desc vs asc), `omitId` hanya di guest, admin mengembalikan `experiences` + `currentActivities`. Aturan berbeda → jangan disatukan. |
| `api/guest/projects/[slug]` mengembalikan `id` | `guest/projects/[slug]/route.ts:23-25` | Inkonsistensi kebocoran `id`, bukan duplikasi. Perlu keputusan produk, bukan ekstraksi. |
| `api/guest/category` vs `api/guest/tags` | 2 file | Hanya 2 pemakaian; bentuk respons sudah berbeda (`_count` vs tidak). Di bawah ambang ≥3. |
| `api/admin/category` vs `api/admin/tag` + hook + halaman | 4 route, 4 hook, 2 halaman | **R-007 dibatalkan 26 Okt 2026.** Duplikasi diterima sebagai utang teknis: Category punya `description` + relasi 1:N, Tag N:M via `PostTag`; manager config-driven akan penuh cabang. Halaman tidak disentuh di Fase 5. |
| `search-project.tsx` vs `search-content.tsx` | 2 file | Perilaku state berbeda (lokal vs URL). Menyatukan = mengubah UX, bukan DRY. Lihat R-015. |
| `getPageList` (pagination ellipsis) | 2 file | 2 pemakaian. Bila R-005 dikerjakan, otomatis jadi 1; jangan ekstrak terpisah. |
| `formatCreatedUpdated` | `use-formatted-date.ts:35-55` | 2 pemakaian; cukup pindah file bersama `formattedDate` (R-018). |
| `serializeDates` untuk project | 2 pemakaian | Bila R-009 dikerjakan, masuk ke fungsi generik; tidak perlu file sendiri. |
| `isValidCUID` heuristik | `api/project/[slug]/route.ts:105-110` | Hanya 1 tempat; sebaiknya diganti validasi skema, bukan diekstrak. |
| `Result<T>` | — | Tidak ada pola `Result` di codebase. Memperkenalkannya = arsitektur baru, bukan reusability. Cukup `ApiErrorBody` + `jsonError` (E-001). |
| `AppError` **penuh** (hierarchy, subclass, `cause` chain, serialization) | — | **Dikecualikan (K-13):** hanya satu kelas minimal `AppError { status; code }`. Tidak ada `NotFoundError`/`ConflictError`/dsb. — pakai `new AppError(msg, 404, "NOT_FOUND")` langsung. |
| Server Actions wrapper (`safeAction`) | — | Project **tidak memakai Server Actions**; semua mutasi lewat route handler. Jangan buat abstraksi untuk kode yang tidak ada. |
| Error boundary per-route | — | Belum ada `error.tsx` sama sekali; menambah 10 file `error.tsx` bukan DRY. Cukup satu `global-error.tsx`/`error.tsx` per route group bila disetujui. |
| `date-fns` wrapper penuh | — | `format()` sudah dipakai langsung; hanya konstanta format yang perlu dipusatkan (R-018). |
| Menggabungkan `use-image-upload` dan `use-upload-file` menjadi satu hook | `src/hooks/` | Bisa, tapi API publik keduanya berbeda (progress vs sederhana). R-022 hanya memusatkan **inti upload**, bukan menggabungkan hook. |
| `Like` per IP vs visitor | `schema.prisma:207` | Perubahan model data = keputusan produk (K-6), bukan refactor. |
| `Post` vs `Project` select | — | Model & field berbeda; memaksa satu select akan penuh `Partial`. |
| Menyatukan semua `route.ts` jadi satu catch-all | — | Bertentangan dengan App Router; menurunkan keterbacaan & caching. |
