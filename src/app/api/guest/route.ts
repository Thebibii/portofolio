import { withRouteHandler } from "@/lib/api-handler";
import { omitId } from "@/lib/helper";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = withRouteHandler("guest", async () => {
  const resProjects = await prisma.project.findMany({
    take: 2,
    orderBy: { createdAt: "desc" },
  });
  const projects = omitId(resProjects);
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
        select: {
          name: true,
          slug: true,
        },
      },
      tags: {
        select: {
          tag: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });
  const data = { projects, blogs };
  return NextResponse.json({ data, message: "Data berhasil diambil" });
});
