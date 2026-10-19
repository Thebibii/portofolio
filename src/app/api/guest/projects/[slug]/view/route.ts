import { withRouteHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ slug: string }> };

export const PATCH = withRouteHandler<Context>(
  "guest/projects/:slug/view",
  async (_req, { params }) => {
    const { slug } = await params;

    const project = await prisma.project.findFirst({
      where: { slug },
      select: { id: true, views: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project tidak ditemukan" },
        { status: 404 }
      );
    }

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: { views: { increment: 1 } },
      select: { views: true },
    });

    return NextResponse.json({ success: true, data: updated });
  }
);
