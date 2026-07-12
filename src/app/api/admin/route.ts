import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [projectCount, writingCount, blogCount, totalViews, categoryCount, tagCount, recentProjects, recentPosts] =
      await Promise.all([
        prisma.project.count(),
        prisma.post.count({ where: { type: "WRITING" } }),
        prisma.post.count({ where: { type: "BLOG" } }),
        prisma.post.aggregate({ _sum: { viewCount: true } }),
        prisma.category.count(),
        prisma.tag.count(),
        prisma.project.findMany({
          take: 3,
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, slug: true, createdAt: true, status: true },
        }),
        prisma.post.findMany({
          take: 3,
          orderBy: { createdAt: "desc" },
          where: { type: "BLOG" },
          select: { id: true, title: true, slug: true, createdAt: true, status: true },
        }),
      ]);

    return NextResponse.json({
      count: {
        project: projectCount,
        writing: writingCount,
        blog: blogCount,
        category: categoryCount,
        tag: tagCount,
      },
      totalViews: totalViews._sum.viewCount || 0,
      recentProjects,
      recentPosts,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
