import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { withRouteHandler } from "@/lib/api-handler";
import { NextResponse } from "next/server";

export const GET = withRouteHandler("admin", async () => {
  const { session, response } = await requireAdmin();
  if (response) return response;

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
});
