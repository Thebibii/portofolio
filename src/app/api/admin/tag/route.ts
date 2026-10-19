import { withRouteHandler } from "@/lib/api-handler";
import { parseJsonBody } from "@/lib/validate";
import { generateSlug } from "@/lib/slug";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";
import z from "zod";

const tagSchema = z.object({
  name: z.string().min(1, "Title is required"),
  color: z.string().optional(),
});

export const GET = withRouteHandler("admin/tag", async () => {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const data = await prisma.tag.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  return NextResponse.json({ success: true, data });
});

export const POST = withRouteHandler("admin/tag", async (req) => {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const parsed = await parseJsonBody(req, tagSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const data = await prisma.tag.create({
    data: {
      ...body,
      slug: generateSlug(body.name),
    },
  });

  return NextResponse.json(
    { data, success: true, message: "Tag berhasil ditambahkan" },
    { status: 201 }
  );
});
