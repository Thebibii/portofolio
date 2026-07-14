import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await prisma.post.findFirst({
      where: { slug, type: "BLOG" },
      select: { id: true, viewCount: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Blog tidak ditemukan" },
        { status: 404 }
      );
    }

    const updated = await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
