import { createFeaturedToggleHandler } from "@/lib/api/featured";
import prisma from "@/lib/prisma";

export const PATCH = createFeaturedToggleHandler({
  logTag: "admin/posts/:slug/featured",
  notFoundMessage: "Post tidak ditemukan",
  revalidatePaths: ["/", "/blogs", "/writings"],
  find: (slug) =>
    prisma.post.findUnique({ where: { slug }, select: { id: true } }),
  update: (slug, featured) =>
    prisma.post.update({ where: { slug }, data: { featured } }),
});
