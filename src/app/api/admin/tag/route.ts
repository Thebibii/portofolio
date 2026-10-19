import { generateSlug } from "@/lib/slug";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const tagSchema = z.object({
  name: z.string().min(1, "Title is required"),
  color: z.string().optional(),
});

export async function GET() {
  try {
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
  } catch (error) {
    console.error("[admin/tag] failed:", error);
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

    const json = await req.json();

    // Validasi body
    const body = tagSchema.parse(json);

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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message) },
        { status: 400 }
      );
    }

    console.error("[admin/tag] failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
