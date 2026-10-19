import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withRouteHandler } from "@/lib/api-handler";
import type { PostTypeConfig } from "@/lib/post-type-config";
import prisma from "@/lib/prisma";
import {
  getClientIp,
  resolveVisitor,
  setVisitorIdCookie,
} from "@/lib/visitor";

type Context = { params: Promise<{ slug: string }> };

const methodNotAllowed = () =>
  NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });

export function createGuestPostReactionHandlers(config: PostTypeConfig) {
  const GET = withRouteHandler<Context>(
    `guest/${config.logTag}/:slug/like`,
    async (request, { params }) => {
      if (!config.features.like) return methodNotAllowed();

      const { slug } = await params;
      const { visitorId, isNew } = resolveVisitor(request);

      const post = await prisma.post.findFirst({
        where: { slug, type: config.type, status: "PUBLISHED" },
        select: { id: true },
      });

      if (!post) {
        return NextResponse.json(
          { error: config.notFoundMessage },
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
    }
  );

  const PATCH = withRouteHandler<Context>(
    `guest/${config.logTag}/:slug/like`,
    async (request, { params }) => {
      if (!config.features.like) return methodNotAllowed();

      const { slug } = await params;
      const ip = getClientIp(request);
      const { visitorId, isNew } = resolveVisitor(request);

      const post = await prisma.post.findFirst({
        where: { slug, type: config.type, status: "PUBLISHED" },
        select: { id: true },
      });

      if (!post) {
        return NextResponse.json(
          { error: config.notFoundMessage },
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
    }
  );

  return { GET, PATCH };
}

export function createGuestPostViewHandler(config: PostTypeConfig) {
  return withRouteHandler<Context>(
    `guest/${config.logTag}/:slug/view`,
    async (_req, { params }) => {
      if (!config.features.view) return methodNotAllowed();

      const { slug } = await params;

      const post = await prisma.post.findFirst({
        where: { slug, type: config.type, status: "PUBLISHED" },
        select: { id: true, viewCount: true },
      });

      if (!post) {
        return NextResponse.json(
          { error: config.notFoundMessage },
          { status: 404 }
        );
      }

      const updated = await prisma.post.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
        select: { viewCount: true },
      });

      revalidatePath("/");

      return NextResponse.json({ success: true, data: updated });
    }
  );
}
