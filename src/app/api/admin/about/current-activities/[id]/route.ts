import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { errors } from "@/lib/api-error";
import { mapPrismaError } from "@/lib/prisma-error";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await requireAdmin();
    if (response) return response;

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const data = await prisma.currentActivity.delete({
      where: { id: Number(id) },
      select: { id: true },
    });

    return NextResponse.json(
      { data, message: "Data deleted successfully", success: true },
      { status: 200 }
    );
  } catch (error: any) {
    const mapped = mapPrismaError(error);
    if (mapped) return errors.mapped(mapped);
    console.error(error); // untuk log internal
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
