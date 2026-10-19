import { withRouteHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { postCardSelect } from "@/lib/prisma-selects";
import { NextResponse } from "next/server";

export const GET = withRouteHandler("guest/featured/blogs", async () => {
  const blogs = await prisma.post.findMany({
    take: 2,
    where: { type: "BLOG", status: "PUBLISHED", featured: true },
    orderBy: { createdAt: "desc" },
    select: postCardSelect,
  });

  return NextResponse.json({ success: true, data: blogs });
});
