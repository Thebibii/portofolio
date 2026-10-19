# Fase 2 — Kontrak validasi & error

> Bagian dari rencana refactor. Indeks: [README](./README.md) · Keputusan: [decisions.md](./decisions.md)

**Keputusan terkait:** `K-2`, `K-11`, `K-13`, `K-14` — lihat [decisions.md](./decisions.md).

---

## Langkah eksekusi

| Langkah | Temuan | Catatan |
|---|---|---|
| 2.1 | R-003 + R-004 | `src/types/validation/{post,project,taxonomy}.ts`; hapus schema duplikat di 7 file |
| 2.2 | E-001 | `src/lib/api-error.ts`; migrasi 9 file `{message}` → `{error}` **bersamaan dengan hook pembacanya** |
| 2.3 | E-004 | `src/lib/prisma-error.ts` (`P2025` → 404, `P2002` → 409); pasang di 9 file + `[slug]` post |
| 2.4 | E-005 + E-009 | sentralisasi Zod; `coerce` untuk query param |
| 2.5 | E-002 + E-010 | logging + hapus `console.log` debugging/`any` (kecuali audit log `auth.ts:85`) |
| 2.6 | E-003 | `withRouteHandler` (K-11 + K-14): `unstable_rethrow(e)` **paling awal**, lalu `AppError` minimal (K-13) / Zod / Prisma, sisanya **lempar ulang**. Terapkan bertahap per domain + verifikasi |
| 2.7 | E-006 | perbaiki fallback pesan (atau tunda ke Fase 4 bila memakai factory R-002) |
| 2.8 | R-019 | `src/types/api.ts`, satu definisi `Tag` |
| 2.9 | **K-2 (bagian 1)** | `mapPrismaError` untuk `Project.slug` **terpasang di `/api/project`** sebelum migrasi apa pun |

**Gate:** `npm run verify` hijau; uji manual 3 endpoint (POST invalid body → 400 `{error: string[]}`, POST duplikat tag → 409, DELETE id tidak ada → 404). Pastikan error tak dikenal masih menghasilkan respons Next default (bukan ditelan wrapper).
**Commit:** `refactor(api): unify validation schemas and error contract`

### Status eksekusi (19 Oktober 2026)

- [x] R-003 — `postSchema` (5 salinan) & `listQuerySchema` (2 salinan) disentralisasi ke `src/types/validation/post.ts`
- [x] R-004 — `projectSchema` (4 salinan) disentralisasi ke `src/types/validation/project.ts`; gabung form create/edit ditunda
- [x] E-001 — 9 file error `{ message }` → `{ error }`; hook admin membaca `data.error` (success `{ data, message }` tetap)
- [ ] `taxonomy.ts` — ditunda (tidak ada schema taxonomy di R-003/R-004; R-007 ada di fase lain)

---

## Temuan dalam fase ini

Blok temuan dikutip utuh dari laporan asal. Untuk temuan yang dieksekusi bertahap, blok lengkap ada di fase pemiliknya dan fase ini memuat ringkasan field wajib.

### R-003 — `postSchema` & `listQuerySchema` ditulis 3×

- **Kategori:** Duplikasi kontrak validasi (server + client)
- **Lokasi:** `src/app/api/admin/blogs/route.ts:14-30` dan `:32-39`, `src/app/api/admin/writings/route.ts:14-30` dan `:32-39`, `src/components/reusable/admin/blogs/form-create-post.tsx:34-49`
- **Jumlah pemakaian:** `postSchema` 3×; `listQuerySchema` 2×.
- **Potongan kode:**

```ts
const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  slug: z.string().max(120, "Slug too long").optional(),
  content: z.string().min(1, "Content is required").max(100000, "Content too long"),
  excerpt: z.string().max(500, "Excerpt too long").optional(),
  coverImage: z.string().max(2048, "Cover image URL too long").optional(),
  status: z.nativeEnum(PostStatus),
  featured: z.boolean(),
  readingTime: z.number().min(1, "Reading time must be at least 1 minute"),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).max(20, "Too many tags").optional(),
});
```

