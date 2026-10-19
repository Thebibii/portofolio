import { withRouteHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ slug: string }> };

export const GET = withRouteHandler<Context>(
  "guest/projects/:slug",
  async (_req, { params }) => {
    const { slug } = await params;

    const project = await prisma.project.findFirst({
      where: { slug },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        startDate: project.startDate?.toISOString() ?? null,
        endDate: project.endDate?.toISOString() ?? null,
        updatedAt: project.updatedAt.toISOString(),
      },
    });
  }
);
