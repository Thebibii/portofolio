import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const blogs = await prisma.post.findMany({
      take: 2,
      where: { type: "BLOG", featured: true },
      orderBy: { createdAt: "desc" },
      select: {
        title: true,
        excerpt: true,
        viewCount: true,
        readingTime: true,
        coverImage: true,
        slug: true,
        category: {
          select: { name: true, slug: true },
        },
        tags: {
          select: {
            tag: { select: { name: true, slug: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: blogs });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
