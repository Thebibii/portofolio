import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import z from "zod";

const featuredSchema = z.object({
  featured: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;

    const { slug } = await params;
    const json = await req.json();
    const body = featuredSchema.parse(json);

    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json(
        { error: "Post tidak ditemukan" },
        { status: 404 }
      );
    }

    const data = await prisma.post.update({
      where: { slug },
      data: { featured: body.featured },
    });

    revalidatePath('/');
    revalidatePath('/blogs');
    revalidatePath('/writings');

    return NextResponse.json(
      { data, success: true, message: "Featured status updated" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message) },
        { status: 400 }
      );
    }
    console.error("[admin/posts/:slug/featured] failed:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
