import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { withRouteHandler } from "@/lib/api-handler";
import { parseJsonBody, parseSearchParams } from "@/lib/validate";
import { PostType } from "@/types/blogs";
import {
  adminPostListQuerySchema,
  postCreateSchema,
} from "@/types/validation/post";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { generateUniquePostSlug } from "@/lib/slug";
import { consumeRateLimit } from "@/lib/login-throttle";

// Rate limit pembuatan blog: maksimal 10 per 60 detik per user.
const BLOG_CREATE_MAX = 10;
const BLOG_CREATE_WINDOW_MS = 60 * 1000;

export const GET = withRouteHandler("admin/blogs", async (req) => {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = parseSearchParams(
    new URL(req.url).searchParams,
    adminPostListQuerySchema
  );
  if (!parsed.ok) return parsed.response;
  const { page, limit, search, status, categoryId, tagId } = parsed.data;

  const where = {
    type: PostType.BLOG,
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
});

export const POST = withRouteHandler("admin/blogs", async (req) => {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const rate = await consumeRateLimit(
    `blog:create:${session.user.id}`,
    BLOG_CREATE_MAX,
    BLOG_CREATE_WINDOW_MS
  );
  if (rate.limited) {
    console.warn(
      `[admin/blogs] rate limit create user=${session.user.id} retryAfter=${rate.retryAfterSeconds}s`
    );
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi nanti." },
      { status: 429 }
    );
  }

  const parsedBody = await parseJsonBody(req, postCreateSchema);
  if (!parsedBody.ok) return parsedBody.response;
  const body = parsedBody.data;

  const { tagIds, ...postData } = body;
  // Slug selalu dibuat di server; slug dari client diabaikan.
  const slug = await generateUniquePostSlug(body.title);

  const data = await prisma.post.create({
    data: {
      ...postData,
      slug,
      authorId: session.user.id,
      type: PostType.BLOG,
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

  revalidatePath('/');
  revalidatePath('/blogs');

  return NextResponse.json(
    { data, success: true, message: "Post berhasil ditambahkan" },
    { status: 201 }
  );
});
