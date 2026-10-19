import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withRouteHandler } from "@/lib/api-handler";

type Context = { params: Promise<{ slug: string }> };

export const PATCH = withRouteHandler<Context>(
  "guest/blogs/:slug/view",
  async (_req, { params }) => {
    const { slug } = await params;

    const post = await prisma.post.findFirst({
      where: { slug, type: "BLOG", status: "PUBLISHED" },
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

    revalidatePath("/");

    return NextResponse.json({ success: true, data: updated });
  }
);
