import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const postWhere = (type: "BLOG" | "WRITING") =>
      ({ type, status: "PUBLISHED" as const });

    const [
      blogsTotals,
      blogsLikes,
      blogsTop,
      writingsTotals,
      writingsLikes,
      writingsTop,
      projectsTotals,
      projectsTop,
    ] = await Promise.all([
      prisma.post.aggregate({
        where: postWhere("BLOG"),
        _count: { _all: true },
        _sum: { viewCount: true },
      }),
      prisma.like.count({ where: { post: postWhere("BLOG") } }),
      prisma.post.findMany({
        where: postWhere("BLOG"),
        orderBy: { viewCount: "desc" },
        take: 10,
        select: {
          slug: true,
          viewCount: true,
          _count: { select: { likes: true } },
        },
      }),
      prisma.post.aggregate({
        where: postWhere("WRITING"),
        _count: { _all: true },
        _sum: { viewCount: true },
      }),
      prisma.like.count({ where: { post: postWhere("WRITING") } }),
      prisma.post.findMany({
        where: postWhere("WRITING"),
        orderBy: { viewCount: "desc" },
        take: 10,
        select: {
          slug: true,
          viewCount: true,
          _count: { select: { likes: true } },
        },
      }),
      prisma.project.aggregate({
        _count: { _all: true },
        _sum: { views: true },
      }),
      prisma.project.findMany({
        orderBy: { views: "desc" },
        take: 10,
        select: { slug: true, views: true },
      }),
    ]);

    const data = {
      blogs: {
        total: blogsTotals._count._all,
        totalViews: blogsTotals._sum.viewCount ?? 0,
        totalLikes: blogsLikes,
        top10: blogsTop.map(({ _count, viewCount, slug }) => ({
          slug,
          views: viewCount,
          likes: _count.likes,
        })),
      },
      writings: {
        total: writingsTotals._count._all,
        totalViews: writingsTotals._sum.viewCount ?? 0,
        totalLikes: writingsLikes,
        top10: writingsTop.map(({ _count, viewCount, slug }) => ({
          slug,
          views: viewCount,
          likes: _count.likes,
        })),
      },
      projects: {
        total: projectsTotals._count._all,
        totalViews: projectsTotals._sum.views ?? 0,
        top10: projectsTop,
      },
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[guest/statistics] failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
