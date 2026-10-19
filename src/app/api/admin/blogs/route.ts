import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { errors } from "@/lib/api-error";
import { mapPrismaError } from "@/lib/prisma-error";
import { PostType } from "@/types/blogs";
import {
  adminPostListQuerySchema,
  postCreateSchema,
} from "@/types/validation/post";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { generateUniquePostSlug } from "@/lib/slug";
import { consumeRateLimit } from "@/lib/login-throttle";
import z from "zod";

// Rate limit pembuatan blog: maksimal 10 per 60 detik per user.
const BLOG_CREATE_MAX = 10;
const BLOG_CREATE_WINDOW_MS = 60 * 1000;

export async function GET(req: NextRequest) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const { page, limit, search, status, categoryId, tagId } =
      adminPostListQuerySchema.parse({
        page: searchParams.get("page") ?? undefined,
        limit: searchParams.get("limit") ?? undefined,
        search: searchParams.get("search") ?? undefined,
        status: searchParams.get("status") ?? undefined,
        categoryId: searchParams.get("categoryId") ?? undefined,
        tagId: searchParams.get("tagId") ?? undefined,
      });

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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message) },
        { status: 400 }
      );
    }

    console.error("[admin/blogs] failed:", error);
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

    const json = await req.json();

    const body = postCreateSchema.parse(json);

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

    console.log(
      `[admin/blogs] created id=${data.id} slug=${data.slug} by=${session.user.id}`
    );

    revalidatePath('/');
    revalidatePath('/blogs');

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

    const mapped = mapPrismaError(error);
    if (mapped) return errors.mapped(mapped);

    console.error("[admin/blogs] failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
