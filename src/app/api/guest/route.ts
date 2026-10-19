// TODO(cleanup): kandidat penghapusan — menunggu konfirmasi pemakaian eksternal (K-3)
import { withRouteHandler } from "@/lib/api-handler";
import { omitId } from "@/lib/helper";
import prisma from "@/lib/prisma";
import { postCardSelect } from "@/lib/prisma-selects";
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
    select: postCardSelect,
  });
  const data = { projects, blogs };
  return NextResponse.json({ data, message: "Data berhasil diambil" });
});
