# Fase 6 — Opsional & terpisah

> Bagian dari rencana refactor. Indeks: [README](./README.md) · Keputusan: [decisions.md](./decisions.md)

**Keputusan terkait:** `K-3`, `K-4`, `K-7`, `K-8` — lihat [decisions.md](./decisions.md).

---

## Langkah eksekusi

Fase ini **tidak boleh dimulai** sebelum Fase 0–5 selesai, terverifikasi, dan mendapat persetujuan terpisah. Keduanya sengaja dipisah karena berisiko lebih tinggi daripada refactor internal.

| Langkah | Temuan | Syarat |
|---|---|---|
| 6.1 | **K-3** — hapus `/api/guest` + `/api/guest/projects` (list), `useGetDataHome`, `useGetGuestProjects` | User mengonfirmasi tidak ada pemakaian eksternal (cron/mobile/Postman). Cek log akses route bila ada. |
| 6.2 | **K-8** — pindahkan `/api/project/**` → `/api/admin/projects/**` | (a) semua pemanggil di repo diubah (`use-mutation`, `use-query`, form, halaman); (b) middleware/proteksi auth mencakup path baru — **catat:** `src/middleware.ts:54` matcher mengecualikan `api`, jadi proteksi tetap via `requireAdmin()` in-handler dan **wajib** ditambahkan ke setiap route baru; (c) redirect/kompatibilitas path lama bila ada konsumen luar; (d) `npm run verify` hijau + uji manual CRUD project |
| 6.3 | **K-7** — hapus `revalidatePath("/")` pada view | Perbaikan performa terpisah; ukur dampak cache sebelum/sesudah |
| 6.4 | **K-4** — keputusan `Post.publishedAt` (pakai atau hapus) | Di luar refactor; butuh keputusan produk + migrasi bila dihapus |

**Commit:** satu commit per langkah, masing-masing dapat di-revert sendiri.

---

## Catatan verifikasi fase ini

- **Prasyarat:** Fase 0–5 selesai, terverifikasi, dan ada **persetujuan terpisah**.
- **6.1 (K-3):** pastikan tidak ada pemakaian eksternal sebelum menghapus; cek log akses route bila tersedia.
- **6.2 (K-8):** semua pemanggil diubah; `requireAdmin()` **wajib** ditambahkan ke setiap route baru (`src/middleware.ts:54` matcher mengecualikan `api`); kompatibilitas path lama bila ada konsumen luar; `npm run verify` hijau + uji manual CRUD project.
- **6.3 (K-7):** ukur dampak cache sebelum/sesudah menghapus `revalidatePath("/")` pada view.
- **6.4 (K-4):** keputusan produk; bila menghapus `publishedAt`, butuh migrasi.
- Setiap langkah satu commit, dapat di-revert sendiri.

Verifikasi global (halaman minimum & cek regresi): [README](./README.md#verifikasi-global).
