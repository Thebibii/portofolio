import { NextResponse } from "next/server";
import { withRouteHandler } from "@/lib/api-handler";
import type { PostTypeConfig } from "@/lib/post-type-config";
import prisma from "@/lib/prisma";
import { serializePost } from "@/lib/serialize";

type Context = { params: Promise<{ slug: string }> };

export function createGuestPostDetailHandler(config: PostTypeConfig) {
  return withRouteHandler<Context>(
    `guest/${config.logTag}/:slug`,
    async (_req, { params }) => {
      const { slug } = await params;

      const post = await prisma.post.findUnique({
        where: { slug, type: config.type, status: "PUBLISHED" },
        include: {
          tags: {
            select: { tag: { select: { name: true, slug: true } } },
          },
          _count: { select: { likes: true } },
        },
      });

      if (!post) {
        return NextResponse.json(
          { error: config.detailNotFoundMessage },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: serializePost({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage,
          viewCount: post.viewCount,
          readingTime: post.readingTime,
          tags: post.tags,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          _count: { likes: post._count.likes },
        }),
      });
    }
  );
}
