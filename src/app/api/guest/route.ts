import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      take: 2,
      orderBy: { createdAt: "desc" },
      select: {
        slug: true,
        title: true,
        description: true,
        technologies: true,
      },
    });
    const blogs = await prisma.post.findMany({
      take: 2,
      where: { type: "BLOG" },
      orderBy: { createdAt: "desc" },
      include: {
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
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
