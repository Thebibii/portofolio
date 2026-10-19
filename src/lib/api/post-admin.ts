import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withRouteHandler } from "@/lib/api-handler";
import type { PostTypeConfig } from "@/lib/post-type-config";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { consumeRateLimit } from "@/lib/login-throttle";
import { generateUniquePostSlug } from "@/lib/slug";
import { parseJsonBody, parseSearchParams } from "@/lib/validate";
import { deleteImage, extractPathFromUrl } from "@/lib/imageUpload";
import { deleteImagesFromContent } from "@/lib/extract-image-from-content";
import {
  adminPostListQuerySchema,
  postCreateSchema,
} from "@/types/validation/post";

const CREATE_MAX = 10;
const CREATE_WINDOW_MS = 60 * 1000;

type Context = { params: Promise<{ slug: string }> };

export function createAdminPostCollectionHandlers(config: PostTypeConfig) {
  const GET = withRouteHandler(`admin/${config.logTag}`, async (req) => {
    const { response } = await requireAdmin();
    if (response) return response;

    const parsed = parseSearchParams(
      new URL(req.url).searchParams,
      adminPostListQuerySchema
    );
    if (!parsed.ok) return parsed.response;
    const { page, limit, search, status, categoryId, tagId } = parsed.data;

    const where = {
      type: config.type,
      ...(search
        ? { title: { contains: search, mode: "insensitive" as const } }
        : {}),
      ...(status ? { status } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(tagId ? { tags: { some: { tagId } } } : {}),
    };

    const [total, data] = await prisma.$transaction([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
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

  const POST = withRouteHandler(`admin/${config.logTag}`, async (req) => {
    const { session, response } = await requireAdmin();
    if (response) return response;

    const rate = await consumeRateLimit(
      `${config.type.toLowerCase()}:create:${session.user.id}`,
      CREATE_MAX,
      CREATE_WINDOW_MS
    );
    if (rate.limited) {
      console.warn(
        `[admin/${config.logTag}] rate limit create user=${session.user.id} retryAfter=${rate.retryAfterSeconds}s`
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
    const slug = await generateUniquePostSlug(body.title);

    const data = await prisma.post.create({
      data: {
        ...postData,
        slug,
        type: config.type,
        authorId: session.user.id,
        ...(tagIds &&
          tagIds.length > 0 && {
            tags: {
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            },
          }),
      },
      include: {
        category: true,
        tags: {
          include: { tag: true },
        },
      },
    });

    config.revalidatePaths.forEach((path) => revalidatePath(path));

    return NextResponse.json(
      { data, success: true, message: "Post berhasil ditambahkan" },
      { status: 201 }
    );
  });

  return { GET, POST };
}

export function createAdminPostItemHandlers(config: PostTypeConfig) {
  const GET = withRouteHandler<Context>(
    `admin/${config.logTag}/:slug`,
    async (_req, { params }) => {
      const { response } = await requireAdmin();
      if (response) return response;

      const { slug } = await params;

      const data = await prisma.post.findUnique({
        where: { slug, type: config.type },
        include: {
          tags: {
            select: { tag: true },
          },
        },
      });

      if (!data) {
        return NextResponse.json(
          { error: config.adminNotFoundMessage },
          { status: 404 }
        );
      }

      return NextResponse.json({ data });
    }
  );

  const PUT = withRouteHandler<Context>(
    `admin/${config.logTag}/:slug`,
    async (req, { params }) => {
      const { response } = await requireAdmin();
      if (response) return response;

      const { slug } = await params;

      const parsed = await parseJsonBody(req, postCreateSchema);
      if (!parsed.ok) return parsed.response;
      const body = parsed.data;

      const { tagIds, ...postData } = body;
      const existing = await prisma.post.findUnique({
        where: { slug, type: config.type },
      });

      if (!existing) {
        return NextResponse.json(
          { error: config.adminNotFoundMessage },
          { status: 404 }
        );
      }

      let finalSlug = slug;
      if (body.slug && body.slug.trim()) {
        finalSlug = await generateUniquePostSlug(body.slug, slug);
      }

      const data = await prisma.post.update({
        where: { slug },
        data: {
          ...postData,
          slug: finalSlug,
          ...(tagIds &&
            tagIds.length > 0 && {
              tags: {
                deleteMany: {},
                create: tagIds.map((tagId) => ({
                  tag: { connect: { id: tagId } },
                })),
              },
            }),
        },
        include: {
          category: true,
          tags: {
            include: { tag: true },
          },
        },
      });

      config.revalidatePaths.forEach((path) => revalidatePath(path));
      revalidatePath(`/${config.slug}/${slug}`);

      if (finalSlug !== slug) {
        revalidatePath(`/${config.slug}/${finalSlug}`);
      }

      return NextResponse.json(
        { data, success: true, message: config.adminUpdateMessage },
        { status: 200 }
      );
    }
  );

  const DELETE = withRouteHandler<Context>(
    `admin/${config.logTag}/:slug`,
    async (_req, { params }) => {
      const { response } = await requireAdmin();
      if (response) return response;

      const { slug } = await params;

      const existing = await prisma.post.findUnique({
        where: { slug, type: config.type },
        select: { content: true, coverImage: true },
      });

      if (!existing) {
        return NextResponse.json(
          { error: config.notFoundMessage },
          { status: 404 }
        );
      }

      if (existing.content) {
        await deleteImagesFromContent(existing.content);
      }

      if (existing.coverImage) {
        const coverPath = extractPathFromUrl(existing.coverImage);
        if (coverPath) {
          await deleteImage(coverPath);
        }
      }

      const data = await prisma.post.delete({
        where: { slug },
        select: { id: true },
      });

      config.revalidatePaths.forEach((path) => revalidatePath(path));
      revalidatePath(`/${config.slug}/${slug}`);

      return NextResponse.json(
        { data, message: "Data deleted successfully" },
        { status: 200 }
      );
    }
  );

  return { GET, PUT, DELETE };
}
