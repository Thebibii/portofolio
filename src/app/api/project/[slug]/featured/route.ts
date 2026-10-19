import { createFeaturedToggleHandler } from "@/lib/api/featured";
import prisma from "@/lib/prisma";

export const PATCH = createFeaturedToggleHandler({
  logTag: "project/:slug/featured",
  notFoundMessage: "Project tidak ditemukan",
  revalidatePaths: ["/", "/projects"],
  find: (slug) =>
    prisma.project.findUnique({ where: { id: slug }, select: { id: true } }),
  update: (slug, featured) =>
    prisma.project.update({ where: { id: slug }, data: { featured } }),
});
