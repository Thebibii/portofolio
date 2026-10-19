import { generateSlug } from "@/lib/slug";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { withRouteHandler } from "@/lib/api-handler";
import { parseJsonBody } from "@/lib/validate";
import { projectServerSchema } from "@/types/validation/project";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const GET = withRouteHandler("project", async () => {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const data = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data });
});

export const POST = withRouteHandler(
  "project",
  async (req: NextRequest) => {
    const { session, response } = await requireAdmin();
    if (response) return response;

    const parsed = await parseJsonBody(req, projectServerSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    const data = await prisma.project.create({
      data: {
        ...body,
        startDate: body.startDate,
        endDate: body.endDate,
        slug: generateSlug(body.title),
      },
    });

    revalidatePath('/');
    revalidatePath('/projects');

    return NextResponse.json(
      { data, success: true, message: "Project berhasil ditambahkan" },
      { status: 201 }
    );
  }
);
