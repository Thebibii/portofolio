import { withRouteHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { PostType } from "@/types/blogs";
import { NextRequest, NextResponse } from "next/server";

export const GET = withRouteHandler("guest/tags", async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get("type") as PostType | null;

  // Default ke BLOG jika parameter tidak ada atau tidak valid
  // Normalisasi ke uppercase untuk pencocokan dengan enum
  const normalizedType = typeParam?.toUpperCase();
  const type: PostType =
    normalizedType &&
    Object.values(PostType).includes(normalizedType as PostType)
      ? (normalizedType as PostType)
      : PostType.BLOG;

  const tags = await prisma.tag.findMany({
    where: {
      posts: {
        some: {
          post: {
            type, // Filter berdasarkan post type
            status: "PUBLISHED",
          },
        },
      },
    },
    select: {
      name: true,
      slug: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20, // Limit untuk performa
  });

  return NextResponse.json({
    success: true,
    data: tags,
    message: "Tags retrieved successfully",
    total: tags.length,
  });
});
