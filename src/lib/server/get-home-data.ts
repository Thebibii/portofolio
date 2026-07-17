import "server-only";
import prisma from "@/lib/prisma";
import { cache } from "react";

export const getHomeData = cache(async () => {
  const [projects, blogs] = await Promise.all([
    prisma.project.findMany({
      take: 2,
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.findMany({
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
    }),
  ]);

  const serializedProjects = projects.map(({ id, createdAt, ...rest }) => ({
    ...rest,
    createdAt: createdAt.toISOString(),
  }));

  const serializedBlogs = blogs.map((blog) => ({
    ...blog,
  }));

  return { projects: serializedProjects, blogs: serializedBlogs };
});