- **Usulan:** `src/types/validation/post.ts`
  - `export const postInputSchema = z.object({...})` (tanpa `.strict()`)
  - `export const postCreateSchema = postInputSchema.strict()` (server saja, menolak `type` dari client)
  - `export const adminPostListQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(50).default(15), search: z.string().optional(), status: z.nativeEnum(PostStatus).optional(), categoryId: z.string().optional(), tagId: z.string().optional() })`
  - `export type PostInput = z.infer<typeof postInputSchema>`
  - Schema form saat ini `z.object` biasa, server `.strict()`. Pertahankan `.strict()` hanya di jalur server dengan dua export terpisah.
- **Server/Client:** shared — file validasi tanpa `"use client"` dan tanpa `server-only`.
- **File terdampak:** 3 file di atas + 4 halaman create/edit (tipe `FormCreatePostData`).
- **Prioritas:** **Tinggi**
- **Risiko:** Rendah. Perubahan perilaku hanya jika `.strict()` hilang — jaga dengan uji manual: POST body dengan field asing harus tetap 400.
- **Estimasi usaha:** 3 jam.

### R-004 — `projectSchema` ditulis 4×

- **Kategori:** Duplikasi kontrak validasi (server + 2 form)
- **Lokasi:** `src/app/api/project/route.ts:9-32`, `src/app/api/project/[slug]/route.ts:10-31`, `src/components/reusable/admin/projects/FormCreateProject.tsx:50-65`, `src/components/reusable/admin/projects/form-edit-project.tsx:48-63`
- **Jumlah pemakaian:** 4 salinan (server 2, client 2). Dua versi client memakai `z.date()`, dua versi server memakai `z.preprocess(new Date(val))`.
- **Potongan kode:**

```ts
// server (api/project/route.ts:26-31)
startDate: z.preprocess((val) => (val ? new Date(val as string) : undefined), z.date().optional()),

// client (FormCreateProject.tsx:63-64)
startDate: z.date().optional(),
```

- **Usulan:** `src/types/validation/project.ts`
  - `projectBaseSchema` (semua field kecuali tanggal)
  - `projectServerSchema = projectBaseSchema.extend({ startDate: z.preprocess(...), endDate: z.preprocess(...) })`
  - `projectFormSchema = projectBaseSchema.extend({ startDate: z.date().optional(), endDate: z.date().optional() })`
  - `export type ProjectFormValues = z.infer<typeof projectFormSchema>`
  - Hapus `interface ProjectFormData` manual di `src/types/projects.ts` atau jadikan alias dari schema agar tidak drift.
  - Bonus: satukan `FormCreateProject` + `form-edit-project` menjadi satu `ProjectForm` dengan prop `mode: "create" | "edit"` (dua file saat ini ±90% sama, termasuk blok kalender dan uploader).
- **Server/Client:** shared — file validasi netral.
- **File terdampak:** 4 file + `src/types/projects.ts`.
- **Prioritas:** **Tinggi**
- **Risiko:** Sedang. Schema client vs server sengaja berbeda tipe tanggal; jangan dipaksa satu schema atau `zodResolver` akan gagal di form (`Date` vs `string`).
- **Estimasi usaha:** 4 jam.
- **Keputusan terkait:** K-8 — **path `/api/project/**` tidak diubah** di refactor ini. R-004 hanya menyatukan schema, bukan memindahkan route.

### R-019 — Duplikasi tipe & `any` di kontrak API

- **Kategori:** Duplikasi tipe
- **Lokasi:** `src/types/blogs.ts:42-50` vs `src/types/tags.ts:1-11` (interface `Tag` ganda, beda ada/tidak `_count`); `src/hooks/react-query/admin/category/use-mutation.tsx:5-8` vs `admin/tag/use-mutation.tsx:5-8` (`TagFormData` ganda); `src/types/response.ts:1` (`data: any`, `success?: number`); `src/types/projects.ts:1-16` vs schema zod (R-004).
- **Jumlah pemakaian:** `Tag` 2 definisi (dipakai 2 halaman), `TagFormData` 2 definisi (dipakai 4 hook), `APIResponse` dipakai 8 file hook.
- **Potongan kode:**

```ts
// src/types/response.ts:1
export type APIResponse = { data: any; message: string; success?: number };
```

- **Usulan:** `src/types/api.ts`

