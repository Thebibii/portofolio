import { withRouteHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { parseJsonBody } from "@/lib/validate";
import { bucketItemSchema } from "@/types/validation/bucketlist";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ id: string }> };

export const PUT = withRouteHandler<Context>(
  "admin/bucketlist/:id",
  async (req, { params }) => {
    const { response } = await requireAdmin();
    if (response) return response;

    const { id } = await params;

    const existing = await prisma.bucketItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Impian tidak ditemukan" },
        { status: 404 }
      );
    }

    const parsed = await parseJsonBody(req, bucketItemSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    const data = await prisma.bucketItem.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description ?? null,
        completed: body.completed,
        completedAt:
          body.completed && body.completedAt
            ? new Date(body.completedAt)
            : null,
        images: body.images,
      },
    });

    return NextResponse.json(
      { success: true, data, message: "Impian berhasil diperbarui" },
      { status: 200 }
    );
  }
);

export const DELETE = withRouteHandler<Context>(
  "admin/bucketlist/:id",
  async (_req, { params }) => {
    const { response } = await requireAdmin();
    if (response) return response;

    const { id } = await params;

    const data = await prisma.bucketItem.delete({
      where: { id },
      select: { id: true, title: true },
    });

    return NextResponse.json(
      { success: true, data, message: "Impian berhasil dihapus" },
      { status: 200 }
    );
  }
);
