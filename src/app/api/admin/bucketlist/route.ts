import { withRouteHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { parseJsonBody } from "@/lib/validate";
import { bucketItemSchema } from "@/types/validation/bucketlist";
import { NextResponse } from "next/server";

export const GET = withRouteHandler("admin/bucketlist", async () => {
  const { response } = await requireAdmin();
  if (response) return response;

  const data = await prisma.bucketItem.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ success: true, data });
});

export const POST = withRouteHandler("admin/bucketlist", async (req) => {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = await parseJsonBody(req, bucketItemSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const last = await prisma.bucketItem.findFirst({
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const data = await prisma.bucketItem.create({
    data: {
      title: body.title,
      description: body.description ?? null,
      completed: body.completed,
      completedAt:
        body.completed && body.completedAt ? new Date(body.completedAt) : null,
      images: body.images,
      order: (last?.order ?? -1) + 1,
    },
  });

  return NextResponse.json(
    { success: true, data, message: "Impian berhasil ditambahkan" },
    { status: 201 }
  );
});
