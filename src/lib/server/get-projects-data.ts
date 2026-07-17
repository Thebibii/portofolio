import "server-only";
import prisma from "@/lib/prisma";
import { cache } from "react";

export const getProjectsData = cache(async () => {
  const [featured, other] = await Promise.all([
    prisma.project.findMany({
      where: { featured: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      where: { featured: false },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const serialize = (items: typeof featured) =>
    items.map(({ id, createdAt, ...rest }) => ({
      ...rest,
      createdAt: createdAt.toISOString(),
    }));

  return {
    featured: serialize(featured),
    other: serialize(other),
  };
});
