import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function getVisitorId(request: NextRequest): string | null {
  return request.cookies.get("visitor_id")?.value ?? null;
}

function setVisitorIdCookie(response: NextResponse, id: string) {
  response.cookies.set("visitor_id", id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    sameSite: "lax",
  });
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const ip = getClientIp(request);
    const visitorId = getVisitorId(request);
    const newVisitorId = visitorId || crypto.randomUUID();

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
      where: { visitorId_postId: { visitorId: newVisitorId, postId: post.id } },
    });

    const likeCount = await prisma.like.count({
      where: { postId: post.id },
    });

    const response = NextResponse.json({
      liked: !!existing,
      likeCount,
    });

    if (!visitorId) {
      setVisitorIdCookie(response, newVisitorId);
    }

    return response;
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

    const ip = getClientIp(request);
    const visitorId = getVisitorId(request);
    const newVisitorId = visitorId || crypto.randomUUID();

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
      where: { visitorId_postId: { visitorId: newVisitorId, postId: post.id } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({
        data: { visitorId: newVisitorId, ipAddress: ip, postId: post.id },
      });
    }

    const likeCount = await prisma.like.count({
      where: { postId: post.id },
    });

    const response = NextResponse.json({
      liked: !existing,
      likeCount,
    });

    if (!visitorId) {
      setVisitorIdCookie(response, newVisitorId);
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