```ts
export type ApiSuccess<T> = { success?: boolean; data: T; message?: string };
export type ApiError = { error: string | string[]; message?: string };
export type Paginated<T> = ApiSuccess<T[]> & { meta: PaginationMeta };
export interface PaginationMeta { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean }
```

  `src/types/tags.ts` menjadi satu-satunya definisi `Tag`; `src/types/blogs.ts` mengimpor dan mengekspor ulang (karena `Post.tags: Tag[]`).
- **Server/Client:** shared murni.
- **File terdampak:** 8 file.
- **Prioritas:** **Rendah**
- **Risiko:** Rendah, tetapi mengganti `APIResponse` bisa memunculkan banyak error TS sekaligus — lakukan per-domain.
- **Estimasi usaha:** 3 jam.

### E-001 — Envelope error API tidak konsisten (`{ error }` vs `{ message }`, string vs array)

- **Kategori:** Kontrak respons
- **Lokasi:** 32 file memakai `{ error }`; 9 file memakai `{ message }` — di antaranya `src/app/api/admin/category/[id]/route.ts:93,97`, `admin/tag/[id]/route.ts:93,97`, `admin/about/{experiences,current-activities}/[id]/route.ts:16,31,35`, `admin/blogs/[slug]/route.ts:52,61,89,175`, `admin/writings/[slug]/route.ts:52,61,89,175`, `admin/posts/[slug]/featured/route.ts:26`, `project/[slug]/featured/route.ts:26`, `project/[slug]/route.ts:65,74,91,105,140,144,170`.
- **Jumlah pemakaian:** 31 kemunculan `{ message }` di 9 file; 69 `{ error }` di 32 file. Satu file bahkan memakai keduanya: `src/app/api/project/[slug]/route.ts:74` (`{ message }`) dan `:206` (`{ error }`).
- **Potongan kode:**

```ts
// api/project/[slug]/route.ts:74
return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
// api/project/[slug]/route.ts:206
return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
```

- **Usulan:** `src/lib/api-error.ts`

```ts
export type ApiErrorBody = { error: string | string[]; code?: string };
export const jsonError = (status: number, error: string | string[], code?: string) =>
  NextResponse.json<ApiErrorBody>({ error, code }, { status });

export const errors = {
  unauthorized: () => jsonError(401, "Authentication required", "UNAUTHORIZED"),
  forbidden: () => jsonError(403, "Forbidden", "FORBIDDEN"),
  badRequest: (issues: string[]) => jsonError(400, issues, "VALIDATION_ERROR"),
  notFound: (entity = "Data") => jsonError(404, `${entity} tidak ditemukan`, "NOT_FOUND"),
  conflict: (msg: string) => jsonError(409, msg, "CONFLICT"),
  server: () => jsonError(500, "Terjadi kesalahan pada server", "INTERNAL"),
};
```

  Klien **sudah** membaca `error` di sebagian besar hook (`admin/blogs/use-mutation.tsx:27-29`), jadi arah migrasi yang benar adalah `{ error }` sebagai satu-satunya bentuk. File hook yang membaca `data.message` untuk error harus disesuaikan.
- **Server/Client:** server (route handler).
- **File terdampak:** 9 file `{message}` + seluruh route yang memakai literal 500 (40 titik) bila memakai `errors.server()`.
- **Prioritas:** **Tinggi**
- **Risiko:** Sedang. Kontrak berubah untuk endpoint yang sekarang mengembalikan `{message}`; UI yang membaca `error.message` akan menampilkan kosong. Perbaiki route + hook dalam commit yang sama per domain.
- **Estimasi usaha:** 4 jam.

### E-002 — Catch tanpa logging (8 blok) → kegagalan tak terdiagnosis

- **Kategori:** Observability
- **Lokasi:** `src/app/api/guest/blogs/[slug]/like/route.ts:66-71,123-128`, `guest/writings/[slug]/like/route.ts:66-71,123-128`, `guest/blogs/[slug]/view/route.ts:33-38`, `guest/writings/[slug]/view/route.ts:33-38`, `guest/projects/[slug]/view/route.ts:30-35`, `guest/projects/route.ts:21-30`
- **Jumlah pemakaian:** 8 blok di 6 file.
- **Potongan kode:**

