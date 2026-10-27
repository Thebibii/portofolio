import { z } from "zod";

/** Payload create/update item bucket list (dipakai API + form admin). */
export const bucketItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul wajib diisi")
    .max(200, "Judul maksimal 200 karakter"),
  description: z
    .string()
    .trim()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional()
    .nullable(),
  completed: z.boolean().default(false),
  /** ISO string; null/undefined berarti item belum punya tanggal. */
  completedAt: z.string().datetime({ offset: true }).optional().nullable(),
  images: z.array(z.string().url("URL gambar tidak valid")).max(5, "Maksimal 5 foto").default([]),
});

export const bucketReorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Daftar id tidak boleh kosong"),
});

export type BucketItemInput = z.infer<typeof bucketItemSchema>;
