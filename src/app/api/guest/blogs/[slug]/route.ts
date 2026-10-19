import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withRouteHandler } from "@/lib/api-handler";

type Context = { params: Promise<{ slug: string }> };

export const GET = withRouteHandler<Context>(
  "guest/blogs/:slug",
  async (_req, { params }) => {
    const { slug } = await params;

    const post = await prisma.post.findUnique({
      where: { slug, type: "BLOG", status: "PUBLISHED" },
      include: {
        tags: {
          select: { tag: { select: { name: true, slug: true } } },
        },
        _count: { select: { likes: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage,
        viewCount: post.viewCount,
        readingTime: post.readingTime,
        tags: post.tags,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        _count: { likes: post._count.likes },
      },
    });
  }
);