```ts
} catch (error) {
  return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
}
```

- **Usulan:** Wrapper `withRouteHandler` (lihat E-003) yang selalu `console.error` dengan tag route; atau minimal tambahkan `console.error("[guest/blogs/:slug/like] failed:", error)` mengikuti konvensi 31 route lain yang sudah melakukannya.
- **Server/Client:** server.
- **File terdampak:** 6 file.
- **Prioritas:** **Tinggi**
- **Risiko:** Sangat rendah (tidak mengubah respons).
- **Estimasi usaha:** 1 jam.

### E-003 — Tidak ada wrapper handler; boilerplate `try/catch` + Zod + auth diulang 51×

- **Kategori:** Duplikasi alur kontrol
- **Lokasi:** 51 blok `catch` di 36 `route.ts`; pola berulang persis di `admin/blogs/route.ts:48-131,159-214`, `admin/writings/route.ts:48-131,159-214`, `admin/category/route.ts:46-71`, `admin/tag/route.ts:46-71`, `project/route.ts:61-89`, `project/[slug]/route.ts:162-206`.
- **Jumlah pemakaian:** 51 catch block; 12 route memakai blok Zod identik `if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues.map(e => e.message) }, { status: 400 })`.
- **Potongan kode:**

```ts
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.issues.map((e) => e.message) }, { status: 400 });
  }
  console.error("[admin/blogs] failed:", error);
  return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
}
```

- **Usulan (K-11 konservatif + K-14 disetujui):** `src/lib/api-handler.ts` (server). Urutan penanganan **penting**: `unstable_rethrow(e)` dipanggil **paling awal**, sebelum logika apa pun, agar error kontrol-alur Next tidak pernah tertelan. Setelah itu hanya error yang dikenal yang ditangani; sisanya dilempar ulang.

```ts
import { unstable_rethrow } from "next/navigation";
import { ZodError } from "zod";
import { errors } from "@/lib/api-error";
import { mapPrismaError } from "@/lib/prisma-error";
import { AppError } from "@/lib/app-error";

export function withRouteHandler<Ctx>(
  tag: string,
  handler: (req: NextRequest, ctx: Ctx) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx: Ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      // 0. WAJIB paling awal: lempar ulang error internal Next (redirect, notFound,
      //    DynamicServerError, bailout CSR, postpone). No-op untuk error lain.
      unstable_rethrow(e);

      // 1. Error domain minimal yang kita lempar sendiri
      if (e instanceof AppError) return errors.fromAppError(e);
      // 2. Validasi
      if (e instanceof ZodError) return errors.badRequest(e.issues.map((i) => i.message));
      // 3. Prisma known request error (P2025, P2002)
      const mapped = mapPrismaError(e);
      if (mapped) return errors.mapped(mapped);
      // 4. Tidak dikenal: catat lalu LEMPAR ULANG
      console.error(`[${tag}] unhandled:`, e);
      throw e;
    }
  };
}
```

  **Larangan tegas:**
  - Jangan `import { isRedirectError }` dari `next/dist/client/components/redirect` atau path internal Next lainnya. Satu-satunya API Next yang dipakai adalah `unstable_rethrow` dari `next/navigation` (publik).
  - Jangan menambahkan `catch (e) { return errors.server() }` sebagai fallback universal — itu yang menelan `redirect()`/`notFound()`.
  - Jangan memindahkan `unstable_rethrow` ke bawah `instanceof` checks: `AppError`/`ZodError` bukan error Next sehingga aman, tetapi urutan paling awal adalah jaminan yang lebih kuat dan lebih mudah diaudit.
- **K-13 — `AppError` minimal saja:** satu kelas di `src/lib/app-error.ts`, tanpa hierarchy, tanpa `cause` chain, tanpa serialization:

```ts
export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string
  ) {
    super(message);
    this.name = "AppError";
  }
}
```

  `errors.fromAppError(e)` di `src/lib/api-error.ts` hanya memetakan `{ error: e.message, code: e.code }` dengan `status: e.status`. Tidak ada subclass (`NotFoundError`, `ConflictError`, dst.) — pakai `new AppError("...", 404, "NOT_FOUND")` langsung.
