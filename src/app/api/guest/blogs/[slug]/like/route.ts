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

    const post = await prisma.post.findFirst({
      where: { slug, type: "BLOG" },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Blog tidak ditemukan" },
        { status: 404 }
      );
    }

    const existing = await prisma.like.findUnique({
      where: { ipAddress_postId: { ipAddress: ip, postId: post.id } },
    });

    const likeCount = await prisma.like.count({
      where: { postId: post.id },
    });

    return NextResponse.json({
      liked: !!existing,
      likeCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "127.0.0.1";

    const post = await prisma.post.findFirst({
      where: { slug, type: "BLOG" },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Blog tidak ditemukan" },
        { status: 404 }
      );
    }

    const existing = await prisma.like.findUnique({
      where: { ipAddress_postId: { ipAddress: ip, postId: post.id } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({
        data: { ipAddress: ip, postId: post.id },
      });
    }

    const likeCount = await prisma.like.count({
      where: { postId: post.id },
    });

    return NextResponse.json({
      liked: !existing,
      likeCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
