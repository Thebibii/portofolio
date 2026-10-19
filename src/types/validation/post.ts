import { z } from "zod";
import { PostStatus } from "@/types/blogs";

export const postInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  slug: z.string().max(120, "Slug too long").optional(),
  content: z
    .string()
    .min(1, "Content is required")
    .max(100000, "Content too long"),
  excerpt: z.string().max(500, "Excerpt too long").optional(),
  coverImage: z.string().max(2048, "Cover image URL too long").optional(),
  status: z.nativeEnum(PostStatus),
  featured: z.boolean(),
  readingTime: z.number().min(1, "Reading time must be at least 1 minute"),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).max(20, "Too many tags").optional(),
});

export const postCreateSchema = postInputSchema.strict();

export const adminPostListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15),
  search: z.string().trim().max(200).optional(),
  status: z.nativeEnum(PostStatus).optional(),
  categoryId: z.string().optional(),
  tagId: z.string().optional(),
});

export const guestPostListQuerySchema = z.object({
  search: z.string().optional(),
  tag: z.string().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).catch(10),
  page: z.coerce.number().int().min(1).catch(1),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).catch("desc"),
});

export type PostInput = z.infer<typeof postInputSchema>;
export type AdminPostListQuery = z.infer<typeof adminPostListQuerySchema>;
export type GuestPostListQuery = z.infer<typeof guestPostListQuerySchema>;