- **K-14 — `unstable_rethrow` disetujui dan dipakai:** `next` = **15.4.8** (`package.json:98`). Fungsi tersedia sebagai API publik di `next/navigation` (re-export dari `dist/client/components/navigation`). Perilaku terverifikasi dari implementasi server (`unstable-rethrow.server.js`): melempar ulang bila error adalah Next router error / bailout CSR / dynamic server error / dynamic postpone / postpone / hanging promise rejection, **dan menelusuri `error.cause` secara rekursif**; selain itu tidak melakukan apa pun.
  - Konsekuensi: `redirect()`, `notFound()`, `forbidden()`, `unauthorized()` otomatis aman.
  - Konsekuensi tambahan: karena ia menelusuri `cause`, error domain yang membungkus error Next juga akan dilempar ulang — perilaku yang diinginkan.
  - Karena API masih berprefix `unstable_`, **kunci versi Next** di `package.json` (saat ini `"next": "15.4.8"`, tanpa `^`) agar tidak berubah diam-diam saat upgrade.
- **Server/Client:** server only. Untuk Server Actions (bila ditambah kelak) gunakan `safeAction` terpisah — **jangan** campur dengan tipe `NextResponse`.
- **File terdampak:** 36 route (bertahap, per domain).
- **Prioritas:** **Tinggi**
- **Risiko:** **Rendah**. `unstable_rethrow` menangani kontrol alur Next secara eksplisit; error tak dikenal tetap dilempar ulang. Risiko sisa: route yang melempar error tak dikenal menghasilkan 500 default Next tanpa envelope JSON — ini **disengaja**. Risiko jangka panjang: `unstable_` API bisa berubah antar versi mayor — dikunci oleh versi Next yang di-pin.
- **Estimasi usaha:** 1 hari.
- **Keputusan terkait:** K-11, K-13, K-14.

### E-004 — Mapping error Prisma: `P2025` hanya di 5 file, `P2002` tidak ditangani sama sekali

- **Kategori:** Mapping error domain
- **Lokasi:**
  - `P2025` ditangani: `src/app/api/admin/category/[id]/route.ts:90-99`, `admin/tag/[id]/route.ts:90-99`, `admin/about/experiences/[id]/route.ts:28-36`, `admin/about/current-activities/[id]/route.ts:28-36`, `src/app/api/project/[slug]/route.ts:137-145`
  - `P2025` **tidak** ditangani: `admin/blogs/[slug]/route.ts:142-155,208-213`, `admin/writings/[slug]/route.ts:142-155,208-213` (update/delete post)
  - `P2002` (unique constraint): **0 penanganan** di seluruh `src`, padahal constraint unik ada di `prisma/schema.prisma:91` (`Post.slug`), `:158-159` (`Category.name/slug`), `:173-174` (`Tag.name/slug`), `:207` (`Like @@unique`)
- **Jumlah pemakaian:** `P2025` 5 file (dari 9 file yang melakukan update/delete by unique key); `P2002` 0.
- **Potongan kode:**

```ts
// category/[id]/route.ts:90-99 — satu-satunya pola yang ada
} catch (error: any) {
  if (error.code === "P2025") {
    return NextResponse.json({ message: "Data not found" }, { status: 404 });
  }
  console.error(error);
  return NextResponse.json({ message: "Internal server error" }, { status: 500 });
}
```

- **Usulan:** `src/lib/prisma-error.ts`

```ts
import { Prisma } from "@/lib/generated/prisma";
export function mapPrismaError(e: unknown): { status: number; error: string; code: string } | null {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2025") return { status: 404, error: "Data tidak ditemukan", code: "NOT_FOUND" };
    if (e.code === "P2002") {
      const target = (e.meta?.target as string[] | undefined)?.join(", ") ?? "field unik";
      return { status: 409, error: `Data dengan ${target} tersebut sudah ada`, code: "CONFLICT" };
    }
  }
  return null;
}
```

  Dipakai di `withRouteHandler` (E-003) dan di `[id]`/`[slug]` route. **Catatan penting:** `P2002` pada `Tag.name` saat create adalah skenario nyata (user mengetik nama tag yang sudah ada), saat ini jatuh ke 500. Cek juga: create category/tag memakai `generateSlug` tanpa suffix unik (`category/route.ts:51`, `tag/route.ts:51`) → dua nama berbeda bisa menghasilkan slug sama → `P2002` pada `slug` → 500.
