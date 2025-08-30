import { omitId } from "@/lib/helper";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const resProjects = await prisma.project.findMany({
      take: 2,
      orderBy: { createdAt: "desc" },
    });
    const projects = omitId(resProjects);
    const blogs = await prisma.post.findMany({
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
  } catch (error) {
    console.error("Error detail:", error);

    const message =
      process.env.APP_ENV === "development"
        ? error instanceof Error
          ? error.message
          : String(error)
        : "Terjadi kesalahan, silakan coba lagi.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
