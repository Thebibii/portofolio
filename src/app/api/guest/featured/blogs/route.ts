import { withRouteHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = withRouteHandler("guest/featured/blogs", async () => {
  const blogs = await prisma.post.findMany({
    take: 2,
    where: { type: "BLOG", status: "PUBLISHED", featured: true },
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
});
