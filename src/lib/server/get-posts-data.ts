import "server-only";
import prisma from "@/lib/prisma";
import type { PostTypeConfig } from "@/lib/post-type-config";
import { postListSelect } from "@/lib/prisma-selects";
import { serializePost } from "@/lib/serialize";
import { cache } from "react";

export const getPostsData = cache(async (config: PostTypeConfig) => {
  const limit = 5;
  const page = 1;
  const skip = 0;

  const [posts, totalCount, categories, tags] = await Promise.all([
    prisma.post.findMany({
      where: { type: config.type, status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: postListSelect,
    }),
    prisma.post.count({
      where: { type: config.type, status: "PUBLISHED" },
    }),
    prisma.category.findMany({
      where: {
        posts: { some: { type: config.type, status: "PUBLISHED" } },
      },
      select: { name: true, slug: true },
      orderBy: { posts: { _count: "desc" } },
      take: 8,
    }),
    prisma.tag.findMany({
      where: {
        posts: { some: { post: { type: config.type, status: "PUBLISHED" } } },
      },
      select: { name: true, slug: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const serialized = posts.map(({ updatedAt, createdAt, ...rest }) =>
    serializePost({ ...rest, updatedAt, createdAt })
  );

  return {
    posts: serialized,
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
