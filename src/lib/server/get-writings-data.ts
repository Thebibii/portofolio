import "server-only";
import prisma from "@/lib/prisma";
import { cache } from "react";

export const getWritingsData = cache(async () => {
  const limit = 5;
  const page = 1;
  const skip = 0;

  const [writings, totalCount, categories, tags] = await Promise.all([
    prisma.post.findMany({
      where: { type: "WRITING" },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        slug: true,
        excerpt: true,
        coverImage: true,
        updatedAt: true,
        title: true,
        viewCount: true,
        readingTime: true,
        createdAt: true,
        category: {
          select: { name: true, slug: true },
        },
        tags: {
          select: {
            tag: { select: { name: true, slug: true } },
          },
        },
      },
    }),
    prisma.post.count({ where: { type: "WRITING" } }),
    prisma.category.findMany({
      where: {
        posts: { some: { type: "WRITING" } },
      },
      select: { name: true, slug: true },
      orderBy: { posts: { _count: "desc" } },
      take: 8,
    }),
    prisma.tag.findMany({
      where: {
        posts: { some: { post: { type: "WRITING" } } },
      },
      select: { name: true, slug: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const serialized = writings.map(({ updatedAt, createdAt, ...rest }) => ({
    ...rest,
    updatedAt: updatedAt.toISOString(),
    createdAt: createdAt.toISOString(),
  }));

  return {
    writings: serialized,
    meta: {
      total: totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    categories,
    tags,
  };
});