- **K-2 (wajib):** setelah `@unique` ditambahkan ke `Project.slug`, `P2002` pada project menjadi mungkin terjadi (mis. dua request create bersamaan dengan judul sama). Karena itu `mapPrismaError` **harus** sudah terpasang di `/api/project` sebelum/bersamaan dengan migrasi, dan mengembalikan **409**, bukan 500. Urutan: helper → route project → cek duplikat DB → migrasi.
- **Server/Client:** server.
- **File terdampak:** 9 file + 1 baru.
- **Prioritas:** **Tinggi**
- **Risiko:** Rendah–Sedang. Jangan mengubah `P2002` menjadi 400; gunakan 409 agar client bisa membedakan.
- **Estimasi usaha:** 3 jam.
- **Keputusan terkait:** K-2.

### E-005 — Zod `parse` dipakai di 12 route → pesan error tidak seragam & melempar ke catch generik

- **Kategori:** Validasi
- **Lokasi:** `src/app/api/project/route.ts:61`, `project/[slug]/route.ts:162`, `project/[slug]/featured/route.ts:21`, `admin/posts/[slug]/featured/route.ts:21`, `admin/category/route.ts:46`, `admin/category/[id]/route.ts:24`, `admin/tag/route.ts:46`, `admin/tag/[id]/route.ts:24`, `admin/blogs/route.ts:48,159`, `admin/blogs/[slug]/route.ts:79`, `admin/writings/route.ts:48,159`, `admin/writings/[slug]/route.ts:79`
- **Jumlah pemakaian:** 14 pemanggilan `.parse(` di 12 file vs **0** `.safeParse(`.
- **Potongan kode:**

```ts
const body = postSchema.parse(json);   // throw → ditangkap catch generik
```

- **Usulan:** `parseJsonBody<T>(req, schema)` di `src/lib/validate.ts` → `{ ok: true, data } | { ok: false, response }`; atau tetap `.parse()` tetapi **hanya** di dalam `withRouteHandler` yang sudah memetakan `ZodError`. Yang penting: satu jalur. Saat ini `listQuerySchema.parse` juga melempar dari dalam `GET` sehingga query string invalid menghasilkan 400 dengan `error: string[]` (konsisten), sedangkan body invalid menghasilkan bentuk yang sama — jadi pemetaan sudah benar; yang kurang adalah sentralisasinya.
- **Server/Client:** server.
- **File terdampak:** 14 file.
- **Prioritas:** **Sedang**
- **Risiko:** Rendah. Jangan ubah pesan validasi (dipakai sebagai teks toast).
- **Estimasi usaha:** 2 jam.

### E-006 — Pesan error client salah karena copy-paste

- **Kategori:** UX error
- **Lokasi:** `src/hooks/react-query/admin/about/use-mutation.tsx:28,68,105,145` ("Gagal membuat category"), `src/hooks/react-query/admin/projects/use-mutation.tsx:65` ("Gagal membuat project" pada operasi update), `src/hooks/react-query/admin/writings/use-mutation.tsx:65` (pesan update menyebut create)
- **Jumlah pemakaian:** 6 titik.
- **Potongan kode:**

```ts
// admin/about/use-mutation.tsx:28 — mutation pengalaman kerja, bukan category
throw new Error(data.message || "Gagal membuat category");
```

- **Usulan:** Sediakan `getErrorMessage(error, fallback)` di `src/lib/errors.ts`, dan fallback spesifik per aksi: `"Gagal menambahkan pengalaman"`, `"Gagal memperbarui project"`, dst. Setelah R-002/R-007, pesan ini otomatis terpusat di factory — jangan perbaiki dua kali.
- **Server/Client:** client.
- **File terdampak:** 3 file.
- **Prioritas:** **Sedang**
- **Risiko:** Sangat rendah.
- **Estimasi usaha:** 30 menit.

### E-009 — `parseInt`/`Number` tanpa guard NaN

