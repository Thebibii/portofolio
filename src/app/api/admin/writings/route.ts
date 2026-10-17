import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { consumeRateLimit } from "@/lib/login-throttle";
import { generateUniquePostSlug } from "@/lib/unique-slug";
import { PostStatus, PostType } from "@/types/blogs";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import z from "zod";

// Rate limit pembuatan writing (kuota "create post" dibagi dengan blog).
const WRITING_CREATE_MAX = 10;
const WRITING_CREATE_WINDOW_MS = 60 * 1000;

const postSchema = z
  .object({
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
  })
  .strict();

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15),
  search: z.string().trim().max(200).optional(),
  status: z.nativeEnum(PostStatus).optional(),
  categoryId: z.string().optional(),
  tagId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const { page, limit, search, status, categoryId, tagId } =
      listQuerySchema.parse({
        page: searchParams.get("page") ?? undefined,
        limit: searchParams.get("limit") ?? undefined,
        search: searchParams.get("search") ?? undefined,
        status: searchParams.get("status") ?? undefined,
        categoryId: searchParams.get("categoryId") ?? undefined,
        tagId: searchParams.get("tagId") ?? undefined,
      });

    const where = {
      type: PostType.WRITING,
      ...(search
        ? { title: { contains: search, mode: "insensitive" as const } }
        : {}),
      ...(status ? { status } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(tagId ? { tags: { some: { tagId } } } : {}),
    };

    // Hitung total & ambil halaman dalam satu transaksi.
    const [total, data] = await prisma.$transaction([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        // Hanya kolom yang dipakai tabel admin (content tidak dikirim).
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          coverImage: true,
          status: true,
          featured: true,
          type: true,
          readingTime: true,
          viewCount: true,
          createdAt: true,
          category: {
            select: { id: true, name: true, color: true },
          },
          tags: {
            select: {
              tag: {
                select: { id: true, name: true, color: true },
              },
            },
          },
        },
      }),
    ]);

    const transformed = data.map((p) => ({
      ...p,
      tags: p.tags?.map((pt) => pt.tag) || [],
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: transformed,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message) },
        { status: 400 }
      );
    }

    console.error("[admin/writings] failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;

    const rate = await consumeRateLimit(
      `writing:create:${session.user.id}`,
      WRITING_CREATE_MAX,
      WRITING_CREATE_WINDOW_MS
    );
    if (rate.limited) {
      console.warn(
        `[admin/writings] rate limit create user=${session.user.id} retryAfter=${rate.retryAfterSeconds}s`
      );
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi nanti." },
        { status: 429 }
      );
    }

    const json = await req.json();

    const body = postSchema.parse(json);

    const { tagIds, ...postData } = body;
    // Slug selalu dibuat di server; slug dari client diabaikan.
    const slug = await generateUniquePostSlug(body.title);

    const data = await prisma.post.create({
      data: {
        ...postData,
        slug,
        type: PostType.WRITING,
        authorId: session.user.id,
        ...(tagIds &&
          tagIds.length > 0 && {
            tags: {
              create: tagIds.map((tagId) => ({
                tag: {
                  connect: { id: tagId },
                },
              })),
            },
          }),
      },
      // Include relasi untuk response
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    console.log(
      `[admin/writings] created id=${data.id} slug=${data.slug} by=${session.user.id}`
    );

    revalidatePath('/');
    revalidatePath('/writings');

    return NextResponse.json(
      { data, success: true, message: "Post berhasil ditambahkan" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message) },
        { status: 400 }
      );
    }

    console.error("[admin/writings] failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
