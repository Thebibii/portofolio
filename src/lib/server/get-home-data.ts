import "server-only";
import prisma from "@/lib/prisma";
import { postCardSelect } from "@/lib/prisma-selects";
import { cache } from "react";

export const getHomeData = cache(async () => {
  const [projects, blogs] = await Promise.all([
    prisma.project.findMany({
      take: 2,
      where: { featured: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.findMany({
      take: 2,
      where: { type: "BLOG", status: "PUBLISHED", featured: true },
      orderBy: { createdAt: "desc" },
      select: postCardSelect,
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
