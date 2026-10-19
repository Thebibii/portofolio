import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { withRouteHandler } from "@/lib/api-handler";
import { parseJsonBody } from "@/lib/validate";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import z from "zod";

const featuredSchema = z.object({
  featured: z.boolean(),
});

type Context = { params: Promise<{ slug: string }> };

export const PATCH = withRouteHandler<Context>(
  "admin/posts/:slug/featured",
  async (req: NextRequest, { params }) => {
    const { session, response } = await requireAdmin();
    if (response) return response;

    const { slug } = await params;
    const parsed = await parseJsonBody(req, featuredSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

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
  }
);
