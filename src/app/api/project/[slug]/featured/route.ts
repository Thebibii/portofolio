import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const featuredSchema = z.object({
  featured: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const json = await req.json();
    const body = featuredSchema.parse(json);

    const existing = await prisma.project.findUnique({ where: { id: slug } });
    if (!existing) {
      return NextResponse.json(
        { message: "Project tidak ditemukan" },
        { status: 404 }
      );
    }

    const data = await prisma.project.update({
      where: { id: slug },
      data: { featured: body.featured },
    });

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
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
