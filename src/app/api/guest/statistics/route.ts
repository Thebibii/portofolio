import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [blogs, writings, projects] = await Promise.all([
      prisma.post.findMany({
        where: { type: "BLOG", status: "PUBLISHED" },
        select: {
          slug: true,
          viewCount: true,
          _count: { select: { likes: true } },
        },
        orderBy: { viewCount: "desc" },
      }),
      prisma.post.findMany({
        where: { type: "WRITING", status: "PUBLISHED" },
        select: {
          slug: true,
          viewCount: true,
          _count: { select: { likes: true } },
        },
        orderBy: { viewCount: "desc" },
      }),
      prisma.project.findMany({
        select: { slug: true, views: true },
        orderBy: { views: "desc" },
      }),
    ]);

    const mapPost = (items: typeof blogs) => ({
      total: items.length,
      totalViews: items.reduce((sum, item) => sum + item.viewCount, 0),
      totalLikes: items.reduce((sum, item) => sum + item._count.likes, 0),
      top10: items.slice(0, 10).map(({ _count, viewCount, slug }) => ({
        slug,
        views: viewCount,
        likes: _count.likes,
      })),
    });

    const mapProject = (items: typeof projects) => ({
      total: items.length,
      totalViews: items.reduce((sum, item) => sum + item.views, 0),
      top10: items.slice(0, 10),
    });

    const data = {
      blogs: mapPost(blogs),
      writings: mapPost(writings),
      projects: mapProject(projects),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