- **Kategori:** Validasi input
- **Lokasi:** `src/app/api/guest/blogs/route.ts:13-14`, `guest/writings/route.ts:13-14` (`parseInt`), `admin/about/experiences/route.ts:26`, `admin/about/experiences/[id]/route.ts:20`, `admin/about/current-activities/route.ts:26`, `admin/about/current-activities/[id]/route.ts:20` (`Number(...)`)
- **Jumlah pemakaian:** 8 titik di 6 file.
- **Potongan kode:**

```ts
const limit = parseInt(searchParams.get("limit") || "10");  // "abc" → NaN
const page = parseInt(searchParams.get("page") || "1");
```

  `skip: (page - 1) * limit` dengan `NaN` membuat Prisma melempar error → 500, bukan 400.
- **Usulan:** Pakai `z.coerce.number().int().min(1).catch(10)` / `.catch(1)` lewat `guestPostListQuerySchema` (R-003). Untuk `[id]`: `const parsed = z.coerce.number().int().safeParse(id)` → 400 bila gagal (menggantikan heuristik `Number(id)` yang menghasilkan `NaN`).
- **Server/Client:** server.
- **File terdampak:** 6 file.
- **Prioritas:** **Rendah**
- **Risiko:** Rendah. Perilaku berubah dari 500 → 400 (perbaikan).
- **Estimasi usaha:** 1 jam.

### E-010 — `console.log` sisa debugging & `catch (error: any)`

- **Kategori:** Kebersihan kode
- **Lokasi:** `src/hooks/react-query/admin/tag/use-mutation.tsx:56`, `src/app/(admin)/admin/about/experiences/page.tsx:72`, `src/app/(admin)/admin/about/current-activities/page.tsx:72`, `src/components/reusable/admin/projects/FormCreateProject.tsx:127`, `src/components/reusable/admin/projects/form-edit-project.tsx:127`, `src/components/nav-user.tsx:36`, `src/lib/imageUpload.ts:33,47` (typo "errorrr"/"errorr"), `admin/blogs/route.ts:193`, `admin/writings/route.ts:193`, `admin/blogs/[slug]/route.ts:196`, `admin/writings/[slug]/route.ts:196`
- **Jumlah pemakaian:** 11 `console.log` + 5 `catch (error: any)`. Satu di antaranya, `src/lib/auth.ts:85`, adalah **audit log login yang disengaja** — jangan dihapus; ubah ke logger bila nanti ada.
- **Potongan kode:**

```ts
// tag/use-mutation.tsx:56
console.log(id);
// project/[slug]/route.ts:137
} catch (error: any) {
```

- **Usulan:** Hapus `console.log` debugging; ganti `catch (error: any)` → `catch (error: unknown)` + `mapPrismaError(error)` (E-004). Aktifkan aturan ESLint `no-console` dengan `allow: ["error", "warn"]` agar tidak berulang.
- **Server/Client:** campuran.
- **File terdampak:** 12 file.
- **Prioritas:** **Rendah**
- **Risiko:** Sangat rendah.
- **Estimasi usaha:** 1 jam.

---

## Catatan verifikasi fase ini

- **Gate:** `npm run verify` hijau.
- **Envelope error (E-001):** POST body invalid → **400** `{ error: string[] }`; DELETE id tidak ada → **404** `{ error: string }`; POST tag duplikat → **409** `{ error: string }`. Tidak boleh ada `{ message }` tersisa di endpoint yang sudah dimigrasi.
- **Error tak dikenal (E-003/K-11):** route yang melempar error tak dikenal menghasilkan respons Next default (bukan ditelan wrapper). Uji dengan error buatan sementara, lalu hapus.
- **`redirect`/`notFound` (K-14):** bila wrapper dipasang pada route yang memanggilnya, tetap **307/404**, bukan 500.
- **`P2002` (K-2 bagian 1):** `mapPrismaError` terpasang di `/api/project` **sebelum** migrasi. Uji slug duplikat → 409.
- **Zod (E-005):** teks pesan validasi tidak berubah (dipakai sebagai toast).
- **`parseInt` (E-009):** `?limit=abc` → 400 atau fallback terkontrol, **bukan** 500.

Verifikasi global (halaman minimum & cek regresi): [README](./README.md#verifikasi-global).
