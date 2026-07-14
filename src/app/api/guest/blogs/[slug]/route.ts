import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "127.0.0.1";

    const data = await prisma.post.findUnique({
      where: { slug, type: "BLOG" },
      select: {
        id: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        updatedAt: true,
        title: true,
        viewCount: true,
        readingTime: true,
        content: true,
        createdAt: true,
        _count: { select: { likes: true } },
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

    if (!data) {
      return NextResponse.json(
        { message: "Blog tidak ditemukan" },
        { status: 404 }
      );
    }

    const likedByMe = !!(await prisma.like.findUnique({
      where: { ipAddress_postId: { ipAddress: ip, postId: data.id } },
      select: { id: true },
    }));

    const { id, ...rest } = data;
    return NextResponse.json({ data: { ...rest, likedByMe } });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
