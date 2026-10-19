import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { withRouteHandler } from "@/lib/api-handler";
import { parseId } from "@/lib/validate";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ id: string }> };

export const DELETE = withRouteHandler<Context>(
  "admin/about/experiences/:id",
  async (_req, { params }) => {
    const { session, response } = await requireAdmin();
    if (response) return response;

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const idNumber = parseId(id);
    if (idNumber === null) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const data = await prisma.experience.delete({
      where: { id: idNumber },
      select: { id: true },
    });

    return NextResponse.json(
      { data, message: "Data deleted successfully" },
      { status: 200 }
    );
  }
);
