import { generateSlug } from "@/lib/slug";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { errors } from "@/lib/api-error";
import { mapPrismaError } from "@/lib/prisma-error";
import { parseJsonBody } from "@/lib/validate";
import { projectServerSchema } from "@/types/validation/project";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import z from "zod";

export async function GET() {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;

    const data = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[project] failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message) },
        { status: 400 }
      );
    }

    const mapped = mapPrismaError(error);
    if (mapped) return errors.mapped(mapped);

    console.error("[project] failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
