import prisma from "@/lib/prisma";
import {
  getClientIp,
  resolveVisitor,
  setVisitorIdCookie,
} from "@/lib/visitor";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { visitorId, isNew } = resolveVisitor(request);

    const post = await prisma.post.findFirst({
      where: { slug, type: "WRITING", status: "PUBLISHED" },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Writing tidak ditemukan" },
        { status: 404 }
      );
    }

    const existing = await prisma.like.findUnique({
      where: { visitorId_postId: { visitorId, postId: post.id } },
    });

    const likeCount = await prisma.like.count({
      where: { postId: post.id },
    });

    const response = NextResponse.json({
      liked: !!existing,
      likeCount,
    });

    if (isNew) {
      setVisitorIdCookie(response, visitorId);
    }

    return response;
  } catch (error) {
    console.error("[guest/writings/:slug/like] failed:", error);
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

    const ip = getClientIp(request);
    const { visitorId, isNew } = resolveVisitor(request);

    const post = await prisma.post.findFirst({
      where: { slug, type: "WRITING", status: "PUBLISHED" },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Writing tidak ditemukan" },
        { status: 404 }
      );
    }

    const existing = await prisma.like.findUnique({
      where: { visitorId_postId: { visitorId, postId: post.id } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({
        data: { visitorId, ipAddress: ip, postId: post.id },
      });
    }

    const likeCount = await prisma.like.count({
      where: { postId: post.id },
    });

    const response = NextResponse.json({
      liked: !existing,
      likeCount,
    });

    if (isNew) {
      setVisitorIdCookie(response, visitorId);
    }

    return response;
  } catch (error) {
    console.error("[guest/writings/:slug/like] failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
