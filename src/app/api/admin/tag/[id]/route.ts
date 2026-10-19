import { generateSlug } from "@/lib/slug";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { withRouteHandler } from "@/lib/api-handler";
import { parseJsonBody } from "@/lib/validate";
import { NextResponse } from "next/server";
import z from "zod";

const tagSchema = z.object({
  name: z.string().min(1, "Title is required"),
  color: z.string().optional(),
});

type Context = { params: Promise<{ id: string }> };

export const PUT = withRouteHandler<Context>(
  "admin/tag/:id",
  async (req, { params }) => {
    const { response } = await requireAdmin();
    if (response) return response;

    const { id } = await params;

    const parsed = await parseJsonBody(req, tagSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    // Cek apakah tag ada
    const existingSlug = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingSlug) {
      return NextResponse.json(
        { error: `Slug tidak ditemukan` },
        { status: 404 }
      );
    }

    // Update tag
    const data = await prisma.tag.update({
      where: { id: id },
      data: {
        ...body,
        slug: generateSlug(body.name),
      },
    });

    return NextResponse.json(
      { data, success: true, message: "Slug berhasil diperbarui" },
      { status: 200 }
    );
  }
);

export const DELETE = withRouteHandler<Context>(
  "admin/tag/:id",
  async (_req, { params }) => {
    const { response } = await requireAdmin();
    if (response) return response;

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const data = await prisma.tag.delete({
      where: { id },
      select: { id: true, name: true },
    });

    return NextResponse.json(
      { data, message: "Data deleted successfully" },
      { status: 200 }
    );
  }
);
